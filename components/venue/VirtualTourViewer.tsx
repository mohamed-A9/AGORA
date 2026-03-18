"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Navigation, ChevronDown } from "lucide-react";
import { useLang } from "@/components/LanguageContext";

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

type SlideDir = 'up' | 'down' | 'left' | 'right' | 'fade';
type AnimState = 'idle' | 'exit' | 'enter';

// Convert rotation degrees to closest slide direction
function rotationToDir(rotation: number): SlideDir {
    const r = ((rotation % 360) + 360) % 360;
    if (r >= 315 || r < 45) return 'up';
    if (r >= 45 && r < 135) return 'right';
    if (r >= 135 && r < 225) return 'down';
    return 'left';
}

function oppositeDir(d: SlideDir): SlideDir {
    if (d === 'up') return 'down';
    if (d === 'down') return 'up';
    if (d === 'left') return 'right';
    if (d === 'right') return 'left';
    return 'fade';
}

// CSS classes for slide out
function exitClass(dir: SlideDir): string {
    if (dir === 'up') return 'translate-y-[-100%] scale-[1.05]';
    if (dir === 'down') return 'translate-y-[100%] scale-[1.05]';
    if (dir === 'left') return 'translate-x-[-100%] scale-[1.05]';
    if (dir === 'right') return 'translate-x-[100%] scale-[1.05]';
    return 'opacity-0 scale-[1.05]';
}

// CSS classes for enter (start position)
function enterStartClass(dir: SlideDir): string {
    if (dir === 'up') return 'translate-y-[100%]';
    if (dir === 'down') return 'translate-y-[-100%]';
    if (dir === 'left') return 'translate-x-[100%]';
    if (dir === 'right') return 'translate-x-[-100%]';
    return 'opacity-0';
}

