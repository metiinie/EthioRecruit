import { PrismaClient, Role, OrgMemberRole, PreferredMode } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const categories = [
    { name: 'Housemaid', description: 'General household cleaning and maintenance' },
    { name: 'Nanny', description: 'Childcare and babysitting services' },
    { name: 'Cook', description: 'Meal preparation and kitchen management' },
    { name: 'Driver', description: 'Personal or family driver services' },
    { name: 'Nurse', description: 'Healthcare and nursing assistance' },
    { name: 'Security Guard', description: 'Property and personal security' },
    { name: 'Caregiver', description: 'Elderly care and assistance' },
    { name: 'Gardener', description: 'Garden and landscape maintenance' },
    { name: 'Laundry Worker', description: 'Laundry and ironing services' },
    { name: 'Cleaner', description: 'Deep cleaning and sanitation' },
    { name: 'Hospitality', description: 'Hospitality, hotel, and restaurant staff' },
    { name: 'General Worker', description: 'General labor and facility assistance' },
];

async function main() {
    console.log('🌱 Starting database seeding...');

    // 1. Seed Categories
    console.log('Seeding categories...');
    for (const category of categories) {
        await prisma.category.upsert({
            where: { name: category.name },
            update: {},
            create: category,
        });
    }
    console.log(`✅ Seeded ${categories.length} categories.`);

    // 2. Seed Default Organization / Agency
    const adminPhone = '+251921283801';
    const adminEmail = 'ibrahim@ethiorecruit.com';
    const commonPassword = '123456';
    const hashedPassword = await bcrypt.hash(commonPassword, 12);

    console.log('Seeding default organization...');
    let organization = await prisma.organization.findFirst({
        where: { email: adminEmail },
    });

    if (!organization) {
        organization = await prisma.organization.create({
            data: {
                name: 'EthioRecruit Recruitment Agency',
                type: 'AGENCY',
                licenseNumber: 'AG-2026-ETH01',
                phone: adminPhone,
                email: adminEmail,
                country: 'Ethiopia',
                city: 'Addis Ababa',
                isVerified: true,
                isActive: true,
            },
        });
        console.log('✅ Created default organization:', organization.name);
    } else {
        console.log('ℹ️ Organization already exists:', organization.name);
    }

    // Seed default contact channels for organization (Telegram @metinie, WhatsApp, IMO)
    const defaultChannels = [
        { channelType: 'TELEGRAM', channelValue: 'metinie', label: 'Telegram Direct' },
        { channelType: 'WHATSAPP', channelValue: adminPhone, label: 'WhatsApp Official' },
        { channelType: 'IMO', channelValue: adminPhone, label: 'IMO Hotline' },
    ];
    for (const chan of defaultChannels) {
        const existingChan = await prisma.agencyContactChannel.findFirst({
            where: { agencyId: organization.id, channelType: chan.channelType },
        });
        if (!existingChan) {
            await prisma.agencyContactChannel.create({
                data: {
                    agencyId: organization.id,
                    channelType: chan.channelType,
                    channelValue: chan.channelValue,
                    label: chan.label,
                    isPrimary: true,
                },
            });
        } else {
            await prisma.agencyContactChannel.update({
                where: { id: existingChan.id },
                data: { channelValue: chan.channelValue },
            });
        }
    }
    console.log('✅ Seeded default contact channels (Telegram @metinie, WhatsApp, IMO).');

    // 3. Seed AdminUser Ibrahim (Admin Dashboard Only)
    // First remove any conflicting regular User record created for admin phone/email
    await prisma.user.deleteMany({
        where: {
            OR: [
                { phone: adminPhone },
                { email: adminEmail },
            ],
        },
    });

    console.log('Seeding Admin User Ibrahim...');
    const adminUser = await prisma.adminUser.upsert({
        where: { email: adminEmail },
        update: {
            firstName: 'Ibrahim',
            lastName: 'Admin',
            phone: adminPhone,
            password: hashedPassword,
            role: Role.SUPER_ADMIN,
            isActive: true,
        },
        create: {
            agencyId: organization.id,
            firstName: 'Ibrahim',
            lastName: 'Admin',
            email: adminEmail,
            phone: adminPhone,
            password: hashedPassword,
            role: Role.SUPER_ADMIN,
            isActive: true,
        },
    });
    console.log(`✅ Seeded AdminUser: ${adminUser.firstName} ${adminUser.lastName} (${adminUser.phone} / ${adminUser.email})`);

    // 4. Seed Mobile User (Mobile Application Only)
    const userPhone = '+251918982161';
    const userEmail = 'user@ethiorecruit.com';

    console.log('Seeding Mobile User...');
    const user = await prisma.user.upsert({
        where: { phone: userPhone },
        update: {
            firstName: 'Ethio',
            lastName: 'User',
            email: userEmail,
            password: hashedPassword,
            isPlatformAdmin: false,
            phoneVerified: true,
            preferredMode: PreferredMode.JOB_SEEKER,
            isActive: true,
        },
        create: {
            firstName: 'Ethio',
            lastName: 'User',
            phone: userPhone,
            email: userEmail,
            password: hashedPassword,
            isPlatformAdmin: false,
            phoneVerified: true,
            preferredMode: PreferredMode.JOB_SEEKER,
            isActive: true,
        },
    });
    console.log(`✅ Seeded Mobile User: ${user.firstName} ${user.lastName} (${user.phone})`);

    // 5. Seed Organization Membership for Mobile User
    await prisma.organizationMember.upsert({
        where: {
            organizationId_userId: {
                organizationId: organization.id,
                userId: user.id,
            },
        },
        update: { role: OrgMemberRole.RECRUITER, isActive: true },
        create: {
            organizationId: organization.id,
            userId: user.id,
            role: OrgMemberRole.RECRUITER,
            isActive: true,
        },
    });
    console.log('✅ Seeded OrganizationMember link.');

    // 6. Seed Sample Candidates
    console.log('Seeding sample candidates...');
    const housemaidCat = await prisma.category.findUnique({ where: { name: 'Housemaid' } });
    const nannyCat = await prisma.category.findUnique({ where: { name: 'Nanny' } });
    const cookCat = await prisma.category.findUnique({ where: { name: 'Cook' } });
    const driverCat = await prisma.category.findUnique({ where: { name: 'Driver' } });
    const caregiverCat = await prisma.category.findUnique({ where: { name: 'Caregiver' } });
    const cleanerCat = await prisma.category.findUnique({ where: { name: 'Cleaner' } });

    const sampleCandidates = [
        {
            agencyId: organization.id,
            categoryId: housemaidCat?.id || '',
            firstName: 'Tigist',
            lastName: 'Alemu',
            fullNameAmharic: 'ትግስት አለሙ',
            gender: 'female',
            nationality: 'Ethiopian',
            medicalStatus: 'cleared',
            yearsOfExperience: 3,
            hasOverseasExperience: true,
            overseasDetails: 'Riyadh, KSA (2 Years)',
            summary: 'Experienced housemaid skilled in general house cleaning, laundry, cooking, and family care.',
            appliedPosition: 'Housemaid',
            expectedSalary: 1200,
            expectedSalaryCurrency: 'SAR',
            isPublished: true,
            isAvailable: true,
            skills: ['Cleaning', 'Cooking', 'Ironing', 'Child Care'],
            languages: ['Amharic', 'Arabic (Basic)'],
        },
        {
            agencyId: organization.id,
            categoryId: nannyCat?.id || '',
            firstName: 'Meskrem',
            lastName: 'Tadesse',
            fullNameAmharic: 'መስከረም ታደሰ',
            gender: 'female',
            nationality: 'Ethiopian',
            medicalStatus: 'PASSED_GAMCA',
            yearsOfExperience: 4,
            hasOverseasExperience: true,
            overseasDetails: 'Dubai, UAE (3 Years)',
            summary: 'Certified nanny passionate about newborn and toddler care, early learning, and child nutrition.',
            appliedPosition: 'Nanny',
            expectedSalary: 1500,
            expectedSalaryCurrency: 'AED',
            isPublished: true,
            isAvailable: true,
            skills: ['Infant Care', 'Child Safety', 'Meal Preparation', 'English Support'],
            languages: ['Amharic', 'English', 'Arabic'],
        },
        {
            agencyId: organization.id,
            categoryId: cookCat?.id || '',
            firstName: 'Abebech',
            lastName: 'Worku',
            fullNameAmharic: 'አበበች ወርቁ',
            gender: 'female',
            nationality: 'Ethiopian',
            medicalStatus: 'cleared',
            yearsOfExperience: 5,
            hasOverseasExperience: true,
            overseasDetails: 'Jeddah, KSA (4 Years)',
            summary: 'Professional cook specializing in Middle Eastern and International cuisine, kitchen hygiene, and menu planning.',
            appliedPosition: 'Cook',
            expectedSalary: 1600,
            expectedSalaryCurrency: 'SAR',
            isPublished: true,
            isAvailable: true,
            skills: ['Arabic Cuisine', 'Baking', 'Kitchen Management', 'Hygiene Standards'],
            languages: ['Amharic', 'Arabic (Fluent)'],
        },
        {
            agencyId: organization.id,
            categoryId: driverCat?.id || '',
            firstName: 'Kebede',
            lastName: 'Girma',
            fullNameAmharic: 'ከበደ ግርማ',
            gender: 'male',
            nationality: 'Ethiopian',
            medicalStatus: 'cleared',
            yearsOfExperience: 6,
            hasOverseasExperience: true,
            overseasDetails: 'Doha, Qatar (5 Years)',
            summary: 'Reliable personal driver with valid GCC driver license, route optimization, and vehicle maintenance expertise.',
            appliedPosition: 'Personal Driver',
            expectedSalary: 2000,
            expectedSalaryCurrency: 'QAR',
            isPublished: true,
            isAvailable: true,
            skills: ['GCC Driving License', 'GPS Navigation', 'VIP Chauffeur', 'Auto Maintenance'],
            languages: ['Amharic', 'English (Basic)', 'Arabic'],
        },
        {
            agencyId: organization.id,
            categoryId: caregiverCat?.id || '',
            firstName: 'Hiwot',
            lastName: 'Mengistu',
            fullNameAmharic: 'ሕይወት መንግሥቱ',
            gender: 'female',
            nationality: 'Ethiopian',
            medicalStatus: 'PASSED_LOCAL',
            yearsOfExperience: 2,
            hasOverseasExperience: false,
            summary: 'Compassionate elderly caregiver with nursing assistant background, patient assistance, and medication tracking.',
            appliedPosition: 'Caregiver',
            expectedSalary: 1400,
            expectedSalaryCurrency: 'SAR',
            isPublished: true,
            isAvailable: true,
            skills: ['Elderly Care', 'Vital Signs Monitoring', 'Mobility Support', 'Patience'],
            languages: ['Amharic', 'English'],
        },
        {
            agencyId: organization.id,
            categoryId: cleanerCat?.id || '',
            firstName: 'Selam',
            lastName: 'Haile',
            fullNameAmharic: 'ሰላም ኃይሌ',
            gender: 'female',
            nationality: 'Ethiopian',
            medicalStatus: 'cleared',
            yearsOfExperience: 3,
            hasOverseasExperience: false,
            summary: 'Detail-oriented commercial and residential cleaner specializing in sanitization, floor care, and deep cleaning.',
            appliedPosition: 'Cleaner',
            expectedSalary: 1100,
            expectedSalaryCurrency: 'SAR',
            isPublished: true,
            isAvailable: true,
            skills: ['Deep Cleaning', 'Sanitization', 'Office Cleaning', 'Housekeeping'],
            languages: ['Amharic'],
        },
    ];

    for (const candData of sampleCandidates) {
        if (!candData.categoryId) continue;
        const existing = await prisma.candidate.findFirst({
            where: {
                firstName: candData.firstName,
                lastName: candData.lastName,
            },
        });
        if (!existing) {
            await prisma.candidate.create({ data: candData as any });
        }
    }
    console.log('✅ Seeded sample candidates.');

    // 7. Seed Sample Active Vacancies
    console.log('Seeding sample job vacancies...');
    const sampleVacancies = [
        {
            agencyId: organization.id,
            categoryId: housemaidCat?.id || '',
            title: 'Housemaid for Private Villa',
            jobCode: 'VAC-HM-001',
            description: 'Full-time housemaid required for a private family villa in Riyadh. Accommodation, food, medical, and flight provided.',
            requirements: ['1+ year housemaid experience', 'Clean medical check', 'Valid passport'],
            country: 'Saudi Arabia',
            city: 'Riyadh',
            salaryMin: 1200,
            salaryMax: 1400,
            salaryCurrency: 'SAR',
            contractPeriodYears: 2,
            visaSponsorship: true,
            accommodationProvided: true,
            mealsProvided: true,
            flightTicketProvided: true,
            status: 'ACTIVE' as const,
        },
        {
            agencyId: organization.id,
            categoryId: nannyCat?.id || '',
            title: 'Experienced Nanny for Toddler',
            jobCode: 'VAC-NY-002',
            description: 'Looking for a caring nanny to take care of a 2-year-old child in Dubai. Experience with early child development preferred.',
            requirements: ['2+ years nanny experience', 'Basic English or Arabic', 'Patience & warm attitude'],
            country: 'United Arab Emirates',
            city: 'Dubai',
            salaryMin: 1500,
            salaryMax: 1800,
            salaryCurrency: 'AED',
            contractPeriodYears: 2,
            visaSponsorship: true,
            accommodationProvided: true,
            mealsProvided: true,
            flightTicketProvided: true,
            status: 'ACTIVE' as const,
        },
        {
            agencyId: organization.id,
            categoryId: driverCat?.id || '',
            title: 'Family Chauffeur & Personal Driver',
            jobCode: 'VAC-DR-003',
            description: 'Personal driver needed for family in Doha. Must possess valid GCC driving license.',
            requirements: ['Valid GCC driving license', 'Clean driving record', 'Punctual & trustworthy'],
            country: 'Qatar',
            city: 'Doha',
            salaryMin: 2000,
            salaryMax: 2200,
            salaryCurrency: 'QAR',
            contractPeriodYears: 2,
            visaSponsorship: true,
            accommodationProvided: true,
            mealsProvided: true,
            flightTicketProvided: true,
            status: 'ACTIVE' as const,
        },
        {
            agencyId: organization.id,
            categoryId: cookCat?.id || '',
            title: 'Middle Eastern Cuisine Family Cook',
            jobCode: 'VAC-CK-004',
            description: 'Private family cook required in Jeddah. Expertise in Arabic dishes and kitchen hygiene required.',
            requirements: ['3+ years cooking experience', 'Knowledge of Arabic food', 'Medical fitness'],
            country: 'Saudi Arabia',
            city: 'Jeddah',
            salaryMin: 1600,
            salaryMax: 1800,
            salaryCurrency: 'SAR',
            contractPeriodYears: 2,
            visaSponsorship: true,
            accommodationProvided: true,
            mealsProvided: true,
            flightTicketProvided: true,
            status: 'ACTIVE' as const,
        },
    ];

    for (const vacData of sampleVacancies) {
        if (!vacData.categoryId) continue;
        const existing = await prisma.jobVacancy.findFirst({
            where: { jobCode: vacData.jobCode },
        });
        if (!existing) {
            await prisma.jobVacancy.create({ data: vacData as any });
        }
    }
    console.log('✅ Seeded sample job vacancies.');

    console.log('\n=============================================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('--- ADMIN CREDENTIALS ---');
    console.log(`  Phone:    ${adminPhone} (0921283801)`);
    console.log(`  Email:    ${adminEmail}`);
    console.log(`  Password: ${commonPassword}`);
    console.log('--- MOBILE USER CREDENTIALS ---');
    console.log(`  Phone:    ${userPhone} (0918982161)`);
    console.log(`  Email:    ${userEmail}`);
    console.log(`  Password: ${commonPassword}`);
    console.log('=============================================================\n');
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
