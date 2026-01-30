"use client";

import { useEffect, useState } from "react";

interface TimePickerProps {
    value: string; // Format "HH:mm"
    onChange: (value: string) => void;
    label?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = ["00", "15", "30", "45"];

export default function TimePicker({ value, onChange, label }: TimePickerProps) {
    const [hours, setHours] = useState("09");
    const [minutes, setMinutes] = useState("00");

    useEffect(() => {
        if (value && value.includes(":")) {
            const [h, m] = value.split(":");
            setHours(h.padStart(2, '0'));
            setMinutes(m.padStart(2, '0'));
        }
    }, [value]);

    const handleHourChange = (newH: string) => {
        setHours(newH);
        onChange(`${newH}:${minutes}`);
    };

    const handleMinuteChange = (newM: string) => {
        setMinutes(newM);
        onChange(`${hours}:${newM}`);
    };

    return (
        <div className="flex items-center gap-2">
            {label && <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 whitespace-nowrap">{label}</label>}
            <div className="flex items-center bg-zinc-900 border border-white/10 rounded-lg overflow-hidden hover:border-indigo-500/50 transition-all shadow-inner shadow-black/20 group h-[32px]">
                {/* Hours Selection */}
                <select
                    value={hours}
                    onChange={(e) => handleHourChange(e.target.value)}
                    className="bg-transparent border-none text-center text-white text-xs font-bold outline-none cursor-pointer appearance-none py-1.5 px-2 group-hover:bg-white/5 transition-colors"
                >
                    {HOURS.map(h => <option key={h} value={h} className="bg-zinc-900 text-white">{h}</option>)}
                </select>

                <div className="w-px h-4 bg-white/10" />

                <span className="text-zinc-600 font-bold px-0.5 text-xs">:</span>

                <div className="w-px h-4 bg-white/10" />

                {/* Minutes Selection */}
                <select
                    value={minutes}
                    onChange={(e) => handleMinuteChange(e.target.value)}
                    className="bg-transparent border-none text-center text-white text-xs font-bold outline-none cursor-pointer appearance-none py-1.5 px-2 group-hover:bg-white/5 transition-colors"
                >
                    {MINUTES.map(m => <option key={m} value={m} className="bg-zinc-900 text-white">{m}</option>)}
                    {/* Preserve values like :01 if they come from DB */}
                    {!MINUTES.includes(minutes) && <option value={minutes}>{minutes}</option>}
                </select>

                <div className="pr-2 pointer-events-none text-zinc-600 group-hover:text-indigo-400 transition-colors text-[8px]">
                    ▼
                </div>
            </div>
        </div>
    );
}
