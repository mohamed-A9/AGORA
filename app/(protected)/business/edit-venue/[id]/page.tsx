"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EditVenuePage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();

    useEffect(() => {
        if (params.id) {
            router.replace(`/business/add-venue?id=${params.id}`);
        }
    }, [params.id, router]);

    return (
        <div className="min-h-screen flex items-center justify-center text-white/40 text-sm">
            Chargement de l'éditeur...
        </div>
    );
}
