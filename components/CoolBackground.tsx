"use client";

import { useEffect, useState } from "react";

type Particle = {
    id: number;
    x: number;
    y: number;
    s: number;
    d: number;
    delay: number;
    o: number;
};

function makeParticles(count: number): Particle[] {
    return Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.round(Math.random() * 100),
        y: Math.round(Math.random() * 100),
        s: 80 + Math.round(Math.random() * 220),
        d: 6 + Math.round(Math.random() * 10),
        delay: Math.round(Math.random() * 10) / 10,
        o: 0.08 + Math.random() * 0.1,
    }));
}

export default function CoolBackground() {
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        setParticles(makeParticles(12));
    }, []);

    return (
        <div className="fixed inset-0 -z-10 bg-[#070A12] overflow-hidden">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-[radial-gradient(1000px_700px_at_20%_20%,rgba(99,102,241,0.18),transparent_55%),radial-gradient(900px_600px_at_80%_30%,rgba(236,72,153,0.14),transparent_55%),radial-gradient(900px_700px_at_50%_90%,rgba(245,158,11,0.10),transparent_60%)]" />
            <div className="absolute inset-0 opacity-60 animate-[pulse_6s_ease-in-out_infinite]" />

            {/* Floating blobs */}
            <div className="absolute inset-0">
                {particles.map((p) => (
                    <span
                        key={p.id}
                        className="absolute rounded-full blur-3xl"
                        style={{
                            left: `${p.x}%`,
                            top: `${p.y}%`,
                            width: p.s,
                            height: p.s,
                            opacity: p.o,
                            transform: "translate(-50%, -50%)",
                            background:
                                "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.60), rgba(99,102,241,0.32), rgba(236,72,153,0.20), rgba(0,0,0,0))",
                            animation: `floaty ${p.d}s ease-in-out ${p.delay}s infinite alternate`,
                        }}
                    />
                ))}
            </div>

            {/* Grid */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:56px_56px]" />

            <style jsx global>{`
        @keyframes floaty {
          from {
            transform: translate(-50%, -50%) translateY(0px) scale(1);
          }
          to {
            transform: translate(-50%, -50%) translateY(-22px) scale(1.04);
          }
        }
      `}</style>
        </div>
    );
}
