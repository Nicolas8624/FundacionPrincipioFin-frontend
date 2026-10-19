'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building, 
  Building2, 
  Plus, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Calendar, 
  FileText, 
  PhoneCall, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Info,
  Upload,
  X,
  FileCheck2,
  FileUp,
  Download,
  AlertCircle,
  Send,
  Loader2,
  Check
} from 'lucide-react';
import { createBrowserClient } from '@/services/supabase/client';
import { getRadicadoCode, extractActaInfo, cleanAdminNotes } from '@/lib/ph-utils';
import { uploadPhActaAction } from '@/app/(portal)/portal/solicitudes-ph/actions';

export interface PhRequestItem {
  id: string;
  user_id?: string | null;
  administrator_name: string;
  role_title?: string | null;
  complex_name: string;
  address?: string | null;
  locality?: string | null;
  phone?: string | null;
  email: string;
  residents_count?: number | null;
  message?: string | null;
  accepted_data_policy: boolean;
  status: 'pendiente' | 'en_revision' | 'aprobada' | 'rechazada' | string;
  admin_notes?: string | null;
  handled_by?: string | null;
  created_at: string;
  updated_at?: string;
}

interface StudentPhClientProps {
  initialRequests: PhRequestItem[];
  userProfile: {
    id: string;
    email: string;
    full_name?: string | null;
    phone?: string | null;
  };
}

