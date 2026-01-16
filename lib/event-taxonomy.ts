export const EVENT_TYPES = [
    {
        id: "Music",
        label: "Music & Concerts",
        genres: ["Live Band", "DJ Set", "Acoustic", "Jazz", "Rock", "Classical", "Electronic", "Hip Hop", "Open Mic", "Karaoke"]
    },
    {
        id: "Nightlife",
        label: "Nightlife & Party",
        genres: ["Clubbing", "Rave", "Theme Party", "Ladies Night", "Student Night", "VIP Event", "Afterwork", "Beach Party", "Boat Party"]
    },
    {
        id: "Culture",
        label: "Arts & Culture",
        genres: ["Exhibition", "Theatre", "Stand-up Comedy", "Cinema / Screening", "Poetry Slam", "Book Signing", "Workshop", "Dance Performance"]
    },
    {
        id: "Food",
        label: "Food & Drink",
        genres: ["Wine Tasting", "Brunch", "Dinner Show", "Cooking Class", "Food Festival", "Cocktail Masterclass"]
    },
    {
        id: "Professional",
        label: "Professional & Networking",
        genres: ["Conference", "Seminar", "Networking", "Workshop", "Hackathon", "Product Launch"]
    },
    {
        id: "Social",
        label: "Social & Community",
        genres: ["Quiz Night", "Speed Dating", "Bingo", "Charity Event", "Meetup", "Sports Screening"]
    }
];

export const getGenresForType = (typeId: string) => {
    const type = EVENT_TYPES.find(t => t.id === typeId);
    return type ? type.genres : [];
};
