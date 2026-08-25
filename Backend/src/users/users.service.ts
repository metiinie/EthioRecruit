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
