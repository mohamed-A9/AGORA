"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
    Upload, X, Plus, Trash2, ChevronUp, Check,
    ArrowRightCircle, Play, Layout, RotateCw,
    Link as LinkIcon, Move, Navigation, MousePointer2, ArrowLeft
} from "lucide-react";
import ConfirmationModal from "../ui/ConfirmationModal";

// --- Types ---
export interface Hotspot {
    id: string;
    x: number; // Percentage 0-100 relative to image
    y: number; // Percentage 0-100 relative to image
    label: string;
    type: 'table' | 'seat' | 'zone' | 'vip' | 'navigation';
    capacity?: number;
    price?: number;
    notes?: string;
    targetSceneId?: string;
    rotation?: number; // Degrees 0-360
    navDirection?: 'up' | 'down' | 'left' | 'right' | 'up-left' | 'up-right' | 'down-left' | 'down-right';
    isVip?: boolean;
    minSpend?: number;
}

export interface Scene {
    id: string;
    name: string;
    image: string | null;
    hotspots: Hotspot[];
}

export interface GridNode {
    scene: Scene;
    x: number;
    y: number;
}

interface PhotoMapEditorProps {
    initialScenes?: Scene[];
    onSave?: (scenes: Scene[]) => void;
}

export default function PhotoMapEditor({ initialScenes = [], onSave }: PhotoMapEditorProps) {
    // --- State ---
    const [editorStep, setEditorStep] = useState<1 | 2 | 3>(1);
    const [scenes, setScenes] = useState<Scene[]>(initialScenes.length > 0 ? initialScenes : []);
    const [activeSceneId, setActiveSceneId] = useState<string | null>(scenes.length > 0 ? scenes[0].id : null);
    const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
    const [draggingSpotId, setDraggingSpotId] = useState<string | null>(null);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [isPlacingArrow, setIsPlacingArrow] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Rotation drag state
    const [isRotating, setIsRotating] = useState(false);
    const rotationCenterRef = useRef<{ x: number; y: number } | null>(null);

    // Preview transition
    const [isAnimating, setIsAnimating] = useState(false);
    const [transitionData, setTransitionData] = useState<{ targetId: string; direction: string } | null>(null);
    const [displaySceneId, setDisplaySceneId] = useState<string | null>(null);

    // Refs
    const imageWrapperRef = useRef<HTMLDivElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const capacityInputRef = useRef<HTMLInputElement>(null);
    const touchStart = useRef<{ x: number; y: number } | null>(null);

    // Modal
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean; title: string; message: string;
        onConfirm: () => void; isDestructive?: boolean; confirmLabel?: string;
    }>({ isOpen: false, title: "", message: "", onConfirm: () => { } });

    // Derived
    const activeScene = activeSceneId ? scenes.find(s => s.id === activeSceneId) : null;

    // Sync display for preview
    useEffect(() => {
        if (!isAnimating && activeSceneId) setDisplaySceneId(activeSceneId);
    }, [activeSceneId, isAnimating]);

    // --- Core Actions ---
    const saveScenes = (newScenes: Scene[]) => {
        setScenes(newScenes);
        onSave?.(newScenes);
    };

    const updateScene = (id: string, updates: Partial<Scene>) => {
        saveScenes(scenes.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const deleteScene = (id: string) => {
        // Also remove nav hotspots pointing to this scene
        const cleaned = scenes.filter(s => s.id !== id).map(s => ({
            ...s,
            hotspots: s.hotspots.filter(h => h.targetSceneId !== id)
        }));
        saveScenes(cleaned);
        if (cleaned.length === 0) setEditorStep(1);
        else if (activeSceneId === id) setActiveSceneId(cleaned[0]?.id || null);
    };

    // --- Upload ---
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        setIsUploading(true);
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dt5sqovt9";
        const uploadedScenes: Scene[] = [];
        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("upload_preset", "agora_uploads");
                formData.append("folder", "venues/floorplans");
                const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, { method: "POST", body: formData });
                if (!res.ok) throw new Error("Upload failed");
                const data = await res.json();
                uploadedScenes.push({
                    id: Math.random().toString(36).substr(2, 9),
                    name: `Zone_${scenes.length + uploadedScenes.length + 1}`,
                    image: data.secure_url,
                    hotspots: []
                });
            }
            const updated = [...scenes, ...uploadedScenes];
            saveScenes(updated);
            if (!activeSceneId && updated.length > 0) setActiveSceneId(updated[0].id);
        } catch (err) {
            console.error("Upload error:", err);
            alert("Failed to upload image. Please try again.");
        } finally { setIsUploading(false); }
    };

    // --- Spot Actions ---
    const updateSpot = (spotId: string, updates: Partial<Hotspot>) => {
        const isPositional = Object.keys(updates).every(k => ['x', 'y', 'rotation'].includes(k));
        if (isPositional) {
            if (!activeScene) return;
            updateScene(activeScene.id, {
                hotspots: activeScene.hotspots.map(s => s.id === spotId ? { ...s, ...updates } : s)
            });
            return;
        }
        // Global sync for tables with same label
        let targetLabel = "";
        for (const s of scenes) {
            const f = s.hotspots.find(h => h.id === spotId);
            if (f) { targetLabel = f.label; break; }
        }
        if (!targetLabel) return;
        const updatedScenes = scenes.map(scene => ({
            ...scene,
            hotspots: scene.hotspots.map(h => {
                if (h.id === spotId) return { ...h, ...updates };
                if (h.type === 'table' && h.label === targetLabel) {
                    const { x, y, rotation, id, ...shared } = updates;
                    if (Object.keys(shared).length > 0) return { ...h, ...shared };
                }
                return h;
            })
        }));
        saveScenes(updatedScenes);
    };

    const deleteSpot = (spotId: string) => {
        if (!activeScene) return;
        updateScene(activeScene.id, { hotspots: activeScene.hotspots.filter(s => s.id !== spotId) });
        setSelectedSpotId(null);
    };

    // --- Table Placement (Step 2) ---
    const handleCanvasClick = (e: React.MouseEvent) => {
        if (editorStep !== 2 || isPreviewMode || !activeScene) return;
        if (selectedSpotId) { setSelectedSpotId(null); return; }
        const rect = imgRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        if (x < 0 || x > 100 || y < 0 || y > 100) return;
        const globalTableCount = scenes.reduce((c, s) => c + s.hotspots.filter(h => h.type === 'table').length, 0);
        const newSpot: Hotspot = {
            id: Math.random().toString(36).substr(2, 9), x, y,
            label: `T-${globalTableCount + 1}`, type: 'table', capacity: 4, rotation: 0
        };
        updateScene(activeScene.id, { hotspots: [...activeScene.hotspots, newSpot] });
        setSelectedSpotId(newSpot.id);
    };

    // --- Arrow Placement (Step 3) ---
    const handleArrowCanvasClick = (e: React.MouseEvent) => {
        if (editorStep !== 3 || !isPlacingArrow || !activeScene || isPreviewMode) return;
        // Use the actual <img> element for pixel-perfect coordinates
        const rect = imgRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        if (x < 0 || x > 100 || y < 0 || y > 100) return;

        const newSpot: Hotspot = {
            id: Math.random().toString(36).substr(2, 9),
            x, y, label: 'Navigate', type: 'navigation',
            targetSceneId: undefined, rotation: 0
        };
        updateScene(activeScene.id, { hotspots: [...activeScene.hotspots, newSpot] });
        setSelectedSpotId(newSpot.id);
        setIsPlacingArrow(false);
    };

    // --- Drag to move spots ---
    useEffect(() => {
        const handleDragMove = (e: MouseEvent) => {
            if (!draggingSpotId || !activeScene) return;
            const container = imgRef.current;
            if (!container) return;
            const rect = container.getBoundingClientRect();
            let x = ((e.clientX - rect.left) / rect.width) * 100;
            let y = ((e.clientY - rect.top) / rect.height) * 100;
            x = Math.max(0, Math.min(100, x));
            y = Math.max(0, Math.min(100, y));
            updateSpot(draggingSpotId, { x, y });
        };
        const handleDragUp = () => setDraggingSpotId(null);
        if (draggingSpotId) {
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('mouseup', handleDragUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('mouseup', handleDragUp);
        };
    }, [draggingSpotId, activeScene, editorStep]);

    // --- Drag to rotate ---
    useEffect(() => {
        const handleRotateMove = (e: MouseEvent) => {
            if (!isRotating || !selectedSpotId || !rotationCenterRef.current) return;
            const center = rotationCenterRef.current;
            const angle = Math.atan2(e.clientY - center.y, e.clientX - center.x) * (180 / Math.PI);
            // Convert so that "up" = 0°
            let rotation = angle + 90;
            if (rotation < 0) rotation += 360;
            rotation = Math.round(rotation) % 360;
            updateSpot(selectedSpotId, { rotation });
        };
        const handleRotateUp = () => {
            setIsRotating(false);
            rotationCenterRef.current = null;
        };
        if (isRotating) {
            window.addEventListener('mousemove', handleRotateMove);
            window.addEventListener('mouseup', handleRotateUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleRotateMove);
            window.removeEventListener('mouseup', handleRotateUp);
        };
    }, [isRotating, selectedSpotId]);

    const startRotation = (spotId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setSelectedSpotId(spotId);
        // Find the arrow element center on screen
        const arrowEl = (e.target as HTMLElement).closest('[data-arrow-id]');
        if (arrowEl) {
            const rect = arrowEl.getBoundingClientRect();
            rotationCenterRef.current = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };
        }
        setIsRotating(true);
    };

    // Assign a target scene to a nav arrow
    const assignTarget = (spotId: string, targetSceneId: string) => {
        if (!activeScene) return;
        const targetScene = scenes.find(s => s.id === targetSceneId);
        const label = targetScene?.name || 'Navigate';
        updateScene(activeScene.id, {
            hotspots: activeScene.hotspots.map(h =>
                h.id === spotId ? { ...h, targetSceneId, label } : h
            )
        });
    };

    // ==================== RENDER FUNCTIONS ====================

    // 1. Upload Step
    const renderUploadStep = () => (
        <div className="flex-1 flex flex-col p-8 max-w-5xl mx-auto w-full">
            <div className="text-center mb-8 space-y-2">
                <div className="bg-indigo-500/10 text-indigo-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                    <Upload className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white">Upload Venue Photos</h2>
                <div className="max-w-xl mx-auto text-sm text-zinc-400 space-y-1">
                    <p>📸 Photos must be well-lit and high quality.</p>
                    <p>🛋️ Ensure all tables are visible and the venue is empty.</p>
                    <p>🚪 Start with the Main Entrance photo.</p>
                </div>
            </div>

            {scenes.length === 0 ? (
                <label className="flex-1 border-2 border-dashed border-zinc-700 bg-zinc-900/30 rounded-2xl flex flex-col items-center justify-center p-12 cursor-pointer hover:bg-zinc-900/50 hover:border-indigo-500/50 transition-all group relative">
                    {isUploading ? (
                        <div className="flex flex-col items-center animate-pulse">
                            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <h3 className="text-xl font-bold text-white">Uploading...</h3>
                            <p className="text-zinc-500 text-sm mt-2">Please wait while we process your photos.</p>
                        </div>
                    ) : (
                        <>
                            <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="w-8 h-8 text-zinc-500 group-hover:text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-300">Click to upload photos</h3>
                            <p className="text-zinc-500 text-sm mt-2">Select multiple files at once</p>
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </>
                    )}
                </label>
            ) : (
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="grid grid-cols-4 gap-4 overflow-y-auto pr-2 pb-4">
                        {scenes.map((scene, i) => (
                            <div key={scene.id} className="relative aspect-video bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700 group">
                                <img src={scene.image || ''} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button onClick={() => deleteScene(scene.id)} className="p-2 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                    <input value={scene.name} onChange={(e) => updateScene(scene.id, { name: e.target.value })}
                                        className="w-full bg-transparent text-xs font-bold text-white border-none outline-none placeholder-zinc-500" placeholder="Name this area..." />
                                </div>
                                {i === 0 && <span className="absolute top-2 left-2 px-2 py-0.5 bg-indigo-600 text-white text-[10px] uppercase font-bold rounded shadow-lg">Main Entrance</span>}
                            </div>
                        ))}
                        <label className="aspect-video bg-zinc-900/50 border border-dashed border-zinc-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-900 hover:border-zinc-500 transition-colors">
                            {isUploading ? (
                                <div className="w-6 h-6 border-2 border-zinc-500 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Plus className="w-6 h-6 text-zinc-500 mb-2" />
                                    <span className="text-xs text-zinc-500 font-bold">Add More</span>
                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                                </>
                            )}
                        </label>
                    </div>
                    <div className="mt-6 flex justify-end pt-6 border-t border-zinc-800">
                        <button onClick={() => setEditorStep(2)}
                            className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-colors flex items-center gap-2">
                            Configure Tables <ArrowRightCircle className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    // 2. Table Setup
    const renderTableStep = () => (
        <div className="flex h-full w-full">
            <div className="w-64 border-r border-zinc-800 bg-zinc-900/50 flex flex-col">
                <div className="p-4 border-b border-zinc-800">
                    <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Step 2: Add Tables</h2>
                    <p className="text-[10px] text-zinc-400">Click on a photo to place tables</p>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {scenes.map(scene => (
                        <div key={scene.id} onClick={() => { setActiveSceneId(scene.id); setSelectedSpotId(null); }}
                            className={`group w-full p-2 rounded-lg flex items-center gap-3 text-left transition-colors cursor-pointer ${activeSceneId === scene.id ? 'bg-zinc-800 border-l-2 border-indigo-500' : 'hover:bg-zinc-900/50'}`}>
                            <div className="w-8 h-8 rounded bg-zinc-950 border border-zinc-800 overflow-hidden flex-shrink-0">
                                <img src={scene.image || ''} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className={`text-xs font-bold truncate ${activeSceneId === scene.id ? 'text-white' : 'text-zinc-400'}`}>{scene.name}</div>
                                <div className="text-[9px] text-zinc-600">{scene.hotspots.filter(h => h.type === 'table').length} tables</div>
                            </div>
                            <div className="flex items-center gap-2">
                                {scene.hotspots.some(h => h.type === 'table') && <Check className="w-3 h-3 text-green-500" />}
                                <button onClick={(e) => { e.stopPropagation(); if (confirm("Delete this photo?")) deleteScene(scene.id); }}
                                    className="p-1.5 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100" title="Delete Photo">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-zinc-800">
                    <button onClick={() => { setEditorStep(3); setActiveSceneId(scenes[0]?.id || null); setSelectedSpotId(null); }}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2">
                        Next: Link Photos <ArrowRightCircle className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 bg-[#09090b] relative flex flex-col">
                <div className="absolute top-4 inset-x-4 flex justify-between pointer-events-none z-10">
                    <div className="bg-black/80 backdrop-blur text-white px-4 py-2 rounded-full text-xs font-bold border border-white/10">Editing: {activeScene?.name}</div>
                    <div className="bg-indigo-500/20 text-indigo-200 px-4 py-2 rounded-full text-xs font-bold border border-indigo-500/30">Click anywhere to add a table</div>
                </div>
                <div ref={imageContainerRef} onClick={handleCanvasClick}
                    className="flex-1 relative w-full h-full flex items-center justify-center overflow-hidden cursor-crosshair"
                    style={{ backgroundImage: 'radial-gradient(circle, #3f3f46 1px, transparent 1px)', backgroundSize: '24px 24px', backgroundColor: '#09090b' }}>
                    {activeScene?.image && (
                        <div className="relative shadow-2xl animate-in fade-in zoom-in-95 duration-300" style={{ lineHeight: 0 }}>
                            <img ref={imgRef} src={activeScene.image} className="block max-h-[80vh] max-w-full object-contain pointer-events-none" draggable={false} />
                            {activeScene.hotspots.filter(h => h.type === 'table').map(spot => (
                                <button key={spot.id}
                                    onClick={(e) => { e.stopPropagation(); setSelectedSpotId(spot.id); }}
                                    onMouseDown={(e) => { e.stopPropagation(); setDraggingSpotId(spot.id); }}
                                    className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center text-xs font-bold shadow-lg transition-transform ${selectedSpotId === spot.id ? 'bg-indigo-600 text-white scale-125 z-50 ring-4 ring-indigo-500/20' : 'bg-white text-black hover:scale-110 z-20 cursor-grab'} ${spot.isVip ? 'border-2 border-amber-400' : ''}`}
                                    style={{ left: `${spot.x}%`, top: `${spot.y}%` }}>
                                    {spot.label.replace(/\D/g, '')}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Table Inspector */}
            {selectedSpotId && activeScene?.hotspots.find(s => s.id === selectedSpotId)?.type === 'table' && (
                <div className="w-72 border-l border-zinc-800 bg-zinc-900/50 p-6 flex flex-col animate-in slide-in-from-right-4">
                    <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2"><Layout className="w-4 h-4 text-indigo-500" /> Table Details</h3>
                    <div className="space-y-4 flex-1">
                        {/* Link to Existing Table */}
                        <div className="bg-indigo-500/10 p-3 rounded-lg border border-indigo-500/20 mb-2">
                            <label className="text-xs font-bold text-indigo-300 uppercase mb-1 block flex items-center gap-1">
                                <LinkIcon className="w-3 h-3" /> Link to Existing
                            </label>
                            <select className="w-full bg-zinc-900 border border-indigo-500/30 text-white text-xs rounded p-1.5 outline-none focus:border-indigo-500"
                                onChange={(e) => {
                                    const targetLabel = e.target.value;
                                    if (!targetLabel) return;
                                    const sourceTable = scenes.flatMap(s => s.hotspots).find(h => h.type === 'table' && h.label === targetLabel);
                                    if (sourceTable) {
                                        updateSpot(selectedSpotId, { label: sourceTable.label, capacity: sourceTable.capacity, minSpend: sourceTable.minSpend, isVip: sourceTable.isVip });
                                    }
                                }} value="">
                                <option value="">Select a table...</option>
                                {Array.from(new Set(scenes.flatMap(s => s.hotspots.filter(h => h.type === 'table' && h.id !== selectedSpotId)).map(h => h.label))).sort().map(label => (
                                    <option key={label} value={label}>{label}</option>
                                ))}
                            </select>
                            <p className="text-[10px] text-zinc-500 mt-1 leading-tight">Pick a table from another photo to use the same name & settings.</p>
                        </div>
                        <div><label className="text-xs font-bold text-zinc-500 uppercase">Label</label>
                            <input value={activeScene?.hotspots.find(s => s.id === selectedSpotId)?.label || ''}
                                onChange={(e) => updateSpot(selectedSpotId, { label: e.target.value })}
                                className="w-full mt-1 bg-black border border-zinc-700 rounded-lg p-2 text-sm text-white focus:border-indigo-500 outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div><label className="text-xs font-bold text-zinc-500 uppercase">Capacity</label>
                                <input ref={capacityInputRef} type="number" value={activeScene?.hotspots.find(s => s.id === selectedSpotId)?.capacity || 0}
                                    onChange={(e) => updateSpot(selectedSpotId, { capacity: parseInt(e.target.value) })}
                                    className="w-full mt-1 bg-black border border-zinc-700 rounded-lg p-2 text-sm text-white focus:border-indigo-500 outline-none" />
                            </div>
                            <div><label className="text-xs font-bold text-zinc-500 uppercase">Min Spend</label>
                                <input type="number" value={activeScene?.hotspots.find(s => s.id === selectedSpotId)?.minSpend || 0}
                                    onChange={(e) => updateSpot(selectedSpotId, { minSpend: parseInt(e.target.value) })}
                                    className="w-full mt-1 bg-black border border-zinc-700 rounded-lg p-2 text-sm text-white focus:border-indigo-500 outline-none" />
                            </div>
                        </div>
                        <label className="flex items-center justify-between p-3 rounded-lg bg-zinc-800 cursor-pointer hover:bg-zinc-700">
                            <span className="text-sm font-bold text-white">VIP Table</span>
                            <input type="checkbox" checked={!!activeScene?.hotspots.find(s => s.id === selectedSpotId)?.isVip}
                                onChange={(e) => updateSpot(selectedSpotId, { isVip: e.target.checked })} className="accent-indigo-500 w-4 h-4" />
                        </label>
                    </div>
                    <div className="mt-6 space-y-2">
                        <button onClick={() => setSelectedSpotId(null)} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg flex items-center justify-center gap-2"><Check className="w-4 h-4" /> Done</button>
                        <button onClick={() => deleteSpot(selectedSpotId)} className="w-full py-3 bg-red-500/10 text-red-500 border border-red-500/20 font-bold rounded-lg hover:bg-red-500 hover:text-white transition-colors">Delete Table</button>
                    </div>
                </div>
            )}
        </div>
    );

    // ==========================================
    // 3. LINK PHOTOS — Virtual Tour Arrow Editor
    // ==========================================
    const renderLinkStep = () => {
        if (isPreviewMode) return renderPreview();

        const navHotspots = activeScene?.hotspots.filter(h => h.type === 'navigation') || [];
        const otherScenes = scenes.filter(s => s.id !== activeSceneId);
        const currentSpot = selectedSpotId ? activeScene?.hotspots.find(h => h.id === selectedSpotId) : null;

        return (
            <div className="flex h-full w-full">
                {/* Left Sidebar: Photo list */}
                <div className="w-56 border-r border-zinc-800 bg-zinc-900/50 flex flex-col">
                    <div className="p-4 border-b border-zinc-800">
                        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Step 3: Link Photos</h2>
                        <p className="text-[10px] text-zinc-400">Place arrows & link to other photos</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {scenes.map(scene => {
                            const linkCount = scene.hotspots.filter(h => h.type === 'navigation' && h.targetSceneId).length;
                            return (
                                <div key={scene.id} onClick={() => { setActiveSceneId(scene.id); setSelectedSpotId(null); setIsPlacingArrow(false); }}
                                    className={`group w-full p-2 rounded-lg flex items-center gap-3 cursor-pointer transition-colors ${activeSceneId === scene.id ? 'bg-zinc-800 border-l-2 border-indigo-500' : 'hover:bg-zinc-900/50'}`}>
                                    <div className="w-10 h-7 rounded bg-zinc-950 border border-zinc-800 overflow-hidden flex-shrink-0">
                                        <img src={scene.image || ''} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-xs font-bold truncate ${activeSceneId === scene.id ? 'text-white' : 'text-zinc-400'}`}>{scene.name}</div>
                                        <div className="text-[9px] text-zinc-600">{linkCount} link{linkCount !== 1 ? 's' : ''}</div>
                                    </div>
                                    {linkCount > 0 && <Check className="w-3 h-3 text-green-500" />}
                                </div>
                            );
                        })}
                    </div>
                    <div className="p-3 space-y-2 border-t border-zinc-800">
                        <button onClick={() => { setEditorStep(2); setIsPlacingArrow(false); setSelectedSpotId(null); }}
                            className="w-full py-2 bg-zinc-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 hover:bg-zinc-700">
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Tables
                        </button>
                        <button onClick={() => { setIsPreviewMode(true); setActiveSceneId(scenes[0]?.id || null); setDisplaySceneId(scenes[0]?.id || null); }}
                            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-indigo-500/20">
                            <Play className="w-3.5 h-3.5 fill-current" /> Preview Tour
                        </button>
                    </div>
                </div>

                {/* Main Canvas */}
                <div className="flex-1 bg-[#09090b] relative flex flex-col">
                    {/* Top badges */}
                    <div className="absolute top-4 left-4 z-10">
                        <div className="bg-black/80 backdrop-blur text-white px-4 py-2 rounded-full text-xs font-bold border border-white/10">
                            {activeScene?.name}
                        </div>
                    </div>

                    {/* Add Arrow Button */}
                    <div className="absolute bottom-6 inset-x-0 flex justify-center z-20 pointer-events-none">
                        <button
                            onClick={() => { setIsPlacingArrow(!isPlacingArrow); setSelectedSpotId(null); }}
                            className={`pointer-events-auto flex items-center gap-3 font-bold rounded-full border-2 transition-all shadow-2xl ${isPlacingArrow
                                ? 'px-8 py-4 text-base bg-cyan-500 text-black border-cyan-300 shadow-cyan-500/40 animate-pulse'
                                : 'px-8 py-4 text-base bg-gradient-to-r from-indigo-600 to-cyan-500 text-white border-indigo-400/50 hover:scale-105 hover:shadow-indigo-500/30'
                                }`}
                        >
                            {isPlacingArrow ? (
                                <><Navigation className="w-5 h-5" /> 👆 Click on the photo to place arrow...</>
                            ) : (
                                <><Plus className="w-5 h-5" /> Add Navigation Arrow</>
                            )}
                        </button>
                    </div>

                    {/* Image + Arrows */}
                    <div
                        onClick={handleArrowCanvasClick}
                        className={`flex-1 relative w-full h-full flex items-center justify-center overflow-hidden ${isPlacingArrow ? 'cursor-crosshair' : 'cursor-default'}`}
                        style={{ backgroundImage: 'radial-gradient(circle, #3f3f46 1px, transparent 1px)', backgroundSize: '24px 24px', backgroundColor: '#09090b' }}
                    >
                        {activeScene?.image && (
                            <div ref={imageWrapperRef} className="relative shadow-2xl" style={{ lineHeight: 0 }}>
                                <img ref={imgRef} src={activeScene.image} className="block max-h-[80vh] max-w-full object-contain pointer-events-none select-none" draggable={false} />
                                {/* Arrow overlay — matches image exactly */}
                                <div className="absolute inset-0 z-20">

                                    {/* Nav Arrows */}
                                    {navHotspots.map(spot => {
                                        const isSelected = selectedSpotId === spot.id;
                                        const hasTarget = !!spot.targetSceneId;
                                        const targetScene = hasTarget ? scenes.find(s => s.id === spot.targetSceneId) : null;
                                        const rotation = spot.rotation || 0;

                                        return (
                                            <div key={spot.id} data-arrow-id={spot.id}
                                                className={`absolute ${isSelected ? 'z-50' : 'z-30'}`}
                                                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}>

                                                {/* The arrow button */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedSpotId(isSelected ? null : spot.id); }}
                                                    onMouseDown={(e) => {
                                                        e.stopPropagation();
                                                        if (!isPlacingArrow && !isSelected) setDraggingSpotId(spot.id);
                                                    }}
                                                    className={`w-12 h-12 -ml-6 -mt-6 rounded-full flex items-center justify-center transition-all group
                                                    ${isSelected ? 'ring-4 ring-cyan-400/50 scale-125' : 'hover:scale-110'}
                                                    ${hasTarget
                                                            ? 'bg-cyan-500/20 backdrop-blur-md border-2 border-cyan-400/60 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                                                            : 'bg-red-500/20 backdrop-blur-md border-2 border-dashed border-red-400/60 animate-pulse'
                                                        }`}
                                                    style={{ transform: `rotate(${rotation}deg)` }}
                                                >
                                                    <ChevronUp className={`w-7 h-7 ${hasTarget ? 'text-cyan-300' : 'text-red-300'}`} />
                                                </button>

                                                {/* Rotation Ring — only when selected */}
                                                {isSelected && (
                                                    <>
                                                        {/* Rotation ring */}
                                                        <div className="absolute -ml-10 -mt-10 w-20 h-20 rounded-full border-2 border-dashed border-indigo-400/40 pointer-events-none"
                                                            style={{ left: 0, top: 0 }}
                                                        />
                                                        {/* Rotation handle — drag this to rotate */}
                                                        <div
                                                            onMouseDown={(e) => startRotation(spot.id, e)}
                                                            className="absolute w-5 h-5 rounded-full bg-indigo-500 border-2 border-white shadow-lg cursor-grab active:cursor-grabbing z-[60] hover:scale-125 transition-transform flex items-center justify-center"
                                                            style={{
                                                                // Position handle along rotation ring at current angle
                                                                left: `${Math.cos((rotation - 90) * Math.PI / 180) * 36}px`,
                                                                top: `${Math.sin((rotation - 90) * Math.PI / 180) * 36}px`,
                                                                marginLeft: '-10px',
                                                                marginTop: '-10px'
                                                            }}
                                                            title="Drag to rotate"
                                                        >
                                                            <RotateCw className="w-2.5 h-2.5 text-white" />
                                                        </div>

                                                        {/* Move handle */}
                                                        <div
                                                            onMouseDown={(e) => {
                                                                e.stopPropagation();
                                                                setDraggingSpotId(spot.id);
                                                            }}
                                                            className="absolute -ml-3 mt-2 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white shadow-lg cursor-grab active:cursor-grabbing z-[60] hover:scale-125 transition-transform flex items-center justify-center"
                                                            title="Drag to move"
                                                        >
                                                            <Move className="w-3 h-3 text-white" />
                                                        </div>
                                                    </>
                                                )}

                                                {/* Tooltip */}
                                                {hasTarget && !isSelected && (
                                                    <span className="absolute left-1/2 -translate-x-1/2 -bottom-5 bg-black/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                                        → {targetScene?.name}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {/* Table spots (dimmed, non-interactive in step 3) */}
                                    {activeScene.hotspots.filter(h => h.type === 'table').map(spot => (
                                        <div key={spot.id} className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full bg-indigo-500/30 border border-indigo-400/30 flex items-center justify-center text-[8px] font-bold text-indigo-300 z-10"
                                            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}>
                                            {spot.label.replace(/\D/g, '')}
                                        </div>
                                    ))}
                                </div>{/* end arrow overlay */}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar: Arrow Inspector */}
                {(selectedSpotId && currentSpot?.type === 'navigation') && (
                    <div className="w-72 border-l border-zinc-800 bg-zinc-900/50 p-5 flex flex-col animate-in slide-in-from-right-4">
                        <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
                            <LinkIcon className="w-4 h-4 text-cyan-400" /> Arrow Settings
                        </h3>

                        <div className="space-y-4 flex-1">
                            {/* Target picker */}
                            <div>
                                <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Links to photo:</label>
                                <div className="space-y-1.5 max-h-[40vh] overflow-y-auto pr-1">
                                    {otherScenes.map(scene => (
                                        <button key={scene.id}
                                            onClick={() => assignTarget(selectedSpotId, scene.id)}
                                            className={`w-full flex items-center gap-3 p-2 rounded-lg border transition-all text-left ${currentSpot?.targetSceneId === scene.id
                                                ? 'border-cyan-500 bg-cyan-500/10'
                                                : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                                                }`}>
                                            <div className="w-12 h-8 rounded overflow-hidden border border-zinc-700 flex-shrink-0 bg-zinc-900">
                                                <img src={scene.image || ''} className="w-full h-full object-cover" />
                                            </div>
                                            <span className={`text-xs font-bold truncate ${currentSpot?.targetSceneId === scene.id ? 'text-cyan-300' : 'text-zinc-400'}`}>
                                                {scene.name}
                                            </span>
                                            {currentSpot?.targetSceneId === scene.id && <Check className="w-4 h-4 text-cyan-400 ml-auto flex-shrink-0" />}
                                        </button>
                                    ))}
                                </div>
                                {otherScenes.length === 0 && (
                                    <p className="text-zinc-500 text-xs mt-2">Upload more photos to link to.</p>
                                )}
                            </div>

                            {/* Rotation Control */}
                            <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50 space-y-3">
                                <div className="text-[10px] text-zinc-500 uppercase font-bold">Rotation</div>

                                {/* Visual rotation indicator */}
                                <div className="flex items-center gap-4">
                                    <div className="relative w-16 h-16">
                                        <div className="absolute inset-0 rounded-full border-2 border-zinc-600" />
                                        {/* Direction indicator */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-0.5 h-6 bg-cyan-400 rounded-full origin-bottom"
                                                style={{ transform: `rotate(${currentSpot?.rotation || 0}deg)`, transformOrigin: 'bottom center', marginTop: '-12px' }}
                                            />
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-cyan-400" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="number"
                                            value={currentSpot?.rotation || 0}
                                            onChange={(e) => {
                                                let val = parseInt(e.target.value) || 0;
                                                val = ((val % 360) + 360) % 360;
                                                updateSpot(selectedSpotId, { rotation: val });
                                            }}
                                            className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-sm text-white focus:border-cyan-500 outline-none text-center font-mono"
                                        />
                                        <p className="text-[9px] text-zinc-600 text-center mt-1">degrees (0-359)</p>
                                    </div>
                                </div>

                                {/* Quick rotation presets */}
                                <div className="grid grid-cols-4 gap-1">
                                    {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                                        <button key={deg}
                                            onClick={() => updateSpot(selectedSpotId, { rotation: deg })}
                                            className={`py-1.5 text-[10px] font-bold rounded transition-colors ${(currentSpot?.rotation || 0) === deg
                                                ? 'bg-cyan-500 text-black'
                                                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                                }`}>
                                            {deg}°
                                        </button>
                                    ))}
                                </div>

                                <p className="text-[10px] text-zinc-600 leading-tight">
                                    💡 You can also drag the handle on the rotation ring to rotate freely.
                                </p>
                            </div>

                            {/* Position info */}
                            <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
                                <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Position</div>
                                <div className="text-xs text-zinc-400">
                                    x: {Math.round(currentSpot?.x || 0)}% · y: {Math.round(currentSpot?.y || 0)}%
                                </div>
                                <p className="text-[10px] text-zinc-600 mt-1">Use the green <Move className="w-2.5 h-2.5 inline" /> handle to move.</p>
                            </div>
                        </div>

                        <div className="mt-4 space-y-2">
                            <button onClick={() => setSelectedSpotId(null)}
                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 text-sm">
                                <Check className="w-4 h-4" /> Done
                            </button>
                            <button onClick={() => deleteSpot(selectedSpotId)}
                                className="w-full py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 font-bold rounded-lg hover:bg-red-500 hover:text-white transition-colors text-sm">
                                Delete Arrow
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // ==========================================
    // Preview Mode — immersive virtual tour
    // ==========================================
    const renderPreview = () => {
        const displayScene = scenes.find(s => s.id === displaySceneId);
        const incomingScene = transitionData ? scenes.find(s => s.id === transitionData.targetId) : null;

        const handleNavigate = (targetId: string) => {
            if (isAnimating) return;
            const currentIdx = scenes.findIndex(s => s.id === displaySceneId);
            const targetIdx = scenes.findIndex(s => s.id === targetId);
            const dir = targetIdx > currentIdx ? 'right' : 'left';
            setTransitionData({ targetId, direction: dir });
            setIsAnimating(true);
            setTimeout(() => { setActiveSceneId(targetId); setIsAnimating(false); setTransitionData(null); }, 400);
        };

        const TRANSITION_STYLE = { transition: 'transform 350ms cubic-bezier(0.2, 0, 0.2, 1), opacity 350ms ease' };
        let exitingStyle: React.CSSProperties = { ...TRANSITION_STYLE, transform: 'translate(0,0)', zIndex: 10, opacity: 1 };
        if (isAnimating && transitionData) {
            const d = transitionData.direction;
            if (d === 'left') exitingStyle = { ...exitingStyle, transform: 'translateX(30%)', opacity: 0 };
            else exitingStyle = { ...exitingStyle, transform: 'translateX(-30%)', opacity: 0 };
        }

        return (
            <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center overflow-hidden">
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                    {displayScene && (
                        <div key={displayScene.id} className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none"
                            style={isAnimating ? exitingStyle : { ...TRANSITION_STYLE, transform: 'none', opacity: 1, zIndex: 10 }}>
                            {/* Relative wrapper ensures hotspots are positioned relative to the image */}
                            <div className="relative" style={{ lineHeight: 0 }}>
                                <img src={displayScene.image || ''} className="block max-h-[100vh] max-w-full object-contain" />
                                {!isAnimating && (
                                    <div className="absolute inset-0 pointer-events-auto">
                                        {/* Nav arrows */}
                                        {displayScene.hotspots.filter(h => h.type === 'navigation' && h.targetSceneId).map(spot => (
                                            <button key={spot.id} onClick={() => handleNavigate(spot.targetSceneId!)}
                                                className="absolute w-14 h-14 -ml-7 -mt-7 rounded-full backdrop-blur-md border bg-zinc-900/40 hover:bg-zinc-800/80 border-cyan-500/30 flex items-center justify-center transition-all hover:scale-110 hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] z-50 group"
                                                style={{ left: `${spot.x}%`, top: `${spot.y}%`, transform: `rotate(${spot.rotation || 0}deg)` }}>
                                                <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-ping opacity-20"></div>
                                                <ChevronUp className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_5px_rgba(0,0,0,0.8)]" />
                                                <span className="absolute bottom-full mb-2 bg-black/80 text-white text-[9px] uppercase font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
                                                    style={{ transform: `rotate(-${spot.rotation || 0}deg)` }}>
                                                    {spot.label}
                                                </span>
                                            </button>
                                        ))}
                                        {/* Tables */}
                                        {displayScene.hotspots.filter(h => h.type === 'table').map(spot => (
                                            <div key={spot.id} className="absolute -translate-x-1/2 -translate-y-1/2 group z-30" style={{ left: `${spot.x}%`, top: `${spot.y}%` }}>
                                                <div className={`relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg backdrop-blur-sm border-2 ${spot.isVip
                                                    ? 'bg-gradient-to-br from-amber-400/80 to-orange-600/80 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                                                    : 'bg-gradient-to-br from-indigo-500/80 to-violet-600/80 border-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.5)]'}`}>
                                                    <span className="text-white font-black text-xs">{spot.label.replace(/\D/g, '')}</span>
                                                </div>
                                                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-36 bg-zinc-900/90 backdrop-blur border border-zinc-700 p-2 rounded-xl text-center opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-2xl">
                                                    <div className="text-white font-bold text-sm">{spot.capacity} ppl</div>
                                                    {spot.minSpend && <div className="text-[10px] text-emerald-400 font-bold">Min: ${spot.minSpend}</div>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {isAnimating && incomingScene && (
                        <div key={incomingScene.id} className="absolute inset-0 w-full h-full flex items-center justify-center z-20 pointer-events-none"
                            style={{ animation: `${transitionData?.direction === 'left' ? 'enterFromLeft' : 'enterFromRight'} 350ms cubic-bezier(0.2, 0, 0.2, 1) forwards` }}>
                            <img src={incomingScene.image || ''} className="max-h-full max-w-full object-contain" />
                        </div>
                    )}
                </div>
                <style jsx>{`
                    @keyframes enterFromLeft { from { transform: translateX(-30%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                    @keyframes enterFromRight { from { transform: translateX(30%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                `}</style>
                <div className="absolute top-0 inset-x-0 p-4 flex items-center justify-between z-50 bg-gradient-to-b from-black/80 to-transparent">
                    <button onClick={() => setIsPreviewMode(false)} className="bg-zinc-800/80 backdrop-blur text-white px-4 py-2 rounded-full text-xs font-bold border border-zinc-700 hover:bg-zinc-700 flex items-center gap-2"><X className="w-4 h-4" /> Exit Preview</button>
                    <div className="bg-zinc-900/80 backdrop-blur text-white px-4 py-2 rounded-full text-xs font-bold border border-white/10">{displayScene?.name}</div>
                </div>
            </div>
        );
    };

    // Main Render
    return (
        <div className="flex h-[calc(100vh-80px)] bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl font-sans">
            {editorStep === 1 && renderUploadStep()}
            {editorStep === 2 && renderTableStep()}
            {editorStep === 3 && renderLinkStep()}
            <ConfirmationModal isOpen={modalConfig.isOpen} onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={modalConfig.onConfirm} title={modalConfig.title} message={modalConfig.message}
                confirmLabel={modalConfig.confirmLabel || "Confirm"} isDestructive={modalConfig.isDestructive} />
        </div>
    );
}
