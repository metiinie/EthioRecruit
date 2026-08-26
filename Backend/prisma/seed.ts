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
    const agencyPhone = '+251921283801';
    const adminEmail = 'ibrahim@ethiorecruit.com';
    const rawPassword = 'password123';
    const hashedPassword = await bcrypt.hash(rawPassword, 12);

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
                phone: agencyPhone,
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

    // 3. Seed AdminUser Ibrahim
    console.log('Seeding Admin User Ibrahim...');
    const adminUser = await prisma.adminUser.upsert({
        where: { email: adminEmail },
        update: {
            firstName: 'Ibrahim',
            lastName: 'Admin',
            password: hashedPassword,
            role: Role.SUPER_ADMIN,
            isActive: true,
        },
        create: {
            agencyId: organization.id,
            firstName: 'Ibrahim',
            lastName: 'Admin',
            email: adminEmail,
            password: hashedPassword,
            role: Role.SUPER_ADMIN,
            isActive: true,
        },
    });
    console.log(`✅ Seeded AdminUser: ${adminUser.firstName} ${adminUser.lastName} (${adminUser.email})`);

    // 4. Seed User Ibrahim (Mobile / Platform Admin with Phone 0921283801 -> +251921283801)
    console.log('Seeding Mobile User Ibrahim...');
    const user = await prisma.user.upsert({
        where: { phone: agencyPhone },
        update: {
            firstName: 'Ibrahim',
            lastName: 'Admin',
            email: adminEmail,
            password: hashedPassword,
            isPlatformAdmin: true,
            phoneVerified: true,
            preferredMode: PreferredMode.EMPLOYER,
            isActive: true,
        },
        create: {
            firstName: 'Ibrahim',
            lastName: 'Admin',
            phone: agencyPhone,
            email: adminEmail,
            password: hashedPassword,
            isPlatformAdmin: true,
            phoneVerified: true,
            preferredMode: PreferredMode.EMPLOYER,
            isActive: true,
        },
    });
    console.log(`✅ Seeded User: ${user.firstName} ${user.lastName} (${user.phone})`);

    // 5. Seed Organization Membership
    await prisma.organizationMember.upsert({
        where: {
            organizationId_userId: {
                organizationId: organization.id,
                userId: user.id,
            },
        },
        update: { role: OrgMemberRole.OWNER, isActive: true },
        create: {
            organizationId: organization.id,
            userId: user.id,
            role: OrgMemberRole.OWNER,
            isActive: true,
        },
    });
    console.log('✅ Seeded OrganizationMember link (OWNER).');

    console.log('\n=============================================================');
    console.log('🎉 ADMIN SEEDING COMPLETED SUCCESSFULLY!');
    console.log(`  Name:     ${adminUser.firstName} ${adminUser.lastName}`);
    console.log(`  Phone:    ${agencyPhone} (0921283801)`);
    console.log(`  Email:    ${adminEmail}`);
    console.log(`  Password: ${rawPassword}`);
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
