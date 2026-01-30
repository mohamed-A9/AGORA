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

// Reduced particle count for performance
const PARTICLE_COUNT = 15;

function makeParticles(count: number): Particle[] {
    return Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.round(Math.random() * 100),
        y: Math.round(Math.random() * 100),
        s: 50 + Math.round(Math.random() * 150), // Slightly smaller max size
        d: 10 + Math.round(Math.random() * 10), // Slower animation (easier on GPU)
        delay: Math.round(Math.random() * 10) / 10,
        o: 0.05 + Math.random() * 0.1, // Lower opacity
    }));
}

export default function AuroraBackground({ children }: { children: React.ReactNode }) {
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        // Client-side only generation to avoid hydration mismatch
        setParticles(makeParticles(PARTICLE_COUNT));
    }, []);

    return (
        <div className="relative min-h-screen w-full bg-[#050B14]">
            {/* Intense Aurora Background (Optimized: Reduced Blur amount if possible, but keeping for style) */}
            <div className="fixed inset-0 w-full h-full bg-[#050B14] pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/30 blur-[80px] animate-pulse mix-blend-screen will-change-transform" />
                <div className="absolute top-[0%] right-[-10%] w-[40%] h-[50%] rounded-full bg-cyan-500/20 blur-[100px] animate-pulse delay-75 will-change-transform" />
                <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[50%] rounded-full bg-indigo-500/30 blur-[80px] animate-pulse delay-150 will-change-transform" />
                <div className="absolute bottom-[10%] right-[5%] w-[40%] h-[40%] rounded-full bg-fuchsia-500/20 blur-[80px] animate-pulse delay-300 will-change-transform" />
            </div>

            {/* Cyber Grid - Sharper */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

            {/* Super Glowing Particles */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                {particles.map((p) => (
                    <span
                        key={p.id}
                        className="absolute rounded-full"
                        style={{
                            left: `${p.x}%`,
                            top: `${p.y}%`,
                            width: Math.max(3, p.s / 15),
                            height: Math.max(3, p.s / 15),
                            opacity: Math.min(1, p.o + 0.6),
                            background: "#fff",
                            boxShadow: "0 0 10px 2px rgba(255, 255, 255, 0.5)", // Reduced shadow radius for perf
                            animation: `floaty ${p.d}s ease-in-out ${p.delay}s infinite alternate`,
                            willChange: "transform", // Optimize animation
                        }}
                    />
                ))}
            </div>

            {/* Content */}
            <div className="relative z-10 w-full">
                {children}
            </div>

            <style jsx global>{`
        @keyframes floaty {
          from {
            transform: translate(-50%, -50%) translateY(0px) scale(1);
          }
          to {
            transform: translate(-50%, -50%) translateY(-20px) scale(1.05);
          }
        }
      `}</style>
        </div>
    );
}
