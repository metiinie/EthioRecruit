import { Gender, MedicalStatus, VisaStatus } from './enums';

export interface Category {
    id: string;
    name: string;
    description?: string | null;
    icon?: string | null;
}

export interface Candidate {
    id: string;
    agencyId: string;
    categoryId: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string | null;
    gender: Gender;
    nationality: string;
    religion?: string | null;
    maritalStatus?: string | null;
    summary?: string | null;
    educationLevel?: string | null;
    yearsOfExperience: number;
    currentCountry?: string | null;
    currentCity?: string | null;
    medicalStatus: MedicalStatus;
    medicalClearanceDate?: string | null;
    medicalExpiryDate?: string | null;
    visaStatus: VisaStatus;
    photoUrl?: string | null;
    videoUrl?: string | null;
    videoThumbnail?: string | null;
    isFeatured: boolean;
    isAvailable: boolean;
    isPublished: boolean;
    skills: string[];
    languages: string[];
    category?: Category;
    createdAt: string;
    updatedAt: string;
}

export interface CandidateDocument {
    id: string;
    candidateId: string;
    type: string;
    status: string;
    url: string;
    fileName?: string | null;
    notes?: string | null;
}
