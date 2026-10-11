'use client';

import React, { useState } from 'react';
import { X, GraduationCap, User, Phone, Mail, FileText, Check } from 'lucide-react';

interface DirectEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  onSuccess: (studentData: {
    fullName: string;
    documentNumber: string;
    phone: string;
    email: string;
    cupoType: string;
  }) => void;
}

export function DirectEnrollmentModal({
  isOpen,
  onClose,
  courseTitle,
  onSuccess
}: DirectEnrollmentModalProps) {
  const [fullName, setFullName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [cupoType, setCupoType] = useState('Beca Inclusión Artesanal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !documentNumber) return;
    setIsSubmitting(true);

    setTimeout(() => {
      onSuccess({
        fullName,
        documentNumber,
        phone,
        email,
        cupoType
      });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-[#131317] border border-[#262629] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#262629] bg-[#1b1b1f]">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="text-white font-montserrat font-semibold text-lg">Inscripción Directa</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#262629] text-[#99907c] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-[#99907c] leading-relaxed">
            Matricula a un estudiante previamente verificado en el curso <strong className="text-white">{courseTitle}</strong> (Cohorte 2026-I).
          </p>

          <div className="space-y-1.5">
            <label className="text-[11px] font-montserrat uppercase tracking-wider text-[#99907c] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#D4AF37]" />
              Nombre Completo *
            </label>
            <input 
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej: Diana Marcela Cifuentes"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#1b1b1f] border border-[#262629] text-white placeholder:text-[#99907c]/50 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-montserrat uppercase tracking-wider text-[#99907c] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
                Documento de Identidad *
              </label>
              <input 
                type="text"
                required
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="CC 1.020.345.678"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#1b1b1f] border border-[#262629] text-white placeholder:text-[#99907c]/50 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-montserrat uppercase tracking-wider text-[#99907c] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                Teléfono / WhatsApp
              </label>
              <input 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+57 300 000 0000"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#1b1b1f] border border-[#262629] text-white placeholder:text-[#99907c]/50 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-montserrat uppercase tracking-wider text-[#99907c] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
              Correo Electrónico
            </label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="estudiante@ejemplo.org"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#1b1b1f] border border-[#262629] text-white placeholder:text-[#99907c]/50 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-montserrat uppercase tracking-wider text-[#99907c]">
              Tipo de Cupo / Financiación
            </label>
            <select
              value={cupoType}
              onChange={(e) => setCupoType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#1b1b1f] border border-[#262629] text-white text-sm focus:outline-none focus:border-[#D4AF37] cursor-pointer"
            >
              <option value="Beca Inclusión Artesanal">Beca Inclusión Artesanal</option>
              <option value="Convenio PH">Convenio PH (Propiedad Horizontal)</option>
              <option value="Cupo Regular">Cupo Regular</option>
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#262629]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg bg-[#1b1b1f] hover:bg-[#262629] text-[#e4e1e7] text-xs font-montserrat uppercase tracking-wider transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#f2ca50] text-[#0A0A0E] text-xs font-montserrat uppercase tracking-wider font-semibold shadow-md shadow-[#D4AF37]/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'Registrando...' : 'Confirmar Matrícula'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
