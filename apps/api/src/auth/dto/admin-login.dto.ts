import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class AdminLoginDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;
}
