import { VacancyStatus, ApplicationStatus, EmployerType, GenderPreference } from './enums';

export interface JobVacancy {
    id: string;
    agencyId: string;
    categoryId: string;
    title: string;
    description: string;
    requirements: string[];
    country: string;
    city?: string | null;
    employerType?: EmployerType | null;
    employerName?: string | null;
    showEmployerName: boolean;
    salaryMin?: number | null;
    salaryMax?: number | null;
    salaryCurrency: string;
    contractPeriodYears: number;
    workingHoursPerDay?: number | null;
    workingDaysPerWeek?: number | null;
    visaSponsorship: boolean;
    accommodationProvided: boolean;
    mealsProvided: boolean;
    transportationProvided: boolean;
    healthInsurance: boolean;
    annualLeaveDays: number;
    genderPreference: string;
    ageMin?: number | null;
    ageMax?: number | null;
    experienceRequired?: string | null;
    vacanciesCount: number;
    applicationDeadline?: string | null;
    status: VacancyStatus;
    publishedAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Application {
    id: string;
    vacancyId: string;
    userId: string;
    status: ApplicationStatus;
    coverLetter?: string | null;
    additionalNotes?: string | null;
    reviewerNotes?: string | null;
    vacancy?: JobVacancy;
    createdAt: string;
    updatedAt: string;
}

export { GenderPreference };
