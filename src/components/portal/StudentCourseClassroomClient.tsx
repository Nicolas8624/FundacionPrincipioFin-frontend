'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle, 
  ArrowRight, 
  Download, 
  GraduationCap, 
  Layers, 
  Award,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Lock
} from 'lucide-react';

export interface ClassroomAssignment {
  id: string;
  title: string;
  instructions?: string | null;
  dueAt?: string | null;
  weightPercent?: number | null;
  maxScore: number;
  submission?: {
    id: string;
    status: 'borrador' | 'entregada' | 'calificada' | string;
    score?: number | null;
    feedback?: string | null;
    submittedAt?: string | null;
  } | null;
}

export interface ClassroomMaterial {
  id: string;
  title: string;
  description?: string | null;
  fileUrl: string;
  fileType?: string | null;
  fileSize?: number | null;
}

export interface ClassroomModule {
  id: string;
  title: string;
  description?: string | null;
  sortOrder: number;
  assignments: ClassroomAssignment[];
  materials: ClassroomMaterial[];
}

export interface CourseClassroomData {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string | null;
  modality: string;
  cohort?: string | null;
  scheduleText?: string | null;
  location?: string | null;
  instructorName?: string | null;
  imageUrl?: string | null;
  totalSessions: number;
  enrollment?: {
    id: string;
    status: string;
    attendedSessions: number;
    averageGrade?: number | null;
    cupoType?: string | null;
  } | null;
  modules: ClassroomModule[];
}

interface StudentCourseClassroomClientProps {
  course: CourseClassroomData;
}

