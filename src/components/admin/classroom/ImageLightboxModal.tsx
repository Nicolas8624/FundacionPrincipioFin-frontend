'use client';

import React from 'react';
import { X, ZoomIn } from 'lucide-react';

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
}

export function ImageLightboxModal({ isOpen, onClose, imageUrl, title }: ImageLightboxModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl max-h-[90vh] flex flex-col items-center bg-[#131317] border border-[#D4AF37]/30 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex items-center justify-between px-6 py-4 border-b border-[#262629] bg-[#1b1b1f]">
          <div className="flex items-center gap-2">
            <ZoomIn className="w-5 h-5 text-[#D4AF37]" />
            <h4 className="text-white font-montserrat text-sm font-semibold truncate">{title}</h4>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#262629] text-[#99907c] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 flex items-center justify-center overflow-auto max-h-[80vh]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={imageUrl} 
            alt={title}
            className="max-h-[75vh] w-auto object-contain rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}
