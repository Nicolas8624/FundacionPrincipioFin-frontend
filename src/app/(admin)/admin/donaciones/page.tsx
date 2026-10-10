import { createServerClient } from '@/services/supabase/server';
import { HeartHandshake, DollarSign, Handshake, MailCheck, PackageX, PiggyBank, RefreshCcw } from 'lucide-react';
import { DonationControls } from '@/components/admin/DonationControls';
import { DonationHeaderActions } from '@/components/admin/DonationHeaderActions';
import { DonationActions } from '@/components/admin/DonationActions';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default async function AdminDonacionesPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const supabase = await createServerClient();
  
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q : '';
  const typeFilter = typeof params.type === 'string' ? params.type : '';
  const statusFilter = typeof params.status === 'string' ? params.status : '';
  
  const page = typeof params.page === 'string' ? parseInt(params.page, 10) : 1;
  const limit = 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Conteo total (Paginación)
  let countQuery = supabase.from('donation_requests').select('*', { count: 'exact', head: true });
  
  if (q) countQuery.or(`donor_name.ilike.%${q}%,email.ilike.%${q}%`);
  if (typeFilter) countQuery.eq('donation_type', typeFilter);
  if (statusFilter) countQuery.eq('status', statusFilter);

  const { count: exactCount } = await countQuery;
  const totalRequests = exactCount || 0;
  const totalPages = Math.ceil(totalRequests / limit);

  // Métricas
  const { data: statsData } = await supabase.from('donation_requests').select('status, amount_cop, donation_type');
  const totalRecaudado = statsData?.reduce((acc, curr) => acc + (curr.amount_cop || 0), 0) || 0;
  const totalDonaciones = statsData?.length || 0;
  const enContacto = statsData?.filter(e => e.status === 'en_contacto').length || 0;
  const concretadas = statsData?.filter(e => e.status === 'concretada').length || 0;
  const descartadas = statsData?.filter(e => e.status === 'descartada').length || 0;

  // Query paginado
  let query = supabase
    .from('donation_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (q) query.or(`donor_name.ilike.%${q}%,email.ilike.%${q}%`);
  if (typeFilter) query.eq('donation_type', typeFilter);
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
            ADMINISTRACIÓN DE RECURSOS • CONSOLIDADO {new Date().getFullYear()}
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold font-montserrat tracking-wide text-white">
            Donaciones y Alianzas
          </h1>
          <p className="text-[#99907c] text-sm mt-3 max-w-2xl leading-relaxed">
            Gestiona las intenciones de donación, clasifica los aportes y haz seguimiento a los benefactores de la Fundación.
          </p>
        </div>
        
        <DonationHeaderActions />
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-[#0A0A0E]/60 backdrop-blur-xl border border-[#262629] hover:border-[#D4AF37]/30 transition-colors relative overflow-hidden flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <h3 className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c]">Total Recaudado (Aprox)</h3>
            <div className="w-8 h-8 rounded-lg bg-[#262629] flex items-center justify-center text-[#d0c5af]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-end gap-3 mb-1">
              <p className="text-4xl font-semibold text-white">
                ${totalRecaudado.toLocaleString('es-CO')}
              </p>
            </div>
            <p className="text-xs text-[#99907c]">Suma de aportes registrados manuales</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0A0A0E]/60 backdrop-blur-xl border border-[#262629] hover:border-[#D4AF37]/30 transition-colors relative overflow-hidden flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <h3 className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c]">Solicitudes Totales</h3>
            <div className="w-8 h-8 rounded-lg bg-[#262629] flex items-center justify-center text-[#D4AF37]">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-end gap-3 mb-1">
              <p className="text-5xl font-semibold text-[#D4AF37]">{totalDonaciones}</p>
              <span className="text-[#D4AF37] text-[10px] font-medium border border-[#D4AF37]/30 px-2 py-1 rounded-full mb-1.5">{concretadas} Concretadas</span>
            </div>
            <p className="text-xs text-[#99907c]">Intenciones de donación recibidas</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0A0A0E]/60 backdrop-blur-xl border border-[#262629] hover:border-[#D4AF37]/30 transition-colors relative overflow-hidden flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <h3 className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c]">En Contacto / Negociación</h3>
            <div className="w-8 h-8 rounded-lg bg-[#262629] flex items-center justify-center text-[#e4e1e7]">
              <Handshake className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-end gap-3 mb-1">
              <p className="text-5xl font-semibold text-white">{enContacto}</p>
            </div>
            <p className="text-xs text-[#99907c]">Requieren seguimiento</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0A0A0E]/60 backdrop-blur-xl border border-[#262629] hover:border-[#D4AF37]/30 transition-colors relative overflow-hidden flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <h3 className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c]">Descartadas</h3>
            <div className="w-8 h-8 rounded-lg bg-[#262629] flex items-center justify-center text-[#e4e1e7]">
              <PackageX className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-end gap-3 mb-1">
              <p className="text-5xl font-semibold text-white">{descartadas}</p>
            </div>
            <p className="text-xs text-[#99907c]">No cumplieron requisitos</p>
          </div>
        </div>
      </div>

      {/* Controles de Filtrado */}
      <DonationControls 
        currentQuery={q} 
        currentType={typeFilter} 
        currentStatus={statusFilter} 
      />

      {/* Tabla de Donaciones */}
      <div className="bg-[#0A0A0E]/60 backdrop-blur-xl border border-[#262629] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#1b1b1f]/50 border-b border-[#262629] text-[10px] font-montserrat uppercase tracking-widest text-[#99907c]">
                <th className="px-6 py-5 font-semibold">Donante / Contacto</th>
                <th className="px-6 py-5 font-semibold">Tipo de Aporte</th>
                <th className="px-6 py-5 font-semibold">Mensaje / Detalle</th>
                <th className="px-6 py-5 font-semibold">Monto Registrado</th>
                <th className="px-6 py-5 font-semibold">Estado</th>
                <th className="px-6 py-5 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262629]">
              {requests.map(req => {
                
                const getStatusStyle = (status: string) => {
                  if (status === 'concretada') return 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10';
                  if (status === 'nueva') return 'border-[#D4AF37] text-[#D4AF37]';
                  if (status === 'en_contacto') return 'border-[#e4e1e7] text-[#e4e1e7] bg-[#1b1b1f]';
                  if (status === 'descartada') return 'border-[#93000a] text-[#ffb4ab] bg-[#93000a]/10';
                  return 'border-[#262629] text-[#99907c]';
                };

                return (
                  <tr key={req.id} className="hover:bg-[#1b1b1f]/40 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#262629] flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/20 flex-shrink-0 mt-1">
                          <HeartHandshake className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[#e4e1e7] font-medium text-sm mb-1 break-words">{req.donor_name}</p>
                          <div className="flex flex-col gap-0.5 text-xs text-[#99907c]">
                            <span>{req.email}</span>
                            <span>{req.phone || 'Sin teléfono'}</span>
                          </div>
                          <span className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] mt-2 block">
                            REGISTRADO: {new Date(req.created_at).toLocaleDateString('es-CO')}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="bg-[#1b1b1f] border border-[#262629] px-3 py-1.5 rounded-lg text-xs text-[#d0c5af] capitalize">
                        {req.donation_type}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="inline-flex items-center text-xs text-[#99907c] max-w-[250px] truncate" title={req.message}>
                        {req.message || 'Sin mensaje adicional'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-sm font-medium ${req.amount_cop ? 'text-[#D4AF37]' : 'text-[#99907c]'}`}>
                        {req.amount_cop ? `$${req.amount_cop.toLocaleString('es-CO')}` : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center border px-3 py-1 rounded-full text-[9px] font-montserrat uppercase tracking-wider ${getStatusStyle(req.status)}`}>
                        {req.status.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <DonationActions request={req} />
                    </td>
                  </tr>
                );
              })}
              
              {requests.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-[#99907c] text-sm">
                    No hay solicitudes de donación que coincidan con los filtros.
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
              Mostrando <span className="text-[#e4e1e7] font-medium">{from + 1}-{Math.min(to + 1, totalRequests)}</span> de <span className="text-[#e4e1e7] font-medium">{totalRequests}</span> donaciones
            </p>
            <div className="flex gap-2">
              {page > 1 ? (
                <Link 
                  href={`?page=${page - 1}${q ? `&q=${q}` : ''}${typeFilter ? `&type=${typeFilter}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}`}
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
                  href={`?page=${page + 1}${q ? `&q=${q}` : ''}${typeFilter ? `&type=${typeFilter}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}`}
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
            <PiggyBank className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold text-white">Transparencia y Certificados</h3>
              <span className="border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 rounded text-[9px] font-montserrat uppercase tracking-wider">Legal</span>
            </div>
            <p className="text-[#99907c] text-sm max-w-3xl leading-relaxed">
              Toda donación mayor a $500,000 COP o en especie con valor comercial estimado superior, requiere emisión automática de certificado de donación según normatividad vigente DIAN.
            </p>
          </div>
        </div>
        <button className="bg-[#262629] border border-[#262629] hover:border-[#D4AF37] text-white hover:text-[#D4AF37] px-6 py-3 rounded-xl text-xs font-montserrat font-semibold tracking-wider uppercase transition-colors shrink-0 whitespace-nowrap">
          Generar Certificados →
        </button>
      </div>

    </div>
  );
}
