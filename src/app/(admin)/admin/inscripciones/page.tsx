import { Search, Filter, Download, UserCheck, Clock, XCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

function formatDateSpanish(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default async function AdminInscripcionesPage() {
  const supabase = await createClient();

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('*')
    .order('created_at', { ascending: false });

  const total = enrollments?.length || 0;

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#D4AF37] mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
            Control Estudiantil
          </p>
          <h1 className="text-4xl font-semibold font-montserrat tracking-wide text-white">
            Inscripciones Activas
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#e1c469] text-[#0A0A0E] px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors uppercase tracking-wider font-montserrat">
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="p-8 bg-space-card/60 backdrop-blur-md border border-space-border/80 text-white rounded-2xl">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-space-border/80 text-[10px] font-montserrat uppercase tracking-widest text-gray-400">
                <th className="pb-4 font-semibold">Estudiante</th>
                <th className="pb-4 font-semibold">Documento</th>
                <th className="pb-4 font-semibold">Curso Seleccionado</th>
                <th className="pb-4 font-semibold">Fecha</th>
                <th className="pb-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {enrollments && enrollments.length > 0 ? (
                enrollments.map((enrollment: any) => (
                  <TableRow 
                    key={enrollment.id}
                    name={enrollment.full_name || 'Sin nombre'}
                    email={enrollment.email || ''}
                    document={enrollment.document_id || ''}
                    course={enrollment.program_of_interest || 'Ninguno'}
                    date={formatDateSpanish(enrollment.created_at)}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-400">No hay inscripciones registradas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TableRow({ name, email, document, course, date }: any) {
  return (
    <tr className="border-b border-space-border/50 hover:bg-space-card/80 transition-colors group">
      <td className="py-4">
        <div>
          <p className="text-white font-medium mb-1">{name}</p>
          <p className="text-gray-400 text-xs">{email}</p>
        </div>
      </td>
      <td className="py-4 text-gray-300 text-xs">{document}</td>
      <td className="py-4">
        <span className="text-white bg-space-black px-3 py-1 rounded-md text-xs border border-space-border/50">{course}</span>
      </td>
      <td className="py-4 text-gray-400 text-xs">{date}</td>
      <td className="py-4 text-right">
        <button className="text-gold-primary hover:text-gold-light text-xs font-semibold tracking-wider transition-colors">
          Gestionar
        </button>
      </td>
    </tr>
  );
}
