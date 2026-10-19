'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  HeartHandshake, 
  ShieldCheck, 
  CheckCircle2, 
  MessageSquare, 
  Mail, 
  Coins, 
  Package, 
  HandHeart, 
  Send, 
  Loader2, 
  Sparkles,
  Info,
  Clock,
  Download,
  Check,
  Building
} from 'lucide-react';
import { createBrowserClient } from '@/services/supabase/client';
import { submitPortalDonationAction } from '@/app/(portal)/portal/donaciones/actions';

export interface DonationItem {
  id: string;
  user_id?: string | null;
  donor_name: string;
  donation_type: 'economico' | 'insumos' | 'equipos' | 'patrocinio' | string;
  phone?: string | null;
  email: string;
  message?: string | null;
  status: 'nueva' | 'en_contacto' | 'concretada' | 'descartada' | string;
  amount_cop?: number | null;
  admin_notes?: string | null;
  created_at: string;
}

interface StudentDonationsClientProps {
  initialDonations: DonationItem[];
  userProfile: {
    id: string;
    email: string;
    full_name?: string | null;
    phone?: string | null;
  };
}

export function StudentDonationsClient({ initialDonations, userProfile }: StudentDonationsClientProps) {
  const router = useRouter();
  const [donations, setDonations] = useState<DonationItem[]>(initialDonations);
  const [viewMode, setViewMode] = useState<'formulario' | 'historial'>('formulario');

  // Form selections
  const [selectedCause, setSelectedCause] = useState<string>('Fondo Materiales y Arcilla');
  const [selectedModality, setSelectedModality] = useState<'economico' | 'insumos' | 'patrocinio'>('economico');
  const [selectedAmountPreset, setSelectedAmountPreset] = useState<number | 'custom'>(100000);
  const [customAmount, setCustomAmount] = useState<string>('100000');
  const [itemsDetail, setItemsDetail] = useState<string>('');
  const [donorName, setDonorName] = useState(userProfile.full_name || '');
  const [donorPhone, setDonorPhone] = useState(userProfile.phone || '');
  const [donorEmail, setDonorEmail] = useState(userProfile.email || '');
  const [notes, setNotes] = useState('');
  const [acceptPolicy, setAcceptPolicy] = useState(true);

  // States
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successRadicado, setSuccessRadicado] = useState<string | null>(null);

  const causes = [
    {
      id: 'Fondo Materiales y Arcilla',
      title: 'Fondo Materiales y Arcilla',
      desc: 'Financiación de pastas cerámicas, esmaltes y herramientas de modelado.',
      icon: Package,
    },
    {
      id: 'Beca Integral de Oficios',
      title: 'Beca Integral de Oficios',
      desc: 'Matrícula y acompañamiento a jóvenes en condición vulnerable de Bosa.',
      icon: Sparkles,
    },
    {
      id: 'Refrigerios & Transporte',
      title: 'Refrigerios & Transporte',
      desc: 'Apoyo de refrigerios nutritivos y traslados comunitarios para aprendices.',
      icon: HeartHandshake,
    },
    {
      id: 'Aporte Institucional Libre',
      title: 'Aporte Institucional Libre',
      desc: 'Mantenimiento de hornos comunitarios, talleres barriales y brigadas.',
      icon: Building,
    },
  ];

  const modalities = [
    { id: 'economico' as const, label: 'Aporte Económico (Dinero)', icon: Coins },
    { id: 'insumos' as const, label: 'En Especie / Materiales', icon: Package },
    { id: 'patrocinio' as const, label: 'Alianza / Voluntariado', icon: HandHeart },
  ];

  const amountPresets = [50000, 100000, 250000, 500000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptPolicy) {
      setErrorMsg('Debes autorizar el tratamiento de datos personales para procesar la solicitud.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    let calculatedAmount: number | null = null;
    if (selectedModality === 'economico') {
      const parsed = parseFloat(customAmount);
      if (!isNaN(parsed) && parsed > 0) {
        calculatedAmount = parsed;
      }
    }

    let detailParts: string[] = [`[Causa: ${selectedCause}]`];
    if (selectedModality === 'insumos' && itemsDetail.trim()) {
      detailParts.push(`[Detalle Insumos: ${itemsDetail.trim()}]`);
    } else if (selectedModality === 'patrocinio' && itemsDetail.trim()) {
      detailParts.push(`[Propuesta Alianza: ${itemsDetail.trim()}]`);
    }
    if (notes.trim()) {
      detailParts.push(notes.trim());
    }
    const fullMessage = detailParts.join(' ').trim();

    const payload = {
      user_id: userProfile.id,
      donor_name: donorName.trim(),
      donation_type: selectedModality,
      amount_cop: calculatedAmount,
      email: donorEmail.trim().toLowerCase(),
      phone: donorPhone.trim(),
      message: fullMessage,
      accepted_data_policy: acceptPolicy,
      status: 'nueva',
    };

    const result = await submitPortalDonationAction({
      donor_name: donorName.trim(),
      donation_type: selectedModality,
      amount_cop: calculatedAmount,
      email: donorEmail.trim().toLowerCase(),
      phone: donorPhone.trim(),
      message: fullMessage,
      accepted_data_policy: acceptPolicy,
    });

    setSubmitting(false);

    if (!result.success || !result.data) {
      console.error('Error al enviar solicitud de donación:', result.error);
      setErrorMsg(result.error || 'Error al enviar la solicitud');
    } else {
      const inserted = result.data as DonationItem;
      setDonations(prev => [inserted, ...prev]);
      const radicadoCode = `DON-${new Date().getFullYear()}-${inserted.id.slice(0, 4).toUpperCase()}`;
      setSuccessRadicado(radicadoCode);
      setNotes('');
      setItemsDetail('');
      router.refresh();
    }
  };

  return (
    <div className="space-y-8 pb-14 max-w-5xl mx-auto">
      {/* Encabezado Superior */}
      <div className="space-y-2">
        <p className="text-[10px] font-montserrat uppercase tracking-[0.25em] text-[#D4AF37] font-semibold flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
          Portal de Impacto Comunitario / Bogotá D.C., Colombia
        </p>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold font-montserrat tracking-tight text-white">
          Mis Donaciones y Aportes Comunitarios
        </h1>
        <p className="text-sm text-[#99907c] max-w-3xl leading-relaxed">
          Gracias por apoyar el tejido social de Bogotá. Consulta tu historial de donaciones, descarga certificados de donación para efectos tributarios y realiza nuevos aportes solidarios para financiar materiales de estudio y becas.
        </p>
      </div>

      {/* Contenedor Principal Estilo Tarjeta */}
      <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-6 sm:p-8 md:p-10 shadow-2xl space-y-8">
        
        {/* Cabecera del Contenedor */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262629]">
          <div>
            <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#D4AF37] font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
              Canal de Intermediación & Asesoría Directa
            </p>
            <h2 className="text-xl sm:text-2xl font-bold font-montserrat text-white mt-1">
              Canal Oficial de Aportes Comunitarios
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {donations.length > 0 && (
              <button
                onClick={() => setViewMode(viewMode === 'formulario' ? 'historial' : 'formulario')}
                className="px-3.5 py-1.5 rounded-xl bg-[#1b1b1f] hover:bg-[#262629] border border-[#262629] text-xs font-montserrat text-[#D4AF37] font-semibold transition-colors"
              >
                {viewMode === 'formulario' ? `Ver Historial (${donations.length})` : 'Formulario de Aporte'}
              </button>
            )}
            <div className="w-9 h-9 rounded-xl bg-[#1b1b1f] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Cuadro de Advertencia / Seguridad */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#1b1b1f] border border-[#262629] space-y-2">
          <div className="flex items-center gap-2 text-[#D4AF37]">
            <Info className="w-4 h-4 shrink-0" />
            <h3 className="text-xs font-montserrat uppercase tracking-wider font-bold">
              Intermediación Oficial y Seguridad Institucional
            </h3>
          </div>
          <p className="text-xs text-[#99907c] leading-relaxed">
            La Fundación <strong className="text-white">no procesa transacciones automáticas en línea</strong> a través de este portal. Este espacio funciona como canal de enlace e intermediación personalizada. Al manifestar tu intención o contactarnos, la <strong className="text-white">Coordinación de Alianzas y Donaciones</strong> te acompañará de manera directa para formalizar transferencias hacia las cuentas oficiales certificadas de la entidad (ESAL vigilada y avalada por la DIAN) o programar la entrega física de insumos y materiales.
          </p>
        </div>

        {/* Canales de Contacto Directo */}
        <div className="space-y-2">
          <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#99907c] font-semibold">
            Contacto Inmediato con la Coordinación
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="https://wa.me/573000000000?text=Hola,%20deseo%20hacer%20un%20aporte%20solidario%20a%20la%20Fundación%20Principio%20&%20Fin"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-[#1b1b1f] border border-[#262629] hover:border-[#D4AF37]/40 flex items-center gap-4 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold font-montserrat text-white group-hover:text-[#D4AF37] transition-colors">
                  WhatsApp Oficial de Aportes
                </p>
                <p className="text-[11px] text-[#99907c] truncate">
                  +57 (300) 000-0000 • Respuesta Inmediata
                </p>
              </div>
            </a>

            <a
              href="mailto:alianzas@principioyfin.org?subject=Propuesta%20de%20Aporte%20o%20Donación"
              className="p-4 rounded-xl bg-[#1b1b1f] border border-[#262629] hover:border-[#D4AF37]/40 flex items-center gap-4 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0 group-hover:scale-105 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold font-montserrat text-white group-hover:text-[#D4AF37] transition-colors">
                  Dirección de Alianzas y ESAL
                </p>
                <p className="text-[11px] text-[#99907c] truncate">
                  alianzas@principioyfin.org
                </p>
              </div>
            </a>
          </div>
        </div>

        {/* MODO HISTORIAL O FORMULARIO */}
        {viewMode === 'historial' ? (
          <div className="space-y-6 pt-4 border-t border-[#262629]">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-montserrat text-white">
                Historial de mis Donaciones y Aportes
              </h3>
              <button
                onClick={() => setViewMode('formulario')}
                className="text-xs text-[#D4AF37] hover:underline font-montserrat"
              >
                ← Volver al Formulario
              </button>
            </div>

            <div className="space-y-4">
              {donations.map((item) => {
                const dateStr = item.created_at
                  ? new Date(item.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
                  : 'Reciente';

                return (
                  <div key={item.id} className="p-5 rounded-xl bg-[#1b1b1f] border border-[#262629] space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-montserrat text-white">
                          Aporte {item.donation_type.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-[#99907c] font-mono">
                          {dateStr}
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-montserrat font-bold uppercase ${
                        item.status === 'concretada'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30'
                      }`}>
                        {item.status === 'concretada' ? 'Concretada y Certificada' : 'En Coordinación'}
                      </span>
                    </div>

                    <p className="text-xs text-[#d0c5af] leading-relaxed">
                      {item.message || 'Sin mensaje adicional registrado.'}
                    </p>

                    {item.amount_cop && (
                      <p className="text-xs text-[#D4AF37] font-mono font-bold">
                        Valor registrado: ${Number(item.amount_cop).toLocaleString('es-CO')} COP
                      </p>
                    )}

                    {item.status === 'concretada' && (
                      <div className="pt-2 border-t border-[#262629] flex items-center justify-between text-xs">
                        <span className="text-[#99907c]">Certificado tributario Art. 257 ET emitido</span>
                        <a
                          href={`mailto:alianzas@principioyfin.org?subject=Copia%20Certificado%20Donacion%20${item.id}`}
                          className="inline-flex items-center gap-1.5 text-[#D4AF37] hover:underline font-montserrat font-semibold"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Solicitar Copia PDF
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* FORMULARIO DE ENLACE Y COORDINACIÓN */
          <div className="space-y-6 pt-4 border-t border-[#262629]">
            <div>
              <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
                Formulario de Enlace y Coordinación
              </p>
              <h3 className="text-lg sm:text-xl font-bold font-montserrat text-white mt-1">
                Solicitar que la Fundación me Contacte
              </h3>
            </div>

            {successRadicado ? (
              <div className="bg-[#1b1b1f] border border-emerald-500/40 rounded-2xl p-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-white font-montserrat">
                  ¡Solicitud de Contacto Enviada!
                </h4>
                <p className="text-sm text-[#d0c5af] max-w-lg mx-auto">
                  Gracias por tu generosidad. Tu manifestación de apoyo ha sido registrada con el radicado:
                </p>
                <div className="inline-block bg-[#0A0A0E] border border-[#D4AF37] px-6 py-2.5 rounded-xl font-mono text-lg font-bold text-[#D4AF37]">
                  {successRadicado}
                </div>
                <p className="text-xs text-[#99907c] max-w-md mx-auto leading-relaxed">
                  Un profesional de la <strong>Dirección de Alianzas y ESAL</strong> se comunicará contigo vía WhatsApp o correo electrónico para formalizar los detalles.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setSuccessRadicado(null)}
                    className="bg-[#D4AF37] text-[#0A0A0E] px-6 py-2.5 rounded-xl font-montserrat text-xs font-bold uppercase tracking-wider hover:bg-[#F5D77A] transition-all"
                  >
                    Enviar Otra Solicitud
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {errorMsg && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* 1. Causa o Destino de Interés */}
                <div className="space-y-3">
                  <label className="text-xs font-montserrat uppercase tracking-wider text-[#99907c] font-semibold block">
                    1. Causa o Destino de Interés
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {causes.map((c) => {
                      const Icon = c.icon;
                      const isSelected = selectedCause === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedCause(c.id)}
                          className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 ${
                            isSelected
                              ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/10'
                              : 'bg-[#1b1b1f] border-[#262629] text-[#d0c5af] hover:border-[#D4AF37]/30'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected ? 'bg-[#D4AF37] text-[#0A0A0E]' : 'bg-[#262629] text-[#99907c]'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold font-montserrat text-white mb-1">
                              {c.title}
                            </p>
                            <p className="text-[11px] text-[#99907c] leading-relaxed">
                              {c.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Modalidad de Aporte Deseada */}
                <div className="space-y-3">
                  <label className="text-xs font-montserrat uppercase tracking-wider text-[#99907c] font-semibold block">
                    2. Modalidad de Aporte Deseada
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {modalities.map((m) => {
                      const Icon = m.icon;
                      const isSelected = selectedModality === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedModality(m.id)}
                          className={`p-3.5 rounded-xl border text-center transition-all flex items-center justify-center gap-2.5 font-montserrat text-xs font-bold ${
                            isSelected
                              ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                              : 'bg-[#1b1b1f] border-[#262629] text-[#99907c] hover:text-white hover:bg-[#262629]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Campos Específicos según la Modalidad Seleccionada */}
                {selectedModality === 'economico' && (
                  <div className="p-4 sm:p-5 rounded-xl bg-[#141417] border border-[#262629] space-y-3.5 animate-fadeIn">
                    <label className="text-xs font-montserrat uppercase tracking-wider text-[#D4AF37] font-semibold block">
                      Monto Estimado a Donar (COP)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {amountPresets.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            setSelectedAmountPreset(preset);
                            setCustomAmount(preset.toString());
                          }}
                          className={`py-2 px-3 rounded-lg border text-xs font-montserrat font-bold transition-all ${
                            customAmount === preset.toString()
                              ? 'bg-[#D4AF37] text-[#0A0A0E] border-[#D4AF37]'
                              : 'bg-[#1b1b1f] border-[#262629] text-[#d0c5af] hover:border-[#D4AF37]/50'
                          }`}
                        >
                          ${preset.toLocaleString('es-CO')}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-1 pt-1">
                      <span className="text-[11px] text-[#99907c] block">O ingresa un valor personalizado (COP):</span>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#99907c] font-mono text-sm">$</span>
                        <input
                          type="number"
                          min="1000"
                          step="1000"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          placeholder="Ej. 150000"
                          className="w-full bg-[#0A0A0E] border border-[#262629] rounded-xl pl-8 pr-4 py-2.5 text-sm text-white font-mono focus:border-[#D4AF37] focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedModality === 'insumos' && (
                  <div className="p-4 sm:p-5 rounded-xl bg-[#141417] border border-[#262629] space-y-2 animate-fadeIn">
                    <label className="text-xs font-montserrat uppercase tracking-wider text-[#D4AF37] font-semibold block">
                      Detalle de los Materiales o Insumos a Aportar <span className="text-[#D4AF37]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={itemsDetail}
                      onChange={(e) => setItemsDetail(e.target.value)}
                      placeholder="Ej. 5 bultos de arcilla de modelado, pinceles número 6 y 10, esmaltes cerámicos..."
                      className="w-full bg-[#0A0A0E] border border-[#262629] rounded-xl px-4 py-3 text-sm text-white placeholder-[#5a564d] focus:border-[#D4AF37] focus:outline-none transition-colors"
                    />
                    <p className="text-[11px] text-[#99907c]">
                      La Coordinación te contactará para coordinar la entrega o recepción en nuestra sede de Bogotá.
                    </p>
                  </div>
                )}

                {selectedModality === 'patrocinio' && (
                  <div className="p-4 sm:p-5 rounded-xl bg-[#141417] border border-[#262629] space-y-2 animate-fadeIn">
                    <label className="text-xs font-montserrat uppercase tracking-wider text-[#D4AF37] font-semibold block">
                      Propuesta de Alianza o Voluntariado <span className="text-[#D4AF37]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={itemsDetail}
                      onChange={(e) => setItemsDetail(e.target.value)}
                      placeholder="Ej. Tallerista voluntario de arte, empresa aliada para patrocinios o eventos..."
                      className="w-full bg-[#0A0A0E] border border-[#262629] rounded-xl px-4 py-3 text-sm text-white placeholder-[#5a564d] focus:border-[#D4AF37] focus:outline-none transition-colors"
                    />
                  </div>
                )}

                {/* 3. Datos de Contacto */}
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-montserrat uppercase tracking-wider text-[#99907c] font-semibold">
                        Nombre Completo o Razón Social <span className="text-[#D4AF37]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        placeholder="Ej. Camila Morales o Empresa S.A.S."
                        className="w-full bg-[#0A0A0E] border border-[#262629] rounded-xl px-4 py-3 text-sm text-white placeholder-[#5a564d] focus:border-[#D4AF37] focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-montserrat uppercase tracking-wider text-[#99907c] font-semibold">
                        Teléfono / WhatsApp de Contacto <span className="text-[#D4AF37]">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={donorPhone}
                        onChange={(e) => setDonorPhone(e.target.value)}
                        placeholder="+57 312 458 9210"
                        className="w-full bg-[#0A0A0E] border border-[#262629] rounded-xl px-4 py-3 text-sm text-white placeholder-[#5a564d] focus:border-[#D4AF37] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-montserrat uppercase tracking-wider text-[#99907c] font-semibold">
                      Correo Electrónico de Enlace <span className="text-[#D4AF37]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      placeholder="camila.morales@comunidad.edu.co"
                      className="w-full bg-[#0A0A0E] border border-[#262629] rounded-xl px-4 py-3 text-sm text-white placeholder-[#5a564d] focus:border-[#D4AF37] focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-montserrat uppercase tracking-wider text-[#99907c] font-semibold">
                      Mensaje u Observación Opcional
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Cuéntanos detalles adicionales sobre tu intención de apoyo..."
                      className="w-full bg-[#0A0A0E] border border-[#262629] rounded-xl p-4 text-sm text-white placeholder-[#5a564d] focus:border-[#D4AF37] focus:outline-none transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Aceptación de Política de Tratamiento de Datos */}
                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer text-xs text-[#d0c5af] p-3 rounded-xl bg-[#141417] border border-[#262629]">
                    <input
                      type="checkbox"
                      checked={acceptPolicy}
                      onChange={(e) => setAcceptPolicy(e.target.checked)}
                      className="mt-0.5 rounded border-[#262629] bg-[#0A0A0E] text-[#D4AF37] focus:ring-0"
                    />
                    <span className="leading-relaxed">
                      Autorizo a la <strong className="text-white">Fundación Principio & Fin</strong> el tratamiento de mis datos personales para ser contactado, gestionar esta donación y expedir el correspondiente certificado tributario conforme a la Ley 1581 de 2012 y el Estatuto Tributario.
                    </span>
                  </label>
                </div>

                {/* Botón de Envío */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] text-[#0A0A0E] py-4 rounded-xl font-montserrat text-xs font-bold uppercase tracking-wider hover:bg-[#F5D77A] transition-all disabled:opacity-50 shadow-lg shadow-[#D4AF37]/20"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Procesando Solicitud...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Enviar Solicitud de Donación y Coordinación</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Nota Legal Tributaria (Pie) */}
        <div className="p-4 rounded-xl bg-[#1b1b1f] border border-[#262629] flex items-center gap-3 text-xs text-[#99907c]">
          <ShieldCheck className="w-5 h-5 text-[#D4AF37] shrink-0" />
          <p className="leading-relaxed">
            <strong className="text-white">Fundación Principio & Fin</strong> es una Entidad Sin Ánimo de Lucro (ESAL) con Personería Jurídica reconocida y régimen tributario especial. Todos los aportes en dinero o especie son canalizados con estricta observancia del <strong className="text-[#D4AF37]">Artículo 257 del Estatuto Tributario Nacional</strong> para expedición de certificación DIAN deducible de renta.
          </p>
        </div>
      </div>
    </div>
  );
}
