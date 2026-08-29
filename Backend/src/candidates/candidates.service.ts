import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCandidateDto, UpdateCandidateDto, CandidateFiltersDto } from './dto/candidate.dto';

@Injectable()
export class CandidatesService {
    constructor(private readonly prisma: PrismaService) { }

    // Helper to safely resolve category ID from ID or name slug with explicit validation
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
            throw new NotFoundException(`Category '${categoryId}' not found`);
        }

        // Fallback to existing default category or throw NotFoundException
        const fallback = await this.prisma.category.findFirst();
        if (!fallback) {
            throw new NotFoundException('No default recruitment category available in database');
        }
        return fallback.id;
    }

    // Helper to safely parse dates
    private safeDate(dateVal: any): Date | undefined {
        if (!dateVal) return undefined;
        const d = new Date(dateVal);
        return isNaN(d.getTime()) ? undefined : d;
    }

    private sanitizePublicCandidate(candidate: any) {
        if (!candidate) return candidate;
        const {
            passportNumber,
            passportIssueDate,
            passportExpiryDate,
            passportPlaceOfIssue,
            nationalIdNumber,
            emergencyContactPhone,
            emergencyContactName,
            emergencyContactRelation,
            passportCopyUrl,
            medicalCertUrl,
            cocCertUrl,
            phone,
            ...safeData
        } = candidate;
        return safeData;
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
            data: data.map((c) => this.sanitizePublicCandidate(c)),
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

        // Increment CandidateView counter asynchronously in background (non-blocking)
        this.prisma.candidateView
            .upsert({
                where: { candidateId: id },
                update: { viewCount: { increment: 1 } },
                create: { candidateId: id, viewCount: 1 },
            })
            .catch((err) => {
                // Log view counter failure silently without blocking or crashing response
                console.warn(`[CandidateView] Non-blocking view counter update failed for ${id}:`, err.message);
            });

        return { data: this.sanitizePublicCandidate(candidate) };
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

    async generateCvData(id: string, agencyId?: string) {
        const candidate = await this.prisma.candidate.findUnique({
            where: { id },
            include: {
                category: true,
                agency: {
                    select: {
                        name: true,
                        logoUrl: true,
                        phone: true,
                        email: true,
                        isVerified: true,
                    },
                },
            },
        });

        if (!candidate) throw new NotFoundException('Candidate profile not found');
        if (agencyId && candidate.agencyId !== agencyId) {
            throw new ForbiddenException('Access denied to candidate CV from another agency');
        }

        const age = candidate.dateOfBirth
            ? Math.floor((Date.now() - new Date(candidate.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
            : 'N/A';

        const fullName = `${candidate.firstName} ${candidate.middleName || ''} ${candidate.lastName}`.trim();
        const amharicName = candidate.fullNameAmharic || '';
        const agencyName = candidate.agency?.name || 'EthioRecruit Agency';

        const displayPassportNumber = agencyId
            ? (candidate.passportNumber || 'N/A')
            : (candidate.passportNumber ? `${candidate.passportNumber.slice(0, 3)}****${candidate.passportNumber.slice(-2)}` : 'Verifiable via Agency');

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Candidate Recruitment CV - ${fullName}</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; padding: 24px; background: #fff; }
        .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #10b981; padding-bottom: 16px; margin-bottom: 20px; }
        .agency-title { font-size: 20px; font-weight: 800; color: #0f172a; }
        .agency-sub { font-size: 12px; color: #64748B; font-weight: 600; margin-top: 2px; }
        .badge { background: #ecfdf5; color: #047857; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 12px; border: 1px solid #a7f3d0; display: inline-block; }
        
        .hero { display: flex; gap: 20px; margin-bottom: 20px; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; }
        .photo { width: 130px; height: 160px; object-fit: cover; border-radius: 8px; border: 2px solid #cbd5e1; }
        .hero-details { flex: 1; }
        .candidate-name { font-size: 22px; font-weight: 900; color: #0f172a; margin: 0; }
        .amharic-name { font-size: 16px; color: #2563eb; margin-top: 4px; font-weight: 700; }
        .applied-pos { font-size: 14px; font-weight: 800; color: #059669; margin-top: 6px; }

        .section-title { font-size: 14px; font-weight: 800; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 20px; margin-bottom: 12px; }
        
        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px 20px; font-size: 13px; }
        .grid-item { display: flex; justify-content: space-between; border-bottom: 1px dashed #f1f5f9; padding-bottom: 4px; }
        .label { color: #64748B; font-weight: 600; }
        .value { color: #0f172a; font-weight: 700; }

        .pills { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
        .pill { background: #eff6ff; color: #1e40af; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; border: 1px solid #bfdbfe; }

        .footer { margin-top: 30px; padding-top: 14px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <div class="agency-title">${agencyName}</div>
            <div class="agency-sub">Accredited Overseas Recruitment Platform • MoLS Certified</div>
        </div>
        <div class="badge">REF: ${candidate.id.slice(0, 8).toUpperCase()}</div>
    </div>

    <div class="hero">
        <img class="photo" src="${candidate.photoUrl || 'https://via.placeholder.com/130x160?text=Photo'}" alt="Candidate Photo" />
        <div class="hero-details">
            <h1 class="candidate-name">${fullName}</h1>
            ${amharicName ? `<div class="amharic-name">${amharicName}</div>` : ''}
            <div class="applied-pos">Applied Position: ${candidate.appliedPosition || candidate.category?.name || 'General Worker'}</div>
            
            <div style="margin-top: 14px; font-size: 13px;">
                <span class="label">Nationality:</span> <span class="value">${candidate.nationality}</span> &nbsp;|&nbsp;
                <span class="label">Age:</span> <span class="value">${age} yrs</span> &nbsp;|&nbsp;
                <span class="label">Gender:</span> <span class="value">${candidate.gender?.toUpperCase()}</span>
            </div>
        </div>
    </div>

    <div class="section-title">Personal Attributes</div>
    <div class="grid">
        <div class="grid-item"><span class="label">Religion</span><span class="value">${candidate.religion || 'N/A'}</span></div>
        <div class="grid-item"><span class="label">Marital Status</span><span class="value">${candidate.maritalStatus || 'N/A'}</span></div>
        <div class="grid-item"><span class="label">Number of Children</span><span class="value">${candidate.numberOfChildren || 0}</span></div>
        <div class="grid-item"><span class="label">Education Level</span><span class="value">${candidate.educationLevel || 'N/A'}</span></div>
        <div class="grid-item"><span class="label">Height / Weight</span><span class="value">${candidate.heightCm || '--'} cm / ${candidate.weightKg || '--'} kg</span></div>
        <div class="grid-item"><span class="label">Complexion</span><span class="value">${candidate.complexion || 'N/A'}</span></div>
    </div>

    <div class="section-title">Passport & Verification Status</div>
    <div class="grid">
        <div class="grid-item"><span class="label">Passport Number</span><span class="value">${displayPassportNumber}</span></div>
        <div class="grid-item"><span class="label">Place of Issue</span><span class="value">${candidate.passportPlaceOfIssue || 'Ethiopia'}</span></div>
        <div class="grid-item"><span class="label">COC Training Status</span><span class="value">${candidate.cocStatus}</span></div>
        <div class="grid-item"><span class="label">Medical Status</span><span class="value">${candidate.medicalStatus}</span></div>
    </div>

    <div class="section-title">Work Experience & Skills</div>
    <div class="grid">
        <div class="grid-item"><span class="label">Years of Experience</span><span class="value">${candidate.yearsOfExperience} years</span></div>
        <div class="grid-item"><span class="label">Overseas Experience</span><span class="value">${candidate.hasOverseasExperience ? 'YES (' + (candidate.overseasDetails || 'GCC') + ')' : 'NO (First Time)'}</span></div>
    </div>

    <div style="margin-top: 12px;">
        <span class="label">Special Skills:</span>
        <div class="pills">
            ${(candidate.skills && candidate.skills.length > 0) ? candidate.skills.map((s: string) => `<span class="pill">${s}</span>`).join('') : '<span class="pill">Cleaning</span><span class="pill">Cooking</span>'}
        </div>
    </div>

    <div style="margin-top: 12px;">
        <span class="label">Languages Spoken:</span>
        <div class="pills">
            ${(candidate.languages && candidate.languages.length > 0) ? candidate.languages.map((l: string) => `<span class="pill">${l}</span>`).join('') : '<span class="pill">Amharic</span><span class="pill">English (Basic)</span>'}
        </div>
    </div>

    <div class="footer">
        Generated by ${agencyName} via EthioRecruit SaaS Platform • Document ID: ${candidate.id}
    </div>
</body>
</html>
        `.trim();

        return {
            data: {
                candidate,
                html,
            },
        };
    }

    async bulkCreateAdmin(agencyId: string, candidatesList: CreateCandidateDto[]) {
        if (!Array.isArray(candidatesList) || candidatesList.length === 0) {
            throw new BadRequestException('Bulk candidate list must be a non-empty array');
        }

        // Execute bulk creation inside an atomic Prisma transaction
        return this.prisma.$transaction(async (tx) => {
            const createdCandidates = [];
            for (let i = 0; i < candidatesList.length; i++) {
                const dto = candidatesList[i];
                const categoryIdToUse = await this.resolveCategoryId(dto.categoryId);
                const candidate = await tx.candidate.create({
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
                        city: (dto as any).currentCity || (dto as any).city || undefined,
                        originRegion: dto.originRegion || undefined,
                        passportNumber: dto.passportNumber || undefined,
                        passportIssueDate: this.safeDate(dto.passportIssueDate),
                        passportExpiryDate: this.safeDate(dto.passportExpiryDate),
                        passportPlaceOfIssue: dto.passportPlaceOfIssue || undefined,
                        nationalIdNumber: dto.nationalIdNumber || undefined,
                        cocStatus: dto.cocStatus || 'PENDING',
                        cocIssueDate: this.safeDate(dto.cocIssueDate),
                        medicalStatus: (dto as any).medicalStatus || 'PENDING',
                        policeClearanceStatus: dto.policeClearanceStatus || 'PENDING',
                        visaStatus: (dto as any).visaStatus || 'NO_VISA',
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
                        isPublished: (dto as any).isPublished ?? true,
                        isAvailable: true,
                    },
                    include: { category: true },
                });
                createdCandidates.push(candidate);
            }

            return {
                data: {
                    totalProcessed: candidatesList.length,
                    successCount: createdCandidates.length,
                    failureCount: 0,
                    createdCandidates,
                    errors: [],
                },
            };
        });
    }

    private async verifyAgencyOwnership(id: string, agencyId: string) {
        const candidate = await this.prisma.candidate.findUnique({ where: { id } });
        if (!candidate) throw new NotFoundException('Candidate not found');
        if (candidate.agencyId !== agencyId) {
            throw new ForbiddenException('Access denied to candidate from another agency');
        }
    }
}
