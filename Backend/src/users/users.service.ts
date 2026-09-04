import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async getMe(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                jobseekerProfile: true,
                employerProfile: true,
            },
        });
        if (!user) return null;
        const { password, ...rest } = user;
        return { data: rest };
    }

    async updateUser(userId: string, data: { firstName?: string; lastName?: string; whatsappNumber?: string; telegramUsername?: string; imoNumber?: string; preferredChannel?: string; profilePhoto?: string }) {
        const cleanData: any = {};
        if (data.firstName !== undefined) cleanData.firstName = data.firstName;
        if (data.lastName !== undefined) cleanData.lastName = data.lastName;
        if (data.whatsappNumber !== undefined) cleanData.whatsappNumber = data.whatsappNumber;
        if (data.telegramUsername !== undefined) cleanData.telegramUsername = data.telegramUsername;
        if (data.imoNumber !== undefined) cleanData.imoNumber = data.imoNumber;
        if (data.preferredChannel !== undefined) cleanData.preferredChannel = data.preferredChannel;
        if (data.profilePhoto !== undefined) cleanData.profilePhoto = data.profilePhoto;

        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: cleanData,
            include: {
                jobseekerProfile: true,
                employerProfile: true,
            },
        });

        const { password, ...rest } = updated;
        return { data: rest };
    }

    async updateJobseekerProfile(userId: string, data: any) {
        const profile = await this.prisma.jobseekerProfile.upsert({
            where: { userId },
            update: data,
            create: { userId, ...data },
        });
        return { data: profile };
    }

    async updateEmployerProfile(userId: string, data: any) {
        const profile = await this.prisma.employerProfile.upsert({
            where: { userId },
            update: data,
            create: { userId, ...data },
        });
        return { data: profile };
    }

    async registerDeviceToken(userId: string, token: string, platform?: string) {
        const deviceToken = await this.prisma.deviceToken.upsert({
            where: { token },
            update: { userId, platform },
            create: { userId, token, platform },
        });
        return { data: deviceToken };
    }

    async removeDeviceToken(token: string) {
        await this.prisma.deviceToken.deleteMany({ where: { token } });
        return { data: { message: 'Device token removed' } };
    }
}
