// ============================================
// EthioHire — Shared Enums
// ============================================

export enum UserMode {
    JOB_SEEKER = 'JOB_SEEKER',
    EMPLOYER = 'EMPLOYER',
}

export enum AdminRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN',
    STAFF = 'STAFF',
}

export enum Gender {
    male = 'male',
    female = 'female',
    other = 'other',
}

export enum MedicalStatus {
    pending = 'pending',
    cleared = 'cleared',
    failed = 'failed',
    expired = 'expired',
}

export enum VisaStatus {
    no_visa = 'no_visa',
    in_process = 'in_process',
    approved = 'approved',
    expired = 'expired',
}

export enum VacancyStatus {
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    PAUSED = 'PAUSED',
    CLOSED = 'CLOSED',
    EXPIRED = 'EXPIRED',
}

export enum ApplicationStatus {
    APPLIED = 'APPLIED',
    UNDER_REVIEW = 'UNDER_REVIEW',
    SHORTLISTED = 'SHORTLISTED',
    SENT_TO_EMPLOYER = 'SENT_TO_EMPLOYER',
    EMPLOYER_REVIEW = 'EMPLOYER_REVIEW',
    INTERVIEW = 'INTERVIEW',
    SELECTED = 'SELECTED',
    DOCUMENTATION = 'DOCUMENTATION',
    DEPLOYED = 'DEPLOYED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED',
}

export enum InquiryStatus {
    NEW = 'NEW',
    READ = 'READ',
    RESPONDED = 'RESPONDED',
    CLOSED = 'CLOSED',
}

export enum PipelineStage {
    APPLIED = 'APPLIED',
    UNDER_REVIEW = 'UNDER_REVIEW',
    SHORTLISTED = 'SHORTLISTED',
    SENT_TO_EMPLOYER = 'SENT_TO_EMPLOYER',
    EMPLOYER_REVIEW = 'EMPLOYER_REVIEW',
    INTERVIEW = 'INTERVIEW',
    SELECTED = 'SELECTED',
    DOCUMENTATION = 'DOCUMENTATION',
    DEPLOYED = 'DEPLOYED',
    CANCELLED = 'CANCELLED',
}

export enum EmployerType {
    individual_family = 'individual_family',
    corporate = 'corporate',
}

export enum ContactChannelType {
    whatsapp = 'whatsapp',
    telegram = 'telegram',
    imo = 'imo',
    phone = 'phone',
    email = 'email',
}
