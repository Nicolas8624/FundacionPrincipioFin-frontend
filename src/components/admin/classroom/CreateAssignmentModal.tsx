'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Upload, FileCheck, BookOpen, Sliders, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { upsertAssignmentAction } from '@/app/(admin)/admin/cursos/[id]/actions';
import type { ClassroomAssignment, RubricCriterion } from './types';

const DEFAULT_CRITERIA: RubricCriterion[] = [
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
];

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  modules?: { id: string; title: string }[];
  assignmentToEdit?: ClassroomAssignment | null;
  defaultModuleId?: string;
  onAssignmentCreated?: (assignment: {
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
  onAssignmentUpdated?: (assignment: {
    id: string;
    title: string;
    moduleId: string;
    dueDate: string;
    weight: number;
  }) => void;
}

export function CreateAssignmentModal({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  modules = [],
  assignmentToEdit = null,
  defaultModuleId,
  onAssignmentCreated,
  onAssignmentUpdated
}: CreateAssignmentModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [publishDate, setPublishDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [dueDate, setDueDate] = useState('');
  const [weight, setWeight] = useState(25);
  const [description, setDescription] = useState('');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [criteria, setCriteria] = useState<RubricCriterion[]>(DEFAULT_CRITERIA);

  // Sync state when opening or when assignmentToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (assignmentToEdit) {
        setTitle(assignmentToEdit.title || '');
        setModuleId(assignmentToEdit.module_id || defaultModuleId || (modules[0]?.id || ''));
        setPublishDate(
          assignmentToEdit.publish_at
            ? assignmentToEdit.publish_at.slice(0, 16)
            : new Date().toISOString().slice(0, 16)
        );
        setDueDate(assignmentToEdit.due_at ? assignmentToEdit.due_at.slice(0, 16) : '');
        setWeight(assignmentToEdit.weight_percent ?? 25);
        setDescription(assignmentToEdit.instructions || '');
        setUploadedFile(assignmentToEdit.attachment_url || null);
        if (
          Array.isArray(assignmentToEdit.rubric_criteria) &&
          assignmentToEdit.rubric_criteria.length > 0
        ) {
          setCriteria(assignmentToEdit.rubric_criteria);
        } else {
          setCriteria(DEFAULT_CRITERIA);
        }
      } else {
        setTitle('');
        setModuleId(defaultModuleId || modules[0]?.id || '');
        setPublishDate(new Date().toISOString().slice(0, 16));
        setDueDate('');
        setWeight(25);
        setDescription('');
        setUploadedFile(null);
        setCriteria(DEFAULT_CRITERIA);
      }
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, assignmentToEdit, modules, defaultModuleId]);

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

  const handleSubmit = async (isDraft = false) => {
    if (!title.trim()) {
      setError('Por favor ingresa un título para la asignación.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const validModuleId = moduleId && moduleId.length > 10 ? moduleId : null;

      const res = await upsertAssignmentAction({
        id: assignmentToEdit?.id,
        courseId,
        moduleId: validModuleId,
        title: title.trim(),
        instructions: description.trim() || null,
        weightPercent: Number(weight) || null,
        dueAt: dueDate ? new Date(dueDate).toISOString() : null,
        publishAt: publishDate ? new Date(publishDate).toISOString() : null,
        rubricCriteria: criteria,
        attachmentUrl: uploadedFile || null,
        isPublished: !isDraft
      });

      if (!res.success) {
        setError(res.error || 'Error al guardar la asignación');
        return;
      }

      if (assignmentToEdit) {
        onAssignmentUpdated?.({
          id: assignmentToEdit.id,
          title,
          moduleId,
          dueDate,
          weight
        });
      } else {
        onAssignmentCreated?.({
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
      }

      router.refresh();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Error al procesar la asignación');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl max-h-[90vh] bg-[#131317] border border-[#D4AF37]/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-8 py-4 sm:py-5 bg-[#1b1b1f] border-b border-[#262629] flex items-start justify-between relative flex-shrink-0">
          <div className="space-y-1.5 pr-4 sm:pr-6">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="px-2.5 sm:px-3 py-1 rounded-full text-[10px] font-montserrat bg-[#D4AF37]/20 text-[#D4AF37] uppercase font-semibold tracking-wider">
                AULA VIRTUAL & TALLER
              </span>
              <span className="text-[#99907c] text-xs">•</span>
              <span className="text-[10px] font-montserrat text-[#ffe082] uppercase tracking-wider font-semibold truncate max-w-[200px] sm:max-w-none">
                {courseTitle}
              </span>
            </div>
            <h2 className="font-montserrat text-lg sm:text-2xl font-semibold text-white tracking-wide flex items-center gap-2.5 sm:gap-3">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4AF37] shrink-0" />
              <span>{assignmentToEdit ? 'Editar Asignación o Tarea' : 'Crear Nueva Asignación o Tarea'}</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#99907c] leading-relaxed">
              {assignmentToEdit
                ? 'Modifica los objetivos técnicos, fecha límite de entrega, ponderación o criterios de evaluación.'
                : 'Define los objetivos prácticos del proyecto, plazos de entrega y la ponderación evaluativa del curso.'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#262629] hover:bg-[#353439] text-[#99907c] hover:text-white flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mx-4 sm:mx-8 mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 text-[#e4e1e7] overflow-y-auto flex-1 min-h-0">
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
                  placeholder="Ej. Proyecto 1: Modelado inicial y técnicas de taller"
                  className="w-full px-4 py-3 bg-[#1b1b1f] border border-[#262629] rounded-lg text-white text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              <div className="md:col-span-4 space-y-1.5">
                <label className="text-[11px] font-montserrat uppercase tracking-wider text-[#99907c] font-medium">
                  Módulo / Etapa
                </label>
                <select 
                  value={moduleId}
                  onChange={(e) => setModuleId(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1b1b1f] border border-[#262629] rounded-lg text-white text-sm focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                >
                  <option value="" className="bg-[#1b1b1f]">
                    Sin módulo específico (General)
                  </option>
                  {modules.map((m) => (
                    <option key={m.id} value={m.id} className="bg-[#1b1b1f]">
                      {m.title}
                    </option>
                  ))}
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
        <div className="px-4 sm:px-8 py-4 bg-[#0e0e12] border-t border-[#262629] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 flex-shrink-0">
          <button 
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#1b1b1f] hover:bg-[#262629] text-[#99907c] hover:text-white font-montserrat text-xs uppercase tracking-wider font-semibold transition-colors flex items-center justify-center gap-2"
          >
            Guardar como borrador
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3.5">
            <button 
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-[#99907c] hover:text-white font-montserrat text-xs uppercase tracking-wider transition-colors text-center"
            >
              Cancelar
            </button>
            <button 
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(false)}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#f2ca50] hover:brightness-110 active:scale-[0.98] text-[#0A0A0E] font-montserrat text-xs tracking-wider uppercase font-bold shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2 transition-all"
            >
              <span>
                {isSubmitting
                  ? 'Guardando...'
                  : assignmentToEdit
                  ? 'Guardar Cambios de la Asignación'
                  : 'Publicar Asignación para el Curso'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
