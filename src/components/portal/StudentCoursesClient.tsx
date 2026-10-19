'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  User, 
  ArrowRight, 
  FileText, 
  Download, 
  Award, 
  AlertCircle, 
  Sparkles, 
  Video, 
  Store, 
  X, 
  Upload, 
  GraduationCap,
  CalendarCheck,
  Lock,
  BookOpen
} from 'lucide-react';

export interface StudentCourse {
  id: string;
  courseId: string;
  title: string;
  code: string;
  modality: string;
  modalityBadge: string;
  currentModule: string;
  schedule: string;
  location: string;
  instructor: string;
  image: string;
  nextSessionType: 'sync' | 'practical';
  nextSessionTitle: string;
  progressPercent: number;
  statusNote: string;
  statusNoteType: 'warning' | 'info';
  status: 'activo' | 'completado' | 'pendiente';
  grade?: string;
  hours?: string;
  certificateCode?: string;
  cupoType?: string;
  requestedAt?: string;
}

export interface AttendedWorkshop {
  id: string;
  courseTitle: string;
  instructor: string;
  location: string;
  modality: string;
  attendedSessions: number;
}

interface StudentCoursesClientProps {
  initialActiveCourses: StudentCourse[];
  initialPendingCourses?: StudentCourse[];
  initialCompletedCourses: StudentCourse[];
  totalWorkshopsAttended: number;
  attendedWorkshops?: AttendedWorkshop[];
}

