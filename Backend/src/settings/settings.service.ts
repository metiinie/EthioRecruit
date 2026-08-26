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

        const org = await this.prisma.organization.findUnique({
            where: { id: agencyId },
        });

        const channels = await this.prisma.agencyContactChannel.findMany({
            where: { agencyId },
        });

        const combinedSettings = {
            ...settings,
            licenseNumber: org?.licenseNumber || '',
            logoUrl: org?.logoUrl || '',
            contactEmail: org?.email || '',
            contactPhone: org?.phone || '',
        };

        return { data: { settings: combinedSettings, contactChannels: channels } };
    }

    async updateSettings(agencyId: string, data: any) {
        const {
            licenseNumber,
            logoUrl,
            contactEmail,
            contactPhone,
            allowInAppApplications,
            showSalaryInVacancies,
            notifyAdminOnNewInquiry,
        } = data;

        // 1. Update Organization primary info
        const org = await this.prisma.organization.update({
            where: { id: agencyId },
            data: {
                licenseNumber: licenseNumber !== undefined ? licenseNumber : undefined,
                logoUrl: logoUrl !== undefined ? logoUrl : undefined,
                email: contactEmail !== undefined ? contactEmail : undefined,
                phone: contactPhone !== undefined ? contactPhone : undefined,
            },
        });

        // 2. Update Agency Settings flags
        const settingsData: any = {};
        if (allowInAppApplications !== undefined) settingsData.allowInAppApplications = allowInAppApplications;
        if (showSalaryInVacancies !== undefined) settingsData.showSalaryInVacancies = showSalaryInVacancies;
        if (notifyAdminOnNewInquiry !== undefined) settingsData.notifyAdminOnNewInquiry = notifyAdminOnNewInquiry;

        const settings = await this.prisma.agencySetting.upsert({
            where: { agencyId },
            update: settingsData,
            create: { agencyId, ...settingsData },
        });

        return {
            data: {
                ...settings,
                licenseNumber: org.licenseNumber,
                logoUrl: org.logoUrl,
                contactEmail: org.email,
                contactPhone: org.phone,
            },
        };
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
