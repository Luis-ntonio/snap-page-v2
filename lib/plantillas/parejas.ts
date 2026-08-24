import type { PlantillaLayout } from '@/types';

// Plantilla "Mi Pareja" — 10 hojas, 35 fotos, textos 1-11.
// Coordenadas en fracciones 0-1 (página A4 vertical), transcritas de
// plantillas/Documentacion/parejas_posiciones (1).xlsx (posición/tamaño exactos por foto, provisto
// por Malú). Las posiciones son fijas; el cliente solo asigna sus fotos a cada slot numerado.
// La página "together" tiene 3 slots tipo polaroid (33,34,35) — las coordenadas/rotación de cada uno
// se sacaron directo de los paths vectoriales del PDF (página 7) con PyMuPDF, no del Excel (que las
// marcaba como decorativas). El corazón y el fondo de nubes/colinas sí son puramente decorativos.
// IMPORTANTE: cada objeto de `pages` es UNA página física (una cara). El PDF de origen muestra varias
// páginas ya emparejadas visualmente como "spread" (p.ej. foto grande + grilla, o texto + foto) — esas se
// modelan aquí como DOS páginas separadas (a/b) para que el visor de doble página (react-pageflip) las
// empareje solo, en vez de combinarlas en una sola página con coordenadas partidas a la mitad (bug
// corregido: antes esto producía spreads desalineados al activar la vista de libro a 2 páginas).
// El HTMLFlipBook usa showCover=true (ver AlbumEditor.tsx/AlbumPreview.tsx): la página[0] (P1) se muestra
// SIEMPRE sola, y desde ahí empareja de a 2 en 2 — por eso el índice 0 debe ser exactamente la única página
// que va sola al inicio, y el total de páginas debe ser PAR contando desde el índice 1 (para que la última,
// P13, quede sola al final tal como en el PDF).

const BROWN = '#7E451B';

