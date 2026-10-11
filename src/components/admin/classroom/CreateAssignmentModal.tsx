'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, Upload, FileCheck, BookOpen, Sliders, CheckCircle2 } from 'lucide-react';

interface RubricCriterion {
  id: string;
  number: number;
  title: string;
  weight: number;
  description: string;
}

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  onAssignmentCreated: (assignment: {
    title: string;
    moduleId: string;
    publishDate: string;
    dueDate: string;
    weight: number;
    description: string;
    fileName?: string;
    criteria: RubricCriterion[];
    isDraft?: boolean;
  }) => void;
}

export function CreateAssignmentModal({
  isOpen,
  onClose,
  courseTitle,
  onAssignmentCreated
}: CreateAssignmentModalProps) {
  const [title, setTitle] = useState('Proyecto 3: Quema y Técnicas Ancestrales de Acabado');
  const [moduleId, setModuleId] = useState('mod3');
  const [publishDate, setPublishDate] = useState('2026-03-16T09:00');
  const [dueDate, setDueDate] = useState('2026-03-23T23:59');
  const [weight, setWeight] = useState(25);
  const [description, setDescription] = useState(
    'El estudiante debe modelar y dar acabado a una vasija ceremonial aplicando bruñido y esmaltado por inmersión. Registrar curvas térmicas y memoria cultural.'
  );
  const [uploadedFile, setUploadedFile] = useState<string | null>('guia_tecnica_quema.pdf (2.4 MB)');
  const [criteria, setCriteria] = useState<RubricCriterion[]>([
    {
      id: 'crit-1',
      number: 1,
      title: 'Técnica de Modelado',
      weight: 35,
      description: 'Consistencia de grosor, simetría y estabilidad de base de la pieza.'
    },
    {
      id: 'crit-2',
      number: 2,
      title: 'Acabado y Vidriado',
      weight: 35,
      description: 'Esmaltado homogéneo sin burbujas, cuarteaduras ni defectos térmicos.'
    },
    {
      id: 'crit-3',
      number: 3,
      title: 'Creatividad & Relato',
      weight: 30,
      description: 'Aporte identitario, narrativa comunitaria e innovación en el oficio.'
    }
  ]);

  if (!isOpen) return null;

  const totalCriteriaWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

  const handleAddCriterion = () => {
    const nextNum = criteria.length + 1;
    setCriteria([
      ...criteria,
      {
        id: `crit-${Date.now()}`,
        number: nextNum,
        title: `Nuevo Criterio ${nextNum}`,
        weight: 10,
        description: 'Criterio pedagógico y técnico para evaluación del oficio.'
      }
    ]);
  };

  const handleRemoveCriterion = (id: string) => {
    if (criteria.length <= 1) return;
    const filtered = criteria.filter((c) => c.id !== id);
    setCriteria(filtered.map((c, i) => ({ ...c, number: i + 1 })));
  };

  const handleUpdateCriterion = (id: string, updates: Partial<RubricCriterion>) => {
    setCriteria(criteria.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const handleSubmit = (isDraft = false) => {
    onAssignmentCreated({
      title,
      moduleId,
      publishDate,
      dueDate,
      weight,
      description,
      fileName: uploadedFile || undefined,
      criteria,
      isDraft
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl bg-[#131317] border border-[#D4AF37]/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 bg-[#1b1b1f] border-b border-[#262629] flex items-start justify-between relative">
          <div className="space-y-2 pr-6">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-[10px] font-montserrat bg-[#D4AF37]/20 text-[#D4AF37] uppercase font-semibold tracking-wider">
                AULA VIRTUAL & TALLER
              </span>
              <span className="text-[#99907c] text-xs">•</span>
              <span className="text-[10px] font-montserrat text-[#ffe082] uppercase tracking-wider font-semibold">
                COHORTE 2026-I • {courseTitle}
              </span>
            </div>
            <h2 className="font-montserrat text-2xl sm:text-[28px] font-semibold text-white tracking-wide flex items-center gap-3">
              <BookOpen className="w-7 h-7 text-[#D4AF37]" />
              Crear Nueva Asignación o Tarea
            </h2>
            <p className="text-xs sm:text-sm text-[#99907c] leading-relaxed">
              Define los objetivos prácticos del proyecto, plazos de entrega y la ponderación evaluativa del curso.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-[#262629] hover:bg-[#353439] text-[#99907c] hover:text-white flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-8 space-y-8 text-[#e4e1e7] overflow-y-auto max-h-[calc(90vh-160px)]">
          {/* Section 1: General Info */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[#262629]">
              <FileCheck className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="font-montserrat text-sm uppercase tracking-wider text-white font-semibold">
                1. DATOS GENERALES DE LA ASIGNACIÓN
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              <div className="md:col-span-8 space-y-1.5">
                <label className="text-[11px] font-montserrat uppercase tracking-wider text-[#99907c] font-medium">
                  Título de la Asignación *
                </label>
                <input 
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Proyecto 3: Vidriado en Torno y Técnicas Ancestrales"
                  className="w-full px-4 py-3 bg-[#1b1b1f] border border-[#262629] rounded-lg text-white text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              <div className="md:col-span-4 space-y-1.5">
                <label className="text-[11px] font-montserrat uppercase tracking-wider text-[#99907c] font-medium">
                  Módulo / Etapa *
                </label>
                <select 
                  value={moduleId}
                  onChange={(e) => setModuleId(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1b1b1f] border border-[#262629] rounded-lg text-white text-sm focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                >
                  <option value="mod1">Módulo 1: Arcilla y Modelado</option>
                  <option value="mod2">Módulo 2: Técnicas de Esmaltado</option>
                  <option value="mod3">Módulo 3: Quema y Acabados</option>
                  <option value="grado">Proyecto de Certificación Final</option>
                </select>
              </div>

              <div className="md:col-span-5 space-y-1.5">
                <label className="text-[11px] font-montserrat uppercase tracking-wider text-[#99907c] font-medium">
                  Fecha de Publicación
                </label>
                <input 
                  type="datetime-local"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1b1b1f] border border-[#262629] rounded-lg text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="md:col-span-5 space-y-1.5">
                <label className="text-[11px] font-montserrat uppercase tracking-wider text-[#99907c] font-medium">
                  Fecha Límite de Entrega
                </label>
                <input 
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1b1b1f] border border-[#262629] rounded-lg text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[11px] font-montserrat uppercase tracking-wider text-[#99907c] font-medium">
                  Ponderación
                </label>
                <div className="relative">
                  <input 
                    type="number"
                    min="1"
                    max="100"
                    value={weight}
                    onChange={(e) => setWeight(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-3 bg-[#1b1b1f] border border-[#262629] rounded-lg text-[#D4AF37] font-montserrat text-lg font-bold text-center focus:outline-none focus:border-[#D4AF37]"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-montserrat text-sm font-bold text-[#99907c]">%</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Technical Instructions */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[#262629]">
              <BookOpen className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="font-montserrat text-sm uppercase tracking-wider text-white font-semibold">
                2. INSTRUCCIONES Y GUÍA TÉCNICA
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
              <div className="md:col-span-7 space-y-1.5">
                <label className="text-[11px] font-montserrat uppercase tracking-wider text-[#99907c] font-medium">
                  Consigna y Descripción Técnica *
                </label>
                <textarea 
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe en detalle el objetivo formativo, las técnicas a implementar y los resultados esperados..."
                  className="w-full p-4 bg-[#1b1b1f] border border-[#262629] rounded-lg text-white text-sm leading-relaxed placeholder:text-[#99907c]/40 focus:outline-none focus:border-[#D4AF37] resize-none h-32"
                />
              </div>

              <div className="md:col-span-5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-montserrat uppercase tracking-wider text-[#99907c] font-medium">
                    Material de Apoyo / Guía Adjunta
                  </label>
                  <span className="text-[10px] text-[#99907c]">PDF, DOCX, JPG</span>
                </div>
                
                <label className="p-4 h-32 rounded-xl border border-dashed border-[#4d4635] hover:border-[#D4AF37] bg-[#1b1b1f]/60 transition-all flex items-center justify-center gap-3.5 group cursor-pointer block">
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setUploadedFile(`${e.target.files[0].name} (${(e.target.files[0].size / 1024 / 1024).toFixed(1)} MB)`);
                      }
                    }} 
                  />
                  <div className="w-11 h-11 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-white font-medium">
                      <span className="text-[#D4AF37] font-semibold underline">Examinar guías</span> o arrastrar archivo
                    </p>
                    <p className="text-xs text-[#99907c] mt-0.5">
                      {uploadedFile || 'Ningún archivo seleccionado'}
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </section>

          {/* Section 3: Rubric */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#262629]">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-montserrat text-sm uppercase tracking-wider text-white font-semibold">
                  3. RÚBRICA Y CRITERIOS DE EVALUACIÓN
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={handleAddCriterion}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/30 text-[#D4AF37] font-montserrat text-xs uppercase tracking-wider font-semibold transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Añadir Criterio
                </button>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-montserrat font-semibold ${
                  totalCriteriaWeight === 100 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  <CheckCircle2 className="w-4 h-4" />
                  Total Rúbrica: {totalCriteriaWeight}% Ponderado {totalCriteriaWeight === 100 ? '✓' : '(Debe sumar 100%)'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {criteria.map((crit) => (
                <div 
                  key={crit.id}
                  className="p-4 rounded-xl bg-[#1b1b1f] border border-[#262629] flex flex-col justify-between space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-[#D4AF37] text-[#0A0A0E] font-montserrat text-xs font-bold flex items-center justify-center">
                        {crit.number}
                      </span>
                      <input 
                        type="text"
                        value={crit.title}
                        onChange={(e) => handleUpdateCriterion(crit.id, { title: e.target.value })}
                        className="font-montserrat font-semibold text-white bg-transparent border-b border-transparent focus:border-[#D4AF37] text-sm focus:outline-none max-w-[140px]"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="px-2 py-0.5 rounded bg-[#262629] text-[#D4AF37] font-montserrat text-xs font-bold">
                        {crit.weight}%
                      </span>
                      {criteria.length > 1 && (
                        <button 
                          type="button"
                          onClick={() => handleRemoveCriterion(crit.id)}
                          className="opacity-0 group-hover:opacity-100 text-[#99907c] hover:text-rose-400 p-1 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <textarea 
                    rows={2}
                    value={crit.description}
                    onChange={(e) => handleUpdateCriterion(crit.id, { description: e.target.value })}
                    className="text-xs text-[#99907c] bg-transparent border border-transparent focus:border-[#262629] rounded p-1 resize-none leading-relaxed focus:outline-none"
                  />

                  <div className="pt-1">
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={crit.weight}
                      onChange={(e) => handleUpdateCriterion(crit.id, { weight: parseInt(e.target.value) || 0 })}
                      className="w-full accent-[#D4AF37] h-1.5 bg-[#262629] rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-[#99907c] mt-1">
                      <span>Escala: 1.0 - 5.0</span>
                      <span>Pondera {crit.weight}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 bg-[#0e0e12] border-t border-[#262629] flex flex-wrap items-center justify-between gap-4">
          <button 
            type="button"
            onClick={() => handleSubmit(true)}
            className="px-4 py-2.5 rounded-lg bg-[#1b1b1f] hover:bg-[#262629] text-[#99907c] hover:text-white font-montserrat text-xs uppercase tracking-wider font-semibold transition-colors flex items-center gap-2"
          >
            Guardar como borrador
          </button>

          <div className="flex items-center gap-3.5">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-[#99907c] hover:text-white font-montserrat text-xs uppercase tracking-wider transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="button"
              onClick={() => handleSubmit(false)}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#f2ca50] hover:brightness-110 active:scale-[0.98] text-[#0A0A0E] font-montserrat text-xs tracking-wider uppercase font-bold shadow-lg shadow-[#D4AF37]/20 flex items-center gap-2 transition-all"
            >
              <span>Publicar Asignación para el Curso</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
