import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InquiryStatus } from '@prisma/client';

@Injectable()
export class InquiriesService {
    constructor(private readonly prisma: PrismaService) { }

    // User's own submitted inquiries
    async findMyInquiries(userId: string) {
        const inquiries = await this.prisma.candidateInquiry.findMany({
            where: { userId },
            include: {
                candidate: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        photoUrl: true,
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

        const data = inquiries.map((inq) => {
            const agency = inq.candidate?.agency as any;
            if (!agency) return inq;

            const channels: any[] = agency.contactChannels || [];
            const wa = channels.find((c) => c.channelType?.toLowerCase() === 'whatsapp')?.channelValue;
            const tg = channels.find((c) => c.channelType?.toLowerCase() === 'telegram')?.channelValue;
            const imo = channels.find((c) => c.channelType?.toLowerCase() === 'imo')?.channelValue;

            return {
                ...inq,
                candidate: {
                    ...inq.candidate,
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

    // Admin inquiries for agency
    async findAllAdmin(agencyId: string, status?: InquiryStatus) {
        const where: any = { candidate: { agencyId } };
        if (status) where.status = status;

        const inquiries = await this.prisma.candidateInquiry.findMany({
            where,
            include: {
                user: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
                candidate: { select: { id: true, firstName: true, lastName: true, photoUrl: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return { data: inquiries };
    }

    async updateStatusAdmin(id: string, agencyId: string, status: InquiryStatus, responseMessage?: string) {
        const inquiry = await this.prisma.candidateInquiry.findUnique({
            where: { id },
            include: { candidate: true },
        });

        if (!inquiry) throw new NotFoundException('Inquiry not found');
        if (inquiry.candidate.agencyId !== agencyId) {
            throw new ForbiddenException('Access denied');
        }

        const updated = await this.prisma.candidateInquiry.update({
            where: { id },
            data: {
                status,
                adminResponse: responseMessage || inquiry.adminResponse,
            },
        });

        return { data: updated };
    }
}
