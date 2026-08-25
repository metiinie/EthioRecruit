
EthioHire
Engineering Blueprint & Full Technical Documentation
Version 1.0  ·  2026  ·  Confidential
Platform
Multi-tenant SaaS	Frontend
React Native + Expo	Backend
NestJS + Fastify	Database
PostgreSQL + Redis


1. Project Overview
EthioHire is a production-grade, multi-tenant SaaS recruitment platform that connects Ethiopian recruitment agencies, Gulf and Middle Eastern employers, and Ethiopian job seekers through a single cross-platform mobile application. The platform is built for Android, iOS, and web from a unified Expo codebase.

The agency sits at the centre of every transaction. Employers and job seekers never interact directly. All communication, hiring pipeline management, and document processing route through agency admins. This architecture protects all parties, ensures regulatory compliance, and keeps the agency in operational control throughout the entire hiring lifecycle.

1.1  Core Value Proposition
Stakeholder	Problem Solved	Key Feature Used
Recruitment Agency	Paper-heavy, phone-based process with no tracking	Admin dashboard: candidates, vacancies, pipeline, inquiries, staff
Gulf / ME Employer	No structured way to browse and filter verified candidates	Candidate browse with filters, profile detail, in-app inquiry
Ethiopian Job Seeker	No reliable source for verified overseas vacancies	Vacancy browse, in-app application, application tracker

1.2  What We Changed & Why
ADDED: Real-time chat (Socket.IO) — agencies and users need async messaging beyond inquiry forms.
ADDED: Bookmark/saved lists — users return to the app multiple times before acting; saving is essential retention.
ADDED: Notification inbox (in-app) — push notifications have no history; the inbox is the source of truth.
ADDED: Activity tracker for users — job seekers and employers need to track their inquiry / application status without contacting the agency.
ADDED: Staff management (Super Admin) — agencies have multiple recruiters; role-based access is required from day one.
ADDED: Anonymous view counters on candidates and vacancies — gives admin insight into demand before building full analytics.
CHANGED: S3 → Cloudinary — Cloudinary handles image optimization, video transcoding, and thumbnail generation automatically, reducing backend work.
CHANGED: Super Admin limited to agency-scoped role only in MVP — platform-level super admin (across all agencies) deferred to v2.
REMOVED: WorkspaceSwitcher from MVP — multi-workspace UI complexity not needed until v2 multi-tenancy expansion.

1.3  Platform Architecture Diagram
The platform follows a standard three-tier architecture with a clear separation between presentation, business logic, and persistence layers.

  ┌─────────────────────────────────────────────────────────┐
  │              EXPO (Universal Client)                    │
  │   Android  ·  iOS  ·  Web (via Expo Router)            │
  └────────────────────┬────────────────────────────────────┘
                       │ HTTPS / REST + Socket.IO
  ┌────────────────────▼────────────────────────────────────┐
  │          NestJS API  (Fastify adapter)                  │
  │  Auth · Users · Candidates · Vacancies · Pipeline      │
  │  Applications · Inquiries · Chat · Notifications       │
  └──────┬──────────────────┬──────────────────────────────┘
         │                  │
  ┌──────▼──────┐  ┌───────▼───────┐  ┌────────────────┐
  │ PostgreSQL  │  │  Redis Cache  │  │  Cloudinary    │
  │ (Neon DB)   │  │  + BullMQ     │  │  (Media CDN)   │
  └─────────────┘  └───────────────┘  └────────────────┘


2. Technology Stack — Detailed Rationale
2.1  Frontend
Package	Version	Role	Why This Choice
React Native	via Expo SDK 53	UI rendering	Single codebase for iOS, Android, and Web. New Architecture stable in 2026 — no performance objection remains.
Expo	SDK 53 / Expo Router v4	Build system + routing	File-based routing mirrors Next.js. OTA updates via EAS without App Store review. Best-in-class DX for RN teams.
TypeScript	5.x	Type safety	Mandatory across entire codebase. Types shared between front and back via a shared /types package.
Expo Router v4	v4	Navigation + deep links	File-based routing, layouts, typed routes, and deep-link support out of the box.
TanStack Query	v5	Server state	Handles all API calls, caching, background re-fetch, pagination, and optimistic updates. Replaces imperative Axios calls.
Zustand	v5	Client state	Auth state, JWT token, active mode (job seeker / employer), theme. Tiny footprint, no providers, MMKV persistence.
React Hook Form + Zod	latest	Forms + validation	RHF for form state. Zod schemas colocated with DTOs — validated before any API call.
NativeWind	v4	Styling	Tailwind CSS utility classes in React Native. Consistent with the Tailwind mental model.
Expo SecureStore / MMKV	latest	Storage	SecureStore for JWT. MMKV (via Zustand middleware) for persisted UI state — 30× faster than AsyncStorage.
Expo Notifications	latest	Push notifications	Expo Push API wrapping FCM (Android) and APNs (iOS). Tokens stored per-device in the DB.
Socket.IO Client	v4	Real-time chat	Matches the server-side Socket.IO gateway. Auto-reconnect, namespaces, and rooms built in.
Expo Image	latest	Images	Progressive loading, Cloudinary URL transforms, placeholder blur hash, memory caching.
React Native Reanimated	v3	Animations	Worklet-based animations on the UI thread. Used for pipeline stage transitions and card interactions.
Sentry RN SDK	latest	Error tracking	Crash reports, session replays, and performance traces routed to Sentry.io.

2.2  Backend
Package	Version	Role	Why This Choice
NestJS	v11	Framework	Opinionated, modular, DI-first. Official Fastify adapter, native Prisma support, WebSockets, BullMQ, OpenAPI generation.
Fastify	v5	HTTP adapter	Replaces Express. Benchmarks show 2–3× higher throughput. Schema-based validation with AJV included.
TypeScript	5.x	Type safety	Strict mode. DTOs with class-validator on every inbound request. Shared types package with frontend.
Prisma ORM	v6	Database access	Schema-first, fully-typed queries, excellent migration tooling. Prisma Accelerate connection pooling in production.
class-validator + class-transformer	latest	Request validation	ValidationPipe(whitelist, forbidNonWhitelisted) on global scope. No unvalidated data enters handlers.
@nestjs/jwt + @nestjs/passport	latest	Auth	Dual-JWT system: User JWT (30d) signed with JWT_SECRET; Admin JWT (8h) signed with ADMIN_JWT_SECRET. Non-interchangeable.
@nestjs/throttler	v6	Rate limiting	10 auth attempts per 15 min. Custom limits per route group.
@nestjs/bullmq	latest	Background jobs	OTP expiry cleanup, vacancy auto-expiry, push notification batching. Backed by Redis.
@nestjs/websockets + Socket.IO	latest	Real-time chat	ChatGateway handles conversation rooms. Auth guard on WebSocket handshake.
@fastify/multipart	latest	File uploads	Streams multipart uploads directly to Cloudinary. No temp files on disk.
Cloudinary SDK	v2	Media CDN	Auto-thumbnail for videos, image optimisation, folder-scoped uploads per agency/candidate.
SMSEthiopia HTTP API	—	OTP delivery	Ethiopian phone numbers. 6-digit OTP, 5-minute TTL, stored in otp_verifications table.
expo-server-sdk	latest	Push delivery	Expo Push API with receipt validation. Stale tokens pruned automatically.
@nestjs/swagger	latest	API docs	OpenAPI spec auto-generated from DTOs. Served at /api/docs in staging.
Pino (via NestJS logger)	latest	Logging	Structured JSON logs. AsyncLocalStorage for per-request trace ID injection.
Helmet + CORS	latest	Security headers	Applied globally on the Fastify instance.
Sentry NestJS SDK	latest	Error tracking	Captures unhandled exceptions, slow transactions, and DB query traces.
bcryptjs	latest	Password hashing	Salt rounds = 12. Used for both User and AdminUser passwords.

