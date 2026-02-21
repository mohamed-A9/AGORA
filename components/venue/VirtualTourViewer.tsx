"use client";

import { useState, useEffect, useRef } from "react";
import { X, ChevronUp, ChevronLeft, ChevronRight, Navigation, Layout, Move, RotateCw } from "lucide-react";

interface Hotspot {
    id: string;
    x: number;
    y: number;
    label: string;
    type: 'table' | 'seat' | 'zone' | 'vip' | 'navigation';
    targetSceneId?: string;
    rotation?: number;
}

interface Scene {
    id: string;
    name: string;
    image: string;
    hotspots: Hotspot[];
}

interface VirtualTourViewerProps {
    scenes: Scene[];
    isOpen: boolean;
    onClose: () => void;
}

export default function VirtualTourViewer({ scenes, isOpen, onClose }: VirtualTourViewerProps) {
    const [currentSceneId, setCurrentSceneId] = useState<string | null>(scenes[0]?.id || null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [transitionDirection, setTransitionDirection] = useState<'left' | 'right' | 'fade'>('fade');

    if (!isOpen || !scenes.length) return null;

    const currentScene = scenes.find(s => s.id === currentSceneId);

    const handleNavigate = (targetId: string) => {
        if (isAnimating || targetId === currentSceneId) return;

        // Find direction (just for effect)
        const currentIdx = scenes.findIndex(s => s.id === currentSceneId);
        const targetIdx = scenes.findIndex(s => s.id === targetId);
        setTransitionDirection(targetIdx > currentIdx ? 'right' : 'left');

        setIsAnimating(true);
        setTimeout(() => {
            setCurrentSceneId(targetId);
            setIsAnimating(false);
        }, 400);
    };

    return (
        <div className="fixed inset-0 z-[300] bg-black flex flex-col overflow-hidden animate-in fade-in duration-300">
            {/* Header */}
            <div className="absolute top-0 inset-x-0 z-50 flex items-center justify-between p-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <div className="flex items-center gap-4 pointer-events-auto">
                    <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                        <Navigation className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter">Visite Virtuelle</h2>
                        <p className="text-xs text-white/50 font-bold uppercase tracking-widest">{currentScene?.name}</p>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="pointer-events-auto p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl border border-white/10 transition-all hover:rotate-90"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Viewer Stage */}
            <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                {currentScene && (
                    <div className={`relative w-full h-full flex items-center justify-center transition-all duration-500 ${isAnimating ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}>
                        <img
                            src={currentScene.image}
                            className="w-full h-full object-cover sm:object-contain select-none pointer-events-none"
                            alt={currentScene.name}
                        />

                        {/* Arrows Layer */}
                        <div className="absolute inset-0 z-20 flex items-center justify-center">
                            <div className="relative w-full h-full max-w-[1200px] max-h-[800px] mx-auto">
                                <div className="absolute inset-0">
                                    {currentScene.hotspots.map(spot => {
                                        if (spot.type === 'navigation' && spot.targetSceneId) {
                                            return (
                                                <button
                                                    key={spot.id}
                                                    onClick={() => handleNavigate(spot.targetSceneId!)}
                                                    className="absolute w-12 h-12 -ml-6 -mt-6 group"
                                                    style={{
                                                        left: `${spot.x}%`,
                                                        top: `${spot.y}%`,
                                                        transform: `rotate(${spot.rotation || 0}deg)`
                                                    }}
                                                >
                                                    <div className="relative w-full h-full rounded-full bg-white/20 backdrop-blur-md border-2 border-white/40 shadow-xl group-hover:scale-125 group-hover:bg-white/40 transition-all flex items-center justify-center overflow-hidden">
                                                        <ChevronUp className="w-8 h-8 text-white drop-shadow-lg" />
                                                        <div className="absolute inset-0 bg-white/20 animate-ping opacity-20 rounded-full" />
                                                    </div>

                                                    {/* Tooltip */}
                                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                        {scenes.find(s => s.id === spot.targetSceneId)?.name}
                                                    </div>
                                                </button>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {isAnimating && (
                    <div className="absolute inset-0 z-40 bg-black/20 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
                        <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin" />
                    </div>
                )}
            </div>

            {/* Bottom Scene Selector */}
            <div className="absolute bottom-6 inset-x-0 z-50 px-6 flex justify-center pointer-events-none">
                <div className="pointer-events-auto flex gap-2 p-2 rounded-[2rem] bg-black/50 backdrop-blur-2xl border border-white/10 overflow-x-auto max-w-full scrollbar-hide">
                    {scenes.map(scene => (
                        <button
                            key={scene.id}
                            onClick={() => handleNavigate(scene.id)}
                            className={`relative shrink-0 w-20 aspect-video rounded-2xl overflow-hidden border-2 transition-all ${currentSceneId === scene.id ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-80'}`}
                        >
                            <img src={scene.image} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/20" />
                            {currentSceneId === scene.id && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-white text-black p-1 rounded-full">
                                        <Navigation className="w-3 h-3 fill-current" />
                                    </div>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
