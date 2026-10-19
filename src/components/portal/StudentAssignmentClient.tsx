'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Clock, 
  FileText, 
  Download, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  FolderOpen, 
  Send, 
  Loader2, 
  Save, 
  HelpCircle,
  FileCheck,
  Check,
  Layers,
  Flame,
  Users,
  Award,
  AlertTriangle,
  RotateCcw,
  MessageSquareQuote,
  CheckCheck
} from 'lucide-react';
import { submitAssignmentAction } from '@/app/(portal)/portal/actividad/[id]/actions';

export interface RubricItem {
  number?: string;
  title: string;
  weight: number;
  desc: string;
}

export interface ActivityData {
  id: string;
  courseId: string;
  courseTitle: string;
  moduleTitle: string;
  activityCode: string;
  title: string;
  instructions: string;
  dueAt: string;
  dueFormatted: string;
  daysRemainingText: string;
  weightPercent: number;
  maxScore: number;
  instructorName: string;
  instructorRole: string;
  rubricCriteria: RubricItem[];
  supportFiles: {
    name: string;
    size: string;
    type: string;
    tag: string;
    url?: string;
  }[];
  objectives: {
    title: string;
    desc: string;
    icon: string;
  }[];
  currentSubmission?: {
    id: string;
    status: 'borrador' | 'entregada' | 'calificada' | string;
    submittedAt?: string | null;
    score?: number | null;
    maxScore?: number | null;
    feedback?: string | null;
    rubricScores?: Record<string, number> | null;
    gradedAt?: string | null;
    projectTitle?: string | null;
    textContent?: string | null;
    fileName?: string | null;
    fileSize?: string | null;
    fileUrl?: string | null;
  } | null;
}

interface StudentAssignmentClientProps {
  activity: ActivityData;
  userProfile: {
    id: string;
    email: string;
    fullName: string;
  };
  enrollmentId?: string | null;
}