export const parejas: PlantillaLayout = {
  id: 'parejas',
  categoria: 'parejas',
  nombre: 'Mi Pareja',
  hojas: 10,
  fotos: 35,
  aspect: 0.707,
  pages: [
    // ── P1: portada interior "Gracias por ser tú" ──
    {
      bg: '#ffffff',
      frame: { src: '/images/plantillas/marcos/12.svg', size: '200% 100%', position: 'right center' },
      slots: [{ n: 1, x: 0.1871, y: 0.1, w: 0.6557, h: 0.6189 }],
      texts: [
        { key: 't-titulo-1', x: 0.1, y: 0.12, w: 0.8, h: 0.08, preset: 'Gracias por ser tú', editable: true, align: 'center', italic: true, weight: 700, size: 0.045, color: BROWN },
        { key: 'texto-1', x: 0.15, y: 0.21, w: 0.7, h: 0.05, placeholder: 'Tu dedicatoria...', editable: true, align: 'center', size: 0.026, color: '#888' },
        { key: 'texto-2', x: 0.15, y: 0.82, w: 0.7, h: 0.1, placeholder: 'Mensaje especial...', editable: true, align: 'center', size: 0.024, color: '#666' },
      ],
    },
    // ── P2a: "Feliz aniversario" fondo rojo — SIN foto (empareja con P2b) ──
    {
      bg: '#C0392B',
      slots: [],
      texts: [
        { key: 't-titulo-2', x: 0.12, y: 0.32, w: 0.76, h: 0.16, preset: 'Feliz\naniversario', editable: true, align: 'left', weight: 800, size: 0.07, color: '#fff' },
        { key: 'texto-3', x: 0.12, y: 0.52, w: 0.76, h: 0.05, placeholder: 'Subtítulo', editable: true, align: 'left', size: 0.026, color: '#fff' },
        { key: 'texto-4', x: 0.12, y: 0.58, w: 0.76, h: 0.1, placeholder: 'Dedicatoria para esa persona especial', editable: true, align: 'left', size: 0.022, color: '#f5d5d0' },
      ],
    },
    // ── P2b: página de corazones con la foto (2) ──
    {
      bg: '#C0392B',
      frame: { src: '/images/plantillas/marcos/13.svg', size: '200% 100%', position: 'right center' },
      slots: [{ n: 2, x: 0.1714, y: 0.1714, w: 0.6571, h: 0.6569 }],
    },
    // ── P3: foto grande a página completa (empareja con P4 en el visor de 2 páginas) ──
    // Mitad IZQUIERDA del marco de corazones-confeti (spread completo con P4).
    {
      bg: '#ffffff',
      frame: { src: '/images/plantillas/marcos/14-overlay.svg', size: '200% 100%', position: 'left center', onTop: true },
      slots: [{ n: 3, x: 0, y: 0, w: 1, h: 1 }],
    },
    // ── P4: grilla 2x2 (4,5,6,7) — mitad DERECHA del marco de corazones-confeti (spread con P3) ──
    {
      bg: '#ffffff',
      frame: { src: '/images/plantillas/marcos/14-overlay.svg', size: '200% 100%', position: 'right center', onTop: true },
      slots: [
        { n: 4, x: 0.0686, y: 0.0774, w: 0.4043, h: 0.4145 },
        { n: 5, x: 0.5057, y: 0.0774, w: 0.4043, h: 0.4145 },
        { n: 6, x: 0.0686, y: 0.5168, w: 0.4043, h: 0.4145 },
        { n: 7, x: 0.5057, y: 0.5168, w: 0.4043, h: 0.4145 },
      ],
    },
    // ── P5: foto grande (8) + fecha (empareja con P6 en el visor de 2 páginas) ──
    {
      bg: '#ffffff',
      slots: [{ n: 8, x: 0.199, y: 0.17, w: 0.65, h: 0.6498 }],
      texts: [
        { key: 'texto-5', x: 0.08, y: 0.89, w: 0.84, h: 0.05, placeholder: 'Fecha · lugar', editable: true, align: 'center', size: 0.022, color: '#999' },
      ],
    },
    // ── P6: página de texto "Nuestra primera cita" ──
    {
      bg: '#ffffff',
      slots: [],
      texts: [
        { key: 't-titulo-6', x: 0.12, y: 0.22, w: 0.76, h: 0.1, preset: 'Nuestra\nprimera cita', editable: true, align: 'left', weight: 800, size: 0.055, color: '#2E7D5B' },
        { key: 'texto-6', x: 0.12, y: 0.42, w: 0.76, h: 0.24, placeholder: 'Cuéntanos la historia de su primera cita...', editable: true, align: 'left', size: 0.024, color: '#555' },
        { key: 'texto-7', x: 0.12, y: 0.7, w: 0.76, h: 0.06, placeholder: 'Frase de cierre', editable: true, align: 'left', size: 0.024, color: '#2E7D5B' },
      ],
    },
    // ── P7a: foto grande (9) — empareja con P7b ──
    {
      bg: '#ffffff',
      slots: [{ n: 9, x: -0.0319, y: 0, w: 1.0319, h: 1.031 }],
      texts: [
        { key: 'texto-8', x: 0.08, y: 0.9, w: 0.84, h: 0.06, placeholder: 'Nota', editable: true, align: 'center', size: 0.02, color: '#999' },
      ],
    },
    // ── P7b: "recuerda ese verano" — grilla 2x2 (10,11,12,13) ──
    {
      bg: '#ffffff',
      slots: [
        { n: 10, x: 0, y: 0, w: 0.5581, h: 0.4646 },
        { n: 11, x: 0.5581, y: -0.1532, w: 0.5176, h: 0.6178 },
        { n: 12, x: 0, y: 0.5, w: 0.5, h: 0.5 },
        { n: 13, x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
      ],
      texts: [
        { key: 't-titulo-7', x: 0.06, y: 0.04, w: 0.88, h: 0.08, preset: 'recuerda ese verano', editable: true, align: 'center', italic: true, size: 0.032, color: BROWN },
      ],
    },
    // ── P8a: columna 14,15,16 — empareja con P8b ──
    {
      bg: '#0b1020',
      slots: [
        { n: 14, x: 0.1414, y: 0.1, w: 0.7733, h: 0.2354 },
        { n: 15, x: 0.1414, y: 0.3747, w: 0.7733, h: 0.2354 },
        { n: 16, x: 0.1414, y: 0.6492, w: 0.7733, h: 0.2354 },
      ],
    },
    // ── P8b: foto grande (17) ──
    {
      bg: '#0b1020',
      slots: [{ n: 17, x: 0, y: -0.0175, w: 1, h: 1.0175 }],
    },
    // ── P9a: "together" — stack de 3 polaroids con las fotos del cliente (el fondo del recorte trae
    // el marco/sombra/clip de cada polaroid impresos con una foto de nubes y colinas de relleno; como
    // cada slot polaroid pinta una tarjeta blanca opaca del mismo tamaño/rotación encima —ver
    // AlbumPageCanvas.tsx `isPolaroid`/pdf.ts `drawSlot`—, la foto real del cliente tapa ese relleno
    // sin necesidad de tocar el recorte). Sin texto editable: el rótulo "together." ya viene impreso
    // en el recorte, agregar uno propio encima duplicaba el texto en pantalla. ──
    {
      bg: '#f3f1ec',
      frame: { src: '/images/plantillas/marcos/parejas-together-left.jpg', size: '100% 100%', position: 'center' },
      slots: [
        { n: 33, x: 0.4171, y: 0.1286, w: 0.4172, h: 0.3413, shape: 'polaroid', rotate: -12 },
        { n: 34, x: 0.1417, y: 0.3621, w: 0.4172, h: 0.3413, shape: 'polaroid', rotate: 18.8 },
        { n: 35, x: 0.4171, y: 0.5157, w: 0.4172, h: 0.3413, shape: 'polaroid', rotate: -12 },
      ],
    },
    // ── P9b: "together" — decorativa, sin fotos del cliente (recortada de la misma página 7) ──
    {
      bg: '#f3f1ec',
      frame: { src: '/images/plantillas/marcos/parejas-together-right.jpg', size: '100% 100%', position: 'center' },
      slots: [],
    },
    // ── P10a: foto grande (18) — empareja con P10b ──
    {
      bg: '#ffffff',
      slots: [{ n: 18, x: 0, y: 0, w: 1, h: 1 }],
    },
    // ── P10b: grilla 2x2 (19,20,21,22) ──
    {
      bg: '#ffffff',
      slots: [
        { n: 19, x: 0.0762, y: 0.0892, w: 0.3924, h: 0.402 },
        { n: 20, x: 0.5, y: 0.0892, w: 0.3924, h: 0.402 },
        { n: 21, x: 0.0762, y: 0.5155, w: 0.3924, h: 0.402 },
        { n: 22, x: 0.5, y: 0.5155, w: 0.3924, h: 0.402 },
      ],
    },
    // ── P11a: foto grande (23) — empareja con P11b ──
    {
      bg: '#ffffff',
      slots: [{ n: 23, x: 0, y: -0.0024, w: 1, h: 1.0024 }],
    },
    // ── P11b: grilla 2x2 (24,25,26,27) ──
    {
      bg: '#ffffff',
      slots: [
        { n: 24, x: 0, y: 0, w: 0.5, h: 0.5 },
        { n: 25, x: 0.5, y: 0, w: 0.5, h: 0.5 },
        { n: 26, x: 0, y: 0.5, w: 0.5, h: 0.5 },
        { n: 27, x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
      ],
    },
    // ── P12a: columna 28,29,30 — empareja con P12b ──
    {
      bg: '#ffffff',
      slots: [
        { n: 28, x: 0.0952, y: 0.0943, w: 0.8, h: 0.2434 },
        { n: 29, x: 0.0952, y: 0.3785, w: 0.8, h: 0.2434 },
        { n: 30, x: 0.0952, y: 0.6623, w: 0.8, h: 0.2434 },
      ],
    },
    // ── P12b: foto grande (31) ──
    {
      bg: '#ffffff',
      slots: [{ n: 31, x: 0, y: -0.0024, w: 1, h: 1.0024 }],
    },
    // ── P13: contraportada "lo nuestro es único" + 32 (sola, última página — showCover la deja sola) ──
    {
      bg: '#1a1410',
      slots: [{ n: 32, x: 0, y: 0, w: 1, h: 1 }],
      texts: [
        { key: 't-titulo-13', x: 0.55, y: 0.06, w: 0.4, h: 0.14, preset: 'lo nuestro\nes único', editable: true, align: 'right', italic: true, size: 0.035, color: '#fff' },
        { key: 'texto-11', x: 0.1, y: 0.14, w: 0.4, h: 0.1, placeholder: 'Frase final', editable: true, align: 'left', size: 0.022, color: '#e8dcc8' },
      ],
    },
  ],
};
