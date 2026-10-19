'use client';

import { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Plus, 
  Search, 
  Calendar, 
  Pin, 
  Building2, 
  GraduationCap, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  Sparkles,
  Users,
  Eye,
  Bell,
  RefreshCw
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'academico' | 'ph' | 'evento';
  target_audience: string;
  is_pinned: boolean;
  status: 'publicado' | 'borrador';
  created_at: string;
  updated_at: string;
}

export default function AdminComunidadPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');
  const [isCreating, setIsCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'general' | 'academico' | 'ph' | 'evento'>('general');
  const [newTarget, setNewTarget] = useState('Comunidad en General');
  const [newPinned, setNewPinned] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error al cargar anuncios de Supabase:', error);
        setNotice({ 
          type: 'error', 
          text: 'No se pudieron sincronizar los anuncios con Supabase. Verifica que la tabla "announcements" esté creada.' 
        });
      } else {
        setAnnouncements(data || []);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setActionLoading(true);
    setNotice(null);

    try {
      const { data, error } = await supabase
        .from('announcements')
        .insert([{
          title: newTitle.trim(),
          content: newContent.trim(),
          category: newCategory,
          target_audience: newTarget.trim() || 'Comunidad en General',
          is_pinned: newPinned,
          status: 'publicado',
        }])
        .select()
        .single();

      if (error) {
        console.error(error);
        setNotice({ type: 'error', text: `Error al publicar anuncio: ${error.message}` });
      } else if (data) {
        setAnnouncements([data, ...announcements]);
        setNewTitle('');
        setNewContent('');
        setNewCategory('general');
        setNewTarget('Comunidad en General');
        setNewPinned(false);
        setIsCreating(false);
        setNotice({ type: 'success', text: '¡Anuncio publicado exitosamente en el tablero comunitario!' });
        setTimeout(() => setNotice(null), 3500);
      }
    } catch (err: any) {
      setNotice({ type: 'error', text: err?.message || 'Error inesperado.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este aviso del tablero?')) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) {
        alert(`Error al eliminar: ${error.message}`);
      } else {
        setAnnouncements(announcements.filter(a => a.id !== id));
        setNotice({ type: 'success', text: 'Anuncio eliminado correctamente.' });
        setTimeout(() => setNotice(null), 3000);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const togglePin = async (item: AnnouncementItem) => {
    const nextPinned = !item.is_pinned;
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ is_pinned: nextPinned, updated_at: new Date().toISOString() })
        .eq('id', item.id);

      if (error) {
        alert(`Error al cambiar fijado: ${error.message}`);
      } else {
        setAnnouncements(prev => prev.map(a => a.id === item.id ? { ...a, is_pinned: nextPinned } : a));
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const filtered = announcements.filter(a => {
    const matchesSearch = (a.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (a.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'todos' || a.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'ph':
        return { label: 'Propiedad Horizontal', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'academico':
        return { label: 'Académico / Cursos', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
      case 'evento':
        return { label: 'Evento / Feria', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
      default:
        return { label: 'Institucional', color: 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30' };
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-12">
      
      {/* Encabezado */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#D4AF37] mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
            COMUNICACIÓN & DIFUSIÓN • TABLERO DE ANUNCIOS Y COMUNIDAD
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold font-montserrat tracking-wide text-white">
            Tablero de Anuncios y Comunidad
          </h1>
          <p className="text-[#99907c] text-sm mt-3 max-w-2xl leading-relaxed">
            Publica circulares, novedades y avisos oficiales conectados directamente a la base de datos de la Fundación. Estos comunicados se reflejan en tiempo real en el portal de los estudiantes.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-auto">
          <button
            onClick={fetchAnnouncements}
            disabled={loading}
            className="p-3 rounded-xl bg-[#1b1b1f] border border-[#262629] text-[#99907c] hover:text-[#e4e1e7] hover:border-[#D4AF37]/40 transition-colors"
            title="Refrescar anuncios"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#D4AF37]' : ''}`} />
          </button>
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#F5D77A] text-[#0A0A0E] text-xs font-montserrat uppercase font-bold tracking-wider transition-all shadow-lg shadow-[#D4AF37]/20"
          >
            <Plus className="w-4 h-4" />
            <span>Publicar Nuevo Anuncio</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-fade-in ${
          notice.type === 'success' 
            ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]' 
            : 'bg-[#93000a]/15 border border-[#93000a]/30 text-[#ffb4ab]'
        }`}>
          {notice.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <p className="text-xs sm:text-sm font-medium">{notice.text}</p>
        </div>
      )}

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0A0A0E]/60 backdrop-blur-xl border border-[#262629] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c]">Total Publicaciones</p>
            <p className="text-3xl font-bold text-white mt-1">{announcements.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#1b1b1f] border border-[#262629] flex items-center justify-center text-[#D4AF37]">
            <Megaphone className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0A0A0E]/60 backdrop-blur-xl border border-[#262629] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c]">Avisos Fijados</p>
            <p className="text-3xl font-bold text-[#D4AF37] mt-1">{announcements.filter(a => a.is_pinned).length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#1b1b1f] border border-[#262629] flex items-center justify-center text-[#D4AF37]">
            <Pin className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0A0A0E]/60 backdrop-blur-xl border border-[#262629] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c]">Destinados a PH</p>
            <p className="text-3xl font-bold text-emerald-400 mt-1">{announcements.filter(a => a.category === 'ph').length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#1b1b1f] border border-[#262629] flex items-center justify-center text-emerald-400">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0A0A0E]/60 backdrop-blur-xl border border-[#262629] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c]">Público Objetivo</p>
            <p className="text-2xl font-bold text-white mt-1 truncate max-w-[160px]">Comunidad Activa</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#1b1b1f] border border-[#262629] flex items-center justify-center text-[#d0c5af]">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Modal / Formulario de Creación */}
      {isCreating && (
        <div className="bg-[#17171a] border border-[#D4AF37]/40 rounded-2xl p-6 shadow-2xl animate-fadeIn space-y-4">
          <div className="flex items-center justify-between border-b border-[#262629] pb-3">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="font-montserrat font-bold text-white text-base">Crear Aviso en el Tablero Comunitario</h3>
            </div>
            <button 
              onClick={() => setIsCreating(false)}
              className="text-[#99907c] hover:text-white text-xs"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-montserrat uppercase tracking-wider text-[#99907c] mb-1.5">
                Título del Aviso <span className="text-[#D4AF37]">*</span>
              </label>
              <input 
                type="text" 
                value={newTitle} 
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Ej. Convocatoria Taller de Óleo Barrio Restrepo"
                required
                className="w-full bg-[#141417] border border-[#262629] rounded-xl px-4 py-3 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-montserrat uppercase tracking-wider text-[#99907c] mb-1.5">Categoría</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as any)}
                  className="w-full bg-[#141417] border border-[#262629] rounded-xl px-4 py-3 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="general">Institucional / General</option>
                  <option value="ph">Propiedad Horizontal & Salones</option>
                  <option value="academico">Académico & Cursos</option>
                  <option value="evento">Evento Comunitario / Feria</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-montserrat uppercase tracking-wider text-[#99907c] mb-1.5">Audiencia Destino</label>
                <input 
                  type="text"
                  value={newTarget}
                  onChange={e => setNewTarget(e.target.value)}
                  placeholder="Ej. Estudiantes, Administradores, Todo público"
                  className="w-full bg-[#141417] border border-[#262629] rounded-xl px-4 py-3 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-montserrat uppercase tracking-wider text-[#99907c] mb-1.5">
                Contenido / Comunicado <span className="text-[#D4AF37]">*</span>
              </label>
              <textarea 
                rows={4}
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                placeholder="Escribe el texto detallado del anuncio..."
                required
                className="w-full bg-[#141417] border border-[#262629] rounded-xl px-4 py-3 text-white text-sm focus:border-[#D4AF37] focus:outline-none custom-scrollbar resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#d0c5af]">
                <input 
                  type="checkbox"
                  checked={newPinned}
                  onChange={e => setNewPinned(e.target.checked)}
                  className="rounded border-[#262629] bg-[#141417] text-[#D4AF37] focus:ring-0"
                />
                <span>Fijar como aviso prioritario en el tablero del usuario</span>
              </label>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#262629] hover:bg-[#333338] text-white text-xs font-montserrat uppercase font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#F5D77A] text-[#0A0A0E] text-xs font-montserrat uppercase font-bold transition-all shadow-md shadow-[#D4AF37]/20 disabled:opacity-50"
                >
                  {actionLoading ? 'Guardando...' : 'Guardar y Publicar'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#17171a] p-4 rounded-2xl border border-[#262629]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#99907c] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por título o contenido del aviso..."
            className="w-full bg-[#141417] border border-[#262629] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#99907c] focus:border-[#D4AF37] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['todos', 'ph', 'academico', 'evento', 'general'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-2 rounded-lg text-xs font-montserrat uppercase font-semibold transition-colors shrink-0 ${
                categoryFilter === cat 
                  ? 'bg-[#D4AF37] text-[#0A0A0E]' 
                  : 'bg-[#1b1b1f] text-[#99907c] hover:text-white border border-[#262629]'
              }`}
            >
              {cat === 'todos' ? 'Todos' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Anuncios */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 bg-[#17171a] rounded-2xl border border-[#262629]">
            <RefreshCw className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto mb-2" />
            <p className="text-[#99907c] text-xs">Cargando anuncios del sistema...</p>
          </div>
        ) : (
          filtered.map(item => {
            const badge = getCategoryBadge(item.category);
            const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString('es-CO') : 'Reciente';

            return (
              <div 
                key={item.id}
                className={`bg-[#17171a] border rounded-2xl p-5 sm:p-6 transition-all hover:border-[#D4AF37]/30 ${
                  item.is_pinned ? 'border-[#D4AF37]/40 shadow-lg shadow-[#D4AF37]/5' : 'border-[#262629]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.is_pinned && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-montserrat uppercase font-bold tracking-wider">
                          <Pin className="w-3 h-3" />
                          Fijado
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-montserrat uppercase font-bold tracking-wider ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="text-[11px] text-[#99907c] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {dateStr}
                      </span>
                      <span className="text-[11px] text-[#99907c]">
                        • Dirigido a: <strong className="text-[#d0c5af]">{item.target_audience}</strong>
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white font-montserrat">
                      {item.title}
                    </h3>

                    <p className="text-sm text-[#d0c5af] leading-relaxed whitespace-pre-wrap">
                      {item.content}
                    </p>
                  </div>

                  {/* Acciones de gestión */}
                  <div className="flex sm:flex-col items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#262629]">
                    <button
                      onClick={() => togglePin(item)}
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
                        item.is_pinned 
                          ? 'bg-[#D4AF37]/15 border-[#D4AF37]/50 text-[#D4AF37]' 
                          : 'bg-[#1b1b1f] border-[#262629] text-[#99907c] hover:text-white'
                      }`}
                      title={item.is_pinned ? 'Desfijar aviso' : 'Fijar aviso prioritario'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="w-8 h-8 rounded-lg bg-[#1b1b1f] border border-[#262629] text-[#93000a] hover:bg-[#93000a] hover:text-[#ffb4ab] flex items-center justify-center transition-colors"
                      title="Eliminar aviso"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 bg-[#17171a] rounded-2xl border border-[#262629]">
            <Megaphone className="w-10 h-10 text-[#99907c] mx-auto mb-3 opacity-50" />
            <p className="text-white font-medium text-sm">No se encontraron anuncios</p>
            <p className="text-xs text-[#99907c] mt-1">Prueba cambiando los filtros o publica un nuevo comunicado comunitario.</p>
          </div>
        )}
      </div>

    </div>
  );
}
