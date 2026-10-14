import Link from 'next/link';
import { Award, ArrowLeft, Download } from 'lucide-react';
import { createServerClient } from '@/services/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CertificadosPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Traer certificados reales del usuario
  const { data: certificatesData } = await supabase
    .from('course_enrollments')
    .select(`
      id,
      certificate_code,
      certificate_issued_at,
      status,
      average_grade,
      course:courses (
        title,
        modality,
        cohort
      )
    `)
    .or(`user_id.eq.${user.id},email.ilike.${user.email || ''}`)
    .or('status.eq.completada,status.eq.aprobada,has_certificate.eq.true');

  const certificates = certificatesData || [];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-3">
        <Link 
          href="/portal" 
          className="p-2 rounded-xl bg-[#1b1b1f] hover:bg-[#262629] border border-[#262629] text-[#99907c] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <p className="text-[10px] font-montserrat uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
            Reconocimientos
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold font-montserrat tracking-wide text-white">
            Mis Certificados
          </h1>
        </div>
      </div>

      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert: any) => {
            const courseTitle = cert.course?.title || 'Taller Acreditado';
            const issueDate = cert.certificate_issued_at 
              ? new Date(cert.certificate_issued_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
              : 'Ciclo culminado';
            const code = cert.certificate_code || 'CERT-OFICIAL';

            return (
              <div key={cert.id} className="bg-[#17171a] border border-[#262629] rounded-2xl p-6 shadow-xl flex flex-col justify-between gap-4 hover:border-[#D4AF37]/30 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1b1b1f] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white font-montserrat">
                      {courseTitle}
                    </h3>
                    <p className="text-xs text-[#99907c] mt-0.5">
                      {issueDate} • Código: {code}
                    </p>
                    {cert.average_grade && (
                      <p className="text-xs text-[#D4AF37] mt-1 font-semibold">
                        Calificación: {Number(cert.average_grade).toFixed(1)} / 5.0
                      </p>
                    )}
                  </div>
                </div>

                <a
                  href={`/api/certificates/${cert.id}`}
                  className="self-end inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#F5D77A] text-[#0A0A0E] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider font-montserrat transition-all"
                >
                  <Download className="w-4 h-4" />
                  Descargar PDF
                </a>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#17171a] border border-[#262629] rounded-2xl p-10 sm:p-14 text-center max-w-xl mx-auto shadow-2xl space-y-3">
          <Award className="w-12 h-12 text-[#99907c] mx-auto" />
          <h3 className="text-lg font-bold text-white font-montserrat">
            Sin certificados emitidos aún
          </h3>
          <p className="text-xs text-[#99907c] leading-relaxed max-w-md mx-auto">
            Cuando culmines tus talleres matriculados y el formador valide la aprobación académica, tus certificados oficiales estarán disponibles para descarga en esta sección.
          </p>
        </div>
      )}
    </div>
  );
}
