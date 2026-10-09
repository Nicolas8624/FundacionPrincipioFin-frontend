'use client';

import { useState, useEffect } from 'react';
import { getGalleryItems, createGalleryItem, deleteGalleryItem, updateGalleryItem } from '@/actions/gallery';
import { Upload, Trash2, Image as ImageIcon, Video, Play, Pencil, X } from 'lucide-react';

export default function AdminGalleryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const loadItems = async () => {
    setLoading(true);
    const data = await getGalleryItems();
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    await createGalleryItem(formData);
    e.currentTarget.reset();
    await loadItems();
    setIsSubmitting(false);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    await updateGalleryItem(editingItem.id, formData);
    setEditingItem(null);
    await loadItems();
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este elemento?')) return;
    await deleteGalleryItem(id);
    await loadItems();
  };

  return (
    <div className="pb-10 relative">
      <div className="mb-10">
        <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#D4AF37] mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
          Gestión de Contenidos
        </p>
        <h1 className="text-4xl font-semibold font-montserrat tracking-wide text-white">
          Galería Multimedia
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulario */}
        <div className="lg:col-span-1">
          <div className="bg-space-card/60 backdrop-blur-md border border-space-border/80 rounded-2xl p-6 shadow-xl sticky top-8">
            <h2 className="text-xl font-semibold text-white mb-6 font-montserrat flex items-center gap-2">
              <Upload className="w-5 h-5 text-gold-primary" />
              Subir Nuevo Archivo
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-montserrat uppercase tracking-wider text-gray-400 mb-2">Título Descriptivo</label>
                <input 
                  type="text" 
                  name="title" 
                  required
                  className="w-full bg-space-black border border-space-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold-primary transition-colors text-sm"
                  placeholder="Ej. Taller Comunitario"
                />
              </div>

              <div>
                <label className="block text-xs font-montserrat uppercase tracking-wider text-gray-400 mb-2">Sección de Destino</label>
                <select 
                  name="section" 
                  required
                  className="w-full bg-space-black border border-space-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold-primary transition-colors text-sm appearance-none"
                >
                  <option value="quienes-somos">Quiénes Somos</option>
                  <option value="ph">Propiedad Horizontal</option>
                  <option value="programas">Programas Comunitarios</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-montserrat uppercase tracking-wider text-gray-400 mb-2">Tipo de Archivo</label>
                <div className="flex gap-4">
                  <label className="flex-1 cursor-pointer">
                    <input type="radio" name="type" value="image" className="peer sr-only" defaultChecked />
                    <div className="flex items-center justify-center gap-2 py-2.5 border border-space-border rounded-lg peer-checked:border-gold-primary peer-checked:text-gold-primary text-gray-400 transition-all text-sm font-medium">
                      <ImageIcon className="w-4 h-4" /> Imagen
                    </div>
                  </label>
                  <label className="flex-1 cursor-pointer">
                    <input type="radio" name="type" value="video" className="peer sr-only" />
                    <div className="flex items-center justify-center gap-2 py-2.5 border border-space-border rounded-lg peer-checked:border-gold-primary peer-checked:text-gold-primary text-gray-400 transition-all text-sm font-medium">
                      <Video className="w-4 h-4" /> Video
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-montserrat uppercase tracking-wider text-gray-400 mb-2">URL del Archivo</label>
                <input 
                  type="url" 
                  name="fileUrl" 
                  className="w-full bg-space-black border border-space-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold-primary transition-colors text-sm"
                  placeholder="https://..."
                />
                <p className="text-[10px] text-gray-500 mt-1">* En desarrollo, usamos URLs públicas directas.</p>
              </div>

              <button 
                disabled={isSubmitting}
                type="submit" 
                className="w-full bg-gold-primary hover:bg-gold-light text-space-dark font-bold py-3 rounded-lg transition-colors font-montserrat tracking-wider text-sm disabled:opacity-50 mt-4"
              >
                {isSubmitting ? 'PUBLICANDO...' : 'PUBLICAR ARCHIVO'}
              </button>
            </form>
          </div>
        </div>

        {/* Grilla */}
        <div className="lg:col-span-2">
          {loading ? (
             <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-gold-primary border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {items.length > 0 ? items.map(item => (
                <div key={item.id} className="bg-space-card/40 border border-space-border rounded-xl overflow-hidden group relative">
                  <div className="aspect-video relative bg-space-black">
                    {item.type === 'image' ? (
                      <img src={item.url} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <div className="w-full h-full relative">
                        <video src={item.url} className="w-full h-full object-cover opacity-80" muted />
                        <div className="absolute inset-0 flex items-center justify-center">
                           <Play className="w-10 h-10 text-white/50" />
                        </div>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button 
                        onClick={() => setEditingItem(item)}
                        className="w-8 h-8 bg-blue-500/80 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="w-8 h-8 bg-red-500/80 hover:bg-red-600 text-white rounded-lg flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold tracking-widest text-gold-primary uppercase border border-gold-primary/30">
                      {item.section}
                    </div>
                  </div>
                  <div className="p-4 border-t border-space-border/50">
                    <p className="text-white font-medium truncate text-sm">{item.title}</p>
                    <p className="text-gray-500 text-xs mt-1">
                       Añadido: {new Date(item.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-12 text-center text-gray-400 bg-space-card/30 rounded-xl border border-space-border border-dashed">
                  No hay archivos en la galería.
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#111114] border border-space-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              onClick={() => setEditingItem(null)}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-white mb-6 font-montserrat flex items-center gap-2">
              <Pencil className="w-5 h-5 text-gold-primary" />
              Editar Archivo
            </h2>
            <form onSubmit={handleUpdate} className="space-y-5">
              <div>
                <label className="block text-xs font-montserrat uppercase tracking-wider text-gray-400 mb-2">Título Descriptivo</label>
                <input 
                  type="text" 
                  name="title" 
                  required
                  defaultValue={editingItem.title}
                  className="w-full bg-space-black border border-space-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold-primary transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-montserrat uppercase tracking-wider text-gray-400 mb-2">Sección de Destino</label>
                <select 
                  name="section" 
                  required
                  defaultValue={editingItem.section}
                  className="w-full bg-space-black border border-space-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold-primary transition-colors text-sm appearance-none"
                >
                  <option value="quienes-somos">Quiénes Somos</option>
                  <option value="ph">Propiedad Horizontal</option>
                  <option value="programas">Programas Comunitarios</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-montserrat uppercase tracking-wider text-gray-400 mb-2">Tipo de Archivo</label>
                <div className="flex gap-4">
                  <label className="flex-1 cursor-pointer">
                    <input type="radio" name="type" value="image" className="peer sr-only" defaultChecked={editingItem.type === 'image'} />
                    <div className="flex items-center justify-center gap-2 py-2.5 border border-space-border rounded-lg peer-checked:border-gold-primary peer-checked:text-gold-primary text-gray-400 transition-all text-sm font-medium">
                      <ImageIcon className="w-4 h-4" /> Imagen
                    </div>
                  </label>
                  <label className="flex-1 cursor-pointer">
                    <input type="radio" name="type" value="video" className="peer sr-only" defaultChecked={editingItem.type === 'video'} />
                    <div className="flex items-center justify-center gap-2 py-2.5 border border-space-border rounded-lg peer-checked:border-gold-primary peer-checked:text-gold-primary text-gray-400 transition-all text-sm font-medium">
                      <Video className="w-4 h-4" /> Video
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-montserrat uppercase tracking-wider text-gray-400 mb-2">URL del Archivo</label>
                <input 
                  type="url" 
                  name="fileUrl" 
                  defaultValue={editingItem.url}
                  className="w-full bg-space-black border border-space-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold-primary transition-colors text-sm"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 bg-space-black border border-space-border hover:bg-[#1b1b1f] text-white font-semibold py-3 rounded-lg transition-colors font-montserrat tracking-wider text-sm"
                >
                  CANCELAR
                </button>
                <button 
                  disabled={isSubmitting}
                  type="submit" 
                  className="flex-1 bg-gold-primary hover:bg-gold-light text-space-dark font-bold py-3 rounded-lg transition-colors font-montserrat tracking-wider text-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'GUARDANDO...' : 'GUARDAR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