2.3  Data Layer
Service	Version / Tier	Role	Configuration Note
PostgreSQL	Neon Serverless / v16	Primary relational store	Prisma Accelerate for connection pooling. Neon branching for staging vs production.
Redis	Upstash Serverless	Cache + queue backend	Zustand/TQ query cache, Socket.IO adapter, BullMQ queues. Upstash for serverless-safe connections.
BullMQ	v5	Job queue	Queues: otp-cleanup, vacancy-expiry, notification-batch, media-processing. Redis-backed.

2.4  Deployment & DevOps
Tool	Role	Details
Docker	Containerisation	Multi-stage Dockerfile: builder → runner (node:20-slim). API + Redis via docker-compose locally.
GitHub Actions	CI/CD	On push to main: lint → test → build → push Docker image → deploy. Separate workflow for EAS mobile builds.
Cloudflare	CDN + DDoS protection	Proxies traffic to the API server. SSL termination. WAF rules for auth endpoints. Workers for edge caching.
EAS Build	Mobile CI	Expo Application Services builds the native iOS/Android binaries and submits to stores.
EAS Update	OTA updates	JS bundle updates pushed without App Store review. Instant rollout for non-native changes.
Sentry	Observability	Error tracking, session replays, performance monitoring, release tracking. Both mobile and API instrumented.


3. User Roles & Authentication System
3.1  Role Model
EthioHire has two completely separate authentication contexts that never cross. This is enforced at the JWT level, not just at the UI level.

Role	Auth Method	JWT Signer	Expiry	Scope
Job Seeker	Phone + Password + OTP	JWT_SECRET	30 days	Browse vacancies, apply, track applications, chat, save
Employer	Same account as Job Seeker (mode toggle)	JWT_SECRET	30 days	Browse candidates, send inquiries, save, chat
Agency Admin	Email + Password	ADMIN_JWT_SECRET	8 hours	Full agency dashboard: candidates, vacancies, pipeline, staff, settings
Agency Super Admin	Email + Password	ADMIN_JWT_SECRET	8 hours	All Admin permissions + invite/manage staff accounts

3.2  Dual-Mode Account (Job Seeker ↔ Employer)
Job Seeker and Employer are not separate accounts. One phone number = one User record. The active mode is stored in the preferredMode field and toggled via PUT /auth/mode. The JWT carries the mode claim, and the tab bar re-renders based on it. This is the same pattern as LinkedIn's Creator Mode — same identity, different feed.

Rule: The same JWT is valid for both modes. The mode claim in the token determines which home feed and which tabs are visible.
Rule: An employer browsing candidate profiles is using the same account as a job seeker browsing vacancies. The UX is separated by the toggle, not by separate logins.

3.3  JWT Structure
// User JWT payload (signed with JWT_SECRET, 30-day expiry)
{
  "sub": "user-uuid",
  "type": "user",
  "mode": "JOB_SEEKER" | "EMPLOYER",
  "iat": 1234567890,
  "exp": 1234567890
}

// Admin JWT payload (signed with ADMIN_JWT_SECRET, 8-hour expiry)
{
  "sub": "admin-uuid",
  "type": "admin",
  "role": "SUPER_ADMIN" | "ADMIN" | "STAFF",
  "agency_id": "org-uuid",
  "iat": 1234567890,
  "exp": 1234567890
}

Security rule: A User JWT passed to an Admin endpoint returns 401. An Admin JWT passed to a User endpoint returns 401.
The AgencyGuard middleware extracts agency_id from the Admin JWT and injects req.agencyId — every single DB query in the admin context adds WHERE agencyId = req.agencyId.

3.4  OTP Verification Flow
1.User submits phone number → POST /auth/otp/send
2.Backend generates a 6-digit code, stores in otp_verifications (5-minute TTL)
3.SMSEthiopia HTTP API delivers the OTP via SMS to the Ethiopian phone number
4.User enters code → POST /auth/otp/verify
5.Backend validates: correct code, not expired (expiresAt), not already consumed (verified flag)
6.On success: sets phoneVerified = true on User record, returns User JWT

Rate limiting: @nestjs/throttler enforces 10 OTP requests per 15 minutes per IP on /auth/otp/send.
BullMQ job: A scheduled job runs every 10 minutes to DELETE expired, unconsumed OTP records from the otp_verifications table.


4. Database Schema — 21 Prisma Models
All data is partitioned by organizationId (agencyId). No cross-agency data is ever returned. The schema uses UUIDs as primary keys throughout.

4.1  Organisation & Tenancy
Organization (tenant root)
Field	Type	Purpose
id	UUID (PK)	Primary key
name	String	Agency or company name
type	Enum: AGENCY | GULF_EMPLOYER	Discriminates agency vs employer org
licenseNumber	String?	Government-issued recruitment licence
logoUrl, bannerUrl	String?	Cloudinary URLs for branding
phone, email	String?	Primary contact information
country, city, address	String?	Office location
isVerified	Boolean	Government verification status badge
isActive	Boolean	Soft-delete flag — false hides from all public queries

OrganizationMember
Links a User to an Organization with a role. A user can be a member of multiple organizations (v2 feature — MVP: one per user).
Field	Type	Purpose
organizationId	UUID (FK)	References Organization
userId	UUID (FK)	References User
role	Enum	OWNER | ADMIN | RECRUITER | AGENT | HIRING_MANAGER | VIEWER
isActive	Boolean	Membership active status

@@unique([organizationId, userId])  // prevents duplicate memberships

AgencyContactChannel
Multiple contact methods per agency. Used to generate deep-link CTA buttons in the mobile app.
Field	Type	Purpose
channelType	Enum	whatsapp | telegram | imo | phone | email
channelValue	String	Phone number, handle, or email address
isPrimary	Boolean	Whether this is the agency's preferred contact method

