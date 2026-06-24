import { prisma } from './lib/prisma';

const API_KEY = 'process.env.GOOGLE_PLACES_API_KEY!';

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function getPlacePhoto(venueName: string): Promise<string | null> {
  try {
    const query = encodeURIComponent(venueName + ' Casablanca Maroc');
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id,photos,name&key=${API_KEY}`;
    
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    
    if (searchData.status !== 'OK' || !searchData.candidates?.length) {
      console.log('  Pas de résultat pour: ' + venueName);
      return null;
    }

    const candidate = searchData.candidates[0];
    
    if (candidate.photos?.length) {
      const ref = candidate.photos[0].photo_reference;
      return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${ref}&key=${API_KEY}`;
    }

    if (candidate.place_id) {
      const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${candidate.place_id}&fields=photos&key=${API_KEY}`;
      const detailRes = await fetch(detailUrl);
      const detailData = await detailRes.json();
      if (detailData.result?.photos?.length) {
        const ref = detailData.result.photos[0].photo_reference;
        return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${ref}&key=${API_KEY}`;
      }
    }

    return null;
  } catch (e) {
    console.log('  Erreur: ' + e);
    return null;
  }
}

async function main() {
  console.log('?? Fetching real photos from Google Places...\n');
  
  const venues = await prisma.venue.findMany({
    where: { city: { slug: 'casablanca' } },
    select: { id: true, name: true }
  });

  console.log(`Found ${venues.length} venues\n`);
  let updated = 0;

  for (const venue of venues) {
    console.log(`Processing: ${venue.name}`);
    const photoUrl = await getPlacePhoto(venue.name);
    
    if (photoUrl) {
      await prisma.venue.update({
        where: { id: venue.id },
        data: { coverImageUrl: photoUrl }
      });
      console.log(`  ? Photo updated!`);
      updated++;
    } else {
      console.log(`  ?? No photo found`);
    }
    
    await sleep(500);
  }

  console.log(`\n?? Done! ${updated}/${venues.length} venues updated with real photos.`);
  await prisma.$disconnect();
}

main();
