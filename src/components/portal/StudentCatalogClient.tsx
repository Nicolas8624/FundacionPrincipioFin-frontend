'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Search, 
  Clock, 
  MapPin, 
  GraduationCap, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Gift, 
  Users, 
  X, 
  AlertCircle,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Filter
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

export interface CatalogCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  modality: 'presencial' | 'virtual' | 'hibrido';
  status: string;
  capacity: number;
  schedule_text: string;
  location: string;
  instructor_name: string;
  cohort?: string;
  total_sessions?: number;
  image_url?: string;
  category_id?: string;
  category?: {
    name: string;
    slug: string;
    accent_color?: string;
  };
  enrolledCount: number;
}

interface StudentCatalogClientProps {
  initialCourses: CatalogCourse[];
  categories: { id: string; name: string; slug: string }[];
  userEnrolledCourseIds?: string[];
  confirmedCourseIds?: string[];
  pendingCourseIds?: string[];
  currentUser: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    documentType?: string;
    documentNumber?: string;
  };
}

export function StudentCatalogClient({
  initialCourses,
  categories,
  userEnrolledCourseIds = [],
  confirmedCourseIds,
  pendingCourseIds = [],
  currentUser,
}: StudentCatalogClientProps) {
  // Estados de Filtros y Búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedModality, setSelectedModality] = useState('all');
  const [selectedSchedule, setSelectedSchedule] = useState('all');
  const [activeChip, setActiveChip] = useState<string | null>('cupos');

  // Paginación (Requerimiento explícito del usuario)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Estados de Modales
  const [enrollingCourse, setEnrollingCourse] = useState<CatalogCourse | null>(null);
  const [detailsCourse, setDetailsCourse] = useState<CatalogCourse | null>(null);
  
  // Estado de Inscripción Formulario
  const [cupoType, setCupoType] = useState('Cupo Regular');
  const [motivation, setMotivation] = useState('');
  const [documentType, setDocumentType] = useState(currentUser.documentType || 'CC');
  const [documentNumber, setDocumentNumber] = useState(currentUser.documentNumber || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [acceptPolicy, setAcceptPolicy] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Listas locales: Cursos matriculados formalmente vs Solicitudes pendientes
  const [confirmedIds, setConfirmedIds] = useState<string[]>(
    confirmedCourseIds || userEnrolledCourseIds
  );
  const [pendingIds, setPendingIds] = useState<string[]>(pendingCourseIds);

  // Filtrado de Cursos
  const filteredCourses = useMemo(() => {
    return initialCourses.filter((course) => {
      // 1. Búsqueda por texto (título, descripción, formador, oficio)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = course.title.toLowerCase().includes(query);
        const matchesDesc = course.description?.toLowerCase().includes(query);
        const matchesInstructor = course.instructor_name?.toLowerCase().includes(query);
        const matchesLocation = course.location?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesInstructor && !matchesLocation) {
          return false;
        }
      }

      // 2. Filtro por Área / Categoría
      if (selectedArea !== 'all') {
        const courseCatName = course.category?.name?.toLowerCase() || '';
        const courseCatId = course.category_id || '';
        if (courseCatId !== selectedArea && !courseCatName.includes(selectedArea.toLowerCase())) {
          return false;
        }
      }

      // 3. Filtro por Modalidad
      if (selectedModality !== 'all') {
        if (course.modality !== selectedModality) {
          return false;
        }
      }

      // 4. Filtro por Horario & Jornada
      if (selectedSchedule !== 'all') {
        const schedule = course.schedule_text.toLowerCase();
        if (selectedSchedule === 'manana' && !schedule.includes('am') && !schedule.includes('mañana')) {
          return false;
        }
        if (selectedSchedule === 'tarde' && !schedule.includes('pm') && !schedule.includes('tarde')) {
          return false;
        }
        if (selectedSchedule === 'sabados' && !schedule.includes('sábado') && !schedule.includes('sabado')) {
          return false;
        }
      }

      // 5. Chips rápidos
      if (activeChip === 'cupos') {
        const availableSeats = course.capacity - course.enrolledCount;
        if (availableSeats <= 0) return false;
      } else if (activeChip === 'central') {
        if (!course.location.toLowerCase().includes('central')) return false;
      } else if (activeChip === 'suba') {
        if (!course.location.toLowerCase().includes('suba')) return false;
      } else if (activeChip === 'bosa') {
        if (!course.location.toLowerCase().includes('bosa') && !course.location.toLowerCase().includes('kennedy')) return false;
      }

      return true;
    });
  }, [initialCourses, searchQuery, selectedArea, selectedModality, selectedSchedule, activeChip]);

  // Cálculos de Paginación
  const totalCourses = filteredCourses.length;
  const totalPages = Math.ceil(totalCourses / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalCourses);
  const currentCourses = filteredCourses.slice(startIndex, endIndex);

  // Manejar cambio de página
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  // Enviar Inscripción
  const handleConfirmEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollingCourse) return;

    if (!acceptPolicy) {
      setSubmitError('Debes aceptar la política de asistencia institucional.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error: insertError } = await supabase
        .from('course_enrollments')
        .insert([
          {
            course_id: enrollingCourse.id,
            user_id: currentUser.id,
            full_name: currentUser.fullName,
            email: currentUser.email,
            document_type: documentType,
            document_number: documentNumber.trim() || null,
            phone: phone.trim() || null,
            cupo_type: cupoType,
            motivation: motivation.trim() || null,
            status: 'pendiente',
            accepted_data_policy: true,
            attended_sessions: 0,
            has_certificate: false
          }
        ]);

      if (insertError) {
        console.error('Error al matricularse:', insertError);
        setSubmitError(insertError.message || 'Error al procesar la inscripción.');
        setIsSubmitting(false);
      } else {
        setPendingIds((prev) => [...prev, enrollingCourse.id]);
        setSubmitSuccess(true);
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || 'Error inesperado al conectar con el servidor.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 pb-16">
      
      {/* 1. Encabezado de la Sección */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
          <span className="text-[11px] font-montserrat uppercase tracking-[0.2em] font-semibold text-[#D4AF37]">
            Convocatorias Ciclo 2026 / Fundación Principio & Fin
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-montserrat tracking-tight text-white leading-tight">
          Catálogo de Talleres y Convocatorias Abiertas
        </h1>

        <p className="text-[#d0c5af] text-xs sm:text-sm max-w-3xl leading-relaxed">
          Explora los cursos formativos, talleres comunitarios y programas de emprendimiento disponibles para el ciclo 2026. Inscríbete en línea o postúlate a una beca comunitaria con respaldo social y técnico garantizado.
        </p>
      </section>

      {/* 2. Barra de Búsqueda y Filtros Principales */}
      <section className="bg-[#17171a] border border-[#262629] rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4">
        
        {/* Controles de Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-center">
          
          {/* Input de Búsqueda */}
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 text-[#99907c] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar por nombre de taller, técnica, oficio..."
              className="w-full bg-[#1b1b1f] border border-[#262629] focus:border-[#D4AF37] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#99907c] outline-none transition-colors font-montserrat"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#99907c] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Select: Áreas / Categorías */}
          <div className="lg:col-span-3">
            <select
              value={selectedArea}
              onChange={(e) => {
                setSelectedArea(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#1b1b1f] border border-[#262629] focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 text-xs text-[#d0c5af] outline-none transition-colors font-montserrat cursor-pointer"
            >
              <option value="all">Todas las Áreas</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Select: Modalidad */}
          <div className="lg:col-span-2">
            <select
              value={selectedModality}
              onChange={(e) => {
                setSelectedModality(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#1b1b1f] border border-[#262629] focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 text-xs text-[#d0c5af] outline-none transition-colors font-montserrat cursor-pointer"
            >
              <option value="all">Cualquier Mod.</option>
              <option value="presencial">Presencial</option>
              <option value="virtual">Virtual</option>
              <option value="hibrido">Híbrido</option>
            </select>
          </div>

          {/* Select: Horario & Jornada */}
          <div className="lg:col-span-2">
            <select
              value={selectedSchedule}
              onChange={(e) => {
                setSelectedSchedule(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#1b1b1f] border border-[#262629] focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 text-xs text-[#d0c5af] outline-none transition-colors font-montserrat cursor-pointer"
            >
              <option value="all">Horario & Jornada</option>
              <option value="manana">Jornada Mañana</option>
              <option value="tarde">Jornada Tarde</option>
              <option value="sabados">Sábados / Intensivo</option>
            </select>
          </div>

        </div>

        {/* Chips Rápidos de Filtrado */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pt-2">
          <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#99907c] shrink-0 font-semibold mr-1">
            Filtros Rápidos:
          </span>

          <button
            onClick={() => {
              setActiveChip(activeChip === 'cupos' ? null : 'cupos');
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-full text-[11px] font-montserrat font-semibold transition-all shrink-0 cursor-pointer ${
              activeChip === 'cupos'
                ? 'bg-[#D4AF37] text-[#0A0A0E] shadow-sm font-bold'
                : 'bg-[#1b1b1f] border border-[#262629] text-[#d0c5af] hover:text-white hover:border-[#D4AF37]/40'
            }`}
          >
            ✓ Cupos Disponibles
          </button>

          <button
            onClick={() => {
              setActiveChip(activeChip === 'certificacion' ? null : 'certificacion');
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-full text-[11px] font-montserrat font-semibold transition-all shrink-0 cursor-pointer ${
              activeChip === 'certificacion'
                ? 'bg-[#D4AF37] text-[#0A0A0E] shadow-sm font-bold'
                : 'bg-[#1b1b1f] border border-[#262629] text-[#d0c5af] hover:text-white hover:border-[#D4AF37]/40'
            }`}
          >
            Certificación Oficial
          </button>

          <button
            onClick={() => {
              setActiveChip(activeChip === 'central' ? null : 'central');
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-full text-[11px] font-montserrat font-semibold transition-all shrink-0 cursor-pointer ${
              activeChip === 'central'
                ? 'bg-[#D4AF37] text-[#0A0A0E] shadow-sm font-bold'
                : 'bg-[#1b1b1f] border border-[#262629] text-[#d0c5af] hover:text-white hover:border-[#D4AF37]/40'
            }`}
          >
            Sede Central Bogotá
          </button>

          <button
            onClick={() => {
              setActiveChip(activeChip === 'suba' ? null : 'suba');
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-full text-[11px] font-montserrat font-semibold transition-all shrink-0 cursor-pointer ${
              activeChip === 'suba'
                ? 'bg-[#D4AF37] text-[#0A0A0E] shadow-sm font-bold'
                : 'bg-[#1b1b1f] border border-[#262629] text-[#d0c5af] hover:text-white hover:border-[#D4AF37]/40'
            }`}
          >
            Suba & Norte
          </button>

          <button
            onClick={() => {
              setActiveChip(activeChip === 'bosa' ? null : 'bosa');
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-full text-[11px] font-montserrat font-semibold transition-all shrink-0 cursor-pointer ${
              activeChip === 'bosa'
                ? 'bg-[#D4AF37] text-[#0A0A0E] shadow-sm font-bold'
                : 'bg-[#1b1b1f] border border-[#262629] text-[#d0c5af] hover:text-white hover:border-[#D4AF37]/40'
            }`}
          >
            Bosa & Kennedy
          </button>
        </div>

      </section>

      {/* 3. Cabecera de Resultados */}
      <section className="flex items-center justify-between border-b border-[#262629] pb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white font-montserrat text-sm sm:text-base">
            Talleres Disponibles
          </span>
          <span className="text-[#99907c]">•</span>
          <span className="text-[#D4AF37] font-bold font-montserrat uppercase tracking-wider">
            {totalCourses} Convocatorias
          </span>
        </div>

        <span className="text-[10px] text-[#99907c] font-montserrat uppercase tracking-wider">
          Actualizado Hoy • Ciclo Activo
        </span>
      </section>

      {/* 4. Rejilla de Cursos */}
      <section>
        {currentCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {currentCourses.map((course) => {
              const isConfirmed = confirmedIds.includes(course.id);
              const isPending = pendingIds.includes(course.id);
              const availableSeats = Math.max(0, course.capacity - course.enrolledCount);
              const fillPercent = Math.min(100, Math.round((course.enrolledCount / course.capacity) * 100));
              const categoryBadge = course.category?.name?.toUpperCase() || 'ARTE & OFICIOS';

              return (
                <div
                  key={course.id}
                  className="bg-[#17171a] border border-[#262629] hover:border-[#D4AF37]/40 rounded-2xl flex flex-col justify-between shadow-2xl transition-all group overflow-hidden"
                >
                  <div>
                    {/* Imagen de Portada con Overlays de Cupos */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#1b1b1f]">
                      {course.image_url ? (
                        <Image
                          src={course.image_url}
                          alt={course.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1b1b1f] via-[#222227] to-[#17171a] p-4 text-center">
                          <BookOpen className="w-10 h-10 text-[#D4AF37]/50 mb-2" />
                          <span className="text-xs font-montserrat font-bold text-white line-clamp-1">
                            {course.title}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/60 pointer-events-none"></div>

                      {/* Badge Superior: Categoría + Cupos Libres */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                        <span className="px-2.5 py-1 rounded-md bg-[#0A0A0E]/80 backdrop-blur-md border border-[#D4AF37]/40 text-[9px] font-montserrat uppercase tracking-wider font-bold text-[#D4AF37]">
                          {categoryBadge} • {availableSeats > 0 ? `${availableSeats} CUPOS LIBRES` : 'AGOTADO'}
                        </span>
                        {course.cohort && (
                          <span className="px-2 py-0.5 rounded bg-black/60 text-[9px] font-montserrat text-[#d0c5af] border border-[#38383c]">
                            {course.cohort}
                          </span>
                        )}
                      </div>

                      {/* Barra Inferior sobre la imagen: Progreso de Matrícula */}
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-montserrat font-medium text-white">
                        <span>
                          Matrícula: <strong className="text-[#F5D77A]">{course.enrolledCount}</strong> / {course.capacity}
                        </span>
                        <span className="text-[#D4AF37] font-bold">
                          {fillPercent}% Lleno
                        </span>
                      </div>
                    </div>

                    {/* Contenido del Taller */}
                    <div className="p-5 space-y-3.5">
                      <h3 className="text-lg font-bold text-white font-montserrat leading-snug group-hover:text-[#D4AF37] transition-colors line-clamp-2">
                        {course.title}
                      </h3>

                      <p className="text-xs text-[#99907c] leading-relaxed line-clamp-2">
                        {course.description}
                      </p>

                      {/* Detalles Clave */}
                      <div className="space-y-2 text-xs text-[#d0c5af] pt-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                          <span className="truncate">{course.schedule_text}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                          <span className="truncate">{course.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                          <span className="truncate">
                            {course.total_sessions ? `${course.total_sessions} sesiones • ` : ''}
                            {course.instructor_name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botones de Acción */}
                  <div className="p-5 pt-0 space-y-2">
                    {isConfirmed ? (
                      <Link
                        href="/portal/cursos"
                        className="w-full flex items-center justify-center gap-2 bg-[#1b1b1f] border border-emerald-500/40 text-emerald-400 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider font-montserrat transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Ya estás Matriculado</span>
                      </Link>
                    ) : isPending ? (
                      <Link
                        href="/portal/cursos?tab=pendientes"
                        className="w-full flex items-center justify-center gap-2 bg-[#262013] border border-[#D4AF37]/50 text-[#F5D77A] py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider font-montserrat transition-all hover:bg-[#332b1a]"
                      >
                        <Clock className="w-4 h-4 text-[#D4AF37] animate-pulse" />
                        <span>Solicitud en Revisión</span>
                      </Link>
                    ) : availableSeats > 0 ? (
                      <button
                        onClick={() => {
                          setEnrollingCourse(course);
                          setCupoType('Cupo Regular');
                          setSubmitSuccess(false);
                          setSubmitError(null);
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#F5D77A] text-[#0A0A0E] py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider font-montserrat transition-all shadow-md cursor-pointer"
                      >
                        <span>Inscribirme a este Taller</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setEnrollingCourse(course);
                          setCupoType('Lista de Espera');
                          setSubmitSuccess(false);
                          setSubmitError(null);
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-[#262629] text-[#99907c] hover:text-white py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider font-montserrat transition-all cursor-pointer"
                      >
                        <span>Lista de Espera</span>
                      </button>
                    )}

                    <button
                      onClick={() => setDetailsCourse(course)}
                      className="w-full text-center text-[11px] font-montserrat uppercase tracking-wider text-[#99907c] hover:text-[#D4AF37] transition-colors py-1 cursor-pointer"
                    >
                      Ver Programa y Requisitos
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-12 text-center max-w-xl mx-auto shadow-xl space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#1b1b1f] border border-[#262629] flex items-center justify-center text-[#99907c] mx-auto">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white font-montserrat">
              No se encontraron talleres con esos filtros
            </h3>
            <p className="text-xs text-[#99907c] leading-relaxed">
              Prueba cambiando los términos de búsqueda o restableciendo los filtros de área y modalidad.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedArea('all');
                setSelectedModality('all');
                setSelectedSchedule('all');
                setActiveChip(null);
                setCurrentPage(1);
              }}
              className="inline-flex items-center gap-2 bg-[#1b1b1f] hover:bg-[#262629] border border-[#262629] text-white px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider font-montserrat transition-all cursor-pointer"
            >
              Restablecer Filtros
            </button>
          </div>
        )}
      </section>

      {/* 5. Controles de Paginación (Requerimiento explícito) */}
      {totalPages > 1 && (
        <section className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#262629]">
          <span className="text-xs text-[#99907c] font-montserrat">
            Mostrando <strong className="text-white">{startIndex + 1}</strong> a <strong className="text-white">{endIndex}</strong> de <strong className="text-[#D4AF37]">{totalCourses}</strong> talleres formativos
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-xl text-xs font-semibold font-montserrat transition-all cursor-pointer flex items-center gap-1 ${
                currentPage === 1
                  ? 'bg-[#17171a] text-[#555] border border-[#262629] cursor-not-allowed opacity-50'
                  : 'bg-[#1b1b1f] hover:bg-[#262629] border border-[#262629] text-white'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Anterior</span>
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              const isActive = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold font-montserrat transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#D4AF37] text-[#0A0A0E] shadow-md shadow-[#D4AF37]/20'
                      : 'bg-[#17171a] border border-[#262629] text-[#d0c5af] hover:text-white hover:border-[#D4AF37]/40'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-xl text-xs font-semibold font-montserrat transition-all cursor-pointer flex items-center gap-1 ${
                currentPage === totalPages
                  ? 'bg-[#17171a] text-[#555] border border-[#262629] cursor-not-allowed opacity-50'
                  : 'bg-[#1b1b1f] hover:bg-[#262629] border border-[#262629] text-white'
              }`}
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* 6. Bloque Informativo Inferior: Tu camino hacia un nuevo oficio en tres pasos (Fiel al Diseño) */}
      <section className="bg-[#17171a] border border-[#262629] rounded-2xl p-6 sm:p-8 md:p-10 shadow-2xl space-y-8">
        <div>
          <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#D4AF37] font-semibold mb-1.5">
            Paso a Paso Transparente / ¿Cómo funciona el proceso de inscripción?
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold font-montserrat text-white tracking-tight">
            Tu camino hacia un nuevo oficio en tres pasos sencillos
          </h2>
          <p className="text-xs sm:text-sm text-[#99907c] mt-2 max-w-2xl leading-relaxed">
            Completar tu postulación toma menos de 3 minutos. Tu cupo se reserva de inmediato bajo validación de cupos y requisitos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Paso 1 */}
          <div className="bg-[#1b1b1f] border border-[#262629] rounded-2xl p-6 flex flex-col justify-between space-y-6 hover:border-[#D4AF37]/30 transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-full bg-[#D4AF37] text-[#0A0A0E] flex items-center justify-center font-bold font-montserrat text-sm shadow-md">
                  1
                </span>
                <Search className="w-5 h-5 text-[#99907c]" />
              </div>

              <h3 className="text-lg font-bold text-white font-montserrat">
                Selecciona tu taller
              </h3>

              <p className="text-xs text-[#99907c] leading-relaxed">
                Escoge el oficio o técnica deseada, revisa la sede geográfica y confirma la disponibilidad de cupos en tiempo real.
              </p>
            </div>

            <div className="pt-4 border-t border-[#262629] flex items-center gap-2 text-[11px] text-[#D4AF37] font-montserrat font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Sin costo de matrícula</span>
            </div>
          </div>

          {/* Paso 2 */}
          <div className="bg-[#1b1b1f] border border-[#262629] rounded-2xl p-6 flex flex-col justify-between space-y-6 hover:border-[#D4AF37]/30 transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-full bg-[#D4AF37] text-[#0A0A0E] flex items-center justify-center font-bold font-montserrat text-sm shadow-md">
                  2
                </span>
                <Users className="w-5 h-5 text-[#99907c]" />
              </div>

              <h3 className="text-lg font-bold text-white font-montserrat">
                Confirma tus datos
              </h3>

              <p className="text-xs text-[#99907c] leading-relaxed">
                Tu información registrada en el portal se autocompleta. Indica si aplicas a convenio PH o beca comunitaria.
              </p>
            </div>

            <div className="pt-4 border-t border-[#262629] flex items-center gap-2 text-[11px] text-[#D4AF37] font-montserrat font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Validación segura y rápida</span>
            </div>
          </div>

          {/* Paso 3 */}
          <div className="bg-[#1b1b1f] border border-[#262629] rounded-2xl p-6 flex flex-col justify-between space-y-6 hover:border-[#D4AF37]/30 transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-full bg-[#D4AF37] text-[#0A0A0E] flex items-center justify-center font-bold font-montserrat text-sm shadow-md">
                  3
                </span>
                <Gift className="w-5 h-5 text-[#99907c]" />
              </div>

              <h3 className="text-lg font-bold text-white font-montserrat">
                Recibe tu confirmación
              </h3>

              <p className="text-xs text-[#99907c] leading-relaxed">
                Llegará de forma inmediata la carta de aceptación, el cronograma detallado y el enlace del grupo a tu correo electrónico.
              </p>
            </div>

            <div className="pt-4 border-t border-[#262629] flex items-center gap-2 text-[11px] text-[#D4AF37] font-montserrat font-medium">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Kit de bienvenida incluido</span>
            </div>
          </div>

        </div>
      </section>

      {/* 7. MODAL DE INSCRIPCIÓN OFICIAL */}
      {enrollingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#17171a] border border-[#262629] rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
            
            {/* Header del Modal */}
            <div className="p-5 sm:p-6 border-b border-[#262629] bg-[#1b1b1f] flex items-center justify-between shrink-0">
              <div className="pr-4 min-w-0">
                <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#D4AF37] font-semibold">
                  Postulación a Convocatoria
                </span>
                <h2 className="text-lg font-bold text-white font-montserrat truncate mt-0.5">
                  {enrollingCourse.title}
                </h2>
              </div>
              <button
                onClick={() => setEnrollingCourse(null)}
                className="text-[#99907c] hover:text-white p-2 rounded-xl bg-[#262629] transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body del Modal */}
            <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
              
              {submitSuccess ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center mx-auto shadow-lg">
                    <Clock className="w-8 h-8 animate-pulse text-[#D4AF37]" />
                  </div>
                  <h3 className="text-xl font-bold text-white font-montserrat">
                    ¡Solicitud de Inscripción Radicada!
                  </h3>
                  <p className="text-xs text-[#d0c5af] max-w-md mx-auto leading-relaxed">
                    Tu postulación para <strong>{enrollingCourse.title}</strong> ha sido radicada correctamente con estado <strong>Pendiente de Revisión</strong>. La coordinación académica confirmará la disponibilidad de cupo y te notificará una vez sea aprobada.
                  </p>
                  <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                      href="/portal/cursos?tab=pendientes"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#F5D77A] text-[#0A0A0E] px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider font-montserrat transition-all"
                    >
                      <span>Ver Mis Solicitudes</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setEnrollingCourse(null)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider font-montserrat text-[#d0c5af] hover:bg-[#262629] transition-colors cursor-pointer"
                    >
                      Seguir explorando
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleConfirmEnrollment} className="space-y-4">
                  
                  {/* Resumen del Taller */}
                  <div className="bg-[#1b1b1f] border border-[#262629] rounded-xl p-4 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[#99907c]">
                      <span>Sede: <strong className="text-white">{enrollingCourse.location}</strong></span>
                      <span className="text-[#D4AF37] font-semibold">{enrollingCourse.schedule_text}</span>
                    </div>
                    <div className="text-[#99907c]">
                      Docente: <strong className="text-white">{enrollingCourse.instructor_name}</strong>
                    </div>
                  </div>

                  {/* Aviso informativo de proceso de validación */}
                  <div className="bg-[#1b1b1f] border border-[#262629] rounded-xl p-3.5 flex items-start gap-3 text-xs text-[#99907c]">
                    <Clock className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Esta solicitud será revisada por la coordinación académica para validar disponibilidad de cupo institucional. Una vez aprobada tu matrícula, se habilitará tu acceso al aula virtual.
                    </p>
                  </div>

                  {submitError && (
                    <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 p-3.5 rounded-xl text-xs flex items-center gap-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Datos Autocompletados del Usuario */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-[11px] font-montserrat uppercase tracking-wider text-[#99907c] font-semibold block mb-1">
                        Estudiante
                      </label>
                      <input
                        type="text"
                        value={currentUser.fullName}
                        disabled
                        className="w-full bg-[#1b1b1f] border border-[#262629] rounded-xl px-3.5 py-2 text-xs text-[#d0c5af] font-montserrat opacity-80 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-montserrat uppercase tracking-wider text-[#99907c] font-semibold block mb-1">
                        Correo de Confirmación
                      </label>
                      <input
                        type="email"
                        value={currentUser.email}
                        disabled
                        className="w-full bg-[#1b1b1f] border border-[#262629] rounded-xl px-3.5 py-2 text-xs text-[#d0c5af] font-montserrat opacity-80 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="text-[11px] font-montserrat uppercase tracking-wider text-[#99907c] font-semibold block mb-1">
                        Tipo Documento
                      </label>
                      <select
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        className="w-full bg-[#1b1b1f] border border-[#262629] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-white outline-none font-montserrat"
                      >
                        <option value="CC">C.C.</option>
                        <option value="TI">T.I.</option>
                        <option value="CE">C.E.</option>
                        <option value="PPT">PPT</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-montserrat uppercase tracking-wider text-[#99907c] font-semibold block mb-1">
                        Número de Documento
                      </label>
                      <input
                        type="text"
                        required
                        value={documentNumber}
                        onChange={(e) => setDocumentNumber(e.target.value)}
                        placeholder="Ej. 1020304050"
                        className="w-full bg-[#1b1b1f] border border-[#262629] focus:border-[#D4AF37] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#99907c] outline-none font-montserrat"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-montserrat uppercase tracking-wider text-[#99907c] font-semibold block mb-1">
                      Teléfono de Contacto
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ej. 310 123 4567"
                      className="w-full bg-[#1b1b1f] border border-[#262629] focus:border-[#D4AF37] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#99907c] outline-none font-montserrat"
                    />
                  </div>

                  {/* Motivación Opcional */}
                  <div>
                    <label className="text-[11px] font-montserrat uppercase tracking-wider text-[#99907c] font-semibold block mb-1">
                      ¿Por qué deseas participar en este taller? (Opcional)
                    </label>
                    <textarea
                      rows={2}
                      value={motivation}
                      onChange={(e) => setMotivation(e.target.value)}
                      placeholder="Cuéntanos si deseas emprender, mejorar tus habilidades o integrarte en comunidad..."
                      className="w-full bg-[#1b1b1f] border border-[#262629] focus:border-[#D4AF37] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#99907c] outline-none font-montserrat resize-none"
                    />
                  </div>

                  {/* Checkbox Política */}
                  <label className="flex items-start gap-2.5 pt-1 text-xs text-[#d0c5af] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptPolicy}
                      onChange={(e) => setAcceptPolicy(e.target.checked)}
                      className="mt-0.5 rounded border-[#262629] text-[#D4AF37] focus:ring-[#D4AF37]"
                    />
                    <span>
                      Acepto el compromiso de asistencia mínima institucional (80%) y el reglamento de convivencia de la fundación.
                    </span>
                  </label>

                  <div className="pt-3 border-t border-[#262629] flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setEnrollingCourse(null)}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider font-montserrat text-[#99907c] hover:text-white transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#F5D77A] text-[#0A0A0E] px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider font-montserrat transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? 'Enviando Solicitud...' : 'Enviar Solicitud de Inscripción'}
                    </button>
                  </div>

                </form>
              )}

            </div>

          </div>
        </div>
      )}

      {/* 8. MODAL DE DETALLES Y PROGRAMA */}
      {detailsCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#17171a] border border-[#262629] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
            
            <div className="p-5 sm:p-6 border-b border-[#262629] bg-[#1b1b1f] flex items-center justify-between shrink-0">
              <div className="pr-4 min-w-0">
                <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#D4AF37] font-semibold">
                  Programa Académico Institucional
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat truncate mt-0.5">
                  {detailsCourse.title}
                </h2>
              </div>
              <button
                onClick={() => setDetailsCourse(null)}
                className="text-[#99907c] hover:text-white p-2 rounded-xl bg-[#262629] transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-[#262629] bg-[#1b1b1f]">
                {detailsCourse.image_url ? (
                  <Image
                    src={detailsCourse.image_url}
                    alt={detailsCourse.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1b1b1f] to-[#121215] text-[#99907c]">
                    <BookOpen className="w-12 h-12 text-[#D4AF37]/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4 pointer-events-none">
                  <span className="text-xs font-montserrat font-bold text-[#D4AF37] uppercase tracking-wider">
                    {detailsCourse.category?.name || 'Arte & Oficios'} • Modalidad {detailsCourse.modality.toUpperCase()}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white font-montserrat mb-1.5">
                  Descripción del Programa
                </h3>
                <p className="text-xs text-[#d0c5af] leading-relaxed">
                  {detailsCourse.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#1b1b1f] border border-[#262629] p-4 rounded-xl">
                <div>
                  <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#99907c] font-semibold block">
                    Horario de Clase
                  </span>
                  <p className="text-white font-medium mt-0.5">{detailsCourse.schedule_text}</p>
                </div>
                <div>
                  <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#99907c] font-semibold block">
                    Sede Oficial
                  </span>
                  <p className="text-white font-medium mt-0.5">{detailsCourse.location}</p>
                </div>
                <div>
                  <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#99907c] font-semibold block">
                    Docente Formador
                  </span>
                  <p className="text-white font-medium mt-0.5">{detailsCourse.instructor_name}</p>
                </div>
                <div>
                  <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#99907c] font-semibold block">
                    Intensidad
                  </span>
                  <p className="text-white font-medium mt-0.5">
                    {detailsCourse.total_sessions ? `${detailsCourse.total_sessions} sesiones formativas` : 'Ciclo semestral'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white font-montserrat uppercase tracking-wider">
                  Requisitos de Participación
                </h4>
                <ul className="text-xs text-[#99907c] space-y-1 list-disc pl-4">
                  <li>Documento de identidad vigente (C.C., T.I., C.E. o PPT).</li>
                  <li>Disponibilidad horaria para cumplir con el 80% mínimo de asistencia.</li>
                  <li>Compromiso con el trabajo comunitario y cuidado de las herramientas del taller.</li>
                </ul>
              </div>
            </div>

            <div className="p-4 sm:p-5 border-t border-[#262629] bg-[#1b1b1f] flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setDetailsCourse(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider font-montserrat text-[#99907c] hover:text-white transition-colors cursor-pointer"
              >
                Cerrar
              </button>

              {confirmedIds.includes(detailsCourse.id) ? (
                <Link
                  href="/portal/cursos"
                  className="inline-flex items-center gap-2 bg-[#1b1b1f] border border-emerald-500/40 text-emerald-400 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider font-montserrat transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ya estás Matriculado</span>
                </Link>
              ) : pendingIds.includes(detailsCourse.id) ? (
                <Link
                  href="/portal/cursos?tab=pendientes"
                  className="inline-flex items-center gap-2 bg-[#262013] border border-[#D4AF37]/50 text-[#F5D77A] px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider font-montserrat transition-all"
                >
                  <Clock className="w-4 h-4 text-[#D4AF37] animate-pulse" />
                  <span>Solicitud en Revisión</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const toEnroll = detailsCourse;
                    setDetailsCourse(null);
                    setEnrollingCourse(toEnroll);
                    setCupoType('Cupo Regular');
                    setSubmitSuccess(false);
                    setSubmitError(null);
                  }}
                  className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#F5D77A] text-[#0A0A0E] px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider font-montserrat transition-all shadow-md cursor-pointer"
                >
                  <span>Postularme Ahora</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
