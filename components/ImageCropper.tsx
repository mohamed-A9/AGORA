"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { X, Check } from "lucide-react";
import getCroppedImg from "@/lib/cropImage"; // We'll create this util

interface ImageCropperProps {
    imageSrc: string;
    onCancel: () => void;
    onCropComplete: (croppedAreaPixels: any) => void;
    aspect?: number;
}

export default function ImageCropper({ imageSrc, onCancel, onCropComplete, aspect = 4 / 3 }: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = () => {
        onCropComplete(croppedAreaPixels);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 rounded-2xl overflow-hidden w-full max-w-2xl flex flex-col h-[80vh]">
                <div className="p-4 flex justify-between items-center border-b border-white/10 bg-zinc-900 z-10">
                    <h3 className="text-lg font-bold text-white">Adjust Image</h3>
                    <button type="button" onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="relative flex-1 bg-black">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={onCropChange}
                        onZoomChange={onZoomChange}
                        onCropComplete={onCropCompleteHandler}
                    />
                </div>

                <div className="p-4 bg-zinc-900 border-t border-white/10 flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-white/50">Zoom</span>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full accent-indigo-500 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button" // Prevent form submission
                            onClick={onCancel}
                            className="px-4 py-2 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button" // Prevent form submission
                            onClick={handleSave}
                            className="px-6 py-2 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition-colors flex items-center gap-2"
                        >
                            <Check size={18} />
                            Save Crop
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
