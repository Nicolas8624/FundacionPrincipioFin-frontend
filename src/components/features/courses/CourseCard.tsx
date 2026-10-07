import Link from "next/link";
import { Clock, Users } from "lucide-react";
import { FOUNDATION } from "@/constants/foundation";

export type Course = {
  id: string;
  title: string;
  category: string;
  schedule: string;
  availableSpots: number;
  status: "DISPONIBLE" | "LLENO";
};

export function CourseCard({ course }: { course: Course }) {
  const isAvailable = course.status === "DISPONIBLE";

  return (
    <div className="bg-space-card border border-space-border rounded-2xl overflow-hidden hover:border-gold-primary/50 transition-colors flex flex-col group h-full">
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-gold-primary bg-gold-primary/10 px-3 py-1 rounded-full">
            {course.category}
          </span>
          <span
            className={`text-xs font-bold px-2 py-1 rounded-md ${
              isAvailable
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {course.status}
          </span>
        </div>

        <h3 className="text-xl font-bold text-white mb-4 group-hover:text-gold-light transition-colors">
          {course.title}
        </h3>

        <div className="space-y-3 mt-auto">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Clock className="w-4 h-4 shrink-0 text-space-border" />
            <span>{course.schedule}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Users className="w-4 h-4 shrink-0 text-space-border" />
            <span>Cupos: {course.availableSpots}</span>
          </div>
        </div>
      </div>

      <div className="p-6 pt-0 mt-4">
        {isAvailable ? (
          <Link
            href={`${FOUNDATION.routes.enrollment}?curso=${course.id}`}
            className="block w-full text-center px-4 py-3 bg-space-border text-white font-medium rounded-lg hover:bg-gold-primary hover:text-space-dark transition-colors"
          >
            Inscribirme
          </Link>
        ) : (
          <button
            disabled
            className="block w-full text-center px-4 py-3 bg-space-black border border-space-border text-gray-500 font-medium rounded-lg cursor-not-allowed"
          >
            Agotado
          </button>
        )}
      </div>
    </div>
  );
}
