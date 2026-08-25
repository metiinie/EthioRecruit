import { IsString, IsNotEmpty, Length } from 'class-validator';

export class OtpVerifyDto {
    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @Length(6, 6)
    code: string;
}
