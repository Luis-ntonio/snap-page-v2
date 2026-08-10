// Registro de "espacios" de imagen/video administrables desde /admin/contenido.
// Cada `key` es la ruta dentro del bucket `assets` (Supabase Storage) y funciona como id único —
// no hace falta tabla en base de datos: la ruta ES el identificador. Agregar un slot nuevo aquí
// es suficiente para que aparezca en el panel; no requiere migración.

export interface MediaSlot {
  key: string;
  label: string;
  section: string;
  tipo: 'imagen' | 'video';
  recomendado?: string;
}

export const MEDIA_SLOTS: MediaSlot[] = [
  // ── Inicio · Hero ──────────────────────────────────────────────────────────
  { key: 'hero/polaroid-1.jpg', label: 'Polaroid 1 — "nuestro aniversario"', section: 'Inicio · Hero', tipo: 'imagen' },
  { key: 'hero/polaroid-2.jpg', label: 'Polaroid 2 — "Cusco 2025"', section: 'Inicio · Hero', tipo: 'imagen' },
  { key: 'hero/polaroid-3.jpg', label: 'Polaroid 3 — "los domingos en casa"', section: 'Inicio · Hero', tipo: 'imagen' },

  // ── Inicio · Carrusel de portadas ─────────────────────────────────────────
  { key: 'portadas/portada-1.jpg', label: 'Portada — The Story of Us', section: 'Inicio · Carrusel', tipo: 'imagen' },
  { key: 'portadas/portada-2.jpg', label: "Portada — I'm in Love", section: 'Inicio · Carrusel', tipo: 'imagen' },
  { key: 'portadas/portada-3.jpg', label: 'Portada — Aventuras', section: 'Inicio · Carrusel', tipo: 'imagen' },
  { key: 'portadas/portada-4.jpg', label: 'Portada — Feliz Día', section: 'Inicio · Carrusel', tipo: 'imagen' },

  // ── Inicio · Cómo enviar tus fotos ────────────────────────────────────────
  { key: 'como-enviar/video.mp4', label: 'Video "¿Cómo enviar tus fotos?"', section: 'Inicio · Cómo enviar', tipo: 'video', recomendado: 'MP4 · menos de 50MB' },
  { key: 'como-enviar/poster.jpg', label: 'Miniatura del video (antes de reproducir)', section: 'Inicio · Cómo enviar', tipo: 'imagen' },

  // ── Inicio · Datos generales ──────────────────────────────────────────────
  { key: 'datos-generales/foto.jpg', label: 'Foto del photobook', section: 'Inicio · Datos generales', tipo: 'imagen' },

  // ── Planes ─────────────────────────────────────────────────────────────────
  { key: 'planes/minimal.jpg', label: 'Plan Minimal', section: 'Planes', tipo: 'imagen' },
  { key: 'planes/personalizado.jpg', label: 'Plan Personalizado', section: 'Planes', tipo: 'imagen' },
  { key: 'planes/tengo-diseno.jpg', label: 'Plan "Tengo mi diseño"', section: 'Planes', tipo: 'imagen' },
  { key: 'planes/premium.jpg', label: 'Plan Premium', section: 'Planes', tipo: 'imagen' },

  // ── Plantillas · Mi Pareja ────────────────────────────────────────────────
  { key: 'plantillas/parejas-1-preview.jpg', label: 'Mi Pareja — plantilla completa', section: 'Plantillas · Mi Pareja', tipo: 'imagen' },
  { key: 'plantillas/parejas-1-muestra.jpg', label: 'Mi Pareja — muestra con fotos', section: 'Plantillas · Mi Pareja', tipo: 'imagen' },

  // ── Plantillas · Amor Eterno ──────────────────────────────────────────────
  { key: 'plantillas/parejas-2-preview.jpg', label: 'Amor Eterno — plantilla completa', section: 'Plantillas · Amor Eterno', tipo: 'imagen' },
  { key: 'plantillas/parejas-2-muestra.jpg', label: 'Amor Eterno — muestra con fotos', section: 'Plantillas · Amor Eterno', tipo: 'imagen' },

  // ── Plantillas · Feliz Cumpleaños ─────────────────────────────────────────
  { key: 'plantillas/cumple-1-preview.jpg', label: 'Feliz Cumpleaños — plantilla completa', section: 'Plantillas · Feliz Cumpleaños', tipo: 'imagen' },
  { key: 'plantillas/cumple-1-muestra.jpg', label: 'Feliz Cumpleaños — muestra con fotos', section: 'Plantillas · Feliz Cumpleaños', tipo: 'imagen' },

  // ── Plantillas · Aventuras ────────────────────────────────────────────────
  { key: 'plantillas/viajes-1-preview.jpg', label: 'Aventuras — plantilla completa', section: 'Plantillas · Aventuras', tipo: 'imagen' },
  { key: 'plantillas/viajes-1-muestra.jpg', label: 'Aventuras — muestra con fotos', section: 'Plantillas · Aventuras', tipo: 'imagen' },
];
