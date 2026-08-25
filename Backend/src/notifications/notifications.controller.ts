import { Controller, Get, Put, Param, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { UserJwtGuard } from '../common/guards/user-jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(UserJwtGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    getUserNotifications(@CurrentUser('id') userId: string) {
        return this.notificationsService.getUserNotifications(userId);
    }

    @Put(':id/read')
    markAsRead(@Param('id') id: string, @CurrentUser('id') userId: string) {
        return this.notificationsService.markAsRead(id, userId);
    }

    @Put('read-all')
    markAllAsRead(@CurrentUser('id') userId: string) {
        return this.notificationsService.markAllAsRead(userId);
    }
}
