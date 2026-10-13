'use client';

import React from 'react';
import { X, Award, Printer, CheckCircle, ShieldCheck } from 'lucide-react';

interface DiplomaPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  documentNumber: string;
  courseTitle: string;
  instructorName?: string | null;
  averageGrade: string;
  completionDate?: string;
  code?: string;
}

export function DiplomaPreviewModal({
  isOpen,
  onClose,
  studentName,
  documentNumber,
  courseTitle,
  instructorName,
  averageGrade,
  completionDate,
  code = 'FPF-CERT'
}: DiplomaPreviewModalProps) {
  const displayDate = completionDate || new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl max-h-[88vh] bg-[#131317] border border-[#D4AF37]/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262629] bg-[#1b1b1f] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-montserrat font-semibold text-base">Acreditación Oficial de Oficios</h3>
              <p className="text-[11px] text-[#99907c] uppercase tracking-wider font-montserrat">Fundación Principio & Fin</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#262629] text-[#99907c] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Certificate Card Body */}
        <div className="p-8 sm:p-12 bg-gradient-to-b from-[#1b1b1f] via-[#131317] to-[#0A0A0E] text-center relative overflow-y-auto flex-1 min-h-0">
          {/* Decorative Borders */}
          <div className="absolute inset-4 border border-[#D4AF37]/30 rounded-xl pointer-events-none"></div>
          <div className="absolute inset-5 border border-[#D4AF37]/10 rounded-lg pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[11px] font-montserrat tracking-widest uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              Certificado Institucional Validador
            </div>

            <div className="space-y-1">
              <p className="text-[#99907c] text-xs font-montserrat uppercase tracking-[0.25em]">La Fundación Principio & Fin certifica que:</p>
              <h2 className="text-2xl sm:text-3xl font-bold font-montserrat text-white tracking-wide">{studentName}</h2>
              <p className="text-[#99907c] text-xs">C.C. {documentNumber}</p>
            </div>

            <p className="text-[#d0c5af] text-sm max-w-xl mx-auto leading-relaxed">
              Ha culminado y aprobado satisfactoriamente todos los módulos prácticos, talleres y requerimientos evaluativos del programa formativo en:
            </p>

            <div className="py-2">
              <div className="inline-block px-6 py-2.5 rounded-xl bg-[#262629]/70 border border-[#D4AF37]/40 shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                <span className="text-[#D4AF37] font-montserrat font-bold text-lg uppercase tracking-wider">{courseTitle}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-2 text-left bg-[#1b1b1f]/60 p-4 rounded-xl border border-[#262629]">
              <div>
                <p className="text-[10px] text-[#99907c] uppercase font-montserrat">Calificación Final</p>
                <p className="text-white font-bold font-montserrat text-sm mt-0.5">{averageGrade} / 5.0</p>
              </div>
              <div>
                <p className="text-[10px] text-[#99907c] uppercase font-montserrat">Fecha Emisión</p>
                <p className="text-white font-medium text-xs mt-0.5">{displayDate}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#99907c] uppercase font-montserrat">Folio Digital</p>
                <p className="text-[#D4AF37] font-mono text-[11px] mt-0.5 truncate">{code}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-[#262629] flex items-end justify-around">
              <div className="text-center space-y-1">
                <div className="w-32 h-0.5 bg-[#99907c]/40 mx-auto"></div>
                <p className="text-white text-xs font-montserrat font-medium">{instructorName || 'Docente Formador(a)'}</p>
                <p className="text-[10px] text-[#99907c]">Docente Formador(a)</p>
              </div>
              <div className="w-14 h-14 rounded-full border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] bg-[#D4AF37]/5 shadow-inner">
                <Award className="w-7 h-7" />
              </div>
              <div className="text-center space-y-1">
                <div className="w-32 h-0.5 bg-[#99907c]/40 mx-auto"></div>
                <p className="text-white text-xs font-montserrat font-medium">Dirección Académica</p>
                <p className="text-[10px] text-[#99907c]">Fundación Principio & Fin</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#262629] bg-[#1b1b1f] flex items-center justify-between flex-shrink-0">
          <span className="text-[11px] text-[#99907c] flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            Certificado con validez oficial para inserción laboral y convenios PH
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-lg bg-[#262629] text-[#e4e1e7] hover:bg-[#353439] transition-colors text-xs font-montserrat uppercase tracking-wider flex items-center gap-2"
            >
              <Printer className="w-4 h-4 text-[#D4AF37]" />
              Imprimir / PDF
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-[#D4AF37] text-[#0A0A0E] font-montserrat font-semibold text-xs uppercase tracking-wider hover:bg-[#f2ca50] transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
