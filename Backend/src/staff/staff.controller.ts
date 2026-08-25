import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { StaffService } from './staff.service';
import { AdminJwtGuard } from '../common/guards/admin-jwt.guard';
import { AgencyGuard } from '../common/guards/agency.guard';
import { AgencyId } from '../common/decorators/agency-id.decorator';

@Controller('admin/staff')
@UseGuards(AdminJwtGuard, AgencyGuard)
export class StaffController {
    constructor(private readonly staffService: StaffService) { }

    @Get()
    findAll(@AgencyId() agencyId: string) {
        return this.staffService.findAll(agencyId);
    }

    @Put(':id/active')
    toggleActive(
        @Param('id') id: string,
        @AgencyId() agencyId: string,
        @Body('isActive') isActive: boolean,
    ) {
        return this.staffService.toggleActive(id, agencyId, isActive);
    }
}
