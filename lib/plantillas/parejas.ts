import type { PlantillaLayout } from '@/types';

// Plantilla "Mi Pareja" — 10 hojas, 39 fotos, textos 1-11.
// Transcrita de ./plantillas/PLANTILLA PAREJAS.pdf. Coordenadas en fracciones 0-1 (página A4 vertical).
// Las posiciones son fijas; el cliente solo asigna sus fotos a cada slot numerado.
// IMPORTANTE: cada objeto de `pages` es UNA página física (una cara). El PDF de origen muestra varias
// páginas ya emparejadas visualmente como "spread" (p.ej. foto grande + grilla, o texto + foto) — esas se
// modelan aquí como DOS páginas separadas (a/b) para que el visor de doble página (react-pageflip) las
// empareje solo, en vez de combinarlas en una sola página con coordenadas partidas a la mitad (bug
// corregido: antes esto producía spreads desalineados al activar la vista de libro a 2 páginas).
// El HTMLFlipBook usa showCover=true (ver AlbumEditor.tsx/AlbumPreview.tsx): la página[0] (P1) se muestra
// SIEMPRE sola, y desde ahí empareja de a 2 en 2 — por eso el índice 0 debe ser exactamente la única página
// que va sola al inicio, y el total de páginas debe ser PAR contando desde el índice 1 (para que la última,
// P13, quede sola al final tal como en el PDF).

const BROWN = '#7B3A1E';

