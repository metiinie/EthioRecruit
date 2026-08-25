import { Controller, Get, Put, Post, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AdminJwtGuard } from '../common/guards/admin-jwt.guard';
import { AgencyGuard } from '../common/guards/agency.guard';
import { AgencyId } from '../common/decorators/agency-id.decorator';

@Controller('admin/settings')
@UseGuards(AdminJwtGuard, AgencyGuard)
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    getSettings(@AgencyId() agencyId: string) {
        return this.settingsService.getSettings(agencyId);
    }

    @Put()
    updateSettings(@AgencyId() agencyId: string, @Body() body: any) {
        return this.settingsService.updateSettings(agencyId, body);
    }

    @Post('channels')
    addContactChannel(@AgencyId() agencyId: string, @Body() body: any) {
        return this.settingsService.addContactChannel(agencyId, body);
    }
}
