"use client";

import { useState, useRef, useEffect } from "react";
import { X, Check, RotateCw, Volume2, VolumeX, Scissors, ZoomIn } from "lucide-react";

interface VideoEditorProps {
    videoSrc: string;
    onCancel: () => void;
    onSave: (transformations: VideoTransformations) => void;
}

export interface VideoTransformations {
    rotation: number;     // 0, 90, 180, 270
    zoom: number;         // 1.0 to 3.0
    startTime: number;    // seconds
    endTime: number | null; // seconds
    isMuted: boolean;
}

export default function VideoEditor({ videoSrc, onCancel, onSave }: VideoEditorProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [activeHandle, setActiveHandle] = useState<'start' | 'end' | null>(null);

    // Transformation States
    const [rotation, setRotation] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState<number | null>(null);
    const [isMuted, setIsMuted] = useState(false);

    // Handle Metadata Load
    const onLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
            if (endTime === null) {
                setEndTime(videoRef.current.duration);
            }
        }
    };

    // --- Pointer Events for Custom Slider ---
    const calculateTimeFromEvent = (e: React.PointerEvent) => {
        if (!trackRef.current || duration === 0) return 0;
        const rect = trackRef.current.getBoundingClientRect();
        const clientX = e.clientX;
        // The track has 1rem padding (16px) on left/right for handles
        // Active area width is (rect.width - 32)
        const trackLeft = rect.left + 16;
        const trackWidth = rect.width - 32;

        let percent = (clientX - trackLeft) / trackWidth;
        percent = Math.max(0, Math.min(1, percent));

        return percent * duration;
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        e.preventDefault(); // Prevent scrolling on touch
        const time = calculateTimeFromEvent(e);
        const currentEnd = endTime || duration;

        // Determine closest handle
        const startDiff = Math.abs(time - startTime);
        const endDiff = Math.abs(time - currentEnd);

        // Threshold: 15% of total duration or close distance
        const threshold = duration * 0.15;

        // If clicking in the middle far from both, maybe do nothing? 
        // Or if close to one, pick it.
        // Let's implement robust picking:
        if (startDiff < endDiff) {
            setActiveHandle('start');
            // Immediate update on click? Optional, better to just grab.
            // setStartTime(Math.min(time, currentEnd - 0.5));
        } else {
            setActiveHandle('end');
            // setEndTime(Math.max(time, startTime + 0.5));
        }

        // Capture pointer to track outside div
        (e.target as Element).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!activeHandle) return;

        const time = calculateTimeFromEvent(e);
        const currentEnd = endTime || duration;

        if (activeHandle === 'start') {
            const newStart = Math.min(time, currentEnd - 0.5); // Min duration 0.5s
            setStartTime(newStart);
            if (videoRef.current) videoRef.current.currentTime = newStart;
        } else {
            const newEnd = Math.max(time, startTime + 0.5);
            setEndTime(newEnd);
            if (videoRef.current) videoRef.current.currentTime = newEnd;
            // Loop preview logic will handle the reset
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        setActiveHandle(null);
        (e.target as Element).releasePointerCapture(e.pointerId);
    };

    const handleSave = () => {
        onSave({
            rotation,
            zoom,
            startTime,
            endTime,
            isMuted
        });
    };

    // Helper to format time
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="bg-zinc-900 rounded-2xl overflow-hidden w-full max-w-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-4 flex justify-between items-center border-b border-white/10 bg-zinc-900 z-10">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Scissors className="w-5 h-5 text-indigo-400" />
                        Edit Video
                    </h3>
                    <button type="button" onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Video Preview Area */}
                <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
                    <div
                        className="relative transition-all duration-300 ease-in-out"
                        style={{
                            transform: `rotate(${rotation}deg) scale(${zoom})`
                        }}
                    >
                        <video
                            ref={videoRef}
                            src={videoSrc}
                            className="max-h-[50vh] max-w-full pointer-events-none" // Disable native controls to use custom loop
                            muted={isMuted} // Preview mute instantly
                            onLoadedMetadata={onLoadedMetadata}
                            controls={false}
                            playsInline
                            loop
                            // Basic trim preview loop logic
                            onTimeUpdate={(e) => {
                                const vid = e.currentTarget;
                                setCurrentTime(vid.currentTime);
                                if (endTime && vid.currentTime >= endTime) {
                                    vid.currentTime = startTime;
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Controls Area */}
                <div className="p-4 bg-zinc-900 border-t border-white/10 flex flex-col gap-5 overflow-y-auto">

                    {/* 1. Trim Controls (WhatsApp Style) */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                            <span className="text-zinc-400">Trim Video</span>
                            <span className="text-zinc-500 font-mono">{formatTime(startTime)} - {formatTime(endTime || duration)}</span>
                        </div>

                        <div
                            className="relative h-14 bg-zinc-950/50 border border-white/5 rounded-xl flex items-center px-4 select-none touch-none cursor-pointer mx-4 group"
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerLeave={handlePointerUp}
                            ref={trackRef}
                        >
                            {/* Track Background */}
                            <div className="absolute left-4 right-4 h-1.5 bg-zinc-800 rounded-full overflow-hidden pointer-events-none">
                                {/* Active Range */}
                                <div
                                    className="absolute h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                    style={{
                                        left: `${(startTime / duration) * 100}%`,
                                        width: `${((endTime || duration) - startTime) / duration * 100}%`
                                    }}
                                />
                            </div>

                            {/* Handle Thumbs (Visual) */}
                            {/* Start Handle */}
                            <div
                                className="absolute h-8 w-5 bg-white rounded-md shadow-lg border border-indigo-200 z-10 flex items-center justify-center transform -translate-x-1/2 transition-transform active:scale-110 active:border-indigo-500"
                                style={{ left: `calc(${(startTime / duration) * 100}% + 1rem)` }}
                            >
                                <div className="w-0.5 h-3 bg-zinc-300 rounded-full" />
                            </div>

                            {/* End Handle */}
                            <div
                                className="absolute h-8 w-5 bg-white rounded-md shadow-lg border border-indigo-200 z-10 flex items-center justify-center transform -translate-x-1/2 transition-transform active:scale-110 active:border-indigo-500"
                                style={{ left: `calc(${((endTime || duration) / duration) * 100}% + 1rem)` }}
                            >
                                <div className="w-0.5 h-3 bg-zinc-300 rounded-full" />
                            </div>

                            {/* Dimmed Areas (Visual Mask) */}
                            <div
                                className="absolute left-4 h-1.5 bg-zinc-950/80 z-0 rounded-l-full pointer-events-none"
                                style={{ width: `${(startTime / duration) * 100}%` }}
                            />
                            <div
                                className="absolute right-4 h-1.5 bg-zinc-950/80 z-0 rounded-r-full pointer-events-none"
                                style={{ width: `${100 - (((endTime || duration) / duration) * 100)}%` }}
                            />
                        </div>

                        {/* Selected Duration Display */}
                        <div className="flex justify-center">
                            <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                                <span className="text-xs font-medium text-indigo-300">
                                    Duration: <span className="text-indigo-100 font-bold ml-1">{formatTime((endTime || duration) - startTime)}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Adjustments Section */}
                    <div className="bg-zinc-800/30 rounded-xl p-4 border border-white/5 space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                            <span>Adjustments</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Zoom */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-zinc-500">
                                    <span className="flex items-center gap-1"><ZoomIn size={12} /> Zoom</span>
                                    <span>{zoom}x</span>
                                </div>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full accent-indigo-500 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            {/* Actions Buttons */}
                            <div className="flex items-center gap-3">
                                {/* Rotate */}
                                <button
                                    type="button"
                                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                                    className="flex-1 h-9 px-3 bg-zinc-700 hover:bg-zinc-600 border border-white/5 rounded-lg text-white transition-all flex items-center justify-center gap-2 text-xs font-medium active:scale-95"
                                >
                                    <RotateCw size={14} className="text-zinc-300" />
                                    Rotate
                                </button>

                                {/* Mute */}
                                <button
                                    type="button"
                                    onClick={() => setIsMuted(!isMuted)}
                                    className={`flex-1 h-9 px-3 border rounded-lg transition-all flex items-center justify-center gap-2 text-xs font-medium active:scale-95 ${isMuted
                                            ? 'bg-rose-500/10 border-rose-500/50 text-rose-400 hover:bg-rose-500/20'
                                            : 'bg-zinc-700 hover:bg-zinc-600 border-white/5 text-zinc-300'
                                        }`}
                                >
                                    {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                                    {isMuted ? 'Muted' : 'Mute Sound'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2.5 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-colors text-sm font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="px-8 py-2.5 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-colors flex items-center gap-2 text-sm shadow-lg shadow-white/5"
                        >
                            <Check size={16} />
                            Save Video
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
