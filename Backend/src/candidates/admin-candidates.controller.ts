import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Query,
    Body,
    UseGuards,
} from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto, UpdateCandidateDto, CandidateFiltersDto } from './dto/candidate.dto';
import { AdminJwtGuard } from '../common/guards/admin-jwt.guard';
import { AgencyGuard } from '../common/guards/agency.guard';
import { SubscriptionGuard } from '../common/guards/subscription.guard';
import { AgencyId } from '../common/decorators/agency-id.decorator';

@Controller('admin/candidates')
@UseGuards(AdminJwtGuard, AgencyGuard, SubscriptionGuard)
export class AdminCandidatesController {
    constructor(private readonly candidatesService: CandidatesService) { }

    @Get()
    findAll(
        @AgencyId() agencyId: string,
        @Query() filters: CandidateFiltersDto,
    ) {
        return this.candidatesService.findAllAdmin(agencyId, filters);
    }

    @Post()
    create(
        @AgencyId() agencyId: string,
        @Body() dto: CreateCandidateDto,
    ) {
        return this.candidatesService.createAdmin(agencyId, dto);
    }

    @Post('bulk')
    bulkCreate(
        @AgencyId() agencyId: string,
        @Body() body: { candidates: CreateCandidateDto[] },
    ) {
        const list = Array.isArray(body) ? body : body.candidates;
        return this.candidatesService.bulkCreateAdmin(agencyId, list);
    }

    @Put(':id')
    update(
        @Param('id') id: string,
        @AgencyId() agencyId: string,
        @Body() dto: UpdateCandidateDto,
    ) {
        return this.candidatesService.updateAdmin(id, agencyId, dto);
    }

    @Delete(':id')
    softDelete(
        @Param('id') id: string,
        @AgencyId() agencyId: string,
    ) {
        return this.candidatesService.softDeleteAdmin(id, agencyId);
    }

    @Put(':id/medical')
    updateMedical(
        @Param('id') id: string,
        @AgencyId() agencyId: string,
        @Body() body: any,
    ) {
        return this.candidatesService.updateMedicalAdmin(id, agencyId, body);
    }

    @Get(':id/cv')
    exportCv(
        @Param('id') id: string,
        @AgencyId() agencyId: string,
    ) {
        return this.candidatesService.generateCvData(id, agencyId);
    }
}
