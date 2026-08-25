import { UserMode } from './enums';

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string | null;
    preferredMode: UserMode;
    profilePhoto?: string | null;
    phoneVerified: boolean;
    createdAt: string;
    updatedAt: string;
    jobseekerProfile?: JobseekerProfile | null;
    employerProfile?: EmployerProfile | null;
}

export interface JobseekerProfile {
    id: string;
    userId: string;
    bio?: string | null;
    currentCountry?: string | null;
    city?: string | null;
    educationLevel?: string | null;
    yearsOfExperience: number;
    hasOverseasExperience: boolean;
    preferredDestinationCountries: string[];
    availabilityDate?: string | null;
    skills: { skill_name: string; proficiency_level: string }[];
    languages: { language: string; proficiency: string }[];
}

export interface EmployerProfile {
    id: string;
    userId: string;
    companyName?: string | null;
    companyType?: string | null;
    country?: string | null;
    city?: string | null;
}

export interface AdminUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    organizationId: string;
    organization?: {
        id: string;
        name: string;
        logoUrl?: string | null;
    };
}