export function StudentPhClient({ initialRequests, userProfile }: StudentPhClientProps) {
  const router = useRouter();
  const [requests, setRequests] = useState<PhRequestItem[]>(initialRequests);
  const [activeTab, setActiveTab] = useState<'activas' | 'nueva' | 'requisitos'>('activas');

  // Modals state
  const [selectedDetail, setSelectedDetail] = useState<PhRequestItem | null>(null);
  const [uploadActaModal, setUploadActaModal] = useState<PhRequestItem | null>(null);
  const [selectedActaFile, setSelectedActaFile] = useState<File | null>(null);
  const [uploadingActa, setUploadingActa] = useState(false);
  const [uploadActaError, setUploadActaError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Form submission state
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccessRadicado, setFormSuccessRadicado] = useState<string | null>(null);

  // Local form inputs
  const [complexName, setComplexName] = useState('');
  const [adminName, setAdminName] = useState(userProfile.full_name || '');
  const [roleTitle, setRoleTitle] = useState('Miembro del consejo');
  const [locality, setLocality] = useState('Kennedy, Bogotá');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState(userProfile.phone || '');
  const [email, setEmail] = useState(userProfile.email || '');
  const [residentsCount, setResidentsCount] = useState<number | ''>(45);
  const [workshopTheme, setWorkshopTheme] = useState('Pintura en Cerámica y Manualidades para Adultos Mayores');
  const [message, setMessage] = useState('');
  const [dataConsent, setDataConsent] = useState(true);

  // Stats calculation
  const totalRadicadas = requests.length;
  const enEvaluacion = requests.filter(r => r.status === 'en_revision' || r.status === 'pendiente').length;
  const aprobadas = requests.filter(r => r.status === 'aprobada').length;

  const firstPending = requests.find(r => r.status === 'en_revision' || r.status === 'pendiente');
  const firstApproved = requests.find(r => r.status === 'aprobada');

  const handleUploadActaSubmit = async () => {
    if (!uploadActaModal || !selectedActaFile) return;
    setUploadingActa(true);
    setUploadActaError(null);

    const formData = new FormData();
    formData.append('requestId', uploadActaModal.id);
    formData.append('file', selectedActaFile);

    const res = await uploadPhActaAction(formData);
    setUploadingActa(false);

    if (!res.success) {
      setUploadActaError(res.error || 'Error al subir el acta.');
    } else {
      setUploadSuccess(true);
      // Actualizar localmente la solicitud
      setRequests(prev => prev.map(r => {
        if (r.id === uploadActaModal.id) {
          return {
            ...r,
            admin_notes: res.updatedNotes || r.admin_notes,
          };
        }
        return r;
      }));
      router.refresh();
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataConsent) {
      setFormError('Debes autorizar el tratamiento de datos personales.');
      return;
    }
    setFormLoading(true);
    setFormError(null);

    const fullMessage = workshopTheme 
      ? `Taller Solicitado: ${workshopTheme}. ${message}`.trim()
      : message;

    const payload = {
      user_id: userProfile.id,
      complex_name: complexName.trim(),
      administrator_name: adminName.trim(),
      role_title: roleTitle,
      locality,
      address: address.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      residents_count: residentsCount ? Number(residentsCount) : null,
      message: fullMessage,
      accepted_data_policy: true,
      status: 'pendiente',
    };

    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('ph_requests')
      .insert([payload])
      .select();

    setFormLoading(false);

    if (error) {
      console.error('Error al radicar solicitud PH:', error);
      setFormError(error.message || 'Error al radicar la solicitud');
    } else {
      const newReq = data && data[0] ? (data[0] as PhRequestItem) : null;
      if (newReq) {
        setRequests(prev => [newReq, ...prev]);
        setFormSuccessRadicado(getRadicadoCode(newReq));
      } else {
        setFormSuccessRadicado('PH-2026-NUEVA');
      }
      // Reset form
      setComplexName('');
      setAddress('');
      setMessage('');
      router.refresh();
    }
  };

  return (
    <div className="space-y-8 pb-14 max-w-7xl mx-auto">
      {/* Encabezado Superior */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-2">
          <p className="text-[10px] font-montserrat uppercase tracking-[0.25em] text-[#D4AF37] font-semibold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
            Gestión de Copropiedades y Salones Comunales
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold font-montserrat tracking-tight text-white">
            Mis Solicitudes de Propiedad Horizontal (PH)
          </h1>
          <p className="text-sm text-[#99907c] max-w-3xl leading-relaxed">
            Gestiona las postulaciones de talleres y programas comunitarios para el salón comunal de tu conjunto residencial, urbanización o copropiedad. Radica nuevas solicitudes y haz seguimiento en tiempo real al convenio.
          </p>
        </div>

        <button
          onClick={() => {
            setActiveTab('nueva');
            setFormSuccessRadicado(null);
          }}
          className="inline-flex items-center justify-center gap-2 bg-[#D4AF37] text-[#0A0A0E] px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider font-montserrat hover:bg-[#F5D77A] transition-all shadow-lg shadow-[#D4AF37]/20 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Radicar Nueva Solicitud PH
        </button>
      </div>

      {/* Métricas / KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Radicadas */}
        <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-6 flex flex-col justify-between min-h-[140px] hover:border-[#D4AF37]/30 transition-all shadow-xl">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#99907c] font-semibold">
              Total Radicadas
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#262629] border border-[#333338] flex items-center justify-center text-[#D4AF37]">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-4xl font-semibold font-montserrat text-white tracking-tight">
              {String(totalRadicadas).padStart(2, '0')}
            </p>
            <div className="flex items-center justify-between text-[11px] text-[#99907c] mt-1 pt-1 border-t border-[#262629]">
              <span>Histórico 2025-2026</span>
              <span className="text-[#d0c5af]">{totalRadicadas} copropiedad{totalRadicadas === 1 ? '' : 'es'}</span>
            </div>
          </div>
        </div>

        {/* En Evaluación Técnica */}
        <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-6 flex flex-col justify-between min-h-[140px] hover:border-[#D4AF37]/30 transition-all shadow-xl">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#99907c] font-semibold">
              En Evaluación Técnica
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#262629] border border-[#333338] flex items-center justify-center text-[#D4AF37]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-4xl font-semibold font-montserrat text-[#D4AF37] tracking-tight">
              {String(enEvaluacion).padStart(2, '0')}
            </p>
            <div className="text-[11px] text-[#99907c] mt-1 pt-1 border-t border-[#262629] truncate">
              {firstPending ? firstPending.complex_name : 'Sin solicitudes pendientes'}
            </div>
          </div>
        </div>

        {/* Aprobadas / En Ejecución */}
        <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-6 flex flex-col justify-between min-h-[140px] hover:border-[#D4AF37]/30 transition-all shadow-xl">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#99907c] font-semibold">
              Aprobadas / En Ejecución
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#262629] border border-[#333338] flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-4xl font-semibold font-montserrat text-white tracking-tight">
              {String(aprobadas).padStart(2, '0')}
            </p>
            <div className="text-[11px] text-[#99907c] mt-1 pt-1 border-t border-[#262629] truncate">
              {firstApproved ? firstApproved.complex_name : 'Convenios activos'}
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Pestañas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262629] pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('activas')}
            className={`px-4 py-2.5 rounded-xl font-montserrat text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'activas'
                ? 'bg-[#D4AF37] text-[#0A0A0E] shadow-md shadow-[#D4AF37]/20'
                : 'text-[#99907c] hover:text-white hover:bg-[#1b1b1f]'
            }`}
          >
            Mis Solicitudes Activas ({requests.length})
          </button>

          <button
            onClick={() => {
              setActiveTab('nueva');
              setFormSuccessRadicado(null);
            }}
            className={`px-4 py-2.5 rounded-xl font-montserrat text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'nueva'
                ? 'bg-[#D4AF37] text-[#0A0A0E] shadow-md shadow-[#D4AF37]/20'
                : 'text-[#99907c] hover:text-white hover:bg-[#1b1b1f]'
            }`}
          >
            Formulario Nueva Postulación PH
          </button>

          <button
            onClick={() => setActiveTab('requisitos')}
            className={`px-4 py-2.5 rounded-xl font-montserrat text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'requisitos'
                ? 'bg-[#D4AF37] text-[#0A0A0E] shadow-md shadow-[#D4AF37]/20'
                : 'text-[#99907c] hover:text-white hover:bg-[#1b1b1f]'
            }`}
          >
            Requisitos Técnicos del Salón Comunal
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-montserrat text-[#99907c] uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Vigencia Convenios 2026</span>
        </div>
      </div>

      {/* Contenido Pestaña 1: MIS SOLICITUDES ACTIVAS */}
      {activeTab === 'activas' && (
        <div className="space-y-6">
          {requests.length > 0 ? (
            requests.map((req) => {
              const radicado = getRadicadoCode(req);
              const actaInfo = extractActaInfo(req.admin_notes);
              const cleanedNotes = cleanAdminNotes(req.admin_notes);

              const dateStr = req.created_at
                ? new Date(req.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
                : 'Reciente';

              const isAprobada = req.status === 'aprobada';
              const isRevision = req.status === 'en_revision';
              const isRechazada = req.status === 'rechazada';
              const isPendiente = req.status === 'pendiente' || (!isAprobada && !isRevision && !isRechazada);

              // Extraer título del taller y mensaje real
              let displayTaller = 'Taller Artístico y de Oficios para la Comunidad';
              let displayDesc = req.message || 'Postulación de formación comunitaria en salón común.';
              if (req.message && req.message.includes('Taller Solicitado:')) {
                const parts = req.message.split('Taller Solicitado:')[1].split('.');
                displayTaller = parts[0]?.trim() || displayTaller;
                displayDesc = parts.slice(1).join('.').trim() || displayDesc;
              }

              return (
                <div 
                  key={req.id} 
                  className="bg-[#17171a] border border-[#262629] rounded-2xl p-6 sm:p-7 shadow-xl hover:border-[#D4AF37]/30 transition-all space-y-6"
                >
                  {/* Fila Encabezado de la Tarjeta */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#262629]">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#1b1b1f] border border-[#333338] flex items-center justify-center text-[#D4AF37] shrink-0 mt-0.5">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2.5 mb-1">
                          <h3 className="text-lg sm:text-xl font-bold font-montserrat text-white">
                            {req.complex_name}
                          </h3>
                          <span className="bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider">
                            RADICADO: {radicado}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[#99907c]">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                            Radicada: {dateStr}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                            {req.locality || 'Bogotá D.C.'}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
                            Capacidad: {req.residents_count ? `${req.residents_count} personas` : 'Por definir'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Estado Pill Real */}
                    <div>
                      {isAprobada ? (
                        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider">
                          <CheckCircle2 className="w-4 h-4" />
                          Convenio Aprobado
                        </div>
                      ) : isRevision ? (
                        <div className="inline-flex items-center gap-2 bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] px-4 py-2 rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider">
                          <Clock className="w-4 h-4" />
                          En Evaluación Técnica y Visita
                        </div>
                      ) : isRechazada ? (
                        <div className="inline-flex items-center gap-2 bg-red-500/15 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider">
                          <AlertCircle className="w-4 h-4" />
                          Solicitud No Viable / Rechazada
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/30 text-sky-400 px-4 py-2 rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider">
                          <FileText className="w-4 h-4" />
                          Radicación Inicial (Pendiente)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Banner de rechazo si aplica */}
                  {isRechazada && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-200 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <strong className="block text-red-300 font-montserrat uppercase tracking-wider text-[11px]">
                          La solicitud no fue aprobada por la administración de la Fundación
                        </strong>
                        <p className="text-red-200/90 leading-relaxed">
                          {cleanedNotes || 'El espacio postulado o las condiciones técnicas no cumplen con los requisitos mínimos institucionales para esta convocatoria.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Cuerpo: Información de la Postulación y Línea de Tiempo de 3 Pasos */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Columna Izquierda: Información Real de la Solicitud */}
                    <div className="lg:col-span-7 space-y-4">
                      <div>
                        <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#99907c] font-semibold">
                          Taller o Programa Solicitado
                        </p>
                        <h4 className="text-base sm:text-lg font-bold font-montserrat text-[#D4AF37] mt-0.5">
                          {displayTaller}
                        </h4>
                        <p className="text-xs sm:text-sm text-[#d0c5af] leading-relaxed mt-1">
                          {displayDesc}
                        </p>
                      </div>

                      {/* Datos de contacto y sede */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="bg-[#1b1b1f] border border-[#262629] p-3 rounded-xl">
                          <span className="text-[9px] uppercase tracking-wider text-[#99907c] block font-montserrat font-semibold">
                            Solicitante y Rol
                          </span>
                          <span className="text-white font-medium">
                            {req.administrator_name} ({req.role_title || 'Administración'})
                          </span>
                        </div>
                        <div className="bg-[#1b1b1f] border border-[#262629] p-3 rounded-xl">
                          <span className="text-[9px] uppercase tracking-wider text-[#99907c] block font-montserrat font-semibold">
                            Dirección de la Copropiedad
                          </span>
                          <span className="text-white font-medium truncate block">
                            {req.address || req.locality || 'Bogotá D.C.'}
                          </span>
                        </div>
                      </div>

                      {/* Observaciones de Coordinación si existen */}
                      {cleanedNotes && !isRechazada && (
                        <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 p-3.5 rounded-xl text-xs space-y-1">
                          <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold font-montserrat flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5" />
                            Observaciones de la Coordinación:
                          </span>
                          <p className="text-[#F5D77A] leading-relaxed">
                            {cleanedNotes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Columna Derecha: Línea de Tiempo Real (3 Pasos) y Estado del Acta */}
                    <div className="lg:col-span-5 flex flex-col justify-between gap-4 bg-[#1b1b1f] border border-[#262629] p-5 rounded-xl">
                      {/* Progreso del Trámite de 3 Pasos */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs font-montserrat">
                          <span className="uppercase tracking-wider text-[#99907c] font-semibold">
                            Progreso del Trámite
                          </span>
                          <span className="text-[#D4AF37] font-bold">
                            {isAprobada ? 'PASO 3 DE 3 (COMPLETADO)' : isRevision ? 'PASO 2 DE 3' : isRechazada ? 'FINALIZADO' : 'PASO 1 DE 3'}
                          </span>
                        </div>

                        {/* 3 Pasos Reales */}
                        <div className="grid grid-cols-3 gap-2 relative">
                          {/* Paso 1: Radicación */}
                          <div className="text-center space-y-1.5">
                            <div className="w-8 h-8 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center text-xs">
                              <Check className="w-4 h-4 stroke-[2.5]" />
                            </div>
                            <span className="text-[10px] text-white font-medium block">1. Radicación</span>
                            <span className="text-[9px] text-emerald-400 font-mono">Recibida</span>
                          </div>

                          {/* Paso 2: Evaluación Técnica */}
                          <div className="text-center space-y-1.5">
                            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${
                              isAprobada
                                ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-400'
                                : isRevision
                                ? 'bg-[#D4AF37] text-[#0A0A0E] shadow-md shadow-[#D4AF37]/30 ring-2 ring-[#D4AF37]/40'
                                : isRechazada
                                ? 'bg-red-500/20 border border-red-500 text-red-400'
                                : 'bg-[#262629] text-[#99907c]'
                            }`}>
                              {isAprobada ? <Check className="w-4 h-4 stroke-[2.5]" /> : 2}
                            </div>
                            <span className="text-[10px] text-white font-medium block">2. Visita Técnica</span>
                            <span className={`text-[9px] font-mono ${
                              isAprobada ? 'text-emerald-400' : isRevision ? 'text-[#D4AF37]' : isRechazada ? 'text-red-400' : 'text-[#99907c]'
                            }`}>
                              {isAprobada ? 'Evaluada' : isRevision ? 'En Curso' : isRechazada ? 'No viable' : 'Pendiente'}
                            </span>
                          </div>

                          {/* Paso 3: Convenio Aprobado */}
                          <div className="text-center space-y-1.5">
                            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${
                              isAprobada
                                ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-400'
                                : 'bg-[#262629] text-[#99907c]'
                            }`}>
                              {isAprobada ? <Check className="w-4 h-4 stroke-[2.5]" /> : 3}
                            </div>
                            <span className="text-[10px] text-white font-medium block">3. Convenio</span>
                            <span className={`text-[9px] font-mono ${isAprobada ? 'text-emerald-400' : 'text-[#99907c]'}`}>
                              {isAprobada ? 'Aprobado' : 'Por formalizar'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Tarjeta del Acta de Consejo Adjunta */}
                      <div className="pt-3 border-t border-[#262629]">
                        {actaInfo ? (
                          <div className="p-3 rounded-xl bg-[#17171a] border border-emerald-500/30 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <FileCheck2 className="w-5 h-5 text-emerald-400 shrink-0" />
                              <div className="min-w-0">
                                <span className="text-[10px] uppercase font-montserrat text-emerald-400 font-semibold block">
                                  Acta de Consejo Adjunta
                                </span>
                                <p className="text-xs text-white truncate font-medium">
                                  {actaInfo.fileName}
                                </p>
                              </div>
                            </div>
                            <a
                              href={actaInfo.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 bg-[#262629] hover:bg-[#333338] text-white text-[11px] font-montserrat font-semibold rounded-lg flex items-center gap-1 shrink-0 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                              Descargar
                            </a>
                          </div>
                        ) : isRechazada ? (
                          <div className="p-3 rounded-xl bg-[#17171a] border border-red-500/20 flex items-center gap-2 text-xs text-red-300">
                            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                            <span className="text-[11px]">Trámite finalizado (no admite documentos)</span>
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-[#17171a] border border-[#262629] flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2">
                              <FileUp className="w-4 h-4 text-[#D4AF37] shrink-0" />
                              <span className="text-[#99907c] text-[11px]">
                                Acta de consejo pendiente de adjuntar
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                setUploadActaModal(req);
                                setSelectedActaFile(null);
                                setUploadActaError(null);
                                setUploadSuccess(false);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#D4AF37] text-[10px] font-montserrat font-bold uppercase tracking-wider shrink-0 transition-colors"
                            >
                              Adjuntar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Fila Inferior de Acciones */}
                  <div className="pt-3 border-t border-[#262629] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <p className="text-[#99907c] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
                      {isAprobada 
                        ? 'Convenio institucional formalizado con la Fundación Principio & Fin.'
                        : isRechazada
                        ? 'Solicitud evaluada y cerrada.'
                        : 'El equipo de enlace programará la visita técnica al salón social.'}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setSelectedDetail(req)}
                        className="px-3.5 py-2 rounded-xl bg-[#1b1b1f] hover:bg-[#262629] border border-[#262629] text-white font-montserrat text-xs font-medium transition-colors"
                      >
                        Ver Detalle Completo
                      </button>

                      {!isRechazada && (
                        <button
                          onClick={() => {
                            setUploadActaModal(req);
                            setSelectedActaFile(null);
                            setUploadActaError(null);
                            setUploadSuccess(false);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-[#1b1b1f] hover:bg-[#262629] border border-[#262629] text-[#d0c5af] hover:text-white font-montserrat text-xs font-medium transition-colors flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                          {actaInfo ? 'Actualizar Acta de Consejo' : 'Adjuntar Acta de Consejo'}
                        </button>
                      )}

                      <a
                        href={`https://wa.me/573000000000?text=Hola,%20solicito%20información%20sobre%20la%20solicitud%20PH%20${radicado}%20del%20conjunto%20${encodeURIComponent(req.complex_name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-[#D4AF37] text-[#0A0A0E] hover:bg-[#F5D77A] font-montserrat text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        Contactar Fundación
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-10 sm:p-14 text-center max-w-2xl mx-auto shadow-xl space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#1b1b1f] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] mx-auto shadow-md">
                <Building className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-montserrat text-white">
                No tienes solicitudes de Propiedad Horizontal activas
              </h3>
              <p className="text-sm text-[#99907c] max-w-md mx-auto leading-relaxed">
                Postula el salón comunal de tu edificio o conjunto residencial en Bogotá para recibir talleres artísticos y recreativos gratuitos financiados por la Fundación.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('nueva')}
                  className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#0A0A0E] px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider font-montserrat hover:bg-[#F5D77A] transition-all shadow-lg shadow-[#D4AF37]/20"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  Radicar mi Primera Solicitud PH
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contenido Pestaña 2: FORMULARIO NUEVA POSTULACIÓN PH */}
      {activeTab === 'nueva' && (
        <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-6 sm:p-8 shadow-xl max-w-4xl mx-auto space-y-6">
          <div className="border-b border-[#262629] pb-4">
            <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
              Convocatoria Permanente
            </p>
            <h2 className="text-xl sm:text-2xl font-bold font-montserrat text-white mt-1">
              Formulario de Postulación de Copropiedad
            </h2>
            <p className="text-xs sm:text-sm text-[#99907c] mt-1 leading-relaxed">
              Diligencia los datos de la copropiedad y el salón social. El equipo de enlace técnico de la Fundación se pondrá en contacto en un plazo máximo de 5 días hábiles.
            </p>
          </div>

          {formSuccessRadicado ? (
            <div className="bg-[#1b1b1f] border border-emerald-500/40 rounded-2xl p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white font-montserrat">
                ¡Solicitud Radicada Exitosamente!
              </h3>
              <p className="text-sm text-[#d0c5af] max-w-lg mx-auto">
                Hemos registrado tu copropiedad con el número de radicado oficial:
              </p>
              <div className="inline-block bg-[#0A0A0E] border border-[#D4AF37] px-6 py-2.5 rounded-xl font-mono text-lg font-bold text-[#D4AF37]">
                {formSuccessRadicado}
              </div>
              <p className="text-xs text-[#99907c] max-w-md mx-auto">
                Puedes hacer seguimiento en tiempo real al estado de la visita técnica desde la pestaña <strong>&ldquo;Mis Solicitudes Activas&rdquo;</strong>.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => {
                    setFormSuccessRadicado(null);
                    setActiveTab('activas');
                  }}
                  className="bg-[#D4AF37] text-[#0A0A0E] px-6 py-2.5 rounded-xl font-montserrat text-xs font-bold uppercase tracking-wider hover:bg-[#F5D77A] transition-all"
                >
                  Ver en Mis Solicitudes
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateRequest} className="space-y-6">
              {formError && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-medium text-[#d0c5af]">
                    Nombre del Conjunto Residencial / Copropiedad <span className="text-[#D4AF37]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={complexName}
                    onChange={(e) => setComplexName(e.target.value)}
                    placeholder="Ej. Conjunto Residencial Los Sauces - Etapa 2"
                    className="w-full bg-[#0A0A0E] border border-[#262629] rounded-xl px-4 py-3 text-sm text-white placeholder-[#5a564d] focus:border-[#D4AF37] focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#d0c5af]">
                    Nombre del Solicitante o Administrador <span className="text-[#D4AF37]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Ej. Camila Morales"
                    className="w-full bg-[#0A0A0E] border border-[#262629] rounded-xl px-4 py-3 text-sm text-white placeholder-[#5a564d] focus:border-[#D4AF37] focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#d0c5af]">
                    Rol en la Copropiedad <span className="text-[#D4AF37]">*</span>
                  </label>
                  <select
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    className="w-full bg-[#0A0A0E] border border-[#262629] rounded-xl px-4 py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                  >
                    <option value="Administrador">Administrador Delegado</option>
                    <option value="Miembro del consejo">Miembro del Consejo de Administración</option>
                    <option value="Otro">Líder Comunitario / Copropietario</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#d0c5af]">
                    Localidad de Bogotá <span className="text-[#D4AF37]">*</span>
                  </label>
                  <select
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full bg-[#0A0A0E] border border-[#262629] rounded-xl px-4 py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                  >
                    <option value="Kennedy, Bogotá">Kennedy</option>
                    <option value="Bosa, Bogotá">Bosa</option>
                    <option value="Suba, Bogotá">Suba</option>
                    <option value="Engativá, Bogotá">Engativá</option>
                    <option value="Teusaquillo, Bogotá">Teusaquillo</option>
                    <option value="Fontibón, Bogotá">Fontibón</option>
                    <option value="Ciudad Bolívar, Bogotá">Ciudad Bolívar</option>
                    <option value="Usme, Bogotá">Usme</option>
                    <option value="Usaquén, Bogotá">Usaquén</option>
                    <option value="Otra localidad">Otra localidad</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#d0c5af]">
                    Dirección de la Copropiedad <span className="text-[#D4AF37]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ej. Calle 45 Sur # 78-12"
                    className="w-full bg-[#0A0A0E] border border-[#262629] rounded-xl px-4 py-3 text-sm text-white placeholder-[#5a564d] focus:border-[#D4AF37] focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#d0c5af]">
                    Teléfono / Celular de Contacto <span className="text-[#D4AF37]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej. +57 312 458 9210"
                    className="w-full bg-[#0A0A0E] border border-[#262629] rounded-xl px-4 py-3 text-sm text-white placeholder-[#5a564d] focus:border-[#D4AF37] focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#d0c5af]">
                    Correo Electrónico Institucional <span className="text-[#D4AF37]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full bg-[#0A0A0E] border border-[#262629] rounded-xl px-4 py-3 text-sm text-white placeholder-[#5a564d] focus:border-[#D4AF37] focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-medium text-[#d0c5af]">
                    Aforo Estimado del Salón Comunal (Personas)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    value={residentsCount}
                    onChange={(e) => setResidentsCount(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Ej. 45"
                    className="w-full bg-[#0A0A0E] border border-[#262629] rounded-xl px-4 py-3 text-sm text-white placeholder-[#5a564d] focus:border-[#D4AF37] focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-medium text-[#d0c5af]">
                    Taller o Programa de Interés
                  </label>
                  <select
                    value={workshopTheme}
                    onChange={(e) => setWorkshopTheme(e.target.value)}
                    className="w-full bg-[#0A0A0E] border border-[#262629] rounded-xl px-4 py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                  >
                    <option value="Pintura en Cerámica y Manualidades para Adultos Mayores">Pintura en Cerámica y Manualidades para Adultos Mayores</option>
                    <option value="Huerta Urbana y Reciclaje Creativo Comunitario">Huerta Urbana y Reciclaje Creativo Comunitario</option>
                    <option value="Taller de Óleo y Expresión Artística Infantil">Taller de Óleo y Expresión Artística Infantil</option>
                    <option value="Macramé, Tejido y Economía Solidaria">Macramé, Tejido y Economía Solidaria</option>
                    <option value="Repostería y Panadería Artesanal Vecinal">Repostería y Panadería Artesanal Vecinal</option>
                    <option value="Música, Ritmos Tradicionales y Danza Comunitaria">Música, Ritmos Tradicionales y Danza Comunitaria</option>
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-medium text-[#d0c5af]">
                    Descripción de la Propuesta / Horarios sugeridos
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe los días y jornadas disponibles en tu salón comunal (ej. sábados mañanas o martes en la tarde), público objetivo y necesidades específicas..."
                    className="w-full bg-[#0A0A0E] border border-[#262629] rounded-xl p-4 text-sm text-white placeholder-[#5a564d] focus:border-[#D4AF37] focus:outline-none transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Aceptación Política de Datos */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-[#1b1b1f] border border-[#262629]">
                <input
                  type="checkbox"
                  id="dataConsent"
                  checked={dataConsent}
                  onChange={(e) => setDataConsent(e.target.checked)}
                  className="mt-0.5 accent-[#D4AF37] w-4 h-4 rounded cursor-pointer"
                />
                <label htmlFor="dataConsent" className="text-xs text-[#99907c] leading-relaxed cursor-pointer select-none">
                  Autorizo el tratamiento de mis datos de contacto conforme a la <span className="text-[#D4AF37]">Ley 1581 de 2012</span> para coordinar la visita técnica y el convenio social con la Fundación Principio & Fin.
                </label>
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] text-[#0A0A0E] py-4 rounded-xl font-montserrat text-xs font-bold uppercase tracking-wider hover:bg-[#F5D77A] transition-all disabled:opacity-50 shadow-lg shadow-[#D4AF37]/20"
              >
                {formLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Radicando Solicitud...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar y Radicar Solicitud PH</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Contenido Pestaña 3: REQUISITOS TÉCNICOS */}
      {activeTab === 'requisitos' && (
        <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-6 sm:p-8 shadow-xl max-w-4xl mx-auto space-y-6">
          <div className="border-b border-[#262629] pb-4">
            <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
              Guía de Postulación
            </p>
            <h2 className="text-xl sm:text-2xl font-bold font-montserrat text-white mt-1">
              Requisitos Técnicos del Salón Comunal
            </h2>
            <p className="text-xs sm:text-sm text-[#99907c] mt-1 leading-relaxed">
              Para garantizar el éxito de los talleres y la seguridad de los residentes, verificamos los siguientes aspectos durante la visita técnica institucional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#1b1b1f] border border-[#262629] p-5 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-[#D4AF37]">
                <Users className="w-5 h-5" />
                <h3 className="text-sm font-bold font-montserrat text-white">Capacidad y Aforo</h3>
              </div>
              <p className="text-xs text-[#99907c] leading-relaxed">
                El salón social debe contar con capacidad mínima para 20 personas sentadas con mesas de trabajo que permitan la manipulación de materiales como arcilla, pinturas o herramientas textiles.
              </p>
            </div>

            <div className="bg-[#1b1b1f] border border-[#262629] p-5 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-[#D4AF37]">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-sm font-bold font-montserrat text-white">Iluminación y Ventilación</h3>
              </div>
              <p className="text-xs text-[#99907c] leading-relaxed">
                Espacios con ventilación natural cruzada y óptima iluminación artificial o diurna. Es indispensable contar con puntos de acceso a agua para limpieza de pinceles y modelado.
              </p>
            </div>

            <div className="bg-[#1b1b1f] border border-[#262629] p-5 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-[#D4AF37]">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="text-sm font-bold font-montserrat text-white">Seguridad y Póliza de Áreas Comunes</h3>
              </div>
              <p className="text-xs text-[#99907c] leading-relaxed">
                La copropiedad debe contar con póliza de seguro multirriesgo vigente para áreas comunes conforme a la Ley 675 de 2001. La Fundación aporta los seguros de los docentes y facilitadores.
              </p>
            </div>

            <div className="bg-[#1b1b1f] border border-[#262629] p-5 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-[#D4AF37]">
                <FileText className="w-5 h-5" />
                <h3 className="text-sm font-bold font-montserrat text-white">Acta del Consejo o Administración</h3>
              </div>
              <p className="text-xs text-[#99907c] leading-relaxed">
                Para suscribir el convenio formal es necesario adjuntar la carta o extracto de acta donde el Consejo de Administración o la Administración avala el préstamo del salón comunal sin costo de alquiler.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              onClick={() => setActiveTab('nueva')}
              className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#0A0A0E] px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider font-montserrat hover:bg-[#F5D77A] transition-all"
            >
              Postular mi Copropiedad Ahora
            </button>
          </div>
        </div>
      )}

      {/* Banner Call To Action Inferior */}
      <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-2 max-w-2xl">
          <span className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#D4AF37] font-semibold block">
            Convocatoria Semestral Abierta
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-montserrat text-white">
            ¿Tu salón comunal tiene horarios libres entre semana?
          </h2>
          <p className="text-xs sm:text-sm text-[#99907c] leading-relaxed">
            Lleva talleres de música, repostería comunitaria, huerta o liderazgo vecinal sin costo directo para el presupuesto ordinario del conjunto.
          </p>
        </div>

        <div className="shrink-0 space-y-2 text-center md:text-right">
          <button
            onClick={() => {
              setActiveTab('nueva');
              setFormSuccessRadicado(null);
            }}
            className="inline-flex items-center justify-center gap-2 bg-[#D4AF37] text-[#0A0A0E] px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider font-montserrat hover:bg-[#F5D77A] transition-all shadow-lg shadow-[#D4AF37]/20 w-full sm:w-auto"
          >
            <Sparkles className="w-4 h-4" />
            Postular Copropiedad Ahora
          </button>
          <p className="text-[10px] font-montserrat uppercase tracking-wider text-[#99907c]">
            Respuesta en menos de 5 días hábiles
          </p>
        </div>
      </div>

      {/* Marco de Cooperación Institucional (Pie) */}
      <div className="p-4 rounded-xl bg-[#17171a] border border-[#262629] flex items-center gap-3 text-xs text-[#99907c]">
        <ShieldCheck className="w-6 h-6 text-[#D4AF37] shrink-0" />
        <p className="leading-relaxed">
          <strong className="text-white font-montserrat uppercase text-[10px] tracking-wider block sm:inline mr-1">
            Marco de Cooperación PH:
          </strong>
          La <strong>Fundación Principio & Fin</strong> aporta docentes certificados, metodologías y materiales básicos; la administración del conjunto facilita el espacio físico y la convocatoria interna de los vecinos. Juntos transformamos las copropiedades en hogares de aprendizaje y sanación colectiva.
        </p>
      </div>

      {/* Modal: Detalle del Trámite */}
      {selectedDetail && (() => {
        const detailActa = extractActaInfo(selectedDetail.admin_notes);
        const detailCleanNotes = cleanAdminNotes(selectedDetail.admin_notes);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0E]/80 backdrop-blur-sm">
            <div className="bg-[#17171a] border border-[#262629] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative">
              <div className="flex items-start justify-between border-b border-[#262629] pb-3">
                <div>
                  <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#D4AF37] font-semibold">
                    Dossier de Radicación
                  </span>
                  <h3 className="text-lg font-bold font-montserrat text-white">
                    {selectedDetail.complex_name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedDetail(null)}
                  className="p-1 rounded-lg hover:bg-[#262629] text-[#99907c] hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-[#d0c5af]">
                <div className="grid grid-cols-2 gap-3 bg-[#1b1b1f] p-3 rounded-xl border border-[#262629]">
                  <div>
                    <span className="text-[#99907c] block text-[10px] uppercase font-montserrat">Número de Radicado</span>
                    <strong className="text-white font-mono">{getRadicadoCode(selectedDetail)}</strong>
                  </div>
                  <div>
                    <span className="text-[#99907c] block text-[10px] uppercase font-montserrat">Estado Actual</span>
                    <span className="text-[#D4AF37] font-bold uppercase">{selectedDetail.status}</span>
                  </div>
                  <div>
                    <span className="text-[#99907c] block text-[10px] uppercase font-montserrat">Solicitante</span>
                    <span className="text-white">{selectedDetail.administrator_name}</span>
                  </div>
                  <div>
                    <span className="text-[#99907c] block text-[10px] uppercase font-montserrat">Rol</span>
                    <span className="text-white">{selectedDetail.role_title || 'Administración'}</span>
                  </div>
                  <div>
                    <span className="text-[#99907c] block text-[10px] uppercase font-montserrat">Teléfono</span>
                    <span className="text-white">{selectedDetail.phone || 'No registrado'}</span>
                  </div>
                  <div>
                    <span className="text-[#99907c] block text-[10px] uppercase font-montserrat">Localidad</span>
                    <span className="text-white">{selectedDetail.locality || 'Bogotá D.C.'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[#99907c] block text-[10px] uppercase font-montserrat font-semibold mb-1">
                    Dirección
                  </span>
                  <p className="bg-[#1b1b1f] p-2.5 rounded-lg border border-[#262629] text-white">
                    {selectedDetail.address || 'Sin dirección especificada'}
                  </p>
                </div>

                <div>
                  <span className="text-[#99907c] block text-[10px] uppercase font-montserrat font-semibold mb-1">
                    Detalle del Programa / Mensaje
                  </span>
                  <p className="bg-[#1b1b1f] p-2.5 rounded-lg border border-[#262629] text-white leading-relaxed">
                    {selectedDetail.message || 'Sin mensaje adicional'}
                  </p>
                </div>

                {detailActa && (
                  <div>
                    <span className="text-emerald-400 block text-[10px] uppercase font-montserrat font-semibold mb-1">
                      Acta de Consejo Adjunta
                    </span>
                    <div className="bg-[#1b1b1f] p-2.5 rounded-lg border border-emerald-500/30 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-white text-xs truncate">{detailActa.fileName}</span>
                      </div>
                      <a
                        href={detailActa.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded text-[11px] font-semibold shrink-0 flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Descargar
                      </a>
                    </div>
                  </div>
                )}

                {detailCleanNotes && (
                  <div>
                    <span className="text-[#D4AF37] block text-[10px] uppercase font-montserrat font-semibold mb-1">
                      Notas de Coordinación Fundación
                    </span>
                    <p className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 p-2.5 rounded-lg text-[#F5D77A] leading-relaxed">
                      {detailCleanNotes}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedDetail(null)}
                  className="px-5 py-2 rounded-xl bg-[#262629] text-white text-xs font-montserrat font-semibold hover:bg-[#333338] transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal: Adjuntar Acta de Consejo */}
      {uploadActaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0E]/80 backdrop-blur-sm">
          <div className="bg-[#17171a] border border-[#262629] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-start justify-between border-b border-[#262629] pb-3">
              <div>
                <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#D4AF37] font-semibold">
                  Documentación del Convenio
                </span>
                <h3 className="text-base font-bold font-montserrat text-white">
                  Adjuntar Acta de Consejo de Copropietarios
                </h3>
              </div>
              <button
                onClick={() => setUploadActaModal(null)}
                className="p-1 rounded-lg hover:bg-[#262629] text-[#99907c] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">¡Documento Vinculado Exitosamente!</h4>
                <p className="text-xs text-[#99907c]">
                  El archivo fue subido y vinculado al radicado <strong>{getRadicadoCode(uploadActaModal)}</strong> para la revisión del equipo de la Fundación.
                </p>
                <button
                  onClick={() => setUploadActaModal(null)}
                  className="mt-2 bg-[#D4AF37] text-[#0A0A0E] px-5 py-2.5 rounded-xl text-xs font-bold font-montserrat uppercase tracking-wider"
                >
                  Entendido
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs text-[#99907c]">
                <p>
                  Sube el acta firmada por el Consejo de Administración o la Administración donde se autoriza la utilización del salón social para los talleres comunitarios.
                </p>

                {uploadActaError && (
                  <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{uploadActaError}</span>
                  </div>
                )}

                <div className="border-2 border-dashed border-[#262629] hover:border-[#D4AF37]/40 rounded-xl p-6 text-center cursor-pointer transition-colors bg-[#1b1b1f]">
                  <Upload className="w-8 h-8 text-[#D4AF37] mx-auto mb-2" />
                  <p className="text-white font-medium">
                    {selectedActaFile ? selectedActaFile.name : 'Haz clic para seleccionar el archivo'}
                  </p>
                  <p className="text-[11px] text-[#99907c] mt-1">
                    Formato PDF o Imagen (máx. 10 MB)
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedActaFile(e.target.files[0]);
                        setUploadActaError(null);
                      }
                    }}
                    className="mt-3 text-xs text-[#99907c] file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-[#262629] file:text-white hover:file:bg-[#333338]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    disabled={uploadingActa}
                    onClick={() => setUploadActaModal(null)}
                    className="px-4 py-2 rounded-xl bg-[#262629] text-white font-montserrat text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    disabled={!selectedActaFile || uploadingActa}
                    onClick={handleUploadActaSubmit}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#0A0A0E] font-montserrat text-xs font-bold uppercase tracking-wider hover:bg-[#F5D77A] disabled:opacity-50"
                  >
                    {uploadingActa ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Subiendo y Guardando...
                      </>
                    ) : (
                      'Confirmar y Guardar Acta'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
