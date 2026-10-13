'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  Award, 
  TrendingUp, 
  Download, 
  UserPlus, 
  Search, 
  Filter, 
  RotateCcw, 
  CheckCircle2, 
  UserMinus, 
  ChevronLeft, 
  ChevronRight, 
  Building2, 
  Sparkles, 
  ExternalLink, 
  ShieldCheck, 
  Check, 
  Calendar,
  Layers,
  Edit3,
  FileText
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/services/supabase/client';
import { DirectEnrollmentModal } from './DirectEnrollmentModal';
import { StudentFormModal } from './StudentFormModal';
import { WithdrawalActModal } from './WithdrawalActModal';
import { DiplomaPreviewModal } from './DiplomaPreviewModal';
import { FormModal } from './FormModal';
import type {
  ClassroomCourse,
  ClassroomEnrollment,
  ClassroomSubmission,
  ClassroomAssignment
} from './types';
import {
  getInitials,
  formatDocument,
  formatDate,
  formatModality,
  attendancePercent,
  downloadCSV,
  slugify,
  CERT_MIN_GRADE,
  CERT_MIN_ATTENDANCE
} from './types';

interface CourseStudentsViewProps {
  course: ClassroomCourse;
  enrollments: ClassroomEnrollment[];
  submissions?: ClassroomSubmission[];
  assignments?: ClassroomAssignment[];
}

