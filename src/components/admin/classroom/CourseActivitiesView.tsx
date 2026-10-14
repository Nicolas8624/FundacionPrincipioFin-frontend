'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ClipboardList, 
  PlusCircle, 
  FolderPlus, 
  Calendar, 
  Clock, 
  Layers, 
  Sparkles, 
  Check, 
  Trash2, 
  Edit3, 
  Search, 
  AlertCircle, 
  FileText, 
  Sliders, 
  Award, 
  Folder, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { CreateAssignmentModal } from './CreateAssignmentModal';
import { FormModal } from './FormModal';
import { 
  deleteAssignmentAction, 
  upsertModuleAction, 
  deleteModuleAction 
} from '@/app/(admin)/admin/cursos/[id]/actions';
import type {
  ClassroomCourse,
  ClassroomModule,
  ClassroomAssignment,
  ClassroomSubmission
} from './types';
import { formatDate, formatModality } from './types';

interface CourseActivitiesViewProps {
  course: ClassroomCourse;
  modules?: ClassroomModule[];
  assignments?: ClassroomAssignment[];
  submissions?: ClassroomSubmission[];
  onNavigateToSubmissions?: (assignmentId?: string) => void;
}

export function CourseActivitiesView({
  course,
  modules = [],
  assignments = [],
  submissions = [],
  onNavigateToSubmissions
}: CourseActivitiesViewProps) {
  const router = useRouter();

  // Modals state
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<ClassroomAssignment | null>(null);
  const [createAssignmentDefaultModuleId, setCreateAssignmentDefaultModuleId] = useState<string | undefined>(undefined);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<ClassroomModule | null>(null);

  // Deletion modals state
  const [deletingAssignment, setDeletingAssignment] = useState<ClassroomAssignment | null>(null);
  const [deletingModule, setDeletingModule] = useState<ClassroomModule | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModuleFilter, setSelectedModuleFilter] = useState('all');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Submissions count by assignment
  const submissionsCountByAssignment = useMemo(() => {
    const map = new Map<string, number>();
    submissions.forEach((s) => {
      map.set(s.assignment_id, (map.get(s.assignment_id) || 0) + 1);
    });
    return map;
  }, [submissions]);

  // Curriculum KPIs
  const totalAssignmentsCount = assignments.length;
  const publishedAssignmentsCount = assignments.filter((a) => a.is_published).length;
  const totalWeightSum = useMemo(() => {
    return assignments.reduce((acc, a) => acc + (a.weight_percent || 0), 0);
  }, [assignments]);

  // Filtered assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const matchSearch =
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.instructions || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchModule =
        selectedModuleFilter === 'all' ||
        (selectedModuleFilter === 'unassigned' && !a.module_id) ||
        a.module_id === selectedModuleFilter;

      return matchSearch && matchModule;
    });
  }, [assignments, searchTerm, selectedModuleFilter]);

  // Group assignments by module
  const assignmentsByModule = useMemo(() => {
    const map = new Map<string, ClassroomAssignment[]>();
    modules.forEach((m) => map.set(m.id, []));
    map.set('unassigned', []);

    filteredAssignments.forEach((a) => {
      if (a.module_id && map.has(a.module_id)) {
        map.get(a.module_id)!.push(a);
      } else {
        map.get('unassigned')!.push(a);
      }
    });

    return map;
  }, [modules, filteredAssignments]);

  // Filtered modules: keep modules visible even when they have 0 assignments
  const filteredModules = useMemo(() => {
    let list = modules;
    if (selectedModuleFilter !== 'all') {
      if (selectedModuleFilter === 'unassigned') return [];
      list = list.filter((m) => m.id === selectedModuleFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter((m) => {
        const titleMatches = m.title.toLowerCase().includes(term);
        const hasMatchingAssignments = (assignmentsByModule.get(m.id) || []).length > 0;
        return titleMatches || hasMatchingAssignments;
      });
    }

    return list;
  }, [modules, selectedModuleFilter, searchTerm, assignmentsByModule]);

  // Unassigned assignments list based on filter
  const unassignedAssignments = useMemo(() => {
    if (selectedModuleFilter !== 'all' && selectedModuleFilter !== 'unassigned') {
      return [];
    }
    return assignmentsByModule.get('unassigned') || [];
  }, [selectedModuleFilter, assignmentsByModule]);

  // Actions
  const handleOpenCreateAssignment = (defaultModuleId?: string) => {
    setEditingAssignment(null);
    setCreateAssignmentDefaultModuleId(defaultModuleId);
    setIsAssignmentModalOpen(true);
  };

  const handleOpenEditAssignment = (assignment: ClassroomAssignment) => {
    setEditingAssignment(assignment);
    setCreateAssignmentDefaultModuleId(assignment.module_id || undefined);
    setIsAssignmentModalOpen(true);
  };

  const handleConfirmDeleteAssignment = async () => {
    if (!deletingAssignment) return;
    const res = await deleteAssignmentAction(deletingAssignment.id, course.id);
    if (!res.success) {
      return res.error || 'Error al eliminar la asignación';
    }
    showToast(`Asignación "${deletingAssignment.title}" eliminada con éxito.`);
    setDeletingAssignment(null);
    router.refresh();
  };

  const handleConfirmDeleteModule = async () => {
    if (!deletingModule) return;
    const res = await deleteModuleAction(deletingModule.id, course.id);
    if (!res.success) {
      return res.error || 'Error al eliminar el módulo';
    }
    showToast(`Módulo "${deletingModule.title}" eliminado con éxito.`);
    setDeletingModule(null);
    router.refresh();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
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
              Plan Pedagógico • Estructura Curricular y Tareas
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-montserrat font-bold text-white tracking-tight">
            Actividades y Módulos del Curso
          </h1>
          <p className="text-xs sm:text-sm text-[#99907c] max-w-3xl leading-relaxed">
            Administra las unidades formativas, crea nuevas asignaciones prácticas, ajusta fechas de entrega, modifica consignas o ponderaciones y supervisa la distribución curricular.
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
            {course.schedule_text && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1b1b1f] border border-[#262629] text-[#e4e1e7] text-xs font-montserrat uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Horario: <strong className="text-white font-semibold">{course.schedule_text}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Global CTA Buttons */}
        <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              setEditingModule(null);
              setIsModuleModalOpen(true);
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#1b1b1f] hover:bg-[#262629] text-white border border-[#262629] hover:border-[#D4AF37]/40 text-xs font-montserrat uppercase tracking-wider font-semibold transition-all shadow-sm"
          >
            <FolderPlus className="w-4 h-4 text-[#D4AF37]" />
            <span>Crear Módulo</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenCreateAssignment()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#f2ca50] text-[#0A0A0E] text-xs font-montserrat uppercase tracking-wider font-bold shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Crear Asignación / Tarea</span>
          </button>
        </div>
      </div>

      {/* 4 Bento KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Metric 1: Total Assignments */}
        <div className="p-5 rounded-xl bg-[#131317] border border-[#262629] hover:border-[#D4AF37]/30 transition-all shadow-md flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-montserrat uppercase tracking-widest text-[#99907c]">Total Asignaciones</span>
            <div className="w-9 h-9 rounded-lg bg-[#1b1b1f] border border-[#262629] flex items-center justify-center text-[#D4AF37]">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-montserrat font-bold text-white">{totalAssignmentsCount}</span>
            <span className="text-xs text-[#99907c] font-montserrat">
              {publishedAssignmentsCount} publicadas
            </span>
          </div>
          <div className="w-full bg-[#262629] h-1.5 rounded-full mt-4 overflow-hidden">
            <div 
              className="bg-[#D4AF37] h-full rounded-full transition-all duration-500"
              style={{ width: totalAssignmentsCount > 0 ? '100%' : '0%' }}
            />
          </div>
        </div>

        {/* Metric 2: Total Weighting */}
        <div className="p-5 rounded-xl bg-[#131317] border border-[#262629] hover:border-amber-400/30 transition-all shadow-md flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-montserrat uppercase tracking-widest text-[#ffe082]">Ponderación Total</span>
            <div className="w-9 h-9 rounded-lg bg-[#262629] flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className={`text-3xl font-montserrat font-bold ${
              totalWeightSum === 100 ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {totalWeightSum}%
            </span>
            <span className="text-xs text-[#99907c] uppercase font-montserrat">
              {totalWeightSum === 100 ? 'Balanceada (100%)' : `Meta: 100% (resta ${Math.max(0, 100 - totalWeightSum)}%)`}
            </span>
          </div>
          <div className="w-full bg-[#262629] h-1.5 rounded-full mt-4 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                totalWeightSum === 100 ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
              style={{ width: `${Math.min(100, totalWeightSum)}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Modules Count */}
        <div className="p-5 rounded-xl bg-[#131317] border border-[#262629] hover:border-[#D4AF37]/30 transition-all shadow-md flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-montserrat uppercase tracking-widest text-[#99907c]">Módulos Temáticos</span>
            <div className="w-9 h-9 rounded-lg bg-[#1b1b1f] border border-[#262629] flex items-center justify-center text-[#D4AF37]">
              <Folder className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-montserrat font-bold text-white">{modules.length}</span>
            <span className="text-xs text-[#99907c] uppercase font-montserrat">
              Unidades activas
            </span>
          </div>
          <div className="w-full bg-[#262629] h-1.5 rounded-full mt-4 overflow-hidden">
            <div 
              className="bg-[#D4AF37] h-full rounded-full transition-all duration-500"
              style={{ width: modules.length > 0 ? '100%' : '0%' }}
            />
          </div>
        </div>

        {/* Metric 4: Received Submissions */}
        <div className="p-5 rounded-xl bg-[#131317] border border-[#262629] hover:border-emerald-400/30 transition-all shadow-md flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-montserrat uppercase tracking-widest text-[#99907c]">Entregas Recibidas</span>
            <div className="w-9 h-9 rounded-lg bg-[#1b1b1f] border border-[#262629] flex items-center justify-center text-emerald-400">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-montserrat font-bold text-white">{submissions.length}</span>
            <span className="text-xs text-emerald-400 uppercase font-semibold font-montserrat">
              Registradas en aula
            </span>
          </div>
          <div className="w-full bg-[#262629] h-1.5 rounded-full mt-4 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: submissions.length > 0 ? '100%' : '0%' }}
            />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#131317] border border-[#262629] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-[#99907c] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título de asignación o consigna..."
            className="w-full pl-11 pr-4 py-2.5 bg-[#1b1b1f] border border-[#262629] rounded-lg text-white text-xs placeholder:text-[#99907c]/50 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedModuleFilter}
            onChange={(e) => setSelectedModuleFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#1b1b1f] border border-[#262629] rounded-lg text-white text-xs font-montserrat uppercase focus:outline-none focus:border-[#D4AF37] cursor-pointer"
          >
            <option value="all">Filtrar por: Todos los Módulos</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
            <option value="unassigned">Sin Módulo Asignado</option>
          </select>
        </div>
      </div>

      {/* Main Activities Curriculum Explorer */}
      {modules.length === 0 && assignments.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#131317] border border-[#262629] text-center space-y-5 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-[#1b1b1f] border border-[#262629] text-[#D4AF37] flex items-center justify-center mx-auto shadow-inner">
            <ClipboardList className="w-8 h-8" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="font-montserrat font-bold text-white text-xl">
              No hay módulos ni actividades creadas aún
            </h3>
            <p className="text-xs text-[#99907c] leading-relaxed">
              Comienza estructurando tu plan de formación. Crea primero los módulos temáticos y luego añade las asignaciones prácticas y proyectos con su respectiva rúbrica comunitaria.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              type="button"
              onClick={() => {
                setEditingModule(null);
                setIsModuleModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1b1b1f] hover:bg-[#262629] text-white border border-[#262629] text-xs font-montserrat uppercase tracking-wider font-semibold transition-all"
            >
              <FolderPlus className="w-4 h-4 text-[#D4AF37]" />
              <span>1. Crear Módulo Temático</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenCreateAssignment()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#f2ca50] text-[#0A0A0E] text-xs font-montserrat uppercase tracking-wider font-bold shadow-md shadow-[#D4AF37]/20 hover:brightness-110 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>2. Crear Asignación / Tarea</span>
            </button>
          </div>
        </div>
      ) : filteredModules.length === 0 && unassignedAssignments.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#131317] border border-[#262629] text-center space-y-4 shadow-md">
          <AlertCircle className="w-8 h-8 text-[#99907c] mx-auto" />
          <h3 className="font-montserrat font-bold text-white text-base">
            No se encontraron módulos ni actividades
          </h3>
          <p className="text-xs text-[#99907c] max-w-md mx-auto">
            No hay elementos que coincidan con la búsqueda &quot;{searchTerm}&quot; o el filtro seleccionado.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedModuleFilter('all');
            }}
            className="text-[#D4AF37] hover:underline font-montserrat text-xs uppercase font-semibold"
          >
            Restablecer filtros
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Render each module and its assignments */}
          {filteredModules.map((m, index) => {
            const moduleAssignments = assignmentsByModule.get(m.id) || [];
            const moduleWeight = moduleAssignments.reduce((acc, a) => acc + (a.weight_percent || 0), 0);

            return (
              <div 
                key={m.id}
                className="rounded-2xl bg-[#131317] border border-[#262629] overflow-hidden shadow-lg transition-all"
              >
                {/* Module Header Strip */}
                <div className="p-4 sm:p-5 bg-[#1b1b1f] border-b border-[#262629] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] font-montserrat font-bold text-sm flex items-center justify-center shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="font-montserrat font-bold text-white text-base sm:text-lg">
                          {m.title}
                        </h2>
                        <span className="px-2 py-0.5 rounded text-[10px] font-montserrat uppercase tracking-wider bg-[#262629] text-[#99907c] font-semibold">
                          Módulo {index + 1}
                        </span>
                      </div>
                      <p className="text-xs text-[#99907c] mt-0.5">
                        {moduleAssignments.length} actividad(es) • {moduleWeight}% de la nota final del curso
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-stretch sm:self-center justify-end flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleOpenCreateAssignment(m.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#262629] hover:bg-[#D4AF37] text-[#e4e1e7] hover:text-[#0A0A0E] text-xs font-montserrat uppercase tracking-wider font-semibold transition-all border border-[#353439] hover:border-[#D4AF37]"
                      title="Agregar tarea vinculada a este módulo"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>+ Tarea</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingModule(m);
                        setIsModuleModalOpen(true);
                      }}
                      className="p-2 rounded-lg bg-[#131317] hover:bg-[#262629] text-[#99907c] hover:text-[#D4AF37] border border-[#262629] transition-colors"
                      title="Renombrar módulo"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingModule(m)}
                      className="p-2 rounded-lg bg-[#131317] hover:bg-rose-500/20 text-[#99907c] hover:text-rose-400 border border-[#262629] transition-colors"
                      title="Eliminar módulo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Assignments in this Module */}
                <div className="p-4 sm:p-6">
                  {moduleAssignments.length === 0 ? (
                    <div className="p-8 rounded-xl bg-[#1b1b1f]/40 border border-dashed border-[#262629] text-center space-y-3">
                      <div className="w-10 h-10 rounded-lg bg-[#262629] text-[#99907c] flex items-center justify-center mx-auto">
                        <FolderPlus className="w-5 h-5 text-[#D4AF37]" />
                      </div>
                      <div>
                        <p className="text-sm font-montserrat font-medium text-white">
                          Este módulo aún no tiene actividades
                        </p>
                        <p className="text-xs text-[#99907c] mt-1">
                          Agrega talleres, tareas prácticas o proyectos vinculados a esta unidad temática.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenCreateAssignment(m.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#262629] hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#0A0A0E] text-xs font-montserrat uppercase tracking-wider font-semibold transition-all border border-[#262629] hover:border-[#D4AF37]"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Crear Primera Actividad para este Módulo</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {moduleAssignments.map((assignment) => {
                        const subsCount = submissionsCountByAssignment.get(assignment.id) || 0;
                        const criteriaCount = Array.isArray(assignment.rubric_criteria)
                          ? assignment.rubric_criteria.length
                          : 0;

                        return (
                          <div
                            key={assignment.id}
                            className="p-5 rounded-xl bg-[#1b1b1f] border border-[#262629] hover:border-[#D4AF37]/40 transition-all shadow-md flex flex-col justify-between space-y-4 group"
                          >
                            {/* Card Top */}
                            <div className="space-y-2.5">
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-montserrat font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                                      {assignment.weight_percent ? `${assignment.weight_percent}% NOTA` : 'Sin ponderar'}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-montserrat font-semibold uppercase ${
                                      assignment.is_published 
                                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                                        : 'bg-[#262629] text-[#99907c]'
                                    }`}>
                                      {assignment.is_published ? 'Publicada' : 'Borrador'}
                                    </span>
                                  </div>
                                  <h3 className="font-montserrat font-bold text-white text-base group-hover:text-[#ffe082] transition-colors">
                                    {assignment.title}
                                  </h3>
                                </div>

                                {/* Actions: Edit / Delete */}
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditAssignment(assignment)}
                                    className="p-2 rounded-lg bg-[#262629] hover:bg-[#D4AF37] text-[#99907c] hover:text-[#0A0A0E] transition-all"
                                    title="Editar asignación"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeletingAssignment(assignment)}
                                    className="p-2 rounded-lg bg-[#262629] hover:bg-rose-500 text-[#99907c] hover:text-white transition-all"
                                    title="Eliminar asignación"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Dates & Instructions */}
                              <div className="flex flex-wrap items-center gap-3 text-xs text-[#99907c]">
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                                  Entrega: <strong className="text-white font-medium">{formatDate(assignment.due_at, true)}</strong>
                                </span>
                              </div>

                              {assignment.instructions && (
                                <p className="text-xs text-[#d0c5af] line-clamp-2 leading-relaxed bg-[#131317] p-2.5 rounded-lg border border-[#262629]/60">
                                  &quot;{assignment.instructions}&quot;
                                </p>
                              )}
                            </div>

                            {/* Card Footer: Rubric Info & Submissions Link */}
                            <div className="pt-3 border-t border-[#262629] flex items-center justify-between gap-3 text-xs">
                              <span className="flex items-center gap-1.5 text-[11px] text-[#99907c] font-montserrat">
                                <Sliders className="w-3.5 h-3.5 text-[#D4AF37]" />
                                {criteriaCount} criterio(s) en rúbrica
                              </span>

                              <button
                                type="button"
                                onClick={() => onNavigateToSubmissions?.(assignment.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#131317] hover:bg-[#262629] text-[#D4AF37] hover:text-[#ffe082] border border-[#262629] font-montserrat text-[11px] font-semibold uppercase tracking-wider transition-all"
                                title="Ver entregas de esta asignación en el Aula Virtual"
                              >
                                <span>{subsCount} entregas</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Unassigned Module Section (if any exist) */}
          {unassignedAssignments.length > 0 && (
            <div className="rounded-2xl bg-[#131317] border border-[#262629] overflow-hidden shadow-lg">
              <div className="p-5 bg-[#1b1b1f] border-b border-[#262629] flex items-center justify-between">
                <div>
                  <h2 className="font-montserrat font-bold text-white text-lg">
                    Asignaciones Generales (Sin Módulo)
                  </h2>
                  <p className="text-xs text-[#99907c] mt-0.5">
                    Actividades no vinculadas a ninguna unidad temática específica.
                  </p>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {unassignedAssignments.map((assignment) => {
                  const subsCount = submissionsCountByAssignment.get(assignment.id) || 0;
                  return (
                    <div
                      key={assignment.id}
                      className="p-5 rounded-xl bg-[#1b1b1f] border border-[#262629] hover:border-[#D4AF37]/40 transition-all shadow-md flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-montserrat font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                              {assignment.weight_percent ? `${assignment.weight_percent}% NOTA` : 'Sin ponderar'}
                            </span>
                            <h3 className="font-montserrat font-bold text-white text-base mt-1">
                              {assignment.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditAssignment(assignment)}
                              className="p-2 rounded-lg bg-[#262629] hover:bg-[#D4AF37] text-[#99907c] hover:text-[#0A0A0E] transition-all"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingAssignment(assignment)}
                              className="p-2 rounded-lg bg-[#262629] hover:bg-rose-500 text-[#99907c] hover:text-white transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-[#99907c]">
                          Entrega: <strong className="text-white">{formatDate(assignment.due_at, true)}</strong>
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#262629] flex items-center justify-between text-xs">
                        <span className="text-[11px] text-[#99907c]">
                          {subsCount} entregas registradas
                        </span>
                        <button
                          type="button"
                          onClick={() => onNavigateToSubmissions?.(assignment.id)}
                          className="text-[#D4AF37] hover:underline font-montserrat uppercase text-[11px] font-semibold"
                        >
                          Ver en Aula Virtual →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Create or Edit Assignment */}
      <CreateAssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => {
          setIsAssignmentModalOpen(false);
          setEditingAssignment(null);
          setCreateAssignmentDefaultModuleId(undefined);
        }}
        courseId={course.id}
        courseTitle={course.title}
        modules={modules}
        assignmentToEdit={editingAssignment}
        defaultModuleId={createAssignmentDefaultModuleId}
        onAssignmentCreated={() => {
          showToast('Asignación creada y publicada con éxito.');
          router.refresh();
        }}
        onAssignmentUpdated={() => {
          showToast('Asignación actualizada con éxito.');
          router.refresh();
        }}
      />

      {/* Modal: Create or Edit Module */}
      <FormModal
        isOpen={isModuleModalOpen}
        onClose={() => {
          setIsModuleModalOpen(false);
          setEditingModule(null);
        }}
        title={editingModule ? 'Editar Título del Módulo' : 'Crear Módulo Temático'}
        description={
          editingModule
            ? `Modifica el nombre oficial del módulo para actualizarlo en el plan pedagógico.`
            : 'Añade una nueva unidad formativa al curso para agrupar asignaciones y proyectos.'
        }
        icon={<FolderPlus className="w-5 h-5 text-[#D4AF37]" />}
        confirmLabel={editingModule ? 'Guardar Cambios' : 'Crear Módulo'}
        fields={[
          {
            name: 'title',
            label: 'Título del Módulo',
            defaultValue: editingModule?.title || '',
            placeholder: 'Ej: Módulo 1: Fundamentos y Manejo de Herramientas',
            required: true
          }
        ]}
        onConfirm={async (vals) => {
          if (!vals.title || !vals.title.trim()) {
            return 'Por favor ingresa un título para el módulo.';
          }
          const res = await upsertModuleAction(
            course.id,
            vals.title,
            editingModule?.id,
            modules.length + 1
          );
          if (!res.success) {
            return res.error || 'Error al guardar el módulo.';
          }
          showToast(
            editingModule
              ? `Módulo actualizado exitosamente.`
              : `Módulo "${vals.title.trim()}" creado exitosamente.`
          );
          router.refresh();
        }}
      />

      {/* Modal: Delete Assignment Confirmation */}
      <FormModal
        isOpen={!!deletingAssignment}
        onClose={() => setDeletingAssignment(null)}
        title="Eliminar Asignación"
        description={
          <span>
            ¿Estás seguro de que deseas eliminar permanentemente la tarea{' '}
            <strong className="text-white">{deletingAssignment?.title}</strong>? Esta acción no se puede deshacer.
          </span>
        }
        icon={<Trash2 className="w-5 h-5 text-rose-400" />}
        confirmLabel="Eliminar Asignación"
        tone="danger"
        fields={[]}
        onConfirm={handleConfirmDeleteAssignment}
      />

      {/* Modal: Delete Module Confirmation */}
      <FormModal
        isOpen={!!deletingModule}
        onClose={() => setDeletingModule(null)}
        title="Eliminar Módulo Temático"
        description={
          <span>
            ¿Estás seguro de que deseas eliminar el módulo{' '}
            <strong className="text-white">{deletingModule?.title}</strong>? Las tareas que estuvieran vinculadas quedarán como asignaciones generales.
          </span>
        }
        icon={<Trash2 className="w-5 h-5 text-rose-400" />}
        confirmLabel="Eliminar Módulo"
        tone="danger"
        fields={[]}
        onConfirm={handleConfirmDeleteModule}
      />
    </div>
  );
}
