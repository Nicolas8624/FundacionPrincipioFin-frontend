'use client';

import React, { useState, useMemo } from 'react';
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
  MoreVertical, 
  ChevronLeft, 
  ChevronRight, 
  Building2, 
  Sparkles, 
  ExternalLink, 
  ShieldCheck, 
  Check, 
  Info,
  Calendar,
  Layers
} from 'lucide-react';
import { DirectEnrollmentModal } from './DirectEnrollmentModal';
import { StudentFormModal } from './StudentFormModal';
import { WithdrawalActModal } from './WithdrawalActModal';
import { DiplomaPreviewModal } from './DiplomaPreviewModal';

interface Student {
  id: string;
  name: string;
  initials: string;
  document: string;
  email: string;
  cupoType: 'Beca Inclusión Artesanal' | 'Convenio PH' | 'Cupo Regular';
  attendancePercent: number;
  attendedSessions: number;
  totalSessions: number;
  averageGrade: number;
  academicStatus: 'Aprobado / Certificado' | 'En Formación' | 'Requisitos Completos';
  hasCertificate: boolean;
}

interface Applicant {
  id: string;
  name: string;
  initials: string;
  location: string;
  phone: string;
  modality: string;
  motivation: string;
  document?: string;
  email?: string;
}

interface WithdrawnStudent {
  id: string;
  name: string;
  initials: string;
  document: string;
  reason: string;
  date: string;
  attendance: string;
  frozenScore: string;
}

interface CourseStudentsViewProps {
  courseTitle: string;
  modalityText?: string;
  cohortText?: string;
  teacherText?: string;
  maxCapacity?: number;
}

