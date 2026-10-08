export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-montserrat font-semibold text-on-surface mb-8 tracking-wide">
        Resumen General
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-2xl bg-surface-container border border-outline-variant">
          <h3 className="text-xs font-montserrat uppercase tracking-widest text-on-surface-variant mb-2">
            Nuevas Inscripciones
          </h3>
          <p className="text-3xl font-inter font-light text-primary">12</p>
        </div>
        <div className="p-6 rounded-2xl bg-surface-container border border-outline-variant">
          <h3 className="text-xs font-montserrat uppercase tracking-widest text-on-surface-variant mb-2">
            Mensajes sin leer
          </h3>
          <p className="text-3xl font-inter font-light text-primary">5</p>
        </div>
        <div className="p-6 rounded-2xl bg-surface-container border border-outline-variant">
          <h3 className="text-xs font-montserrat uppercase tracking-widest text-on-surface-variant mb-2">
            Cursos Activos
          </h3>
          <p className="text-3xl font-inter font-light text-on-surface">8</p>
        </div>
      </div>

      <div className="p-8 rounded-2xl bg-surface-container border border-outline-variant">
        <h2 className="text-lg font-inter text-on-surface mb-4">Actividad Reciente</h2>
        <div className="text-sm text-on-surface-variant">
          El panel de control interactivo estará conectado con la base de datos de Supabase.
        </div>
      </div>
    </div>
  );
}
