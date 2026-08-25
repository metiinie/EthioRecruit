import { PrismaClient } from '@prisma/client';

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
    console.log('Seeding categories...');
    for (const category of categories) {
        await prisma.category.upsert({
            where: { name: category.name },
            update: {},
            create: category,
        });
    }
    console.log(`Seeded ${categories.length} categories.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
