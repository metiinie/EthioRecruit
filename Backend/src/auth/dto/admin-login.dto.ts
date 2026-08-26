import { IsString, IsOptional, MinLength } from 'class-validator';

export class AdminLoginDto {
    @IsString()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    identifier?: string;

    @IsString()
    @MinLength(6)
    password!: string;
}

