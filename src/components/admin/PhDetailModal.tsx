'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  Home, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Hourglass, 
  Edit2,
  ShieldCheck,
  Building,
  Users,
  Download,
  FileCheck
} from 'lucide-react';
import { extractActaInfo, cleanAdminNotes, getRadicadoCode } from '@/lib/ph-utils';

interface PhDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  request: any;
}

export function PhDetailModal({
  isOpen,
  onClose,
  onEdit,
  request,
}: PhDetailModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted || !request) return null;

  const date = new Date(request.created_at || Date.now());
  const formattedDate = date.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aprobada':
        return {
          label: 'Aprobada (Convenio firmado)',
          style: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
          icon: CheckCircle2,
        };
      case 'en_revision':
        return {
          label: 'En Revisión (Comité evaluando)',
          style: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
          icon: Hourglass,
        };
      case 'rechazada':
        return {
          label: 'Solicitud Rechazada',
          style: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
          icon: AlertCircle,
        };
      case 'pendiente':
      default:
        return {
          label: 'Pendiente (Requiere visita técnica)',
          style: 'bg-[#D4AF37]/15 border-[#D4AF37]/40 text-[#D4AF37]',
          icon: Clock,
        };
    }
  };

  const statusBadge = getStatusBadge(request.status);
  const StatusIcon = statusBadge.icon;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-8 bg-[#0A0A0E]/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-[#17171a] border border-[#262629] rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden my-auto">
        
        {/* Encabezado del Modal */}
        <div className="flex justify-between items-start p-5 sm:p-6 border-b border-[#262629] bg-[#1b1b1f] shrink-0">
          <div className="flex items-start gap-3.5 min-w-0 pr-3">
            <div className="w-11 h-11 rounded-xl bg-[#262629] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0 mt-0.5">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-montserrat font-bold uppercase tracking-wider ${statusBadge.style}`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusBadge.label}
                </span>
                <span className="text-[10px] font-mono text-[#99907c] bg-[#141417] px-2 py-0.5 rounded border border-[#262629]">
                  ID: {request.id ? request.id.slice(0, 8) : 'N/A'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat truncate" title={request.complex_name}>
                {request.complex_name || 'Conjunto Residencial'}
              </h2>
              <p className="text-xs text-[#99907c] mt-0.5">
                Localidad de {request.locality || 'Bogotá'} • Radicada el {formattedDate}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#262629] text-[#99907c] hover:text-white flex items-center justify-center transition-colors shrink-0"
            title="Cerrar"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
          
          {/* Grid de 2 Columnas: Datos del Conjunto y Datos de Contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Tarjeta: Información del Conjunto / Inmueble */}
            <div className="p-4 rounded-xl bg-[#1b1b1f] border border-[#262629] space-y-3.5">
              <div className="flex items-center gap-2 pb-2 border-b border-[#262629]">
                <Building className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-xs font-bold font-montserrat uppercase tracking-wider text-white">
                  Datos de la Copropiedad
                </h3>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-[#99907c] block text-[10px] uppercase font-montserrat">Nombre Oficial:</span>
                  <p className="text-[#e4e1e7] font-semibold">{request.complex_name || 'No especificado'}</p>
                </div>

                <div>
                  <span className="text-[#99907c] block text-[10px] uppercase font-montserrat">Localidad:</span>
                  <div className="flex items-center gap-1.5 text-[#d0c5af] mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                    <span>{request.locality || 'Bogotá D.C.'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[#99907c] block text-[10px] uppercase font-montserrat">Dirección / Barrio:</span>
                  <p className="text-[#d0c5af]">{request.address || 'No especificada'}</p>
                </div>

                <div>
                  <span className="text-[#99907c] block text-[10px] uppercase font-montserrat">Número de Apartamentos:</span>
                  <div className="flex items-center gap-1.5 text-[#d0c5af] mt-0.5">
                    <Users className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                    <span className="font-semibold text-white">
                      {request.residents_count ? `${request.residents_count} unidades habitacionales` : 'No especificado'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tarjeta: Datos del Administrador / Contacto */}
            <div className="p-4 rounded-xl bg-[#1b1b1f] border border-[#262629] space-y-3.5">
              <div className="flex items-center gap-2 pb-2 border-b border-[#262629]">
                <User className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-xs font-bold font-montserrat uppercase tracking-wider text-white">
                  Contacto de la Administración
                </h3>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-[#99907c] block text-[10px] uppercase font-montserrat">Nombre del Postulante:</span>
                  <p className="text-[#e4e1e7] font-semibold">{request.administrator_name || 'No especificado'}</p>
                </div>

                <div>
                  <span className="text-[#99907c] block text-[10px] uppercase font-montserrat">Cargo / Rol en la Copropiedad:</span>
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-[#262629] text-[11px] font-medium text-[#D4AF37] border border-[#D4AF37]/20">
                    {request.role_title || 'Administrador(a)'}
                  </span>
                </div>

                <div>
                  <span className="text-[#99907c] block text-[10px] uppercase font-montserrat">Correo Electrónico:</span>
                  <a 
                    href={`mailto:${request.email}`} 
                    className="inline-flex items-center gap-1.5 text-[#d0c5af] hover:text-[#D4AF37] transition-colors mt-0.5 break-all"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                    <span>{request.email || 'Sin correo'}</span>
                  </a>
                </div>

                <div>
                  <span className="text-[#99907c] block text-[10px] uppercase font-montserrat">Teléfono / Celular:</span>
                  <a 
                    href={`tel:${request.phone}`} 
                    className="inline-flex items-center gap-1.5 text-[#d0c5af] hover:text-[#D4AF37] transition-colors mt-0.5 font-mono"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                    <span>{request.phone || 'Sin teléfono'}</span>
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* Mensaje o Propuesta del Conjunto */}
          <div className="p-4 rounded-xl bg-[#1b1b1f] border border-[#262629] space-y-2">
            <div className="flex items-center gap-2 pb-1.5 border-b border-[#262629]">
              <FileText className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="text-xs font-bold font-montserrat uppercase tracking-wider text-white">
                Mensaje y Talleres Solicitados
              </h3>
            </div>
            {request.message ? (
              <p className="text-xs text-[#d0c5af] leading-relaxed bg-[#141417] p-3 rounded-lg border border-[#262629] whitespace-pre-wrap">
                {request.message}
              </p>
            ) : (
              <p className="text-xs text-[#99907c] italic bg-[#141417] p-3 rounded-lg border border-[#262629]">
                No se adjuntaron observaciones específicas al momento de la postulación.
              </p>
            )}
          </div>

          {/* Documento / Acta de Consejo Adjunta */}
          {(() => {
            const acta = extractActaInfo(request.admin_notes);
            if (!acta) {
              return (
                <div className="p-4 rounded-xl bg-[#1b1b1f] border border-[#262629] space-y-1.5">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-[#262629]">
                    <FileText className="w-4 h-4 text-[#99907c]" />
                    <h3 className="text-xs font-bold font-montserrat uppercase tracking-wider text-[#99907c]">
                      Acta de Consejo / Copropiedad
                    </h3>
                  </div>
                  <p className="text-xs text-[#99907c] italic">
                    El solicitante aún no ha adjuntado el acta de consejo para esta postulación (o el trámite está pendiente de documentación).
                  </p>
                </div>
              );
            }
            return (
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 via-[#1b1b1f] to-[#17171a] border border-blue-500/30 space-y-2">
                <div className="flex items-center gap-2 pb-1.5 border-b border-[#262629]">
                  <FileCheck className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs font-bold font-montserrat uppercase tracking-wider text-white">
                    Acta de Consejo / Copropiedad Adjunta
                  </h3>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate" title={acta.fileName}>
                      {acta.fileName}
                    </p>
                    <p className="text-[10px] text-blue-200/70">
                      Documento oficial cargado por el solicitante para sustento del convenio.
                    </p>
                  </div>
                  {acta.fileUrl && (
                    <a
                      href={acta.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 hover:text-white text-xs font-semibold transition-colors shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Ver / Descargar Acta</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Notas Internas de Administración */}
          <div className="p-4 rounded-xl bg-[#1b1b1f] border border-[#262629] space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#262629]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-xs font-bold font-montserrat uppercase tracking-wider text-white">
                  Bitácora y Notas Internas de la Fundación
                </h3>
              </div>
              <span className="text-[10px] uppercase font-montserrat text-[#99907c]">Solo Administradores</span>
            </div>
            {cleanAdminNotes(request.admin_notes) ? (
              <p className="text-xs text-[#d0c5af] leading-relaxed bg-[#141417] p-3 rounded-lg border border-[#262629] whitespace-pre-wrap">
                {cleanAdminNotes(request.admin_notes)}
              </p>
            ) : (
              <p className="text-xs text-[#99907c] italic bg-[#141417] p-3 rounded-lg border border-[#262629]">
                Sin notas internas registradas aún para esta solicitud.
              </p>
            )}
          </div>

          {/* Aviso de Política de Tratamiento de Datos */}
          <div className="flex items-center gap-2 text-[11px] text-[#99907c] bg-[#141417] p-3 rounded-xl border border-[#262629]">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {request.accepted_data_policy
                ? 'El solicitante autorizó expresamente el tratamiento de datos personales conforme a la Ley 1581 de 2012.'
                : 'Tratamiento de datos sujeto a confirmación durante la visita técnica.'}
            </span>
          </div>

        </div>

        {/* Pie del Modal */}
        <div className="p-4 sm:px-6 sm:py-4 border-t border-[#262629] bg-[#1b1b1f] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#262629] hover:bg-[#333338] text-white text-xs font-montserrat uppercase font-semibold tracking-wider transition-colors text-center"
          >
            Cerrar
          </button>

          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#F5D77A] text-[#0A0A0E] text-xs font-montserrat uppercase font-bold tracking-wider transition-colors shadow-lg shadow-[#D4AF37]/15 flex items-center justify-center gap-2"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Gestionar Estado o Notas</span>
            </button>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
}
