import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PipelineStage } from '@prisma/client';

@Injectable()
export class PipelineService {
    constructor(private readonly prisma: PrismaService) { }

    // Get Kanban board items for an agency
    async getKanbanBoard(agencyId: string, vacancyId?: string) {
        const where: any = {
            vacancy: { agencyId },
        };
        if (vacancyId) where.vacancyId = vacancyId;

        const applications = await this.prisma.application.findMany({
            where,
            include: {
                user: {
                    select: { id: true, firstName: true, lastName: true, phone: true, profilePhoto: true },
                },
                vacancy: {
                    select: { id: true, title: true, country: true, salaryCurrency: true },
                },
                auditLogs: { orderBy: { createdAt: 'desc' }, take: 1 },
            },
            orderBy: { updatedAt: 'desc' },
        });

        // Group by stage
        const stages: Record<string, any[]> = {};
        Object.values(PipelineStage).forEach((stage) => {
            stages[stage] = [];
        });

        applications.forEach((app) => {
            const stageKey = app.status as string;
            if (stages[stageKey]) {
                stages[stageKey].push(app);
            } else {
                stages['APPLIED'].push(app);
            }
        });

        return { data: stages };
    }

    // Advance or move application stage
    async moveStage(
        applicationId: string,
        agencyId: string,
        adminId: string,
        newStage: PipelineStage,
        notes?: string,
    ) {
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
            include: { vacancy: true },
        });

        if (!application) throw new NotFoundException('Application not found');
        if (application.vacancy.agencyId !== agencyId) {
            throw new ForbiddenException('Access denied to application from another agency');
        }

        const previousStage = application.status;

        // Transaction to update application status + log audit trail
        const [updatedApp, auditLog] = await this.prisma.$transaction([
            this.prisma.application.update({
                where: { id: applicationId },
                data: {
                    status: newStage as any,
                    reviewerNotes: notes || application.reviewerNotes,
                },
            }),
            this.prisma.pipelineAudit.create({
                data: {
                    applicationId,
                    fromStage: previousStage as any,
                    toStage: newStage,
                    changedById: adminId,
                    notes: notes || `Stage updated from ${previousStage} to ${newStage}`,
                },
            }),
        ]);

        return { data: { application: updatedApp, auditLog } };
    }

    // Get full stage audit trail
    async getAuditTrail(applicationId: string, agencyId: string) {
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
            include: { vacancy: true },
        });

        if (!application) throw new NotFoundException('Application not found');
        if (application.vacancy.agencyId !== agencyId) {
            throw new ForbiddenException('Access denied');
        }

        const auditTrail = await this.prisma.pipelineAudit.findMany({
            where: { applicationId },
            include: { changedBy: { select: { id: true, firstName: true, lastName: true, email: true } } },
            orderBy: { createdAt: 'desc' },
        });

        return { data: auditTrail };
    }
}
