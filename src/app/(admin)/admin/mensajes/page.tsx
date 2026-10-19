'use client';

import { useState, useEffect } from 'react';
import { Download, MessageSquare, Trash2, X, Mail, Phone, Calendar, Tag, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { createBrowserClient } from '@/services/supabase/client';

export interface ContactMessage {
  id: string;
  name?: string;
  full_name?: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
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

export default function AdminMensajesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const supabase = createBrowserClient();

  const loadMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMessages(data as ContactMessage[]);
    } else if (error) {
      console.error('Error cargando mensajes:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();
  }, []);

  // Abrir modal y marcar como leído
  const handleOpenMessage = async (msg: ContactMessage) => {
    setSelectedMessage(msg);

    const currentStatus = (msg.status || '').toLowerCase();
    if (currentStatus === 'nuevo' || !msg.status) {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: 'leido' })
        .eq('id', msg.id);

      if (!error) {
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, status: 'leido' } : m))
        );
        setSelectedMessage((prev) => (prev ? { ...prev, status: 'leido' } : null));
      } else {
        console.warn('No se pudo actualizar estado a leido:', error.message);
      }
    }
  };

  // Eliminar mensaje
  const handleDeleteMessage = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este mensaje de contacto?')) return;

    setDeletingId(id);
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);

    if (error) {
      alert(`Error al eliminar: ${error.message}`);
      setDeletingId(null);
      return;
    }

    setMessages((prev) => prev.filter((msg) => msg.id !== id));
    if (selectedMessage?.id === id) {
      setSelectedMessage(null);
    }
    setDeletingId(null);
  };

  // Exportar a CSV
  const handleExportCSV = () => {
    if (!messages.length) {
      alert('No hay mensajes para exportar.');
      return;
    }

    const headers = ['ID', 'Nombre', 'Email', 'Teléfono', 'Asunto', 'Mensaje', 'Estado', 'Fecha'];
    const rows = messages.map((m) => [
      m.id,
      `"${(m.name || m.full_name || '').replace(/"/g, '""')}"`,
      `"${(m.email || '').replace(/"/g, '""')}"`,
      `"${(m.phone || '').replace(/"/g, '""')}"`,
      `"${(m.subject || '').replace(/"/g, '""')}"`,
      `"${(m.message || '').replace(/"/g, '""')}"`,
      m.status || 'nuevo',
      m.created_at || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mensajes_contacto_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (s?: string) => {
    const status = (s || 'nuevo').toLowerCase();
    if (status === 'nuevo') {
      return (
        <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border border-gold-primary text-gold-primary bg-gold-primary/10">
          NUEVO
        </span>
      );
    }
    if (status === 'leido') {
      return (
        <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border border-blue-400 text-blue-400 bg-blue-500/10">
          LEÍDO
        </span>
      );
    }
    if (status === 'respondido') {
      return (
        <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border border-green-400 text-green-400 bg-green-500/10">
          RESPONDIDO
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border border-gray-400 text-gray-400">
        {status.toUpperCase()}
      </span>
    );
  };

  const filteredMessages = messages.filter((msg) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const name = (msg.name || msg.full_name || '').toLowerCase();
    const email = (msg.email || '').toLowerCase();
    const subject = (msg.subject || '').toLowerCase();
    const body = (msg.message || '').toLowerCase();
    return name.includes(q) || email.includes(q) || subject.includes(q) || body.includes(q);
  });

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#D4AF37] mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
            Centro de Comunicaciones
          </p>
          <h1 className="text-4xl font-semibold font-montserrat tracking-wide text-white">
            Mensajes de Contacto
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadMessages}
            disabled={loading}
            title="Recargar mensajes"
            className="flex items-center gap-2 bg-space-card/80 hover:bg-space-card border border-space-border/80 text-gray-300 px-3 py-2.5 rounded-lg text-sm transition-colors"
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
            placeholder="Buscar por remitente, email, asunto o contenido..."
            className="w-full bg-space-card/60 border border-space-border/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-primary transition-colors"
          />
        </div>
        <div className="text-xs text-gray-400 whitespace-nowrap">
          Total: <span className="text-white font-semibold">{filteredMessages.length}</span> mensajes
        </div>
      </div>

      {/* Table */}
      <div className="p-6 md:p-8 bg-space-card/60 backdrop-blur-md border border-space-border/80 text-white rounded-2xl shadow-xl">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-space-border/80 text-[10px] font-montserrat uppercase tracking-widest text-gray-400">
                <th className="pb-4 font-semibold">Remitente</th>
                <th className="pb-4 font-semibold">Contacto</th>
                <th className="pb-4 font-semibold">Asunto</th>
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
                      <span>Cargando mensajes...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredMessages.length > 0 ? (
                filteredMessages.map((msg) => {
                  const displayName = msg.name || msg.full_name || 'Desconocido';
                  return (
                    <tr
                      key={msg.id}
                      className="border-b border-space-border/50 hover:bg-space-card/80 transition-colors group"
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-space-black border border-space-border/50 flex items-center justify-center text-gold-primary shrink-0">
                            <MessageSquare className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-medium truncate max-w-[180px]">{displayName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-gray-400 text-xs">
                        <p className="text-gray-300 truncate max-w-[200px]">{msg.email}</p>
                        {msg.phone && <p className="text-gray-500">{msg.phone}</p>}
                      </td>
                      <td className="py-4 text-gray-300 font-medium text-xs max-w-[180px] truncate">
                        {msg.subject || 'Sin Asunto'}
                      </td>
                      <td className="py-4 text-gray-400 text-xs whitespace-nowrap">
                        {formatDateSpanish(msg.created_at)}
                      </td>
                      <td className="py-4 whitespace-nowrap">
                        {getStatusBadge(msg.status)}
                      </td>
                      <td className="py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenMessage(msg)}
                            className="bg-gold-primary/10 hover:bg-gold-primary text-gold-primary hover:text-space-dark px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-200 cursor-pointer"
                          >
                            LEER
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            disabled={deletingId === msg.id}
                            title="Eliminar mensaje"
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
                    {searchQuery ? 'No se encontraron mensajes con el criterio de búsqueda.' : 'No hay mensajes registrados.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalle 'LEER' */}
      {selectedMessage && (
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
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#D4AF37]">
                      Detalle del Mensaje
                    </p>
                    {getStatusBadge(selectedMessage.status)}
                  </div>
                  <h2 className="text-xl font-bold font-montserrat text-white">
                    {selectedMessage.name || selectedMessage.full_name || 'Desconocido'}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-colors cursor-pointer"
                title="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-[#15151A] border border-space-border/60 rounded-xl p-3 flex items-center gap-3">
                <Mail className="w-4 h-4 text-gold-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-montserrat">Correo Electrónico</p>
                  <a 
                    href={`mailto:${selectedMessage.email}`}
                    className="text-xs text-gray-200 hover:text-gold-primary transition-colors truncate block"
                  >
                    {selectedMessage.email}
                  </a>
                </div>
              </div>

              <div className="bg-[#15151A] border border-space-border/60 rounded-xl p-3 flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-montserrat">Teléfono / WhatsApp</p>
                  {selectedMessage.phone ? (
                    <a 
                      href={`https://wa.me/${selectedMessage.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-200 hover:text-green-400 transition-colors truncate block"
                    >
                      {selectedMessage.phone}
                    </a>
                  ) : (
                    <p className="text-xs text-gray-500">No especificado</p>
                  )}
                </div>
              </div>

              <div className="bg-[#15151A] border border-space-border/60 rounded-xl p-3 flex items-center gap-3">
                <Tag className="w-4 h-4 text-gold-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-montserrat">Asunto</p>
                  <p className="text-xs text-gray-200 truncate">{selectedMessage.subject || 'Sin Asunto'}</p>
                </div>
              </div>

              <div className="bg-[#15151A] border border-space-border/60 rounded-xl p-3 flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gold-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-montserrat">Fecha de Recepción</p>
                  <p className="text-xs text-gray-200">{formatFullDateSpanish(selectedMessage.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Message Body */}
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-montserrat mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-primary"></span>
                Contenido del Mensaje
              </p>
              <div className="bg-[#15151A] border border-space-border/80 rounded-xl p-5 text-gray-200 text-sm whitespace-pre-wrap leading-relaxed max-h-[250px] overflow-y-auto shadow-inner">
                {selectedMessage.message}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-space-border/60">
              <button
                onClick={() => handleDeleteMessage(selectedMessage.id)}
                disabled={deletingId === selectedMessage.id}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar Mensaje
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Respuesta: ${encodeURIComponent(selectedMessage.subject || 'Contacto Fundación Principio y Fin')}`}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-space-dark bg-gold-primary hover:bg-gold-light transition-colors uppercase tracking-wider font-montserrat cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  Responder
                </a>
                <button
                  onClick={() => setSelectedMessage(null)}
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
