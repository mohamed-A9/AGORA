"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

interface DatePickerProps {
    value?: string | Date; // Can be ISO string or Date object
    onChange?: (date: Date) => void;
    name?: string; // For form submission
    label?: string;
    placeholder?: string;
    minDate?: Date;
    maxDate?: Date;
    enableYearSelection?: boolean;
    className?: string;
}

const DAYS = ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'];
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export default function DatePicker({
    value: initialValue,
    onChange,
    name,
    label,
    placeholder = "Sélectionner une date",
    minDate,
    maxDate,
    enableYearSelection = false,
    className = ""
}: DatePickerProps) {
    // Parse initial value
    const parseDate = (v: any) => {
        if (!v) return null;
        const d = new Date(v);
        return isNaN(d.getTime()) ? null : d;
    };

    const [selectedDate, setSelectedDate] = useState<Date | null>(parseDate(initialValue));
    const [viewDate, setViewDate] = useState<Date>(parseDate(initialValue) || new Date());
    const [isOpen, setIsOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'day' | 'month' | 'year'>('day'); // New state for view switching
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Update internal state if prop changes
    useEffect(() => {
        if (initialValue) setSelectedDate(parseDate(initialValue));
    }, [initialValue]);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen) setViewMode('day'); // Reset view on open
    };

    const handleDateSelect = (day: number) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        newDate.setHours(12, 0, 0, 0);

        setSelectedDate(newDate);
        onChange?.(newDate);
        setIsOpen(false);
    };

    const changeMonth = (delta: number) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setViewDate(newDate);
    };

    const changeYearPage = (delta: number) => {
        // Logic for paging years if needed, or just standard prev/next year
        const newDate = new Date(viewDate);
        newDate.setFullYear(newDate.getFullYear() + delta);
        setViewDate(newDate);
    }

    // Calendar Year/Month Logic
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday

    // Generate Year Options
    const currentYear = new Date().getFullYear();
    // If year selection enabled (Birthday), show long range. Else short range.
    const startYear = enableYearSelection ? currentYear - 100 : currentYear - 1;
    const endYear = enableYearSelection ? currentYear : currentYear + 5;

    // Create array of years for the Year View
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => endYear - i);

    const formatDate = (d: Date | null) => {
        if (!d) return "";
        // Numeric format: DD / MM / YYYY
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        return `${day} / ${month} / ${year}`;
    };

    const hiddenValue = selectedDate ? selectedDate.toISOString().split('T')[0] : "";

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && <label className="text-xs uppercase font-bold text-zinc-500 mb-2 block ml-1">{label}</label>}

            {/* Trigger */}
            <div
                onClick={toggleOpen}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-3 text-white hover:border-indigo-500/50 cursor-pointer transition-all flex items-center justify-between group"
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <CalendarIcon className="w-5 h-5 text-zinc-500 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
                    <span className={`truncate whitespace-nowrap ${selectedDate ? "text-white" : "text-zinc-600"}`}>
                        {selectedDate ? formatDate(selectedDate) : placeholder}
                    </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-zinc-600 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {name && <input type="hidden" name={name} value={hiddenValue} />}

            {/* Popover */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl p-4 w-[320px] animate-in fade-in zoom-in-95 min-h-[340px] flex flex-col">

                    {/* --- DAY VIEW --- */}
                    {viewMode === 'day' && (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <button type="button" onClick={() => changeMonth(-1)} className="p-1 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white">
                                    <ChevronLeft size={20} />
                                </button>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('month')}
                                        className="font-bold text-white hover:bg-white/10 px-2 py-1 rounded transition-colors"
                                    >
                                        {MONTHS[month]}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('year')}
                                        className="font-bold text-indigo-400 hover:bg-indigo-500/10 px-2 py-1 rounded transition-colors"
                                    >
                                        {year}
                                    </button>
                                </div>

                                <button type="button" onClick={() => changeMonth(1)} className="p-1 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white">
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-7 mb-2">
                                {DAYS.map(d => <div key={d} className="text-center text-xs text-zinc-500 font-bold py-1">{d}</div>)}
                            </div>

                            <div className="grid grid-cols-7 gap-1 flex-1 content-start">
                                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                    <div key={`empty-${i}`} />
                                ))}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const day = i + 1;
                                    const d = new Date(year, month, day);
                                    const isSelected = selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
                                    const isToday = new Date().toDateString() === d.toDateString();

                                    // Min/Max logic (visual only for now)
                                    const isDisabled = (minDate && d < new Date(minDate.setHours(0, 0, 0, 0))) || (maxDate && d > maxDate);

                                    return (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => !isDisabled && handleDateSelect(day)}
                                            disabled={isDisabled}
                                            className={`
                                        h-9 w-9 rounded-lg flex items-center justify-center text-sm font-medium transition-all
                                        ${isSelected ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'hover:bg-white/10 text-zinc-300'}
                                        ${isToday && !isSelected ? 'border border-indigo-500/50 text-indigo-400' : ''}
                                        ${isDisabled ? 'opacity-20 cursor-not-allowed hover:bg-transparent' : ''}
                                    `}
                                        >
                                            {day}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* --- MONTH VIEW --- */}
                    {viewMode === 'month' && (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-bold text-lg text-white px-2">Choisir un mois</span>
                                <button
                                    onClick={() => setViewMode('day')}
                                    className="text-indigo-400 text-sm font-bold hover:underline"
                                >
                                    Retour
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2 flex-1">
                                {MONTHS.map((m, i) => (
                                    <button
                                        key={m}
                                        onClick={() => {
                                            const d = new Date(viewDate);
                                            d.setMonth(i);
                                            setViewDate(d);
                                            setViewMode('day');
                                        }}
                                        className={`
                                    rounded-xl flex items-center justify-center font-bold text-sm transition-all
                                    ${i === month ? 'bg-indigo-500 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'}
                                `}
                                    >
                                        {m.substring(0, 3)}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {/* --- YEAR VIEW --- */}
                    {viewMode === 'year' && (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-bold text-lg text-white px-2">Choisir une année</span>
                                <button
                                    onClick={() => setViewMode('day')}
                                    className="text-indigo-400 text-sm font-bold hover:underline"
                                >
                                    Retour
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[260px]">
                                <div className="grid grid-cols-4 gap-2">
                                    {years.map((y) => (
                                        <button
                                            key={y}
                                            onClick={() => {
                                                const d = new Date(viewDate);
                                                d.setFullYear(y);
                                                setViewDate(d);
                                                setViewMode('month'); // User asked "click on that month give me to choose" 
                                                // Wait, user said: "click on year... give me years... click on year -> go to Month selection?" 
                                                // "and when click on that month give me... days"
                                                // So Flow: Years -> Months -> Days.
                                            }}
                                            className={`
                                        py-2 rounded-lg font-bold text-sm transition-all
                                        ${y === year ? 'bg-indigo-500 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'}
                                    `}
                                        >
                                            {y}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
