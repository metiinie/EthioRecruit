import {
    Controller,
    Get,
    Put,
    Param,
    Query,
    Body,
    UseGuards,
} from '@nestjs/common';
import { PipelineService } from './pipeline.service';
import { AdminJwtGuard } from '../common/guards/admin-jwt.guard';
import { AgencyGuard } from '../common/guards/agency.guard';
import { AgencyId } from '../common/decorators/agency-id.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PipelineStage } from '@prisma/client';

@Controller('admin/pipeline')
@UseGuards(AdminJwtGuard, AgencyGuard)
export class PipelineController {
    constructor(private readonly pipelineService: PipelineService) { }

    @Get('kanban')
    getKanban(
        @AgencyId() agencyId: string,
        @Query('vacancyId') vacancyId?: string,
    ) {
        return this.pipelineService.getKanbanBoard(agencyId, vacancyId);
    }

    @Put('applications/:id/stage')
    moveStage(
        @Param('id') applicationId: string,
        @AgencyId() agencyId: string,
        @CurrentUser('id') adminId: string,
        @Body('stage') stage: PipelineStage,
        @Body('notes') notes?: string,
    ) {
        return this.pipelineService.moveStage(applicationId, agencyId, adminId, stage, notes);
    }

    @Get('applications/:id/audit')
    getAuditTrail(
        @Param('id') applicationId: string,
        @AgencyId() agencyId: string,
    ) {
        return this.pipelineService.getAuditTrail(applicationId, agencyId);
    }
}