AgencySetting
One-to-one with Organization. Toggle-based preferences that control app-level behaviour for this agency.
Setting	Default	Effect
allowInAppApplications	true	If false, job seekers see only external contact buttons — no Apply form.
showSalaryInVacancies	true	If false, salary is hidden from vacancy cards and detail screens.
notifyAdminOnNewInquiry	true	Controls whether a push notification fires to admins on new inquiry/application.

4.2  Mobile App Users
User
Field	Type	Notes
id	UUID (PK)	—
firstName, lastName	String	Display name
phone	String (unique)	Primary login identifier. Target for OTP.
email	String? (unique)	Optional. Can be used for login in v2.
password	String	Bcrypt hash (salt rounds = 12).
preferredMode	Enum: JOB_SEEKER | EMPLOYER	Active UI mode. Switchable anytime.
profilePhoto	String?	Cloudinary URL.
phoneVerified	Boolean	Set true after OTP verification. Required to access protected endpoints.
isPlatformAdmin	Boolean	Reserved for platform-level operations (v2). Not exposed in MVP.

Relations: jobseekerProfile (1-to-1), employerProfile (1-to-1), applications[], inquiries[], conversations[], notifications[], savedCandidates[], savedVacancies[], deviceTokens[]

JobseekerProfile (1-to-1 with User)
Field	Type	Notes
bio	String?	Free-text self-description.
currentCountry, city	String?	Where the job seeker currently lives.
educationLevel	String?	E.g. "High School", "Bachelor's Degree".
yearsOfExperience	Int	Default 0.
hasOverseasExperience	Boolean	Flag for previous overseas employment.
preferredDestinationCountries	String[]	Countries the seeker is willing to work in.
availabilityDate	DateTime?	When the seeker is available to deploy.
skills	JSON	Array of { skill_name: string, proficiency_level: string }.
languages	JSON	Array of { language: string, proficiency: string }.

EmployerProfile (1-to-1 with User)
Field	Type	Notes
companyName	String?	Optional — individual families may not have a company name.
companyType	Enum	individual_family | corporate
country, city	String?	Employer's location (used for matching and display).

DeviceToken
Stores Expo push tokens. One user can register multiple devices (phone + tablet). Stale tokens are pruned after delivery failure.

OtpVerification
Field	Type	Notes
phone	String	Target phone number.
code	String	6-digit OTP (hashed before storage in production).
purpose	Enum	registration | password_reset | login
expiresAt	DateTime	5 minutes from creation.
verified	Boolean	Set true when consumed. Prevents replay.

4.3  Candidates Domain
Category (shared lookup)
Shared across all agencies. Examples: Housemaid, Nanny, Cook, Driver, Nurse, Security Guard, Caregiver. Seeded on database initialisation.

Candidate
Agency-managed profiles. NOT linked to a User account — agencies create these manually from physical documents.
Field	Type	Notes
agencyId	UUID (FK)	Tenant isolation key. All queries filter by this.
categoryId	UUID (FK)	Job category from the shared Category table.
firstName, lastName	String	Display name.
dateOfBirth	DateTime?	Used to calculate age for display.
gender	Enum	male | female | other
nationality	String	Default "Ethiopian".
religion	String?	Personal attribute — relevant to some employers.
maritalStatus	String?	Personal attribute.
summary	String?	Bio / description visible on profile.
educationLevel, yearsOfExperience	String / Int	Qualifications.
medicalStatus	Enum	pending | cleared | failed | expired
medicalClearanceDate, medicalExpiryDate	DateTime?	Medical validity window.
visaStatus	Enum	no_visa | in_process | approved | expired
photoUrl, videoUrl, videoThumbnail	String?	Cloudinary CDN URLs.
isFeatured	Boolean	Promoted to home feed. Set by admin.
isAvailable	Boolean	Excludes from browse if false.
isPublished	Boolean	Draft vs live. Only published candidates appear in browse.
skills, languages	String[]	Flat arrays for fast filtering.

@@index([agencyId, isAvailable, isPublished])
@@index([medicalStatus, categoryId, currentCountry])

CandidateDocument
File attachments per candidate. Types: passport, medical, coc (certificate of competency), contract. Status: pending | verified | rejected | expired. URL points to Cloudinary.

CandidateView
Anonymous view counter. One row per candidate, incremented on every GET /candidates/:id call. Used for admin analytics — no user data stored.

4.4  Job Vacancies Domain
JobVacancy
Field	Type	Notes
agencyId	UUID (FK)	Tenant isolation.
categoryId	UUID (FK)	Job category.
title, description	String	Vacancy headline and full description.
requirements	String[]	Array of requirement strings.
country, city	String	Destination country and city for the job.
employerType	Enum	individual_family | corporate
employerName, showEmployerName	String? / Boolean	Employer identity — optionally displayed to job seekers.
salaryMin, salaryMax, salaryCurrency	Decimal? / String	Salary range. Default currency: USD.
contractPeriodYears	Int	Default 2 years.
workingHoursPerDay, workingDaysPerWeek	Int?	Work schedule.
visaSponsorship	Boolean	Benefits: agency covers visa cost.
accommodationProvided, mealsProvided	Boolean	Benefits.
transportationProvided, healthInsurance	Boolean	Benefits.
annualLeaveDays	Int	Default 30.
genderPreference	Enum	any | male | female
ageMin, ageMax, experienceRequired	Int? / String?	Applicant requirements.
vacanciesCount	Int	Number of open positions.
applicationDeadline	DateTime?	Optional cutoff date — auto-expires the vacancy.
status	Enum	DRAFT → ACTIVE → PAUSED | CLOSED | EXPIRED
publishedAt	DateTime?	Set when status moves to ACTIVE.

VacancyView
Same pattern as CandidateView. Incremented on GET /vacancies/:id.

4.5  Applications & Inquiries
Application (Job Seeker → Vacancy)
Field	Type	Notes
vacancyId	UUID (FK)	Target vacancy.
userId	UUID (FK)	The applying job seeker.
status	Enum (11 stages)	APPLIED → UNDER_REVIEW → SHORTLISTED → SENT_TO_EMPLOYER → EMPLOYER_REVIEW → INTERVIEW → SELECTED → DOCUMENTATION → DEPLOYED | REJECTED | CANCELLED
coverLetter	String?	Optional cover letter text.
additionalNotes	String?	User-facing notes.
reviewerNotes	String?	Admin-only internal notes (never shown to user).

@@unique([vacancyId, userId])  // prevents duplicate applications

