import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConversationsService {
    constructor(private readonly prisma: PrismaService) { }

    async getOrCreateConversation(userId: string, agencyId: string) {
        let conversation = await this.prisma.conversation.findUnique({
            where: { userId_agencyId: { userId, agencyId } },
            include: {
                agency: { select: { id: true, name: true, logoUrl: true } },
                user: { select: { id: true, firstName: true, lastName: true, phone: true } },
            },
        });

        if (!conversation) {
            conversation = await this.prisma.conversation.create({
                data: { userId, agencyId },
                include: {
                    agency: { select: { id: true, name: true, logoUrl: true } },
                    user: { select: { id: true, firstName: true, lastName: true, phone: true } },
                },
            });
        }

        return { data: conversation };
    }

    async getUserConversations(userId: string) {
        const conversations = await this.prisma.conversation.findMany({
            where: { userId },
            include: {
                agency: { select: { id: true, name: true, logoUrl: true } },
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });

        return { data: conversations };
    }

    async getAgencyConversations(agencyId: string) {
        const conversations = await this.prisma.conversation.findMany({
            where: { agencyId },
            include: {
                user: { select: { id: true, firstName: true, lastName: true, phone: true } },
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });

        return { data: conversations };
    }

    async getMessages(conversationId: string, limit = 50, offset = 0) {
        const messages = await this.prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        });

        return { data: messages.reverse() };
    }

    async sendMessage(
        conversationId: string,
        senderType: 'user' | 'agency',
        senderId: string,
        text: string,
        attachmentUrl?: string,
    ) {
        const conversation = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
        if (!conversation) throw new NotFoundException('Conversation not found');

        const message = await this.prisma.message.create({
            data: {
                conversationId,
                senderType,
                senderId,
                text,
                attachmentUrl,
            },
        });

        // Touch conversation updatedAt
        await this.prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        });

        return { data: message };
    }

    async markAsRead(conversationId: string, senderType: 'user' | 'agency') {
        // Mark all messages sent by opposite party as read
        const oppositeType = senderType === 'user' ? 'agency' : 'user';

        await this.prisma.message.updateMany({
            where: {
                conversationId,
                senderType: oppositeType,
                isRead: false,
            },
            data: { isRead: true },
        });

        return { data: { message: 'Messages marked as read' } };
    }
}
