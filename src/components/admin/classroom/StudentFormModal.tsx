'use client';

import React from 'react';
import { X, User, Phone, MapPin, CheckCircle, Clock } from 'lucide-react';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: {
    name: string;
    phone: string;
    location: string;
    modality: string;
    motivation: string;
    document?: string;
    email?: string;
    economicProfile?: string;
  } | null;
  onAdmit?: (name: string) => void;
  onReject?: (name: string) => void;
}

export function StudentFormModal({
  isOpen,
  onClose,
  applicant,
  onAdmit,
  onReject
}: StudentFormModalProps) {
  if (!isOpen || !applicant) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[85vh] bg-[#131317] border border-[#262629] rounded-2xl overflow-hidden shadow-2xl flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262629] bg-[#1b1b1f] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-montserrat font-bold flex items-center justify-center text-sm">
              {applicant.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <h3 className="text-white font-montserrat font-semibold text-base">{applicant.name}</h3>
              <p className="text-[11px] text-[#99907c] uppercase tracking-wider font-montserrat">Expediente de Postulación</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#262629] text-[#99907c] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-sm text-[#e4e1e7] flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-[#1b1b1f] rounded-xl border border-[#262629]">
              <span className="text-[10px] text-[#99907c] uppercase font-montserrat block">Modalidad Solicitada</span>
              <span className="text-[#D4AF37] font-semibold text-xs mt-1 inline-block">{applicant.modality}</span>
            </div>
            <div className="p-3 bg-[#1b1b1f] rounded-xl border border-[#262629]">
              <span className="text-[10px] text-[#99907c] uppercase font-montserrat block">Ubicación / Sector</span>
              <span className="text-white font-medium text-xs mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#99907c]" />
                {applicant.location}
              </span>
            </div>
            <div className="p-3 bg-[#1b1b1f] rounded-xl border border-[#262629]">
              <span className="text-[10px] text-[#99907c] uppercase font-montserrat block">Teléfono / WhatsApp</span>
              <span className="text-white font-medium text-xs mt-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#99907c]" />
                {applicant.phone}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-[#99907c] uppercase font-montserrat tracking-wider font-semibold">
              Motivación y Perfil Vocacional
            </label>
            <div className="p-4 rounded-xl bg-[#1b1b1f] border border-[#262629] text-[#e4e1e7] italic leading-relaxed">
              &quot;{applicant.motivation}&quot;
            </div>
          </div>

          <div className="space-y-3 p-4 rounded-xl bg-[#1b1b1f]/60 border border-[#262629]">
            <h4 className="text-xs font-montserrat font-semibold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              Datos Complementarios de Inscripción
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#99907c] block">Documento:</span>
                <span className="text-white font-medium">{applicant.document || 'CC 1.020.941.229'}</span>
              </div>
              <div>
                <span className="text-[#99907c] block">Correo:</span>
                <span className="text-white font-medium">{applicant.email || 'postulante@comunidad.org'}</span>
              </div>
              <div>
                <span className="text-[#99907c] block">Prioridad de Beca:</span>
                <span className="text-emerald-400 font-semibold">Alta (Madre comunitaria / Jóvenes de barrio)</span>
              </div>
              <div>
                <span className="text-[#99907c] block">Disponibilidad de Horario:</span>
                <span className="text-white">Completa para jornadas prácticas</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#262629] bg-[#1b1b1f] flex items-center justify-between flex-shrink-0">
          <span className="text-xs text-[#99907c] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Estado: En espera de cupo
          </span>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                onReject?.(applicant.name);
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-[#262629] hover:bg-[#353439] text-[#e4e1e7] text-xs font-montserrat uppercase tracking-wider transition-colors"
            >
              Rechazar / Reasignar
            </button>
            <button
              onClick={() => {
                onAdmit?.(applicant.name);
                onClose();
              }}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#f2ca50] text-[#0A0A0E] font-montserrat font-semibold text-xs uppercase tracking-wider hover:brightness-110 transition-all flex items-center gap-1.5 shadow-md shadow-[#D4AF37]/20"
            >
              <CheckCircle className="w-4 h-4" />
              Admitir en el Curso
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
