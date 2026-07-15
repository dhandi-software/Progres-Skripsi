import React, { useRef, useState, useEffect } from 'react';
import { X, Eraser, Check, Upload } from 'lucide-react';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "~/lib/utils";

interface SignatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (signatureData: string) => void;
}

export function SignatureModal({ isOpen, onClose, onSave }: SignatureModalProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [activeTab, setActiveTab] = useState<'draw' | 'upload'>('draw');
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setActiveTab('draw');
            setUploadedImage(null);
            setUploadError(null);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && activeTab === 'draw' && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
            }
        }
    }, [isOpen, activeTab]);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.beginPath(); // reset path
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        // Prevent scrolling while drawing on touch devices
        if (e.cancelable) {
            e.preventDefault();
        }

        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const clearCanvas = () => {
        if (activeTab === 'draw') {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (canvas && ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        } else {
            setUploadedImage(null);
            setUploadError(null);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setUploadError("Ukuran gambar maksimal 5MB");
                return;
            }
            setUploadError(null);
            const reader = new FileReader();
            reader.onload = (event) => {
                setUploadedImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        if (activeTab === 'draw') {
            const canvas = canvasRef.current;
            if (canvas) {
                // Check if canvas is empty before saving
                const blank = document.createElement('canvas');
                blank.width = canvas.width;
                blank.height = canvas.height;
                if (canvas.toDataURL() === blank.toDataURL()) {
                     // Empty canvas
                     onSave(""); // Pass empty string if they want to clear
                } else {
                    const dataUrl = canvas.toDataURL('image/png');
                    onSave(dataUrl);
                }
                onClose();
            }
        } else {
            onSave(uploadedImage || "");
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <DialogPrimitive.Content 
                    style={{ 
                        position: 'fixed', 
                        left: '50%', 
                        top: '50%', 
                        transform: 'translate(-50%, -50%)', 
                        width: '90%', 
                        maxWidth: '450px', 
                        zIndex: 10000,
                        display: 'flex',
                        flexDirection: 'column',
                        outline: 'none'
                    }}
                    className="duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
                    onPointerDownOutside={onClose}
                >
                    <div className="bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 ring-1 ring-black/10 w-full">
                        <div className="flex justify-between items-center p-6 border-b bg-gray-50/80 backdrop-blur-sm">
                            <DialogPrimitive.Title className="font-extrabold text-xl text-gray-900 tracking-tight">Tanda Tangan Digital</DialogPrimitive.Title>
                            <DialogPrimitive.Close className="text-gray-400 hover:text-gray-900 transition-all p-2 bg-white rounded-full shadow-sm border border-gray-100 hover:border-gray-300 outline-none active:scale-90">
                                <X size={20} />
                            </DialogPrimitive.Close>
                        </div>

                        <div className="p-8 space-y-6 bg-white w-full">
                            <div className="space-y-4 text-center w-full">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-[#D25026] rounded-full text-[10px] font-bold uppercase tracking-widest border border-orange-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path><path d="m15 5 4 4"></path></svg>
                                    Input Paraf / TTD
                                </div>
                                
                                {/* Tabs Header */}
                                <div className="flex border-b border-gray-200 w-full">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('draw')}
                                        className={cn(
                                            "flex-1 pb-2 text-sm font-bold border-b-2 text-center transition-all outline-none",
                                            activeTab === 'draw' ? "border-[#D25026] text-[#D25026]" : "border-transparent text-gray-400 hover:text-gray-600"
                                        )}
                                    >
                                        Tulis TTD
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('upload')}
                                        className={cn(
                                            "flex-1 pb-2 text-sm font-bold border-b-2 text-center transition-all outline-none",
                                            activeTab === 'upload' ? "border-[#D25026] text-[#D25026]" : "border-transparent text-gray-400 hover:text-gray-600"
                                        )}
                                    >
                                        Unggah Gambar
                                    </button>
                                </div>

                                {activeTab === 'draw' ? (
                                    <div className="space-y-4">
                                        <p className="text-sm font-medium text-gray-400">Silakan gambar tanda tangan / paraf Anda di bawah ini.</p>
                                        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden touch-none relative group transition-all hover:border-[#D25026]/40 shadow-inner w-full aspect-[4/2.2]">
                                            <canvas
                                                ref={canvasRef}
                                                width={400}
                                                height={220}
                                                onMouseDown={startDrawing}
                                                onMouseMove={draw}
                                                onMouseUp={stopDrawing}
                                                onMouseLeave={stopDrawing}
                                                onTouchStart={startDrawing}
                                                onTouchMove={draw}
                                                onTouchEnd={stopDrawing}
                                                className="w-full h-full cursor-crosshair bg-white"
                                                style={{ touchAction: 'none', display: 'block' }}
                                            />
                                            <div className="absolute top-3 right-3 opacity-20 pointer-events-none">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M10 13l2 2 4-4"></path></svg>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-sm font-medium text-gray-400">Unggah berkas gambar tanda tangan (Format: PNG, JPG, JPEG. Maksimal 5MB).</p>
                                        <div className="flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden p-6 transition-all hover:border-[#D25026]/40 shadow-inner w-full aspect-[4/2.2] relative">
                                            {uploadedImage ? (
                                                <div className="w-full h-full flex flex-col items-center justify-center relative">
                                                    <img src={uploadedImage} alt="Uploaded signature" className="max-w-full max-h-full object-contain" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setUploadedImage(null)}
                                                        className="absolute top-2 right-2 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 transition-colors shadow-sm"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full space-y-2 group">
                                                    <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-[#D25026] group-hover:scale-110 transition-transform">
                                                        <Upload size={20} />
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-500 group-hover:text-[#D25026] transition-colors">Pilih gambar tanda tangan</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                        className="hidden"
                                                    />
                                                </label>
                                            )}
                                        </div>
                                        {uploadError && (
                                            <p className="text-xs font-bold text-red-500 text-center">{uploadError}</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button
                                    onClick={clearCanvas}
                                    type="button"
                                    className="flex-1 py-4 px-4 rounded-2xl border-2 border-gray-100 text-gray-500 font-bold hover:bg-gray-50 hover:text-gray-700 transition-all active:scale-95 flex items-center justify-center gap-2 group"
                                >
                                    <Eraser size={20} className="group-hover:rotate-12 transition-transform" />
                                    Bersihkan
                                </button>
                                <button
                                    onClick={handleSave}
                                    type="button"
                                    className="flex-[2] py-4 px-4 rounded-2xl bg-[#D25026] text-white font-bold hover:bg-neutral-900 transition-all shadow-xl shadow-[#D25026]/20 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Check size={20} strokeWidth={3} />
                                    Simpan Paraf
                                </button>
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 border-t text-[10px] text-center text-gray-400 font-medium">
                            Pastikan paraf sudah sesuai sebelum disimpan ke sistem.
                        </div>
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
