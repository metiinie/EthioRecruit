import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCandidateDto, UpdateCandidateDto, CandidateFiltersDto } from './dto/candidate.dto';

@Injectable()
export class CandidatesService {
    constructor(private readonly prisma: PrismaService) { }

    // ── Public Endpoints ─────────────────────────

    async findAllPublic(filters: CandidateFiltersDto) {
        const { categoryId, gender, medicalStatus, country, search, page = 1, perPage = 10 } = filters;
        const skip = (page - 1) * perPage;

        const where: any = {
            isPublished: true,
            isAvailable: true,
        };

        if (categoryId) where.categoryId = categoryId;
        if (gender) where.gender = gender;
        if (medicalStatus) where.medicalStatus = medicalStatus;
        if (country) where.currentCountry = country;
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { summary: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [data, total] = await Promise.all([
            this.prisma.candidate.findMany({
                where,
                include: { category: true, agency: { select: { id: true, name: true, logoUrl: true, isVerified: true } } },
                skip,
                take: perPage,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.candidate.count({ where }),
        ]);

        const totalPages = Math.ceil(total / perPage);

        return {
            data,
            meta: {
                page,
                perPage,
                total,
                totalPages,
                nextPage: page < totalPages ? page + 1 : null,
                prevPage: page > 1 ? page - 1 : null,
            },
        };
    }

    async findOnePublic(id: string) {
        const candidate = await this.prisma.candidate.findUnique({
            where: { id },
            include: {
                category: true,
                agency: {
                    select: {
                        id: true,
                        name: true,
                        logoUrl: true,
                        phone: true,
                        email: true,
                        isVerified: true,
                        contactChannels: true,
                    },
                },
                views: true,
            },
        });

        if (!candidate || !candidate.isPublished) {
            throw new NotFoundException('Candidate profile not found');
        }

        // Increment CandidateView counter asynchronously
        await this.prisma.candidateView.upsert({
            where: { candidateId: id },
            update: { viewCount: { increment: 1 } },
            create: { candidateId: id, viewCount: 1 },
        });

        return { data: candidate };
    }

    async createInquiry(candidateId: string, userId: string, data: any) {
        const candidate = await this.prisma.candidate.findUnique({ where: { id: candidateId } });
        if (!candidate) throw new NotFoundException('Candidate not found');

        const inquiry = await this.prisma.candidateInquiry.create({
            data: {
                candidateId,
                userId,
                message: data.message,
                preferredContactChannel: data.preferredContactChannel,
                purpose: data.purpose,
                requiredStartDate: data.requiredStartDate ? new Date(data.requiredStartDate) : undefined,
            },
        });

        return { data: inquiry };
    }

    // ── Admin Endpoints (Tenant-Isolated) ──────────

    async findAllAdmin(agencyId: string, filters: CandidateFiltersDto) {
        const { categoryId, gender, medicalStatus, search, page = 1, perPage = 10 } = filters;
        const skip = (page - 1) * perPage;

        const where: any = { agencyId };
        if (categoryId) where.categoryId = categoryId;
        if (gender) where.gender = gender;
        if (medicalStatus) where.medicalStatus = medicalStatus;
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [data, total] = await Promise.all([
            this.prisma.candidate.findMany({
                where,
                include: { category: true, documents: true, views: true },
                skip,
                take: perPage,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.candidate.count({ where }),
        ]);

        const totalPages = Math.ceil(total / perPage);

        return {
            data,
            meta: { page, perPage, total, totalPages },
        };
    }

    async createAdmin(agencyId: string, dto: CreateCandidateDto) {
        const candidate = await this.prisma.candidate.create({
            data: {
                agencyId,
                ...dto,
            },
            include: { category: true },
        });
        return { data: candidate };
    }

    async updateAdmin(id: string, agencyId: string, dto: UpdateCandidateDto) {
        await this.verifyAgencyOwnership(id, agencyId);
        const candidate = await this.prisma.candidate.update({
            where: { id },
            data: dto,
            include: { category: true },
        });
        return { data: candidate };
    }

    async softDeleteAdmin(id: string, agencyId: string) {
        await this.verifyAgencyOwnership(id, agencyId);
        await this.prisma.candidate.update({
            where: { id },
            data: { isAvailable: false, isPublished: false },
        });
        return { data: { message: 'Candidate soft deleted' } };
    }

    async updateMedicalAdmin(id: string, agencyId: string, medicalData: any) {
        await this.verifyAgencyOwnership(id, agencyId);
        const candidate = await this.prisma.candidate.update({
            where: { id },
            data: {
                medicalStatus: medicalData.medicalStatus,
                medicalClearanceDate: medicalData.medicalClearanceDate ? new Date(medicalData.medicalClearanceDate) : undefined,
                medicalExpiryDate: medicalData.medicalExpiryDate ? new Date(medicalData.medicalExpiryDate) : undefined,
            },
        });
        return { data: candidate };
    }

    private async verifyAgencyOwnership(id: string, agencyId: string) {
        const candidate = await this.prisma.candidate.findUnique({ where: { id } });
        if (!candidate) throw new NotFoundException('Candidate not found');
        if (candidate.agencyId !== agencyId) {
            throw new ForbiddenException('Access denied to candidate from another agency');
        }
    }
}
