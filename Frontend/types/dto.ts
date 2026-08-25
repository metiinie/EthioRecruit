export interface CandidateFiltersDto {
    categoryId?: string;
    experienceYears?: number;
    religion?: string;
    gender?: string;
    minAge?: number;
    maxAge?: number;
    medicalStatus?: string;
    isAvailable?: boolean;
    page?: number;
    limit?: number;
}

export interface VacancyFiltersDto {
    categoryId?: string;
    country?: string;
    salaryMin?: number;
    status?: string;
    page?: number;
    limit?: number;
}

export interface CandidateDto {
    id: string;
    agencyId: string;
    categoryId: string;
    firstName: string;
    lastName: string;
    age?: number;
    gender?: string;
    religion?: string;
    experienceYears?: number;
    currentCountry?: string;
    photoUrl?: string;
    videoUrl?: string;
    videoThumbnail?: string;
    medicalStatus?: string;
    isAvailable: boolean;
    isPublished: boolean;
    skills?: string[];
    languages?: string[];
    category?: { id: string; name: string };
    agency?: { id: string; name: string; logoUrl?: string };
}

export interface JobVacancyDto {
    id: string;
    agencyId: string;
    categoryId: string;
    title: string;
    description: string;
    salaryMin?: number;
    salaryMax?: number;
    currency?: string;
    country?: string;
    experienceRequired?: number;
    genderPreference?: string;
    requirements?: string[];
    status: string;
    category?: { id: string; name: string };
    agency?: { id: string; name: string; logoUrl?: string };
}
