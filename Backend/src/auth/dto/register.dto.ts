import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    firstName!: string;

    @IsString()
    @IsNotEmpty()
    lastName!: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^\+251[0-9]{9}$/, { message: 'Phone must be a valid Ethiopian number (+251XXXXXXXXX)' })
    phone!: string;

    @IsString()
    @MinLength(6)
    password!: string;
}
