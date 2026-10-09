import { createServerClient } from '@/services/supabase/server';
import { Search, Plus, Clock, Users, GraduationCap, ChevronDown, ChevronLeft, ChevronRight, Palette, Briefcase, Sparkles, BookOpen, MonitorPlay } from 'lucide-react';
import Link from 'next/link';
import { CourseControls } from '@/components/admin/CourseControls';
import { CourseActions } from '@/components/admin/CourseActions';

// Función para elegir un ícono según la categoría o el título
function getCourseIcon(categoryName: string) {
  const lower = (categoryName || '').toLowerCase();
  if (lower.includes('arte') || lower.includes('pintura')) return <Palette className="w-5 h-5" />;
  if (lower.includes('belleza') || lower.includes('estética')) return <Sparkles className="w-5 h-5" />;
  if (lower.includes('oficios') || lower.includes('emprendimiento')) return <Briefcase className="w-5 h-5" />;
  return <BookOpen className="w-5 h-5" />;
}
export default async function AdminCursosPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const supabase = await createServerClient();
  
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q : '';
  const categoryFilter = typeof params.category === 'string' ? params.category : '';
  const page = typeof params.page === 'string' ? parseInt(params.page, 10) : 1;
  const limit = 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Obtener categorías para el filtro
  const { data: categories } = await supabase.from('course_categories').select('*').order('name');

  // Obtener cursos y categorías
  let query = supabase
    .from('courses')
    .select(`
      *,
      category:course_categories(name, accent_color),
      enrollments:course_enrollments(id, status)
    `, { count: 'exact' })
    .order('created_at', { ascending: false });

  if (q) {
    query = query.ilike('title', `%${q}%`);
  }
  if (categoryFilter) {
    query = query.eq('category_id', categoryFilter);
  }

  // 1. Obtener el conteo exacto por separado (a prueba de fallos con paginación)
  let countQuery = supabase.from('courses').select('*', { count: 'exact', head: true });
  if (q) countQuery.ilike('title', `%${q}%`);
  if (categoryFilter) countQuery.eq('category_id', categoryFilter);
  const { count: exactCount } = await countQuery;
  const totalCourses = exactCount || 0;
  const totalPages = Math.ceil(totalCourses / limit);

  // 2. Ejecutar query sin rango para estadísticas generales
  const { data: statsData } = await supabase.from('courses').select(`status, capacity, enrollments:course_enrollments(status)`);
  
  // 3. Aplicar paginación a la tabla principal
  query = query.range(from, to);
  const { data: coursesData } = await query;
  const courses = coursesData || [];

  // Calcular métricas (basado en todos los registros)
  const activos = (statsData || []).filter(c => c.status === 'publicado').length;
  
  let totalCapacidad = 0;
  let totalOcupados = 0;
  
  (statsData || []).forEach(c => {
    if (c.status === 'publicado' && c.capacity) {
      totalCapacidad += c.capacity;
      const ocupados = (c.enrollments as any[])?.filter(e => ['confirmada', 'completada'].includes(e.status)).length || 0;
      totalOcupados += ocupados;
    }
  });

  const ocupacionTotal = totalCapacidad > 0 ? ((totalOcupados / totalCapacidad) * 100).toFixed(1) : '0';

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-10">
      
      {/* Encabezado y Métricas */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#D4AF37] mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
            ADMINISTRACIÓN DE PROGRAMAS FORMATIVOS • PERIODO VIGENTE {new Date().getFullYear()}
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold font-montserrat tracking-wide text-white">
            Gestión de Cursos y Talleres
          </h1>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-[#1b1b1f]/80 backdrop-blur-md border border-[#262629] rounded-xl p-4 flex items-center gap-4 min-w-[200px]">
            <div className="w-10 h-10 rounded-full bg-[#262629] flex items-center justify-center text-[#d0c5af]">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c]">Programas Activos</p>
              <p className="text-2xl font-semibold text-white">{activos}</p>
            </div>
          </div>
          
          <div className="bg-[#1b1b1f]/80 backdrop-blur-md border border-[#262629] rounded-xl p-4 flex items-center gap-4 min-w-[200px]">
            <div className="w-10 h-10 rounded-full bg-[#262629] flex items-center justify-center text-[#D4AF37]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-montserrat uppercase tracking-widest text-[#99907c]">Ocupación Total</p>
              <p className="text-2xl font-semibold text-[#D4AF37]">{ocupacionTotal}%</p>
            </div>
          </div>
        </div>
      </div>

      <CourseControls categories={categories || []} currentQuery={q} currentCategory={categoryFilter} />

      {/* Tabla de Cursos */}
      <div className="bg-[#0A0A0E]/60 backdrop-blur-xl border border-[#262629] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#1b1b1f]/50 border-b border-[#262629] text-[10px] font-montserrat uppercase tracking-widest text-[#99907c]">
                <th className="px-6 py-5 font-semibold">Curso</th>
                <th className="px-6 py-5 font-semibold">Categoría</th>
                <th className="px-6 py-5 font-semibold">Horario</th>
                <th className="px-6 py-5 font-semibold">Cupos</th>
                <th className="px-6 py-5 font-semibold">Estado</th>
                <th className="px-6 py-5 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262629]">
              {courses.map(course => {
                const ocupados = (course.enrollments as any[])?.filter(e => ['confirmada', 'completada'].includes(e.status)).length || 0;
                const capacidad = course.capacity || 0;
                const progress = capacidad > 0 ? (ocupados / capacidad) * 100 : 0;
                const isFull = capacidad > 0 && ocupados >= capacidad;
                
                return (
                  <tr key={course.id} className="hover:bg-[#1b1b1f]/40 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#262629] flex items-center justify-center text-[#d0c5af] group-hover:text-[#D4AF37] transition-colors">
                          {getCourseIcon((course.category as any)?.name)}
                        </div>
                        <div>
                          <p className="text-[#e4e1e7] font-semibold text-base mb-1">{course.title}</p>
                          <p className="text-[#99907c] text-xs max-w-[250px] truncate">{course.short_description || 'Sin descripción breve'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col items-start gap-2">
                        {(course.category as any)?.name ? (
                          <span className="px-3 py-1 bg-[#1b1b1f] border border-[#262629] rounded-full text-[10px] font-montserrat uppercase tracking-wider text-[#d0c5af] inline-block">
                            {(course.category as any).name}
                          </span>
                        ) : (
                          <span className="text-xs text-[#42454a]">Sin categoría</span>
                        )}
                        <span className={`text-[9px] font-montserrat uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1
                          ${course.modality === 'virtual' ? 'bg-[#2E7D32]/20 text-[#4CAF50]' : 
                            course.modality === 'hibrido' ? 'bg-[#1976D2]/20 text-[#64B5F6]' : 
                            'bg-[#D4AF37]/10 text-[#D4AF37]'}`}
                        >
                          {course.modality === 'virtual' ? <MonitorPlay className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                          {course.modality}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-start gap-2 text-[#d0c5af] text-sm">
                        <Clock className="w-4 h-4 mt-0.5 text-[#99907c]" />
                        <span className="max-w-[150px]">{course.schedule_text || 'Horario por definir'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-between text-xs font-semibold mb-2">
                        <span className="text-[#e4e1e7]">{ocupados} / {capacidad || '∞'}</span>
                        <span className={isFull ? "text-[#ffb4ab]" : "text-[#D4AF37]"}>
                          {isFull ? 'LLENO' : `${capacidad - ocupados} disp.`}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[#262629] rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isFull ? 'bg-[#93000a]' : 'bg-[#D4AF37]'}`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 bg-[#0A0A0E] px-3 py-1.5 rounded-full w-max border border-[#262629]">
                        <span className={`w-2 h-2 rounded-full ${course.status === 'publicado' ? 'bg-[#D4AF37]' : 'bg-[#99907c]'}`}></span>
                        <span className="text-[10px] font-montserrat uppercase tracking-widest text-[#e4e1e7]">
                          {course.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <CourseActions course={course} categories={categories || []} />
                    </td>
                  </tr>
                );
              })}
              
              {courses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-[#99907c] text-sm">
                    No hay cursos registrados en el sistema.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        {totalCourses > 0 && (
          <div className="bg-[#1b1b1f]/50 border-t border-[#262629] px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-[#99907c]">
              Mostrando <span className="text-[#e4e1e7] font-medium">{from + 1}-{Math.min(to + 1, totalCourses)}</span> de <span className="text-[#e4e1e7] font-medium">{totalCourses}</span> programas
            </p>
            <div className="flex gap-2">
              {page > 1 ? (
                <Link 
                  href={`?page=${page - 1}${q ? `&q=${q}` : ''}${categoryFilter ? `&category=${categoryFilter}` : ''}`}
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
                  href={`?page=${page + 1}${q ? `&q=${q}` : ''}${categoryFilter ? `&category=${categoryFilter}` : ''}`}
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
    </div>
  );
}