CandidateInquiry (Employer → Candidate)
Field	Type	Notes
candidateId	UUID (FK)	Target candidate profile.
userId	UUID (FK)	The inquiring employer.
message	String	Employer's message to the agency.
preferredContactChannel	Enum	whatsapp | telegram | imo | phone | email
purpose	String?	Hiring intent description.
requiredStartDate	DateTime?	When the employer needs the worker.
status	Enum	NEW → READ → RESPONDED → CLOSED
adminResponse	String?	Agency's response to the inquiry.

4.6  Bookmarks
SavedCandidate and SavedVacancy: simple junction tables between User and the target item. @@unique constraint on [userId, candidateId] and [userId, vacancyId] prevents duplicates. No soft delete — DELETE removes the record.

4.7  Hiring Pipeline
HiringPipeline
Tracks a single candidate's journey through the full hiring process for a specific employer engagement.
Field	Type	Notes
agencyId	UUID (FK)	Tenant isolation.
candidateId	UUID (FK)	The candidate being processed.
employerName, employerCountry, employerCity, employerContact	String?	Employer details for this specific pipeline (may differ from the vacancy).
currentStage	Enum (10 stages)	APPLIED → UNDER_REVIEW → SHORTLISTED → SENT_TO_EMPLOYER → EMPLOYER_REVIEW → INTERVIEW → SELECTED → DOCUMENTATION → DEPLOYED
isActive	Boolean	False when pipeline ends (deployed, cancelled, or candidate withdrew).
expectedDeploymentDate, actualDeploymentDate	DateTime?	Timeline tracking.
outcome	Enum?	successful | cancelled | candidate_withdrew

PipelineStageHistory
Audit log. Every stage transition creates a new row with enteredAt, exitedAt, durationDays, notes, and updatedBy (admin UUID). Never deleted — immutable audit trail.

PipelineDocument
Documents attached at pipeline level: offer_letter, contract, medical_report, visa, flight_ticket. Each has a Cloudinary URL and an upload date.

4.8  Conversations & Messaging
Conversation
One conversation per User per Organization. Created lazily on first contact — either when the user taps a contact button in the app or when an admin initiates.

Message
Field	Type	Notes
conversationId	UUID (FK)	Parent conversation.
senderType	Enum	user | agency — discriminates who sent the message.
senderId	UUID	User UUID or AdminUser UUID depending on senderType.
text	String?	Message content. Nullable if attachmentUrl is present.
attachmentUrl	String?	Cloudinary URL for file attachment.
isRead	Boolean	Read receipt. Set true when the recipient opens the conversation.

Real-time delivery: Socket.IO ChatGateway. Users join room "conversation:{id}" on WebSocket connect. New messages emit to the room.
Persistence: Every message is saved to PostgreSQL before emitting — no in-memory-only messages.

4.9  Notifications
Notification (in-app inbox)
Field	Type	Notes
userId	UUID (FK)	Target user.
title, body	String	Notification content (mirrors push notification content).
data	JSON?	Navigation payload — e.g. { screen: "ApplicationDetail", id: "abc" }.
isRead	Boolean	Marked true when user opens the notification.
Every push notification also creates a Notification row. This gives users a persistent inbox even if the push notification was dismissed.


5. API Endpoint Reference
Base URL: https://api.ethiohire.com/v1. All responses follow { data, meta?, error? } envelope. All protected endpoints require Authorization: Bearer <token>.

5.1  Authentication
Method	Endpoint	Auth	Description
POST	/auth/register	Public	Create user account → send OTP via SMSEthiopia
POST	/auth/login	Public	Phone + password → return User JWT
POST	/auth/otp/send	Public	Generate + send 6-digit OTP (rate limited)
POST	/auth/otp/verify	Public	Validate OTP → mark phone verified → return JWT
PUT	/auth/mode	UserJwt	Switch preferredMode → return new JWT with updated mode claim
POST	/auth/refresh	UserJwt (expired ok)	Issue new JWT using refresh token stored in HttpOnly cookie
POST	/admin/auth/login	Public	Admin email + password → return Admin JWT (8h)

5.2  User Profile
Method	Endpoint	Auth	Description
GET	/users/me	UserJwt	Return user + jobseekerProfile + employerProfile
PUT	/users/me/jobseeker-profile	UserJwt	Upsert job seeker profile fields
PUT	/users/me/employer-profile	UserJwt	Upsert employer profile fields
POST	/users/me/device-token	UserJwt	Register or update Expo push token for this device
DELETE	/users/me/device-token	UserJwt	Remove push token (on logout)

5.3  Candidates (Public)
Method	Endpoint	Auth	Description
GET	/candidates	UserJwt	Paginated list. Filters: category, gender, medicalStatus, country, search (name). Returns only isPublished=true, isAvailable=true.
GET	/candidates/:id	UserJwt	Full candidate detail. Increments CandidateView counter.
POST	/candidates/:id/inquiry	UserJwt (Employer mode)	Submit employer inquiry. Creates CandidateInquiry. Triggers push notification to agency admins.

5.4  Candidates (Admin)
Method	Endpoint	Auth	Description
GET	/admin/candidates	AdminJwt	List all agency candidates (all statuses, paginated). Scoped to req.agencyId.
POST	/admin/candidates	AdminJwt	Create new candidate profile.
PUT	/admin/candidates/:id	AdminJwt	Update candidate fields.
DELETE	/admin/candidates/:id	AdminJwt	Soft delete (sets isAvailable=false, isPublished=false). Hard delete requires Super Admin.
POST	/admin/candidates/:id/photo	AdminJwt	Multipart upload → Cloudinary → save photoUrl.
POST	/admin/candidates/:id/video	AdminJwt	Multipart upload → Cloudinary → save videoUrl + auto-generated videoThumbnail.
PUT	/admin/candidates/:id/medical	AdminJwt	Update medicalStatus, medicalClearanceDate, medicalExpiryDate.
POST	/admin/candidates/:id/documents	AdminJwt	Upload a candidate document (passport, medical, coc, contract).

5.5  Vacancies (Public)
Method	Endpoint	Auth	Description
GET	/vacancies	UserJwt	Paginated list. Filters: category, country, salaryMin, salaryMax, status=ACTIVE only, visaSponsorship, accommodationProvided.
GET	/vacancies/:id	UserJwt	Full vacancy detail. Increments VacancyView counter.
POST	/vacancies/:id/apply	UserJwt (Seeker mode)	Create Application (status=APPLIED). Unique constraint prevents duplicate. Triggers push to agency admins.

5.6  Vacancies (Admin)
Method	Endpoint	Auth	Description
GET	/admin/vacancies	AdminJwt	List all agency vacancies (all statuses). Scoped to agencyId.
POST	/admin/vacancies	AdminJwt	Create vacancy (default status=DRAFT).
PUT	/admin/vacancies/:id	AdminJwt	Update vacancy fields.
PUT	/admin/vacancies/:id/publish	AdminJwt	Set status=ACTIVE, set publishedAt timestamp.
PUT	/admin/vacancies/:id/pause	AdminJwt	Set status=PAUSED (hidden from browse, not deleted).
DELETE	/admin/vacancies/:id	AdminJwt	Soft delete (sets status=CLOSED).

