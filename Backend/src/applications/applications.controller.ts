import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { UserJwtGuard } from '../common/guards/user-jwt.guard';
import { AdminJwtGuard } from '../common/guards/admin-jwt.guard';
import { AgencyGuard } from '../common/guards/agency.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AgencyId } from '../common/decorators/agency-id.decorator';

@Controller()
export class ApplicationsController {
    constructor(private readonly applicationsService: ApplicationsService) { }

    @Get('users/me/applications')
    @UseGuards(UserJwtGuard)
    findMyApplications(@CurrentUser('id') userId: string) {
        return this.applicationsService.findMyApplications(userId);
    }

    @Get('admin/applications')
    @UseGuards(AdminJwtGuard, AgencyGuard)
    findAllAdmin(
        @AgencyId() agencyId: string,
        @Query('status') status?: string,
    ) {
        return this.applicationsService.findAllAdmin(agencyId, status);
    }
}
