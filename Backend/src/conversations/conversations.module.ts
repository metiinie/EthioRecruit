import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { ChatGateway } from './chat.gateway';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [
        PrismaModule,
        ConfigModule,
        JwtModule.register({}),
    ],
    controllers: [ConversationsController],
    providers: [ConversationsService, ChatGateway],
    exports: [ConversationsService, ChatGateway],
})
export class ConversationsModule { }
