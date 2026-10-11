'use client';

import React from 'react';
import { X, FileText, AlertTriangle, Printer } from 'lucide-react';

interface WithdrawalActModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  documentNumber: string;
  courseTitle: string;
  date: string;
  reason: string;
  attendancePercentage?: string;
  frozenScore?: string;
}

export function WithdrawalActModal({
  isOpen,
  onClose,
  studentName,
  documentNumber,
  courseTitle,
  date,
  reason,
  attendancePercentage = '45%',
  frozenScore = '2.8 / 5.0'
}: WithdrawalActModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-[#131317] border border-rose-500/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262629] bg-[#1b1b1f]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-montserrat font-semibold text-base">Acta Institucional de Retiro Formativo</h3>
              <p className="text-[11px] text-[#99907c] uppercase tracking-wider font-montserrat">Archivo Académico Histórico</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#262629] text-[#99907c] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6 text-[#e4e1e7] text-sm leading-relaxed">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-montserrat font-semibold text-rose-300 text-xs uppercase tracking-wider">Estado: Matrícula Cancelada / Congelada</p>
              <p className="text-xs text-[#d0c5af] mt-0.5">El participante fue dado de baja. Su cupo ha sido liberado para la lista de espera comunitaria y sus avances parciales se encuentran en custodia.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-[#1b1b1f] p-4 rounded-xl border border-[#262629]">
            <div>
              <p className="text-[10px] text-[#99907c] uppercase font-montserrat tracking-wider">Estudiante</p>
              <p className="font-semibold text-white mt-0.5">{studentName}</p>
              <p className="text-xs text-[#99907c]">{documentNumber}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#99907c] uppercase font-montserrat tracking-wider">Programa / Cohorte</p>
              <p className="font-semibold text-white mt-0.5">{courseTitle}</p>
              <p className="text-xs text-[#99907c]">Cohorte 2026-I</p>
            </div>
            <div>
              <p className="text-[10px] text-[#99907c] uppercase font-montserrat tracking-wider">Fecha Efectiva de Baja</p>
              <p className="font-semibold text-white mt-0.5">{date}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#99907c] uppercase font-montserrat tracking-wider">Calificación al Retiro</p>
              <p className="font-semibold text-amber-400 mt-0.5">{frozenScore}</p>
              <p className="text-[11px] text-[#99907c]">Asistencia: {attendancePercentage}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[11px] text-[#99907c] uppercase font-montserrat tracking-wider">Causal Oficial del Retiro</p>
            <div className="p-3.5 rounded-lg bg-[#1b1b1f] border border-[#262629] text-rose-300 text-sm italic font-medium">
              &quot;{reason}&quot;
            </div>
          </div>

          <p className="text-xs text-[#99907c]">
            Resolución: De acuerdo al reglamento institucional, el estudiante podrá solicitar reingreso o convalidación de horas prácticas en convocatorias subsiguientes previa solicitud por comité de admisiones.
          </p>
        </div>

        <div className="px-6 py-4 border-t border-[#262629] bg-[#1b1b1f] flex items-center justify-between">
          <span className="text-[11px] text-[#99907c]">Folio Digital: ACT-RET-{Math.floor(Math.random() * 90000 + 10000)}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-lg bg-[#262629] text-[#e4e1e7] hover:bg-[#353439] transition-colors text-xs font-montserrat uppercase tracking-wider flex items-center gap-2"
            >
              <Printer className="w-4 h-4 text-[#D4AF37]" />
              Descargar Acta
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-[#262629] text-white font-montserrat font-semibold text-xs uppercase tracking-wider hover:bg-[#353439] transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
