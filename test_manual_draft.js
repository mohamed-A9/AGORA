// Manual test: Create a draft venue directly via API
// This will help us verify if the issue is in the API or the frontend

const createDraftManually = async () => {
    try {
        console.log('🧪 Testing draft creation API...\n');

        // Create form data
        const formData = new FormData();
        formData.append('name', 'Manual Test Venue');
        formData.append('category', 'RESTAURANT');
        formData.append('description', 'This is a test');

        // Call the API
        const response = await fetch('http://localhost:3000/api/venues/create-empty-draft', {
            method: 'POST',
            credentials: 'include' // Important for auth cookies
        });

        const data = await response.json();

        console.log('Response status:', response.status);
        console.log('Response data:', data);

        if (data.success) {
            console.log('\n✅ SUCCESS! Draft created with ID:', data.venueId);
            console.log('\nNow check database:');
            console.log('  node check_drafts_status.js');
        } else {
            console.log('\n❌ FAILED:', data.error);
        }

    } catch (error) {
        console.error('\n❌ Error:', error);
    }
};

// Run in browser console on http://localhost:3000/business/add-venue
// Just paste this whole script and press Enter
createDraftManually();