export function CourseStudentsView({
  course,
  enrollments,
  submissions = [],
  assignments = []
}: CourseStudentsViewProps) {
  const router = useRouter();

  // Active Tab: 'matriculados' | 'solicitudes' | 'inactivos'
  const [activeTab, setActiveTab] = useState<'matriculados' | 'solicitudes' | 'inactivos'>('matriculados');

  // Filters for Students Table
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cupoFilter, setCupoFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Local state mirrored from props (allows optimistic UI updates)
  const [localEnrollments, setLocalEnrollments] = useState<ClassroomEnrollment[]>(enrollments);

  useEffect(() => {
    setLocalEnrollments(enrollments);
  }, [enrollments]);

  // Modals state
  const [isDirectEnrollOpen, setIsDirectEnrollOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<ClassroomEnrollment | null>(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<ClassroomEnrollment | null>(null);
  const [selectedDiplomaEnrollment, setSelectedDiplomaEnrollment] = useState<ClassroomEnrollment | null>(null);
  const [withdrawingEnrollment, setWithdrawingEnrollment] = useState<ClassroomEnrollment | null>(null);
  const [attendanceEnrollment, setAttendanceEnrollment] = useState<ClassroomEnrollment | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Categorize enrollments strictly from real data
  const enrolledStudents = useMemo(() => {
    return localEnrollments.filter((e) => e.status === 'confirmada' || e.status === 'completada');
  }, [localEnrollments]);

  const applicantStudents = useMemo(() => {
    return localEnrollments.filter((e) => e.status === 'pendiente' || e.status === 'lista_espera');
  }, [localEnrollments]);

  const inactiveStudents = useMemo(() => {
    return localEnrollments.filter((e) => e.status === 'cancelada' || e.status === 'rechazada');
  }, [localEnrollments]);

  // Real KPIs calculations
  const totalEnrolled = enrolledStudents.length;
  const maxCapacity = course.capacity || 0;
  const availableSlots = maxCapacity > 0 ? Math.max(0, maxCapacity - totalEnrolled) : null;
  const occupancyPercent = maxCapacity > 0 ? Math.min(100, Math.round((totalEnrolled / maxCapacity) * 100)) : 0;
  const certifiedCount = enrolledStudents.filter((e) => e.has_certificate || e.status === 'completada').length;
  const inTrainingCount = enrolledStudents.filter((e) => !e.has_certificate && e.status !== 'completada').length;

  // Average attendance calculation
  const averageAttendanceStr = useMemo(() => {
    if (totalEnrolled === 0) return '—';
    const sum = enrolledStudents.reduce((acc, s) => acc + s.attended_sessions, 0);
    const avg = (sum / totalEnrolled).toFixed(1);
    return `${avg} ses. prom.`;
  }, [enrolledStudents, totalEnrolled]);

  // Filtered Students list
  const filteredStudents = useMemo(() => {
    return enrolledStudents.filter((st) => {
      const docStr = `${st.document_type || ''} ${st.document_number || ''}`.toLowerCase();
      const matchSearch =
        st.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        docStr.includes(searchTerm.toLowerCase()) ||
        (st.email || '').toLowerCase().includes(searchTerm.toLowerCase());

      const isCertified = st.has_certificate || st.status === 'completada';
      const isComplete =
        !isCertified &&
        st.average_grade !== null &&
        st.average_grade >= CERT_MIN_GRADE;

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'certificados' && isCertified) ||
        (statusFilter === 'completos' && isComplete) ||
        (statusFilter === 'formacion' && !isCertified && !isComplete);

      const matchCupo = cupoFilter === 'all' || (st.cupo_type || 'Cupo Regular') === cupoFilter;

      return matchSearch && matchStatus && matchCupo;
    });
  }, [enrolledStudents, searchTerm, statusFilter, cupoFilter]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ---------------------------------------------------------------------
  // Real Database Actions
  // ---------------------------------------------------------------------

  const handleApproveStudent = async (student: ClassroomEnrollment) => {
    const certCode = `FPF-${new Date().getFullYear()}-CERT-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();

    setLocalEnrollments((prev) =>
      prev.map((e) =>
        e.id === student.id
          ? {
              ...e,
              status: 'completada',
              has_certificate: true,
              certificate_code: certCode,
              certificate_issued_at: nowIso
            }
          : e
      )
    );

    try {
      const supabase = createBrowserClient();
      await supabase
        .from('course_enrollments')
        .update({
          status: 'completada',
          has_certificate: true,
          certificate_code: certCode,
          certificate_issued_at: nowIso
        })
        .eq('id', student.id);
      router.refresh();
    } catch (err) {
      console.warn('Actualización local realizada.');
    }

    showToast(`¡${student.full_name} ha sido certificado con éxito! Folio: ${certCode}`);
  };

  const handleWithdrawStudent = async (values: Record<string, string>) => {
    if (!withdrawingEnrollment) return;
    const student = withdrawingEnrollment;
    const reason = values.reason?.trim() || 'Solicitud propia de retiro';
    const nowIso = new Date().toISOString();

    setLocalEnrollments((prev) =>
      prev.map((e) =>
        e.id === student.id
          ? {
              ...e,
              status: 'cancelada',
              withdrawal_reason: reason,
              withdrawal_date: nowIso
            }
          : e
      )
    );

    try {
      const supabase = createBrowserClient();
      await supabase
        .from('course_enrollments')
        .update({
          status: 'cancelada',
          withdrawal_reason: reason,
          withdrawal_date: nowIso
        })
        .eq('id', student.id);
      router.refresh();
    } catch (err) {
      console.warn('Actualización en base de datos:', err);
    }

    showToast(`Estudiante ${student.full_name} transferido(a) a la lista de retiros.`);
  };

  const handleSaveAttendance = async (values: Record<string, string>) => {
    if (!attendanceEnrollment) return;
    const attendedNum = parseInt(values.attended_sessions, 10);
    if (isNaN(attendedNum) || attendedNum < 0) return 'El número de sesiones debe ser un entero positivo';

    setLocalEnrollments((prev) =>
      prev.map((e) => (e.id === attendanceEnrollment.id ? { ...e, attended_sessions: attendedNum } : e))
    );

    try {
      const supabase = createBrowserClient();
      await supabase
        .from('course_enrollments')
        .update({ attended_sessions: attendedNum })
        .eq('id', attendanceEnrollment.id);
      router.refresh();
    } catch (err) {
      console.warn('Actualización en base de datos:', err);
    }

    showToast(`Asistencia de ${attendanceEnrollment.full_name} actualizada a ${attendedNum} sesiones.`);
  };

  const handleAdmitApplicant = async (applicantName: string) => {
    const app = applicantStudents.find((a) => a.full_name === applicantName);
    if (!app) return;

    setLocalEnrollments((prev) =>
      prev.map((e) => (e.id === app.id ? { ...e, status: 'confirmada' } : e))
    );

    try {
      const supabase = createBrowserClient();
      await supabase
        .from('course_enrollments')
        .update({ status: 'confirmada' })
        .eq('id', app.id);
      router.refresh();
    } catch (err) {
      console.warn('Actualización en base de datos:', err);
    }

    showToast(`¡Solicitud aprobada! ${app.full_name} fue matriculado en la cohorte.`);
  };

  const handleRejectApplicant = async (applicantName: string) => {
    const app = applicantStudents.find((a) => a.full_name === applicantName);
    if (!app) return;

    setLocalEnrollments((prev) =>
      prev.map((e) => (e.id === app.id ? { ...e, status: 'rechazada' } : e))
    );

    try {
      const supabase = createBrowserClient();
      await supabase
        .from('course_enrollments')
        .update({ status: 'rechazada' })
        .eq('id', app.id);
      router.refresh();
    } catch (err) {
      console.warn('Actualización en base de datos:', err);
    }

    showToast(`La solicitud de ${applicantName} ha sido rechazada.`);
  };

  const handleDirectEnroll = (insertedData: any) => {
    if (insertedData?.id) {
      setLocalEnrollments((prev) => [insertedData, ...prev]);
    }
    showToast(`¡Estudiante matriculado(a) exitosamente!`);
    router.refresh();
  };

  const handleExportCSV = () => {
    if (enrolledStudents.length === 0) {
      showToast('No hay estudiantes matriculados para exportar.');
      return;
    }
    const headers = [
      'ID',
      'Nombre Completo',
      'Documento',
      'Correo',
      'Teléfono',
      'Tipo de Cupo',
      'Sesiones Asistidas',
      '% Asistencia',
      'Promedio',
      'Certificado',
      'Folio Certificado'
    ];
    const rows = enrolledStudents.map((s) => [
      s.id,
      s.full_name,
      formatDocument(s.document_type, s.document_number),
      s.email || '—',
      s.phone || '—',
      s.cupo_type || 'Cupo Regular',
      `${s.attended_sessions} sesiones`,
      s.average_grade !== null ? s.average_grade.toFixed(1) : 'Sin notas',
      s.has_certificate ? 'SÍ' : 'NO',
      s.certificate_code || '—'
    ]);
    downloadCSV(`estudiantes_${slugify(course.title)}.csv`, headers, rows);
    showToast('Listado exportado en CSV.');
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

      {/* Header Context & Action Badges */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-8 border-b border-[#262629]">
        <div className="space-y-3 max-w-4xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
            <span className="text-[11px] font-montserrat uppercase tracking-widest text-[#D4AF37] font-semibold">
              Gestión Académica • Datos en Tiempo Real
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-montserrat font-bold text-white tracking-tight">
            Estudiantes y Solicitudes
          </h1>
          <p className="text-sm text-[#99907c] max-w-3xl leading-relaxed">
            Gestiona los participantes matriculados en este curso, valida postulaciones de cupo, registra el avance de asistencia y expide acreditaciones con folio institucional único.
          </p>

          {/* Badges metadata */}
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
              <span>Docente: <strong className="text-white font-semibold">{course.instructor_name || 'Por asignar'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#ffe082] text-xs font-montserrat uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>
                Cupos:{' '}
                <strong className="text-[#D4AF37] font-bold">
                  {totalEnrolled}
                  {maxCapacity > 0 ? ` / ${maxCapacity}` : ''} Matriculados
                </strong>{' '}
                {availableSlots !== null && `(${availableSlots} disponibles)`}
              </span>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-lg bg-[#1b1b1f] hover:bg-[#262629] border border-[#262629] text-white transition-all text-xs font-montserrat uppercase tracking-wider flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4 text-[#D4AF37]" />
            <span>Descargar Lista</span>
          </button>
          <button 
            type="button"
            onClick={() => setIsDirectEnrollOpen(true)}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#f2ca50] text-[#0A0A0E] text-xs font-montserrat uppercase tracking-wider font-semibold flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Inscribir Estudiante Directo</span>
          </button>
        </div>
      </div>

      {/* 4 Bento KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Inscritos */}
        <div className="rounded-xl bg-[#131317] border border-[#262629] p-6 hover:border-[#D4AF37]/30 transition-all shadow-md flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-montserrat uppercase tracking-widest text-[#99907c]">Total Matriculados</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold font-montserrat text-white">{totalEnrolled}</span>
                <span className="text-xs text-[#D4AF37] font-medium font-montserrat">
                  {maxCapacity > 0 ? `/ ${maxCapacity} cupos` : 'cupos libres'}
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#1b1b1f] border border-[#262629] flex items-center justify-center text-[#D4AF37]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#262629] flex items-center justify-between">
            <span className="text-xs text-[#99907c]">Ocupación del cupo</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 rounded-full bg-[#262629] overflow-hidden">
                <div className="h-full bg-[#D4AF37] rounded-full" style={{ width: `${occupancyPercent}%` }}></div>
              </div>
              <span className="text-xs text-[#D4AF37] font-semibold">{occupancyPercent}%</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Solicitudes Pendientes */}
        <div className="rounded-xl bg-[#131317] border border-[#262629] p-6 hover:border-[#D4AF37]/30 transition-all shadow-md flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-montserrat uppercase tracking-widest text-[#99907c]">Solicitudes Pendientes</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold font-montserrat text-[#ffe082]">
                  {applicantStudents.length.toString().padStart(2, '0')}
                </span>
                <span className="text-xs text-[#99907c]">en revisión</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#262629]/70 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#262629] flex items-center justify-between text-xs">
            <span className="text-[#99907c]">Por admitir</span>
            <span className="inline-flex items-center gap-1 text-[#D4AF37] font-semibold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
              {applicantStudents.length > 0 ? 'Requieren acción' : 'Al día'}
            </span>
          </div>
        </div>

        {/* Metric 3: Aprobados / Certificados */}
        <div className="rounded-xl bg-[#131317] border border-[#262629] p-6 hover:border-[#D4AF37]/30 transition-all shadow-md flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-montserrat uppercase tracking-widest text-[#99907c]">Certificados Emitidos</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold font-montserrat text-white">{certifiedCount}</span>
                <span className="text-xs text-[#99907c]">estudiantes</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#1b1b1f] border border-[#262629] flex items-center justify-center text-[#D4AF37]">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#262629] flex items-center justify-between text-xs">
            <span className="text-[#99907c]">Acreditación formal</span>
            <span className="text-white font-semibold">
              {totalEnrolled ? Math.round((certifiedCount / totalEnrolled) * 100) : 0}% cohorte
            </span>
          </div>
        </div>

        {/* Metric 4: En Proceso Formativo */}
        <div className="rounded-xl bg-[#131317] border border-[#262629] p-6 hover:border-[#D4AF37]/30 transition-all shadow-md flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-montserrat uppercase tracking-widest text-[#99907c]">En Proceso Formativo</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold font-montserrat text-white">{inTrainingCount}</span>
                <span className="text-xs text-[#99907c]">cursando</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#1b1b1f] border border-[#262629] flex items-center justify-center text-[#e4e1e7]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#262629] flex items-center justify-between text-xs">
            <span className="text-[#99907c]">Asistencia</span>
            <span className="text-[#D4AF37] font-semibold">{averageAttendanceStr}</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#262629]">
        <div className="flex items-center gap-6 sm:gap-8">
          <button
            type="button"
            onClick={() => setActiveTab('matriculados')}
            className={`relative pb-4 font-montserrat text-sm sm:text-base font-semibold flex items-center gap-2.5 transition-colors ${
              activeTab === 'matriculados' ? 'text-[#D4AF37]' : 'text-[#99907c] hover:text-white'
            }`}
          >
            <span>Estudiantes Matriculados</span>
            <span className="px-2 py-0.5 rounded-full bg-[#D4AF37] text-[#0A0A0E] text-xs font-bold font-montserrat">
              {enrolledStudents.length}
            </span>
            {activeTab === 'matriculados' && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.6)]"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('solicitudes')}
            className={`relative pb-4 font-montserrat text-sm sm:text-base font-semibold flex items-center gap-2.5 transition-colors ${
              activeTab === 'solicitudes' ? 'text-[#D4AF37]' : 'text-[#99907c] hover:text-white'
            }`}
          >
            <span>Solicitudes de Ingreso</span>
            <span className="px-2 py-0.5 rounded-full bg-[#262629] text-[#ffe082] text-xs font-bold font-montserrat">
              {applicantStudents.length}
            </span>
            {activeTab === 'solicitudes' && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.6)]"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inactivos')}
            className={`relative pb-4 font-montserrat text-sm sm:text-base font-semibold flex items-center gap-2.5 transition-colors ${
              activeTab === 'inactivos' ? 'text-[#D4AF37]' : 'text-[#99907c] hover:text-white'
            }`}
          >
            <span>Retirados / Deserciones</span>
            <span className="px-2 py-0.5 rounded-full bg-[#262629] text-[#99907c] text-xs font-montserrat">
              {inactiveStudents.length}
            </span>
            {activeTab === 'inactivos' && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.6)]"></span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ESTUDIANTES MATRICULADOS */}
      {/* ========================================================================= */}
      {activeTab === 'matriculados' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="p-4 rounded-xl bg-[#131317] border border-[#262629] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-[#99907c] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Buscar por nombre, documento o correo..."
                className="w-full pl-11 pr-4 py-2.5 rounded-lg bg-[#1b1b1f] border border-[#262629] text-white placeholder:text-[#99907c]/50 text-sm focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-[#1b1b1f] border border-[#262629] px-3 py-2 rounded-lg">
                <Filter className="w-4 h-4 text-[#D4AF37]" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-white text-xs font-montserrat uppercase focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-[#1b1b1f]">Todos los estados</option>
                  <option value="certificados" className="bg-[#1b1b1f]">Aprobado / Certificado</option>
                  <option value="completos" className="bg-[#1b1b1f]">Requisitos Completos</option>
                  <option value="formacion" className="bg-[#1b1b1f]">En Formación</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-[#1b1b1f] border border-[#262629] px-3 py-2 rounded-lg">
                <Building2 className="w-4 h-4 text-[#D4AF37]" />
                <select
                  value={cupoFilter}
                  onChange={(e) => {
                    setCupoFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-white text-xs font-montserrat uppercase focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-[#1b1b1f]">Todos los cupos</option>
                  <option value="Cupo Regular" className="bg-[#1b1b1f]">Cupo Regular</option>
                  <option value="Beca Inclusión Artesanal" className="bg-[#1b1b1f]">Beca Inclusión Artesanal</option>
                  <option value="Convenio PH" className="bg-[#1b1b1f]">Convenio PH</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setCupoFilter('all');
                  setCurrentPage(1);
                }}
                className="p-2.5 rounded-lg bg-[#1b1b1f] border border-[#262629] hover:bg-[#262629] text-[#99907c] hover:text-white transition-colors"
                title="Restablecer filtros"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Students Table */}
          <div className="overflow-x-auto rounded-xl bg-[#131317] border border-[#262629] shadow-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1b1b1f]/80 text-[#99907c] text-[11px] font-montserrat uppercase tracking-widest border-b border-[#262629]">
                  <th className="py-4 px-6 font-semibold">Estudiante • Contacto</th>
                  <th className="py-4 px-4 font-semibold">Tipo de Cupo</th>
                  <th className="py-4 px-4 font-semibold">Progreso & Asistencia</th>
                  <th className="py-4 px-4 font-semibold">Promedio</th>
                  <th className="py-4 px-4 font-semibold">Estado Académico</th>
                  <th className="py-4 px-6 font-semibold text-right">Acciones Directas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262629] text-sm">
                {paginatedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 px-4">
                      <div className="max-w-md mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-full bg-[#1b1b1f] text-[#D4AF37] flex items-center justify-center mx-auto border border-[#262629]">
                          <Users className="w-6 h-6" />
                        </div>
                        <h4 className="font-montserrat font-semibold text-white text-base">
                          {enrolledStudents.length === 0
                            ? 'No hay estudiantes matriculados en este curso'
                            : 'Ningún estudiante coincide con los filtros'}
                        </h4>
                        <p className="text-xs text-[#99907c] leading-relaxed">
                          {enrolledStudents.length === 0
                            ? 'Este curso aún no tiene participantes confirmados. Puedes inscribir a un estudiante de forma directa o esperar a que lleguen postulaciones desde el formulario público.'
                            : 'Intenta limpiar el término de búsqueda o restablecer los filtros de estado y tipo de cupo.'}
                        </p>
                        {enrolledStudents.length === 0 && (
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => setIsDirectEnrollOpen(true)}
                              className="px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#f2ca50] text-[#0A0A0E] text-xs font-montserrat uppercase font-semibold tracking-wider transition-all"
                            >
                              + Inscribir Estudiante Ahora
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map((st) => {
                    const initials = getInitials(st.full_name);
                    const isCertified = st.has_certificate || st.status === 'completada';
                    const isComplete =
                      !isCertified &&
                      st.average_grade !== null &&
                      st.average_grade >= CERT_MIN_GRADE;

                    return (
                      <tr key={st.id} className="hover:bg-[#1b1b1f]/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#806b23] text-[#0A0A0E] font-montserrat text-sm font-bold flex items-center justify-center shrink-0 shadow-md">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-montserrat font-semibold text-white text-[15px] truncate">
                                {st.full_name}
                              </p>
                              <p className="text-xs text-[#99907c]">
                                {formatDocument(st.document_type, st.document_number)} •{' '}
                                <span className="text-[#d0c5af]">{st.email || 'Sin correo'}</span>
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-montserrat font-semibold uppercase tracking-wider ${
                              st.cupo_type === 'Beca Inclusión Artesanal'
                                ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30'
                                : st.cupo_type === 'Convenio PH'
                                ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                                : 'bg-[#262629] text-[#e4e1e7]'
                            }`}
                          >
                            {st.cupo_type === 'Convenio PH' && <Building2 className="w-3 h-3 text-blue-400" />}
                            {st.cupo_type === 'Beca Inclusión Artesanal' && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
                            )}
                            {st.cupo_type || 'Cupo Regular'}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <div className="w-36 space-y-1">
                            <div className="flex justify-between items-center text-xs font-montserrat">
                              <span className="text-[#99907c]">Asistencias</span>
                              <div className="flex items-center gap-1">
                                <span className="text-white font-semibold">
                                  {st.attended_sessions} ses.
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setAttendanceEnrollment(st)}
                                  className="text-[#99907c] hover:text-[#D4AF37] transition-colors p-0.5"
                                  title="Editar sesiones asistidas"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <span className="text-[11px] text-[#99907c] block">
                              {st.attended_sessions} sesiones registradas
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          {st.average_grade !== null ? (
                            <div className="flex items-center gap-1 font-montserrat text-base font-bold text-[#D4AF37]">
                              <span>{st.average_grade.toFixed(1)}</span>
                              <span className="text-xs font-normal text-[#99907c]">/ 5.0</span>
                            </div>
                          ) : (
                            <span className="text-xs text-[#99907c] italic">Sin calificar</span>
                          )}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-montserrat font-semibold ${
                              isCertified
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : isComplete
                                ? 'bg-[#D4AF37]/20 text-[#ffe082] border border-[#D4AF37]/30'
                                : 'bg-[#262629] text-[#e4e1e7]'
                            }`}
                          >
                            {isCertified ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : isComplete ? (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
                            ) : null}
                            {isCertified
                              ? 'Aprobado / Certificado'
                              : isComplete
                              ? 'Requisitos Completos'
                              : 'En Formación'}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            {isCertified ? (
                              <button
                                type="button"
                                onClick={() => setSelectedDiplomaEnrollment(st)}
                                className="px-3 py-1.5 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#0A0A0E] text-xs font-montserrat uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5"
                                title="Ver certificado emitido"
                              >
                                <Award className="w-3.5 h-3.5" />
                                <span>Ver Diploma</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleApproveStudent(st)}
                                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#f2ca50] text-[#0A0A0E] hover:brightness-110 text-xs font-montserrat uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                              >
                                <Award className="w-3.5 h-3.5" />
                                <span>Aprobar y Certificar</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setWithdrawingEnrollment(st)}
                              className="p-1.5 rounded-lg text-[#99907c] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Retirar de la cohorte"
                            >
                              <UserMinus className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredStudents.length > itemsPerPage && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#131317] border border-[#262629] text-xs text-[#99907c]">
              <span>
                Mostrando <strong className="text-white">{paginatedStudents.length}</strong> de{' '}
                <strong className="text-white">{filteredStudents.length}</strong> estudiantes
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-2 rounded-lg bg-[#1b1b1f] hover:bg-[#262629] disabled:opacity-40 text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg text-xs font-montserrat font-semibold transition-colors ${
                      currentPage === page
                        ? 'bg-[#D4AF37] text-[#0A0A0E]'
                        : 'bg-[#1b1b1f] text-[#99907c] hover:text-white hover:bg-[#262629]'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-2 rounded-lg bg-[#1b1b1f] hover:bg-[#262629] disabled:opacity-40 text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SOLICITUDES DE INGRESO (Postulaciones) */}
      {/* ========================================================================= */}
      {activeTab === 'solicitudes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-montserrat font-bold text-white tracking-tight">
                Postulaciones en Espera de Admisión
              </h2>
              <p className="text-xs sm:text-sm text-[#99907c] mt-1">
                Revisa el perfil social y vocacional de los postulantes para asignar los cupos disponibles.
              </p>
            </div>
            {availableSlots !== null && (
              <div className="px-3.5 py-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-montserrat uppercase tracking-wider font-semibold">
                {availableSlots} Cupos restantes en cohorte
              </div>
            )}
          </div>

          {applicantStudents.length === 0 ? (
            <div className="p-12 rounded-xl bg-[#131317] border border-[#262629] text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#1b1b1f] text-[#D4AF37] flex items-center justify-center mx-auto border border-[#262629]">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="font-montserrat font-semibold text-white text-base">
                No hay solicitudes pendientes
              </h4>
              <p className="text-xs text-[#99907c] max-w-md mx-auto leading-relaxed">
                Cuando las personas se inscriban a través del formulario público de la fundación o queden en lista de espera, aparecerán aquí para ser evaluadas y admitidas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {applicantStudents.map((app) => (
                <div
                  key={app.id}
                  className="p-6 rounded-xl bg-[#131317] border border-[#262629] hover:border-[#D4AF37]/40 shadow-md space-y-4 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-[#262629] text-[#D4AF37] font-montserrat text-base font-bold flex items-center justify-center">
                        {getInitials(app.full_name)}
                      </div>
                      <div>
                        <h3 className="font-montserrat font-semibold text-white text-base">{app.full_name}</h3>
                        <p className="text-xs text-[#99907c]">
                          {app.locality || 'Bogotá'} • Tel: {app.phone || 'Sin teléfono'}
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-[#1b1b1f] border border-[#262629] text-[#D4AF37] text-xs font-montserrat uppercase font-semibold">
                      {formatModality(course.modality)}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#1b1b1f] border border-[#262629] space-y-1">
                    <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#99907c]">
                      Motivación / Perfil vocacional
                    </span>
                    <p className="text-xs text-white italic leading-relaxed">
                      &quot;{app.motivation || 'Sin carta de motivación registrada.'}&quot;
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedApplicant(app)}
                      className="text-xs text-[#D4AF37] hover:underline uppercase font-montserrat tracking-wider inline-flex items-center gap-1 font-semibold"
                    >
                      <span>Ver formulario completo</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRejectApplicant(app.full_name)}
                        className="px-3.5 py-2 rounded-lg bg-[#1b1b1f] hover:bg-[#262629] text-white text-xs font-montserrat uppercase tracking-wider transition-colors"
                      >
                        Rechazar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdmitApplicant(app.full_name)}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#f2ca50] text-[#0A0A0E] text-xs font-montserrat uppercase tracking-wider font-semibold shadow-sm hover:brightness-110 active:scale-[0.98] transition-all"
                      >
                        Admitir en el Curso
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: RETIRADOS / INACTIVOS */}
      {/* ========================================================================= */}
      {activeTab === 'inactivos' && (
        <div className="p-6 rounded-xl bg-[#131317] border border-[#262629] shadow-md space-y-4">
          <div>
            <h3 className="font-montserrat text-lg font-bold text-white">Registro Histórico de Deserciones y Retiros</h3>
            <p className="text-xs text-[#99907c] mt-0.5">
              Participantes dados de baja por solicitud propia, inasistencia o postulación no aceptada.
            </p>
          </div>

          {inactiveStudents.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#99907c]">
              No hay registros de estudiantes retirados o cancelados en este curso.
            </div>
          ) : (
            <div className="divide-y divide-[#262629]">
              {inactiveStudents.map((w) => (
                <div key={w.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#262629] text-[#99907c] flex items-center justify-center font-bold font-montserrat text-xs">
                      {getInitials(w.full_name)}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">
                        {w.full_name} • {formatDocument(w.document_type, w.document_number)}
                      </p>
                      <p className="text-xs text-rose-400 mt-0.5">
                        Motivo: {w.withdrawal_reason || (w.status === 'rechazada' ? 'Postulación rechazada' : 'Retiro')} • Fecha: {formatDate(w.withdrawal_date || w.updated_at)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedWithdrawal(w)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#1b1b1f] hover:bg-[#262629] border border-[#262629] text-[#e4e1e7] text-xs font-montserrat uppercase tracking-wider transition-colors self-start md:self-auto"
                  >
                    Ver acta de retiro
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Institutional Certification Protocol Banner */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-[#131317] via-[#1b1b1f] to-[#131317] border border-[#D4AF37]/30 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37] shrink-0 border border-[#D4AF37]/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-montserrat text-sm font-semibold text-white tracking-wide uppercase">
              Protocolo de Certificación y Acreditación de Oficios • Principio & Fin
            </h4>
            <p className="text-xs text-[#99907c] max-w-2xl leading-relaxed">
              Para la emisión del certificado con valor institucional, cada estudiante requiere una calificación mínima aprobatoria de <strong className="text-[#D4AF37]">{CERT_MIN_GRADE} / 5.0</strong> y un porcentaje de asistencia de al menos el <strong className="text-[#D4AF37]">{CERT_MIN_ATTENDANCE}%</strong> de las horas prácticas.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsManualModalOpen(true)}
          className="px-4 py-2 rounded-lg bg-[#262629] hover:bg-[#353439] text-[#e4e1e7] text-xs font-montserrat uppercase tracking-wider transition-colors whitespace-nowrap shrink-0"
        >
          Ver Manual de Acreditación
        </button>
      </div>

      {/* MODALS */}
      <DirectEnrollmentModal
        isOpen={isDirectEnrollOpen}
        onClose={() => setIsDirectEnrollOpen(false)}
        courseId={course.id}
        courseTitle={course.title}
        onSuccess={handleDirectEnroll}
      />

      <StudentFormModal
        isOpen={!!selectedApplicant}
        onClose={() => setSelectedApplicant(null)}
        applicant={
          selectedApplicant
            ? {
                name: selectedApplicant.full_name,
                phone: selectedApplicant.phone || 'Sin teléfono',
                location: selectedApplicant.locality || 'Bogotá',
                modality: formatModality(course.modality),
                motivation: selectedApplicant.motivation || 'Sin motivación registrada',
                document: formatDocument(selectedApplicant.document_type, selectedApplicant.document_number),
                email: selectedApplicant.email || undefined
              }
            : null
        }
        onAdmit={handleAdmitApplicant}
        onReject={handleRejectApplicant}
      />

      <WithdrawalActModal
        isOpen={!!selectedWithdrawal}
        onClose={() => setSelectedWithdrawal(null)}
        studentName={selectedWithdrawal?.full_name || ''}
        documentNumber={formatDocument(selectedWithdrawal?.document_type || null, selectedWithdrawal?.document_number || null)}
        courseTitle={course.title}
        cohort={course.cohort}
        date={formatDate(selectedWithdrawal?.withdrawal_date || selectedWithdrawal?.updated_at || null)}
        reason={selectedWithdrawal?.withdrawal_reason || 'Baja institucional'}
        attendancePercentage={
          selectedWithdrawal?.attended_sessions !== undefined
            ? `${selectedWithdrawal.attended_sessions} sesiones asistidas`
            : undefined
        }
        frozenScore={
          selectedWithdrawal?.average_grade !== null && selectedWithdrawal?.average_grade !== undefined
            ? `${selectedWithdrawal.average_grade.toFixed(1)} / 5.0`
            : undefined
        }
      />

      <DiplomaPreviewModal
        isOpen={!!selectedDiplomaEnrollment}
        onClose={() => setSelectedDiplomaEnrollment(null)}
        studentName={selectedDiplomaEnrollment?.full_name || ''}
        documentNumber={formatDocument(selectedDiplomaEnrollment?.document_type || null, selectedDiplomaEnrollment?.document_number || null)}
        courseTitle={course.title}
        instructorName={course.instructor_name}
        averageGrade={
          selectedDiplomaEnrollment?.average_grade !== null && selectedDiplomaEnrollment?.average_grade !== undefined
            ? selectedDiplomaEnrollment.average_grade.toFixed(1)
            : '5.0'
        }
        completionDate={formatDate(selectedDiplomaEnrollment?.certificate_issued_at || null)}
        code={selectedDiplomaEnrollment?.certificate_code || undefined}
      />

      {/* Modal to withdraw a student with reason */}
      <FormModal
        isOpen={!!withdrawingEnrollment}
        onClose={() => setWithdrawingEnrollment(null)}
        title="Retirar Estudiante de la Cohorte"
        description={
          <span>
            Registra la causal de baja institucional para <strong className="text-white">{withdrawingEnrollment?.full_name}</strong>. Esta acción liberará el cupo en el curso.
          </span>
        }
        icon={<UserMinus className="w-5 h-5 text-rose-400" />}
        confirmLabel="Confirmar Retiro"
        tone="danger"
        fields={[
          {
            name: 'reason',
            label: 'Causal o Motivo de Retiro',
            type: 'textarea',
            required: true,
            placeholder: 'Ej: Solicitud propia por motivos de horario laboral, inasistencia injustificada reiterada...'
          }
        ]}
        onConfirm={handleWithdrawStudent}
      />

      {/* Modal to update attendance */}
      <FormModal
        isOpen={!!attendanceEnrollment}
        onClose={() => setAttendanceEnrollment(null)}
        title="Actualizar Asistencias"
        description={
          <span>
            Registra el número de sesiones prácticas asistidas por <strong className="text-white">{attendanceEnrollment?.full_name}</strong>.
          </span>
        }
        icon={<Edit3 className="w-5 h-5 text-[#D4AF37]" />}
        confirmLabel="Guardar Asistencia"
        fields={[
          {
            name: 'attended_sessions',
            label: 'Sesiones Asistidas',
            type: 'number',
            required: true,
            defaultValue: attendanceEnrollment?.attended_sessions ?? 0,
            min: 0,
            max: 999
          }
        ]}
        onConfirm={handleSaveAttendance}
      />

      {/* Manual Modal */}
      {isManualModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setIsManualModalOpen(false)}
        >
          <div 
            className="w-full max-w-lg bg-[#131317] border border-[#262629] rounded-2xl p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#262629] pb-3">
              <h3 className="text-white font-montserrat font-bold text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                Manual de Acreditación de Oficios
              </h3>
              <button 
                onClick={() => setIsManualModalOpen(false)}
                className="text-[#99907c] hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="text-xs text-[#d0c5af] space-y-3 leading-relaxed">
              <p>
                <strong>1. Criterio de Asistencia:</strong> El registro de firmas y asistencia física o sincrónica en talleres equivale al rigor formativo. Una inasistencia superior al 20% inhabilita la expedición de certificación directa.
              </p>
              <p>
                <strong>2. Rúbrica Práctica:</strong> Cada entrega debe superar el umbral de 3.5 en la escala cuantitativa, evaluando simetría, aplicación técnica del acabado y narrativa comunitaria identitaria.
              </p>
              <p>
                <strong>3. Expedición Digital:</strong> Los diplomas emitidos son registrados con hash y folio institucional único, validado para convenios con asociaciones de Propiedad Horizontal y ferias locales de emprendimiento.
              </p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#D4AF37] text-[#0A0A0E] font-montserrat font-semibold text-xs uppercase"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
