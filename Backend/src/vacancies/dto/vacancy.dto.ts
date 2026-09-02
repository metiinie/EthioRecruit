import { IsString, IsNotEmpty, IsEnum, IsOptional, IsInt, IsBoolean, IsArray, IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { VacancyStatus, EmployerType, GenderPreference } from '@prisma/client';

export class CreateVacancyDto {
    @IsString()
    @IsNotEmpty()
    categoryId!: string;

    @IsString()
    @IsNotEmpty()
    title!: string;

    @IsString()
    @IsOptional()
    jobCode?: string;

    @IsString()
    @IsNotEmpty()
    description!: string;

    @IsArray()
    @IsString({ each: true })
    requirements!: string[];

    @IsString()
    @IsNotEmpty()
    country!: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsString()
    @IsOptional()
    targetRegion?: string;

    @IsEnum(EmployerType)
    @IsOptional()
    employerType?: EmployerType;

    @IsString()
    @IsOptional()
    employerName?: string;

    @IsBoolean()
    @IsOptional()
    showEmployerName?: boolean = true;

    @IsString()
    @IsOptional()
    foreignAgencyPartner?: string;

    @IsNumber()
    @IsOptional()
    salaryMin?: number;

    @IsNumber()
    @IsOptional()
    salaryMax?: number;

    @IsString()
    @IsOptional()
    salaryCurrency?: string = 'SAR';

    @IsString()
    @IsOptional()
    overtimeTerms?: string;

    @IsString()
    @IsOptional()
    placementFeeTerms?: string;

    @IsInt()
    @IsOptional()
    contractPeriodYears?: number = 2;

    @IsInt()
    @IsOptional()
    probationPeriodMonths?: number = 3;

    @IsInt()
    @IsOptional()
    workingHoursPerDay?: number = 8;

    @IsInt()
    @IsOptional()
    workingDaysPerWeek?: number = 6;

    @IsInt()
    @IsOptional()
    offDaysPerMonth?: number = 4;

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

    @IsBoolean()
    @IsOptional()
    flightTicketProvided?: boolean = true;

    @IsInt()
    @IsOptional()
    annualLeaveDays?: number = 30;

    @IsEnum(GenderPreference)
    @IsOptional()
    genderPreference?: GenderPreference = GenderPreference.any;

    @IsString()
    @IsOptional()
    religionPreference?: string = 'any';

    @IsInt()
    @IsOptional()
    ageMin?: number;

    @IsInt()
    @IsOptional()
    ageMax?: number;

    @IsInt()
    @IsOptional()
    experienceRequired?: number = 0;

    @IsBoolean()
    @IsOptional()
    overseasExpRequired?: boolean = false;

    @IsString()
    @IsOptional()
    educationLevelRequired?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    requiredSkills?: string[] = [];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    requiredLanguages?: string[] = [];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    requiredCertificates?: string[] = [];

    @IsInt()
    @IsOptional()
    vacanciesCount?: number = 1;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    applicationDeadline?: Date;

    @IsEnum(VacancyStatus)
    @IsOptional()
    status?: VacancyStatus = VacancyStatus.ACTIVE;
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

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    limit?: number;
}

