'use client';

import { useState, useEffect } from 'react';
import { Download, HeartHandshake, Trash2, X, Mail, Phone, Calendar, Tag, Search, RefreshCw, DollarSign, CheckCircle2 } from 'lucide-react';
import { createBrowserClient } from '@/services/supabase/client';

export interface DonationRequest {
  id: string;
  donor_name?: string;
  full_name?: string;
  email: string;
  phone?: string;
  donation_type?: string;
  message?: string;
  amount_or_description?: string;
  details?: string;
  amount_cop?: number;
  status?: string;
  created_at: string;
}

function formatDateSpanish(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatFullDateSpanish(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

const DONATION_TYPE_LABELS: Record<string, string> = {
  economico: 'Donación Económica',
  economica: 'Donación Económica',
  insumos: 'Insumos Educativos',
  equipos: 'Equipos y Materiales',
  patrocinio: 'Alianza / Patrocinio',
  alianza: 'Alianza Empresarial',
  otro: 'Otro aporte',
};

export default function AdminDonacionesPage() {
  const [donations, setDonations] = useState<DonationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState<DonationRequest | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const supabase = createBrowserClient();

  const loadDonations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('donation_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDonations(data as DonationRequest[]);
    } else if (error) {
      console.error('Error cargando donaciones:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDonations();
  }, []);

  // Abrir modal y actualizar estado si es nueva
  const handleOpenDonation = async (don: DonationRequest) => {
    setSelectedDonation(don);

    const currentStatus = (don.status || '').toLowerCase();
    if (currentStatus === 'nueva' || !don.status) {
      const { error } = await supabase
        .from('donation_requests')
        .update({ status: 'en_contacto' })
        .eq('id', don.id);

      if (!error) {
        setDonations((prev) =>
          prev.map((d) => (d.id === don.id ? { ...d, status: 'en_contacto' } : d))
        );
        setSelectedDonation((prev) => (prev ? { ...prev, status: 'en_contacto' } : null));
      } else {
        console.warn('No se pudo actualizar estado de donación:', error.message);
      }
    }
  };

  // Cambiar estado manualmente desde el modal
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('donation_requests')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      alert(`Error al actualizar estado: ${error.message}`);
      return;
    }

    setDonations((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
    );
    setSelectedDonation((prev) => (prev && prev.id === id ? { ...prev, status: newStatus } : prev));
  };

  // Eliminar donación
  const handleDeleteDonation = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta intención de donación?')) return;

    setDeletingId(id);
    const { error } = await supabase.from('donation_requests').delete().eq('id', id);

    if (error) {
      alert(`Error al eliminar: ${error.message}`);
      setDeletingId(null);
      return;
    }

    setDonations((prev) => prev.filter((d) => d.id !== id));
    if (selectedDonation?.id === id) {
      setSelectedDonation(null);
    }
    setDeletingId(null);
  };

  // Exportar a CSV
  const handleExportCSV = () => {
    if (!donations.length) {
      alert('No hay intenciones de donación para exportar.');
      return;
    }

    const headers = ['ID', 'Donante', 'Email', 'Teléfono', 'Tipo Aporte', 'Detalle/Mensaje', 'Monto COP', 'Estado', 'Fecha'];
    const rows = donations.map((d) => [
      d.id,
      `"${(d.donor_name || d.full_name || '').replace(/"/g, '""')}"`,
      `"${(d.email || '').replace(/"/g, '""')}"`,
      `"${(d.phone || '').replace(/"/g, '""')}"`,
      `"${(d.donation_type || '').replace(/"/g, '""')}"`,
      `"${(d.message || d.amount_or_description || d.details || '').replace(/"/g, '""')}"`,
      d.amount_cop || '',
      d.status || 'nueva',
      d.created_at || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `donaciones_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (s?: string) => {
    const status = (s || 'nueva').toLowerCase();
    if (status === 'nueva' || status === 'pendiente') {
      return (
        <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border border-gold-primary text-gold-primary bg-gold-primary/10">
          NUEVA
        </span>
      );
    }
    if (status === 'en_contacto') {
      return (
        <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border border-blue-400 text-blue-400 bg-blue-500/10">
          EN CONTACTO
        </span>
      );
    }
    if (status === 'concretada' || status === 'gestionada') {
      return (
        <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border border-green-400 text-green-400 bg-green-500/10">
          CONCRETADA
        </span>
      );
    }
    if (status === 'descartada') {
      return (
        <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border border-red-400 text-red-400 bg-red-500/10">
          DESCARTADA
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border border-gray-400 text-gray-400">
        {status.toUpperCase()}
      </span>
    );
  };

  const filteredDonations = donations.filter((don) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const name = (don.donor_name || don.full_name || '').toLowerCase();
    const email = (don.email || '').toLowerCase();
    const type = (don.donation_type || '').toLowerCase();
    const message = (don.message || don.amount_or_description || don.details || '').toLowerCase();
    return name.includes(q) || email.includes(q) || type.includes(q) || message.includes(q);
  });

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#D4AF37] mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
            Gestión de Recursos
          </p>
          <h1 className="text-4xl font-semibold font-montserrat tracking-wide text-white">
            Intenciones de Donación
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDonations}
            disabled={loading}
            title="Recargar donaciones"
            className="flex items-center gap-2 bg-space-card/80 hover:bg-space-card border border-space-border/80 text-gray-300 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-gold-primary' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#e1c469] text-[#0A0A0E] px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors uppercase tracking-wider font-montserrat cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="mb-6 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por donante, email, tipo de aporte o detalles..."
            className="w-full bg-space-card/60 border border-space-border/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-primary transition-colors"
          />
        </div>
        <div className="text-xs text-gray-400 whitespace-nowrap">
          Total: <span className="text-white font-semibold">{filteredDonations.length}</span> registros
        </div>
      </div>

      {/* Table */}
      <div className="p-6 md:p-8 bg-space-card/60 backdrop-blur-md border border-space-border/80 text-white rounded-2xl shadow-xl">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-space-border/80 text-[10px] font-montserrat uppercase tracking-widest text-gray-400">
                <th className="pb-4 font-semibold">Donante</th>
                <th className="pb-4 font-semibold">Tipo de Aporte</th>
                <th className="pb-4 font-semibold">Detalle / Monto</th>
                <th className="pb-4 font-semibold">Fecha</th>
                <th className="pb-4 font-semibold">Estado</th>
                <th className="pb-4 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-3">
                      <RefreshCw className="w-5 h-5 animate-spin text-gold-primary" />
                      <span>Cargando donaciones...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredDonations.length > 0 ? (
                filteredDonations.map((don) => {
                  const displayName = don.donor_name || don.full_name || 'Anónimo';
                  const typeLabel = DONATION_TYPE_LABELS[don.donation_type || ''] || don.donation_type || 'Desconocido';
                  const detailText = don.amount_cop 
                    ? `$${Number(don.amount_cop).toLocaleString('es-CO')} COP` 
                    : (don.message || don.amount_or_description || don.details || 'No especificado');

                  return (
                    <tr
                      key={don.id}
                      className="border-b border-space-border/50 hover:bg-space-card/80 transition-colors group"
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-space-black border border-space-border/50 flex items-center justify-center text-gold-primary shrink-0">
                            <HeartHandshake className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-medium truncate max-w-[180px]">{displayName}</p>
                            <p className="text-gray-400 text-xs truncate max-w-[180px]">{don.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-gray-300">
                        <span className="bg-space-black px-3 py-1 rounded-md text-xs border border-space-border/50 capitalize inline-block">
                          {typeLabel}
                        </span>
                      </td>
                      <td className="py-4 text-gray-300 text-xs truncate max-w-[220px]">
                        {detailText}
                      </td>
                      <td className="py-4 text-gray-400 text-xs whitespace-nowrap">
                        {formatDateSpanish(don.created_at)}
                      </td>
                      <td className="py-4 whitespace-nowrap">
                        {getStatusBadge(don.status)}
                      </td>
                      <td className="py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenDonation(don)}
                            className="bg-gold-primary/10 hover:bg-gold-primary text-gold-primary hover:text-space-dark px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-200 cursor-pointer"
                          >
                            GESTIONAR
                          </button>
                          <button
                            onClick={() => handleDeleteDonation(don.id)}
                            disabled={deletingId === don.id}
                            title="Eliminar donación"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    {searchQuery ? 'No se encontraron donaciones con el criterio de búsqueda.' : 'No hay donaciones registradas.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalle / Gestión de Donación */}
      {selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div 
            className="bg-[#0E0E12] border border-[#D4AF37]/40 rounded-2xl max-w-2xl w-full p-6 md:p-8 text-white shadow-[0_0_60px_rgba(212,175,55,0.18)] relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>

            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-space-border/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-primary/10 border border-gold-primary/30 flex items-center justify-center text-gold-primary shrink-0">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#D4AF37]">
                      Intención de Donación
                    </p>
                    {getStatusBadge(selectedDonation.status)}
                  </div>
                  <h2 className="text-xl font-bold font-montserrat text-white">
                    {selectedDonation.donor_name || selectedDonation.full_name || 'Anónimo'}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setSelectedDonation(null)}
                className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-colors cursor-pointer"
                title="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-[#15151A] border border-space-border/60 rounded-xl p-3 flex items-center gap-3">
                <Tag className="w-4 h-4 text-gold-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-montserrat">Tipo de Aporte</p>
                  <p className="text-xs text-gray-200 font-semibold truncate">
                    {DONATION_TYPE_LABELS[selectedDonation.donation_type || ''] || selectedDonation.donation_type || 'Desconocido'}
                  </p>
                </div>
              </div>

              <div className="bg-[#15151A] border border-space-border/60 rounded-xl p-3 flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gold-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-montserrat">Fecha de Solicitud</p>
                  <p className="text-xs text-gray-200">{formatFullDateSpanish(selectedDonation.created_at)}</p>
                </div>
              </div>

              <div className="bg-[#15151A] border border-space-border/60 rounded-xl p-3 flex items-center gap-3">
                <Mail className="w-4 h-4 text-gold-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-montserrat">Correo Electrónico</p>
                  <a 
                    href={`mailto:${selectedDonation.email}`}
                    className="text-xs text-gray-200 hover:text-gold-primary transition-colors truncate block"
                  >
                    {selectedDonation.email}
                  </a>
                </div>
              </div>

              <div className="bg-[#15151A] border border-space-border/60 rounded-xl p-3 flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-montserrat">Teléfono / WhatsApp</p>
                  {selectedDonation.phone ? (
                    <a 
                      href={`https://wa.me/${selectedDonation.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-200 hover:text-green-400 transition-colors truncate block"
                    >
                      {selectedDonation.phone}
                    </a>
                  ) : (
                    <p className="text-xs text-gray-500">No especificado</p>
                  )}
                </div>
              </div>
            </div>

            {/* Donation Details / Message */}
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-montserrat mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-primary"></span>
                Detalle del Aporte o Patrocinio
              </p>
              <div className="bg-[#15151A] border border-space-border/80 rounded-xl p-5 text-gray-200 text-sm whitespace-pre-wrap leading-relaxed max-h-[200px] overflow-y-auto shadow-inner">
                {selectedDonation.message || selectedDonation.amount_or_description || selectedDonation.details || 'Sin descripción adicional.'}
              </div>
            </div>

            {/* Change Status Options */}
            <div className="mb-6 bg-[#15151A] border border-space-border/60 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs font-montserrat uppercase tracking-wider text-gray-400">
                Cambiar Estado:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedDonation.id, 'en_contacto')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedDonation.status === 'en_contacto' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-space-card border border-space-border text-gray-300 hover:text-white'
                  }`}
                >
                  En Contacto
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedDonation.id, 'concretada')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedDonation.status === 'concretada' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-space-card border border-space-border text-gray-300 hover:text-white'
                  }`}
                >
                  Concretada
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedDonation.id, 'descartada')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedDonation.status === 'descartada' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-space-card border border-space-border text-gray-300 hover:text-white'
                  }`}
                >
                  Descartada
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-space-border/60">
              <button
                onClick={() => handleDeleteDonation(selectedDonation.id)}
                disabled={deletingId === selectedDonation.id}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar Registro
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <a
                  href={`mailto:${selectedDonation.email}?subject=Fundación Principio y Fin - Seguimiento Donación`}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-space-dark bg-gold-primary hover:bg-gold-light transition-colors uppercase tracking-wider font-montserrat cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  Contactar
                </a>
                <button
                  onClick={() => setSelectedDonation(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-space-card/80 hover:bg-space-card border border-space-border transition-colors uppercase tracking-wider font-montserrat cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
