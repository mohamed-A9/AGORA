import EditableVenuePage from "@/components/EditableVenuePage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Add New Venue | AGORA Business",
    description: "Create your venue directly on the page.",
};


import { Suspense } from "react";

export default function AddVenuePage() {
    return (
        <Suspense fallback={<div className="text-white text-center py-20">Loading...</div>}>
            <EditableVenuePage />
        </Suspense>
    );
}
