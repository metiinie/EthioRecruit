import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVacancyDto, UpdateVacancyDto, VacancyFiltersDto } from './dto/vacancy.dto';
import { VacancyStatus, ApplicationStatus } from '@prisma/client';

@Injectable()
export class VacanciesService {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    ) { }

    private async evictVacancyCache() {
        try {
            const mgr = this.cacheManager as any;
            if (typeof mgr.reset === 'function') {
                await mgr.reset();
            } else if (mgr.store && typeof mgr.store.reset === 'function') {
                await mgr.store.reset();
            }
        } catch (err: any) {
            // Ignore cache eviction error
        }
    }

    // ── Public Endpoints ─────────────────────────

    async findAllPublic(filters: VacancyFiltersDto) {
        const cacheKey = `vacancies:public:${JSON.stringify(filters)}`;
        try {
            const cached = await this.cacheManager.get(cacheKey);
            if (cached) return cached;
        } catch (e) {
            // Fallback to DB query
        }

        const { categoryId, country, search, page = 1, perPage, limit } = filters as any;
        const effectivePerPage = perPage || limit || 10;
        const skip = (page - 1) * effectivePerPage;

        const where: any = {
            status: VacancyStatus.ACTIVE,
        };

        if (categoryId) {
            try {
                const resolvedId = await this.resolveCategoryId(categoryId);
                where.categoryId = resolvedId;
            } catch (e) {
                where.categoryId = categoryId;
            }
        }
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
                take: effectivePerPage,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.jobVacancy.count({ where }),
        ]);

        const totalPages = Math.ceil(total / effectivePerPage);

        const result = {
            data,
            meta: { page, perPage: effectivePerPage, total, totalPages },
        };

        try {
            await this.cacheManager.set(cacheKey, result, 120000);
        } catch (e) {
            // Ignore cache set error
        }

        return result;
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
            where: { vacancyId_userId: { vacancyId, userId } },
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
        if (categoryId) {
            try {
                const resolvedId = await this.resolveCategoryId(categoryId);
                where.categoryId = resolvedId;
            } catch (e) {
                where.categoryId = categoryId;
            }
        }
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

    // Helper to safely resolve category ID from ID or name slug with explicit validation
    private async resolveCategoryId(categoryId?: string): Promise<string> {
        if (categoryId) {
            const normalized = categoryId.trim().toLowerCase();
            const searchTerm = normalized === 'cleaning' ? 'cleaner' : categoryId;
            const existingCategory = await this.prisma.category.findFirst({
                where: {
                    OR: [
                        { id: categoryId },
                        { name: { equals: searchTerm, mode: 'insensitive' } },
                        { name: { contains: searchTerm, mode: 'insensitive' } },
                    ],
                },
            });
            if (existingCategory) {
                return existingCategory.id;
            }
            throw new NotFoundException(`Category '${categoryId}' not found`);
        }

        const fallback = await this.prisma.category.findFirst();
        if (!fallback) {
            throw new NotFoundException('No default vacancy category available in database');
        }
        return fallback.id;
    }

    async createAdmin(agencyId: string, dto: CreateVacancyDto) {
        const categoryIdToUse = await this.resolveCategoryId(dto.categoryId);
        const vacancy = await this.prisma.jobVacancy.create({
            data: {
                agencyId,
                categoryId: categoryIdToUse,
                title: dto.title,
                jobCode: dto.jobCode,
                description: dto.description,
                requirements: dto.requirements || [],
                country: dto.country,
                city: dto.city,
                targetRegion: dto.targetRegion,
                employerType: dto.employerType || 'individual_family',
                employerName: dto.employerName,
                showEmployerName: dto.showEmployerName ?? false,
                foreignAgencyPartner: dto.foreignAgencyPartner,
                salaryMin: dto.salaryMin ? Math.round(dto.salaryMin) : 0,
                salaryMax: dto.salaryMax ? Math.round(dto.salaryMax) : 0,
                salaryCurrency: dto.salaryCurrency || 'SAR',
                overtimeTerms: dto.overtimeTerms,
                placementFeeTerms: dto.placementFeeTerms,
                contractPeriodYears: dto.contractPeriodYears || 2,
                probationPeriodMonths: dto.probationPeriodMonths || 3,
                workingHoursPerDay: dto.workingHoursPerDay || 8,
                workingDaysPerWeek: dto.workingDaysPerWeek || 6,
                offDaysPerMonth: dto.offDaysPerMonth || 4,
                visaSponsorship: dto.visaSponsorship ?? true,
                accommodationProvided: dto.accommodationProvided ?? true,
                mealsProvided: dto.mealsProvided ?? true,
                transportationProvided: dto.transportationProvided ?? true,
                healthInsurance: dto.healthInsurance ?? true,
                flightTicketProvided: dto.flightTicketProvided ?? true,
                annualLeaveDays: dto.annualLeaveDays || 30,
                genderPreference: dto.genderPreference || 'any',
                religionPreference: dto.religionPreference || 'any',
                ageMin: dto.ageMin,
                ageMax: dto.ageMax,
                experienceRequired: dto.experienceRequired || 0,
                overseasExpRequired: dto.overseasExpRequired ?? false,
                educationLevelRequired: dto.educationLevelRequired,
                requiredSkills: dto.requiredSkills || [],
                requiredLanguages: dto.requiredLanguages || [],
                requiredCertificates: dto.requiredCertificates || [],
                vacanciesCount: dto.vacanciesCount || 1,
                applicationDeadline: dto.applicationDeadline,
                status: dto.status || VacancyStatus.ACTIVE,
                publishedAt: (dto.status || VacancyStatus.ACTIVE) === VacancyStatus.ACTIVE ? new Date() : undefined,
            },
            include: { category: true },
        });
        await this.evictVacancyCache();
        return { data: vacancy };
    }

    async updateAdmin(id: string, agencyId: string, dto: UpdateVacancyDto) {
        await this.verifyAgencyOwnership(id, agencyId);

        // Resolve categoryId safely if provided; strip sensitive/protected fields from update payload
        const { categoryId: rawCategoryId, ...rest } = dto as any;
        const updateData: any = { ...rest };

        // Prevent caller from overwriting tenancy fields via the update body
        delete updateData.agencyId;
        delete updateData.id;

        if (rawCategoryId) {
            updateData.categoryId = await this.resolveCategoryId(rawCategoryId);
        }

        const vacancy = await this.prisma.jobVacancy.update({
            where: { id },
            data: updateData,
            include: { category: true },
        });
        await this.evictVacancyCache();
        return { data: vacancy };
    }

    async updateStatusAdmin(id: string, agencyId: string, status: VacancyStatus) {
        await this.verifyAgencyOwnership(id, agencyId);
        const publishedAt = status === VacancyStatus.ACTIVE ? new Date() : undefined;
        const vacancy = await this.prisma.jobVacancy.update({
            where: { id },
            data: { status, publishedAt },
        });
        await this.evictVacancyCache();
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
