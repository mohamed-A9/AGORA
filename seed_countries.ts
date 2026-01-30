
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const COUNTRIES = [
    { name: "Morocco", code: "MA", dialCode: "+212", flag: "🇲🇦" },
    { name: "France", code: "FR", dialCode: "+33", flag: "🇫🇷" },
    { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸" },
    { name: "Spain", code: "ES", dialCode: "+34", flag: "🇪🇸" },
    { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧" },
    { name: "United Arab Emirates", code: "AE", dialCode: "+971", flag: "🇦🇪" },
    { name: "Saudi Arabia", code: "SA", dialCode: "+966", flag: "🇸🇦" },
];

async function main() {
    console.log('Seeding countries...');

    for (const country of COUNTRIES) {
        await prisma.country.upsert({
            where: { code: country.code },
            update: country,
            create: country,
        });
    }

    console.log('Countries seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
