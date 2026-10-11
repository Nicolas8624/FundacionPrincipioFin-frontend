'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Users } from 'lucide-react';
import { CourseEvaluationView } from './CourseEvaluationView';
import { CourseStudentsView } from './CourseStudentsView';

interface ClassroomWorkspaceProps {
  course: {
    id: string;
    title: string;
    modality: string;
    schedule_text?: string;
    capacity?: number;
    category?: { name: string; accent_color?: string };
  };
  initialTab?: 'aula' | 'estudiantes';
}

export function ClassroomWorkspace({
  course,
  initialTab = 'aula'
}: ClassroomWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'aula' | 'estudiantes'>(initialTab);

  const formattedModality = course.modality 
    ? (course.modality === 'hibrido' ? 'Virtual & Presencial' : course.modality.charAt(0).toUpperCase() + course.modality.slice(1))
    : 'Virtual & Presencial';

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-14">
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
            {activeTab === 'aula' ? 'Aula Virtual & Evidencias' : 'Estudiantes y Postulaciones'}
          </span>
        </div>

        {/* Global Workspace Tab Switcher */}
        <div className="inline-flex items-center p-1 rounded-xl bg-[#131317] border border-[#262629] shadow-inner self-start sm:self-auto">
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
            <span>Aula Virtual & Evidencias</span>
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
            <span>Estudiantes y Postulaciones</span>
          </button>
        </div>
      </div>

      {/* Main Views Container */}
      {activeTab === 'aula' ? (
        <CourseEvaluationView
          courseTitle={course.title}
          modalityText={formattedModality}
          cohortText="2026-I"
          teacherText="Maestra Lucía Forero"
          totalEnrolledCount={course.capacity ? Math.min(course.capacity, 32) : 32}
          onSwitchToStudentsTab={() => setActiveTab('estudiantes')}
        />
      ) : (
        <CourseStudentsView
          courseTitle={course.title}
          modalityText={formattedModality}
          cohortText="2026-I"
          teacherText="Maestra Lucía Forero"
          maxCapacity={course.capacity || 35}
        />
      )}
    </div>
  );
}
