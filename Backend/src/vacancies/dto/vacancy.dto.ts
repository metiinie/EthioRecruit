import { IsString, IsNotEmpty, IsEnum, IsOptional, IsInt, IsBoolean, IsArray, IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { VacancyStatus, EmployerType, GenderPreference } from '@prisma/client';

export class CreateVacancyDto {
    @IsString()
    @IsNotEmpty()
    categoryId: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsArray()
    @IsString({ each: true })
    requirements: string[];

    @IsString()
    @IsNotEmpty()
    country: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsEnum(EmployerType)
    @IsOptional()
    employerType?: EmployerType;

    @IsString()
    @IsOptional()
    employerName?: string;

    @IsBoolean()
    @IsOptional()
    showEmployerName?: boolean = true;

    @IsNumber()
    @IsOptional()
    salaryMin?: number;

    @IsNumber()
    @IsOptional()
    salaryMax?: number;

    @IsString()
    @IsOptional()
    salaryCurrency?: string = 'ETB';

    @IsInt()
    @IsOptional()
    contractPeriodYears?: number = 2;

    @IsInt()
    @IsOptional()
    workingHoursPerDay?: number;

    @IsInt()
    @IsOptional()
    workingDaysPerWeek?: number;

    @IsBoolean()
    @IsOptional()
    visaSponsorship?: boolean = true;

    @IsBoolean()
    @IsOptional()
    accommodationProvided?: boolean = true;

    @IsBoolean()
    @IsOptional()
    mealsProvided?: boolean = true;

    @IsBoolean()
    @IsOptional()
    transportationProvided?: boolean = true;

    @IsBoolean()
    @IsOptional()
    healthInsurance?: boolean = true;

    @IsInt()
    @IsOptional()
    annualLeaveDays?: number = 30;

    @IsEnum(GenderPreference)
    @IsOptional()
    genderPreference?: GenderPreference = GenderPreference.any;

    @IsInt()
    @IsOptional()
    ageMin?: number;

    @IsInt()
    @IsOptional()
    ageMax?: number;

    @IsString()
    @IsOptional()
    experienceRequired?: string;

    @IsInt()
    @IsOptional()
    vacanciesCount?: number = 1;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    applicationDeadline?: Date;
}

export class UpdateVacancyDto extends CreateVacancyDto {
    @IsEnum(VacancyStatus)
    @IsOptional()
    status?: VacancyStatus;
}

export class VacancyFiltersDto {
    @IsOptional()
    @IsString()
    categoryId?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsEnum(VacancyStatus)
    status?: VacancyStatus;

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
