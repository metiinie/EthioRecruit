import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class OtpSendDto {
    @IsString()
    @IsNotEmpty()
    phone!: string;

    @IsString()
    @IsOptional()
    purpose?: string = 'registration';
}

