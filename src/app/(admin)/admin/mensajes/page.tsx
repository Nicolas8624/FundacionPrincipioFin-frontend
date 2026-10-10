import { createServerClient } from '@/services/supabase/server';
import { Mail, MailOpen, MailCheck, Archive, FileText } from 'lucide-react';
import { MessageControls } from '@/components/admin/MessageControls';
import { MessageHeaderActions } from '@/components/admin/MessageHeaderActions';
import { MessageActions } from '@/components/admin/MessageActions';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default async function AdminMensajesPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const supabase = await createServerClient();
  
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q : '';
  const subjectFilter = typeof params.subject === 'string' ? params.subject : '';
  const statusFilter = typeof params.status === 'string' ? params.status : '';
  
  const page = typeof params.page === 'string' ? parseInt(params.page, 10) : 1;
  const limit = 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Conteo total (Paginación)
  let countQuery = supabase.from('contact_messages').select('*', { count: 'exact', head: true });
  
  if (q) countQuery.or(`name.ilike.%${q}%,email.ilike.%${q}%`);
  if (subjectFilter) countQuery.eq('subject', subjectFilter);
  if (statusFilter) countQuery.eq('status', statusFilter);

  const { count: exactCount } = await countQuery;
  const totalRequests = exactCount || 0;
  const totalPages = Math.ceil(totalRequests / limit);

  // Métricas
  const { data: statsData } = await supabase.from('contact_messages').select('status');
  const totalMensajes = statsData?.length || 0;
  const nuevos = statsData?.filter(e => e.status === 'nuevo').length || 0;
  const leidos = statsData?.filter(e => e.status === 'leido').length || 0;
  const respondidos = statsData?.filter(e => e.status === 'respondido').length || 0;

  // Query paginado
  let query = supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (q) query.or(`name.ilike.%${q}%,email.ilike.%${q}%`);
  if (subjectFilter) query.eq('subject', subjectFilter);
  if (statusFilter) query.eq('status', statusFilter);

  query = query.range(from, to);
  
  const { data: requestsData } = await query;
  const requests = requestsData || [];

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-10">
      
      {/* Encabezado */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#D4AF37] mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
            ATENCIÓN AL USUARIO • BANDEJA DE ENTRADA {new Date().getFullYear()}
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold font-montserrat tracking-wide text-white">
            Mensajes de Contacto
          </h1>
          <p className="text-[#99907c] text-sm mt-3 max-w-2xl leading-relaxed">
            Revisa, clasifica y da respuesta a las inquietudes generales, solicitudes y sugerencias enviadas a través del portal de la Fundación.
          </p>
        </div>
        
        <MessageHeaderActions />
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-[#0A0A0E]/60 backdrop-blur-xl border border-[#262629] hover:border-[#D4AF37]/30 transition-colors relative overflow-hidden flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <h3 className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c]">Total Mensajes</h3>
            <div className="w-8 h-8 rounded-lg bg-[#262629] flex items-center justify-center text-[#d0c5af]">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-end gap-3 mb-1">
              <p className="text-5xl font-semibold text-white">{totalMensajes}</p>
            </div>
            <p className="text-xs text-[#99907c]">Mensajes recibidos este año</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0A0A0E]/60 backdrop-blur-xl border border-[#262629] hover:border-[#D4AF37]/30 transition-colors relative overflow-hidden flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <h3 className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c]">Nuevos (Sin Leer)</h3>
            <div className="w-8 h-8 rounded-lg bg-[#262629] flex items-center justify-center text-[#D4AF37]">
              <Mail className="w-4 h-4 fill-current" />
            </div>
          </div>
          <div>
            <div className="flex items-end gap-3 mb-1">
              <p className="text-5xl font-semibold text-[#D4AF37]">{nuevos}</p>
              {nuevos > 0 && <span className="text-[#D4AF37] text-[10px] font-medium border border-[#D4AF37]/30 px-2 py-1 rounded-full mb-1.5">Acción Requerida</span>}
            </div>
            <p className="text-xs text-[#99907c]">Esperando respuesta</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0A0A0E]/60 backdrop-blur-xl border border-[#262629] hover:border-[#D4AF37]/30 transition-colors relative overflow-hidden flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <h3 className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c]">Leídos (Pendientes)</h3>
            <div className="w-8 h-8 rounded-lg bg-[#262629] flex items-center justify-center text-[#e4e1e7]">
              <MailOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-end gap-3 mb-1">
              <p className="text-5xl font-semibold text-white">{leidos}</p>
            </div>
            <p className="text-xs text-[#99907c]">Vistos pero sin respuesta oficial</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0A0A0E]/60 backdrop-blur-xl border border-[#262629] hover:border-[#D4AF37]/30 transition-colors relative overflow-hidden flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <h3 className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c]">Respondidos</h3>
            <div className="w-8 h-8 rounded-lg bg-[#262629] flex items-center justify-center text-[#e4e1e7]">
              <MailCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-end gap-3 mb-1">
              <p className="text-5xl font-semibold text-white">{respondidos}</p>
            </div>
            <p className="text-xs text-[#99907c]">Tickets cerrados exitosamente</p>
          </div>
        </div>
      </div>

      {/* Controles de Filtrado */}
      <MessageControls 
        currentQuery={q} 
        currentSubject={subjectFilter} 
        currentStatus={statusFilter} 
      />

      {/* Tabla de Mensajes */}
      <div className="bg-[#0A0A0E]/60 backdrop-blur-xl border border-[#262629] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#1b1b1f]/50 border-b border-[#262629] text-[10px] font-montserrat uppercase tracking-widest text-[#99907c]">
                <th className="px-6 py-5 font-semibold">Remitente</th>
                <th className="px-6 py-5 font-semibold">Contacto</th>
                <th className="px-6 py-5 font-semibold">Asunto y Mensaje</th>
                <th className="px-6 py-5 font-semibold">Estado</th>
                <th className="px-6 py-5 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262629]">
              {requests.map(req => {
                
                const getStatusStyle = (status: string) => {
                  if (status === 'nuevo') return 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10 font-bold';
                  if (status === 'leido') return 'border-[#e4e1e7] text-[#e4e1e7]';
                  if (status === 'respondido') return 'border-[#262629] text-[#99907c] bg-[#1b1b1f]';
                  if (status === 'archivado') return 'border-[#262629] text-[#42454a]';
                  return 'border-[#262629] text-[#99907c]';
                };

                return (
                  <tr key={req.id} className="hover:bg-[#1b1b1f]/40 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg bg-[#262629] flex items-center justify-center flex-shrink-0 mt-1 ${req.status === 'nuevo' ? 'text-[#D4AF37] border border-[#D4AF37]/30' : 'text-[#99907c]'}`}>
                          <Mail className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className={`font-medium text-sm mb-1 break-words ${req.status === 'nuevo' ? 'text-white' : 'text-[#e4e1e7]'}`}>{req.name}</p>
                          <span className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] block">
                            {new Date(req.created_at).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1 text-xs text-[#d0c5af]">
                        <span>{req.email}</span>
                        <span className="text-[#99907c]">{req.phone || 'Sin teléfono'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1 max-w-[300px]">
                        <span className="bg-[#1b1b1f] border border-[#262629] px-2.5 py-1 rounded-md text-[10px] font-montserrat uppercase tracking-wider text-[#d0c5af] w-fit">
                          {req.subject}
                        </span>
                        <p className={`text-xs truncate ${req.status === 'nuevo' ? 'text-[#e4e1e7] font-medium' : 'text-[#99907c]'}`} title={req.message}>
                          {req.message}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center border px-3 py-1 rounded-full text-[9px] font-montserrat uppercase tracking-wider ${getStatusStyle(req.status)}`}>
                        {req.status.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <MessageActions request={req} />
                    </td>
                  </tr>
                );
              })}
              
              {requests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-[#99907c] text-sm">
                    No hay mensajes que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        {totalRequests > 0 && (
          <div className="bg-[#1b1b1f]/50 border-t border-[#262629] px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-[#99907c]">
              Mostrando <span className="text-[#e4e1e7] font-medium">{from + 1}-{Math.min(to + 1, totalRequests)}</span> de <span className="text-[#e4e1e7] font-medium">{totalRequests}</span> mensajes
            </p>
            <div className="flex gap-2">
              {page > 1 ? (
                <Link 
                  href={`?page=${page - 1}${q ? `&q=${q}` : ''}${subjectFilter ? `&subject=${subjectFilter}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}`}
                  className="px-4 py-2 bg-[#1b1b1f] border border-[#262629] hover:border-[#D4AF37]/50 rounded-lg text-sm text-[#d0c5af] hover:text-white transition-colors flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </Link>
              ) : (
                <button disabled className="px-4 py-2 bg-[#0A0A0E] border border-[#262629] rounded-lg text-sm text-[#42454a] flex items-center gap-1 cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </button>
              )}
              
              <button className="w-9 h-9 rounded-lg bg-[#D4AF37] text-[#0A0A0E] font-semibold text-sm flex items-center justify-center">
                {page}
              </button>
              
              {page < totalPages ? (
                <Link 
                  href={`?page=${page + 1}${q ? `&q=${q}` : ''}${subjectFilter ? `&subject=${subjectFilter}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}`}
                  className="px-4 py-2 bg-[#1b1b1f] border border-[#262629] hover:border-[#D4AF37]/50 rounded-lg text-sm text-[#d0c5af] hover:text-white transition-colors flex items-center gap-1"
                >
                  Siguiente <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <button disabled className="px-4 py-2 bg-[#0A0A0E] border border-[#262629] rounded-lg text-sm text-[#42454a] flex items-center gap-1 cursor-not-allowed">
                  Siguiente <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tarjeta de Protocolo */}
      <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#262629] flex items-center justify-center text-[#D4AF37] flex-shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold text-white">Políticas de Atención al Usuario</h3>
              <span className="border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 rounded text-[9px] font-montserrat uppercase tracking-wider">PQRS</span>
            </div>
            <p className="text-[#99907c] text-sm max-w-3xl leading-relaxed">
              El tiempo máximo de respuesta oficial para cualquier inquietud ciudadana o solicitud de información es de 3 días hábiles. Asegúrate de marcar los mensajes como "Respondidos" una vez gestiones el correo electrónico.
            </p>
          </div>
        </div>
        <button className="bg-[#262629] border border-[#262629] hover:border-[#D4AF37] text-white hover:text-[#D4AF37] px-6 py-3 rounded-xl text-xs font-montserrat font-semibold tracking-wider uppercase transition-colors shrink-0 whitespace-nowrap">
          Ver Tiempos de Respuesta →
        </button>
      </div>

    </div>
  );
}
