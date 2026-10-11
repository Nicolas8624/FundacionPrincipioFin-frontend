'use client';

import React, { useState, useMemo } from 'react';
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
  Eye,
  Sliders
} from 'lucide-react';
import { CreateAssignmentModal } from './CreateAssignmentModal';
import { ImageLightboxModal } from './ImageLightboxModal';

interface SubmissionItem {
  id: string;
  studentName: string;
  initials: string;
  document: string;
  projectTitle: string;
  submittedAt: string;
  isLate: boolean;
  status: 'Pendiente de Calificar' | 'Aprobado' | 'Corrección' | 'Distinción';
  score?: number;
  badge?: string;
  studentNote?: string;
  correctionNote?: string;
  photos: { url: string; title: string }[];
  criterion1: number;
  criterion2: number;
  criterion3: number;
  feedback: string;
  groupSchedule: string;
  moduleKey: string;
}

interface CourseEvaluationViewProps {
  courseTitle: string;
  modalityText?: string;
  cohortText?: string;
  teacherText?: string;
  totalEnrolledCount?: number;
  onSwitchToStudentsTab?: () => void;
}

export function CourseEvaluationView({
  courseTitle,
  modalityText = 'Virtual & Presencial',
  cohortText = '2026-I',
  teacherText = 'Maestra Lucía Forero',
  totalEnrolledCount = 32,
  onSwitchToStudentsTab
}: CourseEvaluationViewProps) {
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter states
  const [activeModuleTab, setActiveModuleTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [scheduleFilter, setScheduleFilter] = useState('todos');

  // Submissions initial data
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([
    {
      id: 'sub-1',
      studentName: 'Camila Andrea Morales',
      initials: 'CM',
      document: 'CC 1.014.289.430',
      projectTitle: 'Proyecto 2: Jarrón con Esmaltado Azul Cobalto',
      submittedAt: '14 Mar 2026, 10:45 a.m. (A tiempo)',
      isLate: false,
      status: 'Pendiente de Calificar',
      badge: 'Beneficiaria Beca de Inclusión Artesanal',
      studentNote: 'Profesora Lucía, apliqué dos capas de esmalte cobalto después de la primera cocción a 950°C. La pieza no presentó grietas y mantuve el patrón en espiral del taller.',
      photos: [
        {
          url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80',
          title: '1_Pieza_Final_Cobalto.jpg'
        },
        {
          url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
          title: '2_Proceso_Pincel_Vidriado.jpg'
        },
        {
          url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
          title: '3_Post_Horneado_Textura.jpg'
        }
      ],
      criterion1: 4.7,
      criterion2: 4.9,
      criterion3: 4.8,
      feedback: 'Excelente dominio de la técnica de vidriado. El acabado azul cobalto resalta las texturas en espiral logradas en el modelado. Felicitaciones por la dedicación y el cumplimiento de las temperaturas de cocción sugeridas.',
      groupSchedule: 'sabados',
      moduleKey: 'mod2'
    },
    {
      id: 'sub-2',
      studentName: 'Andrés Felipe Rodríguez',
      initials: 'AR',
      document: 'CC 1.020.784.112',
      projectTitle: 'Proyecto 1: Escultura Cántaro Tradicional',
      submittedAt: '13 Mar 2026 • 2 archivos adjuntos',
      isLate: false,
      status: 'Aprobado',
      score: 4.5,
      studentNote: 'Cántaro modelado a mano respetando proporciones muiscas.',
      photos: [
        {
          url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
          title: 'Cantaro_Modelado.jpg'
        }
      ],
      criterion1: 4.5,
      criterion2: 4.4,
      criterion3: 4.6,
      feedback: 'Gran pulso en el acabado de las asas. Muy buen grosor general.',
      groupSchedule: 'sabados',
      moduleKey: 'mod1'
    },
    {
      id: 'sub-3',
      studentName: 'María Paula Gómez',
      initials: 'MG',
      document: 'CC 52.849.201',
      projectTitle: 'Proyecto 2: Muestrario de Texturas',
      submittedAt: '14 Mar 2026, 09:12 a.m. • 2 imágenes adjuntas',
      isLate: false,
      status: 'Pendiente de Calificar',
      studentNote: 'Ensayé esgrafiado sobre engobe claro con textura de peine.',
      photos: [
        {
          url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80',
          title: 'Muestrario_Texturas.jpg'
        }
      ],
      criterion1: 4.2,
      criterion2: 4.5,
      criterion3: 4.4,
      feedback: 'Excelente exploración de bajorrelieve en la arcilla.',
      groupSchedule: 'martes',
      moduleKey: 'mod2'
    },
    {
      id: 'sub-4',
      studentName: 'Julián David Herrera',
      initials: 'JH',
      document: 'CC 1.032.411.902',
      projectTitle: 'Proyecto 3: Esmalte y Cocción en Alta',
      submittedAt: '12 Mar 2026',
      isLate: true,
      status: 'Corrección',
      score: 2.8,
      correctionNote: 'Requiere ajustar registro de temperatura y re-enviar foto cenital.',
      photos: [
        {
          url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
          title: 'Coccion_Revision.jpg'
        }
      ],
      criterion1: 3.0,
      criterion2: 2.5,
      criterion3: 3.0,
      feedback: 'Se observa craquelado no intencional por enfriamiento prematuro del horno. Por favor revisar guía de curvas térmicas.',
      groupSchedule: 'sabados',
      moduleKey: 'mod3'
    },
    {
      id: 'sub-5',
      studentName: 'Valentina Torres Castro',
      initials: 'VT',
      document: 'CC 1.018.992.304',
      projectTitle: 'Proyecto 1: Pieza Funcional Taza Artesanal',
      submittedAt: 'Calificado el 12 Mar 2026 • Maestra Lucía Forero',
      isLate: false,
      status: 'Distinción',
      score: 5.0,
      badge: 'Mención de Honor',
      studentNote: 'Taza ergonómica con esmaltado interior no tóxico y grabado exterior.',
      photos: [
        {
          url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80',
          title: 'Taza_Final_Mencion.jpg'
        }
      ],
      criterion1: 5.0,
      criterion2: 5.0,
      criterion3: 5.0,
      feedback: 'Perfección técnica e identidad comunitaria impecable. Recomendada para catálogo de exposición.',
      groupSchedule: 'martes',
      moduleKey: 'mod1'
    },
    {
      id: 'sub-6',
      studentName: 'Carlos Eduardo Quintero',
      initials: 'CQ',
      document: 'CC 80.123.456',
      projectTitle: 'Proyecto 3: Cuenco Decorativo Bosa',
      submittedAt: '14 Mar 2026, 08:30 a.m. • 1 PDF + 2 fotos',
      isLate: false,
      status: 'Pendiente de Calificar',
      studentNote: 'Registro fotográfico del proceso de bruñido con piedra de río.',
      photos: [
        {
          url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
          title: 'Cuenco_Brunido.jpg'
        }
      ],
      criterion1: 4.3,
      criterion2: 4.1,
      criterion3: 4.5,
      feedback: 'Buen trabajo en el bruñido natural con piedra de río.',
      groupSchedule: 'sabados',
      moduleKey: 'mod3'
    }
  ]);

  // Active target student for Grading Studio
  const [activeSubmissionId, setActiveSubmissionId] = useState<string>('sub-1');
  const activeSubmission = submissions.find(s => s.id === activeSubmissionId) || submissions[0];

  // Studio Grading State (reactive to active submission)
  const [crit1, setCrit1] = useState<number>(activeSubmission.criterion1);
  const [crit2, setCrit2] = useState<number>(activeSubmission.criterion2);
  const [crit3, setCrit3] = useState<number>(activeSubmission.criterion3);
  const [feedbackText, setFeedbackText] = useState<string>(activeSubmission.feedback);
  const [manualOverrideScore, setManualOverrideScore] = useState<string>('');

  // When changing active submission, load its state
  const handleSelectSubmission = (sub: SubmissionItem) => {
    setActiveSubmissionId(sub.id);
    setCrit1(sub.criterion1);
    setCrit2(sub.criterion2);
    setCrit3(sub.criterion3);
    setFeedbackText(sub.feedback);
    setManualOverrideScore('');
  };

  // Calculated Score
  const calculatedScore = useMemo(() => {
    if (manualOverrideScore && !isNaN(parseFloat(manualOverrideScore))) {
      return parseFloat(manualOverrideScore).toFixed(1);
    }
    const val = (crit1 * 0.35) + (crit2 * 0.35) + (crit3 * 0.30);
    return val.toFixed(1);
  }, [crit1, crit2, crit3, manualOverrideScore]);

  // Filtered Submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(s => {
      const matchModule = activeModuleTab === 'all' || s.moduleKey === activeModuleTab;
      const matchSearch = 
        s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.document.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.projectTitle.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = 
        statusFilter === 'todos' ||
        (statusFilter === 'pendiente' && s.status === 'Pendiente de Calificar') ||
        (statusFilter === 'aprobado' && (s.status === 'Aprobado' || s.status === 'Distinción')) ||
        (statusFilter === 'correccion' && s.status === 'Corrección');

      const matchSchedule = scheduleFilter === 'todos' || s.groupSchedule === scheduleFilter;

      return matchModule && matchSearch && matchStatus && matchSchedule;
    });
  }, [submissions, activeModuleTab, searchTerm, statusFilter, scheduleFilter]);

  // KPIs
  const totalDeliveries = submissions.length * 10 + 4; // realistic total cohort deliveries
  const pendingGradingCount = submissions.filter(s => s.status === 'Pendiente de Calificar').length;
  const approvedCount = submissions.filter(s => s.status === 'Aprobado' || s.status === 'Distinción').length;

  // Actions
  const handleSaveGrade = (statusToSet: 'Aprobado' | 'Corrección' | 'Distinción') => {
    const finalScore = parseFloat(calculatedScore);
    setSubmissions(prev => prev.map(s => {
      if (s.id === activeSubmission.id) {
        return {
          ...s,
          status: statusToSet,
          score: finalScore,
          criterion1: crit1,
          criterion2: crit2,
          criterion3: crit3,
          feedback: feedbackText,
          badge: statusToSet === 'Distinción' ? 'Mención de Honor' : s.badge
        };
      }
      return s;
    }));
    showToast(`Calificación (${finalScore}/5.0) guardada para ${activeSubmission.studentName}. Boletín actualizado.`);
  };

  const handleExportConsolidado = () => {
    const headers = ['Estudiante', 'Documento', 'Proyecto', 'Estado Entrega', 'Nota Final', 'Fecha'];
    const rows = submissions.map(s => [
      `"${s.studentName}"`,
      s.document,
      `"${s.projectTitle}"`,
      `"${s.status}"`,
      s.score ?? calculatedScore,
      `"${s.submittedAt}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consolidado_notas_${courseTitle.replace(/\s+/g, '_').toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Consolidado de calificaciones exportado en CSV exitosamente.');
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
              Aula Virtual & Taller • Seguimiento Pedagógico
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-montserrat font-bold text-white tracking-tight">
            Evaluación y Evidencias de Curso
          </h1>
          <p className="text-sm text-[#99907c] max-w-3xl leading-relaxed">
            Supervisa las entregas prácticas, fotografías de proyectos y asignaciones enviadas por los estudiantes inscritos. Califica con la rúbrica comunitaria, retroalimenta y certifica el avance formativo.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1b1b1f] border border-[#262629] text-[#e4e1e7] text-xs font-montserrat uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Modalidad: <strong className="text-white font-semibold">{modalityText}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1b1b1f] border border-[#262629] text-[#e4e1e7] text-xs font-montserrat uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Cohorte: <strong className="text-white font-semibold">{cohortText}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1b1b1f] border border-[#262629] text-[#e4e1e7] text-xs font-montserrat uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Docente: <strong className="text-white font-semibold">{teacherText}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#ffe082] text-xs font-montserrat uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{totalEnrolledCount} Estudiantes inscritos</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1b1b1f] border border-[#262629] text-[#e4e1e7] text-xs font-montserrat uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Asistencia promedio: 94%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Bento KPI Metrics Grid */}
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
            <span className="text-3xl font-montserrat font-bold text-white">{totalDeliveries}</span>
            <span className="inline-flex items-center gap-0.5 text-xs text-[#D4AF37] font-semibold font-montserrat uppercase">
              <TrendingUp className="w-3.5 h-3.5" /> +12 esta semana
            </span>
          </div>
          <div className="w-full bg-[#262629] h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#D4AF37] h-full rounded-full w-full"></div>
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
            <span className="text-3xl font-montserrat font-bold text-amber-400">11</span>
            <span className="text-xs text-[#99907c] uppercase font-montserrat">Revisión prioritaria</span>
          </div>
          <div className="w-full bg-[#262629] h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-amber-400 h-full rounded-full w-[28%]"></div>
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
            <span className="text-3xl font-montserrat font-bold text-white">49</span>
            <span className="text-xs text-emerald-400 uppercase font-semibold font-montserrat">Calificación alta</span>
          </div>
          <div className="w-full bg-[#262629] h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full w-[76%]"></div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-xl bg-[#131317] border border-[#262629] hover:border-[#D4AF37]/30 transition-all shadow-md flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-montserrat uppercase tracking-widest text-[#99907c]">Tasa de Finalización</span>
            <div className="w-9 h-9 rounded-lg bg-[#1b1b1f] border border-[#262629] flex items-center justify-center text-[#D4AF37]">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-montserrat font-bold text-white">82.5%</span>
            <span className="text-xs text-[#99907c] uppercase font-montserrat">Cumplimiento cohorte</span>
          </div>
          <div className="w-full bg-[#262629] h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#D4AF37] h-full rounded-full w-[82.5%]"></div>
          </div>
        </div>
      </div>

      {/* Main Course Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-xs font-montserrat uppercase tracking-wider text-[#99907c] font-semibold">
            Acciones Principales del Curso
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            type="button"
            onClick={onSwitchToStudentsTab}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1b1b1f] hover:bg-[#262629] text-[#D4AF37] border border-[#D4AF37]/30 hover:border-[#D4AF37]/50 text-xs font-montserrat uppercase tracking-wider font-semibold transition-all shadow-sm"
          >
            <Users className="w-4 h-4" />
            <span>Ver Lista de Inscritos ({totalEnrolledCount})</span>
          </button>

          <button 
            type="button"
            onClick={handleExportConsolidado}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1b1b1f] hover:bg-[#262629] text-white border border-[#262629] hover:border-[#353439] text-xs font-montserrat uppercase tracking-wider transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-[#D4AF37]" />
            <span>Descargar Consolidado (Excel)</span>
          </button>

          <button 
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#f2ca50] text-[#0A0A0E] text-xs font-montserrat uppercase tracking-wider font-bold shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Crear Asignación / Tarea</span>
          </button>
        </div>
      </div>

      {/* Module Selector Tabs */}
      <div className="p-2 rounded-xl bg-[#131317] border border-[#262629] flex items-center gap-2 overflow-x-auto shadow-sm">
        <button
          type="button"
          onClick={() => setActiveModuleTab('all')}
          className={`px-4 py-2.5 rounded-lg text-xs font-montserrat uppercase tracking-wider font-semibold whitespace-nowrap transition-colors ${
            activeModuleTab === 'all'
              ? 'bg-[#262629] text-[#D4AF37]'
              : 'text-[#99907c] hover:text-white hover:bg-[#1b1b1f]'
          }`}
        >
          Todas las Asignaciones (64)
        </button>

        <button
          type="button"
          onClick={() => setActiveModuleTab('mod1')}
          className={`px-4 py-2.5 rounded-lg text-xs font-montserrat uppercase tracking-wider font-semibold whitespace-nowrap transition-colors ${
            activeModuleTab === 'mod1'
              ? 'bg-[#262629] text-[#D4AF37]'
              : 'text-[#99907c] hover:text-white hover:bg-[#1b1b1f]'
          }`}
        >
          Proyecto 1: Arcilla & Modelado (15)
        </button>

        <button
          type="button"
          onClick={() => setActiveModuleTab('mod2')}
          className={`px-4 py-2.5 rounded-lg text-xs font-montserrat uppercase tracking-wider font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeModuleTab === 'mod2'
              ? 'bg-[#262629] text-amber-400'
              : 'text-[#99907c] hover:text-white hover:bg-[#1b1b1f]'
          }`}
        >
          <span>Proyecto 2: Esmaltado & Vidriado</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-montserrat bg-amber-400/20 text-amber-300">18</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveModuleTab('mod3')}
          className={`px-4 py-2.5 rounded-lg text-xs font-montserrat uppercase tracking-wider font-semibold whitespace-nowrap transition-colors ${
            activeModuleTab === 'mod3'
              ? 'bg-[#262629] text-[#D4AF37]'
              : 'text-[#99907c] hover:text-white hover:bg-[#1b1b1f]'
          }`}
        >
          Proyecto 3: Quema y Acabados (12)
        </button>

        <button
          type="button"
          onClick={() => setActiveModuleTab('bitacora')}
          className={`px-4 py-2.5 rounded-lg text-xs font-montserrat uppercase tracking-wider font-semibold whitespace-nowrap transition-colors ${
            activeModuleTab === 'bitacora'
              ? 'bg-[#262629] text-[#D4AF37]'
              : 'text-[#99907c] hover:text-white hover:bg-[#1b1b1f]'
          }`}
        >
          Bitácora Fotográfica (19)
        </button>
      </div>

      {/* Filters Strip */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-[#99907c] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar estudiante por nombre, cédula o proyecto..."
            className="w-full pl-11 pr-4 py-3 bg-[#131317] border border-[#262629] rounded-lg text-white text-xs placeholder:text-[#99907c]/50 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-3 bg-[#131317] border border-[#262629] rounded-lg text-white text-xs font-montserrat uppercase focus:outline-none focus:border-[#D4AF37] cursor-pointer"
          >
            <option value="todos">Estado: Todos los registros</option>
            <option value="pendiente">Estado: Pendiente de Calificar ({pendingGradingCount})</option>
            <option value="aprobado">Estado: Aprobado ({approvedCount})</option>
            <option value="correccion">Estado: Requiere Corrección</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={scheduleFilter}
            onChange={(e) => setScheduleFilter(e.target.value)}
            className="w-full px-4 py-3 bg-[#131317] border border-[#262629] rounded-lg text-white text-xs font-montserrat uppercase focus:outline-none focus:border-[#D4AF37] cursor-pointer"
          >
            <option value="todos">Horario: Todos los grupos</option>
            <option value="sabados">Sábados 9:00 a.m. (Presencial Taller)</option>
            <option value="martes">Martes 6:30 p.m. (Virtual Asincrónico)</option>
          </select>
        </div>

        <div className="md:col-span-1 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('todos');
              setScheduleFilter('todos');
              setActiveModuleTab('all');
            }}
            className="w-full py-3 px-3 rounded-lg bg-[#131317] border border-[#262629] hover:bg-[#1b1b1f] text-[#99907c] hover:text-white text-xs font-montserrat uppercase tracking-wider flex items-center justify-center gap-1 transition-colors"
            title="Restablecer filtros"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Classroom Workspace Grid (2 Columns: Evidence Deck + Grading Studio) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Evidence List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-montserrat uppercase tracking-widest text-[#99907c] font-semibold">
              Entregas Registradas ({filteredSubmissions.length} disponibles)
            </span>
            <span className="text-xs text-[#99907c]">
              Mostrando 1-{filteredSubmissions.length} de {totalDeliveries}
            </span>
          </div>

          {/* Active Selected Submission Card */}
          {activeSubmission && (
            <div className="p-6 rounded-xl bg-[#1b1b1f] border-2 border-[#D4AF37] shadow-xl relative overflow-hidden transition-all duration-200">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#D4AF37]"></div>

              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#806b23] text-[#0A0A0E] font-montserrat text-sm font-bold flex items-center justify-center shrink-0 shadow-md">
                    {activeSubmission.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-montserrat font-bold text-white text-lg">{activeSubmission.studentName}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-montserrat bg-[#D4AF37]/20 text-[#D4AF37] uppercase font-semibold">
                        Activa
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#99907c] mt-0.5">
                      <span>{activeSubmission.document}</span>
                      <span>•</span>
                      <span className="text-amber-400 font-medium">{activeSubmission.projectTitle}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-montserrat uppercase font-semibold ${
                    activeSubmission.status === 'Pendiente de Calificar'
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : activeSubmission.status === 'Corrección'
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {activeSubmission.status === 'Pendiente de Calificar' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                    )}
                    {activeSubmission.status}
                  </span>
                  <span className="text-[11px] text-[#99907c]">
                    {activeSubmission.submittedAt}
                  </span>
                </div>
              </div>

              {/* Submitted Photos & Gallery Preview */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs text-[#99907c]">
                  <span className="font-medium text-white">
                    {activeSubmission.photos.length} Archivos Fotográficos Adjuntos (HD):
                  </span>
                  <span className="text-[#D4AF37] text-[11px] font-montserrat uppercase tracking-wider font-semibold">
                    Haga clic para ampliar
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {activeSubmission.photos.map((photo, i) => (
                    <div 
                      key={i}
                      onClick={() => setLightboxImage(photo)}
                      className="group relative rounded-lg overflow-hidden h-28 bg-[#0e0e12] border border-[#262629] shadow-inner cursor-pointer"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={photo.url} 
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex items-end p-2">
                        <span className="text-[10px] font-montserrat text-white truncate">{photo.title}</span>
                      </div>
                      <div className="absolute inset-0 bg-[#D4AF37]/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <ZoomIn className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Student Narrative Notes */}
              {activeSubmission.studentNote && (
                <div className="p-3.5 rounded-lg bg-[#131317] border border-[#262629] text-xs text-[#d0c5af] flex items-start gap-2.5">
                  <MessageSquare className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-white font-medium">Nota del estudiante:</strong> &quot;{activeSubmission.studentNote}&quot;
                  </p>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-[#262629] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-[11px] font-montserrat uppercase tracking-wider text-[#99907c]">
                    {activeSubmission.badge || 'Estudiante Regular Matriculado'}
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 text-[#D4AF37] text-xs font-montserrat uppercase font-semibold">
                  <span>Seleccionado para Calificar</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
                </div>
              </div>
            </div>
          )}

          {/* List of other secondary submissions */}
          {filteredSubmissions
            .filter(sub => sub.id !== activeSubmission?.id)
            .map((sub) => (
              <div 
                key={sub.id}
                className="p-5 rounded-xl bg-[#131317] border border-[#262629] hover:border-[#D4AF37]/40 transition-colors shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#1b1b1f] border border-[#262629] text-white font-montserrat text-xs font-bold flex items-center justify-center shrink-0">
                    {sub.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-montserrat font-semibold text-white text-base">{sub.studentName}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-montserrat bg-[#1b1b1f] text-[#99907c] uppercase">
                        {sub.groupSchedule === 'sabados' ? 'Sábados' : 'Martes'}
                      </span>
                    </div>
                    <p className="text-xs text-[#99907c]">{sub.document} • Tarea: {sub.projectTitle}</p>
                    <p className="text-[11px] text-[#99907c]/70 mt-0.5">
                      {sub.submittedAt}
                    </p>
                    {sub.correctionNote && (
                      <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {sub.correctionNote}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end md:self-center shrink-0">
                  {sub.score ? (
                    <div className="text-right">
                      <span className="font-montserrat font-bold text-lg text-[#D4AF37]">{sub.score.toFixed(1)}</span>
                      <span className="text-xs text-[#99907c]"> / 5.0</span>
                      <div className={`text-[10px] font-montserrat uppercase font-semibold mt-0.5 ${
                        sub.status === 'Distinción' ? 'text-amber-300' : 'text-emerald-400'
                      }`}>
                        {sub.badge || 'Aprobado'}
                      </div>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => handleSelectSubmission(sub)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#1b1b1f] hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#0A0A0E] border border-[#262629] text-xs font-montserrat uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Evaluar</span>
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* Right Column: Sticky Grading Studio / Panel (5 cols) */}
        <div className="lg:col-span-5 sticky top-6 space-y-6">
          <div className="p-6 rounded-2xl bg-[#131317] border border-[#D4AF37]/40 shadow-2xl relative overflow-hidden">
            {/* Studio Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#262629]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-montserrat text-base text-white font-semibold">Panel de Calificación</h3>
                  <p className="text-[10px] font-montserrat uppercase tracking-wider text-[#99907c]">Rúbrica Oficial Principio & Fin</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-montserrat font-semibold uppercase">
                En Calificación
              </span>
            </div>

            {/* Active Evaluating Target */}
            <div className="py-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#99907c]">Estudiante en Mesa:</span>
                <p className="font-montserrat font-bold text-white text-base">{activeSubmission.studentName}</p>
                <p className="text-xs text-[#D4AF37] mt-0.5">{activeSubmission.projectTitle}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#99907c]">Puntaje Calculado:</span>
                <div className="flex items-baseline justify-end gap-1">
                  <span className="text-3xl font-montserrat font-extrabold text-[#D4AF37]">{calculatedScore}</span>
                  <span className="text-xs text-[#99907c]">/ 5.0</span>
                </div>
              </div>
            </div>

            {/* Rubric Criteria Sliders */}
            <div className="space-y-4">
              {/* Criterion 1 */}
              <div className="p-4 rounded-xl bg-[#1b1b1f] border border-[#262629] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-montserrat uppercase tracking-wider text-white font-semibold">
                      1. Técnica de Modelado y Simetría
                    </h4>
                    <p className="text-[11px] text-[#99907c]">Consistencia de grosor, unión de piezas y estabilidad.</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-[#262629] font-montserrat text-sm font-bold text-[#D4AF37]">
                    {crit1.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.1"
                  value={crit1}
                  onChange={(e) => setCrit1(parseFloat(e.target.value))}
                  className="w-full accent-[#D4AF37] h-1.5 bg-[#262629] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#99907c]">
                  <span>1.0 (Deficiente)</span>
                  <span>3.0 (Aceptable)</span>
                  <span>5.0 (Excelente)</span>
                </div>
              </div>

              {/* Criterion 2 */}
              <div className="p-4 rounded-xl bg-[#1b1b1f] border border-[#262629] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-montserrat uppercase tracking-wider text-white font-semibold">
                      2. Acabado y Uniformidad de Esmalte
                    </h4>
                    <p className="text-[11px] text-[#99907c]">Vidriado homogéneo, sin burbujas ni cuarteaduras térmicas.</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-[#262629] font-montserrat text-sm font-bold text-[#D4AF37]">
                    {crit2.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.1"
                  value={crit2}
                  onChange={(e) => setCrit2(parseFloat(e.target.value))}
                  className="w-full accent-[#D4AF37] h-1.5 bg-[#262629] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#99907c]">
                  <span>1.0 (Deficiente)</span>
                  <span>3.0 (Aceptable)</span>
                  <span>5.0 (Excelente)</span>
                </div>
              </div>

              {/* Criterion 3 */}
              <div className="p-4 rounded-xl bg-[#1b1b1f] border border-[#262629] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-montserrat uppercase tracking-wider text-white font-semibold">
                      3. Creatividad & Narrativa Comunitaria
                    </h4>
                    <p className="text-[11px] text-[#99907c]">Aporte simbólico y relato identitario del oficio artesanal.</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-[#262629] font-montserrat text-sm font-bold text-[#D4AF37]">
                    {crit3.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.1"
                  value={crit3}
                  onChange={(e) => setCrit3(parseFloat(e.target.value))}
                  className="w-full accent-[#D4AF37] h-1.5 bg-[#262629] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#99907c]">
                  <span>1.0 (Deficiente)</span>
                  <span>3.0 (Aceptable)</span>
                  <span>5.0 (Excelente)</span>
                </div>
              </div>

              {/* Definitive Direct Grade Override Input */}
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
                    Retroalimentación Pedagógica y Orientación:
                  </label>
                  <span className="text-[10px] text-[#99907c]">Visible al estudiante</span>
                </div>
                <textarea
                  rows={3}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Escribe comentarios constructivos para el estudiante..."
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

          {/* Mini Notice */}
          <div className="p-4 rounded-xl bg-[#131317] border border-[#262629] flex items-center gap-3">
            <Bell className="w-5 h-5 text-[#D4AF37] shrink-0" />
            <p className="text-xs text-[#99907c] leading-relaxed">
              Al guardar, se enviará una notificación por correo electrónico y el boletín de calificaciones se actualizará automáticamente en el perfil del estudiante.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Module: Pedagogical Support & Certification Criteria */}
      <div className="p-8 rounded-2xl bg-[#131317] border border-[#262629] relative overflow-hidden space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-1 rounded text-[10px] font-montserrat bg-[#D4AF37]/20 text-[#D4AF37] uppercase font-semibold">
            Marco Académico 2026
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
              Requisitos oficiales validados para la emisión del certificado de formación técnica y artística comunitaria. Conoce los lineamientos de calificación y seguimiento pedagógico vigentes.
            </p>
          </div>
        </div>
      </div>

      {/* Create Assignment Modal */}
      <CreateAssignmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        courseTitle={courseTitle}
        onAssignmentCreated={(asg) => {
          showToast(`¡Asignación "${asg.title}" creada y publicada con éxito!`);
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
