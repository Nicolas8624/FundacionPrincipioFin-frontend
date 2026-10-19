'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  HeartHandshake, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  DollarSign, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Hourglass, 
  Edit2, 
  ShieldCheck, 
  Handshake, 
  Package, 
  MessageSquare,
  PackageX
} from 'lucide-react';

interface DonationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  request: any;
}

export function DonationDetailModal({
  isOpen,
  onClose,
  onEdit,
  request,
}: DonationDetailModalProps) {
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
      case 'concretada':
        return {
          label: 'Concretada / Aporte Recibido',
          style: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
          icon: CheckCircle2,
        };
      case 'en_contacto':
        return {
          label: 'En Contacto / Negociación',
          style: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
          icon: Hourglass,
        };
      case 'descartada':
        return {
          label: 'Descartada / No Concretada',
          style: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
          icon: PackageX,
        };
      case 'nueva':
      default:
        return {
          label: 'Nueva Intención de Donación',
          style: 'bg-[#D4AF37]/15 border-[#D4AF37]/40 text-[#D4AF37]',
          icon: Clock,
        };
    }
  };

  const getTypeIcon = (type: string) => {
    const t = (type || '').toLowerCase();
    if (t.includes('monetar') || t.includes('dinero')) return DollarSign;
    if (t.includes('especie') || t.includes('material')) return Package;
    if (t.includes('alianza') || t.includes('convenio')) return Handshake;
    return HeartHandshake;
  };

  const statusBadge = getStatusBadge(request.status);
  const StatusIcon = statusBadge.icon;
  const TypeIcon = getTypeIcon(request.donation_type);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-8 bg-[#0A0A0E]/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-[#17171a] border border-[#262629] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden my-auto">
        
        {/* Encabezado del Modal */}
        <div className="flex justify-between items-start p-5 sm:p-6 border-b border-[#262629] bg-[#1b1b1f] shrink-0">
          <div className="flex items-start gap-3.5 min-w-0 pr-3">
            <div className="w-11 h-11 rounded-xl bg-[#262629] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0 mt-0.5">
              <HeartHandshake className="w-6 h-6" />
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
              <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat truncate" title={request.donor_name}>
                {request.donor_name || 'Donante Anónimo'}
              </h2>
              <p className="text-xs text-[#99907c] mt-0.5">
                Registrada el {formattedDate}
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
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 custom-scrollbar space-y-5">
          
          {/* Grid de 2 Columnas: Datos del Donante y Datos del Aporte */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Tarjeta: Información de Contacto */}
            <div className="p-4 rounded-xl bg-[#1b1b1f] border border-[#262629] space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#262629]">
                <User className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-xs font-bold font-montserrat uppercase tracking-wider text-white">
                  Datos de Contacto
                </h3>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-[#99907c] block text-[10px] uppercase font-montserrat">Nombre Completo / Razón Social:</span>
                  <p className="text-[#e4e1e7] font-semibold">{request.donor_name}</p>
                </div>

                <div>
                  <span className="text-[#99907c] block text-[10px] uppercase font-montserrat">Correo Electrónico:</span>
                  <div className="flex items-center gap-1.5 text-[#d0c5af] mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                    <a href={`mailto:${request.email}`} className="hover:underline truncate">{request.email}</a>
                  </div>
                </div>

                <div>
                  <span className="text-[#99907c] block text-[10px] uppercase font-montserrat">Teléfono / WhatsApp:</span>
                  <div className="flex items-center gap-1.5 text-[#d0c5af] mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                    <span>{request.phone || 'No registrado'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tarjeta: Características de la Donación */}
            <div className="p-4 rounded-xl bg-[#1b1b1f] border border-[#262629] space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#262629]">
                <TypeIcon className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-xs font-bold font-montserrat uppercase tracking-wider text-white">
                  Modalidad de Aporte
                </h3>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-[#99907c] block text-[10px] uppercase font-montserrat">Tipo de Donación:</span>
                  <span className="inline-block mt-0.5 px-2.5 py-1 rounded bg-[#141417] border border-[#262629] text-[#D4AF37] font-semibold capitalize text-xs">
                    {request.donation_type}
                  </span>
                </div>

                <div>
                  <span className="text-[#99907c] block text-[10px] uppercase font-montserrat">Monto Registrado (COP):</span>
                  <p className={`text-base font-bold mt-0.5 ${request.amount_cop ? 'text-[#D4AF37]' : 'text-[#99907c]'}`}>
                    {request.amount_cop 
                      ? `$${Number(request.amount_cop).toLocaleString('es-CO')} COP` 
                      : 'No aplica o en especie'}
                  </p>
                </div>

                <div>
                  <span className="text-[#99907c] block text-[10px] uppercase font-montserrat">Fecha de Postulación:</span>
                  <div className="flex items-center gap-1.5 text-[#d0c5af] mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-[#99907c] shrink-0" />
                    <span>{formattedDate}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Mensaje o Propuesta del Donante */}
          <div className="p-4 rounded-xl bg-[#1b1b1f] border border-[#262629] space-y-2">
            <div className="flex items-center gap-2 pb-1.5 border-b border-[#262629]">
              <MessageSquare className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="text-xs font-bold font-montserrat uppercase tracking-wider text-white">
                Mensaje / Detalle de la Propuesta
              </h3>
            </div>
            <p className="text-xs text-[#d0c5af] leading-relaxed bg-[#141417] p-3 rounded-lg border border-[#262629] whitespace-pre-wrap">
              {request.message || 'Sin mensaje adicional proporcionado por el donante.'}
            </p>
          </div>

          {/* Notas Internas de la Fundación */}
          <div className="p-4 rounded-xl bg-[#1b1b1f] border border-[#262629] space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#262629]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-xs font-bold font-montserrat uppercase tracking-wider text-white">
                  Bitácora y Notas Administrativas
                </h3>
              </div>
              <span className="text-[10px] uppercase font-montserrat text-[#99907c]">Solo Coordinación</span>
            </div>
            {request.admin_notes ? (
              <p className="text-xs text-[#d0c5af] leading-relaxed bg-[#141417] p-3 rounded-lg border border-[#262629] whitespace-pre-wrap">
                {request.admin_notes}
              </p>
            ) : (
              <p className="text-xs text-[#99907c] italic bg-[#141417] p-3 rounded-lg border border-[#262629]">
                Sin notas internas registradas aún para este contacto.
              </p>
            )}
          </div>

          {/* Aviso de Política de Tratamiento de Datos */}
          <div className="flex items-center gap-2 text-[11px] text-[#99907c] bg-[#141417] p-3 rounded-xl border border-[#262629]">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {request.accepted_data_policy
                ? 'El donante autorizó el tratamiento de sus datos personales conforme a la política institucional.'
                : 'Autorización de tratamiento de datos sujeta a confirmación en el contacto directo.'}
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
              <span>Gestionar Estado o Monto</span>
            </button>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
}
