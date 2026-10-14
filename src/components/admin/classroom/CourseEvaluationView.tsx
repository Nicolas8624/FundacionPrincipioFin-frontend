'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/services/supabase/client';
import { 
  FolderCheck, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Download, 
  PlusCircle, 
  Search, 
  RotateCcw, 
  ZoomIn, 
  MessageSquare, 
  Send, 
  RotateCw, 
  Award, 
  Bell, 
  ShieldCheck, 
  Layers, 
  Calendar, 
  Sparkles, 
  Check, 
  AlertCircle,
  FileText,
  Sliders,
  FolderPlus,
  BookOpen,
  FileSpreadsheet,
  ClipboardList
} from 'lucide-react';
import { CreateAssignmentModal } from './CreateAssignmentModal';
import { ImageLightboxModal } from './ImageLightboxModal';
import { FormModal } from './FormModal';
import type {
  ClassroomCourse,
  ClassroomModule,
  ClassroomAssignment,
  ClassroomSubmission,
  RubricCriterion
} from './types';
import {
  getInitials,
  formatDate,
  formatModality,
  downloadCSV,
  slugify
} from './types';

const DEFAULT_RUBRIC_CRITERIA: RubricCriterion[] = [
  {
    id: 'crit-1',
    number: 1,
    title: 'Técnica y Modelado',
    weight: 35,
    description: 'Consistencia de técnica, simetría, grosor y estabilidad estructural.'
  },
  {
    id: 'crit-2',
    number: 2,
    title: 'Calidad y Acabado',
    weight: 35,
    description: 'Tratamiento homogéneo de superficies, vidriado y pulido de detalles.'
  },
  {
    id: 'crit-3',
    number: 3,
    title: 'Creatividad y Narrativa',
    weight: 30,
    description: 'Aporte simbólico, propuesta identitaria y relato comunitario.'
  }
];

export interface CourseEvaluationViewProps {
  course: ClassroomCourse;
  modules: ClassroomModule[];
  assignments: ClassroomAssignment[];
  submissions: ClassroomSubmission[];
  totalEnrolledCount?: number;
  onSwitchToStudentsTab?: () => void;
  onSwitchToActivitiesTab?: () => void;
}

