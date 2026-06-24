import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const slugify = (text: string) =>
  text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

const venues = [
  // ☕ CAFÉS
  { name: "% Arabica Casablanca", mainCategory: "CAFE", address: "Boulevard de la Corniche, Ain Diab", description: "Le célèbre café japonais avec vue sur l'océan. Spécialité : café de spécialité et latte art.", priceLevel: 3, rating: 4.7, numReviews: 412, lat: 33.5992, lng: -7.6814, coverImageUrl: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=1000" },
  { name: "Bondi Coffee Kitchen", mainCategory: "CAFE", address: "Quartier Gauthier, Casablanca", description: "Ambiance australienne décontractée, brunch et café de spécialité dans le quartier Gauthier.", priceLevel: 2, rating: 4.5, numReviews: 287, lat: 33.5870, lng: -7.6380, coverImageUrl: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&q=80&w=1000" },
  { name: "Espressolab Casablanca", mainCategory: "CAFE", address: "Twin Center, Boulevard Zerktouni", description: "Chaîne internationale de café de spécialité. Ambiance moderne et baristas experts.", priceLevel: 3, rating: 4.6, numReviews: 334, lat: 33.5892, lng: -7.6335, coverImageUrl: "https://images.unsplash.com/photo-1507133750069-775b0ca008a0?auto=format&fit=crop&q=80&w=1000" },
  { name: "PAUL Casablanca", mainCategory: "CAFE", address: "Morocco Mall, Ain Diab", description: "La boulangerie-café française incontournable. Viennoiseries fraîches et café premium.", priceLevel: 2, rating: 4.3, numReviews: 521, lat: 33.5765, lng: -7.6928, coverImageUrl: "https://images.unsplash.com/photo-1509365465984-efca666f3688?auto=format&fit=crop&q=80&w=1000" },
  { name: "Bacha Coffee Casablanca", mainCategory: "CAFE", address: "Quartier Racine, Casablanca", description: "L'expérience café la plus luxueuse de Casablanca. Grains rares du monde entier.", priceLevel: 4, rating: 4.8, numReviews: 198, lat: 33.5888, lng: -7.6402, coverImageUrl: "https://images.unsplash.com/photo-1442975631134-e0b788ee9f57?auto=format&fit=crop&q=80&w=1000" },
  { name: "Café du Port", mainCategory: "CAFE", address: "Port de Casablanca", description: "Café historique avec vue sur le port. Ambiance authentique et thé à la menthe traditionnel.", priceLevel: 1, rating: 4.2, numReviews: 163, lat: 33.6049, lng: -7.6197, coverImageUrl: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=1000" },
  { name: "Columbus Café Casablanca", mainCategory: "CAFE", address: "Quartier Maarif, Casablanca", description: "Café cosy au cœur de Maarif, idéal pour le télétravail avec wifi rapide et bonnes pâtisseries.", priceLevel: 2, rating: 4.1, numReviews: 245, lat: 33.5810, lng: -7.6390, coverImageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=1000" },

  // 🍽️ RESTAURANTS
  { name: "La Sqala", mainCategory: "RESTAURANT", address: "Boulevard des Almohades, Médina", description: "Restaurant marocain authentique dans un cadre historique fortifié. Tajines et couscous traditionnels.", priceLevel: 3, rating: 4.6, numReviews: 892, lat: 33.6043, lng: -7.6241, coverImageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1000" },
  { name: "Rick's Café", mainCategory: "RESTAURANT", address: "248 Boulevard Sour Jdid, Médina", description: "Inspiré du film Casablanca, ce restaurant-bar offre une cuisine internationale avec une ambiance mythique.", priceLevel: 4, rating: 4.5, numReviews: 1243, lat: 33.6081, lng: -7.6293, coverImageUrl: "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&q=80&w=1000" },
  { name: "Le Cabestan", mainCategory: "RESTAURANT", address: "Boulevard de la Corniche, Ain Diab", description: "Restaurant de fruits de mer et poisson frais avec vue panoramique sur l'Atlantique.", priceLevel: 4, rating: 4.4, numReviews: 678, lat: 33.5973, lng: -7.6756, coverImageUrl: "https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=80&w=1000" },
  { name: "Dar Beida Restaurant", mainCategory: "RESTAURANT", address: "Quartier Racine, Casablanca", description: "Gastronomie marocaine raffinée dans un riad somptueux. Expérience culinaire haut de gamme.", priceLevel: 4, rating: 4.7, numReviews: 445, lat: 33.5841, lng: -7.6419, coverImageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1000" },
  { name: "Brasserie Bavaroise", mainCategory: "RESTAURANT", address: "Quartier Gauthier, Casablanca", description: "Institution de Casablanca depuis des décennies. Cuisine franco-marocaine et ambiance brasserie parisienne.", priceLevel: 3, rating: 4.4, numReviews: 567, lat: 33.5867, lng: -7.6376, coverImageUrl: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&q=80&w=1000" },
  { name: "Sushi Shop Casablanca", mainCategory: "RESTAURANT", address: "Boulevard Zerktouni, Casablanca", description: "Sushis premium et cuisine japonaise contemporaine. Livraison et sur place disponibles.", priceLevel: 3, rating: 4.3, numReviews: 389, lat: 33.5896, lng: -7.6341, coverImageUrl: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?auto=format&fit=crop&q=80&w=1000" },
  { name: "Blend Burger Casablanca", mainCategory: "RESTAURANT", address: "Quartier Maarif, Casablanca", description: "Les meilleurs burgers artisanaux de Casablanca, avec viande locale et sauces maison.", priceLevel: 2, rating: 4.5, numReviews: 712, lat: 33.5813, lng: -7.6405, coverImageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=1000" },

  // 🍸 NIGHTLIFE & BARS
  { name: "Sky 28 Rooftop Bar", mainCategory: "NIGHTLIFE_BARS", address: "Kenzi Tower, Boulevard Zerktouni", description: "Bar rooftop au 28ème étage avec vue à 360° sur Casablanca. Cocktails signature et ambiance lounge.", priceLevel: 4, rating: 4.6, numReviews: 534, lat: 33.5891, lng: -7.6338, coverImageUrl: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&q=80&w=1000" },
  { name: "Le Petit Poucet", mainCategory: "NIGHTLIFE_BARS", address: "Boulevard Mohammed V, Centre-ville", description: "Bar historique de Casablanca depuis 1920. Ambiance authentique, bières locales et internationales.", priceLevel: 2, rating: 4.1, numReviews: 321, lat: 33.5953, lng: -7.6189, coverImageUrl: "https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?auto=format&fit=crop&q=80&w=1000" },
  { name: "La Bodega Casablanca", mainCategory: "NIGHTLIFE_BARS", address: "Quartier Gauthier, Casablanca", description: "Bar tapas espagnol avec excellente sélection de vins et ambiance festive.", priceLevel: 3, rating: 4.3, numReviews: 298, lat: 33.5934, lng: -7.6215, coverImageUrl: "https://images.unsplash.com/photo-1525268323446-0505b6fe7778?auto=format&fit=crop&q=80&w=1000" },
  { name: "Oz Bar Casablanca", mainCategory: "NIGHTLIFE_BARS", address: "Corniche Ain Diab, Casablanca", description: "Bar branché en bord de mer avec DJs live le week-end et cocktails créatifs.", priceLevel: 3, rating: 4.2, numReviews: 476, lat: 33.5981, lng: -7.6789, coverImageUrl: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&q=80&w=1000" },
  { name: "L'Atelier Cocktail Bar", mainCategory: "NIGHTLIFE_BARS", address: "Quartier Racine, Casablanca", description: "Bar à cocktails artisanaux avec mixologistes experts. Ambiance speakeasy et carte créative.", priceLevel: 3, rating: 4.5, numReviews: 267, lat: 33.5845, lng: -7.6432, coverImageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=1000" },

  // 🎉 ÉVÉNEMENTS & SALLES
  { name: "Complexe Mohammed VI d'Art Moderne", mainCategory: "EVENTS", address: "Avenue Hassan II, Casablanca", description: "Grand espace culturel pour expositions, concerts et événements artistiques à grande envergure.", priceLevel: 2, rating: 4.5, numReviews: 334, lat: 33.5916, lng: -7.6169, coverImageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000" },
  { name: "L'Espace Porte d'Anfa", mainCategory: "EVENTS", address: "Anfa Place, Casablanca", description: "Salle polyvalente moderne pour conférences, mariages et événements corporate jusqu'à 1000 personnes.", priceLevel: 3, rating: 4.3, numReviews: 189, lat: 33.5823, lng: -7.6574, coverImageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000" },
  { name: "Théâtre Mohammed V Casablanca", mainCategory: "EVENTS", address: "Avenue Hassan II, Centre-ville", description: "Théâtre historique de Casablanca. Spectacles, opéras et événements culturels de renom.", priceLevel: 2, rating: 4.4, numReviews: 456, lat: 33.5942, lng: -7.6164, coverImageUrl: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=1000" },
  { name: "Casa Events & Congress", mainCategory: "EVENTS", address: "Route d'El Jadida, Casablanca", description: "Centre de congrès et événements le plus grand de Casablanca. Idéal pour salons et expositions.", priceLevel: 3, rating: 4.2, numReviews: 223, lat: 33.5634, lng: -7.6502, coverImageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1000" },
  { name: "Villa des Arts Casablanca", mainCategory: "EVENTS", address: "Boulevard Moulay Youssef, Casablanca", description: "Espace d'art contemporain avec galeries, ateliers et événements culturels dans une villa historique.", priceLevel: 1, rating: 4.6, numReviews: 312, lat: 33.5901, lng: -7.6355, coverImageUrl: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&q=80&w=1000" },

  // 🏨 HÔTELS & SPAS
  { name: "Four Seasons Casablanca Spa", mainCategory: "WELLNESS_HEALTH", address: "Boulevard de la Corniche, Ain Diab", description: "Hôtel 5 étoiles de luxe avec spa complet, piscine infinity et accès direct à la plage.", priceLevel: 5, rating: 4.9, numReviews: 876, lat: 33.5991, lng: -7.6842, coverImageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&q=80&w=1000" },
  { name: "Sofitel Spa Tour Blanche", mainCategory: "WELLNESS_HEALTH", address: "Rue Sidi Belyout, Centre-ville", description: "Hôtel de luxe iconique avec So SPA, piscine et restaurants gastronomiques.", priceLevel: 4, rating: 4.7, numReviews: 654, lat: 33.5922, lng: -7.6192, coverImageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000" },
  { name: "Hammam Al Andalus Casablanca", mainCategory: "WELLNESS_HEALTH", address: "Quartier Maarif, Casablanca", description: "Hammam traditionnel marocain avec gommage, massage et soins orientaux authentiques.", priceLevel: 2, rating: 4.5, numReviews: 389, lat: 33.5811, lng: -7.6398, coverImageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1000" },
  { name: "Le Spa Kenzi Tower", mainCategory: "WELLNESS_HEALTH", address: "Kenzi Tower Hotel, Boulevard Zerktouni", description: "Spa premium avec vue panoramique, soins du corps et visage, sauna et hammam.", priceLevel: 4, rating: 4.6, numReviews: 287, lat: 33.5893, lng: -7.6336, coverImageUrl: "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?auto=format&fit=crop&q=80&w=1000" },
  { name: "O Spa Casablanca", mainCategory: "WELLNESS_HEALTH", address: "Quartier Gauthier, Casablanca", description: "Spa urbain tendance avec soins visage, massage deep tissue et rituel hammam oriental.", priceLevel: 3, rating: 4.4, numReviews: 198, lat: 33.5868, lng: -7.6379, coverImageUrl: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=1000" },

  // 💻 CO-WORKING SPACES
  { name: "Regus Twin Center Casablanca", mainCategory: "ACTIVITIES_FUN", address: "Twin Center, Tour Ouest, Boulevard Zerktouni", description: "Espaces de coworking et bureaux privés au cœur du quartier d'affaires de Casablanca.", priceLevel: 3, rating: 4.3, numReviews: 156, lat: 33.5890, lng: -7.6334, coverImageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000" },
  { name: "Numa Casablanca", mainCategory: "ACTIVITIES_FUN", address: "Quartier Maarif, Casablanca", description: "Hub d'innovation et coworking pour startups et freelances. Événements networking réguliers.", priceLevel: 2, rating: 4.4, numReviews: 234, lat: 33.5815, lng: -7.6413, coverImageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1000" },
  { name: "The Spot Coworking", mainCategory: "ACTIVITIES_FUN", address: "Boulevard Anfa, Casablanca", description: "Espace de coworking moderne avec salles de réunion, terrasse et café intégré.", priceLevel: 2, rating: 4.5, numReviews: 312, lat: 33.5845, lng: -7.6512, coverImageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1000" },
  { name: "Impact Lab Casablanca", mainCategory: "ACTIVITIES_FUN", address: "Quartier Racine, Casablanca", description: "Coworking dédié aux entrepreneurs sociaux et startups tech. Mentorat et accompagnement inclus.", priceLevel: 1, rating: 4.6, numReviews: 178, lat: 33.5838, lng: -7.6421, coverImageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1000" },
  { name: "Cogite Casablanca", mainCategory: "ACTIVITIES_FUN", address: "Quartier Bourgogne, Casablanca", description: "Espace de coworking premium avec cabines phoniques, salle de brainstorming et rooftop.", priceLevel: 3, rating: 4.7, numReviews: 267, lat: 33.5862, lng: -7.6445, coverImageUrl: "https://images.unsplash.com/photo-1568992688065-536aad8a12f6?auto=format&fit=crop&q=80&w=1000" },
];

async function main() {
  console.log('🚀 Seeding venues Casablanca...\n');

  const casablanca = await prisma.city.upsert({
    where: { slug: 'casablanca' },
    update: {},
    create: { name: 'Casablanca', slug: 'casablanca', country: 'Morocco' },
  });

  console.log(`✅ Ville: Casablanca\n`);

  const stats: Record<string, number> = {};
  let created = 0, skipped = 0;

  for (const v of venues) {
    const slug = slugify(v.name);
    try {
      await prisma.venue.upsert({
        where: { slug },
        update: {},
        create: {
          name: v.name,
          slug,
          description: v.description,
          mainCategory: v.mainCategory as any,
          cityId: casablanca.id,
          address: v.address,
          lat: v.lat,
          lng: v.lng,
          priceLevel: v.priceLevel,
          rating: v.rating,
          numReviews: v.numReviews,
          coverImageUrl: v.coverImageUrl,
          status: 'APPROVED',
          isActive: true,
          isVerified: true,
        },
      });
      stats[v.mainCategory] = (stats[v.mainCategory] || 0) + 1;
      console.log(`  ✅ ${v.name}`);
      created++;
    } catch (e: any) {
      console.log(`  ⚠️  Skipped: ${v.name} — ${e.message}`);
      skipped++;
    }
  }

  console.log(`\n🎉 Terminé ! ${created} créées, ${skipped} ignorées.\n`);
  console.log('📊 Par catégorie:');
  console.log(`  ☕ Cafés:          ${stats['CAFE'] || 0}`);
  console.log(`  🍽️  Restaurants:    ${stats['RESTAURANT'] || 0}`);
  console.log(`  🍸 Nightlife:      ${stats['NIGHTLIFE_BARS'] || 0}`);
  console.log(`  🎉 Événements:     ${stats['EVENTS'] || 0}`);
  console.log(`  🏨 Hôtels & Spas:  ${stats['WELLNESS_HEALTH'] || 0}`);
  console.log(`  💻 Co-working:     ${stats['ACTIVITIES_FUN'] || 0}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });