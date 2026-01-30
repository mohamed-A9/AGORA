import EditableVenuePage from "@/components/EditableVenuePage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Add New Venue | AGORA Business",
    description: "Create your venue directly on the page.",
};


export default function AddVenuePage() {
    return <EditableVenuePage />;
}
