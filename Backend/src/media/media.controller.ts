import { Controller, Post, Body, UseGuards, Query } from '@nestjs/common';
import { MediaService } from './media.service';
import { UserJwtGuard } from '../common/guards/user-jwt.guard';

@Controller('media')
@UseGuards(UserJwtGuard)
export class MediaController {
    constructor(private readonly mediaService: MediaService) { }

    @Post('upload-signature')
    getUploadSignature(@Query('folder') folder?: string) {
        return this.mediaService.generateUploadSignature(folder);
    }

    @Post('upload')
    uploadBase64(
        @Body() body: { base64Data: string; folder?: string; resourceType?: 'image' | 'video' | 'raw' },
    ) {
        return this.mediaService.uploadBase64(
            body.base64Data,
            body.folder || 'ethiohire',
            body.resourceType || 'image',
        );
    }
}
