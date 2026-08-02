import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crop, Check, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { compressAndCropAvatar } from '../services/avatarService';

interface AvatarCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedDataUrl: string) => void;
}

export const AvatarCropperModal: React.FC<AvatarCropperModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
}) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageNaturalSize, setImageNaturalSize] = useState({ w: 400, h: 400 });

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.onload = () => {
        setImageNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      };
      img.src = imageSrc;
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    }
  }, [imageSrc]);

  if (!isOpen || !imageSrc) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    startPosRef.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    setOffset({
      x: e.clientX - startPosRef.current.x,
      y: e.clientY - startPosRef.current.y,
    });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleConfirmCrop = async () => {
    setIsProcessing(true);
    try {
      // Calculate crop rectangle in natural image dimensions
      const minDimension = Math.min(imageNaturalSize.w, imageNaturalSize.h);
      const cropW = minDimension / zoom;
      const cropH = minDimension / zoom;
      const cropX = Math.max(0, (imageNaturalSize.w - cropW) / 2 - offset.x * (cropW / 240));
      const cropY = Math.max(0, (imageNaturalSize.h - cropH) / 2 - offset.y * (cropH / 240));

      const croppedUrl = await compressAndCropAvatar(
        imageSrc,
        {
          x: cropX,
          y: cropY,
          width: cropW,
          height: cropH,
        },
        400
      );

      onCropComplete(croppedUrl);
      onClose();
    } catch (err) {
      console.error('Cropping error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-body select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0E2A6D]/40 backdrop-blur-xs"
        />

        {/* Dialog Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md rounded-[18px] border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] p-6 shadow-2xl overflow-hidden text-[#1F2937] dark:text-[#F8FAFC]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0E2A6D] text-white shadow-xs border border-[#D9A441]/30">
                <Crop size={18} strokeWidth={1.75} />
              </div>
              <h3 className="font-heading font-bold text-[18px] text-[#0E2A6D] dark:text-[#F8FAFC]">
                Crop Profile Picture (1:1)
              </h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-[#64748B] hover:bg-[#F5F7FB] dark:hover:bg-[#0F172A] transition"
            >
              <X size={18} strokeWidth={1.75} />
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
              className="relative w-[240px] h-[240px] rounded-full overflow-hidden border-4 border-[#0E2A6D] dark:border-[#D9A441] shadow-lg cursor-grab active:cursor-grabbing bg-[#0F172A]"
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
            <p className="mt-2 text-caption text-[#64748B] dark:text-[#94A3B8]">
              Drag to position photo inside circle
            </p>
          </div>

          {/* Controls: Zoom & Reset */}
          <div className="flex items-center justify-between gap-4 mb-6 px-4 bg-[#F5F7FB] dark:bg-[#0F172A] p-3 rounded-xl">
            <button
              onClick={() => setZoom((z) => Math.max(0.8, z - 0.2))}
              className="p-1.5 rounded-lg text-[#64748B] hover:bg-white dark:hover:bg-[#1E293B]"
              title="Zoom Out"
            >
              <ZoomOut size={18} strokeWidth={1.75} />
            </button>

            <input
              type="range"
              min="0.8"
              max="2.5"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[#E2E8F0] dark:bg-[#334155] rounded-lg appearance-none cursor-pointer accent-[#0E2A6D]"
            />

            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
              className="p-1.5 rounded-lg text-[#64748B] hover:bg-white dark:hover:bg-[#1E293B]"
              title="Zoom In"
            >
              <ZoomIn size={18} strokeWidth={1.75} />
            </button>

            <button
              onClick={() => {
                setZoom(1);
                setOffset({ x: 0, y: 0 });
              }}
              className="p-1.5 rounded-lg text-[#64748B] hover:bg-white dark:hover:bg-[#1E293B]"
              title="Reset Zoom"
            >
              <RotateCcw size={16} strokeWidth={1.75} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="h-[44px] px-5 rounded-[14px] border border-[#E2E8F0] dark:border-[#334155] font-heading font-bold text-[15px] text-[#64748B] hover:bg-[#F5F7FB] dark:hover:bg-[#0F172A] transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmCrop}
              disabled={isProcessing}
              className="h-[44px] px-6 rounded-[14px] bg-[#0E2A6D] hover:bg-[#153B8A] text-white font-heading font-bold text-[15px] shadow-xs flex items-center gap-2 transition disabled:opacity-50"
            >
              <Check size={18} strokeWidth={1.75} />
              <span>{isProcessing ? 'Saving...' : 'Apply & Save'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AvatarCropperModal;
