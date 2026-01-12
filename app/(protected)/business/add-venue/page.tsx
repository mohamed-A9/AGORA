import VenueWizard from "@/components/venue-wizard/VenueWizard";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Add New Venue | AGORA Business",
    description: "List your venue regarding our quality standards.",
};

export default function AddVenuePage() {
    return <VenueWizard />;
}
