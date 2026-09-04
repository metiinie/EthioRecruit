import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApplicationsService {
    constructor(private readonly prisma: PrismaService) { }

    // User's own applications
    async findMyApplications(userId: string) {
        const applications = await this.prisma.application.findMany({
            where: { userId },
            include: {
                vacancy: {
                    include: {
                        category: true,
                        agency: {
                            select: {
                                id: true,
                                name: true,
                                logoUrl: true,
                                phone: true,
                                isVerified: true,
                                contactChannels: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const data = applications.map((app) => {
            const agency = app.vacancy?.agency as any;
            if (!agency) return app;

            const channels: any[] = agency.contactChannels || [];
            const wa = channels.find((c) => c.channelType?.toLowerCase() === 'whatsapp')?.channelValue;
            const tg = channels.find((c) => c.channelType?.toLowerCase() === 'telegram')?.channelValue;
            const imo = channels.find((c) => c.channelType?.toLowerCase() === 'imo')?.channelValue;

            return {
                ...app,
                vacancy: {
                    ...app.vacancy,
                    agency: {
                        ...agency,
                        whatsappNumber: wa || agency.phone || '+251911000000',
                        telegramUsername: tg || agency.phone || 'EthioRecruit',
                        imoNumber: imo || agency.phone || '+251911000000',
                    },
                },
            };
        });

        return { data };
    }

    // Admin list applications for agency
    async findAllAdmin(agencyId: string, status?: string) {
        const where: any = { vacancy: { agencyId } };
        if (status) where.status = status;

        const applications = await this.prisma.application.findMany({
            where,
            include: {
                user: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
                vacancy: { select: { id: true, title: true, country: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return { data: applications };
    }
}
