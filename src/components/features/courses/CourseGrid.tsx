"use client";

import { useState } from "react";
import { CourseCategoryFilter } from "./CourseCategoryFilter";
import { CourseCard, Course } from "./CourseCard";

const COURSES_DATA: Course[] = [
  { id: "c1", title: "Pintura en Cerámica", category: "Arte y Cultura", schedule: "Sábados 9:00 AM - 12:00 PM", availableSpots: 15, status: "DISPONIBLE" },
  { id: "c2", title: "Pintura al Óleo", category: "Arte y Cultura", schedule: "Viernes 2:00 PM - 5:00 PM", availableSpots: 0, status: "LLENO" },
  { id: "c3", title: "Decoupage y Manualidades", category: "Arte y Cultura", schedule: "Miércoles 3:00 PM - 6:00 PM", availableSpots: 10, status: "DISPONIBLE" },
  { id: "c4", title: "Diseño de Cejas", category: "Belleza y Emprendimiento", schedule: "Lunes 8:00 AM - 11:00 AM", availableSpots: 20, status: "DISPONIBLE" },
  { id: "c5", title: "Lifting de Pestañas", category: "Belleza y Emprendimiento", schedule: "Martes 8:00 AM - 11:00 AM", availableSpots: 5, status: "DISPONIBLE" },
  { id: "c6", title: "Trenzas Kanekalon", category: "Belleza y Emprendimiento", schedule: "Jueves 2:00 PM - 5:00 PM", availableSpots: 8, status: "DISPONIBLE" },
  { id: "c7", title: "Iniciación Musical", category: "Educación y Oficios", schedule: "Sábados 2:00 PM - 4:00 PM", availableSpots: 12, status: "DISPONIBLE" },
  { id: "c8", title: "Electricidad Básica", category: "Educación y Oficios", schedule: "Domingos 9:00 AM - 12:00 PM", availableSpots: 0, status: "LLENO" },
];

const CATEGORIES = ["Todos", "Arte y Cultura", "Belleza y Emprendimiento", "Educación y Oficios"];

export function CourseGrid() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const filteredCourses = selectedCategory === "Todos"
    ? COURSES_DATA
    : COURSES_DATA.filter((c) => c.category === selectedCategory);

  return (
    <section className="py-20 bg-space-dark relative z-10 border-t border-space-border/50">
      <div className="container mx-auto px-4">
        <CourseCategoryFilter
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            No se encontraron cursos para esta categoría.
          </div>
        )}
      </div>
    </section>
  );
}
