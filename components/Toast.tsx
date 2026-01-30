"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface ToastProps {
    message: string;
    type?: "success" | "error" | "info";
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, type = "info", onClose, duration = 5000 }: ToastProps) {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const colors = {
        success: "bg-emerald-500/20 border-emerald-500/50 text-emerald-200",
        error: "bg-red-500/20 border-red-500/50 text-red-200",
        info: "bg-indigo-500/20 border-indigo-500/50 text-indigo-200"
    };

    const icons = {
        success: "✓",
        error: "✕",
        info: "ℹ"
    };

    return (
        <div className={`fixed top-4 right-4 z-[9999] max-w-md animate-in slide-in-from-top-5 fade-in ${colors[type]} border-2 rounded-xl p-4 shadow-2xl backdrop-blur-sm`}>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center font-bold">
                    {icons[type]}
                </div>
                <div className="flex-1 text-sm leading-relaxed">{message}</div>
                <button
                    onClick={onClose}
                    className="flex-shrink-0 text-white/50 hover:text-white transition-colors"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
}