export function StudentAssignmentClient({
  activity,
  userProfile,
  enrollmentId,
}: StudentAssignmentClientProps) {
  const router = useRouter();

  // Submission form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>(
    activity.currentSubmission?.fileName || ''
  );
  const [selectedFileSize, setSelectedFileSize] = useState<string>(
    activity.currentSubmission?.fileSize || ''
  );
  const [comments, setComments] = useState<string>(
    activity.currentSubmission?.textContent || ''
  );

  const [submissionStatus, setSubmissionStatus] = useState<string>(
    activity.currentSubmission?.status || 'pendiente'
  );

  // Estado local detallado de la entrega para actualizar la UI inmediatamente tras enviar
  const [submittedDetails, setSubmittedDetails] = useState({
    projectTitle: activity.currentSubmission?.projectTitle || activity.title,
    textContent: activity.currentSubmission?.textContent || '',
    fileName: activity.currentSubmission?.fileName || '',
    fileSize: activity.currentSubmission?.fileSize || '',
    fileUrl: activity.currentSubmission?.fileUrl || null,
    submittedAt: activity.currentSubmission?.submittedAt || null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNoFileConfirmModal, setShowNoFileConfirmModal] = useState(false);
  const [showResubmitForm, setShowResubmitForm] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'warning';
    text: string;
  } | null>(null);

  const isGraded = submissionStatus === 'calificada';
  const isSubmitted = submissionStatus === 'entregada';
  const isDraft = submissionStatus === 'borrador';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setSelectedFileName(file.name);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setSelectedFileSize(`${sizeMb} MB - Listo para enviar`);
      setStatusMessage(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setSelectedFileName('');
    setSelectedFileSize('');
  };

  // Validación y confirmación antes de enviar
  const handleInitiateSubmission = (status: 'borrador' | 'entregada') => {
    // Si se envía entrega definitiva y no hay archivo adjunto, mostrar advertencia confirmatoria
    if (status === 'entregada' && !selectedFile && !selectedFileName) {
      setShowNoFileConfirmModal(true);
      return;
    }

    executeSubmission(status);
  };

  // Envío real a través del Server Action seguro
  const executeSubmission = async (status: 'borrador' | 'entregada') => {
    setShowNoFileConfirmModal(false);
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const formData = new FormData();
      formData.append('assignmentId', activity.id);
      formData.append('courseId', activity.courseId);
      formData.append('status', status);
      formData.append('textContent', comments.trim());
      formData.append('projectTitle', activity.title);

      if (enrollmentId) {
        formData.append('enrollmentId', enrollmentId);
      }

      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      if (selectedFileName) {
        formData.append('existingFileName', selectedFileName);
      }

      const result = await submitAssignmentAction(formData);

      if (!result.success) {
        throw new Error(result.error || 'Ocurrió un error al procesar tu entrega.');
      }

      // Actualizar detalles locales de la entrega
      setSubmittedDetails({
        projectTitle: activity.title,
        textContent: comments.trim(),
        fileName: selectedFile ? selectedFile.name : selectedFileName,
        fileSize: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : selectedFileSize,
        fileUrl: result.fileUrl || submittedDetails.fileUrl,
        submittedAt: new Date().toISOString(),
      });

      // Limpiar archivo pendiente de subida
      if (selectedFile) {
        setSelectedFileName(selectedFile.name);
        setSelectedFile(null);
      }

      setSubmissionStatus(status);
      setShowResubmitForm(false);

      setStatusMessage({
        type: 'success',
        text: status === 'entregada'
          ? (!selectedFile && !selectedFileName
              ? '¡Tu entrega ha sido radicada con éxito sin archivo adjunto! Tu docente evaluará tu justificación escrita.'
              : '¡Tu entrega ha sido enviada con éxito! Tu docente revisará el proyecto según los criterios de la rúbrica.')
          : 'Borrador guardado correctamente. Puedes continuar editando antes de la fecha límite.',
      });

      router.refresh();
    } catch (err: any) {
      console.error('Error al guardar submission:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Ocurrió un error al procesar tu entrega. Inténtalo de nuevo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getObjectiveIcon = (iconName: string) => {
    switch (iconName) {
      case 'modelado':
        return <Layers className="w-5 h-5 text-[#D4AF37]" />;
      case 'horno':
        return <Flame className="w-5 h-5 text-[#D4AF37]" />;
      case 'comunidad':
      default:
        return <Users className="w-5 h-5 text-[#D4AF37]" />;
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      
      {/* Modal de Advertencia: Entrega sin archivo adjunto */}
      {showNoFileConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold font-montserrat text-white">
                  ¿Entregar actividad sin archivo adjunto?
                </h3>
                <p className="text-xs text-[#99907c] leading-relaxed">
                  No has adjuntado ningún documento, fotografía o archivo a esta entrega. Se enviará únicamente con la justificación y los comentarios escritos que redactaste.
                </p>
              </div>
            </div>

            {/* Vista previa de las notas */}
            <div className="p-3.5 rounded-xl bg-[#1b1b1f] border border-[#262629] space-y-1.5">
              <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#99907c] font-bold block">
                Comentarios / Justificación que se enviarán:
              </span>
              {comments.trim() ? (
                <p className="text-xs text-white leading-relaxed line-clamp-3 italic">
                  "{comments.trim()}"
                </p>
              ) : (
                <p className="text-xs text-amber-300/80 leading-relaxed italic">
                  ⚠️ No has ingresado ningún comentario ni justificación escrita. Se registrará la entrega vacía.
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNoFileConfirmModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#1b1b1f] hover:bg-[#262629] text-white text-xs font-montserrat uppercase font-semibold tracking-wider transition-colors border border-[#262629]"
              >
                Volver y adjuntar archivo
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => executeSubmission('entregada')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#F5D77A] text-[#0A0A0E] text-xs font-montserrat uppercase font-bold tracking-wider transition-colors shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <span>Sí, entregar sin archivo</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Barra de Navegación / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262629] pb-4">
        <div className="flex items-center gap-3 text-xs text-[#99907c]">
          <Link
            href={`/portal/cursos/${activity.courseId}`}
            className="inline-flex items-center gap-1.5 text-white hover:text-[#D4AF37] font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al aula del curso</span>
          </Link>
          <span>/</span>
          <span className="text-[#d0c5af]">{activity.courseTitle}</span>
          <span>/</span>
          <span className="text-[#d0c5af]">{activity.moduleTitle}</span>
          <span>/</span>
          <span className="text-[#D4AF37] font-medium">{activity.activityCode}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1b1b1f] border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] font-montserrat uppercase tracking-wider font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
            Convocatoria Activa
          </span>
        </div>
      </div>

      {/* 2. Cabecera Principal de la Actividad */}
      <div className="space-y-4">
        <p className="text-[10px] font-montserrat uppercase tracking-[0.25em] text-[#D4AF37] font-semibold flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
          CURSO PRÁCTICO • {activity.moduleTitle.toUpperCase()}
        </p>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold font-montserrat tracking-tight text-white leading-tight">
          {activity.title}
        </h1>

        {/* Badges de Estado, Ponderación y Fecha Límite */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {isGraded ? (
            <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-montserrat uppercase tracking-wider font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/10">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>
                CALIFICADA · NOTA: {(activity.currentSubmission?.score ?? 5).toFixed(1)} / {(activity.maxScore ?? 5).toFixed(1)}
              </span>
            </span>
          ) : isSubmitted ? (
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-montserrat uppercase tracking-wider font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
              <FileCheck className="w-4 h-4 text-blue-400" />
              <span>ENTREGADA (EN REVISIÓN)</span>
            </span>
          ) : isDraft ? (
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-montserrat uppercase tracking-wider font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>BORRADOR GUARDADO</span>
            </span>
          ) : (
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-montserrat uppercase tracking-wider font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
              <Clock className="w-4 h-4 text-[#D4AF37]" />
              <span>PENDIENTE DE ENTREGA</span>
            </span>
          )}

          <span className="px-3 py-1.5 rounded-lg text-xs font-montserrat uppercase tracking-wider font-semibold bg-[#17171a] border border-[#262629] text-[#d0c5af]">
            PONDERACIÓN: {activity.weightPercent}% DE LA NOTA FINAL
          </span>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-montserrat bg-[#17171a] border border-[#262629] text-[#99907c]">
            <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>
              FECHA LÍMITE: <strong className="text-white">{activity.dueFormatted}</strong>{' '}
              <span className="text-[#D4AF37]">({activity.daysRemainingText})</span>
            </span>
          </div>
        </div>

        {/* Tarjeta del Docente Formador */}
        <div className="p-4 rounded-xl bg-[#17171a] border border-[#262629] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1b1b1f] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-montserrat font-bold text-sm shrink-0">
              {activity.instructorName
                .split(' ')
                .map(n => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div>
              <p className="text-sm font-bold font-montserrat text-white">
                {activity.instructorName}
              </p>
              <p className="text-[11px] font-montserrat uppercase tracking-wider text-[#99907c]">
                {activity.instructorRole}
              </p>
            </div>
          </div>

          <a
            href={`mailto:soporte@principioyfin.org?subject=Consulta%20Pedagogica%20Actividad%20${activity.activityCode}`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#1b1b1f] hover:bg-[#262629] border border-[#262629] text-white hover:text-[#D4AF37] text-xs font-montserrat uppercase tracking-wider font-semibold transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Contacto Pedagógico</span>
          </a>
        </div>
      </div>

      {/* 3. Grid de Contenido Principal (2 Columnas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Columna Izquierda: Consigna, Materiales y Rúbrica (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card: Consigna y Objetivos de Aprendizaje */}
          <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#262629]">
              <FileText className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="text-lg font-bold font-montserrat text-white">
                Consigna y Objetivos de Aprendizaje
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-[#d0c5af] leading-relaxed whitespace-pre-line">
              {activity.instructions}
            </p>

            <div className="space-y-3 pt-2">
              {activity.objectives.map((obj, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#1b1b1f] border border-[#262629] flex items-start gap-3.5"
                >
                  <div className="p-2 rounded-lg bg-[#262629] shrink-0 mt-0.5">
                    {getObjectiveIcon(obj.icon)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold font-montserrat uppercase tracking-wider text-white">
                      {obj.title}
                    </p>
                    <p className="text-xs text-[#99907c] leading-relaxed">
                      {obj.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Material de Apoyo y Documentos de Referencia */}
          <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#262629]">
              <FolderOpen className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="text-lg font-bold font-montserrat text-white">
                Material de Apoyo y Documentos de Referencia
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activity.supportFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#1b1b1f] border border-[#262629] hover:border-[#D4AF37]/30 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#262629] flex items-center justify-center text-[#D4AF37] shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-[10px] text-[#99907c] uppercase tracking-wider mt-0.5">
                        {file.type} • {file.size} • {file.tag}
                      </p>
                    </div>
                  </div>

                  <a
                    href={file.url || '#'}
                    download
                    onClick={(e) => {
                      if (!file.url) {
                        e.preventDefault();
                        alert(`Descargando documento de referencia: ${file.name}`);
                      }
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-lg bg-[#262629] hover:bg-[#333338] text-white hover:text-[#D4AF37] text-xs font-montserrat uppercase font-semibold tracking-wider transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar {file.tag.toLowerCase()}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Criterios de Evaluación / Rúbrica */}
          <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#262629]">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-lg font-bold font-montserrat text-white">
                  Criterios de Evaluación
                </h2>
              </div>
              <span className="bg-[#1b1b1f] text-[#D4AF37] text-[10px] font-montserrat font-bold uppercase tracking-wider px-2.5 py-1 rounded border border-[#D4AF37]/30">
                Escala {(activity.maxScore ?? 5.0).toFixed(1)} Puntos
              </span>
            </div>

            <div className="space-y-3">
              {activity.rubricCriteria.map((c, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#1b1b1f] border border-[#262629] flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-bold font-montserrat text-white flex items-center gap-2">
                      <span className="text-[#D4AF37]">{c.number || `0${idx + 1}`}</span>
                      <span>{c.title}</span>
                    </p>
                    <p className="text-xs text-[#99907c] leading-relaxed">
                      {c.desc}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-[#262629] font-mono text-xs font-bold text-[#D4AF37] shrink-0">
                    {c.weight}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Zona de Entrega, Revisión o Calificación (5 cols) */}
        <div className="lg:col-span-5 space-y-6">

          {/* Mensajes de feedback globales */}
          {statusMessage && (
            <div className={`p-4 rounded-xl text-xs flex items-center gap-2.5 animate-fadeIn ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                : statusMessage.type === 'warning'
                ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : statusMessage.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}
          
          {/* CASO 1: SI LA ACTIVIDAD YA ESTÁ CALIFICADA */}
          {isGraded && !showResubmitForm ? (
            <div className="space-y-6">
              
              {/* Tarjeta Destacada de Calificación Obtenida */}
              <div className="bg-[#17171a] border border-emerald-500/30 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between pb-3 border-b border-[#262629]">
                  <div className="flex items-center gap-2.5">
                    <Award className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-lg font-bold font-montserrat text-white">
                      Calificación Oficial
                    </h2>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-montserrat font-bold uppercase tracking-wider">
                    Evaluada
                  </span>
                </div>

                {/* Score Card Hero */}
                <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-500/10 via-[#1b1b1f] to-[#17171a] border border-emerald-500/20 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-montserrat uppercase tracking-widest text-emerald-400 font-bold block">
                      Nota Asignada
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-black font-montserrat text-white tracking-tight">
                        {(activity.currentSubmission?.score ?? 5).toFixed(1)}
                      </span>
                      <span className="text-sm sm:text-base font-montserrat text-[#99907c] font-semibold">
                        / {(activity.maxScore ?? 5).toFixed(1)}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-300 font-medium pt-1">
                      {(activity.currentSubmission?.score ?? 0) >= 4.5
                        ? '★ Desempeño Sobresaliente'
                        : (activity.currentSubmission?.score ?? 0) >= 3.0
                        ? '✓ Actividad Aprobada'
                        : 'Evaluación Completada'}
                    </p>
                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex flex-col items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-7 h-7" />
                    <span className="text-[9px] font-mono font-bold uppercase mt-1">100% OK</span>
                  </div>
                </div>

                {/* Retroalimentación del Docente */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-2 text-white font-montserrat font-bold text-xs uppercase tracking-wider">
                    <MessageSquareQuote className="w-4 h-4 text-[#D4AF37]" />
                    <span>Retroalimentación del Docente</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#1b1b1f] border border-[#262629] space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-bold text-[11px]">
                        {activity.instructorName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white font-montserrat">
                          {activity.instructorName}
                        </p>
                        <p className="text-[10px] text-[#99907c]">Docente Evaluador</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[#141417] border border-[#262629] text-xs text-[#d0c5af] leading-relaxed italic">
                      "{activity.currentSubmission?.feedback || 'Actividad revisada y aprobada satisfactoriamente con base en los estándares pedagógicos del taller.'}"
                    </div>
                  </div>
                </div>

                {/* Detalle de la Entrega Realizada */}
                <div className="space-y-2 pt-2 border-t border-[#262629]">
                  <p className="text-[11px] font-montserrat uppercase tracking-wider text-[#99907c] font-semibold">
                    Evidencias y Proyecto Evaluado
                  </p>

                  <div className="p-4 rounded-xl bg-[#1b1b1f] border border-[#262629] space-y-3">
                    {activity.currentSubmission?.projectTitle && (
                      <p className="text-xs font-bold text-white font-montserrat">
                        {activity.currentSubmission.projectTitle}
                      </p>
                    )}

                    {activity.currentSubmission?.textContent && (
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-montserrat tracking-wider text-[#99907c]">
                          Notas y Justificación del Estudiante:
                        </span>
                        <p className="text-xs text-[#d0c5af] leading-relaxed bg-[#141417] p-2.5 rounded-lg border border-[#262629]">
                          {activity.currentSubmission.textContent}
                        </p>
                      </div>
                    )}

                    {activity.currentSubmission?.fileName ? (
                      <div className="p-3 rounded-lg bg-[#141417] border border-[#262629] flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                            <FileCheck className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">
                              {activity.currentSubmission.fileName}
                            </p>
                            <p className="text-[10px] text-[#99907c]">
                              {activity.currentSubmission.fileSize || 'Archivo adjunto entregado'}
                            </p>
                          </div>
                        </div>

                        {activity.currentSubmission?.fileUrl && (
                          <a
                            href={activity.currentSubmission.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#262629] hover:bg-[#333338] text-white hover:text-[#D4AF37] text-xs font-montserrat font-semibold transition-colors shrink-0"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Ver archivo</span>
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-lg bg-[#141417] border border-[#262629] flex items-center gap-2 text-[11px] text-[#99907c]">
                        <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Entrega radicada únicamente con justificación escrita (sin archivo adjunto).</span>
                      </div>
                    )}

                    {activity.currentSubmission?.submittedAt && (
                      <p className="text-[10px] text-[#99907c] pt-1">
                        Entregado el: {new Date(activity.currentSubmission.submittedAt).toLocaleDateString('es-CO', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Botón para habilitar reenvío si se desea */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResubmitForm(true)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1b1b1f] hover:bg-[#262629] border border-[#262629] text-[#99907c] hover:text-white text-xs font-montserrat uppercase font-semibold tracking-wider transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Modificar o realizar nueva entrega</span>
                  </button>
                </div>

                {/* Aviso de Código de Ética */}
                <div className="flex items-center gap-2 text-[10px] text-[#99907c] pt-2 border-t border-[#262629]">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Calificación oficial registrada en el expediente de la Fundación Principio & Fin.
                  </span>
                </div>
              </div>

              {/* Card de Estado del Aula */}
              <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-6 shadow-xl space-y-3">
                <div className="flex items-center gap-2 text-white font-montserrat font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Estado Académico</span>
                </div>

                <p className="text-xs text-[#99907c] leading-relaxed">
                  Esta actividad ha completado su ciclo de evaluación. La nota ponderada ({activity.weightPercent}%) se ha sumado a tu promedio general del curso.
                </p>

                <div className="pt-2 border-t border-[#262629] flex items-center justify-between text-[11px] text-[#99907c]">
                  <span>Estado:</span>
                  <span className="text-emerald-400 font-semibold uppercase">
                    Cerrada con Calificación
                  </span>
                </div>
              </div>
            </div>
          ) : isSubmitted && !showResubmitForm ? (
            /* CASO 2: ACTIVIDAD ENTREGADA (EN REVISIÓN) */
            <div className="space-y-6 animate-fadeIn">
              
              {/* Tarjeta de Entrega Radicada */}
              <div className="bg-[#17171a] border border-blue-500/30 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between pb-3 border-b border-[#262629]">
                  <div className="flex items-center gap-2.5">
                    <CheckCheck className="w-5 h-5 text-blue-400" />
                    <h2 className="text-lg font-bold font-montserrat text-white">
                      Entrega Radicada
                    </h2>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[10px] font-montserrat font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                    En Revisión
                  </span>
                </div>

                {/* Banner de Estado */}
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 leading-relaxed flex items-start gap-3">
                  <FileCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">¡Tu entrega se encuentra en poder de la docente!</p>
                    <p className="text-[11px] text-blue-200/80 mt-0.5">
                      El proyecto será evaluado de acuerdo con los criterios y rúbricas del curso. Una vez calificado, verás aquí la nota y las observaciones pedagógicas.
                    </p>
                  </div>
                </div>

                {/* Resumen de los Datos Enviados */}
                <div className="space-y-3 pt-1">
                  <p className="text-[11px] font-montserrat uppercase tracking-wider text-[#99907c] font-semibold">
                    Detalles de la Entrega Enviada
                  </p>

                  <div className="p-4 rounded-xl bg-[#1b1b1f] border border-[#262629] space-y-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#99907c] block">
                        Proyecto / Asignación:
                      </span>
                      <p className="text-xs font-bold text-white font-montserrat">
                        {submittedDetails.projectTitle}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#99907c] block">
                        Justificación y Notas Escritas:
                      </span>
                      {submittedDetails.textContent ? (
                        <p className="text-xs text-[#d0c5af] leading-relaxed bg-[#141417] p-3 rounded-lg border border-[#262629] italic">
                          "{submittedDetails.textContent}"
                        </p>
                      ) : (
                        <p className="text-xs text-[#99907c] italic">Sin notas escritas adicionales.</p>
                      )}
                    </div>

                    {/* Archivo entregado o nota de entrega sin archivo */}
                    <div className="pt-1">
                      <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#99907c] block mb-1.5">
                        Archivo Adjunto:
                      </span>
                      {submittedDetails.fileName ? (
                        <div className="p-3 rounded-lg bg-[#141417] border border-[#262629] flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                              <FileCheck className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">
                                {submittedDetails.fileName}
                              </p>
                              <p className="text-[10px] text-[#99907c]">
                                {submittedDetails.fileSize || 'Archivo radicado'}
                              </p>
                            </div>
                          </div>

                          {submittedDetails.fileUrl && (
                            <a
                              href={submittedDetails.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#262629] hover:bg-[#333338] text-white hover:text-[#D4AF37] text-xs font-montserrat font-semibold transition-colors shrink-0"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Ver archivo</span>
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-lg bg-[#141417] border border-[#262629] flex items-center gap-2 text-[11px] text-[#d0c5af]">
                          <Check className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                          <span>Entrega radicada únicamente con justificación y notas escritas (sin archivo adjunto).</span>
                        </div>
                      )}
                    </div>

                    {submittedDetails.submittedAt && (
                      <p className="text-[10px] text-[#99907c] pt-2 border-t border-[#262629] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>
                          Radicada el {new Date(submittedDetails.submittedAt).toLocaleDateString('es-CO', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Botón para modificar la entrega si es necesario */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResubmitForm(true)}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1b1b1f] hover:bg-[#262629] border border-[#262629] hover:border-[#D4AF37]/40 text-white text-xs font-montserrat uppercase font-semibold tracking-wider transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Modificar o reemplazar entrega</span>
                  </button>
                  <p className="text-[10px] text-[#99907c] text-center pt-2">
                    Puedes actualizar tu justificación o reemplazar archivos mientras la docente no haya calificado.
                  </p>
                </div>

                {/* Aviso de Código de Ética */}
                <div className="flex items-center gap-2 text-[10px] text-[#99907c] pt-2 border-t border-[#262629]">
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>
                    Entrega radicada bajo el Código de Ética y Honradez Comunitaria de la Fundación Principio & Fin.
                  </span>
                </div>
              </div>

              {/* Card de Estado del Aula */}
              <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-6 shadow-xl space-y-3">
                <div className="flex items-center gap-2 text-white font-montserrat font-bold text-xs uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4 text-[#D4AF37]" />
                  <span>Estado de la Convocatoria</span>
                </div>

                <p className="text-xs text-[#99907c] leading-relaxed">
                  Tu entrega se encuentra registrada de manera formal. Puedes revisar el material de apoyo o consultar al docente si tienes inquietudes adicionales.
                </p>

                <div className="pt-2 border-t border-[#262629] flex items-center justify-between text-[11px] text-[#99907c]">
                  <span>Fecha límite del módulo:</span>
                  <span className="text-white font-semibold">
                    {activity.dueFormatted}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* CASO 3: FORMULARIO DE ENTREGA (NUEVA ENTREGA O EDICIÓN EXPLÍCITA) */
            <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-6 sm:p-7 shadow-xl space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-[#262629]">
                <div className="flex items-center gap-2.5">
                  <Upload className="w-5 h-5 text-[#D4AF37]" />
                  <h2 className="text-lg font-bold font-montserrat text-white">
                    {isSubmitted
                      ? 'Modificar Entrega Radicada'
                      : isDraft
                      ? 'Borrador de Entrega'
                      : 'Tu Entrega'}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {(isGraded || isSubmitted) && (
                    <button
                      type="button"
                      onClick={() => setShowResubmitForm(false)}
                      className="text-[10px] text-[#D4AF37] hover:underline font-montserrat font-semibold uppercase"
                    >
                      Cancelar edición
                    </button>
                  )}
                  <span className="bg-[#1b1b1f] text-[#D4AF37] text-[10px] font-montserrat font-bold uppercase tracking-wider px-2.5 py-1 rounded border border-[#D4AF37]/30">
                    {isSubmitted ? 'Editando' : isDraft ? 'Borrador' : '1er Intento'}
                  </span>
                </div>
              </div>

              {/* Banner si está editando entrega ya radicada */}
              {isSubmitted && (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 leading-relaxed">
                  Estás editando tu entrega radicada. Al presionar <strong>"Actualizar Entrega"</strong> se guardarán tus nuevas observaciones o archivos para la revisión de la docente.
                </div>
              )}

              {/* Banner informativo de archivo opcional */}
              <div className="p-3 rounded-xl bg-[#1b1b1f] border border-[#262629] flex items-start gap-2.5 text-xs text-[#99907c]">
                <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-[#d0c5af]">Adjuntar archivo es opcional:</strong> Puedes subir un archivo (PDF, fotos, ZIP) o enviar únicamente tu justificación y observaciones escritas.
                </p>
              </div>

              {/* Dropzone de carga de archivos */}
              <div className="border-2 border-dashed border-[#262629] hover:border-[#D4AF37]/50 rounded-2xl p-6 text-center space-y-2.5 bg-[#1b1b1f]/60 transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#262629] flex items-center justify-center text-[#D4AF37] mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs text-white font-medium">
                  Arrastra tus archivos aquí o{' '}
                  <label className="text-[#D4AF37] hover:underline font-bold cursor-pointer">
                    examinar equipo
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.zip,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </p>
                <p className="text-[11px] text-[#99907c] max-w-xs mx-auto leading-relaxed">
                  Sube fotos HD de tu pieza y tu bitácora técnica (opcional)
                </p>
                <span className="inline-block text-[9px] font-mono uppercase bg-[#17171a] px-2.5 py-0.5 rounded text-[#99907c] border border-[#262629]">
                  PDF, JPG, PNG, ZIP (MÁX. 25 MB POR ARCHIVO)
                </span>
              </div>

              {/* Chip de Archivo Seleccionado */}
              {selectedFileName && (
                <div className="p-3.5 rounded-xl bg-[#1b1b1f] border border-[#262629] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate" title={selectedFileName}>
                        {selectedFileName}
                      </p>
                      <p className="text-[10px] text-[#99907c]">
                        {selectedFileSize || 'Archivo seleccionado'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1.5 rounded-lg hover:bg-[#262629] text-[#99907c] hover:text-rose-400 transition-colors"
                    title="Quitar archivo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Textarea de Notas al Docente */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-montserrat uppercase tracking-wider text-[#99907c] font-semibold block">
                  Comentarios, justificación o notas para {activity.instructorName}
                </label>
                <textarea
                  rows={4}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Escribe aquí tus observaciones técnicas, particularidades de los barros locales, temperaturas o justificación del proyecto..."
                  className="w-full bg-[#0A0A0E] border border-[#262629] rounded-xl p-3.5 text-xs text-white placeholder-[#5a564d] focus:border-[#D4AF37] focus:outline-none transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* Botones de Envío */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleInitiateSubmission('entregada')}
                  className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#F5D77A] text-[#0A0A0E] py-3.5 rounded-xl font-montserrat text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 shadow-lg shadow-[#D4AF37]/20"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isSubmitted ? 'Actualizando Entrega...' : 'Enviando Entrega...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{isSubmitted ? 'Actualizar Entrega Radicada' : 'Enviar Entrega de la Actividad'}</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>

                {isSubmitted ? (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setShowResubmitForm(false)}
                    className="w-full flex items-center justify-center gap-2 bg-[#1b1b1f] hover:bg-[#262629] border border-[#262629] text-[#99907c] hover:text-white py-3 rounded-xl font-montserrat text-xs font-semibold uppercase tracking-wider transition-all"
                  >
                    <span>Cancelar y volver a la entrega radicada</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleInitiateSubmission('borrador')}
                    className="w-full flex items-center justify-center gap-2 bg-[#1b1b1f] hover:bg-[#262629] border border-[#262629] text-white py-3 rounded-xl font-montserrat text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5 text-[#99907c]" />
                    <span>Guardar como Borrador</span>
                  </button>
                )}
              </div>

              {/* Aviso de Código de Ética */}
              <div className="flex items-center gap-2 text-[10px] text-[#99907c] pt-2 border-t border-[#262629]">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>
                  Entrega protegida por el Código de Ética y Honradez Comunitaria de la Fundación Principio & Fin.
                </span>
              </div>
            </div>
          )}

          {/* Card: Estado Actual del Intento (sólo para pendientes o borradores) */}
          {!isGraded && !isSubmitted && (
            <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-6 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-white font-montserrat font-bold text-xs uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 text-[#D4AF37]" />
                <span>Estado Actual del Intento</span>
              </div>

              <p className="text-xs text-[#99907c] leading-relaxed">
                {isDraft
                  ? 'Tienes un borrador guardado en la plataforma. Recuerda enviar la entrega definitiva antes de la fecha límite.'
                  : `Aún no has enviado esta entrega. Tienes hasta el ${activity.dueFormatted} para radicar tu entrega.`}
              </p>

              <div className="pt-2 border-t border-[#262629] flex items-center justify-between text-[11px] text-[#99907c]">
                <span>Reenvíos permitidos:</span>
                <span className="text-[#D4AF37] font-semibold">
                  Habilitados tras retroalimentación
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Banner Inferior de Ayuda Pedagógica */}
      <div className="p-4 rounded-xl bg-[#17171a] border border-[#262629] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#99907c]">
        <div className="flex items-center gap-3">
          <HelpCircle className="w-5 h-5 text-[#D4AF37]" />
          <p>
            ¿Tienes dudas sobre los criterios de esta actividad? Contacta a la docente en el aula o escribe a{' '}
            <a href="mailto:soporte@principioyfin.org" className="text-[#D4AF37] font-semibold hover:underline">
              soporte@principioyfin.org
            </a>
          </p>
        </div>
        <span className="font-montserrat font-bold text-[10px] uppercase tracking-widest text-[#5a564d] shrink-0">
          FUNDACIÓN PRINCIPIO & FIN - 2026
        </span>
      </div>
    </div>
  );
}