5.7  Applications (Admin)
Method	Endpoint	Auth	Description
GET	/admin/applications	AdminJwt	List all applications for this agency's vacancies. Filterable by status, vacancyId.
GET	/admin/applications/:id	AdminJwt	Application detail with applicant profile.
PUT	/admin/applications/:id/status	AdminJwt	Advance or set application status. Triggers push notification to applicant.

5.8  Inquiries (Admin)
Method	Endpoint	Auth	Description
GET	/admin/inquiries	AdminJwt	List employer inquiries for this agency's candidates. Filter by status.
GET	/admin/inquiries/:id	AdminJwt	Inquiry detail with employer profile.
PUT	/admin/inquiries/:id/respond	AdminJwt	Set adminResponse text + change status to RESPONDED. Triggers push to employer.
PUT	/admin/inquiries/:id/close	AdminJwt	Set status=CLOSED.

5.9  Bookmarks, Activity, Chat, Notifications
Method	Endpoint	Auth	Description
GET/POST/DELETE	/saved/candidates	UserJwt	List / add / remove saved candidates.
GET/POST/DELETE	/saved/vacancies	UserJwt	List / add / remove saved vacancies.
GET	/activity/applications	UserJwt	Job seeker's application history with current status.
GET	/activity/inquiries	UserJwt	Employer's inquiry history with current status.
GET	/conversations	UserJwt	List the user's conversation threads with agencies.
GET	/conversations/:id/messages	UserJwt	Paginated message history for a conversation.
GET	/notifications	UserJwt	User's in-app notification inbox.
PUT	/notifications/:id/read	UserJwt	Mark a notification as read.
PUT	/notifications/read-all	UserJwt	Mark all as read.

5.10  Pipeline & Staff (Admin)
Method	Endpoint	Auth	Description
GET	/admin/pipeline	AdminJwt	List all active pipelines for this agency. Grouped by currentStage for Kanban view.
POST	/admin/pipeline	AdminJwt	Create new pipeline entry (select candidate + fill employer details).
PUT	/admin/pipeline/:id/stage	AdminJwt	Advance to next stage → log PipelineStageHistory → calculate durationDays.
POST	/admin/pipeline/:id/documents	AdminJwt	Attach a document to a pipeline stage.
GET	/admin/staff	AdminJwt (Super)	List all staff members for this agency.
POST	/admin/staff	AdminJwt (Super)	Invite new staff member (creates AdminUser with role=STAFF).
PUT	/admin/staff/:id	AdminJwt (Super)	Update staff role or deactivate.

5.11  Settings & Agencies
Method	Endpoint	Auth	Description
GET	/admin/settings	AdminJwt	Get agency settings object.
PUT	/admin/settings	AdminJwt	Update agency settings toggles.
GET	/admin/settings/channels	AdminJwt	List agency contact channels.
POST	/admin/settings/channels	AdminJwt	Add a new contact channel.
PUT	/admin/settings/channels/:id	AdminJwt	Update a contact channel.
DELETE	/admin/settings/channels/:id	AdminJwt	Remove a contact channel.
GET	/agencies	UserJwt	Public agency directory. Returns verified agencies with logo and contact info.


6. Core Business Logic & Workflows
6.1  Contact Channel Deep-Links
Contact buttons on candidate profiles and vacancy detail screens open the user's native app for the selected channel. All contacts reach the agency, not the candidate or employer directly.

Channel	Deep-Link Format	Pre-composed Message (Candidate)	Pre-composed Message (Vacancy)
Phone Call	tel:{phone}	—	—
WhatsApp	https://wa.me/{phone}?text={encoded}	I am interested in candidate {name} (ID: {id}) on EthioHire.	I want to apply for {title} posted on EthioHire. Reference: {id}.
Telegram	https://t.me/{handle}	—	—
IMO	imo://{phone}	—	—

6.2  Media Upload Pipeline
7.Admin selects photo or video in the app.
8.App sends a POST multipart/form-data request to /admin/candidates/:id/photo (or /video).
9.@fastify/multipart streams the file to the backend without writing to disk.
10.MediaService pipes the stream to Cloudinary SDK upload() with folder: agencies/{agencyId}/candidates/{candidateId}/.
11.Cloudinary returns: secure_url (photo) or secure_url + eager[0].secure_url (video thumbnail).
12.Backend saves the URL(s) to the Candidate record in PostgreSQL.
13.App receives the updated Candidate object and re-renders the profile preview.

Video processing: Cloudinary runs an eager transformation to generate a thumbnail at upload time. The thumbnail is available immediately — no polling required.
Folder structure: agencies/{agency_id}/candidates/{candidate_id}/photo.jpg and /intro.mp4

6.3  Push Notification Events
Trigger	Recipient	Message Template
New in-app application submitted	All AdminUsers for the agency	"New application from {name} for {vacancyTitle}"
Application status changed	The applicant (User)	"Your application for {vacancyTitle} has been updated to {status}"
New candidate inquiry submitted	All AdminUsers for the agency	"New inquiry from {employerName} about {candidateName}"
Inquiry responded by admin	The inquiring employer (User)	"The agency has responded to your inquiry about {candidateName}"
Pipeline stage advanced	Logged only — no push in MVP	—
New message received	The conversation recipient	"New message from {senderName}"

Delivery mechanism: expo-server-sdk sends to all registered DeviceToken records for the recipient. Tokens that return DeviceNotRegistered errors are pruned immediately.
BullMQ queue: Push notifications are dispatched via a notification-batch queue to avoid blocking the HTTP response cycle.

