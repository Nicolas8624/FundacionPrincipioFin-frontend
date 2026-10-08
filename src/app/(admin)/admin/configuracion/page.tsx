import { Save, Shield, Database, Bell } from 'lucide-react';

export default function AdminConfiguracionPage() {
  return (
    <div className="pb-10 max-w-4xl">
      {/* Header */}
      <div className="mb-10">
        <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#D4AF37] mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
          Ajustes
        </p>
        <h1 className="text-4xl font-semibold font-montserrat tracking-wide text-white mb-2">
          Configuración del Sistema
        </h1>
        <p className="text-[#99907c] text-sm">Gestiona la información de la fundación, seguridad y preferencias del portal.</p>
      </div>

      <div className="space-y-8">
        
        {/* Información General */}
        <section className="bg-[#17171a] border border-[#262629] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[#262629] bg-[#1b1b1f] flex items-center gap-3">
            <Database className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-semibold text-[#e4e1e7]">Información General</h2>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] mb-2">Nombre de la Fundación</label>
                <input type="text" defaultValue="Fundación Principio & Fin" className="w-full bg-[#1b1b1f] border border-[#262629] rounded-lg px-4 py-2.5 text-[#e4e1e7] text-sm focus:border-[#D4AF37] focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] mb-2">NIT</label>
                <input type="text" defaultValue="901.234.567-8" className="w-full bg-[#1b1b1f] border border-[#262629] rounded-lg px-4 py-2.5 text-[#e4e1e7] text-sm focus:border-[#D4AF37] focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-montserrat uppercase tracking-widest text-[#99907c] mb-2">Correo de Contacto Principal</label>
              <input type="email" defaultValue="contacto@principioyfin.org" className="w-full bg-[#1b1b1f] border border-[#262629] rounded-lg px-4 py-2.5 text-[#e4e1e7] text-sm focus:border-[#D4AF37] focus:outline-none" />
            </div>
            <div className="flex justify-end">
               <button className="bg-[#D4AF37] text-[#0A0A0E] px-6 py-2.5 rounded-lg font-semibold tracking-wider uppercase text-xs font-montserrat hover:bg-[#e1c469] transition-colors flex items-center gap-2">
                 <Save className="w-4 h-4" />
                 Guardar Cambios
               </button>
            </div>
          </div>
        </section>

        {/* Seguridad y Accesos */}
        <section className="bg-[#17171a] border border-[#262629] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[#262629] bg-[#1b1b1f] flex items-center gap-3">
            <Shield className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-semibold text-[#e4e1e7]">Seguridad y Accesos</h2>
          </div>
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between p-4 bg-[#1b1b1f] border border-[#262629] rounded-xl">
              <div>
                <p className="text-sm font-semibold text-[#e4e1e7] mb-1">Autenticación de Dos Factores (2FA)</p>
                <p className="text-xs text-[#99907c]">Añade una capa extra de seguridad para las cuentas de administradores.</p>
              </div>
              <button className="px-4 py-2 bg-[#262629] text-[#e4e1e7] rounded-lg text-xs font-semibold hover:bg-[#D4AF37] hover:text-[#0A0A0E] transition-colors">
                Configurar
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#1b1b1f] border border-[#262629] rounded-xl">
              <div>
                <p className="text-sm font-semibold text-[#e4e1e7] mb-1">Cambiar Contraseña Maestra</p>
                <p className="text-xs text-[#99907c]">Actualiza la contraseña de tu cuenta administrativa.</p>
              </div>
              <button className="px-4 py-2 border border-[#D4AF37] text-[#D4AF37] rounded-lg text-xs font-semibold hover:bg-[#D4AF37] hover:text-[#0A0A0E] transition-colors">
                Actualizar
              </button>
            </div>
          </div>
        </section>

        {/* Notificaciones */}
        <section className="bg-[#17171a] border border-[#262629] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[#262629] bg-[#1b1b1f] flex items-center gap-3">
            <Bell className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-semibold text-[#e4e1e7]">Notificaciones del Sistema</h2>
          </div>
          <div className="p-8 space-y-4">
            <ToggleOption title="Alertas de nuevas inscripciones" description="Recibir correo cuando un alumno confirme inscripción a un curso." />
            <ToggleOption title="Solicitudes de PH entrantes" description="Notificar al equipo de alianzas sobre nuevas propiedades." active />
            <ToggleOption title="Reporte semanal automático" description="Generar y enviar el resumen de consola cada lunes por la mañana." active />
          </div>
        </section>

      </div>
    </div>
  );
}

function ToggleOption({ title, description, active = false }: { title: string, description: string, active?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#262629] last:border-0 last:pb-0">
      <div>
        <p className="text-sm font-medium text-[#e4e1e7] mb-0.5">{title}</p>
        <p className="text-xs text-[#99907c]">{description}</p>
      </div>
      <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${active ? 'bg-[#D4AF37]' : 'bg-[#262629]'}`}>
        <div className={`w-4 h-4 rounded-full bg-[#0A0A0E] transition-transform ${active ? 'translate-x-6' : 'translate-x-0'}`}></div>
      </div>
    </div>
  )
}
