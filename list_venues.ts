import { prisma } from "./lib/prisma";
async function main() {
  const venues = await prisma.venue.findMany({
    where: { city: { slug: "casablanca" } },
    select: { id: true, name: true, mainCategory: true }
  });
  venues.forEach(v => console.log(v.id + " | " + v.mainCategory + " | " + v.name));
  await prisma.$disconnect();
}
main();