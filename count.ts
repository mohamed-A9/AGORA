import { prisma } from "./lib/prisma";
async function main() {
  const count = await prisma.venue.count({ where: { city: { slug: "casablanca" } } });
  console.log("Total venues Casablanca: " + count);
  await prisma.$disconnect();
}
main();