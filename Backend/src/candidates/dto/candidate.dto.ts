import { IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean, IsArray, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCandidateDto {
    @IsString()
    @IsNotEmpty()
    categoryId!: string;

    @IsString()
    @IsNotEmpty()
    firstName!: string;

    @IsString()
    @IsNotEmpty()
    lastName!: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    dateOfBirth?: Date;

    @IsString()
    @IsOptional()
    gender?: string = 'female';

    @IsString()
    @IsOptional()
    nationality?: string = 'Ethiopian';

    @IsString()
    @IsOptional()
    religion?: string;

    @IsString()
    @IsOptional()
    maritalStatus?: string;

    @IsString()
    @IsOptional()
    summary?: string;

    @IsString()
    @IsOptional()
    educationLevel?: string;

    @IsInt()
    @IsOptional()
    yearsOfExperience?: number = 0;

    @IsString()
    @IsOptional()
    currentCountry?: string;

    @IsString()
    @IsOptional()
    currentCity?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    skills?: string[] = [];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    languages?: string[] = [];
}

export class UpdateCandidateDto extends CreateCandidateDto {
    @IsBoolean()
    @IsOptional()
    isFeatured?: boolean;

    @IsBoolean()
    @IsOptional()
    isAvailable?: boolean;

    @IsBoolean()
    @IsOptional()
    isPublished?: boolean;

    @IsString()
    @IsOptional()
    medicalStatus?: string;

    @IsString()
    @IsOptional()
    visaStatus?: string;
}

export class CandidateFiltersDto {
    @IsOptional()
    @IsString()
    categoryId?: string;

    @IsOptional()
    @IsString()
    gender?: string;

    @IsOptional()
    @IsString()
    medicalStatus?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    perPage?: number = 10;
}

