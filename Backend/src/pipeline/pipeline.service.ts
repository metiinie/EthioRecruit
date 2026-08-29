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

        // Atomic transaction to update pipeline stage + log stage history + sync candidate availability
        return this.prisma.$transaction(async (tx) => {
            const updatedPipeline = await tx.hiringPipeline.update({
                where: { id: pipelineId },
                data: {
                    currentStage: newStage,
                    notes: notes || pipeline.notes,
                },
            });

            const stageHistory = await tx.pipelineStageHistory.create({
                data: {
                    pipelineId,
                    stage: newStage,
                    updatedBy: adminId,
                    notes: notes || `Stage moved from ${previousStage} to ${newStage}`,
                },
            });

            // Automatically synchronize candidate availability and public listing visibility
            if (newStage === PipelineStage.DEPLOYED) {
                // Deployed candidates are unavailable and unpublished from public search
                await tx.candidate.update({
                    where: { id: pipeline.candidateId },
                    data: { isAvailable: false, isPublished: false },
                });
            } else if (newStage === PipelineStage.SELECTED) {
                // Selected candidates are marked unavailable (reserved by employer)
                await tx.candidate.update({
                    where: { id: pipeline.candidateId },
                    data: { isAvailable: false },
                });
            } else if (newStage === PipelineStage.CANCELLED) {
                // Cancelled pipeline applications restore candidate availability and public visibility
                await tx.candidate.update({
                    where: { id: pipeline.candidateId },
                    data: { isAvailable: true, isPublished: true },
                });
            }

            return { data: { pipeline: updatedPipeline, stageHistory } };
        });
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