export function StudentCourseClassroomClient({ course }: StudentCourseClassroomClientProps) {
  const [activeTab, setActiveTab] = useState<'syllabus' | 'materials'>('syllabus');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    // Expand all modules by default
    const initial: Record<string, boolean> = {};
    course.modules.forEach((mod) => {
      initial[mod.id] = true;
    });
    return initial;
  });

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const attendedSessions = course.enrollment?.attendedSessions || 0;
  const totalSessions = course.totalSessions || 16;
  const progressPercent = Math.min(100, Math.round((attendedSessions / totalSessions) * 100));

  const totalAssignments = course.modules.reduce((acc, m) => acc + m.assignments.length, 0);
  const completedAssignments = course.modules.reduce(
    (acc, m) => acc + m.assignments.filter((a) => a.submission?.status === 'calificada' || a.submission?.status === 'entregada').length,
    0
  );

  const allMaterials = course.modules.flatMap((m) => m.materials);

  const formatDueDate = (dueRaw?: string | null) => {
    if (!dueRaw) return 'Fecha por programar';
    const d = new Date(dueRaw);
    return d.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDueStatus = (dueRaw?: string | null, isSubmitted?: boolean) => {
    if (isSubmitted) return null;
    if (!dueRaw) return null;
    const due = new Date(dueRaw);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { text: 'Plazo vencido', color: 'text-red-400 bg-red-500/10 border-red-500/30' };
    if (diffDays === 0) return { text: 'Vence hoy', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    if (diffDays === 1) return { text: 'Vence mañana', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    return { text: `Quedan ${diffDays} días`, color: 'text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/30' };
  };

  // 1. Si la matrícula se encuentra en estado pendiente
  if (course.enrollment?.status === 'pendiente') {
    return (
      <div className="space-y-8 pb-16 max-w-4xl mx-auto">
        <div className="flex items-center gap-2.5 text-xs text-[#99907c] border-b border-[#262629] pb-4">
          <Link
            href="/portal/cursos?tab=pendientes"
            className="inline-flex items-center gap-1.5 text-white hover:text-[#D4AF37] font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Mis Solicitudes en Revisión</span>
          </Link>
          <span>/</span>
          <span className="text-[#D4AF37] font-medium truncate">{course.title}</span>
        </div>

        <div className="bg-[#17171a] border border-[#D4AF37]/40 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#262013] border border-[#D4AF37]/50 text-[#D4AF37] flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-[#D4AF37] animate-pulse" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#262013] border border-[#D4AF37]/40 text-[#F5D77A] text-[10px] font-bold font-montserrat uppercase tracking-wider">
                Solicitud en Proceso de Revisión
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white font-montserrat mt-1">
                {course.title}
              </h1>
            </div>
          </div>

          <div className="bg-[#1b1b1f] border border-[#262629] rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white font-montserrat flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#D4AF37]" />
              Tu cupo aún no ha sido confirmado oficialmente
            </h3>
            <p className="text-xs text-[#99907c] leading-relaxed">
              Recibimos tu postulación y los datos registrados. La coordinación académica de la Fundación Principio y Fin está validando los cupos disponibles para esta cohorte. Por motivos de seguridad académica, el aula virtual, los módulos temáticos y la entrega de asignaciones se desbloquearán automáticamente cuando el administrador confirme tu plaza.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#99907c]">
            <div className="bg-[#131317] border border-[#262629] p-3 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-montserrat font-bold text-[#D4AF37]">Docente Formador</span>
              <p className="text-white font-medium truncate">{course.instructorName || 'Docente Asignado'}</p>
            </div>
            <div className="bg-[#131317] border border-[#262629] p-3 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-montserrat font-bold text-[#D4AF37]">Horario</span>
              <p className="text-white font-medium truncate">{course.scheduleText || 'Horario por coordinar'}</p>
            </div>
            <div className="bg-[#131317] border border-[#262629] p-3 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-montserrat font-bold text-[#D4AF37]">Sede</span>
              <p className="text-white font-medium truncate">{course.location || 'Sede Principal'}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#262629] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[#99907c]">
              <Lock className="w-4 h-4 text-[#D4AF37]" />
              <span>Acceso al aula virtual bloqueado temporalmente</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                href="/portal/cursos?tab=pendientes"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#F5D77A] text-[#0A0A0E] px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider font-montserrat transition-all shadow-md"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a Mis Solicitudes</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Si el usuario no tiene ninguna matrícula registrada
  if (!course.enrollment) {
    return (
      <div className="space-y-8 pb-16 max-w-4xl mx-auto">
        <div className="flex items-center gap-2.5 text-xs text-[#99907c] border-b border-[#262629] pb-4">
          <Link
            href="/portal/catalogo"
            className="inline-flex items-center gap-1.5 text-white hover:text-[#D4AF37] font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Catálogo de Talleres</span>
          </Link>
          <span>/</span>
          <span className="text-[#D4AF37] font-medium truncate">{course.title}</span>
        </div>

        <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-6 sm:p-10 shadow-2xl text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#1b1b1f] border border-[#262629] flex items-center justify-center text-[#99907c] mx-auto">
            <Lock className="w-7 h-7 text-[#D4AF37]" />
          </div>
          <h2 className="text-2xl font-bold text-white font-montserrat">
            No estás matriculado en este taller
          </h2>
          <p className="text-xs text-[#99907c] max-w-md mx-auto leading-relaxed">
            Para acceder al contenido formativo, materiales didácticos y actividades de <strong>{course.title}</strong>, debes enviar una solicitud de inscripción desde nuestro catálogo oficial.
          </p>
          <div className="pt-2">
            <Link
              href="/portal/catalogo"
              className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#F5D77A] text-[#0A0A0E] px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider font-montserrat transition-all shadow-md"
            >
              <span>Explorar Catálogo y Postularme</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      
      {/* 1. Breadcrumb y Botón Volver */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262629] pb-4">
        <div className="flex items-center gap-2.5 text-xs text-[#99907c]">
          <Link
            href="/portal/cursos"
            className="inline-flex items-center gap-1.5 text-white hover:text-[#D4AF37] font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Mis Cursos Matriculados</span>
          </Link>
          <span>/</span>
          <span className="text-[#D4AF37] font-medium truncate max-w-md">{course.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#1b1b1f] border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] font-montserrat uppercase tracking-wider font-bold">
            {course.cohort ? `Cohorte ${course.cohort}` : 'Ciclo Académico 2026'}
          </span>
        </div>
      </div>

      {/* 2. Hero Banner del Curso */}
      <div className="bg-[#17171a] border border-[#262629] rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          
          <div className="space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-montserrat uppercase tracking-wider font-bold">
                {course.modality.toUpperCase()}
              </span>
              <span className="text-xs text-[#99907c] font-montserrat">
                Código: PF-{course.slug.substring(0, 4).toUpperCase()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-montserrat text-white leading-tight">
              {course.title}
            </h1>

            {course.shortDescription && (
              <p className="text-xs sm:text-sm text-[#d0c5af] leading-relaxed">
                {course.shortDescription}
              </p>
            )}

            {/* Metadatos: Formador, Horario, Ubicación */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-[#99907c]">
              <div className="flex items-center gap-2 bg-[#131317] border border-[#262629] px-3.5 py-2 rounded-xl">
                <User className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span className="truncate">Docente: <strong className="text-white">{course.instructorName || 'Docente Formador'}</strong></span>
              </div>
              <div className="flex items-center gap-2 bg-[#131317] border border-[#262629] px-3.5 py-2 rounded-xl">
                <Calendar className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span className="truncate">{course.scheduleText || 'Horario por coordinar'}</span>
              </div>
              <div className="flex items-center gap-2 bg-[#131317] border border-[#262629] px-3.5 py-2 rounded-xl">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span className="truncate">{course.location || 'Sede Principal'}</span>
              </div>
            </div>
          </div>

          {/* Tarjeta de Progreso Académico del Estudiante */}
          <div className="w-full md:w-72 bg-[#1b1b1f] border border-[#262629] rounded-2xl p-5 shrink-0 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#99907c] font-semibold">
                Estado Académico
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold font-montserrat uppercase">
                {course.enrollment?.status === 'confirmada' ? 'Matrícula Activa' : 'Inscrito'}
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs text-[#99907c] mb-1.5 font-montserrat">
                <span>Asistencia Oficial</span>
                <span className="text-[#D4AF37] font-bold">{attendedSessions} / {totalSessions} sesiones</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#262629] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#262629] flex items-center justify-between text-xs">
              <span className="text-[#99907c]">Promedio Acumulado:</span>
              <span className="text-white font-bold font-montserrat text-sm">
                {course.enrollment?.averageGrade
                  ? `${Number(course.enrollment.averageGrade).toFixed(1)} / 5.0`
                  : 'En curso'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-[#99907c]">
              <span>Entregas Realizadas:</span>
              <span className="text-[#d0c5af] font-semibold">{completedAssignments} de {totalAssignments}</span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Pestañas de Navegación: Plan de Estudios vs Material Didáctico */}
      <div className="flex items-center gap-3 border-b border-[#262629] pb-1">
        <button
          onClick={() => setActiveTab('syllabus')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wider uppercase font-montserrat transition-all cursor-pointer ${
            activeTab === 'syllabus'
              ? 'bg-[#D4AF37] text-[#0A0A0E] shadow-md shadow-[#D4AF37]/20 font-bold'
              : 'bg-[#17171a] border border-[#262629] text-[#d0c5af] hover:text-white hover:border-[#D4AF37]/40'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Plan de Estudios & Actividades ({totalAssignments})</span>
        </button>

        <button
          onClick={() => setActiveTab('materials')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wider uppercase font-montserrat transition-all cursor-pointer ${
            activeTab === 'materials'
              ? 'bg-[#D4AF37] text-[#0A0A0E] shadow-md shadow-[#D4AF37]/20 font-bold'
              : 'bg-[#17171a] border border-[#262629] text-[#d0c5af] hover:text-white hover:border-[#D4AF37]/40'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Guías y Materiales Didácticos ({allMaterials.length})</span>
        </button>
      </div>

      {/* 4. CONTENIDO TAB 1: MÓDULOS Y ACTIVIDADES (Syllabus) */}
      {activeTab === 'syllabus' && (
        <div className="space-y-6">
          {course.modules.length > 0 ? (
            course.modules.map((module, mIdx) => {
              const isExpanded = !!expandedModules[module.id];
              return (
                <div
                  key={module.id}
                  className="bg-[#17171a] border border-[#262629] rounded-2xl overflow-hidden shadow-xl"
                >
                  {/* Encabezado del Módulo (Acordeón) */}
                  <div
                    onClick={() => toggleModule(module.id)}
                    className="p-5 sm:p-6 bg-[#1b1b1f] border-b border-[#262629] flex items-center justify-between gap-4 cursor-pointer hover:bg-[#202025] transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#262629] border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center font-montserrat font-bold text-xs shrink-0">
                        0{module.sortOrder || mIdx + 1}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-base sm:text-lg font-bold font-montserrat text-white truncate">
                          {module.title}
                        </h2>
                        {module.description && (
                          <p className="text-xs text-[#99907c] mt-0.5 line-clamp-1">
                            {module.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] font-montserrat uppercase tracking-wider text-[#99907c] hidden sm:inline">
                        {module.assignments.length} {module.assignments.length === 1 ? 'actividad' : 'actividades'}
                      </span>
                      <button
                        type="button"
                        className="text-[#99907c] hover:text-white p-1 rounded-lg bg-[#262629]"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Lista de Actividades de este Módulo */}
                  {isExpanded && (
                    <div className="p-5 sm:p-6 space-y-4">
                      {module.assignments.length > 0 ? (
                        module.assignments.map((assignment) => {
                          const sub = assignment.submission;
                          const dueStatus = getDueStatus(assignment.dueAt, !!sub && sub.status !== 'borrador');

                          return (
                            <div
                              key={assignment.id}
                              className="bg-[#131317] border border-[#262629] hover:border-[#D4AF37]/40 rounded-xl p-4 sm:p-5 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                            >
                              <div className="space-y-2 flex-1 min-w-0">
                                
                                {/* Badges de Estado y Ponderación */}
                                <div className="flex flex-wrap items-center gap-2">
                                  {sub?.status === 'calificada' ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-montserrat font-bold uppercase tracking-wider">
                                      <CheckCircle2 className="w-3 h-3" />
                                      Calificada: {sub.score?.toFixed(1)} / {assignment.maxScore.toFixed(1)}
                                    </span>
                                  ) : sub?.status === 'entregada' ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[10px] font-montserrat font-bold uppercase tracking-wider">
                                      <FileCheck className="w-3 h-3" />
                                      Entregada (En revisión)
                                    </span>
                                  ) : sub?.status === 'borrador' ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-montserrat font-bold uppercase tracking-wider">
                                      <AlertCircle className="w-3 h-3" />
                                      Borrador guardado
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-montserrat font-bold uppercase tracking-wider">
                                      <Clock className="w-3 h-3" />
                                      Pendiente de entrega
                                    </span>
                                  )}

                                  {assignment.weightPercent && (
                                    <span className="px-2 py-0.5 rounded bg-[#1b1b1f] border border-[#262629] text-[10px] font-montserrat text-[#99907c] uppercase">
                                      Ponderación: {assignment.weightPercent}%
                                    </span>
                                  )}

                                  {dueStatus && (
                                    <span className={`px-2 py-0.5 rounded border text-[10px] font-montserrat font-medium ${dueStatus.color}`}>
                                      {dueStatus.text}
                                    </span>
                                  )}
                                </div>

                                {/* Título de la Actividad */}
                                <h3 className="text-sm sm:text-base font-bold font-montserrat text-white leading-snug">
                                  {assignment.title}
                                </h3>

                                {assignment.instructions && (
                                  <p className="text-xs text-[#99907c] line-clamp-2 leading-relaxed">
                                    {assignment.instructions}
                                  </p>
                                )}

                                {/* Retroalimentación del docente si ya fue calificada */}
                                {sub?.feedback && (
                                  <div className="bg-[#17171a] border border-[#262629] rounded-lg p-2.5 text-xs text-[#d0c5af] space-y-0.5">
                                    <strong className="text-emerald-400 font-montserrat">Comentario del Docente:</strong>
                                    <p className="italic text-[11px] text-[#99907c]">{sub.feedback}</p>
                                  </div>
                                )}
                              </div>

                              {/* Botón de Acción a la Pantalla de Entrega de esta Actividad */}
                              <div className="shrink-0 w-full md:w-auto">
                                <Link
                                  href={`/portal/cursos/${course.id}/actividad/${assignment.id}`}
                                  className={`w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold font-montserrat uppercase tracking-wider transition-all shadow-sm ${
                                    sub?.status === 'calificada'
                                      ? 'bg-[#1b1b1f] hover:bg-[#262629] border border-[#262629] text-white hover:border-[#D4AF37]/50'
                                      : 'bg-[#D4AF37] hover:bg-[#F5D77A] text-[#0A0A0E]'
                                  }`}
                                >
                                  <span>
                                    {sub?.status === 'calificada'
                                      ? 'Ver Calificación y Rúbrica'
                                      : sub?.status === 'entregada'
                                      ? 'Ver Entrega Realizada'
                                      : sub?.status === 'borrador'
                                      ? 'Continuar Borrador'
                                      : 'Abrir Actividad y Entregar'}
                                  </span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-6 text-center text-xs text-[#99907c] bg-[#131317] rounded-xl border border-[#262629]">
                          No hay asignaciones publicadas para este módulo en este momento.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-10 text-center space-y-3">
              <Layers className="w-10 h-10 text-[#99907c] mx-auto" />
              <h3 className="text-base font-bold text-white font-montserrat">
                Módulos en preparación
              </h3>
              <p className="text-xs text-[#99907c] max-w-md mx-auto">
                El docente formador está configurando las guías y talleres prácticos de este curso. Vuelve a consultar pronto.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 5. CONTENIDO TAB 2: MATERIAL DIDÁCTICO Y GUÍAS PDF */}
      {activeTab === 'materials' && (
        <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-b border-[#262629] pb-4">
            <h2 className="text-lg font-bold font-montserrat text-white">
              Repositorio de Materiales y Protocolos Oficiales
            </h2>
            <p className="text-xs text-[#99907c] mt-1">
              Descarga las lecturas obligatorias, bitácoras editables y manuales técnicos aprobados por la dirección pedagógica.
            </p>
          </div>

          {allMaterials.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allMaterials.map((mat) => (
                <div
                  key={mat.id}
                  className="bg-[#1b1b1f] border border-[#262629] hover:border-[#D4AF37]/40 rounded-xl p-5 flex flex-col justify-between space-y-4 transition-all"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-[#262629] text-[#D4AF37] flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white font-montserrat line-clamp-2">
                      {mat.title}
                    </h3>
                    {mat.description && (
                      <p className="text-xs text-[#99907c] line-clamp-2">
                        {mat.description}
                      </p>
                    )}
                  </div>

                  <a
                    href={mat.fileUrl}
                    download
                    onClick={(e) => {
                      if (!mat.fileUrl.startsWith('http')) {
                        e.preventDefault();
                        alert(`Descargando material oficial: ${mat.title}`);
                      }
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#262629] hover:bg-[#333338] text-white hover:text-[#D4AF37] py-2.5 px-4 rounded-xl text-xs font-semibold font-montserrat uppercase tracking-wider transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Descargar {mat.fileType || 'PDF'}</span>
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-[#99907c] mx-auto" />
              <p className="text-sm font-semibold text-white font-montserrat">
                Sin documentos adjuntos adicionales
              </p>
              <p className="text-xs text-[#99907c] max-w-md mx-auto">
                Los materiales complementarios serán compartidos por tu formador en cada sesión práctica.
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
