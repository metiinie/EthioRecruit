import { IsString, IsOptional, MinLength } from 'class-validator';

export class LoginDto {
    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    identifier?: string;

    @IsString()
    @MinLength(6)
    password!: string;
}