export const parejas: PlantillaLayout = {
  id: 'parejas',
  categoria: 'parejas',
  nombre: 'Mi Pareja',
  hojas: 10,
  fotos: 39,
  aspect: 0.707,
  pages: [
    // ── P1: portada interior "Gracias por ser tú" ──
    {
      bg: '#ffffff',
      frame: { src: '/images/plantillas/marcos/12.svg', size: '200% 100%', position: 'right center' },
      slots: [{ n: 1, x: 0.2, y: 0.28, w: 0.6, h: 0.5 }],
      texts: [
        { key: 't-titulo-1', x: 0.1, y: 0.12, w: 0.8, h: 0.08, preset: 'Gracias por ser tú', align: 'center', italic: true, weight: 700, size: 0.045, color: BROWN },
        { key: 'texto-1', x: 0.15, y: 0.21, w: 0.7, h: 0.05, placeholder: 'Tu dedicatoria...', editable: true, align: 'center', size: 0.026, color: '#888' },
        { key: 'texto-2', x: 0.15, y: 0.82, w: 0.7, h: 0.1, placeholder: 'Mensaje especial...', editable: true, align: 'center', size: 0.024, color: '#666' },
      ],
    },
    // ── P2a: "Feliz aniversario" fondo rojo — SIN foto (empareja con P2b) ──
    {
      bg: '#C0392B',
      slots: [],
      texts: [
        { key: 't-titulo-2', x: 0.12, y: 0.32, w: 0.76, h: 0.16, preset: 'Feliz\naniversario', align: 'left', weight: 800, size: 0.07, color: '#fff' },
        { key: 'texto-3', x: 0.12, y: 0.52, w: 0.76, h: 0.05, placeholder: 'Subtítulo', editable: true, align: 'left', size: 0.026, color: '#fff' },
        { key: 'texto-4', x: 0.12, y: 0.58, w: 0.76, h: 0.1, placeholder: 'Dedicatoria para esa persona especial', editable: true, align: 'left', size: 0.022, color: '#f5d5d0' },
      ],
    },
    // ── P2b: página de corazones con la foto (2) ──
    {
      bg: '#C0392B',
      frame: { src: '/images/plantillas/marcos/13.svg', size: '200% 100%', position: 'right center' },
      slots: [{ n: 2, x: 0.08, y: 0.08, w: 0.84, h: 0.84 }],
    },
    // ── P3: foto grande a página completa (empareja con P4 en el visor de 2 páginas) ──
    // Mitad IZQUIERDA del marco de corazones-confeti (spread completo con P4).
    {
      bg: '#ffffff',
      frame: { src: '/images/plantillas/marcos/14.svg', size: '200% 100%', position: 'left center' },
      slots: [{ n: 3, x: 0.04, y: 0.04, w: 0.92, h: 0.92 }],
    },
    // ── P4: grilla 2x2 (4,5,6,7) — mitad DERECHA del marco de corazones-confeti (spread con P3) ──
    {
      bg: '#ffffff',
      frame: { src: '/images/plantillas/marcos/14.svg', size: '200% 100%', position: 'right center' },
      slots: [
        { n: 4, x: 0.06, y: 0.06, w: 0.42, h: 0.42 },
        { n: 5, x: 0.52, y: 0.06, w: 0.42, h: 0.42 },
        { n: 6, x: 0.06, y: 0.52, w: 0.42, h: 0.42 },
        { n: 7, x: 0.52, y: 0.52, w: 0.42, h: 0.42 },
      ],
    },
    // ── P5: foto grande (8) + fecha (empareja con P6 en el visor de 2 páginas) ──
    {
      bg: '#ffffff',
      slots: [{ n: 8, x: 0.08, y: 0.08, w: 0.84, h: 0.78 }],
      texts: [
        { key: 'texto-5', x: 0.08, y: 0.89, w: 0.84, h: 0.05, placeholder: 'Fecha · lugar', editable: true, align: 'center', size: 0.022, color: '#999' },
      ],
    },
    // ── P6: página de texto "Nuestra primera cita" ──
    {
      bg: '#ffffff',
      slots: [],
      texts: [
        { key: 't-titulo-6', x: 0.12, y: 0.22, w: 0.76, h: 0.1, preset: 'Nuestra\nprimera cita', align: 'left', weight: 800, size: 0.055, color: '#2E7D5B' },
        { key: 'texto-6', x: 0.12, y: 0.42, w: 0.76, h: 0.24, placeholder: 'Cuéntanos la historia de su primera cita...', editable: true, align: 'left', size: 0.024, color: '#555' },
        { key: 'texto-7', x: 0.12, y: 0.7, w: 0.76, h: 0.06, placeholder: 'Frase de cierre', editable: true, align: 'left', size: 0.024, color: '#2E7D5B' },
      ],
    },
    // ── P7a: foto grande (9) — empareja con P7b ──
    {
      bg: '#ffffff',
      slots: [{ n: 9, x: 0.06, y: 0.08, w: 0.88, h: 0.8 }],
      texts: [
        { key: 'texto-8', x: 0.08, y: 0.9, w: 0.84, h: 0.06, placeholder: 'Nota', editable: true, align: 'center', size: 0.02, color: '#999' },
      ],
    },
    // ── P7b: "recuerda ese verano" — grilla 2x2 (10,11,12,13) ──
    {
      bg: '#ffffff',
      slots: [
        { n: 10, x: 0.06, y: 0.14, w: 0.42, h: 0.36 },
        { n: 11, x: 0.52, y: 0.14, w: 0.42, h: 0.36 },
        { n: 12, x: 0.06, y: 0.54, w: 0.42, h: 0.36 },
        { n: 13, x: 0.52, y: 0.54, w: 0.42, h: 0.36 },
      ],
      texts: [
        { key: 't-titulo-7', x: 0.06, y: 0.04, w: 0.88, h: 0.08, preset: 'recuerda ese verano', align: 'center', italic: true, size: 0.032, color: BROWN },
      ],
    },
    // ── P8a: columna 14,15,16 — empareja con P8b ──
    {
      bg: '#0b1020',
      slots: [
        { n: 14, x: 0.08, y: 0.05, w: 0.84, h: 0.29 },
        { n: 15, x: 0.08, y: 0.36, w: 0.84, h: 0.29 },
        { n: 16, x: 0.08, y: 0.67, w: 0.84, h: 0.29 },
      ],
    },
    // ── P8b: foto grande (17) ──
    {
      bg: '#0b1020',
      slots: [{ n: 17, x: 0.05, y: 0.06, w: 0.9, h: 0.88 }],
    },
    // ── P9a: polaroids 18,19,20 + "together" — empareja con P9b ──
    {
      bg: '#f3f1ec',
      slots: [
        { n: 18, x: 0.10, y: 0.08, w: 0.36, h: 0.32, shape: 'polaroid', rotate: -7 },
        { n: 19, x: 0.34, y: 0.30, w: 0.36, h: 0.32, shape: 'polaroid', rotate: 5 },
        { n: 20, x: 0.14, y: 0.54, w: 0.36, h: 0.32, shape: 'polaroid', rotate: -4 },
      ],
      texts: [
        { key: 't-together-9', x: 0.1, y: 0.88, w: 0.5, h: 0.08, preset: 'together', align: 'center', italic: true, size: 0.04, color: '#333' },
      ],
    },
    // ── P9b: grilla 2x2 (21,22,23,24) ──
    {
      bg: '#f3f1ec',
      slots: [
        { n: 21, x: 0.06, y: 0.08, w: 0.42, h: 0.4 },
        { n: 22, x: 0.52, y: 0.08, w: 0.42, h: 0.4 },
        { n: 23, x: 0.06, y: 0.52, w: 0.42, h: 0.4 },
        { n: 24, x: 0.52, y: 0.52, w: 0.42, h: 0.4 },
      ],
    },
    // ── P10a: foto grande (25) — empareja con P10b ──
    {
      bg: '#ffffff',
      slots: [{ n: 25, x: 0.06, y: 0.08, w: 0.88, h: 0.84 }],
    },
    // ── P10b: grilla 2x2 (26,27,28,29) ──
    {
      bg: '#ffffff',
      slots: [
        { n: 26, x: 0.06, y: 0.08, w: 0.42, h: 0.4 },
        { n: 27, x: 0.52, y: 0.08, w: 0.42, h: 0.4 },
        { n: 28, x: 0.06, y: 0.52, w: 0.42, h: 0.4 },
        { n: 29, x: 0.52, y: 0.52, w: 0.42, h: 0.4 },
      ],
    },
    // ── P11a: foto grande (30) — empareja con P11b ──
    {
      bg: '#ffffff',
      slots: [{ n: 30, x: 0.06, y: 0.08, w: 0.88, h: 0.84 }],
    },
    // ── P11b: grilla 2x2 (31,32,33,34) ──
    {
      bg: '#ffffff',
      slots: [
        { n: 31, x: 0.06, y: 0.08, w: 0.42, h: 0.4 },
        { n: 32, x: 0.52, y: 0.08, w: 0.42, h: 0.4 },
        { n: 33, x: 0.06, y: 0.52, w: 0.42, h: 0.4 },
        { n: 34, x: 0.52, y: 0.52, w: 0.42, h: 0.4 },
      ],
    },
    // ── P12a: columna 35,36,37 — empareja con P12b ──
    {
      bg: '#ffffff',
      slots: [
        { n: 35, x: 0.08, y: 0.05, w: 0.84, h: 0.29 },
        { n: 36, x: 0.08, y: 0.36, w: 0.84, h: 0.29 },
        { n: 37, x: 0.08, y: 0.67, w: 0.84, h: 0.29 },
      ],
    },
    // ── P12b: foto grande (38) ──
    {
      bg: '#ffffff',
      slots: [{ n: 38, x: 0.06, y: 0.08, w: 0.88, h: 0.84 }],
    },
    // ── P13: contraportada "lo nuestro es único" + 39 (sola, última página — showCover la deja sola) ──
    {
      bg: '#1a1410',
      slots: [{ n: 39, x: 0.1, y: 0.28, w: 0.8, h: 0.62 }],
      texts: [
        { key: 't-titulo-13', x: 0.55, y: 0.06, w: 0.4, h: 0.14, preset: 'lo nuestro\nes único', align: 'right', italic: true, size: 0.035, color: '#fff' },
        { key: 'texto-11', x: 0.1, y: 0.14, w: 0.4, h: 0.1, placeholder: 'Frase final', editable: true, align: 'left', size: 0.022, color: '#e8dcc8' },
      ],
    },
  ],
};
