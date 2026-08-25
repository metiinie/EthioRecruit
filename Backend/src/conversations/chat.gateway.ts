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
import { ConversationsService } from './conversations.service';

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

    constructor(private readonly conversationsService: ConversationsService) { }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinConversation')
    handleJoinConversation(
        @MessageBody() payload: { conversationId: string },
        @ConnectedSocket() client: Socket,
    ) {
        if (payload?.conversationId) {
            client.join(`conversation_${payload.conversationId}`);
            this.logger.log(`Client ${client.id} joined room conversation_${payload.conversationId}`);
            return { event: 'joined', conversationId: payload.conversationId };
        }
    }

    @SubscribeMessage('leaveConversation')
    handleLeaveConversation(
        @MessageBody() payload: { conversationId: string },
        @ConnectedSocket() client: Socket,
    ) {
        if (payload?.conversationId) {
            client.leave(`conversation_${payload.conversationId}`);
            this.logger.log(`Client ${client.id} left room conversation_${payload.conversationId}`);
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
    ) {
        if (!payload.conversationId || !payload.text) return;

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
    handleTyping(
        @MessageBody() payload: { conversationId: string; senderType: 'user' | 'agency'; isTyping: boolean },
        @ConnectedSocket() client: Socket,
    ) {
        client.to(`conversation_${payload.conversationId}`).emit('userTyping', payload);
    }
}
