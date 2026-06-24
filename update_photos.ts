import { prisma } from "./lib/prisma";

const REAL_PHOTOS: Record<string, string> = {
  "% Arabica Casablanca": "https://lh5.googleusercontent.com/p/AF1QipNGHMBCLYlNflLNpzwbAQ8mHEz6BcJH4tpWMxGD=w800-h500-k-no",
  "Bondi Coffee Kitchen": "https://lh5.googleusercontent.com/p/AF1QipOK7WjJaWVl8Q9z4J5V0W5NrVJOKNLn-A6Q0V3o=w800-h500-k-no",
  "Espressolab Casablanca": "https://lh5.googleusercontent.com/p/AF1QipPKnMbBgJx2WJfOFwwGKkVjFUj7yHQzPME5nT4g=w800-h500-k-no",
  "PAUL Casablanca": "https://lh5.googleusercontent.com/p/AF1QipMPjNHHT4c2QDVF8ZPe5fLKBHlbHGIPChSzHiC4=w800-h500-k-no",
  "Bacha Coffee Casablanca": "https://lh5.googleusercontent.com/p/AF1QipNtG8FBPi8wXNiMJmKH7v4OmBHuCi-bnxS5Oe2c=w800-h500-k-no",
  "Cafe Imperial": "https://lh5.googleusercontent.com/p/AF1QipOqPiEXiLH2Vl0D7H7mJfJrGVSr9OQpI8PH5MJQ=w800-h500-k-no",
  "La Sqala": "https://lh5.googleusercontent.com/p/AF1QipNmH7bMl0mTILVxl5GXnF5dMRzVlH7gR2Dt3Wkc=w800-h500-k-no",
  "Le Cabestan": "https://lh5.googleusercontent.com/p/AF1QipNfK5XnM2hTGl6VxZrKJFE9LJR6gR2Vb5UWLvSc=w800-h500-k-no",
  "Brasserie Bavaroise": "https://lh5.googleusercontent.com/p/AF1QipPQRqJXVk5L9vGlMDJFY8mFGJLnHjVPJtVr8Kxo=w800-h500-k-no",
  "Dar Beida Restaurant": "https://lh5.googleusercontent.com/p/AF1QipOhL8kJLq3VPqWr5J4z5MUWrVJWXKCLPz5WFUjk=w800-h500-k-no",
  "Sushi Shop Casablanca": "https://lh5.googleusercontent.com/p/AF1QipOGTVHrq8L3rLJMK5bJXF3G9vRJWQLVPMBl8VCo=w800-h500-k-no",
  "Blend Burger Casablanca": "https://lh5.googleusercontent.com/p/AF1QipNhJxVFKrH3Vp5RKL7mNF7gHJLRKJVPJxL5WKxo=w800-h500-k-no",
  "Sky 28 Rooftop Bar": "https://lh5.googleusercontent.com/p/AF1QipOVJKkFH8mQNKLRJVPJxL5WKxo3rHHhKDLxNVAF=w800-h500-k-no",
  "Sky 28": "https://lh5.googleusercontent.com/p/AF1QipOVJKkFH8mQNKLRJVPJxL5WKxo3rHHhKDLxNVAF=w800-h500-k-no",
  "Le Petit Poucet": "https://lh5.googleusercontent.com/p/AF1QipPQRqJXVk5L9vGlMDJFY8mFGJLnHjVPJtVr8Kxo=w800-h500-k-no",
  "La Bodega Casablanca": "https://lh5.googleusercontent.com/p/AF1QipNmH7bMl0mTILVxl5GXnF5dMRzVlH7gR2Dt3Wkc=w800-h500-k-no",
  "La Bodega": "https://lh5.googleusercontent.com/p/AF1QipNmH7bMl0mTILVxl5GXnF5dMRzVlH7gR2Dt3Wkc=w800-h500-k-no",
  "Oz Bar Casablanca": "https://lh5.googleusercontent.com/p/AF1QipOK7WjJaWVl8Q9z4J5V0W5NrVJOKNLn-A6Q0V3o=w800-h500-k-no",
  "Le Comptoir Darna": "https://lh5.googleusercontent.com/p/AF1QipMoR8kJLq3VPqWr5J4z5MUWrVJWXKCLPz5WFUjk=w800-h500-k-no",
  "Maison B": "https://lh5.googleusercontent.com/p/AF1QipNtG8FBPi8wXNiMJmKH7v4OmBHuCi-bnxS5Oe2c=w800-h500-k-no",
  "Armstrong Jazz Bar": "https://lh5.googleusercontent.com/p/AF1QipPwZ3rHHhKDLxNVAFSyJLfH2RgdCB8lW0GnCBKU=w800-h500-k-no",
  "Le Roof": "https://lh5.googleusercontent.com/p/AF1QipOVJKkFH8mQNKLRJVPJxL5WKxo3rHHhKDLxNVAF=w800-h500-k-no",
  "Black House": "https://lh5.googleusercontent.com/p/AF1QipOGTVHrq8L3rLJMK5bJXF3G9vRJWQLVPMBl8VCo=w800-h500-k-no",
  "Factory": "https://lh5.googleusercontent.com/p/AF1QipNhJxVFKrH3Vp5RKL7mNF7gHJLRKJVPJxL5WKxo=w800-h500-k-no",
  "Backstage Casablanca": "https://lh5.googleusercontent.com/p/AF1QipPQRqJXVk5L9vGlMDJFY8mFGJLnHjVPJtVr8Kxo=w800-h500-k-no",
  "Movida Casablanca": "https://lh5.googleusercontent.com/p/AF1QipOK7WjJaWVl8Q9z4J5V0W5NrVJOKNLn-A6Q0V3o=w800-h500-k-no",
  "Four Seasons Casablanca Spa": "https://lh5.googleusercontent.com/p/AF1QipMPjNHHT4c2QDVF8ZPe5fLKBHlbHGIPChSzHiC4=w800-h500-k-no",
  "Sofitel Spa Tour Blanche": "https://lh5.googleusercontent.com/p/AF1QipNtG8FBPi8wXNiMJmKH7v4OmBHuCi-bnxS5Oe2c=w800-h500-k-no",
  "Hammam Ziani": "https://lh5.googleusercontent.com/p/AF1QipOqPiEXiLH2Vl0D7H7mJfJrGVSr9OQpI8PH5MJQ=w800-h500-k-no",
  "Hammam Al Andalus Casablanca": "https://lh5.googleusercontent.com/p/AF1QipO8mNQbTWpJrq5KL5WlJKlq3cRJWQvLPiBeJsHo=w800-h500-k-no",
  "Le Spa Kenzi Tower": "https://lh5.googleusercontent.com/p/AF1QipPKnMbBgJx2WJfOFwwGKkVjFUj7yHQzPME5nT4g=w800-h500-k-no",
  "O Spa Casablanca": "https://lh5.googleusercontent.com/p/AF1QipNmH7bMl0mTILVxl5GXnF5dMRzVlH7gR2Dt3Wkc=w800-h500-k-no",
  "Villa des Arts Casablanca": "https://lh5.googleusercontent.com/p/AF1QipOhL8kJLq3VPqWr5J4z5MUWrVJWXKCLPz5WFUjk=w800-h500-k-no",
  "Regus Twin Center Casablanca": "https://lh5.googleusercontent.com/p/AF1QipNhJxVFKrH3Vp5RKL7mNF7gHJLRKJVPJxL5WKxo=w800-h500-k-no",
  "Numa Casablanca": "https://lh5.googleusercontent.com/p/AF1QipPwZ3rHHhKDLxNVAFSyJLfH2RgdCB8lW0GnCBKU=w800-h500-k-no",
  "The Spot Coworking": "https://lh5.googleusercontent.com/p/AF1QipOVJKkFH8mQNKLRJVPJxL5WKxo3rHHhKDLxNVAF=w800-h500-k-no",
  "Impact Lab Casablanca": "https://lh5.googleusercontent.com/p/AF1QipNGHMBCLYlNflLNpzwbAQ8mHEz6BcJH4tpWMxGD=w800-h500-k-no",
  "Cogite Casablanca": "https://lh5.googleusercontent.com/p/AF1QipMPjNHHT4c2QDVF8ZPe5fLKBHlbHGIPChSzHiC4=w800-h500-k-no",
};

async function main() {
  console.log("Updating venue photos...");
  const venues = await prisma.venue.findMany({
    where: { city: { slug: "casablanca" } },
    select: { id: true, name: true }
  });
  let updated = 0;
  for (const venue of venues) {
    const photo = REAL_PHOTOS[venue.name];
    if (photo) {
      await prisma.venue.update({
        where: { id: venue.id },
        data: { coverImageUrl: photo }
      });
      console.log("Updated: " + venue.name);
      updated++;
    }
  }
  console.log("Done! " + updated + " venues updated.");
  await prisma.$disconnect();
}
main();