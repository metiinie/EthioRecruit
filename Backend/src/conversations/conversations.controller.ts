import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { UserJwtGuard } from '../common/guards/user-jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('conversations')
@UseGuards(UserJwtGuard)
export class ConversationsController {
    constructor(private readonly conversationsService: ConversationsService) { }

    @Get('my')
    getUserConversations(@CurrentUser('id') userId: string) {
        return this.conversationsService.getUserConversations(userId);
    }

    @Post('start')
    getOrCreateConversation(
        @CurrentUser('id') userId: string,
        @Body() body: { agencyId: string },
    ) {
        return this.conversationsService.getOrCreateConversation(userId, body.agencyId);
    }

    @Get(':id/messages')
    getMessages(
        @Param('id') conversationId: string,
        @Query('limit') limit?: string,
        @Query('offset') offset?: string,
    ) {
        return this.conversationsService.getMessages(
            conversationId,
            limit ? parseInt(limit, 10) : 50,
            offset ? parseInt(offset, 10) : 0,
        );
    }

    @Post(':id/messages')
    sendMessage(
        @Param('id') conversationId: string,
        @CurrentUser('id') userId: string,
        @Body() body: { text: string; attachmentUrl?: string },
    ) {
        return this.conversationsService.sendMessage(
            conversationId,
            'user',
            userId,
            body.text,
            body.attachmentUrl,
        );
    }

    @Post(':id/read')
    markAsRead(
        @Param('id') conversationId: string,
    ) {
        return this.conversationsService.markAsRead(conversationId, 'user');
    }
}
