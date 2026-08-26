import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class MediaService {
    private readonly logger = new Logger(MediaService.name);
    private isConfigured = false;

    constructor(private readonly configService: ConfigService) {
        const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
        const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
        const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

        if (cloudName && apiKey && apiSecret) {
            cloudinary.config({
                cloud_name: cloudName,
                api_key: apiKey,
                api_secret: apiSecret,
            });
            this.isConfigured = true;
            this.logger.log('Cloudinary media service initialized successfully');
        } else {
            this.logger.warn('Cloudinary environment variables missing (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)');
        }
    }

    private checkConfiguration() {
        if (!this.isConfigured) {
            const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
            const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
            const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');
            if (cloudName && apiKey && apiSecret) {
                cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
                this.isConfigured = true;
                return;
            }
            throw new InternalServerErrorException(
                'Media storage is unconfigured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend .env file.',
            );
        }
    }

    /**
     * Generate Cloudinary signature for client-side direct upload from Expo mobile app
     */
    generateUploadSignature(folder: string = 'ethiohire') {
        this.checkConfiguration();

        const timestamp = Math.floor(Date.now() / 1000);
        const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET')!;
        const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME')!;
        const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY')!;

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
        this.checkConfiguration();

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