export default function VirtualTourViewer({ scenes, isOpen, onClose }: VirtualTourViewerProps) {
    const { t } = useLang();
    const [currentSceneId, setCurrentSceneId] = useState<string | null>(null);
    const [displaySceneId, setDisplaySceneId] = useState<string | null>(null);
    const [animState, setAnimState] = useState<AnimState>('idle');
    const [exitDir, setExitDir] = useState<SlideDir>('fade');
    const [enterDir, setEnterDir] = useState<SlideDir>('fade');
    const [hoveredArrowId, setHoveredArrowId] = useState<string | null>(null);
    const [clickedArrowId, setClickedArrowId] = useState<string | null>(null);
    const pendingScene = useRef<string | null>(null);
    const animating = useRef(false);

    // Init on open
    useEffect(() => {
        if (isOpen && scenes.length > 0) {
            setCurrentSceneId(scenes[0].id);
            setDisplaySceneId(scenes[0].id);
            setAnimState('idle');
        }
    }, [isOpen, scenes]);

    // Lock body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleNavigate = useCallback((targetId: string, dir: SlideDir) => {
        if (animating.current || targetId === currentSceneId) return;
        animating.current = true;
        pendingScene.current = targetId;

        const opp = oppositeDir(dir);
        setExitDir(dir);
        setEnterDir(opp);
        setAnimState('exit');

        // After exit: swap scene + trigger enter
        setTimeout(() => {
            setCurrentSceneId(targetId);
            setDisplaySceneId(targetId);
            setAnimState('enter');
            // After enter: back to idle
            setTimeout(() => {
                setAnimState('idle');
                animating.current = false;
            }, 420);
        }, 350);
    }, [currentSceneId]);

    if (!isOpen || !scenes.length) return null;

    const currentScene = scenes.find(s => s.id === (displaySceneId || scenes[0].id));
    const navHotspots = currentScene?.hotspots.filter(h => h.type === 'navigation' && h.targetSceneId) || [];

    const imageClass = (() => {
        if (animState === 'exit') return `${exitClass(exitDir)} opacity-0`;
        if (animState === 'enter') return `${enterStartClass(enterDir)}`;
        return 'translate-x-0 translate-y-0 opacity-100 scale-100';
    })();

    return (
        <div className="fixed inset-0 z-[300] bg-black flex flex-col overflow-hidden animate-in fade-in duration-300">
            {/* Header */}
            <div className="absolute top-0 inset-x-0 z-50 flex items-center justify-between p-4 md:p-6 bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none">
                <div className="flex items-center gap-3 pointer-events-auto">
                    <div className="p-2.5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl">
                        <Navigation className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-base md:text-xl font-black text-white uppercase tracking-tighter">{t('tourTitle')}</h2>
                        <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">{currentScene?.name}</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="pointer-events-auto p-3 md:p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl border border-white/10 transition-all hover:rotate-90 duration-300 shadow-xl"
                >
                    <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
            </div>

            {/* Instruction hint */}
            <div className="absolute top-20 inset-x-0 z-40 flex justify-center pointer-events-none">
                <div className="px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                    {t('tourInstructions')}
                </div>
            </div>

            {/* Main image stage */}
            <div className="flex-1 relative overflow-hidden">
                {currentScene && (
                    <div
                        className={`absolute inset-0 transition-all duration-[380ms] ease-in-out ${imageClass}`}
                        style={{ willChange: 'transform, opacity' }}
                    >
                        <img
                            src={currentScene.image}
                            className="w-full h-full object-cover select-none pointer-events-none"
                            alt={currentScene.name}
                            draggable={false}
                        />

                        {/* Dark vignette overlay for depth */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

                        {/* Navigation Arrows Layer */}
                        <div className="absolute inset-0 z-20">
                            {navHotspots.map(spot => {
                                const targetScene = scenes.find(s => s.id === spot.targetSceneId);
                                const dir = rotationToDir(spot.rotation || 0);
                                const isHovered = hoveredArrowId === spot.id;
                                const isClicked = clickedArrowId === spot.id;

                                return (
                                    <button
                                        key={spot.id}
                                        className="absolute group"
                                        style={{
                                            left: `${spot.x}%`,
                                            top: `${spot.y}%`,
                                            transform: 'translate(-50%, -50%)',
                                            zIndex: isHovered ? 30 : 20,
                                        }}
                                        onMouseEnter={() => setHoveredArrowId(spot.id)}
                                        onMouseLeave={() => setHoveredArrowId(null)}
                                        onClick={() => {
                                            if (!spot.targetSceneId) return;
                                            setClickedArrowId(spot.id);
                                            setTimeout(() => setClickedArrowId(null), 400);
                                            handleNavigate(spot.targetSceneId, dir);
                                        }}
                                        aria-label={`Navigate to ${targetScene?.name}`}
                                    >
                                        {/* Pulse ring */}
                                        <div className={`absolute inset-0 rounded-full bg-cyan-400/30 animate-ping ${isHovered ? 'opacity-60' : 'opacity-30'}`}
                                            style={{ width: 56, height: 56, margin: -4 }}
                                        />

                                        {/* Arrow container */}
                                        <div
                                            className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-2xl border-2
                                                ${isClicked
                                                    ? 'scale-90 bg-cyan-400/70 border-cyan-300'
                                                    : isHovered
                                                        ? 'scale-125 bg-cyan-400/40 border-cyan-400 shadow-[0_0_24px_rgba(34,211,238,0.6)]'
                                                        : 'scale-100 bg-white/15 border-white/40 backdrop-blur-md shadow-[0_0_16px_rgba(255,255,255,0.15)]'
                                                }`}
                                            style={{ transform: `rotate(${spot.rotation || 0}deg)` }}
                                        >
                                            {/* Arrow SVG — always points up, rotation applied via parent */}
                                            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="drop-shadow-lg">
                                                <path
                                                    d="M11 3L4 14h5v5h4v-5h5L11 3z"
                                                    fill={isHovered || isClicked ? 'rgb(34,211,238)' : 'white'}
                                                    opacity={isHovered || isClicked ? 1 : 0.9}
                                                />
                                            </svg>
                                        </div>

                                        {/* Tooltip with scene name + thumbnail */}
                                        {isHovered && targetScene && (
                                            <div
                                                className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 pointer-events-none z-50 animate-in fade-in zoom-in-95 duration-150"
                                                style={{ transform: `translateX(-50%) rotate(-${spot.rotation || 0}deg)` }}
                                            >
                                                <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl min-w-[120px]">
                                                    {targetScene.image && (
                                                        <img
                                                            src={targetScene.image}
                                                            alt={targetScene.name}
                                                            className="w-full h-16 object-cover"
                                                        />
                                                    )}
                                                    <div className="px-3 py-2 text-center">
                                                        <span className="text-white text-[11px] font-black uppercase tracking-widest whitespace-nowrap">
                                                            {targetScene.name}
                                                        </span>
                                                    </div>
                                                </div>
                                                {/* Triangle pointer */}
                                                <div className="w-0 h-0 mx-auto border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-white/20" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom: Scene strip */}
            <div className="absolute bottom-0 inset-x-0 z-50 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                <div className="flex justify-center">
                    <div className="flex gap-2 p-1.5 rounded-[2rem] bg-black/60 backdrop-blur-2xl border border-white/10 overflow-x-auto max-w-full" style={{ scrollbarWidth: 'none' }}>
                        {scenes.map((scene, idx) => {
                            const isActive = scene.id === (displaySceneId || scenes[0].id);
                            return (
                                <button
                                    key={scene.id}
                                    onClick={() => handleNavigate(scene.id, 'fade')}
                                    className={`relative shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${isActive
                                            ? 'border-cyan-400 scale-105 shadow-[0_0_12px_rgba(34,211,238,0.5)]'
                                            : 'border-transparent opacity-50 hover:opacity-80 hover:border-white/30'
                                        }`}
                                    style={{ width: 72, height: 48 }}
                                    title={scene.name}
                                >
                                    <img src={scene.image} className="w-full h-full object-cover" alt={scene.name} />
                                    <div className="absolute inset-0 bg-black/20" />
                                    {isActive && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="bg-cyan-400 text-black p-1 rounded-full shadow-lg">
                                                <Navigation className="w-2.5 h-2.5 fill-current" />
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 py-1">
                                        <p className="text-[8px] text-white/80 font-bold uppercase tracking-widest truncate text-center">{scene.name}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Scene count indicator */}
                <div className="flex justify-center mt-2">
                    <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">
                        {scenes.findIndex(s => s.id === displaySceneId) + 1} / {scenes.length}
                    </span>
                </div>
            </div>
        </div>
    );
}
