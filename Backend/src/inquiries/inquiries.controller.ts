import { Controller, Get, Put, Param, Query, Body, UseGuards } from '@nestjs/common';
import { InquiriesService } from './inquiries.service';
import { UserJwtGuard } from '../common/guards/user-jwt.guard';
import { AdminJwtGuard } from '../common/guards/admin-jwt.guard';
import { AgencyGuard } from '../common/guards/agency.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AgencyId } from '../common/decorators/agency-id.decorator';
import { InquiryStatus } from '@prisma/client';

@Controller()
export class InquiriesController {
    constructor(private readonly inquiriesService: InquiriesService) { }

    @Get('users/me/inquiries')
    @UseGuards(UserJwtGuard)
    findMyInquiries(@CurrentUser('id') userId: string) {
        return this.inquiriesService.findMyInquiries(userId);
    }

    @Get('admin/inquiries')
    @UseGuards(AdminJwtGuard, AgencyGuard)
    findAllAdmin(
        @AgencyId() agencyId: string,
        @Query('status') status?: InquiryStatus,
    ) {
        return this.inquiriesService.findAllAdmin(agencyId, status);
    }

    @Put('admin/inquiries/:id/status')
    @UseGuards(AdminJwtGuard, AgencyGuard)
    updateStatusAdmin(
        @Param('id') id: string,
        @AgencyId() agencyId: string,
        @Body('status') status: InquiryStatus,
        @Body('responseMessage') responseMessage?: string,
    ) {
        return this.inquiriesService.updateStatusAdmin(id, agencyId, status, responseMessage);
    }
}
