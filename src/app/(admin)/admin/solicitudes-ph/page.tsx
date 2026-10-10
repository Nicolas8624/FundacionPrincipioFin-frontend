import { createServerClient } from '@/services/supabase/server';
import { Building, Building2, Calendar, ClipboardCheck, ClipboardList, Info, UsersRound } from 'lucide-react';
import { PhControls } from '@/components/admin/PhControls';
import { PhHeaderActions } from '@/components/admin/PhHeaderActions';
import { PhActions } from '@/components/admin/PhActions';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default async function AdminSolicitudesPhPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const supabase = await createServerClient();
  
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q : '';
  const localityFilter = typeof params.locality === 'string' ? params.locality : '';
  const statusFilter = typeof params.status === 'string' ? params.status : '';
  const tallerFilter = typeof params.taller === 'string' ? params.taller : '';
  
  const page = typeof params.page === 'string' ? parseInt(params.page, 10) : 1;
  const limit = 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // 1. Obtener localidades únicas (o definir lista estática)
  // Como `locality` es texto libre, sacaremos una lista de las que existen.
  const { data: rawLocalities } = await supabase.from('ph_requests').select('locality');
  const localitiesList = Array.from(new Set(rawLocalities?.map(r => r.locality).filter(Boolean)));

  // 2. Conteo total (Paginación)
  let countQuery = supabase.from('ph_requests').select('*', { count: 'exact', head: true });
  
  if (q) countQuery.or(`complex_name.ilike.%${q}%,administrator_name.ilike.%${q}%`);
  if (localityFilter) countQuery.ilike('locality', `%${localityFilter}%`);
  if (statusFilter) countQuery.eq('status', statusFilter);
  if (tallerFilter) countQuery.ilike('message', `%${tallerFilter}%`);

  const { count: exactCount } = await countQuery;
  const totalRequests = exactCount || 0;
  const totalPages = Math.ceil(totalRequests / limit);

  // 3. Métricas
  const { data: statsData } = await supabase.from('ph_requests').select('status');
  const totalSolicitudes = statsData?.length || 0;
  const pendientes = statsData?.filter(e => e.status === 'pendiente').length || 0;
  const aprobadas = statsData?.filter(e => e.status === 'aprobada').length || 0;
  const evaluacion = statsData?.filter(e => e.status === 'en_revision').length || 0;

  // 4. Query paginado
  let query = supabase
    .from('ph_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (q) query.or(`complex_name.ilike.%${q}%,administrator_name.ilike.%${q}%`);
  if (localityFilter) query.ilike('locality', `%${localityFilter}%`);
  if (statusFilter) query.eq('status', statusFilter);
  if (tallerFilter) query.ilike('message', `%${tallerFilter}%`);

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
            ADMINISTRACIÓN DE PROPIEDAD HORIZONTAL • CONVENIOS {new Date().getFullYear()}
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold font-montserrat tracking-wide text-white">
            Solicitudes de Propiedad Horizontal
          </h1>
          <p className="text-[#99907c] text-sm mt-3 max-w-2xl leading-relaxed">
            Gestiona las postulaciones de administraciones de edificios y conjuntos residenciales en Bogotá para la realización de talleres y programas comunitarios.
          </p>
        </div>
        
        <PhHeaderActions />
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-[#0A0A0E]/60 backdrop-blur-xl border border-[#262629] hover:border-[#D4AF37]/30 transition-colors relative overflow-hidden flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <h3 className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] max-w-[80px]">Total Solicitudes</h3>
            <div className="w-8 h-8 rounded-lg bg-[#262629] flex items-center justify-center text-[#d0c5af]">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-end gap-3 mb-1">
              <p className="text-5xl font-semibold text-white">{totalSolicitudes}</p>
              <span className="text-[#D4AF37] text-[10px] font-medium">+24% este trimestre</span>
            </div>
            <p className="text-xs text-[#99907c]">Conjuntos y edificios postulados</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0A0A0E]/60 backdrop-blur-xl border border-[#262629] hover:border-[#D4AF37]/30 transition-colors relative overflow-hidden flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <h3 className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] max-w-[120px]">Pendientes Visita Técnica</h3>
            <div className="w-8 h-8 rounded-lg bg-[#262629] flex items-center justify-center text-[#D4AF37]">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-end gap-3 mb-1">
              <p className="text-5xl font-semibold text-[#D4AF37]">{pendientes}</p>
              {pendientes > 0 && <span className="text-[#D4AF37] text-[10px] font-medium border border-[#D4AF37]/30 px-2 py-1 rounded-full mb-1.5">Atención prioritaria</span>}
            </div>
            <p className="text-xs text-[#99907c]">Validación de salón comunal</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0A0A0E]/60 backdrop-blur-xl border border-[#262629] hover:border-[#D4AF37]/30 transition-colors relative overflow-hidden flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <h3 className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] max-w-[120px]">Convenios Aprobados</h3>
            <div className="w-8 h-8 rounded-lg bg-[#262629] flex items-center justify-center text-[#e4e1e7]">
              <ClipboardCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-end gap-3 mb-1">
              <p className="text-5xl font-semibold text-white">{aprobadas}</p>
              <span className="text-[#99907c] text-[10px] font-medium border border-[#262629] px-2 py-1 rounded-full mb-1.5">Activos</span>
            </div>
            <p className="text-xs text-[#99907c]">Talleres agendados o en curso</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0A0A0E]/60 backdrop-blur-xl border border-[#262629] hover:border-[#D4AF37]/30 transition-colors relative overflow-hidden flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <h3 className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c]">En Evaluación</h3>
            <div className="w-8 h-8 rounded-lg bg-[#262629] flex items-center justify-center text-[#e4e1e7]">
              <UsersRound className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-end gap-3 mb-1">
              <p className="text-5xl font-semibold text-white">{evaluacion}</p>
              <span className="text-[#99907c] text-[10px] font-medium border border-[#262629] px-2 py-1 rounded-full mb-1.5">Comité</span>
            </div>
            <p className="text-xs text-[#99907c]">Revisión presupuestal / cupos</p>
          </div>
        </div>
      </div>

      {/* Controles de Filtrado */}
      <PhControls 
        localities={localitiesList} 
        currentQuery={q} 
        currentLocality={localityFilter} 
        currentStatus={statusFilter} 
        currentTaller={tallerFilter} 
      />

      {/* Tabla de Solicitudes PH */}
      <div className="bg-[#0A0A0E]/60 backdrop-blur-xl border border-[#262629] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#1b1b1f]/50 border-b border-[#262629] text-[10px] font-montserrat uppercase tracking-widest text-[#99907c]">
                <th className="px-6 py-5 font-semibold">Conjunto / Edificio</th>
                <th className="px-6 py-5 font-semibold">Administrador / Contacto</th>
                <th className="px-6 py-5 font-semibold">Localidad & Dirección</th>
                <th className="px-6 py-5 font-semibold">Mensaje / Detalle</th>
                <th className="px-6 py-5 font-semibold">Estado</th>
                <th className="px-6 py-5 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262629]">
              {requests.map(req => {
                
                const getStatusStyle = (status: string) => {
                  if (status === 'aprobada') return 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10';
                  if (status === 'pendiente') return 'border-[#D4AF37] text-[#D4AF37]';
                  if (status === 'en_revision') return 'border-[#e4e1e7] text-[#e4e1e7] bg-[#1b1b1f]';
                  return 'border-[#262629] text-[#99907c]';
                };

                return (
                  <tr key={req.id} className="hover:bg-[#1b1b1f]/40 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#262629] flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/20 flex-shrink-0 mt-1">
                          <Building className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[#e4e1e7] font-medium text-sm mb-1 break-words">{req.complex_name}</p>
                          <div className="flex flex-col gap-0.5 text-[10px] font-montserrat uppercase tracking-widest text-[#99907c]">
                            <span>{req.residents_count || 'N/A'} APTOS</span>
                            <span>REGISTRADO: {new Date(req.created_at).toLocaleDateString('es-CO')}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-[#e4e1e7] text-sm font-medium">{req.administrator_name}</span>
                        <div className="flex items-center gap-2 text-xs text-[#99907c]">
                          <span>{req.role_title || 'Admin'}</span>
                        </div>
                        <div className="text-[11px] text-[#99907c] mt-1">{req.email} • {req.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-[#e4e1e7] text-sm">{req.locality || 'Sin localidad'}</span>
                        <span className="text-[#99907c] text-xs max-w-[150px] truncate" title={req.address}>{req.address || 'Sin dirección'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="inline-flex items-center border border-[#262629] bg-[#1b1b1f] px-3 py-1.5 rounded-lg text-xs text-[#d0c5af] max-w-[200px] truncate" title={req.message}>
                        {req.message || 'Sin detalles'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center border px-3 py-1 rounded-full text-[9px] font-montserrat uppercase tracking-wider ${getStatusStyle(req.status)}`}>
                        {req.status.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <PhActions request={req} />
                    </td>
                  </tr>
                );
              })}
              
              {requests.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-[#99907c] text-sm">
                    No hay solicitudes que coincidan con los filtros.
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
              Mostrando <span className="text-[#e4e1e7] font-medium">{from + 1}-{Math.min(to + 1, totalRequests)}</span> de <span className="text-[#e4e1e7] font-medium">{totalRequests}</span> solicitudes
            </p>
            <div className="flex gap-2">
              {page > 1 ? (
                <Link 
                  href={`?page=${page - 1}${q ? `&q=${q}` : ''}${localityFilter ? `&locality=${localityFilter}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}${tallerFilter ? `&taller=${tallerFilter}` : ''}`}
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
                  href={`?page=${page + 1}${q ? `&q=${q}` : ''}${localityFilter ? `&locality=${localityFilter}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}${tallerFilter ? `&taller=${tallerFilter}` : ''}`}
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
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold text-white">Protocolo de Convenios en Propiedad Horizontal</h3>
              <span className="border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 rounded text-[9px] font-montserrat uppercase tracking-wider">Reglamento</span>
            </div>
            <p className="text-[#99907c] text-sm max-w-3xl leading-relaxed">
              Cada postulación residencial requiere visita técnica de verificación del salón comunal (capacidad mínima 15 personas, iluminación y servicios básicos) antes de la firma de acta y asignación de talleristas de la Fundación.
            </p>
          </div>
        </div>
        <button className="bg-[#262629] border border-[#262629] hover:border-[#D4AF37] text-white hover:text-[#D4AF37] px-6 py-3 rounded-xl text-xs font-montserrat font-semibold tracking-wider uppercase transition-colors shrink-0 whitespace-nowrap">
          Ver Protocolo y Acta Modelo →
        </button>
      </div>

    </div>
  );
}
