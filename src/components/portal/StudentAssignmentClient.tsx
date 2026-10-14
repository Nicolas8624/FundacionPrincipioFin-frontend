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
  Users
} from 'lucide-react';
import { createBrowserClient } from '@/services/supabase/client';

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
    feedback?: string | null;
    projectTitle?: string | null;
    textContent?: string | null;
    fileName?: string | null;
    fileSize?: string | null;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

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

  const handleSaveSubmission = async (status: 'borrador' | 'entregada') => {
    if (status === 'entregada' && !selectedFile && !selectedFileName) {
      setStatusMessage({
        type: 'error',
        text: 'Por favor adjunta al menos un archivo antes de enviar la entrega definitiva.',
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const supabase = createBrowserClient();

      let storagePath = 'submissions/default.pdf';
      let fileNameToSave = selectedFileName || 'entrega_proyecto.pdf';
      let fileSizeToSave = selectedFile ? selectedFile.size : 1024 * 1024;
      let mimeTypeToSave = selectedFile ? selectedFile.type : 'application/pdf';

      // 1. Subir archivo a Supabase Storage bucket 'submissions' o 'course-materials' si hay archivo nuevo
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const generatedPath = `${userProfile.id}/${activity.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('submissions')
          .upload(generatedPath, selectedFile, { upsert: true });

        if (!uploadError) {
          storagePath = generatedPath;
        } else {
          console.warn('Storage upload note:', uploadError.message);
          storagePath = `submissions/${generatedPath}`;
        }
      }

      // 2. Insertar o actualizar registro en submissions
      const payload: any = {
        assignment_id: activity.id,
        user_id: userProfile.id,
        text_content: comments.trim(),
        status: status,
        submitted_at: status === 'entregada' ? new Date().toISOString() : null,
        project_title: activity.title,
      };

      if (enrollmentId) {
        payload.enrollment_id = enrollmentId;
      }

      const { data: subData, error: subError } = await supabase
        .from('submissions')
        .upsert(payload, { onConflict: 'assignment_id,user_id' })
        .select()
        .single();

      if (subError) {
        console.error('Error al guardar submission:', subError);
        throw new Error(subError.message);
      }

      // 3. Registrar archivo en submission_files
      if (subData && (selectedFile || selectedFileName)) {
        await supabase
          .from('submission_files')
          .insert([
            {
              submission_id: subData.id,
              storage_path: storagePath,
              file_name: fileNameToSave,
              mime_type: mimeTypeToSave,
              size_bytes: fileSizeToSave,
            },
          ]);
      }

      setSubmissionStatus(status);
      setStatusMessage({
        type: 'success',
        text: status === 'entregada'
          ? '¡Tu entrega ha sido enviada con éxito! La docente revisará tu proyecto según los criterios de la rúbrica.'
          : 'Borrador guardado correctamente. Puedes continuar editando antes de la fecha límite.',
      });

      router.refresh();
    } catch (err: any) {
      console.error(err);
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
          <span className={`px-3 py-1.5 rounded-lg text-xs font-montserrat uppercase tracking-wider font-bold border ${
            submissionStatus === 'entregada'
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : submissionStatus === 'borrador'
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              : 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30'
          }`}>
            {submissionStatus === 'entregada'
              ? 'ENTREGADA PARA CALIFICACIÓN'
              : submissionStatus === 'borrador'
              ? 'BORRADOR GUARDADO'
              : 'PENDIENTE DE ENTREGA'}
          </span>

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

            <p className="text-xs sm:text-sm text-[#d0c5af] leading-relaxed">
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
                Escala 100 Puntos
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

        {/* Columna Derecha: Zona de Entrega (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card: Tu Entrega */}
          <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#262629]">
              <div className="flex items-center gap-2.5">
                <Upload className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-lg font-bold font-montserrat text-white">
                  Tu Entrega
                </h2>
              </div>
              <span className="bg-[#1b1b1f] text-[#D4AF37] text-[10px] font-montserrat font-bold uppercase tracking-wider px-2.5 py-1 rounded border border-[#D4AF37]/30">
                1er Intento
              </span>
            </div>

            {/* Mensajes de feedback */}
            {statusMessage && (
              <div className={`p-4 rounded-xl text-xs flex items-center gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
              }`}>
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

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
                Sube fotos HD de tu pieza y tu bitácora técnica
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
                      {selectedFileSize || '4.2 MB - Listo para enviar'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 rounded-lg hover:bg-[#262629] text-[#99907c] hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Textarea de Notas al Docente */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-montserrat uppercase tracking-wider text-[#99907c] font-semibold block">
                Comentarios o notas para la {activity.instructorName} (Opcional)
              </label>
              <textarea
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Escribe aquí observaciones sobre la curva de temperatura o particularidades de los barros locales utilizados..."
                className="w-full bg-[#0A0A0E] border border-[#262629] rounded-xl p-3.5 text-xs text-white placeholder-[#5a564d] focus:border-[#D4AF37] focus:outline-none transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Botones de Envío */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSaveSubmission('entregada')}
                className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#F5D77A] text-[#0A0A0E] py-3.5 rounded-xl font-montserrat text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 shadow-lg shadow-[#D4AF37]/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enviando Proyecto...</span>
                  </>
                ) : (
                  <>
                    <span>Enviar Entrega de la Actividad</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSaveSubmission('borrador')}
                className="w-full flex items-center justify-center gap-2 bg-[#1b1b1f] hover:bg-[#262629] border border-[#262629] text-white py-3 rounded-xl font-montserrat text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5 text-[#99907c]" />
                <span>Guardar como Borrador</span>
              </button>
            </div>

            {/* Aviso de Código de Ética */}
            <div className="flex items-center gap-2 text-[10px] text-[#99907c] pt-2 border-t border-[#262629]">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>
                Entrega protegida por el Código de Ética y Honradez Comunitaria de la Fundación Principio & Fin.
              </span>
            </div>
          </div>

          {/* Card: Estado Actual del Intento */}
          <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-6 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-white font-montserrat font-bold text-xs uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 text-[#D4AF37]" />
              <span>Estado Actual del Intento</span>
            </div>

            <p className="text-xs text-[#99907c] leading-relaxed">
              {submissionStatus === 'entregada'
                ? 'Tu entrega ha sido radicada formalmente. La docente revisará tu proyecto y asignará la retroalimentación en la plataforma.'
                : `Aún no has enviado esta entrega. Tienes hasta el ${activity.dueFormatted} para subir tus archivos definitivos.`}
            </p>

            <div className="pt-2 border-t border-[#262629] flex items-center justify-between text-[11px] text-[#99907c]">
              <span>Reenvíos permitidos:</span>
              <span className="text-[#D4AF37] font-semibold">
                Habilitados tras retroalimentación
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Banner Inferior de Ayuda Pedagógica */}
      <div className="p-4 rounded-xl bg-[#17171a] border border-[#262629] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#99907c]">
        <div className="flex items-center gap-3">
          <HelpCircle className="w-5 h-5 text-[#D4AF37] shrink-0" />
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
