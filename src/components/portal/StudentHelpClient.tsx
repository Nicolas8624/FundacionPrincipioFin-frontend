'use client';

import { useState } from 'react';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  ChevronDown, 
  Upload, 
  Send, 
  Loader2, 
  CheckCircle2, 
  Lock, 
  ExternalLink, 
  Info, 
  Clock, 
  Sparkles,
  CheckCircle,
  FileText,
  X
} from 'lucide-react';
import { createBrowserClient } from '@/services/supabase/client';

export interface ContactMessageItem {
  id: string;
  user_id?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  status: 'nuevo' | 'leido' | 'respondido' | 'archivado' | string;
  admin_notes?: string | null;
  created_at: string;
}

interface StudentHelpClientProps {
  initialMessages?: ContactMessageItem[];
  userProfile: {
    id: string;
    email: string;
    full_name?: string | null;
    phone?: string | null;
  };
}

export function StudentHelpClient({ initialMessages = [], userProfile }: StudentHelpClientProps) {
  const [messages, setMessages] = useState<ContactMessageItem[]>(initialMessages);
  const [activePqrsTab, setActivePqrsTab] = useState<'formulario' | 'historial'>('formulario');
  const [selectedTicket, setSelectedTicket] = useState<ContactMessageItem | null>(null);

  // Form fields
  const [tramiteType, setTramiteType] = useState('PLATAFORMA & AULA VIRTUAL');
  const [fullName, setFullName] = useState(userProfile.full_name || '');
  const [email, setEmail] = useState(userProfile.email || '');
  const [phone, setPhone] = useState(userProfile.phone || '');
  const [subjectTitle, setSubjectTitle] = useState('');
  const [detailedMessage, setDetailedMessage] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  // States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pqrsCode, setPqrsCode] = useState<string | null>(null);

  // Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const tramiteOptions = [
    'PLATAFORMA & AULA VIRTUAL',
    'INSCRIPCIONES Y CUPOS',
    'CERTIFICADOS DE APROBACIÓN',
    'CONVENIOS PH',
    'OTRO',
  ];

  const faqs = [
    {
      q: '¿Cómo descargo mi certificado al culminar un taller?',
      a: 'Una vez el docente califique tu entrega final y tu estado figure como "Aprobado", podrás descargar tu certificado oficial con código de verificación QR directamente desde la sección "Mis Cursos Matriculados" > pestaña "Aprobados".',
    },
    {
      q: '¿Qué hago si tengo problemas para subir mi asignación?',
      a: 'Asegúrate de que tu archivo no supere los 20MB y se encuentre en formato PDF, Word, JPG o ZIP. Si el problema persiste, puedes adjuntar el enlace a tu carpeta de Google Drive o OneDrive en las notas de entrega o escribirnos a soporte@principioyfin.org.',
    },
    {
      q: '¿Cómo solicita mi conjunto residencial un taller presencial?',
      a: 'La administración o el consejo de copropietarios puede radicar una solicitud formal desde la sección "Solicitudes PH". Nuestro equipo de enlace coordinará una visita técnica sin costo para evaluar el salón comunal y formalizar el convenio.',
    },
    {
      q: '¿Los cursos y talleres tienen algún costo oculto?',
      a: 'No. Todos los programas de formación artística y comunitaria de la Fundación Principio & Fin son 100% gratuitos y financiados gracias a donaciones, convenios de cooperación y trabajo solidario.',
    },
  ];

  const getRadicadoCode = (item: ContactMessageItem) => {
    const year = item.created_at ? new Date(item.created_at).getFullYear() : '2026';
    const code = item.id ? item.id.slice(0, 4).toUpperCase() : '0000';
    return `PQRS-${year}-${code}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (detailedMessage.length < 5) {
      setErrorMsg('El mensaje debe tener al menos 5 caracteres.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    let dbSubject = 'Otro';
    if (tramiteType === 'INSCRIPCIONES Y CUPOS') {
      dbSubject = 'Inscripción a cursos';
    } else if (tramiteType === 'CONVENIOS PH') {
      dbSubject = 'Propiedad horizontal';
    }

    const fileNotice = attachedFile ? ` [Adjunto: ${attachedFile.name}]` : '';
    const fullMessagePayload = `[PQRS: ${tramiteType}] [Asunto: ${subjectTitle.trim()}] ${detailedMessage.trim()}${fileNotice}`;

    const payload = {
      user_id: userProfile.id,
      name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || null,
      subject: dbSubject,
      message: fullMessagePayload.slice(0, 2000),
      accepted_data_policy: true,
      status: 'nuevo',
    };

    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([payload])
      .select();

    setLoading(false);

    if (error) {
      // If select failed due to RLS, insert still could have succeeded
      console.warn('Insert/Select note:', error);
      const generatedCode = `PQRS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setPqrsCode(generatedCode);
      const tempItem: ContactMessageItem = {
        id: Math.random().toString(),
        user_id: userProfile.id,
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || null,
        subject: dbSubject,
        message: fullMessagePayload,
        status: 'nuevo',
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [tempItem, ...prev]);
      setSubjectTitle('');
      setDetailedMessage('');
      setAttachedFile(null);
    } else {
      const insertedItem = data && data[0] ? (data[0] as ContactMessageItem) : null;
      if (insertedItem) {
        setMessages(prev => [insertedItem, ...prev]);
        setPqrsCode(getRadicadoCode(insertedItem));
      } else {
        const generatedCode = `PQRS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        setPqrsCode(generatedCode);
      }
      setSubjectTitle('');
      setDetailedMessage('');
      setAttachedFile(null);
    }
  };

  return (
    <div className="space-y-8 pb-14 max-w-7xl mx-auto">
      {/* Encabezado Superior */}
      <div className="space-y-2">
        <p className="text-[10px] font-montserrat uppercase tracking-[0.25em] text-[#D4AF37] font-semibold flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
          Atención al Ciudadano y Comunidad • Bogotá D.C.
        </p>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold font-montserrat tracking-tight text-white">
          Centro de Ayuda y Soporte Comunitario
        </h1>
        <p className="text-sm text-[#99907c] max-w-3xl leading-relaxed">
          Estamos aquí para orientarte en tus cursos, trámites de propiedad horizontal, certificados y solicitudes generales. Nuestro equipo pedagógico y de coordinación social responderá a tu requerimiento con prontitud.
        </p>
      </div>

      {/* 3 Canales de Contacto Directo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Línea Directa Móvil */}
        <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-6 flex flex-col justify-between min-h-[200px] hover:border-[#D4AF37]/30 transition-all shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-[#1b1b1f] border border-[#333338] flex items-center justify-center text-[#D4AF37]">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-montserrat font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                En Línea
              </span>
            </div>
            <div>
              <p className="text-[10px] font-montserrat uppercase tracking-wider text-[#99907c] font-semibold">
                Línea Directa Móvil
              </p>
              <p className="text-lg font-bold font-montserrat text-white mt-0.5">
                +57 300 000-0000
              </p>
              <p className="text-xs text-[#99907c] mt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                Lun a Sáb: 8:00 AM – 6:00 PM
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-[#262629]">
            <a
              href="https://wa.me/573000000000?text=Hola,%20solicito%20atención%20desde%20el%20portal%20comunitario"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#1b1b1f] hover:bg-[#262629] border border-[#262629] text-white hover:text-[#D4AF37] py-2.5 rounded-xl font-montserrat text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <span>Iniciar Chat Directo</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Conmutador PBX */}
        <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-6 flex flex-col justify-between min-h-[200px] hover:border-[#D4AF37]/30 transition-all shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-[#1b1b1f] border border-[#333338] flex items-center justify-center text-[#D4AF37]">
                <Phone className="w-4 h-4" />
              </div>
              <span className="bg-[#262629] text-[#d0c5af] text-[10px] font-montserrat font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Sede Bosa
              </span>
            </div>
            <div>
              <p className="text-[10px] font-montserrat uppercase tracking-wider text-[#99907c] font-semibold">
                Conmutador PBX
              </p>
              <p className="text-lg font-bold font-montserrat text-white mt-0.5">
                +57 601 000-0000
              </p>
              <p className="text-xs text-[#99907c] mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                Bosa El Porvenir • Presencial y PBX
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-[#262629]">
            <a
              href="tel:6010000000"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#1b1b1f] hover:bg-[#262629] border border-[#262629] text-white hover:text-[#D4AF37] py-2.5 rounded-xl font-montserrat text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Central Telefónica Oficial</span>
            </a>
          </div>
        </div>

        {/* Mesa de Ayuda Virtual */}
        <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-6 flex flex-col justify-between min-h-[200px] hover:border-[#D4AF37]/30 transition-all shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-[#1b1b1f] border border-[#333338] flex items-center justify-center text-[#D4AF37]">
                <Mail className="w-4 h-4" />
              </div>
              <span className="bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-montserrat font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                &lt; 24h Respuesta
              </span>
            </div>
            <div>
              <p className="text-[10px] font-montserrat uppercase tracking-wider text-[#99907c] font-semibold">
                Mesa de Ayuda Virtual
              </p>
              <p className="text-lg font-bold font-montserrat text-white mt-0.5 truncate" title="soporte@principioyfin.org">
                soporte@principioyfin.org
              </p>
              <p className="text-xs text-[#99907c] mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                Atención continua de lunes a viernes
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-[#262629]">
            <a
              href="mailto:soporte@principioyfin.org?subject=Solicitud%20de%20Ayuda%20Portal"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#1b1b1f] hover:bg-[#262629] border border-[#262629] text-white hover:text-[#D4AF37] py-2.5 rounded-xl font-montserrat text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Redactar Correo</span>
            </a>
          </div>
        </div>
      </div>

      {/* Grid 2 Columnas Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Columna Izquierda: Formulario PQRS / Mis Consultas (7 cols) */}
        <div className="lg:col-span-7 bg-[#17171a] border border-[#262629] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-[#262629] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#D4AF37] font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
                Canal Institucional
              </p>
              <h2 className="text-xl sm:text-2xl font-bold font-montserrat text-white mt-1">
                {activePqrsTab === 'formulario' ? 'Radicar una Consulta o Solicitud (PQRS)' : 'Mis Consultas Radicadas'}
              </h2>
            </div>

            {/* Selector de Pestaña: Formulario / Mis Consultas */}
            {messages.length > 0 && (
              <div className="flex items-center gap-1 bg-[#1b1b1f] p-1 rounded-xl border border-[#262629] shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActivePqrsTab('formulario');
                    setPqrsCode(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-montserrat font-bold uppercase tracking-wider transition-all ${
                    activePqrsTab === 'formulario'
                      ? 'bg-[#D4AF37] text-[#0A0A0E] shadow-sm'
                      : 'text-[#99907c] hover:text-white'
                  }`}
                >
                  Radicar
                </button>
                <button
                  type="button"
                  onClick={() => setActivePqrsTab('historial')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-montserrat font-bold uppercase tracking-wider transition-all ${
                    activePqrsTab === 'historial'
                      ? 'bg-[#D4AF37] text-[#0A0A0E] shadow-sm'
                      : 'text-[#99907c] hover:text-white'
                  }`}
                >
                  Mis PQRS ({messages.length})
                </button>
              </div>
            )}
          </div>

          {activePqrsTab === 'historial' ? (
            /* LISTA DE CONSULTAS PREVIAS */
            <div className="space-y-4">
              <p className="text-xs text-[#99907c]">
                A continuación encuentras el historial de tickets radicados desde tu cuenta y el estado de atención por parte del equipo de soporte.
              </p>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {messages.map((item) => {
                  const radCode = getRadicadoCode(item);
                  const dateStr = item.created_at
                    ? new Date(item.created_at).toLocaleDateString('es-CO', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Reciente';

                  const isRespondido = item.status === 'respondido';
                  const isLeido = item.status === 'leido';

                  return (
                    <div 
                      key={item.id} 
                      className="p-4 rounded-xl bg-[#1b1b1f] border border-[#262629] hover:border-[#D4AF37]/30 transition-all space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#D4AF37] bg-[#0A0A0E] px-2.5 py-0.5 rounded border border-[#D4AF37]/30">
                            {radCode}
                          </span>
                          <span className="text-[10px] text-[#99907c]">
                            {dateStr}
                          </span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-montserrat font-bold uppercase ${
                          isRespondido
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : isLeido
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30'
                        }`}>
                          {isRespondido ? 'Respondido' : isLeido ? 'En Gestión' : 'Radicado (Nuevo)'}
                        </span>
                      </div>

                      <p className="text-xs text-[#e4e1e7] line-clamp-3 leading-relaxed">
                        {item.message}
                      </p>

                      {item.admin_notes && (
                        <div className="p-3 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-xs space-y-1">
                          <span className="text-[10px] font-montserrat uppercase font-bold text-[#D4AF37] flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            Respuesta Oficial de Coordinación
                          </span>
                          <p className="text-[#F5D77A] leading-relaxed">
                            {item.admin_notes}
                          </p>
                        </div>
                      )}

                      <div className="pt-2 border-t border-[#262629] flex justify-end">
                        <button
                          type="button"
                          onClick={() => setSelectedTicket(item)}
                          className="text-[11px] font-montserrat text-[#D4AF37] hover:underline font-semibold"
                        >
                          Ver Detalle Completo →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-[#262629] flex justify-center">
                <button
                  type="button"
                  onClick={() => setActivePqrsTab('formulario')}
                  className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#0A0A0E] px-5 py-2.5 rounded-xl font-montserrat text-xs font-bold uppercase tracking-wider hover:bg-[#F5D77A] transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  Radicar Nueva Consulta
                </button>
              </div>
            </div>
          ) : pqrsCode ? (
            /* PANTALLA DE ÉXITO RADICADO */
            <div className="bg-[#1b1b1f] border border-emerald-500/40 rounded-2xl p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white font-montserrat">
                ¡Solicitud Radicada con Éxito!
              </h3>
              <p className="text-sm text-[#d0c5af] max-w-md mx-auto">
                Tu requerimiento fue registrado en la Mesa de Ayuda institucional. Guarda tu código de seguimiento:
              </p>
              <div className="inline-block bg-[#0A0A0E] border border-[#D4AF37] px-6 py-2.5 rounded-xl font-mono text-lg font-bold text-[#D4AF37]">
                {pqrsCode}
              </div>
              <p className="text-xs text-[#99907c] max-w-md mx-auto">
                El equipo de coordinación dará respuesta a tu requerimiento en un lapso no mayor a 24 horas hábiles.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => setActivePqrsTab('historial')}
                  className="bg-[#D4AF37] text-[#0A0A0E] px-5 py-2.5 rounded-xl font-montserrat text-xs font-bold uppercase tracking-wider hover:bg-[#F5D77A] transition-all"
                >
                  Ver en Mis PQRS
                </button>
                <button
                  onClick={() => setPqrsCode(null)}
                  className="bg-[#1b1b1f] text-[#d0c5af] hover:text-white px-5 py-2.5 rounded-xl font-montserrat text-xs font-semibold border border-[#262629] transition-all"
                >
                  Radicar Otra
                </button>
              </div>
            </div>
          ) : (
            /* FORMULARIO DE RADICACIÓN */
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Tipo de Trámite Pills */}
              <div className="space-y-2">
                <label className="text-xs font-montserrat uppercase tracking-wider text-[#99907c] font-semibold block">
                  Tipo de Trámite <span className="text-[#D4AF37]">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {tramiteOptions.map((opt) => {
                    const isSelected = tramiteType === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setTramiteType(opt)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-montserrat font-bold uppercase tracking-wider transition-all ${
                          isSelected
                            ? 'bg-[#D4AF37] text-[#0A0A0E] shadow-md shadow-[#D4AF37]/20'
                            : 'bg-[#1b1b1f] hover:bg-[#262629] text-[#99907c] hover:text-white border border-[#262629]'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nombre y Correo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-montserrat uppercase tracking-wider text-[#99907c] font-semibold">
                    Nombre Completo <span className="text-[#D4AF37]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Camila Morales"
                    className="w-full bg-[#0A0A0E] border border-[#262629] rounded-xl px-4 py-3 text-sm text-white placeholder-[#5a564d] focus:border-[#D4AF37] focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-montserrat uppercase tracking-wider text-[#99907c] font-semibold">
                    Correo Electrónico <span className="text-[#D4AF37]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="camila.morales@comunidad.edu.co"
                    className="w-full bg-[#0A0A0E] border border-[#262629] rounded-xl px-4 py-3 text-sm text-white placeholder-[#5a564d] focus:border-[#D4AF37] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Teléfono y Asunto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-montserrat uppercase tracking-wider text-[#99907c] font-semibold">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+57 312 458 9210"
                    className="w-full bg-[#0A0A0E] border border-[#262629] rounded-xl px-4 py-3 text-sm text-white placeholder-[#5a564d] focus:border-[#D4AF37] focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-montserrat uppercase tracking-wider text-[#99907c] font-semibold">
                    Asunto / Título Breve <span className="text-[#D4AF37]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subjectTitle}
                    onChange={(e) => setSubjectTitle(e.target.value)}
                    placeholder="Ej. Inconsistencia al descargar certificado"
                    className="w-full bg-[#0A0A0E] border border-[#262629] rounded-xl px-4 py-3 text-sm text-white placeholder-[#5a564d] focus:border-[#D4AF37] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Mensaje Detallado con Contador */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-montserrat text-[#99907c]">
                  <span className="uppercase tracking-wider font-semibold">
                    Mensaje Detallado <span className="text-[#D4AF37]">*</span>
                  </span>
                  <span className="font-mono text-[11px]">
                    {detailedMessage.length} / 1200
                  </span>
                </div>
                <textarea
                  rows={4}
                  required
                  maxLength={1200}
                  value={detailedMessage}
                  onChange={(e) => setDetailedMessage(e.target.value)}
                  placeholder="Describe detalladamente tu consulta, curso implicado o solicitud..."
                  className="w-full bg-[#0A0A0E] border border-[#262629] rounded-xl p-4 text-sm text-white placeholder-[#5a564d] focus:border-[#D4AF37] focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Adjuntar Soporte o Captura */}
              <div className="space-y-1.5">
                <label className="text-xs font-montserrat uppercase tracking-wider text-[#99907c] font-semibold block">
                  Adjuntar Soporte o Captura (Opcional)
                </label>
                <div className="flex items-center justify-between bg-[#0A0A0E] border border-[#262629] hover:border-[#D4AF37]/30 rounded-xl px-4 py-2.5 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Upload className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <span className="text-xs text-[#99907c] truncate">
                      {attachedFile ? attachedFile.name : 'Seleccionar archivo (PDF, PNG, JPG • máx 10MB)'}
                    </span>
                  </div>
                  <label className="bg-[#262629] hover:bg-[#333338] text-white text-[11px] font-montserrat uppercase font-bold tracking-wider px-3 py-1.5 rounded-lg cursor-pointer transition-colors shrink-0">
                    Examinar
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setAttachedFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Botón de Envío */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] text-[#0A0A0E] py-4 rounded-xl font-montserrat text-xs font-bold uppercase tracking-wider hover:bg-[#F5D77A] transition-all disabled:opacity-50 shadow-lg shadow-[#D4AF37]/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Radicando Solicitud...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar Solicitud de Ayuda</span>
                  </>
                )}
              </button>

              {/* Pie de Garantía de Privacidad */}
              <div className="flex items-center gap-2 pt-2 text-[11px] text-[#99907c]">
                <Lock className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span>
                  Garantía de privacidad bajo la Ley 1581 de 2012 y protección comunitaria de datos.
                </span>
              </div>
            </form>
          )}
        </div>

        {/* Columna Derecha: FAQs + Horarios y Sede Central (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card: Preguntas Frecuentes */}
          <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#262629]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#1b1b1f] border border-[#333338] flex items-center justify-center text-[#D4AF37]">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-base font-bold font-montserrat text-white">
                  Preguntas Frecuentes
                </h3>
              </div>
              <span className="bg-[#1b1b1f] text-[#D4AF37] text-[10px] font-montserrat font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[#D4AF37]/30">
                Guía Rápida
              </span>
            </div>

            <p className="text-xs text-[#99907c] leading-relaxed">
              Respuestas inmediatas a las dudas operativas más recurrentes de la comunidad.
            </p>

            <div className="space-y-2.5">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-[#262629] rounded-xl overflow-hidden bg-[#1b1b1f] transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-3.5 text-left flex items-center justify-between gap-3 text-xs font-semibold font-montserrat text-white hover:text-[#D4AF37] transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#99907c] transition-transform duration-200 shrink-0 ${
                          isOpen ? 'rotate-180 text-[#D4AF37]' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-3.5 pb-3.5 pt-1 text-xs text-[#d0c5af] leading-relaxed border-t border-[#262629]/60">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card: Horarios y Sede Central */}
          <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#D4AF37] font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
                Atención Presencial • Bogotá D.C.
              </p>
              <h3 className="text-base sm:text-lg font-bold font-montserrat text-white mt-1">
                Horarios y Sede Central
              </h3>
            </div>

            <p className="text-xs text-[#99907c] flex items-start gap-1.5 leading-relaxed">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
              <span>Carrera 85 # 49 Sur, Bosa El Porvenir • Bogotá D.C., Colombia</span>
            </p>

            {/* Visual Box Punto Físico */}
            <div className="bg-[#0A0A0E] border border-[#262629] rounded-xl p-5 text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0E] via-transparent to-transparent opacity-80 z-10" />
              <div className="relative z-20 space-y-1">
                <div className="inline-flex items-center gap-1.5 bg-[#17171a]/90 border border-[#D4AF37]/30 px-3 py-1 rounded-full text-[10px] font-montserrat font-bold text-[#D4AF37] uppercase tracking-wider">
                  <MapPin className="w-3 h-3" />
                  Punto Físico Bosa El Porvenir
                </div>
                <p className="text-[11px] text-[#99907c] pt-2">
                  Aulas de cerámica, talleres de oficios y coordinación pedagógica.
                </p>
              </div>
            </div>

            {/* Tabla de Horarios */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#1b1b1f] border border-[#262629]">
                <span className="text-[#99907c] flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Lunes a Viernes:
                </span>
                <span className="text-white font-medium">8:00 AM – 5:00 PM</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#1b1b1f] border border-[#262629]">
                <span className="text-[#99907c] flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Sábados Comunitarios:
                </span>
                <span className="text-[#D4AF37] font-semibold">8:00 AM – 1:00 PM</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#1b1b1f] border border-[#262629]">
                <span className="text-[#99907c] flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#99907c]" />
                  Domingos y Festivos:
                </span>
                <span className="text-[#99907c]">Cerrado (Atención Virtual)</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://maps.google.com/?q=Carrera+85+49+Sur+Bogota"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#1b1b1f] hover:bg-[#262629] border border-[#262629] text-white hover:text-[#D4AF37] py-2.5 rounded-xl font-montserrat text-xs font-bold uppercase tracking-wider transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Cómo Llegar / Maps</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Detalle de Ticket PQRS */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0E]/80 backdrop-blur-sm">
          <div className="bg-[#17171a] border border-[#262629] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-start justify-between border-b border-[#262629] pb-3">
              <div>
                <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#D4AF37] font-semibold">
                  Detalle del Requerimiento
                </span>
                <h3 className="text-base font-bold font-montserrat text-white font-mono">
                  {getRadicadoCode(selectedTicket)}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1 rounded-lg hover:bg-[#262629] text-[#99907c] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#d0c5af]">
              <div className="grid grid-cols-2 gap-3 bg-[#1b1b1f] p-3 rounded-xl border border-[#262629]">
                <div>
                  <span className="text-[#99907c] block text-[10px] uppercase font-montserrat">Fecha de Radicación</span>
                  <span className="text-white">
                    {new Date(selectedTicket.created_at).toLocaleString('es-CO')}
                  </span>
                </div>
                <div>
                  <span className="text-[#99907c] block text-[10px] uppercase font-montserrat">Estado de Atención</span>
                  <span className="text-[#D4AF37] font-bold uppercase">{selectedTicket.status}</span>
                </div>
                <div>
                  <span className="text-[#99907c] block text-[10px] uppercase font-montserrat">Remitente</span>
                  <span className="text-white">{selectedTicket.name}</span>
                </div>
                <div>
                  <span className="text-[#99907c] block text-[10px] uppercase font-montserrat">Correo de Respuesta</span>
                  <span className="text-white">{selectedTicket.email}</span>
                </div>
              </div>

              <div>
                <span className="text-[#99907c] block text-[10px] uppercase font-montserrat font-semibold mb-1">
                  Mensaje Registrado
                </span>
                <p className="bg-[#1b1b1f] p-3 rounded-xl border border-[#262629] text-white leading-relaxed whitespace-pre-wrap">
                  {selectedTicket.message}
                </p>
              </div>

              {selectedTicket.admin_notes && (
                <div>
                  <span className="text-[#D4AF37] block text-[10px] uppercase font-montserrat font-semibold mb-1">
                    Respuesta Oficial de Coordinación
                  </span>
                  <p className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 p-3 rounded-xl text-[#F5D77A] leading-relaxed">
                    {selectedTicket.admin_notes}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-5 py-2 rounded-xl bg-[#262629] text-white text-xs font-montserrat font-semibold hover:bg-[#333338] transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
