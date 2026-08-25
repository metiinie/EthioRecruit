import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVacancyDto, UpdateVacancyDto, VacancyFiltersDto } from './dto/vacancy.dto';
import { VacancyStatus, ApplicationStatus } from '@prisma/client';

@Injectable()
export class VacanciesService {
    constructor(private readonly prisma: PrismaService) { }

    // ── Public Endpoints ─────────────────────────

    async findAllPublic(filters: VacancyFiltersDto) {
        const { categoryId, country, search, page = 1, perPage = 10 } = filters;
        const skip = (page - 1) * perPage;

        const where: any = {
            status: VacancyStatus.ACTIVE,
        };

        if (categoryId) where.categoryId = categoryId;
        if (country) where.country = country;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { country: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [data, total] = await Promise.all([
            this.prisma.jobVacancy.findMany({
                where,
                include: {
                    category: true,
                    agency: { select: { id: true, name: true, logoUrl: true, isVerified: true } },
                },
                skip,
                take: perPage,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.jobVacancy.count({ where }),
        ]);

        const totalPages = Math.ceil(total / perPage);

        return {
            data,
            meta: { page, perPage, total, totalPages },
        };
    }

    async findOnePublic(id: string) {
        const vacancy = await this.prisma.jobVacancy.findUnique({
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
                        settings: true,
                    },
                },
            },
        });

        if (!vacancy || vacancy.status !== VacancyStatus.ACTIVE) {
            throw new NotFoundException('Job vacancy not found or inactive');
        }

        return { data: vacancy };
    }

    async applyToVacancy(vacancyId: string, userId: string, applyData: any) {
        const vacancy = await this.prisma.jobVacancy.findUnique({
            where: { id: vacancyId },
            include: { agency: { include: { settings: true } } },
        });

        if (!vacancy || vacancy.status !== VacancyStatus.ACTIVE) {
            throw new BadRequestException('Job vacancy is not accepting applications');
        }

        // Check agency settings — enforce allowInAppApplications
        if (vacancy.agency.settings && !vacancy.agency.settings.allowInAppApplications) {
            throw new BadRequestException('This agency does not accept in-app applications. Please contact them directly.');
        }

        // Check if user already applied
        const existing = await this.prisma.application.findUnique({
            key: { vacancyId_userId: { vacancyId, userId } } as any,
        }).catch(() => null);

        if (existing) {
            throw new BadRequestException('You have already applied to this job vacancy');
        }

        const application = await this.prisma.application.create({
            data: {
                vacancyId,
                userId,
                status: ApplicationStatus.APPLIED,
                coverLetter: applyData.coverLetter,
            },
            include: { vacancy: true },
        });

        return { data: application };
    }

    // ── Admin Endpoints (Tenant-Isolated) ──────────

    async findAllAdmin(agencyId: string, filters: VacancyFiltersDto) {
        const { categoryId, status, search, page = 1, perPage = 10 } = filters;
        const skip = (page - 1) * perPage;

        const where: any = { agencyId };
        if (categoryId) where.categoryId = categoryId;
        if (status) where.status = status;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { country: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [data, total] = await Promise.all([
            this.prisma.jobVacancy.findMany({
                where,
                include: { category: true, _count: { select: { applications: true } } },
                skip,
                take: perPage,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.jobVacancy.count({ where }),
        ]);

        const totalPages = Math.ceil(total / perPage);

        return {
            data,
            meta: { page, perPage, total, totalPages },
        };
    }

    async createAdmin(agencyId: string, dto: CreateVacancyDto) {
        const vacancy = await this.prisma.jobVacancy.create({
            data: {
                agencyId,
                ...dto,
                status: VacancyStatus.DRAFT,
            },
            include: { category: true },
        });
        return { data: vacancy };
    }

    async updateAdmin(id: string, agencyId: string, dto: UpdateVacancyDto) {
        await this.verifyAgencyOwnership(id, agencyId);
        const vacancy = await this.prisma.jobVacancy.update({
            where: { id },
            data: dto,
            include: { category: true },
        });
        return { data: vacancy };
    }

    async updateStatusAdmin(id: string, agencyId: string, status: VacancyStatus) {
        await this.verifyAgencyOwnership(id, agencyId);
        const publishedAt = status === VacancyStatus.ACTIVE ? new Date() : undefined;
        const vacancy = await this.prisma.jobVacancy.update({
            where: { id },
            data: { status, publishedAt },
        });
        return { data: vacancy };
    }

    private async verifyAgencyOwnership(id: string, agencyId: string) {
        const vacancy = await this.prisma.jobVacancy.findUnique({ where: { id } });
        if (!vacancy) throw new NotFoundException('Vacancy not found');
        if (vacancy.agencyId !== agencyId) {
            throw new ForbiddenException('Access denied to vacancy from another agency');
        }
    }
}
