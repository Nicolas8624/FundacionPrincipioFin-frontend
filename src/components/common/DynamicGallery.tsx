'use client';

import { useEffect, useState } from 'react';
import { getGalleryItems } from '@/actions/gallery';
import { Play, X } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  section: string;
  type: string;
  url: string;
  created_at: string;
}

export function DynamicGallery({ section }: { section: string }) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    async function load() {
      const data = await getGalleryItems(section);
      setItems(data || []);
      setLoading(false);
    }
    load();
  }, [section]);

  if (loading) {
    return (
      <div className="w-full h-40 flex flex-col items-center justify-center gap-3">
        <div className="w-6 h-6 border-2 border-gold-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm font-montserrat uppercase tracking-wider">Cargando Galería...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="group relative bg-space-card/50 border border-space-border/80 backdrop-blur-md rounded-2xl overflow-hidden hover:border-gold-primary/60 transition-all shadow-2xl cursor-pointer aspect-video"
            onClick={() => setSelectedItem(item)}
          >
            {item.type === 'image' ? (
              <img 
                src={item.url} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full relative">
                <video 
                  src={item.url} 
                  className="w-full h-full object-cover"
                  muted 
                  playsInline
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-gold-primary/90 flex items-center justify-center text-space-dark pl-1">
                    <Play className="w-6 h-6" />
                  </div>
                </div>
              </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <p className="text-white text-sm font-medium truncate">{item.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-fade-in">
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
            onClick={() => setSelectedItem(null)}
          >
            <X className="w-8 h-8" />
          </button>
          
          <div className="max-w-5xl w-full max-h-[80vh] flex flex-col items-center">
            {selectedItem.type === 'image' ? (
              <img 
                src={selectedItem.url} 
                alt={selectedItem.title} 
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl border border-space-border/50"
              />
            ) : (
              <video 
                src={selectedItem.url} 
                controls
                autoPlay
                className="max-w-full max-h-[75vh] rounded-lg shadow-2xl border border-space-border/50 outline-none"
              />
            )}
            <p className="text-gold-primary mt-6 text-lg font-montserrat tracking-wide">{selectedItem.title}</p>
          </div>
        </div>
      )}
    </div>
  );
}
