import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crop, X, Check, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface AvatarCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedDataUrl: string) => void;
}

export default function AvatarCropperModal({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
}: AvatarCropperModalProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ eX: e.clientX, eY: e.clientY, oX: offset.x, oY: offset.y } as any);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - (dragStart as any).eX;
    const dy = e.clientY - (dragStart as any).eY;
    setOffset({
      x: (dragStart as any).oX + dx,
      y: (dragStart as any).oY + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleConfirmCrop = () => {
    const canvas = document.createElement('canvas');
    const size = 300; // Output avatar size 300x300
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      ctx.clearRect(0, 0, size, size);

      // Draw circular clip
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();

      const viewportSize = 240; // Size of circular viewport DOM element
      const scaleFactor = size / viewportSize;

      const drawWidth = img.width * zoom * scaleFactor;
      const drawHeight = img.height * zoom * scaleFactor;

      const drawX = size / 2 - drawWidth / 2 + offset.x * scaleFactor;
      const drawY = size / 2 - drawHeight / 2 + offset.y * scaleFactor;

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      const dataUrl = canvas.toDataURL('image/png');
      onCropComplete(dataUrl);
    };
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] p-6 shadow-2xl overflow-hidden text-[#111827] dark:text-[#FAFAFA]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#2A2A2A] pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
                <Crop size={18} />
              </div>
              <h3 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA]">
                Crop Profile Picture (1:1)
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-[8px] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-center text-[#6B7280] dark:text-[#A1A1AA] hover:text-[#111827] dark:hover:text-[#FAFAFA] transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* 1:1 Crop Viewport Box */}
          <div className="relative my-4 flex flex-col items-center">
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="relative w-[240px] h-[240px] rounded-full overflow-hidden border-4 border-[#111827] dark:border-[#FAFAFA] shadow-lg cursor-grab active:cursor-grabbing bg-[#0A0A0A]"
            >
              <img
                src={imageSrc}
                alt="Crop preview"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                  transformOrigin: 'center center',
                }}
                className="w-full h-full object-cover transition-transform duration-75 pointer-events-none"
              />
            </div>
            <p className="mt-3 text-[13px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">
              Drag to position photo inside circle
            </p>
          </div>

          {/* Controls: Zoom & Reset */}
          <div className="flex items-center justify-between gap-3 mb-6 px-4 bg-[#F8FAFC] dark:bg-[#111111] p-3 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A]">
            <button
              onClick={() => setZoom((z) => Math.max(0.8, z - 0.2))}
              className="p-1.5 rounded-[8px] text-[#6B7280] dark:text-[#A1A1AA] hover:bg-[#FFFFFF] dark:hover:bg-[#18181B] transition"
              title="Zoom Out"
            >
              <ZoomOut size={18} />
            </button>

            <input
              type="range"
              min="0.8"
              max="2.5"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[#E5E7EB] dark:bg-[#2A2A2A] rounded-lg appearance-none cursor-pointer accent-[#111827] dark:accent-[#FAFAFA]"
            />

            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
              className="p-1.5 rounded-[8px] text-[#6B7280] dark:text-[#A1A1AA] hover:bg-[#FFFFFF] dark:hover:bg-[#18181B] transition"
              title="Zoom In"
            >
              <ZoomIn size={18} />
            </button>

            <button
              onClick={() => {
                setZoom(1);
                setOffset({ x: 0, y: 0 });
              }}
              className="p-1.5 rounded-[8px] text-[#6B7280] dark:text-[#A1A1AA] hover:bg-[#FFFFFF] dark:hover:bg-[#18181B] transition"
              title="Reset Zoom"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="h-[40px] px-4 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] font-medium text-[14px] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmCrop}
              className="h-[40px] px-5 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Check size={16} />
              <span>Apply & Save</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