export function CourseEvaluationView({
  course,
  modules = [],
  assignments = [],
  submissions: initialSubmissions = [],
  totalEnrolledCount = 0,
  onSwitchToStudentsTab,
  onSwitchToActivitiesTab
}: CourseEvaluationViewProps) {
  const router = useRouter();

  // Local state for submissions to support optimistic updates
  const [submissionsList, setSubmissionsList] = useState<ClassroomSubmission[]>(initialSubmissions);

  useEffect(() => {
    setSubmissionsList(initialSubmissions);
  }, [initialSubmissions]);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateModuleModalOpen, setIsCreateModuleModalOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Mappings
  const assignmentsMap = useMemo(() => {
    const map = new Map<string, ClassroomAssignment>();
    assignments.forEach((a) => map.set(a.id, a));
    return map;
  }, [assignments]);

  const modulesMap = useMemo(() => {
    const map = new Map<string, ClassroomModule>();
    modules.forEach((m) => map.set(m.id, m));
    return map;
  }, [modules]);

  // Filter states
  const [activeModuleTab, setActiveModuleTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pendiente' | 'aprobado' | 'correccion'>('todos');

  // Filtered Submissions
  const filteredSubmissions = useMemo(() => {
    return submissionsList.filter((s) => {
      const assignment = assignmentsMap.get(s.assignment_id);
      const moduleId = assignment?.module_id;

      // Module match
      if (activeModuleTab !== 'all') {
        if (moduleId !== activeModuleTab) return false;
      }

      // Search match (name, document, project)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const nameMatch = s.student_name?.toLowerCase().includes(query);
        const docMatch = s.student_document?.toLowerCase().includes(query);
        const projMatch = (s.project_title || assignment?.title || '')
          .toLowerCase()
          .includes(query);
        if (!nameMatch && !docMatch && !projMatch) return false;
      }

      // Status match
      if (statusFilter === 'pendiente') {
        if (s.status !== 'entregada') return false;
      } else if (statusFilter === 'aprobado') {
        if (s.status !== 'calificada' || (s.score || 0) < 3.5) return false;
      } else if (statusFilter === 'correccion') {
        if (s.status !== 'devuelta') return false;
      }

      return true;
    });
  }, [submissionsList, assignmentsMap, activeModuleTab, searchTerm, statusFilter]);

  // Active target student for Grading Studio
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(() => {
    return filteredSubmissions[0]?.id || submissionsList[0]?.id || null;
  });

  useEffect(() => {
    if (filteredSubmissions.length > 0) {
      if (!filteredSubmissions.some((s) => s.id === activeSubmissionId)) {
        setActiveSubmissionId(filteredSubmissions[0].id);
      }
    } else if (submissionsList.length > 0) {
      if (!submissionsList.some((s) => s.id === activeSubmissionId)) {
        setActiveSubmissionId(submissionsList[0].id);
      }
    } else {
      setActiveSubmissionId(null);
    }
  }, [filteredSubmissions, submissionsList, activeSubmissionId]);

  const activeSubmission = useMemo(() => {
    if (!activeSubmissionId) return null;
    return submissionsList.find((s) => s.id === activeSubmissionId) || null;
  }, [submissionsList, activeSubmissionId]);

  const activeAssignment = useMemo(() => {
    if (!activeSubmission) return null;
    return assignmentsMap.get(activeSubmission.assignment_id) || null;
  }, [activeSubmission, assignmentsMap]);

  // Dynamic criteria for active assignment
  const activeCriteria = useMemo<RubricCriterion[]>(() => {
    if (activeAssignment?.rubric_criteria && Array.isArray(activeAssignment.rubric_criteria) && activeAssignment.rubric_criteria.length > 0) {
      return activeAssignment.rubric_criteria;
    }
    return DEFAULT_RUBRIC_CRITERIA;
  }, [activeAssignment]);

  // Studio Grading State
  const [criteriaScores, setCriteriaScores] = useState<Record<string, number>>({});
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [manualOverrideScore, setManualOverrideScore] = useState<string>('');

  // Sync grading state when activeSubmission changes
  useEffect(() => {
    if (activeSubmission) {
      const initialScores: Record<string, number> = {};
      const savedScores = activeSubmission.rubric_scores || {};

      activeCriteria.forEach((crit) => {
        initialScores[crit.id] = savedScores[crit.id] !== undefined
          ? Number(savedScores[crit.id])
          : (activeSubmission.score ? Math.min(5, Number(activeSubmission.score)) : 4.5);
      });

      setCriteriaScores(initialScores);
      setFeedbackText(activeSubmission.feedback || '');
      setManualOverrideScore(activeSubmission.score !== null && activeSubmission.score !== undefined ? String(activeSubmission.score) : '');
    } else {
      setCriteriaScores({});
      setFeedbackText('');
      setManualOverrideScore('');
    }
  }, [activeSubmission, activeCriteria]);

  const handleCriterionChange = (criterionId: string, val: number) => {
    setCriteriaScores((prev) => ({
      ...prev,
      [criterionId]: val
    }));
    setManualOverrideScore('');
  };

  // Calculated Score
  const calculatedScore = useMemo(() => {
    if (manualOverrideScore && !isNaN(parseFloat(manualOverrideScore))) {
      return parseFloat(manualOverrideScore).toFixed(1);
    }
    if (activeCriteria.length === 0) return '5.0';

    let weightedSum = 0;
    let totalWeight = 0;
    activeCriteria.forEach((crit) => {
      const score = criteriaScores[crit.id] ?? 4.0;
      const weight = crit.weight > 0 ? crit.weight : (100 / activeCriteria.length);
      weightedSum += score * weight;
      totalWeight += weight;
    });

    if (totalWeight > 0) {
      const result = weightedSum / totalWeight;
      return Math.min(5.0, Math.max(1.0, result)).toFixed(1);
    }
    return '4.5';
  }, [activeCriteria, criteriaScores, manualOverrideScore]);

  // Real Dynamic KPIs
  const totalSubmissionsCount = submissionsList.length;
  const pendingGradingCount = submissionsList.filter((s) => s.status === 'entregada').length;
  const approvedCount = submissionsList.filter((s) => s.status === 'calificada' && (s.score || 0) >= 3.5).length;
  const devueltaCount = submissionsList.filter((s) => s.status === 'devuelta').length;

  const gradedSubmissions = useMemo(() => {
    return submissionsList.filter((s) => s.score !== null && s.score !== undefined);
  }, [submissionsList]);

  const averageScoreFormatted = useMemo(() => {
    if (gradedSubmissions.length === 0) return '—';
    const sum = gradedSubmissions.reduce((acc, s) => acc + (s.score || 0), 0);
    return (sum / gradedSubmissions.length).toFixed(1);
  }, [gradedSubmissions]);

  const approvalRateFormatted = useMemo(() => {
    if (totalSubmissionsCount === 0) return '0%';
    return `${Math.round((approvedCount / totalSubmissionsCount) * 100)}%`;
  }, [totalSubmissionsCount, approvedCount]);

  // Actions
  const handleSaveGrade = async (statusToSet: 'Aprobado' | 'Corrección' | 'Distinción') => {
    if (!activeSubmission) return;

    const finalScore = Math.max(1, Math.min(5, parseFloat(calculatedScore) || 5.0));
    const dbStatus = statusToSet === 'Corrección' ? 'devuelta' : 'calificada';
    const badgeValue = statusToSet === 'Distinción' ? 'Mención de Honor' : null;

    // Optimistic UI update
    setSubmissionsList((prev) =>
      prev.map((s) => {
        if (s.id === activeSubmission.id) {
          return {
            ...s,
            status: dbStatus,
            score: finalScore,
            rubric_scores: criteriaScores,
            feedback: feedbackText,
            badge: badgeValue,
            graded_at: new Date().toISOString()
          };
        }
        return s;
      })
    );

    try {
      const supabase = createBrowserClient();
      const { error } = await supabase
        .from('submissions')
        .update({
          score: finalScore,
          status: dbStatus,
          rubric_scores: criteriaScores,
          feedback: feedbackText,
          badge: badgeValue,
          graded_at: new Date().toISOString()
        })
        .eq('id', activeSubmission.id);

      if (error) {
        console.error('Error al calificar entrega:', error);
        showToast(`Error al guardar en base de datos: ${error.message}`);
        return;
      }

      router.refresh();
      showToast(`Calificación (${finalScore.toFixed(1)}/5.0) guardada para ${activeSubmission.student_name}.`);
    } catch (err: any) {
      console.error('Error inesperado al calificar:', err);
      showToast('Ocurrió un error inesperado al guardar la calificación.');
    }
  };

  const handleExportConsolidado = () => {
    if (submissionsList.length === 0) {
      showToast('No hay calificaciones registradas para exportar en este curso.');
      return;
    }

    const headers = [
      'Estudiante',
      'Documento',
      'Asignación / Proyecto',
      'Estado Entrega',
      'Nota Definitiva',
      'Distinción',
      'Fecha de Entrega',
      'Fecha Calificación',
      'Retroalimentación'
    ];

    const rows = submissionsList.map((s) => {
      const asg = assignmentsMap.get(s.assignment_id);
      return [
        s.student_name,
        s.student_document,
        s.project_title || asg?.title || 'Evidencia de Curso',
        s.status === 'calificada' ? 'Calificada' : s.status === 'devuelta' ? 'Requiere Ajustes' : 'Entregada',
        s.score !== null && s.score !== undefined ? s.score.toFixed(1) : 'Sin calificar',
        s.badge || '—',
        formatDate(s.submitted_at, true),
        formatDate(s.graded_at, true),
        s.feedback || '—'
      ];
    });

    downloadCSV(
      `consolidado_calificaciones_${slugify(course.title)}.csv`,
      headers,
      rows
    );
    showToast('Consolidado de calificaciones descargado exitosamente en CSV.');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1b1b1f] border border-[#D4AF37] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <Check className="w-5 h-5 text-[#D4AF37]" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Context Bar */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-6 border-b border-[#262629]">
        <div className="space-y-3 max-w-4xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
            <span className="text-[11px] font-montserrat uppercase tracking-widest text-[#D4AF37] font-semibold">
              Aula Virtual & Taller • Seguimiento Pedagógico Real
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-montserrat font-bold text-white tracking-tight">
            Evaluación y Evidencias de Curso
          </h1>
          <p className="text-xs sm:text-sm text-[#99907c] max-w-3xl leading-relaxed">
            Supervisa las entregas prácticas, fotografías y asignaciones cargadas por los estudiantes inscritos. Califica mediante la rúbrica comunitaria, retroalimenta de forma pedagógica y consolida el boletín oficial.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1b1b1f] border border-[#262629] text-[#e4e1e7] text-xs font-montserrat uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Modalidad: <strong className="text-white font-semibold">{formatModality(course.modality)}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1b1b1f] border border-[#262629] text-[#e4e1e7] text-xs font-montserrat uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Cohorte: <strong className="text-white font-semibold">{course.cohort || 'Sin cohorte'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1b1b1f] border border-[#262629] text-[#e4e1e7] text-xs font-montserrat uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Docente: <strong className="text-white font-semibold">{course.instructor_name || 'Sin docente asignado'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#ffe082] text-xs font-montserrat uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{totalEnrolledCount} Estudiantes inscritos</span>
            </div>
            {course.schedule_text && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1b1b1f] border border-[#262629] text-[#e4e1e7] text-xs font-montserrat uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Horario: <strong className="text-white font-semibold">{course.schedule_text}</strong></span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4 Bento KPI Metrics Grid (100% Real) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-xl bg-[#131317] border border-[#262629] hover:border-[#D4AF37]/30 transition-all shadow-md flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-montserrat uppercase tracking-widest text-[#99907c]">Total Entregas</span>
            <div className="w-9 h-9 rounded-lg bg-[#1b1b1f] border border-[#262629] flex items-center justify-center text-[#D4AF37]">
              <FolderCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-montserrat font-bold text-white">{totalSubmissionsCount}</span>
            <span className="text-xs text-[#99907c] font-montserrat">
              {assignments.length > 0 ? `${assignments.length} tareas activas` : 'Sin tareas aún'}
            </span>
          </div>
          <div className="w-full bg-[#262629] h-1.5 rounded-full mt-4 overflow-hidden">
            <div 
              className="bg-[#D4AF37] h-full rounded-full transition-all duration-500"
              style={{ width: totalSubmissionsCount > 0 ? '100%' : '0%' }}
            />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-xl bg-[#131317] border border-[#262629] hover:border-amber-400/30 transition-all shadow-md flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-montserrat uppercase tracking-widest text-[#ffe082]">Pendientes de Calificar</span>
            <div className="w-9 h-9 rounded-lg bg-[#262629] flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-montserrat font-bold text-amber-400">{pendingGradingCount}</span>
            <span className="text-xs text-[#99907c] uppercase font-montserrat">
              {pendingGradingCount > 0 ? 'Revisión prioritaria' : 'Al día'}
            </span>
          </div>
          <div className="w-full bg-[#262629] h-1.5 rounded-full mt-4 overflow-hidden">
            <div 
              className="bg-amber-400 h-full rounded-full transition-all duration-500"
              style={{ 
                width: totalSubmissionsCount > 0 
                  ? `${Math.round((pendingGradingCount / totalSubmissionsCount) * 100)}%` 
                  : '0%' 
              }}
            />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-xl bg-[#131317] border border-[#262629] hover:border-emerald-400/30 transition-all shadow-md flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-montserrat uppercase tracking-widest text-[#99907c]">Aprobadas</span>
            <div className="w-9 h-9 rounded-lg bg-[#1b1b1f] border border-[#262629] flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-montserrat font-bold text-white">{approvedCount}</span>
            <span className="text-xs text-emerald-400 uppercase font-semibold font-montserrat">
              {approvalRateFormatted} del total
            </span>
          </div>
          <div className="w-full bg-[#262629] h-1.5 rounded-full mt-4 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ 
                width: totalSubmissionsCount > 0 
                  ? `${Math.round((approvedCount / totalSubmissionsCount) * 100)}%` 
                  : '0%' 
              }}
            />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-xl bg-[#131317] border border-[#262629] hover:border-[#D4AF37]/30 transition-all shadow-md flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-montserrat uppercase tracking-widest text-[#99907c]">Promedio Evaluado</span>
            <div className="w-9 h-9 rounded-lg bg-[#1b1b1f] border border-[#262629] flex items-center justify-center text-[#D4AF37]">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-montserrat font-bold text-white">{averageScoreFormatted}</span>
            <span className="text-xs text-[#99907c] uppercase font-montserrat">
              {gradedSubmissions.length > 0 ? `${gradedSubmissions.length} con nota` : 'Sin notas aún'}
            </span>
          </div>
          <div className="w-full bg-[#262629] h-1.5 rounded-full mt-4 overflow-hidden">
            <div 
              className="bg-[#D4AF37] h-full rounded-full transition-all duration-500"
              style={{ 
                width: averageScoreFormatted !== '—' 
                  ? `${Math.min(100, Math.round((parseFloat(averageScoreFormatted) / 5) * 100))}%` 
                  : '0%' 
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Course Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-xs font-montserrat uppercase tracking-wider text-[#99907c] font-semibold">
            Acciones Pedagógicas del Curso
          </span>
        </div>

        <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-3">
          <button 
            type="button"
            onClick={() => setIsCreateModuleModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#1b1b1f] hover:bg-[#262629] text-white border border-[#262629] hover:border-[#D4AF37]/40 text-xs font-montserrat uppercase tracking-wider transition-all shadow-sm"
          >
            <FolderPlus className="w-4 h-4 text-[#D4AF37]" />
            <span>Crear Módulo</span>
          </button>

          <button 
            type="button"
            onClick={handleExportConsolidado}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#1b1b1f] hover:bg-[#262629] text-white border border-[#262629] hover:border-[#353439] text-xs font-montserrat uppercase tracking-wider transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-[#D4AF37]" />
            <span>Descargar Consolidado (CSV)</span>
          </button>

          {onSwitchToActivitiesTab && (
            <button 
              type="button"
              onClick={onSwitchToActivitiesTab}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#1b1b1f] hover:bg-[#262629] text-white border border-[#262629] hover:border-[#D4AF37]/40 text-xs font-montserrat uppercase tracking-wider transition-all shadow-sm"
              title="Ver currículo completo, editar y eliminar actividades o módulos"
            >
              <ClipboardList className="w-4 h-4 text-[#D4AF37]" />
              <span>Gestionar Actividades ({assignments.length})</span>
            </button>
          )}

          <button 
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#f2ca50] text-[#0A0A0E] text-xs font-montserrat uppercase tracking-wider font-bold shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Crear Asignación / Tarea</span>
          </button>
        </div>
      </div>

      {/* Module Selector Tabs (Real Modules) */}
      <div className="p-2 rounded-xl bg-[#131317] border border-[#262629] flex items-center gap-2 overflow-x-auto custom-scrollbar shadow-sm">
        <button
          type="button"
          onClick={() => setActiveModuleTab('all')}
          className={`px-4 py-2.5 rounded-lg text-xs font-montserrat uppercase tracking-wider font-semibold whitespace-nowrap transition-colors ${
            activeModuleTab === 'all'
              ? 'bg-[#262629] text-[#D4AF37]'
              : 'text-[#99907c] hover:text-white hover:bg-[#1b1b1f]'
          }`}
        >
          Todas las Entregas ({submissionsList.length})
        </button>

        {modules && modules.length > 0 ? (
          modules.map((m) => {
            const count = submissionsList.filter((s) => {
              const asg = assignmentsMap.get(s.assignment_id);
              return asg?.module_id === m.id;
            }).length;
            const isActive = activeModuleTab === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveModuleTab(m.id)}
                className={`px-4 py-2.5 rounded-lg text-xs font-montserrat uppercase tracking-wider font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#262629] text-[#D4AF37]'
                    : 'text-[#99907c] hover:text-white hover:bg-[#1b1b1f]'
                }`}
              >
                <span>{m.title}</span>
                {count > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-montserrat bg-[#D4AF37]/20 text-[#D4AF37]">
                    {count}
                  </span>
                )}
              </button>
            );
          })
        ) : (
          <div className="px-4 py-2 text-xs text-[#99907c] italic flex items-center gap-2">
            <span>No hay módulos temáticos creados aún.</span>
            <button
              type="button"
              onClick={() => setIsCreateModuleModalOpen(true)}
              className="text-[#D4AF37] hover:underline font-montserrat uppercase text-[11px] font-semibold not-italic"
            >
              + Crear primer módulo
            </button>
          </div>
        )}
      </div>

      {/* Filters Strip */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 text-[#99907c] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar estudiante por nombre, documento o proyecto..."
            className="w-full pl-11 pr-4 py-3 bg-[#131317] border border-[#262629] rounded-lg text-white text-xs placeholder:text-[#99907c]/50 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div className="md:col-span-5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-4 py-3 bg-[#131317] border border-[#262629] rounded-lg text-white text-xs font-montserrat uppercase focus:outline-none focus:border-[#D4AF37] cursor-pointer"
          >
            <option value="todos">Estado: Todas las entregas ({submissionsList.length})</option>
            <option value="pendiente">Estado: Pendientes de Calificar ({pendingGradingCount})</option>
            <option value="aprobado">Estado: Aprobadas ({approvedCount})</option>
            <option value="correccion">Estado: Requiere Ajustes ({devueltaCount})</option>
          </select>
        </div>

        <div className="md:col-span-1 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('todos');
              setActiveModuleTab('all');
            }}
            className="w-full py-3 px-3 rounded-lg bg-[#131317] border border-[#262629] hover:bg-[#1b1b1f] text-[#99907c] hover:text-white text-xs font-montserrat uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
            title="Restablecer filtros"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="md:hidden">Restablecer</span>
          </button>
        </div>
      </div>

      {/* Classroom Workspace Grid (2 Columns: Evidence Deck + Grading Studio) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Evidence List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-montserrat uppercase tracking-widest text-[#99907c] font-semibold">
              Entregas del Curso ({filteredSubmissions.length} visibles)
            </span>
            <span className="text-xs text-[#99907c]">
              Total en sistema: {totalSubmissionsCount}
            </span>
          </div>

          {/* Empty State when no submissions exist */}
          {submissionsList.length === 0 ? (
            <div className="p-10 rounded-2xl bg-[#131317] border border-[#262629] text-center space-y-5 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-[#1b1b1f] border border-[#262629] text-[#D4AF37] flex items-center justify-center mx-auto shadow-inner">
                <FolderCheck className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="font-montserrat font-bold text-white text-lg">
                  No hay entregas registradas aún
                </h3>
                <p className="text-xs text-[#99907c] leading-relaxed">
                  Los estudiantes de este curso aún no han subido evidencias o proyectos. Cuando las tareas sean entregadas por los alumnos, aparecerán aquí para ser calificadas con la rúbrica comunitaria.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#f2ca50] text-[#0A0A0E] text-xs font-montserrat uppercase tracking-wider font-bold shadow-md shadow-[#D4AF37]/20 hover:brightness-110 transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Crear Asignación / Tarea</span>
                </button>
                {onSwitchToStudentsTab && (
                  <button
                    type="button"
                    onClick={onSwitchToStudentsTab}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1b1b1f] hover:bg-[#262629] text-white border border-[#262629] text-xs font-montserrat uppercase tracking-wider font-semibold transition-all"
                  >
                    <Users className="w-4 h-4 text-[#D4AF37]" />
                    <span>Ver Estudiantes ({totalEnrolledCount})</span>
                  </button>
                )}
              </div>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#131317] border border-[#262629] text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-[#99907c] mx-auto" />
              <p className="text-sm text-white font-montserrat font-semibold">
                No se encontraron entregas con los filtros actuales
              </p>
              <p className="text-xs text-[#99907c]">
                Prueba borrando el término de búsqueda o cambiando el estado seleccionado.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('todos');
                  setActiveModuleTab('all');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1b1b1f] text-[#D4AF37] border border-[#262629] text-xs font-montserrat uppercase font-semibold hover:bg-[#262629] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer Filtros</span>
              </button>
            </div>
          ) : (
            <>
              {/* Active Selected Submission Card */}
              {activeSubmission && (
                <div className="p-4 sm:p-6 rounded-xl bg-[#1b1b1f] border-2 border-[#D4AF37] shadow-xl relative overflow-hidden transition-all duration-200">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#D4AF37]"></div>

                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#806b23] text-[#0A0A0E] font-montserrat text-sm font-bold flex items-center justify-center shrink-0 shadow-md">
                        {getInitials(activeSubmission.student_name)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-montserrat font-bold text-white text-lg">
                            {activeSubmission.student_name}
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-montserrat bg-[#D4AF37]/20 text-[#D4AF37] uppercase font-semibold">
                            En Mesa
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[#99907c] mt-0.5">
                          <span>{activeSubmission.student_document}</span>
                          <span>•</span>
                          <span className="text-amber-400 font-medium">
                            {activeSubmission.project_title || activeAssignment?.title || 'Evidencia de Curso'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-montserrat uppercase font-semibold ${
                        activeSubmission.status === 'entregada'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : activeSubmission.status === 'devuelta'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {activeSubmission.status === 'entregada' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                        )}
                        {activeSubmission.status === 'entregada' 
                          ? 'Pendiente de Calificar' 
                          : activeSubmission.status === 'devuelta'
                          ? 'Requiere Ajustes'
                          : 'Calificada'}
                      </span>
                      <span className="text-[11px] text-[#99907c]">
                        {formatDate(activeSubmission.submitted_at, true)}
                        {activeSubmission.is_late && ' (Tardía)'}
                      </span>
                    </div>
                  </div>

                  {/* Submitted Files Preview (Images or Documents) */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs text-[#99907c]">
                      <span className="font-medium text-white">
                        {activeSubmission.files && activeSubmission.files.length > 0
                          ? `${activeSubmission.files.length} Archivo(s) Adjunto(s):`
                          : 'Archivos Adjuntos:'}
                      </span>
                      {activeSubmission.files && activeSubmission.files.some(f => f.url && f.url.match(/\.(jpeg|jpg|png|webp|gif)/i)) && (
                        <span className="text-[#D4AF37] text-[11px] font-montserrat uppercase tracking-wider font-semibold">
                          Clic para ampliar imagen
                        </span>
                      )}
                    </div>

                    {activeSubmission.files && activeSubmission.files.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {activeSubmission.files.map((file, i) => {
                          const isImage = file.url && (
                            file.mime_type?.startsWith('image/') || 
                            file.url.match(/\.(jpeg|jpg|png|webp|gif)/i)
                          );

                          if (isImage && file.url) {
                            return (
                              <div 
                                key={file.id || i}
                                onClick={() => setLightboxImage({ url: file.url!, title: file.file_name || 'Evidencia de Curso' })}
                                className="group relative rounded-lg overflow-hidden h-28 bg-[#0e0e12] border border-[#262629] shadow-inner cursor-pointer"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img 
                                  src={file.url} 
                                  alt={file.file_name || 'Evidencia'}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex items-end p-2">
                                  <span className="text-[10px] font-montserrat text-white truncate">{file.file_name}</span>
                                </div>
                                <div className="absolute inset-0 bg-[#D4AF37]/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <ZoomIn className="w-6 h-6 text-white" />
                                </div>
                              </div>
                            );
                          }

                          return (
                            <a
                              key={file.id || i}
                              href={file.url || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-3 rounded-lg bg-[#131317] border border-[#262629] hover:border-[#D4AF37]/40 text-left transition-colors flex flex-col justify-between"
                            >
                              <div className="flex items-center gap-2 text-[#D4AF37]">
                                <FileText className="w-5 h-5 shrink-0" />
                                <span className="text-xs text-white font-medium truncate">{file.file_name}</span>
                              </div>
                              <span className="text-[10px] text-[#99907c] mt-2 font-montserrat uppercase">Abrir archivo</span>
                            </a>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-lg bg-[#131317] border border-[#262629] text-xs text-[#99907c] italic">
                        Esta entrega no contiene archivos adjuntos multimedia.
                      </div>
                    )}
                  </div>

                  {/* Student Narrative Notes */}
                  {activeSubmission.text_content && (
                    <div className="p-3.5 rounded-lg bg-[#131317] border border-[#262629] text-xs text-[#d0c5af] flex items-start gap-2.5 mb-3">
                      <MessageSquare className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                      <p>
                        <strong className="text-white font-medium">Nota del estudiante:</strong> &quot;{activeSubmission.text_content}&quot;
                      </p>
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-[#262629] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                      <span className="text-[11px] font-montserrat uppercase tracking-wider text-[#99907c]">
                        {activeSubmission.badge || 'Estudiante Matriculado'}
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-[#D4AF37] text-xs font-montserrat uppercase font-semibold">
                      <span>Seleccionada para Calificar</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
                    </div>
                  </div>
                </div>
              )}

              {/* List of other secondary submissions */}
              {filteredSubmissions
                .filter((sub) => sub.id !== activeSubmission?.id)
                .map((sub) => {
                  const asg = assignmentsMap.get(sub.assignment_id);
                  return (
                    <div 
                      key={sub.id}
                      className="p-5 rounded-xl bg-[#131317] border border-[#262629] hover:border-[#D4AF37]/40 transition-colors shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-full bg-[#1b1b1f] border border-[#262629] text-white font-montserrat text-xs font-bold flex items-center justify-center shrink-0">
                          {getInitials(sub.student_name)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-montserrat font-semibold text-white text-base">
                              {sub.student_name}
                            </h4>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-montserrat uppercase font-semibold ${
                              sub.status === 'entregada'
                                ? 'bg-amber-500/15 text-amber-400'
                                : sub.status === 'devuelta'
                                ? 'bg-rose-500/15 text-rose-400'
                                : 'bg-emerald-500/15 text-emerald-400'
                            }`}>
                              {sub.status === 'entregada' 
                                ? 'Pendiente' 
                                : sub.status === 'devuelta' 
                                ? 'Requiere Ajustes' 
                                : 'Calificada'}
                            </span>
                          </div>
                          <p className="text-xs text-[#99907c]">
                            {sub.student_document} • Tarea: {sub.project_title || asg?.title || 'Evidencia de Curso'}
                          </p>
                          <p className="text-[11px] text-[#99907c]/70 mt-0.5">
                            {formatDate(sub.submitted_at, true)}
                          </p>
                          {sub.correction_note && (
                            <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              {sub.correction_note}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end md:self-center shrink-0">
                        {sub.score !== null && sub.score !== undefined ? (
                          <div className="text-right">
                            <span className="font-montserrat font-bold text-lg text-[#D4AF37]">
                              {sub.score.toFixed(1)}
                            </span>
                            <span className="text-xs text-[#99907c]"> / 5.0</span>
                            <div className="text-[10px] font-montserrat uppercase font-semibold mt-0.5 text-emerald-400">
                              {sub.badge || (sub.score >= 3.5 ? 'Aprobado' : 'Reprobado')}
                            </div>
                          </div>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => setActiveSubmissionId(sub.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#1b1b1f] hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#0A0A0E] border border-[#262629] text-xs font-montserrat uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Evaluar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </>
          )}
        </div>

        {/* Right Column: Sticky Grading Studio / Panel (5 cols) */}
        <div className="lg:col-span-5 sticky top-6 space-y-6">
          {activeSubmission ? (
            <div className="p-4 sm:p-6 rounded-2xl bg-[#131317] border border-[#D4AF37]/40 shadow-2xl relative overflow-hidden">
              {/* Studio Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#262629]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-montserrat text-base text-white font-semibold">Panel de Calificación</h3>
                    <p className="text-[10px] font-montserrat uppercase tracking-wider text-[#99907c]">Rúbrica Comunitaria</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-montserrat font-semibold uppercase ${
                  activeSubmission.status === 'calificada'
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                    : 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                }`}>
                  {activeSubmission.status === 'calificada' ? 'Calificada' : 'Por Evaluar'}
                </span>
              </div>

              {/* Active Evaluating Target */}
              <div className="py-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#99907c]">Estudiante en Mesa:</span>
                  <p className="font-montserrat font-bold text-white text-base">{activeSubmission.student_name}</p>
                  <p className="text-xs text-[#D4AF37] mt-0.5">
                    {activeSubmission.project_title || activeAssignment?.title || 'Evidencia de Curso'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#99907c]">Puntaje Ponderado:</span>
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-3xl font-montserrat font-extrabold text-[#D4AF37]">{calculatedScore}</span>
                    <span className="text-xs text-[#99907c]">/ 5.0</span>
                  </div>
                </div>
              </div>

              {/* Rubric Criteria Sliders */}
              <div className="space-y-4">
                {activeCriteria.map((crit) => {
                  const currentVal = criteriaScores[crit.id] ?? 4.0;
                  return (
                    <div key={crit.id} className="p-4 rounded-xl bg-[#1b1b1f] border border-[#262629] space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-montserrat uppercase tracking-wider text-white font-semibold">
                            {crit.number ? `${crit.number}. ` : ''}{crit.title} ({crit.weight}%)
                          </h4>
                          <p className="text-[11px] text-[#99907c]">{crit.description}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded bg-[#262629] font-montserrat text-sm font-bold text-[#D4AF37]">
                          {currentVal.toFixed(1)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1.0"
                        max="5.0"
                        step="0.1"
                        value={currentVal}
                        onChange={(e) => handleCriterionChange(crit.id, parseFloat(e.target.value))}
                        className="w-full accent-[#D4AF37] h-1.5 bg-[#262629] rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-[#99907c]">
                        <span>1.0 (Deficiente)</span>
                        <span>3.0 (Aceptable)</span>
                        <span>5.0 (Excelente)</span>
                      </div>
                    </div>
                  );
                })}

                {/* Direct Grade Override Input */}
                <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#1b1b1f] border border-[#262629]">
                  <label className="text-xs font-montserrat uppercase tracking-wider text-white font-semibold">
                    Nota Definitiva Ponderada:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1.0"
                      max="5.0"
                      step="0.1"
                      value={manualOverrideScore || calculatedScore}
                      onChange={(e) => setManualOverrideScore(e.target.value)}
                      className="w-20 px-3 py-1.5 text-center font-montserrat font-bold bg-[#262629] border border-[#262629] rounded-lg text-[#D4AF37] text-base focus:outline-none focus:border-[#D4AF37]"
                    />
                    <span className="text-xs text-[#99907c]">/ 5.0</span>
                  </div>
                </div>

                {/* Pedagogical Feedback Box */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-montserrat uppercase tracking-wider text-white font-semibold">
                      Retroalimentación Pedagógica:
                    </label>
                    <span className="text-[10px] text-[#99907c]">Visible al estudiante</span>
                  </div>
                  <textarea
                    rows={3}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Escribe comentarios constructivos sobre técnica, avances y recomendaciones..."
                    className="w-full p-3.5 bg-[#1b1b1f] border border-[#262629] rounded-lg text-white text-xs leading-relaxed placeholder:text-[#99907c]/50 focus:outline-none focus:border-[#D4AF37] resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => handleSaveGrade('Aprobado')}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#f2ca50] text-[#0A0A0E] text-xs font-montserrat uppercase tracking-wider font-bold shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Guardar Calificación y Notificar</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleSaveGrade('Corrección')}
                      className="py-2.5 px-3 rounded-lg bg-[#1b1b1f] hover:bg-[#262629] text-rose-300 border border-[#262629] text-xs font-montserrat uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                    >
                      <RotateCw className="w-4 h-4 text-rose-400" />
                      <span>Solicitar Ajustes</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveGrade('Distinción')}
                      className="py-2.5 px-3 rounded-lg bg-[#1b1b1f] hover:bg-[#262629] text-[#D4AF37] border border-[#262629] text-xs font-montserrat uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Award className="w-4 h-4 text-[#D4AF37]" />
                      <span>Aprobar con Mención</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#131317] border border-[#262629] text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center mx-auto">
                <Award className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h3 className="font-montserrat font-bold text-white text-base">
                  Panel de Calificación y Rúbrica
                </h3>
                <p className="text-xs text-[#99907c] leading-relaxed">
                  Selecciona una entrega en la columna izquierda para habilitar los deslizadores de la rúbrica comunitaria, calificar los criterios y redactar comentarios formativos.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#1b1b1f] border border-[#262629] text-left space-y-2 mt-4">
                <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#D4AF37] font-bold">
                  Lineamientos Pedagógicos
                </span>
                <ul className="text-[11px] text-[#99907c] space-y-1.5 list-disc list-inside">
                  <li>Escala oficial de 1.0 a 5.0 con ponderación por criterios.</li>
                  <li>Aprobación mínima requerida: 3.5 para expedición de diploma.</li>
                  <li>Las entregas evaluadas notifican de inmediato al estudiante.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Mini Notice */}
          <div className="p-4 rounded-xl bg-[#131317] border border-[#262629] flex items-center gap-3">
            <Bell className="w-5 h-5 text-[#D4AF37] shrink-0" />
            <p className="text-xs text-[#99907c] leading-relaxed">
              Al guardar, se actualiza el estado de la entrega en base de datos y el consolidado del boletín queda disponible para la emisión de diplomas.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Module: Pedagogical Support & Certification Criteria */}
      <div className="p-8 rounded-2xl bg-[#131317] border border-[#262629] relative overflow-hidden space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-1 rounded text-[10px] font-montserrat bg-[#D4AF37]/20 text-[#D4AF37] uppercase font-semibold">
            Marco Académico Institucional
          </span>
          <span className="text-xs text-[#99907c]">• Acreditación Comunitaria</span>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center shadow-lg shrink-0 mt-1">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 max-w-4xl">
            <h3 className="font-montserrat text-lg font-bold text-white">
              Criterios de Aprobación y Certificación de la Fundación Principio & Fin
            </h3>
            <p className="text-xs text-[#99907c] leading-relaxed">
              Requisitos oficiales validados para la emisión del certificado de formación técnica y artística comunitaria: asistencia mínima del 80% a las sesiones programadas y promedio ponderado superior o igual a 3.5 en las asignaciones evaluadas.
            </p>
          </div>
        </div>
      </div>

      {/* Create Module Modal */}
      <FormModal
        isOpen={isCreateModuleModalOpen}
        onClose={() => setIsCreateModuleModalOpen(false)}
        title="Crear Módulo Temático"
        description="Añade una nueva unidad formativa al curso para organizar las clases, tareas y evidencias."
        icon={<BookOpen className="w-5 h-5 text-[#D4AF37]" />}
        fields={[
          {
            name: 'title',
            label: 'Título del Módulo',
            placeholder: 'Ej: Módulo 1: Fundamentos y Manejo de Herramientas',
            required: true
          }
        ]}
        confirmLabel="Crear Módulo"
        onConfirm={async (vals) => {
          if (!vals.title || !vals.title.trim()) {
            return 'Por favor ingresa un título para el módulo.';
          }
          const supabase = createBrowserClient();
          const { error } = await supabase.from('course_modules').insert({
            course_id: course.id,
            title: vals.title.trim(),
            sort_order: modules.length + 1
          });
          if (error) {
            return `Error al crear módulo: ${error.message}`;
          }
          router.refresh();
          showToast(`Módulo "${vals.title.trim()}" creado exitosamente.`);
        }}
      />

      {/* Create Assignment Modal */}
      <CreateAssignmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        courseId={course.id}
        courseTitle={course.title}
        modules={modules}
        onAssignmentCreated={(asg) => {
          showToast(`¡Asignación "${asg.title}" creada y publicada con éxito!`);
          router.refresh();
        }}
      />

      {/* Lightbox Modal */}
      <ImageLightboxModal
        isOpen={!!lightboxImage}
        onClose={() => setLightboxImage(null)}
        imageUrl={lightboxImage?.url || ''}
        title={lightboxImage?.title || ''}
      />
    </div>
  );
}
