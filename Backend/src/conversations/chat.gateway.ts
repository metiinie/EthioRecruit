import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConversationsService } from './conversations.service';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    private readonly logger = new Logger(ChatGateway.name);

    constructor(
        private readonly conversationsService: ConversationsService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) { }

    async handleConnection(client: Socket) {
        try {
            const authHeader = client.handshake.headers?.authorization;
            const authToken = client.handshake.auth?.token;
            let rawToken = authToken || authHeader;

            if (rawToken && rawToken.startsWith('Bearer ')) {
                rawToken = rawToken.slice(7);
            }

            if (!rawToken) {
                this.logger.warn(`[WSS] Connection rejected: No token provided for client ${client.id}`);
                client.emit('error', { message: 'Authentication token required' });
                client.disconnect(true);
                return;
            }

            let decoded: any = null;
            // Attempt decoding with User JWT secret first
            const userSecret = this.configService.get<string>('JWT_SECRET');
            const adminSecret = this.configService.get<string>('ADMIN_JWT_SECRET');

            try {
                decoded = this.jwtService.verify(rawToken, { secret: userSecret });
            } catch {
                if (adminSecret) {
                    try {
                        decoded = this.jwtService.verify(rawToken, { secret: adminSecret });
                    } catch {
                        decoded = null;
                    }
                }
            }

            if (!decoded) {
                this.logger.warn(`[WSS] Connection rejected: Invalid token signature for client ${client.id}`);
                client.emit('error', { message: 'Invalid or expired authentication token' });
                client.disconnect(true);
                return;
            }

            client.data.user = decoded;
            this.logger.log(`[WSS] Authenticated client connected: ${client.id} (User/Admin: ${decoded.sub})`);
        } catch (err: any) {
            this.logger.error(`[WSS] Connection error for ${client.id}: ${err.message}`);
            client.disconnect(true);
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`[WSS] Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinConversation')
    async handleJoinConversation(
        @MessageBody() payload: { conversationId: string },
        @ConnectedSocket() client: Socket,
    ) {
        const user = client.data?.user;
        if (!user) {
            return { event: 'error', message: 'Unauthorized WebSocket session' };
        }

        if (!payload?.conversationId) {
            return { event: 'error', message: 'Conversation ID required' };
        }

        const isAuthorized = await this.verifyConversationAccess(payload.conversationId, user);
        if (!isAuthorized) {
            this.logger.warn(`[WSS] Access denied for user ${user.sub} to conversation ${payload.conversationId}`);
            return { event: 'error', message: 'Forbidden: Access denied to conversation' };
        }

        client.join(`conversation_${payload.conversationId}`);
        this.logger.log(`[WSS] Client ${client.id} joined room conversation_${payload.conversationId}`);
        return { event: 'joined', conversationId: payload.conversationId };
    }

    @SubscribeMessage('leaveConversation')
    handleLeaveConversation(
        @MessageBody() payload: { conversationId: string },
        @ConnectedSocket() client: Socket,
    ) {
        if (payload?.conversationId) {
            client.leave(`conversation_${payload.conversationId}`);
            this.logger.log(`[WSS] Client ${client.id} left room conversation_${payload.conversationId}`);
        }
    }

    @SubscribeMessage('sendMessage')
    async handleSendMessage(
        @MessageBody()
        payload: {
            conversationId: string;
            senderType: 'user' | 'agency';
            senderId: string;
            text: string;
            attachmentUrl?: string;
        },
        @ConnectedSocket() client: Socket,
    ) {
        const user = client.data?.user;
        if (!user) {
            return { event: 'error', message: 'Unauthorized WebSocket session' };
        }

        if (!payload.conversationId || !payload.text) return;

        const isAuthorized = await this.verifyConversationAccess(payload.conversationId, user);
        if (!isAuthorized) {
            return { event: 'error', message: 'Forbidden: Cannot send message to unauthorized conversation' };
        }

        const result = await this.conversationsService.sendMessage(
            payload.conversationId,
            payload.senderType,
            payload.senderId,
            payload.text,
            payload.attachmentUrl,
        );

        // Broadcast to all clients connected to this conversation room
        this.server
            .to(`conversation_${payload.conversationId}`)
            .emit('newMessage', result.data);

        return result;
    }

    @SubscribeMessage('typing')
    async handleTyping(
        @MessageBody() payload: { conversationId: string; senderType: 'user' | 'agency'; isTyping: boolean },
        @ConnectedSocket() client: Socket,
    ) {
        const user = client.data?.user;
        if (!user || !payload?.conversationId) return;

        const isAuthorized = await this.verifyConversationAccess(payload.conversationId, user);
        if (isAuthorized) {
            client.to(`conversation_${payload.conversationId}`).emit('userTyping', payload);
        }
    }

    private async verifyConversationAccess(conversationId: string, user: any): Promise<boolean> {
        try {
            const conversation = await this.prisma.conversation.findUnique({
                where: { id: conversationId },
            });
            if (!conversation) return false;

            const userId = user.sub;
            const agencyId = user.agency_id || user.agencyId;

            if (conversation.userId === userId) return true;
            if (agencyId && conversation.agencyId === agencyId) return true;

            // Check if user has admin/staff access to conversation agency
            if (user.type === 'admin') return true;

            const orgMember = await this.prisma.organizationMember.findFirst({
                where: { userId, organizationId: conversation.agencyId },
            });
            if (orgMember) return true;

            return false;
        } catch {
            return false;
        }
    }
}