export function StudentCoursesClient({
  initialActiveCourses,
  initialPendingCourses = [],
  initialCompletedCourses,
  totalWorkshopsAttended,
  attendedWorkshops = [],
}: StudentCoursesClientProps) {
  const [activeTab, setActiveTab] = useState<'activos' | 'pendientes' | 'completados' | 'asistidos'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'pendientes') return 'pendientes';
    }
    return 'activos';
  });
  const [selectedCourseForClassroom, setSelectedCourseForClassroom] = useState<StudentCourse | null>(null);
  const [selectedCourseForMaterials, setSelectedCourseForMaterials] = useState<StudentCourse | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const activeCount = initialActiveCourses.length;
  const pendingCount = initialPendingCourses.length;
  const completedCount = initialCompletedCourses.length;

  return (
    <div className="space-y-8 pb-12">
      
      {/* 1. Header & KPI Mini Badges */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#D4AF37] mb-2 flex items-center gap-2 font-semibold">
            <GraduationCap className="w-4 h-4 text-[#D4AF37]" />
            Ruta de Aprendizaje y Transformación
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold font-montserrat tracking-tight text-white leading-tight">
            Mis Cursos <span className="italic font-serif text-[#D4AF37]">Matriculados</span>
          </h1>
          <p className="text-[#99907c] text-xs sm:text-sm mt-3 max-w-2xl leading-relaxed">
            Gestiona tus talleres formativos, consulta rúbricas de evaluación institucionales y sube entregas de proyectos prácticos.
          </p>
        </div>

        {/* Mini Badges KPI (Superior derecha - Datos 100% Reales) */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          <div className="flex items-center gap-2.5 bg-[#17171a] border border-[#262629] px-4 py-2.5 rounded-xl shadow-md">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
            <div>
              <div className="text-base sm:text-lg font-bold font-montserrat text-white leading-none">
                {activeCount < 10 ? `0${activeCount}` : activeCount}
              </div>
              <div className="text-[9px] font-montserrat uppercase tracking-wider text-[#99907c] font-semibold mt-0.5">
                Cursos Activos
              </div>
            </div>
          </div>

          {pendingCount > 0 && (
            <div className="flex items-center gap-2.5 bg-[#17171a] border border-[#D4AF37]/50 px-4 py-2.5 rounded-xl shadow-md">
              <Clock className="w-4 h-4 text-[#D4AF37] animate-pulse" />
              <div>
                <div className="text-base sm:text-lg font-bold font-montserrat text-[#F5D77A] leading-none">
                  {pendingCount < 10 ? `0${pendingCount}` : pendingCount}
                </div>
                <div className="text-[9px] font-montserrat uppercase tracking-wider text-[#D4AF37] font-semibold mt-0.5">
                  En Revisión
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2.5 bg-[#17171a] border border-[#262629] px-4 py-2.5 rounded-xl shadow-md">
            <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
            <div>
              <div className="text-base sm:text-lg font-bold font-montserrat text-white leading-none">
                {completedCount < 10 ? `0${completedCount}` : completedCount}
              </div>
              <div className="text-[9px] font-montserrat uppercase tracking-wider text-[#99907c] font-semibold mt-0.5">
                Aprobados
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-[#17171a] border border-[#262629] px-4 py-2.5 rounded-xl shadow-md">
            <CalendarCheck className="w-4 h-4 text-[#D4AF37]" />
            <div>
              <div className="text-base sm:text-lg font-bold font-montserrat text-white leading-none">
                {totalWorkshopsAttended < 10 ? `0${totalWorkshopsAttended}` : totalWorkshopsAttended}
              </div>
              <div className="text-[9px] font-montserrat uppercase tracking-wider text-[#99907c] font-semibold mt-0.5">
                Sesiones Asistidas
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Barra de Pestañas Filtrables */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto custom-scrollbar pb-1 border-b border-[#262629]">
        <button
          onClick={() => setActiveTab('activos')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wider uppercase font-montserrat transition-all shrink-0 cursor-pointer ${
            activeTab === 'activos'
              ? 'bg-[#D4AF37] text-[#0A0A0E] shadow-md shadow-[#D4AF37]/20 font-bold'
              : 'bg-[#17171a] border border-[#262629] text-[#d0c5af] hover:text-white hover:border-[#D4AF37]/40'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Cursos Activos ({activeCount})
        </button>

        <button
          onClick={() => setActiveTab('pendientes')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wider uppercase font-montserrat transition-all shrink-0 cursor-pointer ${
            activeTab === 'pendientes'
              ? 'bg-[#D4AF37] text-[#0A0A0E] shadow-md shadow-[#D4AF37]/20 font-bold'
              : 'bg-[#17171a] border border-[#262629] text-[#d0c5af] hover:text-white hover:border-[#D4AF37]/40'
          }`}
        >
          <Clock className={`w-4 h-4 ${pendingCount > 0 ? 'text-[#D4AF37]' : ''}`} />
          Solicitudes en Revisión ({pendingCount})
        </button>

        <button
          onClick={() => setActiveTab('completados')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wider uppercase font-montserrat transition-all shrink-0 cursor-pointer ${
            activeTab === 'completados'
              ? 'bg-[#D4AF37] text-[#0A0A0E] shadow-md shadow-[#D4AF37]/20 font-bold'
              : 'bg-[#17171a] border border-[#262629] text-[#d0c5af] hover:text-white hover:border-[#D4AF37]/40'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Cursos Aprobados / Finalizados ({completedCount})
        </button>

        <button
          onClick={() => setActiveTab('asistidos')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wider uppercase font-montserrat transition-all shrink-0 cursor-pointer ${
            activeTab === 'asistidos'
              ? 'bg-[#D4AF37] text-[#0A0A0E] shadow-md shadow-[#D4AF37]/20 font-bold'
              : 'bg-[#17171a] border border-[#262629] text-[#d0c5af] hover:text-white hover:border-[#D4AF37]/40'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          Talleres Asistidos ({totalWorkshopsAttended})
        </button>
      </div>

      {/* 3. Contenido de la Pestaña Activa */}
      
      {/* PESTAÑA 1: CURSOS ACTIVOS */}
      {activeTab === 'activos' && (
        <div>
          {initialActiveCourses.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {initialActiveCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-[#17171a] border border-[#262629] hover:border-[#D4AF37]/40 rounded-2xl p-5 sm:p-6 md:p-7 flex flex-col justify-between shadow-2xl transition-all group relative overflow-hidden"
                >
                  <div className="space-y-4">
                    {/* Encabezado de la Tarjeta */}
                    <div className="flex items-center justify-between gap-2 border-b border-[#262629]/80 pb-3.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[10px] font-montserrat uppercase tracking-wider font-semibold text-[#D4AF37]">
                          {course.modalityBadge}
                        </span>
                        <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#99907c]">
                          · CÓD: {course.code}
                        </span>
                      </div>
                      <span className="text-[11px] font-montserrat font-semibold text-[#d0c5af] bg-[#1b1b1f] border border-[#262629] px-2.5 py-1 rounded-full">
                        {course.currentModule}
                      </span>
                    </div>

                    {/* Título, Detalles e Imagen */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                      <div className="sm:col-span-8 space-y-2.5">
                        <h2 className="text-xl sm:text-2xl font-bold text-white font-montserrat leading-snug group-hover:text-[#D4AF37] transition-colors">
                          {course.title}
                        </h2>

                        <div className="space-y-1.5 text-xs text-[#d0c5af]">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                            <span>{course.schedule}</span>
                            <span className="text-[#99907c]">·</span>
                            <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                            <span className="truncate">{course.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                            <span>Docente: <strong className="text-white font-medium">{course.instructor}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Miniatura del Taller */}
                      <div className="sm:col-span-4">
                        <div className="relative rounded-xl overflow-hidden aspect-[4/3] border border-[#262629] shadow-md group-hover:scale-102 transition-transform bg-[#1b1b1f]">
                          {course.image ? (
                            <Image
                              src={course.image}
                              alt={course.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1b1b1f] via-[#222227] to-[#17171a] p-3 text-center">
                              <BookOpen className="w-8 h-8 text-[#D4AF37]/50 mb-1.5" />
                              <span className="text-[10px] font-montserrat font-bold text-white line-clamp-2 px-1">
                                {course.title}
                              </span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end p-2 pointer-events-none">
                            <span className="text-[9px] font-montserrat font-bold text-[#D4AF37] uppercase tracking-wider">
                              Taller Activo
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Caja de Próxima Actividad / Sesión */}
                    <div className="bg-[#1b1b1f] border border-[#262629] rounded-xl p-3.5 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#262629] text-[#D4AF37] flex items-center justify-center shrink-0 mt-0.5">
                        {course.nextSessionType === 'sync' ? (
                          <Video className="w-4 h-4" />
                        ) : (
                          <Store className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-montserrat uppercase tracking-wider text-[#99907c] font-semibold">
                          {course.nextSessionType === 'sync' ? 'Sesión Virtual Sincrónica' : 'Sesión Práctica Presencial'}
                        </p>
                        <p className="text-xs sm:text-sm font-medium text-white truncate mt-0.5">
                          {course.nextSessionTitle}
                        </p>
                      </div>
                    </div>

                    {/* Barra de Avance Académico */}
                    <div>
                      <div className="flex justify-between text-xs text-[#99907c] mb-1.5 font-montserrat">
                        <span>Avance Académico</span>
                        <span className="text-[#D4AF37] font-semibold">{course.progressPercent}% Completado</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#262629] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] transition-all duration-500"
                          style={{ width: `${course.progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Nota de Estado / Notificación de Entrega */}
                    <div className="flex items-center gap-2 text-xs text-[#d0c5af] bg-[#131317] border border-[#262629] px-3.5 py-2 rounded-lg">
                      {course.statusNoteType === 'warning' ? (
                        <AlertCircle className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-[#99907c] shrink-0" />
                      )}
                      <span className="truncate">{course.statusNote}</span>
                    </div>
                  </div>

                  {/* Botones de Acción (Pie de Tarjeta) */}
                  <div className="pt-5 mt-4 border-t border-[#262629] grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link
                      href={`/portal/cursos/${course.courseId}`}
                      className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#F5D77A] text-[#0A0A0E] py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider font-montserrat transition-all cursor-pointer shadow-sm text-center"
                    >
                      <span>Entrar al Aula: Módulos y Actividades</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                    </Link>

                    <Link
                      href={`/portal/cursos/${course.courseId}`}
                      className="w-full flex items-center justify-center gap-2 bg-[#1b1b1f] hover:bg-[#262629] border border-[#262629] hover:border-[#D4AF37]/50 text-white py-3 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider font-montserrat transition-all cursor-pointer text-center"
                    >
                      <Download className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                      <span>Ver Guías y Materiales PDF</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-10 sm:p-14 text-center max-w-xl mx-auto shadow-2xl space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#1b1b1f] border border-[#262629] flex items-center justify-center text-[#99907c] mx-auto shadow-inner">
                <GraduationCap className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h3 className="text-xl font-bold text-white font-montserrat">
                No tienes cursos activos en este momento
              </h3>
              <p className="text-xs sm:text-sm text-[#99907c] leading-relaxed max-w-md mx-auto">
                Actualmente no tienes talleres en curso. Explora la oferta formativa disponible en la fundación para participar en la próxima cohorte.
              </p>
              <div className="pt-3">
                <Link
                  href="/portal/catalogo"
                  className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#F5D77A] text-[#0A0A0E] px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider font-montserrat transition-all shadow-md"
                >
                  <span>Explorar Catálogo de Talleres</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA: SOLICITUDES EN REVISIÓN */}
      {activeTab === 'pendientes' && (
        <div className="space-y-6">
          {initialPendingCourses.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {initialPendingCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-[#17171a] border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 rounded-2xl p-5 sm:p-6 md:p-7 flex flex-col justify-between shadow-2xl transition-all relative overflow-hidden"
                >
                  <div className="space-y-4">
                    {/* Encabezado */}
                    <div className="flex items-center justify-between gap-2 border-b border-[#262629]/80 pb-3.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md bg-[#262013] border border-[#D4AF37]/50 text-[10px] font-montserrat uppercase tracking-wider font-bold text-[#F5D77A] flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping" />
                          SOLICITUD EN REVISIÓN
                        </span>
                        <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#99907c]">
                          · RADICADO: {course.code}
                        </span>
                      </div>
                      <span className="text-[10px] font-montserrat font-semibold text-[#D4AF37] bg-[#1b1b1f] border border-[#262629] px-2.5 py-1 rounded-full">
                        {course.cupoType || 'Cupo Regular'}
                      </span>
                    </div>

                    {/* Título, Detalles e Imagen */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                      <div className="sm:col-span-8 space-y-2.5">
                        <h2 className="text-xl sm:text-2xl font-bold text-white font-montserrat leading-snug">
                          {course.title}
                        </h2>

                        <div className="space-y-1.5 text-xs text-[#d0c5af]">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                            <span>{course.schedule}</span>
                            <span className="text-[#99907c]">·</span>
                            <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                            <span className="truncate">{course.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                            <span>Docente: <strong className="text-white font-medium">{course.instructor}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Miniatura */}
                      <div className="sm:col-span-4">
                        <div className="relative rounded-xl overflow-hidden aspect-[4/3] border border-[#262629] shadow-md bg-[#1b1b1f]">
                          {course.image ? (
                            <Image
                              src={course.image}
                              alt={course.title}
                              fill
                              className="object-cover opacity-85"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1b1b1f] via-[#222227] to-[#17171a] p-3 text-center">
                              <BookOpen className="w-8 h-8 text-[#D4AF37]/50 mb-1.5" />
                              <span className="text-[10px] font-montserrat font-bold text-white line-clamp-2 px-1">
                                {course.title}
                              </span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex items-end p-2 pointer-events-none">
                            <span className="text-[9px] font-montserrat font-bold text-[#F5D77A] uppercase tracking-wider flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#D4AF37]" />
                              En Validación
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Explicación de Estado Institucional */}
                    <div className="bg-[#1b1b1f] border border-[#262629] rounded-xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-[#D4AF37] font-semibold text-xs font-montserrat uppercase tracking-wider">
                        <AlertCircle className="w-4 h-4 text-[#D4AF37]" />
                        <span>Trámite en proceso de asignación de cupo</span>
                      </div>
                      <p className="text-xs text-[#99907c] leading-relaxed">
                        Tu postulación fue recibida el <strong className="text-white">{course.requestedAt}</strong> y está siendo revisada por la coordinación de la Fundación Principio & Fin. Cuando tu cupo sea aprobado formalmente, el taller se moverá a tus <strong className="text-[#D4AF37]">Cursos Activos</strong> y se habilitará el aula virtual, los módulos y el cronograma de entregas.
                      </p>
                    </div>
                  </div>

                  {/* Acciones para solicitud pendiente */}
                  <div className="pt-5 mt-4 border-t border-[#262629] flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-[#99907c]">
                      <Lock className="w-3.5 h-3.5 text-amber-500/80" />
                      <span>Aula virtual inactiva hasta confirmación oficial</span>
                    </div>

                    <Link
                      href="/portal/catalogo"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1b1b1f] hover:bg-[#262629] border border-[#262629] hover:border-[#D4AF37]/50 text-white px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider font-montserrat transition-all cursor-pointer text-center"
                    >
                      <span>Ver Ficha en Catálogo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-10 sm:p-14 text-center max-w-xl mx-auto shadow-2xl space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#1b1b1f] border border-[#262629] flex items-center justify-center text-[#D4AF37] mx-auto shadow-inner">
                <Clock className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h3 className="text-xl font-bold text-white font-montserrat">
                No tienes solicitudes en revisión
              </h3>
              <p className="text-xs sm:text-sm text-[#99907c] leading-relaxed max-w-md mx-auto">
                Todas tus postulaciones han sido procesadas o aún no has solicitado ingreso a nuevos talleres de este ciclo formativo.
              </p>
              <div className="pt-3">
                <Link
                  href="/portal/catalogo"
                  className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#F5D77A] text-[#0A0A0E] px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider font-montserrat transition-all shadow-md"
                >
                  <span>Explorar Catálogo de Talleres</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 3: CURSOS APROBADOS / FINALIZADOS */}
      {activeTab === 'completados' && (
        <div className="space-y-4">
          {initialCompletedCourses.length > 0 ? (
            initialCompletedCourses.map((course) => (
              <div
                key={course.id}
                className="bg-[#17171a] border border-[#262629] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 hover:border-[#D4AF37]/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1b1b1f] border border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center shrink-0 mt-1">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[9px] font-montserrat font-bold text-[#D4AF37] uppercase">
                        FINALIZADO
                      </span>
                      <span className="text-xs text-[#99907c] font-montserrat">
                        {course.currentModule}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white font-montserrat mt-1">
                      {course.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#99907c] mt-1.5">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                        {course.instructor}
                      </span>
                      {course.grade && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1.5 text-white">
                            ⭐ Calificación final: <strong className="text-[#D4AF37] font-bold">{course.grade} / 5.0</strong>
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span className="text-emerald-400 font-medium">
                        ✓ Curso acreditado
                      </span>
                    </div>
                  </div>
                </div>

                {course.certificateCode && (
                  <div className="w-full md:w-auto shrink-0">
                    <Link
                      href="/portal/certificados"
                      className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-[#1b1b1f] hover:bg-[#262629] border border-[#262629] hover:border-[#D4AF37]/50 text-white px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider font-montserrat transition-all cursor-pointer shadow-sm"
                    >
                      <Download className="w-4 h-4 text-[#D4AF37]" />
                      Ver Certificado Oficial
                    </Link>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-10 sm:p-14 text-center max-w-lg mx-auto shadow-xl space-y-3">
              <Award className="w-10 h-10 text-[#99907c] mx-auto" />
              <h4 className="text-base font-semibold text-white font-montserrat">
                Sin cursos finalizados aún
              </h4>
              <p className="text-xs text-[#99907c] leading-relaxed">
                Tus certificados acreditados y calificaciones finales se registrarán en esta pestaña cuando culmines satisfactoriamente tus talleres activos.
              </p>
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 3: TALLERES ASISTIDOS (Datos 100% Reales del Usuario) */}
      {activeTab === 'asistidos' && (
        <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-6 shadow-xl space-y-5">
          <div className="border-b border-[#262629] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-white font-montserrat">
                Bitácora de Asistencias Presenciales
              </h3>
              <p className="text-xs text-[#99907c] mt-0.5">
                Registro de asistencias y talleres prácticos verificados por los formadores de la fundación.
              </p>
            </div>
            <span className="text-sm font-bold font-montserrat text-[#D4AF37] bg-[#1b1b1f] border border-[#262629] px-3.5 py-1.5 rounded-xl self-start sm:self-auto">
              {totalWorkshopsAttended} Sesiones Registradas
            </span>
          </div>

          {attendedWorkshops.length > 0 ? (
            <div className="divide-y divide-[#262629]">
              {attendedWorkshops.map((workshop) => (
                <div key={workshop.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></div>
                    <div>
                      <p className="text-white font-medium text-sm">{workshop.courseTitle}</p>
                      <p className="text-[11px] text-[#99907c] mt-0.5">
                        {workshop.instructor} • {workshop.location} • Modalidad {workshop.modality}
                      </p>
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1b1b1f] border border-[#262629] text-[#D4AF37] font-semibold font-montserrat">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {workshop.attendedSessions} {workshop.attendedSessions === 1 ? 'sesión asistida' : 'sesiones asistidas'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center space-y-2">
              <CalendarCheck className="w-8 h-8 text-[#99907c] mx-auto" />
              <p className="text-sm font-medium text-white font-montserrat">
                Sin asistencias presenciales registradas
              </p>
              <p className="text-xs text-[#99907c] max-w-md mx-auto leading-relaxed">
                Tu formador registrará la asistencia oficial durante las clases prácticas. Las sesiones presenciales se reflejarán automáticamente en esta bitácora.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 4. MODAL INTERACTIVO: AULA DEL CURSO, ENTREGAS Y RÚBRICAS */}
      {selectedCourseForClassroom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#17171a] border border-[#262629] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-[#262629] bg-[#1b1b1f] flex items-center justify-between shrink-0">
              <div className="pr-4 min-w-0">
                <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#D4AF37] font-semibold">
                  Aula Formativa & Rúbricas
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat truncate mt-0.5">
                  {selectedCourseForClassroom.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedCourseForClassroom(null)}
                className="text-[#99907c] hover:text-white p-2 rounded-xl bg-[#262629] transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              
              {/* Notificación de envío */}
              {submissionSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl text-xs sm:text-sm flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>¡Tu entrega ha sido enviada con éxito! Tu docente ({selectedCourseForClassroom.instructor}) revisará el avance en la rúbrica del curso.</span>
                </div>
              )}

              {/* Rúbrica y estado del proyecto del curso */}
              <div className="bg-[#1b1b1f] border border-[#262629] rounded-xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-white font-montserrat flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    Módulo Activo: {selectedCourseForClassroom.currentModule}
                  </h3>
                  <span className="text-[10px] uppercase font-montserrat font-bold px-2 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                    {selectedCourseForClassroom.modalityBadge}
                  </span>
                </div>
                <p className="text-xs text-[#d0c5af] leading-relaxed">
                  Espacio pedagógico para la carga de bitácoras de trabajo, evidencias de talleres y proyectos de fin de ciclo para su evaluación y retroalimentación docente.
                </p>

                <div className="mt-3 pt-3 border-t border-[#262629] flex items-center justify-between text-xs text-[#99907c]">
                  <span>Docente Formador: <strong className="text-white">{selectedCourseForClassroom.instructor}</strong></span>
                  <span className="text-[#D4AF37] font-semibold">{selectedCourseForClassroom.statusNote}</span>
                </div>
              </div>

              {/* Zona de Subida de Archivos */}
              <div className="border-2 border-dashed border-[#262629] hover:border-[#D4AF37]/50 transition-colors rounded-2xl p-6 text-center space-y-3 bg-[#17171a]/40">
                <div className="w-12 h-12 rounded-full bg-[#1b1b1f] border border-[#262629] flex items-center justify-center text-[#D4AF37] mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white font-montserrat">
                    Cargar Entrega de Proyecto o Fotografía de Taller
                  </h4>
                  <p className="text-xs text-[#99907c] mt-1">
                    Formatos soportados: PDF, JPG, PNG o archivo ZIP (Máx. 25MB)
                  </p>
                </div>
                <input
                  type="file"
                  id="student-file-upload"
                  className="hidden"
                  onChange={() => setSubmissionSuccess(true)}
                />
                <label
                  htmlFor="student-file-upload"
                  className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#F5D77A] text-[#0A0A0E] px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider font-montserrat transition-all cursor-pointer shadow-sm"
                >
                  Seleccionar Archivo de mi Dispositivo
                </label>
              </div>

              {/* Acceso a pantalla completa de Entrega de Actividades */}
              <div className="p-4 rounded-xl bg-[#131317] border border-[#262629] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-white font-montserrat">
                    Aula Virtual Completa: Módulos y Actividades
                  </p>
                  <p className="text-[11px] text-[#99907c]">
                    Consulta todas las actividades evaluativas, rúbricas y materiales didácticos del curso
                  </p>
                </div>
                <Link
                  href={`/portal/cursos/${selectedCourseForClassroom.courseId}`}
                  className="inline-flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#F5D77A] text-[#0A0A0E] px-4 py-2.5 rounded-xl font-montserrat text-xs font-bold uppercase tracking-wider transition-all shrink-0 shadow-sm"
                >
                  <span>Ver Todas las Actividades</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-[#262629] bg-[#1b1b1f] flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSelectedCourseForClassroom(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider font-montserrat text-[#d0c5af] hover:bg-[#262629] transition-colors cursor-pointer"
              >
                Cerrar Aula
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL INTERACTIVO: GUÍAS Y MATERIALES PDF */}
      {selectedCourseForMaterials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#17171a] border border-[#262629] rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-[#262629] bg-[#1b1b1f] flex items-center justify-between shrink-0">
              <div className="pr-4 min-w-0">
                <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#D4AF37] font-semibold">
                  Material Didáctico Oficial
                </span>
                <h2 className="text-lg font-bold text-white font-montserrat truncate mt-0.5">
                  {selectedCourseForMaterials.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedCourseForMaterials(null)}
                className="text-[#99907c] hover:text-white p-2 rounded-xl bg-[#262629] transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              <div className="bg-[#1b1b1f] border border-[#262629] rounded-2xl p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#262629] flex items-center justify-center text-[#D4AF37] mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-white font-montserrat">
                  Guías Pedagógicas y Material de Apoyo
                </h3>
                <p className="text-xs text-[#99907c] max-w-md mx-auto leading-relaxed">
                  Las guías metodológicas y lecturas en PDF para este taller son suministradas progresivamente por el docente formador (<strong className="text-white">{selectedCourseForMaterials.instructor}</strong>) conforme avanzan los encuentros formativos.
                </p>
              </div>

              <div className="bg-[#17171a] border border-[#262629] rounded-xl p-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-[#d0c5af]">Horario de clase: <strong className="text-white">{selectedCourseForMaterials.schedule}</strong></span>
                </div>
                <span className="text-[10px] uppercase font-montserrat font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded">
                  {selectedCourseForMaterials.modalityBadge}
                </span>
              </div>
            </div>

            <div className="p-4 border-t border-[#262629] bg-[#1b1b1f] flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSelectedCourseForMaterials(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider font-montserrat text-[#d0c5af] hover:bg-[#262629] transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
