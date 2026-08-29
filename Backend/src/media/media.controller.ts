import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { MediaService } from './media.service';
import { UserJwtGuard } from '../common/guards/user-jwt.guard';

@Controller('media')
@UseGuards(UserJwtGuard)
export class MediaController {
    constructor(private readonly mediaService: MediaService) { }

    @Get('presigned-url')
    getPresignedUrl(
        @Query('folder') folder?: string,
        @Query('resourceType') resourceType?: 'image' | 'video' | 'raw',
    ) {
        return this.mediaService.generatePresignedUploadUrl(folder || 'ethiohire', resourceType || 'image');
    }

    @Post('presigned-url')
    createPresignedUrl(
        @Body() body: { folder?: string; resourceType?: 'image' | 'video' | 'raw' },
    ) {
        return this.mediaService.generatePresignedUploadUrl(body.folder || 'ethiohire', body.resourceType || 'image');
    }

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