export function CourseStudentsView({
  courseTitle,
  modalityText = 'Virtual & Presencial',
  cohortText = '2026-I',
  teacherText = 'Maestra Lucía Forero',
  maxCapacity = 35
}: CourseStudentsViewProps) {
  // Tabs: 'matriculados' | 'solicitudes' | 'inactivos'
  const [activeTab, setActiveTab] = useState<'matriculados' | 'solicitudes' | 'inactivos'>('matriculados');

  // Filters for Students Table
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cupoFilter, setCupoFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals state
  const [isDirectEnrollOpen, setIsDirectEnrollOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawnStudent | null>(null);
  const [selectedDiplomaStudent, setSelectedDiplomaStudent] = useState<Student | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Initial Enrolled Students
  const [students, setStudents] = useState<Student[]>([
    {
      id: 'st-1',
      name: 'Camila Andrea Morales',
      initials: 'CM',
      document: 'CC 1.020.891.440',
      email: 'camila.morales@artesaniasbogota.co',
      cupoType: 'Beca Inclusión Artesanal',
      attendancePercent: 100,
      attendedSessions: 16,
      totalSessions: 16,
      averageGrade: 4.9,
      academicStatus: 'Aprobado / Certificado',
      hasCertificate: true
    },
    {
      id: 'st-2',
      name: 'Andrés Felipe Rodríguez',
      initials: 'AR',
      document: 'CC 80.245.119',
      email: 'andres.rodriguez@phbogota.org',
      cupoType: 'Convenio PH',
      attendancePercent: 88,
      attendedSessions: 14,
      totalSessions: 16,
      averageGrade: 4.2,
      academicStatus: 'En Formación',
      hasCertificate: false
    },
    {
      id: 'st-3',
      name: 'María Paula Gómez',
      initials: 'MG',
      document: 'CC 52.890.312',
      email: 'mariap.gomez@gmail.com',
      cupoType: 'Cupo Regular',
      attendancePercent: 94,
      attendedSessions: 15,
      totalSessions: 16,
      averageGrade: 4.6,
      academicStatus: 'Requisitos Completos',
      hasCertificate: false
    },
    {
      id: 'st-4',
      name: 'Carlos Eduardo Quintero',
      initials: 'CQ',
      document: 'CC 1.014.220.890',
      email: 'carlos.quintero@artes.org',
      cupoType: 'Beca Inclusión Artesanal',
      attendancePercent: 81,
      attendedSessions: 13,
      totalSessions: 16,
      averageGrade: 3.8,
      academicStatus: 'En Formación',
      hasCertificate: false
    },
    {
      id: 'st-5',
      name: 'Valentina Torres Castro',
      initials: 'VT',
      document: 'CC 1.033.456.912',
      email: 'valentina.torres@phbogota.org',
      cupoType: 'Convenio PH',
      attendancePercent: 100,
      attendedSessions: 16,
      totalSessions: 16,
      averageGrade: 5.0,
      academicStatus: 'Aprobado / Certificado',
      hasCertificate: true
    },
    {
      id: 'st-6',
      name: 'Juan Sebastián Pinilla',
      initials: 'JP',
      document: 'CC 1.019.452.880',
      email: 'juan.pinilla@oficios.org',
      cupoType: 'Beca Inclusión Artesanal',
      attendancePercent: 92,
      attendedSessions: 15,
      totalSessions: 16,
      averageGrade: 4.4,
      academicStatus: 'En Formación',
      hasCertificate: false
    },
    {
      id: 'st-7',
      name: 'Ingrid Tatiana Beltrán',
      initials: 'IB',
      document: 'CC 53.012.789',
      email: 'ingrid.beltran@comunidad.org',
      cupoType: 'Cupo Regular',
      attendancePercent: 87,
      attendedSessions: 14,
      totalSessions: 16,
      averageGrade: 4.1,
      academicStatus: 'En Formación',
      hasCertificate: false
    }
  ]);

  // 2. Initial Applicants (Solicitudes de Ingreso)
  const [applicants, setApplicants] = useState<Applicant[]>([
    {
      id: 'app-1',
      name: 'Luz Marina Granados',
      initials: 'LG',
      location: 'Bosa Central',
      phone: '+57 312 405 8812',
      modality: 'Presencial',
      motivation: 'Madre comunitaria interesada en emprender con técnicas ancestrales de esmaltado para sustento de su hogar y talleres a jóvenes del sector.',
      document: 'CC 51.982.341',
      email: 'luz.granados@bosa.org'
    },
    {
      id: 'app-2',
      name: 'Julián David Moreno',
      initials: 'JM',
      location: 'Kennedy (Patio Bonito)',
      phone: '+57 319 720 1944',
      modality: 'Híbrida',
      motivation: 'Joven bachiller egresado en búsqueda de formación en oficio ancestral para rescatar técnicas de moldeado de barro y apoyo familiar.',
      document: 'CC 1.023.771.092',
      email: 'julian.moreno@kennedy.org'
    },
    {
      id: 'app-3',
      name: 'Esperanza Parra Pinzón',
      initials: 'EP',
      location: 'Suba Rincón',
      phone: '+57 301 552 9011',
      modality: 'Presencial',
      motivation: 'Artesana tradicional con experiencia básica que busca formalizar conocimientos y acceder a los canales de exhibición de la Fundación.',
      document: 'CC 41.890.123',
      email: 'esperanza.parra@suba.org'
    },
    {
      id: 'app-4',
      name: 'Hernando Ortiz Celis',
      initials: 'HO',
      location: 'Ciudad Bolívar',
      phone: '+57 320 891 2231',
      modality: 'Virtual Asistido',
      motivation: 'Postulación apoyada por líder barrial para terapia ocupacional y creación de taller comunitario de cerámica decorativa.',
      document: 'CC 79.882.100',
      email: 'hernando.ortiz@cbolivar.org'
    }
  ]);

  // 3. Initial Withdrawn Students
  const [withdrawnStudents, setWithdrawnStudents] = useState<WithdrawnStudent[]>([
    {
      id: 'w-1',
      name: 'Santiago Alvarado Nieto',
      initials: 'SA',
      document: 'CC 1.018.990.123',
      reason: 'Traslado de ciudad laboral',
      date: '12 Febrero 2026',
      attendance: '35%',
      frozenScore: '2.5 / 5.0'
    },
    {
      id: 'w-2',
      name: 'Gloria Lizeth Cárdenas',
      initials: 'GL',
      document: 'CC 52.118.094',
      reason: 'Inasistencia injustificada (>30%)',
      date: '01 Marzo 2026',
      attendance: '48%',
      frozenScore: '2.9 / 5.0'
    }
  ]);

  // Calculations
  const totalEnrolled = students.length;
  const availableSlots = Math.max(0, maxCapacity - totalEnrolled);
  const occupancyPercent = Math.min(100, Math.round((totalEnrolled / maxCapacity) * 100));
  const certifiedCount = students.filter(s => s.academicStatus === 'Aprobado / Certificado').length;
  const inTrainingCount = students.filter(s => s.academicStatus === 'En Formación').length;

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch = 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.document.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = statusFilter === 'all' || s.academicStatus === statusFilter;
      const matchCupo = cupoFilter === 'all' || s.cupoType === cupoFilter;

      return matchSearch && matchStatus && matchCupo;
    });
  }, [students, searchTerm, statusFilter, cupoFilter]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Actions
  const handleApproveStudent = (student: Student) => {
    setStudents(prev => prev.map(s => {
      if (s.id === student.id) {
        return {
          ...s,
          academicStatus: 'Aprobado / Certificado',
          hasCertificate: true
        };
      }
      return s;
    }));
    showToast(`¡${student.name} ha sido certificado con éxito! Diploma generado.`);
  };

  const handleWithdrawStudent = (student: Student) => {
    const reason = prompt(`Motivo de retiro institucional para ${student.name}:`, 'Solicitud propia por motivos laborales');
    if (!reason) return;

    setStudents(prev => prev.filter(s => s.id !== student.id));
    setWithdrawnStudents(prev => [
      {
        id: `w-${Date.now()}`,
        name: student.name,
        initials: student.initials,
        document: student.document,
        reason,
        date: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' }),
        attendance: `${student.attendancePercent}%`,
        frozenScore: `${student.averageGrade} / 5.0`
      },
      ...prev
    ]);
    showToast(`Estudiante ${student.name} transferido a la lista de retirados.`);
  };

  const handleAdmitApplicant = (applicantName: string) => {
    const app = applicants.find(a => a.name === applicantName);
    if (!app) return;

    setApplicants(prev => prev.filter(a => a.id !== app.id));
    setStudents(prev => [
      ...prev,
      {
        id: `st-${Date.now()}`,
        name: app.name,
        initials: app.initials,
        document: app.document || 'CC 1.090.887.654',
        email: app.email || 'estudiante@comunidad.org',
        cupoType: 'Beca Inclusión Artesanal',
        attendancePercent: 100,
        attendedSessions: 1,
        totalSessions: 16,
        averageGrade: 5.0,
        academicStatus: 'En Formación',
        hasCertificate: false
      }
    ]);
    showToast(`¡Solicitud aprobada! ${app.name} fue matriculado en la cohorte.`);
  };

  const handleRejectApplicant = (applicantName: string) => {
    setApplicants(prev => prev.filter(a => a.name !== applicantName));
    showToast(`La solicitud de ${applicantName} ha sido reasignada.`);
  };

  const handleDirectEnroll = (data: {
    fullName: string;
    documentNumber: string;
    phone: string;
    email: string;
    cupoType: string;
  }) => {
    const initials = data.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    setStudents(prev => [
      ...prev,
      {
        id: `st-${Date.now()}`,
        name: data.fullName,
        initials,
        document: data.documentNumber,
        email: data.email || 'sin-correo@comunidad.org',
        cupoType: data.cupoType as any,
        attendancePercent: 100,
        attendedSessions: 0,
        totalSessions: 16,
        averageGrade: 5.0,
        academicStatus: 'En Formación',
        hasCertificate: false
      }
    ]);
    showToast(`¡Estudiante ${data.fullName} matriculado exitosamente!`);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Nombre Completo', 'Documento', 'Correo', 'Tipo de Cupo', 'Asistencia %', 'Promedio', 'Estado Académico'];
    const rows = students.map(s => [
      s.id,
      `"${s.name}"`,
      s.document,
      s.email,
      `"${s.cupoType}"`,
      `${s.attendancePercent}%`,
      s.averageGrade,
      `"${s.academicStatus}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estudiantes_${courseTitle.replace(/\s+/g, '_').toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Lista de estudiantes exportada en CSV exitosamente.');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast */}
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
              Gestión Académica • Cohorte Activa
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-montserrat font-bold text-white tracking-tight">
            Estudiantes y Solicitudes del Curso
          </h1>
          <p className="text-sm text-[#99907c] max-w-3xl leading-relaxed">
            Gestiona los participantes matriculados en la cohorte actual, valida solicitudes de ingreso pendientes, registra aprobaciones y certificaciones, o gestiona retiros formativos con rigor institucional.
          </p>

          {/* Badges metadata */}
          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1b1b1f] border border-[#262629] text-[#e4e1e7] text-xs font-montserrat uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>MODALIDAD: <strong className="text-white font-semibold">{modalityText}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1b1b1f] border border-[#262629] text-[#e4e1e7] text-xs font-montserrat uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>COHORTE: <strong className="text-white font-semibold">{cohortText}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1b1b1f] border border-[#262629] text-[#e4e1e7] text-xs font-montserrat uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>DOCENTE: <strong className="text-white font-semibold">{teacherText}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#ffe082] text-xs font-montserrat uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>CUPOS: <strong className="text-[#D4AF37] font-bold">{totalEnrolled}/{maxCapacity} MATRICULADOS</strong> ({availableSlots} DISPONIBLES)</span>
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
              <span className="text-[11px] font-montserrat uppercase tracking-widest text-[#99907c]">Total Inscritos</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold font-montserrat text-white">{totalEnrolled}</span>
                <span className="text-xs text-[#D4AF37] font-medium font-montserrat">/ {maxCapacity} cupos</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#1b1b1f] border border-[#262629] flex items-center justify-center text-[#D4AF37]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#262629] flex items-center justify-between">
            <span className="text-xs text-[#99907c]">Ocupación aula</span>
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
                  {applicants.length.toString().padStart(2, '0')}
                </span>
                <span className="text-xs text-[#99907c]">en revisión</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#262629]/70 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#262629] flex items-center justify-between text-xs">
            <span className="text-[#99907c]">Espera de admisión / beca</span>
            <span className="inline-flex items-center gap-1 text-[#D4AF37] font-semibold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
              Prioridad alta
            </span>
          </div>
        </div>

        {/* Metric 3: Aprobados / Certificados */}
        <div className="rounded-xl bg-[#131317] border border-[#262629] p-6 hover:border-[#D4AF37]/30 transition-all shadow-md flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-montserrat uppercase tracking-widest text-[#99907c]">Aprobados / Certificados</span>
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
            <span className="text-[#99907c]">Rúbrica aprobada (≥ 3.5)</span>
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
                <span className="text-xs text-[#99907c]">cursando módulos</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#1b1b1f] border border-[#262629] flex items-center justify-center text-[#e4e1e7]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#262629] flex items-center justify-between text-xs">
            <span className="text-[#99907c]">Asistencia media</span>
            <span className="text-[#D4AF37] font-semibold">94.0% promedio</span>
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
              {students.length}
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
              {applicants.length}
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
            <span>Retirados / Inactivos</span>
            <span className="px-2 py-0.5 rounded-full bg-[#262629] text-[#99907c] text-xs font-montserrat">
              {withdrawnStudents.length}
            </span>
            {activeTab === 'inactivos' && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.6)]"></span>
            )}
          </button>
        </div>

        <div className="pb-3 text-xs text-[#99907c] font-montserrat uppercase tracking-wider">
          Última sincronización: Hoy 11:42 AM
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
                  <option value="Aprobado / Certificado" className="bg-[#1b1b1f]">Aprobado / Certificado</option>
                  <option value="En Formación" className="bg-[#1b1b1f]">En Formación</option>
                  <option value="Requisitos Completos" className="bg-[#1b1b1f]">Requisitos Completos</option>
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
                  <option value="Beca Inclusión Artesanal" className="bg-[#1b1b1f]">Beca Inclusión Artesanal</option>
                  <option value="Convenio PH" className="bg-[#1b1b1f]">Convenio PH</option>
                  <option value="Cupo Regular" className="bg-[#1b1b1f]">Cupo Regular</option>
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
                    <td colSpan={6} className="text-center py-12 text-[#99907c]">
                      No se encontraron estudiantes matriculados que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-[#1b1b1f]/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#806b23] text-[#0A0A0E] font-montserrat text-sm font-bold flex items-center justify-center shrink-0 shadow-md">
                            {st.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-montserrat font-semibold text-white text-[15px] truncate">{st.name}</p>
                            <p className="text-xs text-[#99907c]">
                              {st.document} • <span className="text-[#d0c5af]">{st.email}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-montserrat font-semibold uppercase tracking-wider ${
                          st.cupoType === 'Beca Inclusión Artesanal'
                            ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30'
                            : st.cupoType === 'Convenio PH'
                            ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                            : 'bg-[#262629] text-[#e4e1e7]'
                        }`}>
                          {st.cupoType === 'Convenio PH' && <Building2 className="w-3 h-3 text-blue-400" />}
                          {st.cupoType === 'Beca Inclusión Artesanal' && <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>}
                          {st.cupoType}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="w-36 space-y-1">
                          <div className="flex justify-between text-xs font-montserrat">
                            <span className="text-[#99907c]">Asistencias</span>
                            <span className="text-white font-semibold">{st.attendancePercent}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[#262629] overflow-hidden">
                            <div 
                              className="h-full bg-[#D4AF37] rounded-full" 
                              style={{ width: `${st.attendancePercent}%` }}
                            ></div>
                          </div>
                          <span className="text-[11px] text-[#99907c] block">
                            {st.attendedSessions} de {st.totalSessions} sesiones
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-montserrat text-base font-bold text-[#D4AF37]">
                          <span>{st.averageGrade.toFixed(1)}</span>
                          <span className="text-xs font-normal text-[#99907c]">/ 5.0</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-montserrat font-semibold ${
                          st.academicStatus === 'Aprobado / Certificado'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : st.academicStatus === 'Requisitos Completos'
                            ? 'bg-[#D4AF37]/20 text-[#ffe082] border border-[#D4AF37]/30'
                            : 'bg-[#262629] text-[#e4e1e7]'
                        }`}>
                          {st.academicStatus === 'Aprobado / Certificado' ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
                          )}
                          {st.academicStatus}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          {st.hasCertificate ? (
                            <button
                              type="button"
                              onClick={() => setSelectedDiplomaStudent(st)}
                              className="px-3 py-1.5 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#0A0A0E] text-xs font-montserrat uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5"
                              title="Ver certificado emitido"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>Certificado Emitido</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleApproveStudent(st)}
                              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#f2ca50] text-[#0A0A0E] hover:brightness-110 text-xs font-montserrat uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>Aprobar Curso</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleWithdrawStudent(st)}
                            className="p-1.5 rounded-lg text-[#99907c] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Retirar del curso"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedDiplomaStudent(st)}
                            className="p-1.5 rounded-lg text-[#99907c] hover:text-white hover:bg-[#262629] transition-colors"
                            title="Opciones"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#131317] border border-[#262629] text-xs text-[#99907c]">
            <span>
              Mostrando <strong className="text-white">{paginatedStudents.length}</strong> de <strong className="text-white">{filteredStudents.length}</strong> estudiantes matriculados
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-2 rounded-lg bg-[#1b1b1f] hover:bg-[#262629] disabled:opacity-40 text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-2 rounded-lg bg-[#1b1b1f] hover:bg-[#262629] disabled:opacity-40 text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
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
                Revisa el perfil social y vocacional de los postulantes antes de asignar los {availableSlots} cupos vacantes disponibles.
              </p>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-montserrat uppercase tracking-wider font-semibold">
              {availableSlots} Cupos restantes en cohorte
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {applicants.map((app) => (
              <div 
                key={app.id}
                className="p-6 rounded-xl bg-[#131317] border border-[#262629] hover:border-[#D4AF37]/40 shadow-md space-y-4 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#262629] text-[#D4AF37] font-montserrat text-base font-bold flex items-center justify-center">
                      {app.initials}
                    </div>
                    <div>
                      <h3 className="font-montserrat font-semibold text-white text-base">{app.name}</h3>
                      <p className="text-xs text-[#99907c]">{app.location} • Tel: {app.phone}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-[#1b1b1f] border border-[#262629] text-[#D4AF37] text-xs font-montserrat uppercase font-semibold">
                    {app.modality}
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-[#1b1b1f] border border-[#262629] space-y-1">
                  <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#99907c]">Motivación / Perfil vocacional</span>
                  <p className="text-xs text-white italic leading-relaxed">
                    &quot;{app.motivation}&quot;
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
                      onClick={() => handleRejectApplicant(app.name)}
                      className="px-3.5 py-2 rounded-lg bg-[#1b1b1f] hover:bg-[#262629] text-white text-xs font-montserrat uppercase tracking-wider transition-colors"
                    >
                      Rechazar / Reasignar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdmitApplicant(app.name)}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#f2ca50] text-[#0A0A0E] text-xs font-montserrat uppercase tracking-wider font-semibold shadow-sm hover:brightness-110 active:scale-[0.98] transition-all"
                    >
                      Admitir en el Curso
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
              Estos participantes fueron dados de baja por solicitud propia o inasistencia reiterada. Sus calificaciones parciales quedan congeladas en el historial.
            </p>
          </div>

          <div className="divide-y divide-[#262629]">
            {withdrawnStudents.map((w) => (
              <div key={w.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#262629] text-[#99907c] flex items-center justify-center font-bold font-montserrat text-xs">
                    {w.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{w.name} • {w.document}</p>
                    <p className="text-xs text-rose-400 mt-0.5">
                      Motivo: {w.reason} • Fecha: {w.date}
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
              Para la emisión del certificado con valor institucional, cada estudiante requiere una calificación mínima aprobatoria de <strong className="text-[#D4AF37]">3.5 / 5.0</strong> y un porcentaje de asistencia de al menos el <strong className="text-[#D4AF37]">80%</strong> de las horas prácticas.
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
        courseTitle={courseTitle}
        onSuccess={handleDirectEnroll}
      />

      <StudentFormModal
        isOpen={!!selectedApplicant}
        onClose={() => setSelectedApplicant(null)}
        applicant={selectedApplicant}
        onAdmit={handleAdmitApplicant}
        onReject={handleRejectApplicant}
      />

      <WithdrawalActModal
        isOpen={!!selectedWithdrawal}
        onClose={() => setSelectedWithdrawal(null)}
        studentName={selectedWithdrawal?.name || ''}
        documentNumber={selectedWithdrawal?.document || ''}
        courseTitle={courseTitle}
        date={selectedWithdrawal?.date || ''}
        reason={selectedWithdrawal?.reason || ''}
        attendancePercentage={selectedWithdrawal?.attendance}
        frozenScore={selectedWithdrawal?.frozenScore}
      />

      <DiplomaPreviewModal
        isOpen={!!selectedDiplomaStudent}
        onClose={() => setSelectedDiplomaStudent(null)}
        studentName={selectedDiplomaStudent?.name || ''}
        documentNumber={selectedDiplomaStudent?.document || ''}
        courseTitle={courseTitle}
        averageGrade={selectedDiplomaStudent?.averageGrade.toFixed(1) || '5.0'}
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
                <strong>1. Criterio de Asistencia:</strong> El registro de firmas y asistencia física o sincrónica en talleres equivale al 40% del rigor formativo. Una inasistencia superior al 20% inhabilita la expedición de certificación directa.
              </p>
              <p>
                <strong>2. Rúbrica Práctica:</strong> Cada entrega debe superar el umbral de 3.5 en la escala cuantitativa, evaluando simetría, aplicación técnica del esmalte/acabado y narrativa comunitaria identitaria.
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
