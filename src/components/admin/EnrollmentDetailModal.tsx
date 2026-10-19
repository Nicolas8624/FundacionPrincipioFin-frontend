'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  BookOpen, 
  Award, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Hourglass, 
  Edit2,
  GraduationCap
} from 'lucide-react';

interface EnrollmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  enrollment: any;
}

export function EnrollmentDetailModal({
  isOpen,
  onClose,
  onEdit,
  enrollment,
}: EnrollmentDetailModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted || !enrollment) return null;

  const nameParts = (enrollment.full_name || '').split(' ');
  const initials = nameParts.length > 1 
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase() 
    : (enrollment.full_name || 'US').substring(0, 2).toUpperCase();

  const date = new Date(enrollment.created_at);
  const formattedDate = date.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmada':
        return {
          label: 'Aprobada / Confirmada',
          style: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
          icon: CheckCircle2,
        };
      case 'pendiente':
        return {
          label: 'Pendiente de Revisión',
          style: 'bg-[#D4AF37]/15 border-[#D4AF37]/40 text-[#D4AF37]',
          icon: Clock,
        };
      case 'lista_espera':
        return {
          label: 'En Lista de Espera',
          style: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
          icon: Hourglass,
        };
      case 'rechazada':
      case 'cancelada':
        return {
          label: status === 'cancelada' ? 'Matrícula Cancelada' : 'Postulación Rechazada',
          style: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
          icon: AlertCircle,
        };
      case 'completada':
        return {
          label: 'Ciclo Completado',
          style: 'bg-[#D4AF37]/20 border-[#D4AF37]/50 text-[#F5D77A]',
          icon: Award,
        };
      default:
        return {
          label: status,
          style: 'bg-[#262629] border-[#38383c] text-[#d0c5af]',
          icon: AlertCircle,
        };
    }
  };

  const statusConfig = getStatusBadge(enrollment.status);
  const StatusIcon = statusConfig.icon;
  const cupoTypeLabel = enrollment.cupo_type || 'Cupo Regular';

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-8 bg-[#0A0A0E]/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#17171a] border border-[#262629] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden my-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 sm:p-6 border-b border-[#262629] bg-[#1b1b1f] shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
                Ficha del Participante
              </span>
              <span className="text-[10px] font-mono text-[#99907c]">
                · ID: {enrollment.id.substring(0, 8).toUpperCase()}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat mt-0.5 truncate">
              {enrollment.full_name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#262629] text-[#99907c] hover:text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
          
          {/* Tarjeta de Resumen / Estado Principal */}
          <div className="bg-[#1b1b1f] border border-[#262629] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#262629] flex items-center justify-center text-[#D4AF37] text-base font-bold border border-[#D4AF37]/30 shrink-0">
                {initials}
              </div>
              <div>
                <p className="text-white font-semibold text-sm font-montserrat">
                  {enrollment.full_name}
                </p>
                <p className="text-xs text-[#99907c]">
                  {enrollment.document_type || 'CC'} · {enrollment.document_number || 'Sin documento'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-1.5">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.style}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                <span>{statusConfig.label}</span>
              </div>
              <span className="text-[10px] text-[#99907c]">
                Radicado el {formattedDate}
              </span>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="space-y-3">
            <h3 className="text-xs font-montserrat uppercase tracking-wider text-[#D4AF37] font-semibold flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Datos Personales y de Contacto</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-[#131317] border border-[#262629] p-3.5 rounded-xl space-y-1">
                <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#99907c] block">
                  Correo Electrónico
                </span>
                <div className="flex items-center gap-2 text-white font-medium break-all">
                  <Mail className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                  <span>{enrollment.email || 'No registrado'}</span>
                </div>
              </div>

              <div className="bg-[#131317] border border-[#262629] p-3.5 rounded-xl space-y-1">
                <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#99907c] block">
                  Teléfono Móvil
                </span>
                <div className="flex items-center gap-2 text-white font-medium">
                  <Phone className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                  <span>{enrollment.phone || 'No registrado'}</span>
                </div>
              </div>

              <div className="bg-[#131317] border border-[#262629] p-3.5 rounded-xl space-y-1">
                <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#99907c] block">
                  Localidad / Sede de Residencia
                </span>
                <div className="flex items-center gap-2 text-[#d0c5af]">
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                  <span>{enrollment.locality || 'Bogotá D.C.'}</span>
                </div>
              </div>

              <div className="bg-[#131317] border border-[#262629] p-3.5 rounded-xl space-y-1">
                <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#99907c] block">
                  Tratamiento de Datos (Ley 1581)
                </span>
                <div className="flex items-center gap-2 text-[#d0c5af]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{enrollment.accepted_data_policy ? 'Consentimiento informado aceptado' : 'Pendiente'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detalles del Programa / Taller */}
          <div className="space-y-3">
            <h3 className="text-xs font-montserrat uppercase tracking-wider text-[#D4AF37] font-semibold flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Programa Formativo Solicitado</span>
            </h3>

            <div className="bg-[#131317] border border-[#262629] p-4 rounded-xl space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#262629] pb-3">
                <div>
                  <span className="text-[10px] font-montserrat uppercase text-[#99907c] tracking-wider block">
                    Taller o Convocatoria
                  </span>
                  <p className="text-white font-bold text-sm sm:text-base font-montserrat mt-0.5">
                    {enrollment.course?.title || 'Curso Comunitario'}
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1b1b1f] border border-[#D4AF37]/30 text-[#D4AF37] font-semibold text-[10px] font-montserrat uppercase self-start sm:self-center">
                  <span>{cupoTypeLabel}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[#d0c5af]">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                  <span>Horario: <strong className="text-white">{enrollment.course?.schedule_text || 'Por coordinar'}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                  <span>Modalidad: <strong className="text-white uppercase">{enrollment.course?.modality || 'Presencial'}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Motivación del Postulante si existe */}
          {enrollment.motivation && (
            <div className="space-y-2">
              <h3 className="text-xs font-montserrat uppercase tracking-wider text-[#D4AF37] font-semibold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Motivación del Aspirante</span>
              </h3>
              <div className="bg-[#1b1b1f] border border-[#262629] p-4 rounded-xl text-xs text-[#d0c5af] leading-relaxed italic">
                "{enrollment.motivation}"
              </div>
            </div>
          )}

          {/* Rendimiento Académico y Asistencia */}
          <div className="space-y-3">
            <h3 className="text-xs font-montserrat uppercase tracking-wider text-[#D4AF37] font-semibold flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>Desempeño y Asistencia Oficial</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-[#131317] border border-[#262629] p-3 rounded-xl">
                <span className="text-[10px] font-montserrat uppercase text-[#99907c] block">
                  Sesiones Asistidas
                </span>
                <p className="text-white font-bold text-base font-montserrat mt-0.5">
                  {enrollment.attended_sessions || 0} sesiones
                </p>
              </div>

              <div className="bg-[#131317] border border-[#262629] p-3 rounded-xl">
                <span className="text-[10px] font-montserrat uppercase text-[#99907c] block">
                  Calificación Promedio
                </span>
                <p className="text-[#D4AF37] font-bold text-base font-montserrat mt-0.5">
                  {enrollment.average_grade ? `${Number(enrollment.average_grade).toFixed(1)} / 5.0` : 'Sin evaluar'}
                </p>
              </div>

              <div className="bg-[#131317] border border-[#262629] p-3 rounded-xl">
                <span className="text-[10px] font-montserrat uppercase text-[#99907c] block">
                  Certificado
                </span>
                <p className="text-white font-semibold text-xs mt-1 truncate">
                  {enrollment.has_certificate ? (enrollment.certificate_code || 'Emitido') : 'No generado'}
                </p>
              </div>
            </div>
          </div>

          {/* Observaciones Administrativas */}
          {enrollment.admin_notes && (
            <div className="space-y-2">
              <h3 className="text-xs font-montserrat uppercase tracking-wider text-[#99907c] font-semibold">
                Notas de Coordinación Académica
              </h3>
              <div className="bg-[#131317] border border-[#262629] p-3.5 rounded-xl text-xs text-[#99907c] leading-relaxed">
                {enrollment.admin_notes}
              </div>
            </div>
          )}

          {/* Motivo de Cancelación si aplica */}
          {enrollment.withdrawal_reason && (
            <div className="bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl text-xs text-rose-300 space-y-1">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-rose-400 block">
                Motivo de Retiro o Cancelación
              </span>
              <p>{enrollment.withdrawal_reason}</p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#262629] bg-[#1b1b1f] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider font-montserrat text-[#99907c] hover:text-white transition-colors cursor-pointer"
          >
            Cerrar
          </button>

          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit();
              }}
              className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#F5D77A] text-[#0A0A0E] px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider font-montserrat transition-all shadow-md cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Gestionar Estado</span>
            </button>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
}
