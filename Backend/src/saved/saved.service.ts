import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SavedService {
    constructor(private readonly prisma: PrismaService) { }

    // --- Saved Candidates ---
    async saveCandidate(userId: string, candidateId: string) {
        const candidate = await this.prisma.candidate.findUnique({ where: { id: candidateId } });
        if (!candidate) throw new NotFoundException('Candidate not found');

        const existing = await this.prisma.savedCandidate.findUnique({
            where: { userId_candidateId: { userId, candidateId } },
        });
        if (existing) throw new ConflictException('Candidate already saved');

        const saved = await this.prisma.savedCandidate.create({
            data: { userId, candidateId },
            include: { candidate: true },
        });
        return { data: saved };
    }

    async unsaveCandidate(userId: string, candidateId: string) {
        const existing = await this.prisma.savedCandidate.findUnique({
            where: { userId_candidateId: { userId, candidateId } },
        });
        if (!existing) throw new NotFoundException('Saved candidate entry not found');

        await this.prisma.savedCandidate.delete({
            where: { userId_candidateId: { userId, candidateId } },
        });
        return { data: { message: 'Candidate removed from saved list' } };
    }

    async getSavedCandidates(userId: string) {
        const savedList = await this.prisma.savedCandidate.findMany({
            where: { userId },
            include: {
                candidate: {
                    include: { category: true, agency: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return { data: savedList };
    }

    // --- Saved Vacancies ---
    async saveVacancy(userId: string, vacancyId: string) {
        const vacancy = await this.prisma.jobVacancy.findUnique({ where: { id: vacancyId } });
        if (!vacancy) throw new NotFoundException('Vacancy not found');

        const existing = await this.prisma.savedVacancy.findUnique({
            where: { userId_vacancyId: { userId, vacancyId } },
        });
        if (existing) throw new ConflictException('Vacancy already saved');

        const saved = await this.prisma.savedVacancy.create({
            data: { userId, vacancyId },
            include: { vacancy: true },
        });
        return { data: saved };
    }

    async unsaveVacancy(userId: string, vacancyId: string) {
        const existing = await this.prisma.savedVacancy.findUnique({
            where: { userId_vacancyId: { userId, vacancyId } },
        });
        if (!existing) throw new NotFoundException('Saved vacancy entry not found');

        await this.prisma.savedVacancy.delete({
            where: { userId_vacancyId: { userId, vacancyId } },
        });
        return { data: { message: 'Vacancy removed from saved list' } };
    }

    async getSavedVacancies(userId: string) {
        const savedList = await this.prisma.savedVacancy.findMany({
            where: { userId },
            include: {
                vacancy: {
                    include: { category: true, agency: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return { data: savedList };
    }
}
