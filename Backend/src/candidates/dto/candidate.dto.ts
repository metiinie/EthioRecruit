import { IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean, IsArray, IsDate, IsNumber } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';

const sanitizeEmpty = ({ value }: { value: any }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    if (typeof value === 'string' && !value.trim()) return undefined;
    if (value instanceof Date && isNaN(value.getTime())) return undefined;
    return value;
};

export class CreateCandidateDto {
    @IsString()
    @IsNotEmpty()
    categoryId!: string;

    @IsString()
    @IsNotEmpty()
    firstName!: string;

    @IsString()
    @IsOptional()
    middleName?: string;

    @IsString()
    @IsNotEmpty()
    lastName!: string;

    @IsString()
    @IsOptional()
    fullNameAmharic?: string;

    @IsOptional()
    @Transform(sanitizeEmpty)
    @IsInt()
    age?: number;

    @IsOptional()
    @Transform(sanitizeEmpty)
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

    @IsOptional()
    @Transform(sanitizeEmpty)
    @IsInt()
    numberOfChildren?: number = 0;

    @IsOptional()
    @Transform(sanitizeEmpty)
    @IsNumber()
    heightCm?: number;

    @IsOptional()
    @Transform(sanitizeEmpty)
    @IsNumber()
    weightKg?: number;

    @IsString()
    @IsOptional()
    complexion?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    whatsappNumber?: string;

    @IsString()
    @IsOptional()
    telegramUsername?: string;

    @IsString()
    @IsOptional()
    imoNumber?: string;

    @IsString()
    @IsOptional()
    emergencyContactName?: string;

    @IsString()
    @IsOptional()
    emergencyContactPhone?: string;

    @IsString()
    @IsOptional()
    emergencyContactRelation?: string;

    @IsString()
    @IsOptional()
    summary?: string;

    @IsString()
    @IsOptional()
    educationLevel?: string;

    @IsOptional()
    @Transform(sanitizeEmpty)
    @IsInt()
    yearsOfExperience?: number = 0;

    @IsBoolean()
    @IsOptional()
    hasOverseasExperience?: boolean = false;

    @IsString()
    @IsOptional()
    overseasDetails?: string;

    @IsString()
    @IsOptional()
    localExperienceDetails?: string;

    @IsString()
    @IsOptional()
    appliedPosition?: string;

    @IsString()
    @IsOptional()
    currentCountry?: string = 'Ethiopia';

    @IsString()
    @IsOptional()
    currentCity?: string;

    @IsString()
    @IsOptional()
    originRegion?: string;

    @IsString()
    @IsOptional()
    passportNumber?: string;

    @IsOptional()
    @Transform(sanitizeEmpty)
    @Type(() => Date)
    @IsDate()
    passportIssueDate?: Date;

    @IsOptional()
    @Transform(sanitizeEmpty)
    @Type(() => Date)
    @IsDate()
    passportExpiryDate?: Date;

    @IsString()
    @IsOptional()
    passportPlaceOfIssue?: string;

    @IsString()
    @IsOptional()
    nationalIdNumber?: string;

    @IsString()
    @IsOptional()
    cocStatus?: string = 'PENDING';

    @IsOptional()
    @Transform(sanitizeEmpty)
    @Type(() => Date)
    @IsDate()
    cocIssueDate?: Date;

    @IsString()
    @IsOptional()
    medicalStatus?: string = 'PENDING';

    @IsString()
    @IsOptional()
    policeClearanceStatus?: string = 'PENDING';

    @IsString()
    @IsOptional()
    visaStatus?: string = 'NO_VISA';

    @IsOptional()
    @Transform(sanitizeEmpty)
    @IsInt()
    expectedSalary?: number;

    @IsString()
    @IsOptional()
    expectedSalaryCurrency?: string = 'SAR';

    @IsOptional()
    @Transform(sanitizeEmpty)
    @IsInt()
    contractPeriodYears?: number = 2;

    @IsString()
    @IsOptional()
    photoUrl?: string;

    @IsString()
    @IsOptional()
    fullBodyPhotoUrl?: string;

    @IsString()
    @IsOptional()
    videoUrl?: string;

    @IsString()
    @IsOptional()
    passportCopyUrl?: string;

    @IsString()
    @IsOptional()
    medicalCertUrl?: string;

    @IsString()
    @IsOptional()
    cocCertUrl?: string;

    @IsBoolean()
    @IsOptional()
    isPublished?: boolean = true;

    @IsBoolean()
    @IsOptional()
    isFeatured?: boolean = false;

    @IsBoolean()
    @IsOptional()
    isAvailable?: boolean = true;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    skills?: string[] = [];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    languages?: string[] = [];
}

export class UpdateCandidateDto extends PartialType(CreateCandidateDto) { }

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
    cocStatus?: string;

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

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    limit?: number;
}
