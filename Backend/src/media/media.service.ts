import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class MediaService {
    private readonly logger = new Logger(MediaService.name);

    constructor(private readonly configService: ConfigService) {
        cloudinary.config({
            cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME') || 'demo',
            api_key: this.configService.get<string>('CLOUDINARY_API_KEY') || '1234567890',
            api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET') || 'secret',
        });
    }

    /**
     * Generate Cloudinary signature for client-side direct upload from Expo mobile app
     */
    generateUploadSignature(folder: string = 'ethiohire') {
        const timestamp = Math.floor(Date.now() / 1000);
        const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET') || 'secret';
        const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME') || 'demo';
        const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY') || '1234567890';

        const signature = cloudinary.utils.api_sign_request(
            { timestamp, folder },
            apiSecret,
        );

        return {
            data: {
                signature,
                timestamp,
                cloudName,
                apiKey,
                folder,
            },
        };
    }

    /**
     * Direct base64 / data URL upload to Cloudinary (for candidates photo, video thumbnail, passport document)
     */
    async uploadBase64(base64Data: string, folder: string = 'ethiohire', resourceType: 'image' | 'video' | 'raw' = 'image') {
        try {
            const result = await cloudinary.uploader.upload(base64Data, {
                folder,
                resource_type: resourceType,
            });

            return {
                data: {
                    url: result.secure_url,
                    publicId: result.public_id,
                    format: result.format,
                    resourceType: result.resource_type,
                    bytes: result.bytes,
                },
            };
        } catch (error: any) {
            this.logger.error(`Cloudinary upload failed: ${error.message}`);
            throw new BadRequestException(`Media upload failed: ${error.message}`);
        }
    }
}
