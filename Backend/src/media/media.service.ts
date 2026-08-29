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
     * Generate presigned direct upload URL and parameters for client-side direct uploads (S3/Cloudinary)
     */
    generatePresignedUploadUrl(folder: string = 'ethiohire', resourceType: 'image' | 'video' | 'raw' = 'image') {
        this.checkConfiguration();

        const timestamp = Math.floor(Date.now() / 1000);
        const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET')!;
        const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME')!;
        const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY')!;

        const signature = cloudinary.utils.api_sign_request(
            { timestamp, folder },
            apiSecret,
        );

        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

        return {
            data: {
                uploadUrl,
                params: {
                    api_key: apiKey,
                    timestamp,
                    signature,
                    folder,
                },
                cloudName,
                apiKey,
                signature,
                timestamp,
                folder,
            },
        };
    }

    /**
     * Generate Cloudinary signature for client-side direct upload from Expo mobile app
     */
    generateUploadSignature(folder: string = 'ethiohire') {
        return this.generatePresignedUploadUrl(folder, 'image');
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
