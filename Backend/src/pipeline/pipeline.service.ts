import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PipelineStage } from '@prisma/client';

@Injectable()
export class PipelineService {
    constructor(private readonly prisma: PrismaService) { }

    // Get Kanban board items for an agency
    async getKanbanBoard(agencyId: string, candidateId?: string) {
        const where: any = { agencyId, isActive: true };
        if (candidateId) where.candidateId = candidateId;

        const pipelines = await this.prisma.hiringPipeline.findMany({
            where,
            include: {
                candidate: {
                    select: { id: true, firstName: true, lastName: true, photoUrl: true, category: true },
                },
                stageHistory: { orderBy: { enteredAt: 'desc' }, take: 1 },
            },
            orderBy: { updatedAt: 'desc' },
        });

        // Group by stage
        const stages: Record<string, any[]> = {};
        Object.values(PipelineStage).forEach((stage) => {
            stages[stage] = [];
        });

        pipelines.forEach((item) => {
            const stageKey = item.currentStage as string;
            if (stages[stageKey]) {
                stages[stageKey].push(item);
            } else {
                stages['APPLIED'].push(item);
            }
        });

        return { data: stages };
    }

    // Advance or move pipeline stage
    async moveStage(
        pipelineId: string,
        agencyId: string,
        adminId: string,
        newStage: PipelineStage,
        notes?: string,
    ) {
        const pipeline = await this.prisma.hiringPipeline.findUnique({
            where: { id: pipelineId },
        });

        if (!pipeline) throw new NotFoundException('Pipeline record not found');
        if (pipeline.agencyId !== agencyId) {
            throw new ForbiddenException('Access denied to pipeline record from another agency');
        }

        const previousStage = pipeline.currentStage;

        // Transaction to update pipeline stage + log stage history
        const [updatedPipeline, stageHistory] = await this.prisma.$transaction([
            this.prisma.hiringPipeline.update({
                where: { id: pipelineId },
                data: {
                    currentStage: newStage,
                    notes: notes || pipeline.notes,
                },
            }),
            this.prisma.pipelineStageHistory.create({
                data: {
                    pipelineId,
                    stage: newStage,
                    updatedBy: adminId,
                    notes: notes || `Stage moved from ${previousStage} to ${newStage}`,
                },
            }),
        ]);

        return { data: { pipeline: updatedPipeline, stageHistory } };
    }

    // Get full stage history
    async getAuditTrail(pipelineId: string, agencyId: string) {
        const pipeline = await this.prisma.hiringPipeline.findUnique({
            where: { id: pipelineId },
        });

        if (!pipeline) throw new NotFoundException('Pipeline record not found');
        if (pipeline.agencyId !== agencyId) {
            throw new ForbiddenException('Access denied');
        }

        const auditTrail = await this.prisma.pipelineStageHistory.findMany({
            where: { pipelineId },
            orderBy: { enteredAt: 'desc' },
        });

        return { data: auditTrail };
    }
}

