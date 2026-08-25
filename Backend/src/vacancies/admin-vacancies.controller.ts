import {
    Controller,
    Get,
    Post,
    Put,
    Param,
    Query,
    Body,
    UseGuards,
} from '@nestjs/common';
import { VacanciesService } from './vacancies.service';
import { CreateVacancyDto, UpdateVacancyDto, VacancyFiltersDto } from './dto/vacancy.dto';
import { AdminJwtGuard } from '../common/guards/admin-jwt.guard';
import { AgencyGuard } from '../common/guards/agency.guard';
import { AgencyId } from '../common/decorators/agency-id.decorator';
import { VacancyStatus } from '@prisma/client';

@Controller('admin/vacancies')
@UseGuards(AdminJwtGuard, AgencyGuard)
export class AdminVacanciesController {
    constructor(private readonly vacanciesService: VacanciesService) { }

    @Get()
    findAll(
        @AgencyId() agencyId: string,
        @Query() filters: VacancyFiltersDto,
    ) {
        return this.vacanciesService.findAllAdmin(agencyId, filters);
    }

    @Post()
    create(
        @AgencyId() agencyId: string,
        @Body() dto: CreateVacancyDto,
    ) {
        return this.vacanciesService.createAdmin(agencyId, dto);
    }

    @Put(':id')
    update(
        @Param('id') id: string,
        @AgencyId() agencyId: string,
        @Body() dto: UpdateVacancyDto,
    ) {
        return this.vacanciesService.updateAdmin(id, agencyId, dto);
    }

    @Put(':id/status')
    updateStatus(
        @Param('id') id: string,
        @AgencyId() agencyId: string,
        @Body('status') status: VacancyStatus,
    ) {
        return this.vacanciesService.updateStatusAdmin(id, agencyId, status);
    }
}
