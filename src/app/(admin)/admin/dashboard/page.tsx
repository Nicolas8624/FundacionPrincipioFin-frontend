import { Users, FileText, Gift, MailOpen } from 'lucide-react'

export default function DashboardPage() {
  const stats = [
    { label: 'Solicitudes PH Pendientes', value: '12', icon: FileText },
    { label: 'Cursos e Inscripciones', value: '148', icon: Users },
    { label: 'Donaciones Recibidas', value: '24', icon: Gift },
    { label: 'Mensajes Nuevos', value: '5', icon: MailOpen },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Panel de Control</h1>
        <p className="text-space-gray">Resumen general de las actividades y solicitudes recientes.</p>
      </div>

      {/* Tarjetas de Estadísticas (Metric Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div 
              key={i} 
              className="bg-space-card/60 border border-space-border/80 backdrop-blur-xl p-6 rounded-2xl flex items-center justify-between hover:border-gold-primary/50 transition-colors group shadow-lg"
            >
              <div>
                <p className="text-space-gray text-sm font-medium mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-white group-hover:text-gold-light transition-colors">{stat.value}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-gold-primary/10 border border-gold-primary/20 flex items-center justify-center text-gold-primary">
                <Icon size={24} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Tabla / Resumen Reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabla principal (Placeholder Fase 3) */}
        <div className="lg:col-span-2 bg-space-card/60 backdrop-blur-md border border-space-border/80 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Actividad Reciente</h2>
            <button className="text-gold-primary text-sm hover:text-gold-light transition-colors font-medium">Ver todo</button>
          </div>
          
          <div className="text-center py-16 border-2 border-dashed border-space-border/50 rounded-xl bg-space-black/20">
            <p className="text-gold-light/70 font-medium mb-2">Zona de Registros Dinámicos</p>
            <p className="text-space-gray text-sm">
              La tabla de datos en tiempo real será conectada en la Fase 3.
            </p>
          </div>
        </div>

        {/* Notificaciones Rápidas */}
        <div className="bg-space-card/60 backdrop-blur-md border border-space-border/80 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6">Notificaciones Rápidas</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-space-border/20 border border-space-border/40 hover:bg-space-border/30 transition-colors">
              <div className="mt-1 w-2 h-2 rounded-full bg-gold-primary flex-shrink-0 shadow-[0_0_8px_rgba(212,175,55,0.8)]"></div>
              <div>
                <p className="text-sm text-white font-medium">Nueva solicitud PH</p>
                <p className="text-xs text-space-gray mt-1">Conjunto Residencial Los Pinos</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-space-border/20 border border-space-border/40 hover:bg-space-border/30 transition-colors">
              <div className="mt-1 w-2 h-2 rounded-full bg-gold-primary flex-shrink-0 shadow-[0_0_8px_rgba(212,175,55,0.8)]"></div>
              <div>
                <p className="text-sm text-white font-medium">Mensaje de contacto</p>
                <p className="text-xs text-space-gray mt-1">Juan Pérez ha enviado una duda sobre donaciones.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
