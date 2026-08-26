import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(private readonly prisma: PrismaService) { }

    async getUserNotifications(userId: string) {
        const notifications = await this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        return { data: notifications };
    }

    async markAsRead(id: string, userId: string) {
        const notification = await this.prisma.notification.updateMany({
            where: { id, userId },
            data: { isRead: true },
        });
        return { data: notification };
    }

    async markAllAsRead(userId: string) {
        await this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        return { data: { message: 'All notifications marked as read' } };
    }

    async createNotification(userId: string, title: string, body: string, data?: any) {
        const notification = await this.prisma.notification.create({
            data: {
                userId,
                title,
                body,
                data: data || {},
            },
        });

        // Attempt to send push notification via Expo Push API
        this.sendPushNotification(userId, title, body, data).catch((err) =>
            this.logger.warn(`Push delivery failed: ${err.message}`),
        );

        return notification;
    }

    private async sendPushNotification(userId: string, title: string, body: string, data?: any) {
        const devices = await this.prisma.deviceToken.findMany({ where: { userId } });
        if (!devices.length) return;

        const validDevices = devices.filter((d) =>
            d.token && typeof d.token === 'string' &&
            (d.token.startsWith('ExponentPushToken[') || d.token.startsWith('ExpoPushToken['))
        );
        if (!validDevices.length) return;

        const messages = validDevices.map((d) => ({
            to: d.token,
            sound: 'default',
            title,
            body,
            data,
        }));

        // Post to Expo Push Notification API
        await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(messages),
        });
    }
}
