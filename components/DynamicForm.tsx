
"use client";

import { useEffect, useState } from "react";

interface FieldDefinition {
    field_key: string;
    field_type: string;
    label_en: string;
    label_fr: string;
    label_ar: string;
    required: boolean;
    options: any;
    sort_order: number;
}

interface DynamicFormProps {
    fields: FieldDefinition[];
    onChange: (values: Record<string, any>) => void;
    initialValues?: Record<string, any>;
}

export default function DynamicForm({ fields, onChange, initialValues = {} }: DynamicFormProps) {
    const [formValues, setFormValues] = useState<Record<string, any>>(initialValues);

    useEffect(() => {
        // Determine default values based on fields if not present
        const defaults: Record<string, any> = { ...initialValues };
        fields.forEach(f => {
            if (defaults[f.field_key] === undefined) {
                if (f.field_type === 'boolean') defaults[f.field_key] = false;
                if (f.field_type === 'multi_select') defaults[f.field_key] = [];
            }
        });
        setFormValues(defaults);
        // eslint-disable-next-line
    }, [fields]); // Reset/Init when fields change

    // Bubble up changes
    useEffect(() => {
        onChange(formValues);
    }, [formValues, onChange]);

    const handleChange = (key: string, value: any) => {
        setFormValues(prev => ({ ...prev, [key]: value }));
    };

    const toggleMultiSelect = (key: string, optionValue: string) => {
        setFormValues(prev => {
            const current = prev[key] || [];
            if (current.includes(optionValue)) {
                return { ...prev, [key]: current.filter((v: string) => v !== optionValue) };
            } else {
                return { ...prev, [key]: [...current, optionValue] };
            }
        });
    };

    if (fields.length === 0) return null;

    return (
        <div className="rounded-xl bg-zinc-900 p-6 border border-white/10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                Specific Details
                <span className="text-xs font-normal text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                    {fields.length} fields
                </span>
            </h2>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {fields.map((field) => (
                    <div key={field.field_key} className={field.field_type === 'boolean' ? "sm:col-span-1 flex items-end" : "sm:col-span-1"}>

                        {/* RENDER LOGIC */}

                        {/* TEXT / NUMBER */}
                        {(field.field_type === 'text' || field.field_type === 'number') && (
                            <div className="w-full space-y-2">
                                <label className="text-sm font-medium text-zinc-300">
                                    {field.label_en} {field.required && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                    type={field.field_type}
                                    className="w-full rounded-md bg-zinc-800 border-zinc-700 text-white focus:border-indigo-500 px-4 py-2"
                                    value={formValues[field.field_key] || ''}
                                    onChange={(e) => handleChange(field.field_key, e.target.value)}
                                    placeholder={field.field_type === 'number' ? '0' : ''}
                                />
                            </div>
                        )}

                        {/* SINGLE SELECT */}
                        {field.field_type === 'single_select' && (
                            <div className="w-full space-y-2">
                                <label className="text-sm font-medium text-zinc-300">
                                    {field.label_en} {field.required && <span className="text-red-500">*</span>}
                                </label>
                                <select
                                    className="w-full rounded-md bg-zinc-800 border-zinc-700 text-white focus:border-indigo-500 px-4 py-2"
                                    value={formValues[field.field_key] || ''}
                                    onChange={(e) => handleChange(field.field_key, e.target.value)}
                                >
                                    <option value="">Select...</option>
                                    {(field.options as any[])?.map((opt: any) => (
                                        <option key={opt.value} value={opt.value}>{opt.label_en}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* MULTI SELECT */}
                        {field.field_type === 'multi_select' && (
                            <div className="w-full space-y-2 sm:col-span-2">
                                <label className="text-sm font-medium text-zinc-300 block mb-2">
                                    {field.label_en} {field.required && <span className="text-red-500">*</span>}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {(field.options as any[])?.map((opt: any) => {
                                        const isSelected = (formValues[field.field_key] || []).includes(opt.value);
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => toggleMultiSelect(field.field_key, opt.value)}
                                                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${isSelected
                                                    ? 'bg-indigo-600 border-indigo-500 text-white'
                                                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                                                    }`}
                                            >
                                                {opt.label_en}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* BOOLEAN */}
                        {field.field_type === 'boolean' && (
                            <div className="flex items-center gap-3 w-full p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                                <input
                                    type="checkbox"
                                    id={field.field_key}
                                    className="w-5 h-5 rounded border-zinc-600 bg-zinc-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-zinc-900"
                                    checked={!!formValues[field.field_key]}
                                    onChange={(e) => handleChange(field.field_key, e.target.checked)}
                                />
                                <label htmlFor={field.field_key} className="text-sm font-medium text-zinc-200 cursor-pointer select-none">
                                    {field.label_en}
                                </label>
                            </div>
                        )}

                    </div>
                ))}
            </div>
        </div>
    );
}
