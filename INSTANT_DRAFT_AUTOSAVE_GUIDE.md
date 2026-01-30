# 🚀 INSTANT DRAFT CREATION & AUTO-SAVE

## Goal
Create an empty draft venue **immediately** when user clicks "Create Venue" - BEFORE they type anything. This allows auto-saving every field change, like Google Docs.

---

## Implementation Steps

### ✅ Step 1: Create Empty Draft API (DONE)

**File:** `app/api/venues/create-empty-draft/route.ts`

This API creates a minimal draft venue with:
- Name: "Untitled Venue" (temporary)
- Status: DRAFT
- wizardStep: 1
- Unique slug

### ✅ Step 2: Add Debounce Utility (DONE)

**File:** `lib/debounce.ts`

Prevents excessive API calls by waiting 1 second after user stops typing.

---

### 🔨 Step 3: Update VenueWizard to Create Empty Draft on Mount

**File:** `components/venue-wizard/VenueWizard.tsx`

Add this useEffect **AFTER** the existing `loadDraft` useEffect (around line 100):

```typescript
// CREATE EMPTY DRAFT IMMEDIATELY ON MOUNT
useEffect(() => {
    const createEmptyDraftIfNeeded = async () => {
        // Wait for initial load to complete
        if (!isLoaded) return;
        
        // Skip if we already have a venueId
        if (venueId) {
            console.log("✅ Venue ID already exists:", venueId);
            return;
        }
        
        // Skip if initialId was provided (editing existing)
        if (initialId) return;

        console.log("🆕 No venue ID found. Creating empty draft...");

        try {
            const res = await fetch('/api/venues/create-empty-draft', {
                method: 'POST'
            });

            const data = await res.json();

            if (data.success && data.venueId) {
                console.log("✅ Empty draft created with ID:", data.venueId);
                
                setVenueId(data.venueId);
                localStorage.setItem("agora_wizard_venue_id", data.venueId);
                localStorage.setItem("agora_wizard_step", "1");
                window.history.replaceState(null, "", `?id=${data.venueId}`);
                
                console.log("✅ Ready for auto-save!");
            }
        } catch (err) {
            console.error("❌ Error creating empty draft:", err);
        }
    };

    createEmptyDraftIfNeeded();
}, [isLoaded, venueId, initialId]);
```

---

### 🔨 Step 4: Add Auto-Save to BasicsStep

**File:** `components/venue-wizard/steps/BasicsStep.tsx`

#### 4a. Add imports at the top:
```typescript
import { debounce } from "@/lib/debounce";
```

#### 4b. Add state for auto-save indicator:
```typescript
const [autoSaving, setAutoSaving] = useState(false);
```

#### 4c. Create debounced save function:
```typescript
const autoSaveField = useCallback(
    debounce(async (fieldName: string, value: any) => {
        const currentVenueId = initialData?.id;
        if (!currentVenueId) {
            console.log("⏭️ Skipping auto-save (no venueId yet)");
            return;
        }
        
        setAutoSaving(true);
        console.log(`💾 Auto-saving ${fieldName}:`, value);
        
        try {
            await updateVenueStep(currentVenueId, {
                [fieldName]: value,
                wizardStep: 1
            });
            console.log(`✅ ${fieldName} saved`);
        } catch (err) {
            console.error(`❌ Failed to auto-save ${fieldName}:`, err);
        } finally {
            setTimeout(() => setAutoSaving(false), 500);
        }
    }, 1000), // 1 second delay
    [initialData?.id]
);
```

#### 4d. Update input onChange handlers:

**Example for Venue Name:**
```typescript
<input
    name="name"
    defaultValue={initialData?.name || ""}
    onChange={(e) => {
        const value = e.target.value;
        onDataChange({ name: value });
        autoSaveField('name', value); // Auto-save after 1 second
    }}
    required
    placeholder="Venue Name"
    className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
/>
```

**Apply the same pattern to:**
- `tagline`
- `description`
- `category` (on change)
- `subcategory` (on change)

#### 4e. Add auto-save indicator UI:

Add this at the **end** of the return statement (before closing `</form>`):

```typescript
{/* Auto-save indicator */}
{autoSaving && (
    <div className="fixed top-20 right-6 bg-zinc-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in fade-in slide-in-from-top-2">
        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm">Saving...</span>
    </div>
)}
```