6.4  Multi-Tenancy Isolation Rules
14.Every Admin JWT carries agency_id in its payload.
15.AgencyGuard middleware (applied to all /admin/* routes) extracts agency_id and injects it as req.agencyId.
16.Every database query in admin handlers appends WHERE agencyId = req.agencyId.
17.PostgreSQL Row-Level Security policies enforce isolation as a secondary layer — a query without agencyId returns zero rows, not an error.
18.An admin from Agency A cannot read, write, or delete data from Agency B regardless of what they pass in the request body.

6.5  Vacancy Auto-Expiry
A BullMQ scheduled job (vacancy-expiry) runs daily at 00:00 UTC. It queries all vacancies with status=ACTIVE where applicationDeadline < NOW() and updates their status to EXPIRED. Expired vacancies are hidden from the public browse endpoint automatically.

6.6  AgencySetting Guard
Before creating an Application, the API checks AgencySetting.allowInAppApplications for the owning agency. If false, the endpoint returns 403 with message: "This agency accepts applications via direct contact only." This allows agencies to gate in-app applications without platform intervention.


7. Frontend — Screen Inventory
7.1  Tab Structure (Dynamic by Mode)
The tab bar is the same 4-slot shell for all regular users. Labels, icons, and content change based on preferredMode. The Admin section is a completely separate tab layout with its own auth guard.

Tab Index	Job Seeker Mode	Employer Mode	Admin (always)
Tab 1	Home (featured vacancies)	Home (featured candidates)	Dashboard
Tab 2	Browse Jobs	Browse Candidates	Candidates
Tab 3	My Applications	My Inquiries	Vacancies
Tab 4	Profile + Settings	Profile + Settings	Pipeline

Messages, Notifications, Activity, Saved, and Agencies are accessible via the Profile screen or via deep links — they do not occupy permanent tab slots.
The Admin tab group (/app/(admin)/) is mounted separately. An admin JWT is required to enter. Regular users are redirected to the main app if they navigate to an admin route.

7.2  Auth Screens (app/(auth)/)
Screen	Route	Description
Welcome / Splash	/welcome	App branding, Sign In and Create Account buttons. Link to Admin login.
Login	/login	Phone + password. Forgot password link. Form validated with Zod.
Register	/register	First name, last name, phone, password, confirm password. Triggers OTP on submit.
OTP Verify	/otp	Numeric 6-digit input with countdown timer. Resend OTP after 60 seconds.
Mode Select	/mode-select	Post-registration screen. Two large cards: "I'm hiring" and "I'm looking for work". Sets preferredMode.
Admin Login	/admin/login	Separate screen not linked from user auth. Email + password. Routes to Admin Dashboard on success.

7.3  Regular User Screens
Screen	Route	Mode	Description
Home	/(tabs)/	Both	Featured vacancies (seeker) or featured candidates (employer). Quick stats. Search bar.
Browse Jobs	/(tabs)/vacancies	Seeker	Infinite scroll vacancy list. Filters: country, category, salary, visa status. Search bar.
Browse Candidates	/(tabs)/candidates	Employer	Grid candidate list. Filters: category, language, medical status, experience. Search bar.
My Applications	/(tabs)/activity	Seeker	Application status tracker. 11-stage progress indicator per application.
My Inquiries	/(tabs)/activity	Employer	Inquiry status list (NEW / RESPONDED / CLOSED).
Profile	/(tabs)/profile	Both	User info, mode toggle (Seeker ↔ Employer), edit profile, settings, logout.
Candidate Detail	/candidate/[id]	Employer	Full profile: photo, video player, stats grid, skills, languages, bio, contact CTA bar.
Vacancy Detail	/vacancy/[id]	Seeker	Full vacancy: header, stats grid, benefits list, requirements, deadline, contact/apply CTA bar.
Saved Candidates	/saved/candidates	Employer	Bookmarked candidate cards. Same card as browse list.
Saved Vacancies	/saved/vacancies	Seeker	Bookmarked vacancy cards.
Messages	/messages	Both	Conversation list with agency threads. Unread badge count.
Chat	/messages/[id]	Both	Full-screen message thread. Bubble UI. Socket.IO real-time. File attachment support.
Notifications	/notifications	Both	In-app notification inbox. Tap to navigate to relevant screen.
Agency Directory	/agencies	Both	List of verified agencies with logo, name, contact buttons.
Inquiry Modal	Modal	Employer	Form: message, purpose, preferred contact, start date. Submitted via POST /candidates/:id/inquiry.
Apply Modal	Modal	Seeker	Optional cover letter. Submitted via POST /vacancies/:id/apply.

7.4  Admin Screens (app/(admin)/)
Screen	Route	Description
Admin Login	/admin/login	Email + password. Separate from user auth.
Dashboard	/admin	Metrics cards (candidates, pipeline, vacancies, new inquiries). Quick action buttons. Navigation list.
Candidate List	/admin/candidates	Searchable, filterable list with status badges. Published/Draft/Cleared/Pipeline filters.
Add Candidate (Step 1)	/admin/candidates/new	Photo upload, personal info, skill category, experience, languages.
Add Candidate (Step 2)	/admin/candidates/new/docs	Medical status, passport status, bio, video upload.
Add Candidate (Step 3)	/admin/candidates/new/publish	Review all fields, set visibility (Published / Draft), publish.
Edit Candidate	/admin/candidates/[id]/edit	Same 3-step form, pre-populated.
Vacancy List	/admin/vacancies	Vacancy cards with status chips (Live / Paused / Draft / Expired). Publish / Pause / Edit actions.
Post Vacancy	/admin/vacancies/new	Full vacancy form: title, country, category, salary, contract, benefits, requirements, deadline.
Edit Vacancy	/admin/vacancies/[id]/edit	Pre-populated vacancy form.
Application Review	/admin/applications	List with status filter. Tap to open detail. Status update dropdown.
Inquiry Inbox	/admin/inquiries	Employer inquiries. Tap to open detail. Reply form. Close action.
Pipeline Board	/admin/pipeline	Kanban columns by stage. Candidate cards draggable. Stage advancement button. Stage history log.
Pipeline Detail	/admin/pipeline/[id]	Step-by-step progress log, employer details, document attachments, advance stage button.
Staff Management	/admin/staff	List of staff with roles. Invite new staff (Super Admin only). Deactivate.
Settings	/admin/settings	Agency toggles (allowInAppApplications, showSalary, notifyAdmin). Manage contact channels.


8. State Management Architecture
8.1  State Separation Rule
TanStack Query owns all server state. Zustand owns all client state. They never overlap. This separation eliminates the entire category of "stale server data in global state" bugs.

State Type	Library	Examples
Server state (API data)	TanStack Query v5	Candidate list, vacancy detail, application status, conversation messages, notifications
Client state (UI / auth)	Zustand v5 + MMKV	JWT token, user object, preferredMode, active theme, admin auth state, chat connection
Form state	React Hook Form + Zod	All forms: register, add candidate, post vacancy, inquiry, apply
Navigation state	Expo Router	Route params, back history, deep-link parsing

8.2  Zustand Stores
authStore (persisted to MMKV)
interface AuthState {
  user: User | null
  token: string | null
  mode: "JOB_SEEKER" | "EMPLOYER"
  isPhoneVerified: boolean
  setAuth: (user: User, token: string) => void
  setMode: (mode: Mode) => void
  logout: () => void
}

adminAuthStore (persisted to MMKV)
interface AdminAuthState {
  admin: AdminUser | null
  adminToken: string | null
  agencyId: string | null
  role: "SUPER_ADMIN" | "ADMIN" | "STAFF" | null
  setAdminAuth: (admin: AdminUser, token: string) => void
  logout: () => void
}

chatStore (in-memory, not persisted)
interface ChatState {
  socket: Socket | null
  activeConversationId: string | null
  connect: (token: string) => void
  disconnect: () => void
  setActiveConversation: (id: string) => void
}

8.3  TanStack Query Key Conventions
// Candidates
['candidates', { page, category, gender, medicalStatus, search }]
['candidate', candidateId]

// Vacancies
['vacancies', { page, category, country, salaryMin, salaryMax }]
['vacancy', vacancyId]

// Admin
['admin', 'candidates', agencyId, { page, filters }]
['admin', 'pipeline', agencyId]
['admin', 'inquiries', agencyId, { status }]

// User-scoped
['me']
['activity', 'applications']
['activity', 'inquiries']
['saved', 'candidates']
['notifications']

8.4  API Service Layer (Axios + TanStack Query)
A typed Axios instance is created with baseURL and JWT interceptor. Service functions are thin wrappers used as queryFn and mutationFn. No state lives in the service layer itself.
// api.ts
const api = axios.create({ baseURL: process.env.EXPO_PUBLIC_API_URL })

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// candidateService.ts
export const getCandidates = (params: CandidateFilters) =>
  api.get<PaginatedResponse<Candidate>>("/candidates", { params }).then(r => r.data)

// Usage in component
const { data, isLoading, fetchNextPage } = useInfiniteQuery({
  queryKey: ["candidates", filters],
  queryFn: ({ pageParam = 1 }) => getCandidates({ ...filters, page: pageParam }),
  getNextPageParam: (last) => last.meta.nextPage,
})


9. Backend — Module Architecture
9.1  Module Tree
AppModule
├── PrismaModule          → Prisma client singleton, injected globally
├── ConfigModule          → @nestjs/config, .env validation with Joi
├── ThrottlerModule       → Rate limiting (10 auth reqs / 15 min)
├── BullModule            → BullMQ queues backed by Redis
│
├── AuthModule            → User register/login/OTP + Admin login
├── UsersModule           → User profile CRUD + device tokens
├── CandidatesModule      → Public browse + Admin CRUD + media upload
├── VacanciesModule       → Public browse + Admin CRUD + publish/pause
├── ApplicationsModule    → Job seeker applications + admin review
├── InquiriesModule       → Employer inquiries + admin respond
├── SavedModule           → Bookmark management (candidates + vacancies)
├── ActivityModule        → User-facing application/inquiry history
├── PipelineModule        → Hiring pipeline stages + stage history
├── ConversationsModule   → Chat threads + Socket.IO gateway
├── NotificationsModule   → Push delivery + in-app inbox
├── StaffModule           → AdminUser CRUD (Super Admin only)
├── SettingsModule        → Agency settings + contact channels
├── AgenciesModule        → Public agency directory
│
└── (Global Providers)
    ├── MediaService      → Cloudinary upload/transform wrapper
    ├── SmsEthiopiaService→ OTP SMS via SMSEthiopia HTTP API
    └── PushNotificationService → Expo Push API with receipt validation

9.2  Module File Structure Convention
src/
├── candidates/
│   ├── candidates.module.ts
│   ├── candidates.controller.ts      // Public endpoints
│   ├── candidates.service.ts         // Business logic
│   ├── admin-candidates.controller.ts// Admin endpoints
│   ├── dto/
│   │   ├── create-candidate.dto.ts
│   │   ├── update-candidate.dto.ts
│   │   └── candidate-filters.dto.ts
│   └── entities/
│       └── candidate.entity.ts       // Prisma model type re-export
├── common/
│   ├── guards/
│   │   ├── user-jwt.guard.ts
│   │   ├── admin-jwt.guard.ts
│   │   └── agency.guard.ts
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   └── agency-id.decorator.ts
│   ├── filters/
│   │   └── all-exceptions.filter.ts
│   └── interceptors/
│       └── logging.interceptor.ts
└── prisma/
    └── prisma.service.ts

9.3  Global Middleware Stack
19.Helmet — HTTP security headers applied to every response.
20.CORS — Allowed origins from CONFIG env var. Credentials: true for cookie-based refresh tokens.
21.ThrottlerGuard — Applied globally. Auth routes have tighter limits.
22.ValidationPipe — whitelist: true, forbidNonWhitelisted: true, transform: true on all DTOs.
23.AllExceptionsFilter — Catches all unhandled exceptions, formats them into the standard { error } envelope, logs via Pino, reports to Sentry.
24.LoggingInterceptor — Logs every request with traceId (AsyncLocalStorage), method, path, duration, and status code.


10. Deployment & DevOps
10.1  Docker — Backend
# Multi-stage Dockerfile
FROM node:20-slim AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["node", "dist/main.js"]

10.2  docker-compose (local dev)
services:
  api:
    build: .
    ports: ["3000:3000"]
    env_file: .env
    depends_on: [postgres, redis]
  postgres:
    image: postgres:16-alpine
    volumes: [pgdata:/var/lib/postgresql/data]
    environment:
      POSTGRES_DB: ethiohire
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
volumes:
  pgdata:

10.3  GitHub Actions — CI/CD Pipeline
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install pnpm + deps
      - name: Run lint (ESLint)
      - name: Run tests (Jest)
      - name: Run Prisma migrate (staging DB)
      - name: Build Docker image
      - name: Push to Docker Hub / GHCR
      - name: Deploy to production server (SSH + docker pull + restart)
      - name: Notify Sentry of new release

# .github/workflows/mobile.yml
on:
  push:
    branches: [main]

jobs:
  eas-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup EAS CLI
      - name: eas build --platform all --non-interactive
      - name: eas submit (on release tag)

10.4  Environment Variables
Variable	Where Used	Description
DATABASE_URL	API	Neon PostgreSQL connection string with Prisma Accelerate.
REDIS_URL	API	Upstash Redis connection string.
JWT_SECRET	API	Signs user JWTs. Min 64-character random string.
ADMIN_JWT_SECRET	API	Signs admin JWTs. Different secret, longer is better.
CLOUDINARY_CLOUD_NAME	API	Cloudinary account identifier.
CLOUDINARY_API_KEY	API	Cloudinary API key.
CLOUDINARY_API_SECRET	API	Cloudinary API secret.
SMS_ETHIOPIA_API_KEY	API	SMSEthiopia HTTP API key.
SENTRY_DSN	API + Mobile	Sentry project DSN.
EXPO_PUBLIC_API_URL	Mobile	Base URL for API calls from the mobile app.
EXPO_PUBLIC_SOCKET_URL	Mobile	Socket.IO server URL.
EXPO_PUBLIC_SENTRY_DSN	Mobile	Sentry DSN for mobile crash reporting.


11. Security Model
Control	Implementation	Details
Password hashing	bcryptjs	Salt rounds = 12. Applied to both User and AdminUser passwords.
JWT dual-secret	Two separate secrets	User JWT and Admin JWT signed with different secrets. Non-interchangeable — wrong secret = 401.
Request validation	class-validator + ValidationPipe	whitelist + forbidNonWhitelisted removes unknown fields before any handler runs.
Rate limiting	@nestjs/throttler	10 auth attempts per 15 minutes per IP. Separate limits on OTP and login endpoints.
CORS	@fastify/cors	Allowlist of origins. credentials: true for cookie-based refresh only.
Security headers	Helmet	Content-Security-Policy, X-Frame-Options, HSTS, X-XSS-Protection on every response.
Tenant isolation	AgencyGuard + RLS	JWT agency_id injected by guard. All admin queries filtered by agencyId. PostgreSQL RLS as second layer.
OTP replay prevention	verified flag + TTL	OTP marked consumed after first use. Expired codes rejected. BullMQ purges stale records.
Media access control	Cloudinary signed URLs	Private candidate documents served via short-lived signed URLs, not public links.
WebSocket auth	Socket.IO handshake guard	JWT validated on WebSocket connection. Invalid token = immediate disconnect.


12. Recommended Build Order (MVP)
This sequence ensures every feature is built on a working foundation. Backend always leads frontend for each feature slice.

Sprint	Backend	Frontend
1 — Foundation	Database schema, Prisma migrations, Docker setup, Prisma seeder (categories)	Expo project setup, NativeWind config, Zustand stores, Axios API client, Expo Router layout
2 — Auth	POST /auth/register, /login, /otp/*, /admin/auth/login. JWT guards. OTP via SMSEthiopia.	Welcome, Login, Register, OTP, Mode Select, Admin Login screens
3 — Candidates (Admin)	POST/GET/PUT /admin/candidates, photo/video upload to Cloudinary, medical update	Add Candidate 3-step wizard, Candidate List screen, photo/video upload UI
4 — Candidates (Public)	GET /candidates, /candidates/:id, CandidateView counter	Browse Candidates screen, Candidate Detail screen, contact CTA bar, deep-links
5 — Vacancies (Admin)	POST/GET/PUT /admin/vacancies, publish/pause actions	Post Vacancy form, Vacancy List admin screen
6 — Vacancies (Public)	GET /vacancies, /vacancies/:id, VacancyView counter, POST /vacancies/:id/apply	Browse Jobs screen, Vacancy Detail screen, Apply modal, Application status on Activity tab
7 — Inquiries & Pipeline	POST /candidates/:id/inquiry, /admin/inquiries, /admin/pipeline, stage advancement	Inquiry modal, Inquiry inbox admin, Pipeline Kanban board, Pipeline Detail screen
8 — Chat & Notifications	Socket.IO gateway, Conversation + Message models, push notification service	Messages list, Chat screen (Socket.IO client), Notifications inbox, push token registration
9 — Bookmarks & Activity	GET/POST/DELETE /saved/*, GET /activity/*	Saved screens, Activity tab (applications + inquiries)
10 — Staff & Settings	POST/GET/PUT /admin/staff (Super Admin), GET/PUT /admin/settings, contact channels	Staff management screen, Settings screen with toggles and channel management
11 — Polish & Launch	OpenAPI docs, Sentry setup, rate limit tuning, load testing, BullMQ jobs	EAS build config, deep-link testing, offline states, error boundaries, Sentry, app store assets


13. Repository Structure
13.1  Monorepo Layout
ethiohire/                        ← monorepo root (pnpm workspaces)
├── apps/
│   ├── mobile/                   ← Expo React Native app
│   │   ├── app/                  ← Expo Router file-based routes
│   │   │   ├── (auth)/           ← Auth screens (no tab bar)
│   │   │   ├── (tabs)/           ← Main user tabs
│   │   │   ├── (admin)/          ← Admin screens
│   │   │   └── _layout.tsx       ← Root layout with auth guard
│   │   ├── components/           ← Shared UI components
│   │   ├── stores/               ← Zustand stores
│   │   ├── services/             ← Axios service functions
│   │   ├── hooks/                ← Custom hooks (useAuth, useAdmin)
│   │   └── constants/            ← Colors, strings, query keys
│   └── api/                      ← NestJS backend
│       ├── src/
│       │   ├── auth/
│       │   ├── users/
│       │   ├── candidates/
│       │   ├── vacancies/
│       │   ├── applications/
│       │   ├── inquiries/
│       │   ├── saved/
│       │   ├── activity/
│       │   ├── pipeline/
│       │   ├── conversations/
│       │   ├── notifications/
│       │   ├── staff/
│       │   ├── settings/
│       │   ├── agencies/
│       │   ├── common/
│       │   └── prisma/
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── migrations/
│       │   └── seed.ts
│       ├── Dockerfile
│       └── docker-compose.yml
└── packages/
    └── types/                    ← Shared TypeScript types (front + back)
        ├── src/
        │   ├── user.types.ts
        │   ├── candidate.types.ts
        │   ├── vacancy.types.ts
        │   └── api.types.ts
        └── package.json

14. Glossary
Term	Definition
Agency	A licensed Ethiopian recruitment firm. The sole operator and moderator of all platform content.
Admin / Super Admin	AdminUser account linked to an Agency. Super Admin can manage staff; Admin cannot.
Regular User	Anyone who signs up via phone. Has one account and can switch between Job Seeker and Employer modes.
preferredMode	The active UI mode for a User: JOB_SEEKER or EMPLOYER. Stored in the User record, carried in the JWT.
Candidate	A worker profile created by an agency admin. Not a platform user — profiles are entered manually.
Vacancy	An overseas job opportunity posted by an agency. Status progresses from DRAFT → ACTIVE → EXPIRED/CLOSED.
Application	A job seeker's formal application for a specific vacancy. Has an 11-stage status progression.
Inquiry	An employer's request for information about a specific candidate. Has a 4-stage status progression.
Pipeline	The agency-managed process tracking a specific candidate's journey from selection to deployment. 10 stages.
HiringPipeline	A single pipeline instance: one candidate + one employer engagement. Multiple pipelines per candidate are possible.
PipelineStageHistory	Immutable audit log. One row per stage transition with timestamps and duration.
AgencyGuard	NestJS guard that extracts agency_id from Admin JWT and injects it into req for all admin queries.
Multi-tenancy	The ability of the platform to host multiple independent agencies with fully isolated data.
BullMQ	The job queue library backed by Redis. Handles OTP cleanup, vacancy expiry, and notification batching.
EAS	Expo Application Services. Handles cloud-based native app builds and App Store submissions.
OTA Update	Over-the-Air update via EAS Update. JS bundle changes pushed without going through the App Store.

End of Document
EthioHire Engineering Blueprint  ·  Confidential  ·  v1.0  ·  2026