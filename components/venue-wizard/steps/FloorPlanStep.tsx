"use client";

import FloorPlanEditor from "../FloorPlanEditor";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function FloorPlanStep({
    venueId,
    initialData,
    onBack,
    onNext,
    onDataChange
}: {
    venueId: string,
    initialData?: any,
    onBack: () => void,
    onNext: () => void,
    onDataChange?: (data: any) => void
}) {

    const handleSave = (scenes: any) => {
        // Persist to parent state (which syncs to localStorage)
        if (onDataChange) {
            onDataChange({
                floorPlan: {
                    ...(initialData?.floorPlan || {}),
                    scenes: scenes
                }
            });
        }
    };

    return (
        <div className="h-[800px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Interactive Floor Plan</h2>
                    <p className="text-zinc-400 text-sm">Design your virtual tour by linking photos and defining tables.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onBack}
                        className="px-4 py-2 text-sm font-bold text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                        onClick={onNext}
                        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-sm font-bold flex items-center gap-2 transition-transform hover:scale-105 shadow-lg shadow-emerald-500/20"
                    >
                        Review & Publish <CheckCircle className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 min-h-0 border border-zinc-800 rounded-xl overflow-hidden bg-black/50">
                <FloorPlanEditor
                    initialScenes={initialData?.floorPlan?.scenes || []}
                    onSave={handleSave}
                />
            </div>
        </div>
    );
}
