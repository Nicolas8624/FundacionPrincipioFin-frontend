import { Search, Filter, MessageSquare, HeartHandshake, FileText } from 'lucide-react';

export default function AdminMensajesPage() {
  return (
    <div className="pb-10 h-[calc(100vh-80px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 flex-shrink-0">
        <div>
          <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#D4AF37] mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
            Atención al usuario
          </p>
          <h1 className="text-4xl font-semibold font-montserrat tracking-wide text-white">
            Bandeja de Mensajes
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#99907c]" />
            <input 
              type="text" 
              placeholder="Buscar remitente o asunto..." 
              className="bg-[#1b1b1f] border border-[#262629] pl-10 pr-4 py-2.5 rounded-lg text-[#e4e1e7] text-sm focus:outline-none focus:border-[#D4AF37] transition-colors w-72"
            />
          </div>
          <button className="flex items-center gap-2 bg-[#1b1b1f] border border-[#262629] hover:border-[#D4AF37] text-[#d0c5af] px-4 py-2.5 rounded-lg text-sm transition-colors">
            <Filter className="w-4 h-4" />
            No leídos
          </button>
        </div>
      </div>

      <div className="flex-1 bg-[#17171a] border border-[#262629] rounded-2xl overflow-hidden flex min-h-0">
        {/* Sidebar de mensajes */}
        <div className="w-[350px] border-r border-[#262629] flex flex-col overflow-y-auto custom-scrollbar">
          <MessageItem active name="Sandra Milena Roa" time="10:24 a.m." subject="Inscripción Taller Cerámica" preview="Hola, quisiera saber si todavía quedan cupos para el taller de los sábados..." />
          <MessageItem name="Distribuidora Andina SAS" time="Ayer" subject="Donación de materiales" preview="Tenemos 50 galones de pintura acrílica que nos gustaría donar a la fundación." />
          <MessageItem name="Carlos Julio Mendoza" time="11 Mar" subject="Consulta horarios" preview="Estimados, no me queda claro en la página si los cursos virtuales tienen horario fijo." />
          <MessageItem name="Junta Acción Comunal" time="08 Mar" subject="Alianza barrio Las Cruces" preview="Nos gustaría llevar los programas de música a nuestro salón comunal el próximo mes." read />
          <MessageItem name="María Fernanda" time="05 Mar" subject="Problemas con la plataforma" preview="No puedo subir mi documento de identidad en el formulario de inscripción." read />
        </div>

        {/* Vista del mensaje seleccionado */}
        <div className="flex-1 flex flex-col bg-[#111114]">
          {/* Header del mensaje */}
          <div className="p-8 border-b border-[#262629] flex justify-between items-start bg-[#17171a]">
            <div>
              <h2 className="text-xl font-semibold text-[#e4e1e7] mb-2">Inscripción Taller Cerámica</h2>
              <p className="text-sm text-[#99907c]">De: <span className="text-[#D4AF37]">sandra.roa@email.com</span></p>
              <p className="text-xs text-[#99907c] mt-1">Hoy, 10:24 a.m.</p>
            </div>
            <div className="flex gap-3">
               <button className="px-4 py-2 bg-[#1b1b1f] border border-[#262629] rounded-lg text-[#e4e1e7] hover:border-[#D4AF37] text-sm transition-colors">
                  Marcar como resuelto
               </button>
            </div>
          </div>

          {/* Cuerpo del mensaje */}
          <div className="p-8 flex-1 overflow-y-auto text-[#d0c5af] text-sm leading-relaxed space-y-4">
            <p>Hola equipo de la Fundación,</p>
            <p>Quisiera saber si todavía quedan cupos para el taller de Cerámica de los sábados en la sede principal. He intentado registrarme en la plataforma pero la página me indicó que los cupos presenciales estaban por agotarse.</p>
            <p>También me gustaría saber si los materiales están incluidos o si debo llevar mis propias herramientas (arcilla, estecas, etc).</p>
            <p>Agradezco mucho su atención y pronta respuesta.</p>
            <p>Atentamente,<br/>Sandra Roa<br/>Cel: 310 123 4567</p>
          </div>

          {/* Área de respuesta */}
          <div className="p-6 bg-[#17171a] border-t border-[#262629]">
            <textarea 
              className="w-full bg-[#1b1b1f] border border-[#262629] rounded-xl p-4 text-[#e4e1e7] text-sm focus:outline-none focus:border-[#D4AF37] transition-colors resize-none mb-4" 
              rows={4} 
              placeholder="Escribe tu respuesta aquí..."
            ></textarea>
            <div className="flex justify-between items-center">
              <button className="text-[#99907c] hover:text-[#d0c5af] transition-colors p-2">
                <FileText className="w-5 h-5" />
              </button>
              <button className="bg-[#D4AF37] text-[#0A0A0E] px-6 py-2 rounded-lg font-semibold tracking-wider uppercase text-xs hover:bg-[#e1c469] transition-colors flex items-center gap-2">
                Enviar Respuesta
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageItem({ active, read, name, time, subject, preview }: any) {
  return (
    <div className={`p-5 border-b border-[#262629] cursor-pointer transition-colors ${active ? 'bg-[#D4AF37]/10 border-l-2 border-l-[#D4AF37]' : 'hover:bg-[#1b1b1f]'}`}>
      <div className="flex justify-between items-start mb-1">
        <p className={`text-sm truncate pr-2 ${read ? 'text-[#99907c]' : 'text-[#e4e1e7] font-semibold'}`}>{name}</p>
        <span className={`text-[10px] whitespace-nowrap ${read ? 'text-[#99907c]' : 'text-[#D4AF37]'}`}>{time}</span>
      </div>
      <p className={`text-xs truncate mb-1 ${read ? 'text-[#99907c]' : 'text-[#d0c5af] font-medium'}`}>{subject}</p>
      <p className="text-[#99907c] text-xs truncate opacity-70">{preview}</p>
    </div>
  )
}
