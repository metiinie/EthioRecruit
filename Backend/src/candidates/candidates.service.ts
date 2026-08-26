import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCandidateDto, UpdateCandidateDto, CandidateFiltersDto } from './dto/candidate.dto';

@Injectable()
export class CandidatesService {
    constructor(private readonly prisma: PrismaService) { }

    // Helper to safely resolve category ID from ID or name slug
    private async resolveCategoryId(categoryId?: string): Promise<string> {
        if (categoryId) {
            const existingCategory = await this.prisma.category.findFirst({
                where: {
                    OR: [
                        { id: categoryId },
                        { name: { equals: categoryId, mode: 'insensitive' } },
                    ],
                },
            });
            if (existingCategory) {
                return existingCategory.id;
            }
        }

        // Fallback to first existing category or create a default "Housemaid" category
        let fallback = await this.prisma.category.findFirst();
        if (!fallback) {
            fallback = await this.prisma.category.create({
                data: {
                    name: 'Housemaid',
                    description: 'General household cleaning and maintenance',
                },
            });
        }
        return fallback.id;
    }

    // Helper to safely parse dates
    private safeDate(dateVal: any): Date | undefined {
        if (!dateVal) return undefined;
        const d = new Date(dateVal);
        return isNaN(d.getTime()) ? undefined : d;
    }

    // ── Public Endpoints (Employer & Jobseeker Search) ───

    async findAllPublic(filters: CandidateFiltersDto) {
        const { categoryId, gender, medicalStatus, country, search, page = 1, perPage = 10 } = filters;
        const skip = (page - 1) * perPage;

        const where: any = {
            isPublished: true,
            isAvailable: true,
        };

        if (categoryId) {
            const resolvedCatId = await this.resolveCategoryId(categoryId);
            where.categoryId = resolvedCatId;
        }

        if (gender) where.gender = { equals: gender, mode: 'insensitive' };
        if (medicalStatus) where.medicalStatus = { contains: medicalStatus, mode: 'insensitive' };
        if (country) where.currentCountry = { equals: country, mode: 'insensitive' };

        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { fullNameAmharic: { contains: search, mode: 'insensitive' } },
                { summary: { contains: search, mode: 'insensitive' } },
                { appliedPosition: { contains: search, mode: 'insensitive' } },
                { originRegion: { contains: search, mode: 'insensitive' } },
                { passportNumber: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [data, total] = await Promise.all([
            this.prisma.candidate.findMany({
                where,
                include: {
                    category: true,
                    agency: {
                        select: {
                            id: true,
                            name: true,
                            logoUrl: true,
                            isVerified: true,
                            phone: true,
                            email: true,
                        },
                    },
                },
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
                requiredStartDate: this.safeDate(data.requiredStartDate),
            },
        });

        return { data: inquiry };
    }

    // ── Admin Endpoints (Tenant-Isolated Agency) ──────────

    async findAllAdmin(agencyId: string, filters: CandidateFiltersDto) {
        const { categoryId, gender, medicalStatus, search, page = 1, perPage = 10 } = filters;
        const skip = (page - 1) * perPage;

        const where: any = { agencyId };
        if (categoryId) {
            const resolvedCatId = await this.resolveCategoryId(categoryId);
            where.categoryId = resolvedCatId;
        }
        if (gender) where.gender = gender;
        if (medicalStatus) where.medicalStatus = medicalStatus;
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { fullNameAmharic: { contains: search, mode: 'insensitive' } },
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
        const { currentCity, ...rest } = dto as any;
        const categoryIdToUse = await this.resolveCategoryId(dto.categoryId);

        const candidate = await this.prisma.candidate.create({
            data: {
                agencyId,
                categoryId: categoryIdToUse,
                firstName: dto.firstName,
                middleName: dto.middleName || undefined,
                lastName: dto.lastName,
                fullNameAmharic: dto.fullNameAmharic || undefined,
                dateOfBirth: this.safeDate(dto.dateOfBirth),
                gender: dto.gender || 'female',
                nationality: dto.nationality || 'Ethiopian',
                religion: dto.religion || undefined,
                maritalStatus: dto.maritalStatus || undefined,
                numberOfChildren: dto.numberOfChildren ? Number(dto.numberOfChildren) : 0,
                heightCm: dto.heightCm ? Number(dto.heightCm) : undefined,
                weightKg: dto.weightKg ? Number(dto.weightKg) : undefined,
                complexion: dto.complexion || undefined,
                phone: dto.phone || undefined,
                emergencyContactName: dto.emergencyContactName || undefined,
                emergencyContactPhone: dto.emergencyContactPhone || undefined,
                emergencyContactRelation: dto.emergencyContactRelation || undefined,
                summary: dto.summary || undefined,
                educationLevel: dto.educationLevel || undefined,
                yearsOfExperience: dto.yearsOfExperience ? Number(dto.yearsOfExperience) : 0,
                hasOverseasExperience: dto.hasOverseasExperience ?? false,
                overseasDetails: dto.overseasDetails || undefined,
                localExperienceDetails: dto.localExperienceDetails || undefined,
                appliedPosition: dto.appliedPosition || undefined,
                currentCountry: dto.currentCountry || 'Ethiopia',
                city: currentCity || dto.currentCity || undefined,
                originRegion: dto.originRegion || undefined,
                passportNumber: dto.passportNumber || undefined,
                passportIssueDate: this.safeDate(dto.passportIssueDate),
                passportExpiryDate: this.safeDate(dto.passportExpiryDate),
                passportPlaceOfIssue: dto.passportPlaceOfIssue || undefined,
                nationalIdNumber: dto.nationalIdNumber || undefined,
                cocStatus: dto.cocStatus || 'PENDING',
                cocIssueDate: this.safeDate(dto.cocIssueDate),
                medicalStatus: rest.medicalStatus || 'PENDING',
                policeClearanceStatus: dto.policeClearanceStatus || 'PENDING',
                visaStatus: rest.visaStatus || 'NO_VISA',
                expectedSalary: dto.expectedSalary ? Number(dto.expectedSalary) : undefined,
                expectedSalaryCurrency: dto.expectedSalaryCurrency || 'SAR',
                contractPeriodYears: dto.contractPeriodYears ? Number(dto.contractPeriodYears) : 2,
                photoUrl: dto.photoUrl || undefined,
                fullBodyPhotoUrl: dto.fullBodyPhotoUrl || undefined,
                videoUrl: dto.videoUrl || undefined,
                passportCopyUrl: dto.passportCopyUrl || undefined,
                medicalCertUrl: dto.medicalCertUrl || undefined,
                cocCertUrl: dto.cocCertUrl || undefined,
                skills: Array.isArray(dto.skills) ? dto.skills : [],
                languages: Array.isArray(dto.languages) ? dto.languages : [],
                isPublished: rest.isPublished ?? true,
                isAvailable: true,
            },
            include: { category: true },
        });
        return { data: candidate };
    }

    async updateAdmin(id: string, agencyId: string, dto: UpdateCandidateDto) {
        await this.verifyAgencyOwnership(id, agencyId);
        if (dto.categoryId) {
            dto.categoryId = await this.resolveCategoryId(dto.categoryId);
        }
        const candidate = await this.prisma.candidate.update({
            where: { id },
            data: dto as any,
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
                medicalClearanceDate: this.safeDate(medicalData.medicalClearanceDate),
                medicalExpiryDate: this.safeDate(medicalData.medicalExpiryDate),
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
