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

    // 3. Seed AdminUser Ibrahim (Admin Dashboard Only)
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
