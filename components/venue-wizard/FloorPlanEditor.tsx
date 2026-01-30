"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
    Upload, MapPin, X, Plus, Image as ImageIcon,
    Save, MousePointer2, Tag, Info, Trash2,
    ArrowUpCircle, ArrowLeftCircle, ArrowDownCircle, Home, RotateCw, Link as LinkIcon, ChevronUp, Check,
    ArrowRightCircle, Play, Pause, ChevronRight, AlertTriangle, Eye, Layout, PlusCircle, Move
} from "lucide-react";
import ConfirmationModal from "../ui/ConfirmationModal";

// --- Types ---
export interface Hotspot {
    id: string;
    x: number; // Percentage 0-100
    y: number; // Percentage 0-100
    label: string;
    type: 'table' | 'seat' | 'zone' | 'vip' | 'navigation';
    capacity?: number;
    price?: number;
    notes?: string;
    targetSceneId?: string; // For Navigation
    rotation?: number; // Degrees 0-360
    navDirection?: 'up' | 'down' | 'left' | 'right' | 'up-left' | 'up-right' | 'down-left' | 'down-right'; // Helper for icon rotation
    isVip?: boolean; // New: VIP Status
    minSpend?: number; // New: Minimum Spend
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
    // --- Global State ---
    const [editorStep, setEditorStep] = useState<1 | 2 | 3>(1); // 1: Upload, 2: Tables, 3: Connect

    // Data State
    const [scenes, setScenes] = useState<Scene[]>(
        initialScenes.length > 0 ? initialScenes : []
    );
    const [activeSceneId, setActiveSceneId] = useState<string | null>(scenes.length > 0 ? scenes[0].id : null);