---

## 🧪 Testing the Implementation

### Test 1: Immediate Draft Creation

1. **Clear localStorage:**
   ```javascript
   localStorage.clear();
   ```

2. **Navigate to:** `http://localhost:3000/business/add-venue`

3. **Check console** - you should see:
   ```
   🔍 Loading draft... VenueId: null
   🆕 No venue ID found. Creating empty draft...
   ✅ Empty draft created with ID: [someId]
   ✅ Ready for auto-save!
   ```

4. **Check URL** - should now be: `/business/add-venue?id=[someId]`

5. **Verify in database:**
   ```bash
   npx tsx test_draft_workflow.ts
   ```
   Should show: 1 draft named "Untitled Venue"

### Test 2: Auto-Save on Typing

1. **Type in the "Venue Name" field:** "My Restaurant"

2. **Wait 1 second**

3. **Check console:**
   ```
   💾 Auto-saving name: My Restaurant
   🔍 [updateVenueStep] Fetching venue: [id]
   ✅ name saved
   ```

4. **See "Saving..." indicator** appear briefly in top-right

5. **Refresh the page (F5)**

6. **Expected:** Venue name is still "My Restaurant" (loaded from DB)

### Test 3: Continue Workflow

1. Fill in more fields (category, description, etc.)
2. Each field auto-saves 1 second after you stop typing
3. Click "Continue to Location" to go to Step 2
4. Your draft now has all Step 1 data saved

### Test 4: Resume Draft

1. Close browser completely
2. Reopen and go to `http://localhost:3000/business/my-venues`
3. **Expected:** See your draft with the edited name
4. Click "Continue Draft"
5. **Expected:** All your typed data is there

---

## 📊 Data Flow

```
User clicks "Create Venue"
       ↓
VenueWizard loads
       ↓
No venueId exists?
       ↓
Create empty draft (API call)
       ↓
Save venueId to localStorage + URL
       ↓
User types "My Restaurant" in name field
       ↓
onChange fires → onDataChange (local state)
       ↓
Debounce starts (1 second countdown)
       ↓
User stops typing
       ↓
After 1 second → autoSaveField()
       ↓
updateVenueStep(venueId, { name: "My Restaurant" })
       ↓
Database updated
       ↓
"Saving..." indicator shows briefly
       ↓
User continues filling form
       ↓
Each field auto-saves after 1 second of inactivity
```

---

## ✅ Benefits

1. **No data loss** - Draft exists from moment user opens wizard
2. **Auto-save** - Every field saves 1 second after user stops typing  
3. **Better UX** - Like Google Docs, user never worries about losing work
4. **Persistent** - Can close browser, come back days later
5. **My Venues shows drafts** - User can see all in-progress venues

---

## 🔧 Implementation Checklist

- [x] Create empty draft API endpoint
- [x] Add debounce utility
- [ ] Update VenueWizard with empty draft creation on mount
- [ ] Add auto-save to BasicsStep (name, tagline, description, category, subcategory)
- [ ] Add auto-save indicator UI
- [ ] Test all scenarios
- [ ] (Optional) Add auto-save to other steps (LocationStep, DetailsStep, etc.)

---

## 🚨 Important Notes

1. **Only auto-save when venueId exists** - The empty draft creation ensures this
2. **Debounce is critical** - Without it, you'll spam the database with every keystroke
3. **Show visual feedback** - "Saving..." indicator tells user it's working
4. **Handle errors gracefully** - If auto-save fails, log it but don't block the UI

---

## 📝 Next Steps (Optional Enhancements)

1. **Add auto-save to Step 2 (Location)** - Same pattern as Step 1
2. **Add auto-save to Step 3 (Details)** - Same pattern
3. **Add "Last saved" timestamp** - Show when draft was last updated
4. **Add offline support** - Queue auto-saves if user goes offline
5. **Add conflict resolution** - If user edits same venue in 2 tabs

---

## 🎯 Summary

With this implementation:
- Draft is created **instantly** when wizard opens
- Every field **auto-saves** 1 second after user stops typing
- User can **leave and come back** anytime
- No more "lost data" complaints!
