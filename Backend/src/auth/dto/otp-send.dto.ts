import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { OtpPurpose } from '@prisma/client';

export class OtpSendDto {
    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsEnum(OtpPurpose)
    @IsOptional()
    purpose?: OtpPurpose = OtpPurpose.registration;
}
