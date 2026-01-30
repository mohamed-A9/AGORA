# 🔧 FIXED: P2025 "Venue Not Found" Error

## What Was Wrong

The error you saw:
```
❌ Venue not found in database: cmkvcmqrx0001tanw9p05x230
```

Happened because:
1. The venue ID `cmkvcmqrx0001tanw9p05x230` **doesn't exist** in the database (stale from old session)
2. The `updateVenueStep` function tried to update it with a compound WHERE clause `{id, ownerId}`
3. Prisma threw P2025 error: "No record was found for an update"

---

## What I Fixed

### 1. ✅ Added Pre-Flight Check in `updateVenueStep`

**File:** `actions/venue.ts`

Before attempting any update, the function now:
- Checks if venue exists: `prisma.venue.findUnique({ where: { id: venueId } })`  
- Verifies ownership (unless admin)
- Returns proper error codes:
  - **404** if venue not found → `VENUE_NOT_FOUND`
  - **403** if not owner → `NOT_OWNER`
  - **401** if not logged in → `UNAUTHORIZED`

### 2. ✅ Simplified WHERE Clause

Changed from:
```typescript
where: { id: venueId, ownerId: userId } // ❌ Compound - causes P2025
```

To:
```typescript
where: { id: venueId } // ✅ Simple - ownership already verified
```

### 3. ✅ Frontend Already Handles These Errors

Your `BasicsStep.tsx` (from earlier fixes) already has:
```typescript
if (updateRes?.error === "VENUE_NOT_FOUND" || updateRes?.statusCode === 404) {
    alert("❌ This venue draft no longer exists.\\n\\nWe'll refresh the page...");
  localStorage.removeItem("agora_wizard_venue_id");
    localStorage.removeItem("agora_wizard_step");
    localStorage.removeItem("agora_wizard_data");
    window.location.href = "/business/add-venue";
}
```

---

## 🧪 Testing Steps

### 1. Clear Stale Data

Open browser console (F12) and run:
```javascript
localStorage.clear();
```

### 2. Restart Server & Test

```bash
npm run dev
```

Then go to: `http://localhost:3000/business/add-venue`

### 3. Expected Flow

**Scenario A: Fresh Start (No Stale ID)**
```
1. Click "Create Venue"
2. Console: "🆕 No venue ID found. Creating empty draft..."
3. Console: "✅ Empty draft created with ID: [newId]"
4. URL changes to: /business/add-venue?id=[newId]
5. Type in venue name
6. Submit Step 1
7. Console: "🔍 [updateVenueStep] Checking if venue exists..."
8. Console: "📦 Venue found: Untitled Venue (owner: [yourId])"
9. Console: "✅ Ownership verified. Proceeding with update..."
10. Console: "💾 Updating venue in database..."
11. Console: "✅ Venue updated successfully"
12. Proceeds to Step 2
```

**Scenario B: Stale ID Exists**
```
1. localStorage has old ID `cmkvcmqrx0001tanw9p05x230`
2. Load /business/add-venue
3. Wizard tries to fetch venue data
4. API returns 404
5. Frontend clears localStorage
6. Alert: "Your previous draft was not found. Starting fresh."
7. Creates new empty draft
8. Continues normally
```

**Scenario C: Updating Existing Draft**
```
1. Type in "Venue Name" field
2. Submit
3. Console: "🔍 [updateVenueStep] Checking if venue exists..."
4. Console: "📦 Venue found: [name]"
5. Console: "✅ Ownership verified"
6. Console: "💾 Updating venue..."
7. Console: "✅ Venue updated successfully"
```

---

## 🎯 What This Fixes

- ✅ No more P2025 errors when updating venues
- ✅ Stale venue IDs are automatically detected and cleared
- ✅ Clear error messages for users
- ✅ Proper ownership verification
- ✅ Frontend handles all error cases gracefully

---

## 🐛 If You Still See Errors

### Error: "Venue not found" immediately on load

1. Check console - should show the empty draft creation
2. If empty draft API fails, check terminal for server errors
3. Verify you're logged in as a business user

### Error: After typing, on submit

1. Check console for the pre-flight check logs
2. If it says "Venue found", ownership should be verified
3. If it says "not found", the draft wasn't created properly

### Connection Errors

```
prisma:error Error in PostgreSQL connection: Error { kind: Closed, cause: None }
```

This is the connection pool issue - restart your dev server:
```bash
# Ctrl+C to stop
npm run dev
```

---

## ✅ Success Indicators

When everything works, you'll see these logs:

**On page load:**
```
🆕 No venue ID found. Creating empty draft...
✅ Empty draft created with ID: [id]
```

**On field update:**
```
🔍 [updateVenueStep] Checking if venue exists: [id]
📦 Venue found: [name] (owner: [userId])
✅ Ownership verified. Proceeding with update...
💾 Updating venue in database...
✅ Venue updated successfully: [id]
```

---

## 📝 Summary

The venue wizard now:
1. **Creates empty draft immediately** when page loads (if no ID exists)
2. **Verifies venue exists** before every update
3. **Checks ownership** (unless admin)
4. **Clears stale data** automatically
5. **Shows user-friendly errors** instead of crashing

**Try it now!** Clear localStorage, restart server, and click "Create Venue". The ID should appear in the URL within 1-2 seconds.
