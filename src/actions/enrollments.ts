"use server";

/**
 * Re-exportación de acciones del servidor para inscripciones a cursos (/inscripcion).
 * Permite importar indistintamente desde "@/actions/enrollment" o "@/actions/enrollments".
 */
export * from "./enrollment";
