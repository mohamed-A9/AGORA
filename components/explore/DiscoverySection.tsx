"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface DiscoverySectionProps {
    title: string;
    subtitle?: string;
    actionHref?: string;
    actionLabel?: string;
    children: React.ReactNode;
}

export default function DiscoverySection({ title, subtitle, actionHref, actionLabel = "View All", children }: DiscoverySectionProps) {
    return (
        <section className="py-8 border-b border-white/5 last:border-0">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex items-end justify-between mb-6">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
                        {subtitle && <p className="text-white/50 text-sm mt-1">{subtitle}</p>}
                    </div>
                    {actionHref && (
                        <Link href={actionHref} className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                            {actionLabel} <ArrowRight size={14} />
                        </Link>
                    )}
                </div>
            </div>

            {/* Container for content - handling scroll vs grid */}

            {/* 
               Mobile: Horizontal Scroll with padding 
               Desktop: Grid
            */}
            <div className="overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible scrollbar-hide md:max-w-7xl md:mx-auto md:px-8">
                <div className="flex md:flex-wrap md:justify-center gap-4 w-max md:w-full min-w-full md:min-w-0 pr-4 md:pr-0">
                    {children}
                    {/* Spacer for mobile right padding */}
                    <div className="w-2 md:hidden flex-shrink-0" />
                </div>
            </div>
        </section>
    );
}
