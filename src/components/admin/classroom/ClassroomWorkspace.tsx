'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Users, Settings2, Sparkles, Calendar, Layers, ClipboardList } from 'lucide-react';
import { updateCourseSettingsAction } from '@/app/(admin)/admin/cursos/[id]/actions';
import { CourseEvaluationView } from './CourseEvaluationView';
import { CourseActivitiesView } from './CourseActivitiesView';
import { CourseStudentsView } from './CourseStudentsView';
import { FormModal } from './FormModal';
import type {
  ClassroomCourse,
  ClassroomModule,
  ClassroomAssignment,
  ClassroomEnrollment,
  ClassroomSubmission
} from './types';
import { formatModality } from './types';

interface ClassroomWorkspaceProps {
  course: ClassroomCourse;
  initialTab?: 'aula' | 'actividades' | 'estudiantes';
  modules?: ClassroomModule[];
  assignments?: ClassroomAssignment[];
  enrollments?: ClassroomEnrollment[];
  submissions?: ClassroomSubmission[];
}

export function ClassroomWorkspace({
  course,
  initialTab = 'aula',
  modules = [],
  assignments = [],
  enrollments = [],
  submissions = []
}: ClassroomWorkspaceProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'aula' | 'actividades' | 'estudiantes'>(initialTab);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const formattedModality = formatModality(course.modality);
  const activeEnrolledCount = enrollments.filter(
    (e) => e.status === 'confirmada' || e.status === 'completada'
  ).length;

  const handleUpdateCourseSettings = async (values: Record<string, string>) => {
    const capacityVal = values.capacity ? parseInt(values.capacity, 10) : null;

    const res = await updateCourseSettingsAction({
      courseId: course.id,
      cohort: values.cohort,
      instructorName: values.instructor_name,
      scheduleText: values.schedule_text,
      capacity: capacityVal
    });

    if (!res.success) {
      return `Error al actualizar: ${res.error}`;
    }

    showToast('Ajustes del curso actualizados correctamente.');
    router.refresh();
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-14">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1b1b1f] border border-[#D4AF37] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb Context & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262629] pb-4">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-montserrat tracking-wider">
          <Link
            href="/admin/cursos"
            className="inline-flex items-center gap-1.5 text-[#D4AF37] hover:text-[#f2ca50] transition-colors font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Gestión de Cursos</span>
          </Link>
          <span className="text-[#99907c]">/</span>
          <span className="text-white uppercase truncate max-w-xs">{course.title}</span>
          <span className="text-[#99907c]">/</span>
          <span className="text-[#D4AF37] font-bold uppercase tracking-widest bg-[#1b1b1f] border border-[#262629] px-2.5 py-0.5 rounded-md">
            {activeTab === 'aula'
              ? 'Aula Virtual & Evidencias'
              : activeTab === 'actividades'
              ? 'Actividades y Plan Pedagógico'
              : 'Estudiantes y Postulaciones'}
          </span>
        </div>

        {/* Global Workspace Tab Switcher & Course Config CTA */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <div className="inline-flex items-center p-1 rounded-xl bg-[#131317] border border-[#262629] shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('aula')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-montserrat uppercase tracking-wider font-semibold transition-all ${
                activeTab === 'aula'
                  ? 'bg-[#D4AF37] text-[#0A0A0E] shadow-md shadow-[#D4AF37]/20'
                  : 'text-[#99907c] hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Aula Virtual ({submissions.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('actividades')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-montserrat uppercase tracking-wider font-semibold transition-all ${
                activeTab === 'actividades'
                  ? 'bg-[#D4AF37] text-[#0A0A0E] shadow-md shadow-[#D4AF37]/20'
                  : 'text-[#99907c] hover:text-white'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Actividades ({assignments.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('estudiantes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-montserrat uppercase tracking-wider font-semibold transition-all ${
                activeTab === 'estudiantes'
                  ? 'bg-[#D4AF37] text-[#0A0A0E] shadow-md shadow-[#D4AF37]/20'
                  : 'text-[#99907c] hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Estudiantes ({activeEnrolledCount})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2 rounded-xl bg-[#131317] border border-[#262629] hover:border-[#D4AF37]/40 text-[#99907c] hover:text-white transition-colors"
            title="Ajustar parámetros del curso (cohorte, docente, cupos)"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Views Container */}
      {activeTab === 'aula' ? (
        <CourseEvaluationView
          course={course}
          modules={modules}
          assignments={assignments}
          submissions={submissions}
          totalEnrolledCount={activeEnrolledCount}
          onSwitchToStudentsTab={() => setActiveTab('estudiantes')}
          onSwitchToActivitiesTab={() => setActiveTab('actividades')}
        />
      ) : activeTab === 'actividades' ? (
        <CourseActivitiesView
          course={course}
          modules={modules}
          assignments={assignments}
          submissions={submissions}
          onNavigateToSubmissions={() => setActiveTab('aula')}
        />
      ) : (
        <CourseStudentsView
          course={course}
          enrollments={enrollments}
          submissions={submissions}
          assignments={assignments}
        />
      )}

      {/* Course Parameters Modal */}
      <FormModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        title="Parámetros del Curso"
        description={
          <span>
            Configura los datos del curso <strong className="text-white">{course.title}</strong> para reflejarlos en las actas, diplomas y seguimiento.
          </span>
        }
        icon={<Settings2 className="w-5 h-5 text-[#D4AF37]" />}
        confirmLabel="Guardar Cambios"
        fields={[
          {
            name: 'cohort',
            label: 'Cohorte / Periodo',
            defaultValue: course.cohort || '',
            placeholder: 'Ej: 2026-I, 2026-II, Intensivo Verano',
            hint: 'Aparece en certificados y encabezados.'
          },
          {
            name: 'instructor_name',
            label: 'Docente Formador(a)',
            defaultValue: course.instructor_name || '',
            placeholder: 'Ej: Maestra Lucía Forero',
            hint: 'Firma oficial en actas y diplomas.'
          },
          {
            name: 'schedule_text',
            label: 'Horario del Taller',
            defaultValue: course.schedule_text || '',
            placeholder: 'Ej: Sábados 9:00 a.m. - 1:00 p.m.'
          },
          {
            name: 'capacity',
            label: 'Cupos Totales (Capacidad)',
            type: 'number',
            defaultValue: course.capacity ?? '',
            placeholder: 'Ej: 35 (dejar vacío si es ilimitado)',
            min: 1
          }
        ]}
        onConfirm={handleUpdateCourseSettings}
      />
    </div>
  );
}
