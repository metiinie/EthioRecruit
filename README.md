# EthioHire — Production-Grade Multi-Tenant SaaS Recruitment Platform

**EthioHire** is an enterprise multi-tenant SaaS overseas recruitment platform connecting Ethiopian recruitment agencies, Gulf/Middle Eastern employers, and Ethiopian job seekers through a single cross-platform application.

---

## 📁 Repository Structure

```
EthioRecruit/
├── Backend/                 # NestJS + Fastify REST API & WebSockets
│   ├── prisma/              # Prisma 21-Model Database Schema & Seed Data
│   ├── src/
│   │   ├── auth/            # Dual-JWT Auth (Users & Agency Staff), OTP, Mode Switch
│   │   ├── users/           # User Profiles & Device Tokens
│   │   ├── candidates/      # Candidate Roster, Medical Status, Public Search
│   │   ├── vacancies/       # Job Postings, AllowInAppApplications Check, Public Search
│   │   ├── pipeline/        # ATS 5-Stage Kanban Board & $transaction Audit Trail
│   │   ├── applications/    # Job Applications Management
│   │   ├── inquiries/       # Candidate Inquiries Management
│   │   ├── agencies/        # Verified Agency Directory
│   │   ├── settings/        # Agency Rules, Medical Lock & Contact Channels
│   │   ├── staff/           # Agency Staff User Management
│   │   └── notifications/   # Push Delivery (Expo Push API) & In-App Inbox
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── Frontend/                # React Native + Expo Router v4 Cross-Platform App
│   ├── app/
│   │   ├── (auth)/          # Welcome, Login, Register, OTP (6-digit), Mode Select, Admin Login
│   │   ├── (tabs)/          # Dynamic 4-Slot Layout (Job Seeker ↔ Employer)
│   │   └── (admin)/         # Agency Staff Portal (Dashboard, Candidates, Vacancies, Pipeline)
│   ├── constants/           # Slate & Teal Design Tokens, Query Keys
│   ├── services/            # Axios API Client with Dual-JWT Interceptor & Services
│   └── stores/              # Zustand Auth & AdminAuth State Stores
│
└── README.md                # Platform Documentation & Setup Guide
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Docker & Docker Compose (for local PostgreSQL & Redis)

### 1. Environment Setup

Create `.env` file in `Backend/`:
```env
PORT=3000
DATABASE_URL="postgresql://ethiohire_user:ethiohire_pass_2026@localhost:5432/ethiohire_db?schema=public"
JWT_SECRET="ethiohire_user_jwt_secret_key_2026_super_secure"
ADMIN_JWT_SECRET="ethiohire_admin_jwt_secret_key_2026_agency_staff_secure"
REDIS_URL="redis://localhost:6379"
```

### 2. Database Migration & Seeding

```bash
# Start PostgreSQL & Redis containers
cd Backend
docker-compose up -d

# Run Prisma migrations & seed default categories
pnpm run prisma:migrate
pnpm run prisma:seed
```

### 3. Start Backend API

```bash
cd Backend
pnpm run start:dev
```
API running on `http://localhost:3000/v1`

### 4. Start Frontend (Expo Mobile / Web)

```bash
cd Frontend
pnpm run start
```

---

## 🔒 Multi-Tenant Architecture & Security

1. **Dual-JWT Protection**: Separate JWT secrets for Job Seekers/Employers (`JWT_SECRET`) and Agency Admins (`ADMIN_JWT_SECRET`).
2. **Row-Level Tenant Isolation**: `AgencyGuard` extracts `agencyId` from the Admin JWT payload and injects it into every request for tenant query scoping.
3. **Dynamic User Mode**: Single-account switching between `JOB_SEEKER` and `EMPLOYER` modes with dynamic tab bar navigation.
4. **5-Stage ATS Pipeline**: Candidate stage transitions (`APPLIED` ➔ `SHORTLISTED` ➔ `INTERVIEW` ➔ `SELECTED` ➔ `DEPLOYED`) with immutable `$transaction` audit logging.