    // Editing State
    const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
    const [draggingSpotId, setDraggingSpotId] = useState<string | null>(null);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [draggedSceneId, setDraggedSceneId] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1); // Zoom Level for Grid

    // Preview Transition State
    const [isAnimating, setIsAnimating] = useState(false);
    const [transitionData, setTransitionData] = useState<{ targetId: string; direction: 'up' | 'down' | 'left' | 'right' } | null>(null);
    const [displaySceneId, setDisplaySceneId] = useState<string | null>(null);

    // Panning State (Hoisted)
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const lastPanRef = useRef({ x: 0, y: 0 });

    const handlePanMouseDown = (e: React.MouseEvent) => {
        // Only pan if clicking on background (not on a button or node)
        if ((e.target as HTMLElement).closest('.pointer-events-auto')) return;

        setIsPanning(true);
        lastPanRef.current = { x: e.clientX, y: e.clientY };
    };

    useEffect(() => {
        const handlePanMove = (e: MouseEvent) => {
            if (!isPanning) return;
            const dx = e.clientX - lastPanRef.current.x;
            const dy = e.clientY - lastPanRef.current.y;
            setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            lastPanRef.current = { x: e.clientX, y: e.clientY };
        };

        const handlePanUp = () => {
            setIsPanning(false);
        };

        if (isPanning) {
            window.addEventListener('mousemove', handlePanMove);
            window.addEventListener('mouseup', handlePanUp);
        }
        return () => {
            window.removeEventListener('mousemove', handlePanMove);
            window.removeEventListener('mouseup', handlePanUp);
        };
    }, [isPanning]);

    // Sync display scene when not animating
    useEffect(() => {
        if (!isAnimating && activeSceneId) {
            setDisplaySceneId(activeSceneId);
        }
    }, [activeSceneId, isAnimating]);

    // Refs
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const capacityInputRef = useRef<HTMLInputElement>(null);
    const touchStart = useRef<{ x: number, y: number } | null>(null); // Hoisted for swipe logic


    // Modal State
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        isDestructive?: boolean;
        confirmLabel?: string;
    }>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => { },
    });

    // Derived
    const activeScene = activeSceneId ? scenes.find(s => s.id === activeSceneId) : null;

    // Save wrapper
    const saveScenes = (newScenes: Scene[]) => {
        setScenes(newScenes);
        onSave?.(newScenes);
    };

    // --- Actions ---

    // Upload State
    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setIsUploading(true);
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dt5sqovt9";
        const uploadedScenes: Scene[] = [];

        try {
            // Upload sequentially or parallel
            for (const file of files) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("upload_preset", "agora_uploads");
                formData.append("folder", "venues/floorplans");

                const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
                    method: "POST",
                    body: formData
                });

                if (!res.ok) throw new Error("Upload failed");
                const data = await res.json();

                uploadedScenes.push({
                    id: Math.random().toString(36).substr(2, 9),
                    name: `Zone_${scenes.length + uploadedScenes.length + 1}`,
                    image: data.secure_url, // Persistent URL!
                    hotspots: []
                });
            }

            const updated = [...scenes, ...uploadedScenes];
            saveScenes(updated);
            if (!activeSceneId && updated.length > 0) setActiveSceneId(updated[0].id);

        } catch (err) {
            console.error("Upload error:", err);
            // Fallback? Or Alert?
            alert("Failed to upload image. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const deleteScene = (id: string) => {
        const updated = scenes.filter(s => s.id !== id);
        saveScenes(updated);
        // If we deleted the last scene, go back to upload step
        if (updated.length === 0) {
            setEditorStep(1);
        } else if (activeSceneId === id) {
            setActiveSceneId(updated[0]?.id || null);
        }
    };

    const updateScene = (id: string, updates: Partial<Scene>) => {
        const updated = scenes.map(s => s.id === id ? { ...s, ...updates } : s);
        saveScenes(updated);
    };

    // Spot Logic (Step 2)
    const handleCanvasClick = (e: React.MouseEvent) => {
        if (editorStep !== 2 || isPreviewMode || !activeScene) return;
        if (selectedSpotId) { setSelectedSpotId(null); return; }

        const rect = imageContainerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // Calculate global table count for sequential naming across scenes
        const globalTableCount = scenes.reduce((count, scene) => {
            return count + scene.hotspots.filter(h => h.type === 'table').length;
        }, 0);

        const newSpot: Hotspot = {
            id: Math.random().toString(36).substr(2, 9),
            x, y,
            label: `T-${globalTableCount + 1}`,
            type: 'table',
            capacity: 4,
            rotation: 0
        };

        updateScene(activeScene.id, { hotspots: [...activeScene.hotspots, newSpot] });
        setSelectedSpotId(newSpot.id);
    };

    const updateSpot = (spotId: string, updates: Partial<Hotspot>) => {
        // Optimization: If only moving/rotating, keep it local to active scene (Fast)
        const isPositional = Object.keys(updates).every(k => ['x', 'y', 'rotation'].includes(k));

        if (isPositional) {
            if (!activeScene) return;
            const updatedHotspots = activeScene.hotspots.map(s => s.id === spotId ? { ...s, ...updates } : s);
            updateScene(activeScene.id, { hotspots: updatedHotspots });
            return;
        }

        // Global Sync logic for Content Updates (Label, Capacity, MinSpend, VIP)
        // 1. Find the current label of the spot we are editing (to identify its "group")
        let targetLabel = "";
        for (const s of scenes) {
            const found = s.hotspots.find(h => h.id === spotId);
            if (found) {
                targetLabel = found.label;
                break;
            }
        }

        if (!targetLabel) return;

        // 2. Update ALL spots that match this ID *OR* match the Label (if it's a table)
        const updatedScenes = scenes.map(scene => ({
            ...scene,
            hotspots: scene.hotspots.map(h => {
                // A. The exact spot being edited: Apply ALL updates (including x,y if mixed)
                if (h.id === spotId) {
                    return { ...h, ...updates };
                }

                // B. Sibling Spots (Same Label): Apply shared updates only
                // We do NOT sync position (x,y) or rotation, as they are physically different in each photo.
                if (h.type === 'table' && h.label === targetLabel) {
                    const { x, y, rotation, id, ...sharedProps } = updates;
                    // Only apply props that are actually present in 'updates'
                    if (Object.keys(sharedProps).length > 0) {
                        return { ...h, ...sharedProps };
                    }
                }

                return h;
            })
        }));

        saveScenes(updatedScenes);
    };

    const deleteSpot = (spotId: string) => {
        if (!activeScene) return;
        const updatedHotspots = activeScene.hotspots.filter(s => s.id !== spotId);
        updateScene(activeScene.id, { hotspots: updatedHotspots });
        setSelectedSpotId(null);
    };

    // Drag Logic
    useEffect(() => {
        const handleDragMove = (e: MouseEvent) => {
            if (!draggingSpotId || !imageContainerRef.current || !activeScene) return;

            const container = imageContainerRef.current;
            const rect = container.getBoundingClientRect();

            // Calculate new position relative to container
            let x = ((e.clientX - rect.left) / rect.width) * 100;
            let y = ((e.clientY - rect.top) / rect.height) * 100;

            // Clamp to 0-100
            x = Math.max(0, Math.min(100, x));
            y = Math.max(0, Math.min(100, y));

            updateSpot(draggingSpotId, { x, y });
        };

        const handleDragUp = () => {
            setDraggingSpotId(null);
        };

        if (draggingSpotId) {
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('mouseup', handleDragUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('mouseup', handleDragUp);
        };
    }, [draggingSpotId, activeScene]);

    // Generic Connect Logic
    const connectScenes = (sourceId: string, targetId: string, direction: 'up' | 'down' | 'left' | 'right') => {
        if (sourceId === targetId) return;

        const posMap = {
            'up': { x: 50, y: 20, rot: 0 },
            'left': { x: 20, y: 50, rot: 270 },
            'right': { x: 80, y: 50, rot: 90 },
            'down': { x: 50, y: 80, rot: 180 }
        };
        const pos = posMap[direction];

        // 1. Link Source -> Target
        const linkSpot: Hotspot = {
            id: Math.random().toString(36).substr(2, 9),
            x: pos.x, y: pos.y,
            label: direction === 'up' ? 'Forward' : direction.charAt(0).toUpperCase() + direction.slice(1),
            type: 'navigation',
            targetSceneId: targetId,
            navDirection: direction,
            rotation: pos.rot
        };

        // 2. Link Target -> Source (Back link)
        const backDirMap = { 'up': 'down', 'down': 'up', 'left': 'right', 'right': 'left' };
        const backDir = backDirMap[direction] as 'up' | 'down' | 'left' | 'right';
        const backPos = posMap[backDir];

        const backSpot: Hotspot = {
            id: Math.random().toString(36).substr(2, 9),
            x: backPos.x, y: backPos.y,
            label: 'Back',
            type: 'navigation',
            targetSceneId: sourceId,
            navDirection: backDir,
            rotation: backPos.rot
        };

        const updatedScenes = scenes.map(s => {
            if (s.id === sourceId) return { ...s, hotspots: [...s.hotspots, linkSpot] };
            if (s.id === targetId) return { ...s, hotspots: [...s.hotspots, backSpot] };
            return s;
        });

        saveScenes(updatedScenes);
        setDraggedSceneId(null);
    };

    const handleActiveDrop = (direction: 'up' | 'down' | 'left' | 'right') => {
        if (!draggedSceneId || !activeScene) return;
        connectScenes(activeScene.id, draggedSceneId, direction);
    };

    const handleExtensionDrop = (sourceId: string, direction: 'up' | 'down' | 'left' | 'right') => {
        if (!draggedSceneId) return;
        connectScenes(sourceId, draggedSceneId, direction);
        setActiveSceneId(sourceId); // "Walk" into the new scene
    };


    const unlinkScene = (targetId: string) => {
        if (!activeScene) return;

        // 1. Remove link from Active Scene
        const updatedActiveHotspots = activeScene.hotspots.filter(h => h.targetSceneId !== targetId);

        // 2. Remove reciprocal link from Target Scene (if exists)
        const targetScene = scenes.find(s => s.id === targetId);
        const updatedTargetHotspots = targetScene ? targetScene.hotspots.filter(h => h.targetSceneId !== activeScene.id) : [];

        // 3. Update Scenes List AND Move Target to End
        const newScenes = scenes.filter(s => s.id !== targetId).map(s => {
            if (s.id === activeScene.id) return { ...s, hotspots: updatedActiveHotspots };
            return s;
        });

        if (targetScene) {
            // Push target to end of list
            newScenes.push({ ...targetScene, hotspots: updatedTargetHotspots });
        }

        saveScenes(newScenes);
    };

    const removeNodeFromMap = (targetId: string) => {
        // 1. Remove ALL links pointing TO this targetId from ANY scene
        // 2. Remove ALL links FROM this targetId to ANY scene
        // 3. Move this scene to the END of the list (Back to stock)

        const scenesWithoutTarget = scenes.filter(s => s.id !== targetId);
        const targetScene = scenes.find(s => s.id === targetId);

        // Sanitize other scenes: remove hotspots pointing to target
        const cleanedScenes = scenesWithoutTarget.map(s => ({
            ...s,
            hotspots: s.hotspots.filter(h => h.targetSceneId !== targetId)
        }));

        const newScenes = [...cleanedScenes];
        if (targetScene) {
            // Sanitize target scene: remove its navigation hotspots
            const cleanedTarget = {
                ...targetScene,
                hotspots: targetScene.hotspots.filter(h => h.type !== 'navigation')
            };
            newScenes.push(cleanedTarget);
        }

        saveScenes(newScenes);
        if (activeSceneId === targetId) setActiveSceneId(null);
    };

    const disconnectScenes = (sceneAId: string, sceneBId: string) => {
        const updatedScenes = scenes.map(s => {
            if (s.id === sceneAId) return { ...s, hotspots: s.hotspots.filter(h => h.targetSceneId !== sceneBId) };
            if (s.id === sceneBId) return { ...s, hotspots: s.hotspots.filter(h => h.targetSceneId !== sceneAId) };
            return s;
        });
        saveScenes(updatedScenes);
    };

    // --- Grid Logic (Hoisted for Hook Safety) ---
    // Calculate Grid Positions (BFS) - Layout Rooted at the First Scene (Main Entrance)
    const gridData = useMemo(() => {
        // Use the first scene as the anchor for the coordinate system
        const rootScene = scenes.length > 0 ? scenes[0] : null;
        if (!rootScene) return { nodes: [], visited: new Set<string>(), positions: new Set<string>(), posMap: new Map<string, GridNode>() };

        const nodes: GridNode[] = [];
        const visited = new Set<string>();
        const queue: GridNode[] = [{ scene: rootScene, x: 0, y: 0 }];
        const positions = new Set<string>();
        const posMap = new Map<string, GridNode>(); // "x,y" -> Node

        let iterations = 0;
        while (queue.length > 0 && iterations < 100) {
            const current = queue.shift()!;
            if (visited.has(current.scene.id)) continue;

            visited.add(current.scene.id);
            nodes.push(current);
            const posKey = `${current.x},${current.y}`;
            positions.add(posKey);
            posMap.set(posKey, current);
            iterations++;

            // Check neighbors
            const directions = ['up', 'down', 'left', 'right'] as const;
            directions.forEach(dir => {
                const link = current.scene.hotspots.find((h) => h.navDirection === dir);
                if (link) {
                    const neighbor = scenes.find(s => s.id === link.targetSceneId);
                    // Only traverse if we haven't visited it yet
                    if (neighbor && !visited.has(neighbor.id)) {
                        let nx = current.x;
                        let ny = current.y;
                        if (dir === 'left') nx -= 1;
                        if (dir === 'right') nx += 1;
                        if (dir === 'up') ny -= 1;
                        if (dir === 'down') ny += 1;
                        queue.push({ scene: neighbor, x: nx, y: ny });
                    }
                }
            });
        }
        return { nodes, visited, positions, posMap };
    }, [activeScene, scenes]);

    // --- step Views ---

    // 1. Upload View
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

            {/* Upload Area */}
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
                                    <input
                                        value={scene.name}
                                        onChange={(e) => updateScene(scene.id, { name: e.target.value })}
                                        className="w-full bg-transparent text-xs font-bold text-white border-none outline-none placeholder-zinc-500"
                                        placeholder="Name this area..."
                                    />
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
                        <button
                            onClick={() => setEditorStep(2)}
                            className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-colors flex items-center gap-2"
                        >
                            Configure Tables <ArrowRightCircle className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    // 2. Table Setup View (Using specific Layout)
    const renderTableStep = () => (
        <div className="flex h-full w-full">
            {/* Sidebar List */}
            <div className="w-64 border-r border-zinc-800 bg-zinc-900/50 flex flex-col">
                <div className="p-4 border-b border-zinc-800">
                    <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Step 2: Add Tables</h2>
                    <p className="text-[10px] text-zinc-400">Select an area to configure</p>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {scenes.map(scene => (
                        <div
                            key={scene.id}
                            onClick={() => { setActiveSceneId(scene.id); setSelectedSpotId(null); }}
                            className={`group w-full p-2 rounded-lg flex items-center gap-3 text-left transition-colors cursor-pointer ${activeSceneId === scene.id ? 'bg-zinc-800 border-l-2 border-indigo-500' : 'hover:bg-zinc-900/50'}`}
                        >
                            <div className="w-8 h-8 rounded bg-zinc-950 border border-zinc-800 overflow-hidden flex-shrink-0">
                                <img src={scene.image || ''} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className={`text-xs font-bold truncate ${activeSceneId === scene.id ? 'text-white' : 'text-zinc-400'}`}>{scene.name}</div>
                                <div className="text-[9px] text-zinc-600">{scene.hotspots.filter(h => h.type === 'table').length} tables</div>
                            </div>

                            <div className="flex items-center gap-2">
                                {scene.hotspots.some(h => h.type === 'table') && <Check className="w-3 h-3 text-green-500" />}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm("Delete this photo?")) deleteScene(scene.id);
                                    }}
                                    className="p-1.5 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                                    title="Delete Photo"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-zinc-800">
                    <button
                        onClick={() => { setEditorStep(3); setActiveSceneId(null); }}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2"
                    >
                        Next: Connect Areas <ArrowRightCircle className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 bg-[#09090b] relative flex flex-col">
                <div className="absolute top-4 inset-x-4 flex justify-between pointer-events-none z-10">
                    <div className="bg-black/80 backdrop-blur text-white px-4 py-2 rounded-full text-xs font-bold border border-white/10">
                        Editing: {activeScene?.name}
                    </div>
                    <div className="bg-indigo-500/20 text-indigo-200 px-4 py-2 rounded-full text-xs font-bold border border-indigo-500/30">
                        Click anywhere to add a table
                    </div>
                </div>

                <div
                    ref={imageContainerRef}
                    onClick={handleCanvasClick}
                    className="flex-1 relative w-full h-full flex items-center justify-center overflow-hidden cursor-crosshair"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #3f3f46 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                        backgroundColor: '#09090b'
                    }}
                >
                    {activeScene?.image && (
                        <div className="relative shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                            <img src={activeScene.image} className="max-h-[80vh] max-w-full object-contain pointer-events-none" />
                            {activeScene.hotspots.filter(h => h.type === 'table').map(spot => (
                                <button
                                    key={spot.id}
                                    onClick={(e) => { e.stopPropagation(); setSelectedSpotId(spot.id); }}
                                    onMouseDown={(e) => { e.stopPropagation(); setDraggingSpotId(spot.id); }}
                                    className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center text-xs font-bold shadow-lg transition-transform ${selectedSpotId === spot.id ? 'bg-indigo-600 text-white scale-125 z-50 ring-4 ring-indigo-500/20' : 'bg-white text-black hover:scale-110 z-20 cursor-grab active:cursor-grabbing'} ${spot.isVip ? 'border-2 border-amber-400' : ''}`}
                                    style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                                >
                                    {spot.label.replace(/\D/g, '')}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Table Inspector */}
            {selectedSpotId && (
                <div className="w-72 border-l border-zinc-800 bg-zinc-900/50 p-6 flex flex-col animate-in slide-in-from-right-4">
                    <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                        <Layout className="w-4 h-4 text-indigo-500" /> Table Details
                    </h3>

                    <div className="space-y-4 flex-1">
                        {/* Link to Existing Table */}
                        <div className="bg-indigo-500/10 p-3 rounded-lg border border-indigo-500/20 mb-2">
                            <label className="text-xs font-bold text-indigo-300 uppercase mb-1 block flex items-center gap-1">
                                <LinkIcon className="w-3 h-3" /> Link to Existing
                            </label>
                            <select
                                className="w-full bg-zinc-900 border border-indigo-500/30 text-white text-xs rounded p-1.5 outline-none focus:border-indigo-500"
                                onChange={(e) => {
                                    const targetLabel = e.target.value;
                                    if (!targetLabel) return;

                                    // Find source table to copy stats from
                                    const sourceTable = scenes
                                        .flatMap(s => s.hotspots)
                                        .find(h => h.type === 'table' && h.label === targetLabel);

                                    if (sourceTable) {
                                        updateSpot(selectedSpotId, {
                                            label: sourceTable.label,
                                            capacity: sourceTable.capacity,
                                            minSpend: sourceTable.minSpend,
                                            isVip: sourceTable.isVip
                                        });
                                    }
                                }}
                                value=""
                            >
                                <option value="">Select a table...</option>
                                {Array.from(new Set(scenes.flatMap(s => s.hotspots.filter(h => h.type === 'table' && h.id !== selectedSpotId)).map(h => h.label)))
                                    .sort()
                                    .map(label => (
                                        <option key={label} value={label}>{label}</option>
                                    ))}
                            </select>
                            <p className="text-[10px] text-zinc-500 mt-1 leading-tight">
                                Pick a table from another photo to use the same name & settings.
                            </p>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase">Label</label>
                            <input
                                value={activeScene?.hotspots.find(s => s.id === selectedSpotId)?.label || ''}
                                onChange={(e) => updateSpot(selectedSpotId, { label: e.target.value })}
                                className="w-full mt-1 bg-black border border-zinc-700 rounded-lg p-2 text-sm text-white focus:border-indigo-500 outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs font-bold text-zinc-500 uppercase">Capacity</label>
                                <input
                                    ref={capacityInputRef}
                                    type="number"
                                    value={activeScene?.hotspots.find(s => s.id === selectedSpotId)?.capacity || 0}
                                    onChange={(e) => updateSpot(selectedSpotId, { capacity: parseInt(e.target.value) })}
                                    className="w-full mt-1 bg-black border border-zinc-700 rounded-lg p-2 text-sm text-white focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-zinc-500 uppercase">Min Spend</label>
                                <input
                                    type="number"
                                    value={activeScene?.hotspots.find(s => s.id === selectedSpotId)?.minSpend || 0}
                                    onChange={(e) => updateSpot(selectedSpotId, { minSpend: parseInt(e.target.value) })}
                                    className="w-full mt-1 bg-black border border-zinc-700 rounded-lg p-2 text-sm text-white focus:border-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="pt-4 border-t border-zinc-800">
                            <label className="flex items-center justify-between p-3 rounded-lg bg-zinc-800 cursor-pointer hover:bg-zinc-700">
                                <span className="text-sm font-bold text-white">VIP Table</span>
                                <input
                                    type="checkbox"
                                    checked={!!activeScene?.hotspots.find(s => s.id === selectedSpotId)?.isVip}
                                    onChange={(e) => updateSpot(selectedSpotId, { isVip: e.target.checked })}
                                    className="accent-indigo-500 w-4 h-4"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="mt-6 space-y-2">
                        <button onClick={() => setSelectedSpotId(null)} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg flex items-center justify-center gap-2">
                            <Check className="w-4 h-4" /> Save & Continue
                        </button>
                        <button onClick={() => deleteSpot(selectedSpotId)} className="w-full py-3 bg-red-500/10 text-red-500 border border-red-500/20 font-bold rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                            Delete Table
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    // 3. Preview Mode
    // 3. Preview Mode
    const renderPreview = () => {
        const displayScene = scenes.find(s => s.id === displaySceneId);
        const incomingScene = transitionData ? scenes.find(s => s.id === transitionData.targetId) : null;

        const handleNavigate = (targetId: string, direction: 'up' | 'down' | 'left' | 'right') => {
            if (isAnimating) return;
            setTransitionData({ targetId, direction });
            setIsAnimating(true);

            // Finish animation after 400ms (Buffer to prevent flash)
            setTimeout(() => {
                setActiveSceneId(targetId);
                setIsAnimating(false);
                setTransitionData(null);
            }, 400);
        };

        // Swipe Logic
        const handleTouchStart = (e: React.TouchEvent) => {
            if (touchStart.current) return;
            touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        };
        const handleTouchEnd = (e: React.TouchEvent) => {
            if (!touchStart.current || !displayScene) return;
            const dx = e.changedTouches[0].clientX - touchStart.current.x;
            const dy = e.changedTouches[0].clientY - touchStart.current.y;

            // Threshold for swipe
            if (Math.abs(dx) > 50 || Math.abs(dy) > 50) {
                if (Math.abs(dx) > Math.abs(dy)) {
                    // Horizontal
                    const targetAction = dx < 0 ? 'right' : 'left'; // Swipe Left -> Go Right
                    const link = displayScene.hotspots.find(h => h.navDirection === targetAction);
                    if (link?.targetSceneId) handleNavigate(link.targetSceneId, targetAction);
                } else {
                    // Vertical
                    const targetAction = dy < 0 ? 'up' : 'down'; // Swipe Up -> Go Forward
                    const link = displayScene.hotspots.find(h => h.navDirection === targetAction);
                    if (link?.targetSceneId) handleNavigate(link.targetSceneId, targetAction);
                }
            }
            touchStart.current = null;
        };

        // --- Exact Animation Styles ---
        const TRANSITION_STYLE = { transition: 'transform 350ms cubic-bezier(0.2, 0, 0.2, 1)' };

        let exitingStyle = { ...TRANSITION_STYLE, transform: 'translate(0,0)', zIndex: 10 };

        if (isAnimating && transitionData) {
            const { direction } = transitionData;

            // 1. EXITING SCENE (Current)
            if (direction === 'up') {
                // Moving Forward: Zoom In
                exitingStyle.transform = 'scale(1.5) opacity(0)';
            } else if (direction === 'down') {
                // Moving Backward: Zoom Out
                exitingStyle.transform = 'scale(0.5) opacity(0)';
            } else if (direction === 'left') {
                // Turn Left: Slide Right
                exitingStyle.transform = 'translateX(100%)';
            } else if (direction === 'right') {
                // Turn Right: Slide Left
                exitingStyle.transform = 'translateX(-100%)';
            }
        }

        // Helper to get the Keyframe Animation name for the Entering element
        const getEnterAnimation = () => {
            if (!transitionData) return 'none';
            switch (transitionData.direction) {
                case 'up': return 'enterFromBottom'; // Forward
                case 'down': return 'enterFade'; // Backward (Fade/Zoom in used by keyframes)
                case 'left': return 'enterFromLeft'; // Turn Left
                case 'right': return 'enterFromRight'; // Turn Right
                default: return 'none';
            }
        };

        return (
            <div
                className="flex-1 bg-black relative flex items-center justify-center overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {/* 1. SCENE RENDERER (Dual  Layers) */}
                <div className="relative w-full h-full max-w-5xl flex items-center justify-center overflow-hidden">

                    {/* A. Exiting Scene (Current Display) */}
                    {displayScene && (
                        <div
                            key={displayScene.id}
                            className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none"
                            style={isAnimating ? exitingStyle : { ...TRANSITION_STYLE, transform: 'none', opacity: 1, zIndex: 10 }}
                        >
                            <img src={displayScene.image || ''} className="max-h-full max-w-full object-contain" />
                            {/* Hotspots hidden during animation to prevent stray clicks */}
                            {!isAnimating && (
                                <div className="absolute inset-0 pointer-events-auto">
                                    {displayScene.hotspots.map(spot => renderPreviewHotspot(spot, handleNavigate, selectedSpotId))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* B. Incoming Scene (Next Target) */}
                    {isAnimating && incomingScene && (
                        <div
                            key={incomingScene.id}
                            className="absolute inset-0 w-full h-full flex items-center justify-center z-20 pointer-events-none"
                            style={{
                                animation: `${getEnterAnimation()} 350ms cubic-bezier(0.2, 0, 0.2, 1) forwards`
                            }}
                        >
                            <img src={incomingScene.image || ''} className="max-h-full max-w-full object-contain" />
                        </div>
                    )}
                </div>

                {/* GLOBAL KEYFRAMES for this component */}
                <style jsx>{`
                    @keyframes enterFromBottom { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                    @keyframes enterFade { from { transform: scale(1.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                    @keyframes enterFromLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
                    @keyframes enterFromRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
                `}</style>

                <button onClick={() => setIsPreviewMode(false)} className="absolute top-4 right-4 bg-zinc-800 text-white px-4 py-2 rounded-full text-xs font-bold border border-zinc-700 hover:bg-zinc-700 z-50">
                    Exit Preview
                </button>
            </div>
        );
    };

    // Helper to render hotspots cleanly
    const renderPreviewHotspot = (
        spot: Hotspot,
        onNavigate: (id: string, dir: any) => void,
        selectedId: string | null
    ) => {
        if (spot.type === 'navigation' && spot.targetSceneId) {
            // Colors for Arrows
            const isForward = spot.navDirection === 'up';
            const arrowColor = "text-cyan-400"; // Attractive neon cyan
            const glassBg = "bg-zinc-900/40 hover:bg-zinc-800/80 border-cyan-500/30";

            return (
                <button
                    key={spot.id}
                    onClick={() => onNavigate(spot.targetSceneId!, spot.navDirection)}
                    className={`absolute w-14 h-14 -ml-7 -mt-7 rounded-full backdrop-blur-md border ${glassBg} flex items-center justify-center transition-all hover:scale-110 hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] z-50 group`}
                    style={{ left: `${spot.x}%`, top: `${spot.y}%`, transform: `rotate(${spot.rotation || 0}deg)` }}
                >
                    <div className={`absolute inset-0 rounded-full border border-cyan-400/20 animate-ping opacity-20 disabled:hidden`}></div>
                    <ChevronUp className={`w-8 h-8 ${arrowColor} drop-shadow-[0_0_5px_rgba(0,0,0,0.8)] filter transition-all group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]`} />

                    {/* Direction Label on Hover */}
                    <span className="absolute bottom-full mb-2 bg-black/80 text-white text-[9px] uppercase font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none transform -rotate-0">
                        {isForward ? 'Walk Forward' : `Turn ${spot.navDirection}`}
                    </span>
                </button>
            );
        }
        if (spot.type === 'table') {
            return (
                <div
                    key={spot.id}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-help group transition-all duration-300 hover:scale-110 z-30 ${selectedId === spot.id ? 'z-50 scale-110' : ''
                        }`}
                    style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                >
                    {/* Catchy Table Node */}
                    <div className={`relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg backdrop-blur-sm border-2 transition-all ${spot.isVip
                        ? 'bg-gradient-to-br from-amber-400/80 to-orange-600/80 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                        : 'bg-gradient-to-br from-indigo-500/80 to-violet-600/80 border-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                        }`}>
                        <span className="text-white font-black text-xs drop-shadow-md">
                            {spot.label.replace(/\D/g, '')}
                        </span>
                        <div className="absolute top-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full shadow-sm"></div>
                    </div>

                    {/* Hover Details */}
                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-40 bg-zinc-900/90 backdrop-blur border border-zinc-700 p-3 rounded-xl text-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 pointer-events-none shadow-2xl">
                        <div className="text-[10px] uppercase font-bold text-zinc-500 mb-1 tracking-wider">Capacity</div>
                        <div className="text-white font-bold text-lg leading-none mb-2">{spot.capacity} <span className="text-xs font-normal text-zinc-400">ppl</span></div>
                        {spot.minSpend && (
                            <div className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full inline-block font-bold">Min: ${spot.minSpend}</div>
                        )}
                    </div>
                </div>
            )
        }
        return null;
    };

    // 4. Connect View
    const renderConnectStep = () => {
        if (isPreviewMode) return renderPreview();


        const { nodes: gridNodes, visited, positions, posMap } = gridData;
        const GRID_W = 340;
        const GRID_H = 260;

        // Panning State definition moved to top level



        return (
            <div className="flex h-full w-full">
                {/* Sidebar: Draggable Scenes */}
                <div className="w-64 border-r border-zinc-800 bg-zinc-900/50 flex flex-col z-20">
                    <div className="p-4 border-b border-zinc-800">
                        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Step 3: Connect</h2>
                        <p className="text-[10px] text-zinc-400">Drag scenes to build your tour</p>
                    </div>

                    {/* Active Scene Switcher */}
                    <div className="p-2 border-b border-zinc-800 bg-zinc-900/80">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase mb-1 block">Center View On:</label>
                        <select
                            value={activeSceneId || ''}
                            // Reset Pan when auto-centering
                            onChange={(e) => { setActiveSceneId(e.target.value); setPan({ x: 0, y: 0 }); }}
                            className="w-full bg-black border border-zinc-700 text-white text-xs p-2 rounded outline-none focus:border-indigo-500"
                        >
                            {scenes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {/* Filter out scenes that are ALREADY in the grid (visited) */}
                        {scenes.filter(s => !visited.has(s.id)).length === 0 && (
                            <div className="text-zinc-500 text-xs text-center p-4">All scenes placed</div>
                        )}
                        {scenes
                            .filter(s => !visited.has(s.id)) // Only show unplaced scenes
                            .map(scene => (
                                <div
                                    key={scene.id}
                                    draggable
                                    onDragStart={() => setDraggedSceneId(scene.id)}
                                    onDragEnd={() => setDraggedSceneId(null)}
                                    className={`p-2 bg-zinc-800 rounded-lg border border-zinc-700 cursor-grab active:cursor-grabbing hover:border-indigo-500 hover:shadow-lg transition-all group ${draggedSceneId === scene.id ? 'opacity-50' : ''}`}
                                >
                                    <div className="aspect-video bg-black rounded mb-2 overflow-hidden">
                                        <img src={scene.image || ''} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="text-xs font-bold text-zinc-200">{scene.name}</div>
                                </div>
                            ))}
                    </div>
                </div>

                {/* Canvas with Drop Zones - Infinite Grid Background */}
                <div
                    className={`flex-1 bg-[#09090b] relative flex items-center justify-center overflow-hidden ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
                    onMouseDown={handlePanMouseDown}
                    style={{
                        backgroundImage: 'radial-gradient(circle, #3f3f46 1px, transparent 1px)',
                        backgroundSize: '30px 30px',
                        backgroundPosition: `${pan.x}px ${pan.y}px` // Parallax effect for grid dots
                    }}>


                    {scenes.length > 0 ? (
                        <div
                            className="absolute inset-0 top-1/2 left-1/2 pointer-events-none transition-transform duration-75 ease-out"
                            style={{
                                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
                            }}
                        >
                            {/* --- 1. Connector Lines Layer & Controls --- */}
                            <svg className="absolute top-0 left-0 overflow-visible z-0">
                                {gridNodes.map((node: GridNode) => (
                                    (['right', 'down'] as const).map((dir) => {
                                        const link = node.scene.hotspots.find((h: Hotspot) => h.navDirection === dir);
                                        if (link) {
                                            const targetNode = gridNodes.find((n: GridNode) => n.scene.id === link.targetSceneId);
                                            if (targetNode) {
                                                const x1 = node.x * GRID_W;
                                                const y1 = node.y * GRID_H;
                                                const x2 = targetNode.x * GRID_W;
                                                const y2 = targetNode.y * GRID_H;
                                                return (
                                                    <g key={`link-${node.scene.id}-${dir}`}>
                                                        <line
                                                            x1={x1} y1={y1} x2={x2} y2={y2}
                                                            stroke="#6366f1" strokeWidth="2"
                                                        />
                                                        {/* Direction Arrow */}
                                                        <circle cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} r="4" fill="#6366f1" />
                                                    </g>
                                                );
                                            }
                                        }
                                        return null;
                                    })
                                ))}
                            </svg>

                            {/* --- Link Remove Buttons (HTML Layer) --- */}
                            {gridNodes.map((node: GridNode) => (
                                (['right', 'down'] as const).map((dir) => {
                                    const link = node.scene.hotspots.find((h: Hotspot) => h.navDirection === dir);
                                    if (link) {
                                        const targetNode = gridNodes.find((n: GridNode) => n.scene.id === link.targetSceneId);
                                        if (targetNode) {
                                            const midX = (node.x * GRID_W + targetNode.x * GRID_W) / 2;
                                            const midY = (node.y * GRID_H + targetNode.y * GRID_H) / 2;
                                            return (
                                                <div
                                                    key={`rm-link-${node.scene.id}-${dir}`}
                                                    className="absolute z-40 pointer-events-auto transform -translate-x-1/2 -translate-y-1/2"
                                                    style={{ left: midX, top: midY }}
                                                >
                                                    <button
                                                        onClick={() => disconnectScenes(node.scene.id, targetNode.scene.id)}
                                                        className="w-5 h-5 bg-zinc-900 border border-zinc-700 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white hover:scale-110 transition-all shadow-md"
                                                        title="Remove Link"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            );
                                        }
                                    }
                                    return null;
                                })
                            ))}

                            {/* --- 2. Smart Link Suggestions (Adjacent but Unlinked) --- */}
                            {gridNodes.map((node: GridNode) => {
                                return (['right', 'down'] as const).map((dir) => {
                                    let dx = 0, dy = 0;
                                    if (dir === 'right') dx = 1;
                                    if (dir === 'down') dy = 1;

                                    const targetX = node.x + dx;
                                    const targetY = node.y + dy;
                                    const neighbor = posMap.get(`${targetX},${targetY}`);

                                    // If there is a neighbor physically there...
                                    if (neighbor) {
                                        // Check if they are ALREADY linked
                                        const isLinked = node.scene.hotspots.some((h: Hotspot) => h.navDirection === dir && h.targetSceneId === neighbor.scene.id);

                                        // If NOT linked, show a "Link" suggestion button
                                        if (!isLinked) {
                                            const mx = (node.x * GRID_W + neighbor.x * GRID_W) / 2;
                                            const my = (node.y * GRID_H + neighbor.y * GRID_H) / 2;

                                            return (
                                                <div
                                                    key={`suggest-${node.scene.id}-${neighbor.scene.id}`}
                                                    className="absolute z-40 pointer-events-auto flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform cursor-pointer group"
                                                    style={{ left: mx, top: my }}
                                                    onClick={() => connectScenes(node.scene.id, neighbor.scene.id, dir as any)}
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-dashed border-zinc-500 flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-400 group-hover:text-white transition-colors shadow-lg">
                                                        <LinkIcon className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                                                    </div>
                                                    <span className="mt-1 text-[9px] font-bold text-zinc-500 bg-black/50 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Link
                                                    </span>
                                                </div>
                                            );
                                        }
                                    }
                                    return null;
                                });
                            })}

                            {/* --- 3. Nodes & Drop Zones --- */}
                            {gridNodes.map((node: GridNode) => {
                                const isActive = node.scene.id === activeScene?.id;
                                return (
                                    <div
                                        key={node.scene.id}
                                        className="absolute flex items-center justify-center pointer-events-auto transition-all duration-500 ease-out"
                                        style={{
                                            width: '240px', height: '160px',
                                            transform: `translate(calc(${node.x * GRID_W}px - 50%), calc(${node.y * GRID_H}px - 50%))`,
                                            zIndex: isActive ? 50 : 10
                                        }}
                                    >
                                        {/* Card */}
                                        <div
                                            onClick={() => setActiveSceneId(node.scene.id)}
                                            className={`relative w-full h-full rounded-xl overflow-hidden shadow-2xl border-2 transition-all cursor-pointer group ${isActive ? 'border-indigo-500 scale-110 shadow-indigo-500/20' : 'border-zinc-700 grayscale hover:grayscale-0 hover:scale-105'}`}
                                        >
                                            <img src={node.scene.image || ''} className="w-full h-full object-cover" />

                                            {/* Label */}
                                            <div className="absolute inset-x-0 bottom-0 bg-black/80 p-2 text-center">
                                                <div className="text-xs uppercase font-bold text-white truncate tracking-wider">{node.scene.name}</div>
                                            </div>

                                            {/* Active Indicator */}
                                            {isActive && (
                                                <div className="absolute top-2 left-2 bg-indigo-600 text-white p-1 rounded-full shadow-lg">
                                                    <MapPin className="w-4 h-4" />
                                                </div>
                                            )}

                                            {/* Unlink / Remove */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (gridNodes.length === 1) {
                                                        // Last node reset
                                                        const current = scenes.find(s => s.id === node.scene.id);
                                                        const others = scenes.filter(s => s.id !== node.scene.id);
                                                        if (current) saveScenes([...others, current]);

                                                        setActiveSceneId(null);
                                                        setPan({ x: 0, y: 0 });
                                                        setZoom(1);
                                                    } else {
                                                        removeNodeFromMap(node.scene.id);
                                                    }
                                                }}
                                                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-lg z-50"
                                                title="Remove from Map"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>

                                        {/* Drop Zones for this Node */}
                                        {
                                            (['up', 'down', 'left', 'right'] as const).map((dir) => {
                                                const hasLink = node.scene.hotspots.some((h: Hotspot) => h.navDirection === dir);
                                                if (hasLink) return null;

                                                let dx = 0, dy = 0;
                                                if (dir === 'left') dx = -1;
                                                if (dir === 'right') dx = 1;
                                                if (dir === 'up') dy = -1;
                                                if (dir === 'down') dy = 1;

                                                const targetX = node.x + dx;
                                                const targetY = node.y + dy;

                                                // Check collision with existing grid nodes
                                                if (positions.has(`${targetX},${targetY}`)) return null;

                                                // Drop Zone Position (Relative to Current Node center)
                                                const offX = dx * GRID_W;
                                                const offY = dy * GRID_H;

                                                return (
                                                    <div
                                                        key={`drop-${node.scene.id}-${dir}`}
                                                        className={`absolute w-32 h-20 rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300 z-0 ${draggedSceneId ? 'opacity-100 border-indigo-500/50 bg-indigo-500/5 cursor-copy' : 'opacity-0 hover:opacity-100 hover:border-zinc-600 border-transparent hover:bg-black/20'}`}
                                                        style={{
                                                            transform: `translate(${offX}px, ${offY}px)`,
                                                            pointerEvents: 'auto'
                                                        }}
                                                        onDragOver={(e) => e.preventDefault()}
                                                        onDrop={(e) => {
                                                            e.stopPropagation();
                                                            handleExtensionDrop(node.scene.id, dir as any);
                                                        }}
                                                    >
                                                        <PlusCircle className={`w-6 h-6 mb-1 ${draggedSceneId ? 'text-indigo-400' : 'text-zinc-500'}`} />
                                                        <span className="text-[9px] font-bold uppercase text-zinc-500">Link {dir}</span>
                                                    </div>
                                                );
                                            })
                                        }
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* Empty State */
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => {
                                if (draggedSceneId) setActiveSceneId(draggedSceneId);
                                setDraggedSceneId(null);
                            }}
                            className={`w-96 h-96 border-4 border-dashed rounded-3xl flex flex-col items-center justify-center p-8 text-center transition-all ${draggedSceneId ? 'border-indigo-500 bg-indigo-500/10 scale-105' : 'border-zinc-800 text-zinc-500'}`}
                        >
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${draggedSceneId ? 'bg-indigo-500 text-white animate-bounce' : 'bg-zinc-800'}`}>
                                <MapPin className="w-8 h-8" />
                            </div>
                            <h3 className={`text-xl font-bold mb-2 ${draggedSceneId ? 'text-indigo-400' : 'text-zinc-400'}`}>
                                {draggedSceneId ? 'Drop to Start Here' : 'Start Your Tour'}
                            </h3>
                            <p className="text-zinc-500 text-sm">
                                Drag your <strong className="text-zinc-300">Main Entrance</strong> photo from the left sidebar and drop it here to begin mapping.
                            </p>
                        </div>
                    )}

                    {/* Zoom Controls & Preview */}
                    <div className="absolute top-4 right-4 z-50 flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-zinc-900/80 backdrop-blur rounded-full p-1 border border-zinc-700">
                            <button
                                onClick={() => setZoom(z => Math.max(0.2, z - 0.1))}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                            >
                                <span className="text-xl font-bold mb-1">-</span>
                            </button>
                            <span className="text-xs font-mono text-zinc-500 w-8 text-center">{Math.round(zoom * 100)}%</span>
                            <button
                                onClick={() => setZoom(z => Math.min(2, z + 0.1))}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        <button
                            onClick={() => {
                                setIsPreviewMode(true);
                                if (scenes.length > 0) setActiveSceneId(scenes[0].id);
                            }}
                            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-full hover:scale-105 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                        >
                            <Play className="w-4 h-4 fill-current" /> Preview Tour
                        </button>
                    </div>
                </div>
            </div >
        );
    };



    // Main Render
    return (
        <div className="flex h-[calc(100vh-80px)] bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl font-sans">
            {editorStep === 1 && renderUploadStep()}
            {editorStep === 2 && renderTableStep()}
            {editorStep === 3 && renderConnectStep()}

            {/* Global Warning / Modal logic can go here */}
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmLabel={modalConfig.confirmLabel || "Confirm"}
                isDestructive={modalConfig.isDestructive}
            />
        </div>
    );
}
