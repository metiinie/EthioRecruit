import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
    constructor(private readonly prisma: PrismaService) { }

    async getSettings(agencyId: string) {
        let settings = await this.prisma.agencySetting.findUnique({
            where: { agencyId },
        });

        if (!settings) {
            settings = await this.prisma.agencySetting.create({
                data: { agencyId },
            });
        }

        const channels = await this.prisma.agencyContactChannel.findMany({
            where: { agencyId },
        });

        return { data: { settings, contactChannels: channels } };
    }

    async updateSettings(agencyId: string, data: any) {
        const settings = await this.prisma.agencySetting.upsert({
            where: { agencyId },
            update: data,
            create: { agencyId, ...data },
        });
        return { data: settings };
    }

    async addContactChannel(agencyId: string, data: any) {
        const channel = await this.prisma.agencyContactChannel.create({
            data: {
                agencyId,
                channelType: data.type || data.channelType,
                channelValue: data.value || data.channelValue,
                label: data.label,
                isPrimary: data.isPrimary || false,
            },
        });
        return { data: channel };
    }
}
