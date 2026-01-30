"use client";

import { useEffect, useState } from "react";
import { X, AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

type NotificationType = "success" | "error" | "warning" | "info";

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: NotificationType;
}

const iconMap = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

const colorMap = {
    success: "text-emerald-400 bg-emerald-500/20",
    error: "text-red-400 bg-red-500/20",
    warning: "text-amber-400 bg-amber-500/20",
    info: "text-blue-400 bg-blue-500/20",
};

const borderMap = {
    success: "border-emerald-500/30",
    error: "border-red-500/30",
    warning: "border-amber-500/30",
    info: "border-blue-500/30",
};

export default function NotificationModal({
    isOpen,
    onClose,
    title,
    message,
    type = "info",
}: NotificationModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    const Icon = iconMap[type];

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={`relative w-full max-w-md transform transition-all duration-300 ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
                    }`}
            >
                <div className={`bg-zinc-900 border ${borderMap[type]} rounded-2xl shadow-2xl overflow-hidden`}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${colorMap[type]}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-white">{title}</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-5">
                        <div className="text-white/70 whitespace-pre-line leading-relaxed">
                            {message}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-white text-black rounded-xl font-bold text-sm hover:bg-white/90 transition-colors"
                        >
                            OK
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
