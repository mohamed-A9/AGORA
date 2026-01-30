# Venue Creation vs Edit Page - Field Comparison

## Wizard Steps (Creation):
1. **BasicsStep**: name, tagline, category, subcategory, description, specialization
2. **LocationStep**: address, city, neighborhood, locationUrl, openingHours (text), weeklySchedule (structured)
3. **DetailsStep**: phone, website, instagram, dressCode, agePolicy, paymentMethods, parkingAvailable, valetParking, reservationsEnabled, ambiance, cuisine
4. **MediaStep**: gallery (photos/videos), menus (PDFs)
5. **PreviewStep**: (review only)

## Edit Page Current Tabs:
- **basics**: name, tagline, category, subcategory, description
- **location**: address, city, neighborhood, locationUrl
- **operations**: phone, website, weeklySchedule (structured)
- **details**: ambiance, cuisine, dressCode, agePolicy, parkingAvailable, valetParking
- **media**: gallery
- **events**: (separate feature)

## Missing in Edit Page:
1. ❌ **Instagram** (DetailsStep has it, edit page doesn't show it)
2. ❌ **Payment Methods** (DetailsStep has it, edit page doesn't show it)
3. ❌ **Reservations Enabled** checkbox (DetailsStep has it, edit page shows it but in operations tab)
4. ❌ **Menus** (PDFs) - MediaStep separates gallery vs menus, edit page only shows one upload
5. ❌ **Specialization** field (BasicsStep has it, might not be needed)
6. ❌ **OpeningHours** text field (LocationStep has both text and structured, edit only has structured)

## Tabs Organization Issue:
The edit page splits fields differently than the wizard:
- Wizard groups phone/website/instagram in "Details"
- Edit page has phone/website in "operations" but no instagram anywhere
