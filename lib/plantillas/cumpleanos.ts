import type { PlantillaLayout } from '@/types';

// Plantilla "Mi Cumpleaños" — 10 hojas, 24 fotos, textos 1-9 (dedicatorias por familiar/amigos).
// Transcrita de ./plantillas/PLANTILLA CUMPLEAÑOS.pdf. Coordenadas en fracciones 0-1 (página A4 vertical).
// Posiciones fijas y fidelidad de layout razonable (no pixel-perfect).
// IMPORTANTE: cada objeto de `pages` es UNA página física (una cara). El PDF de origen muestra casi todas
// las páginas ya emparejadas visualmente como "spread" (texto + foto(s), o foto grande + grilla/columna) —
// esas se modelan aquí como DOS páginas separadas (a/b) para que el visor de doble página (react-pageflip)
// las empareje solo. El total (20 páginas = 10 hojas × 2 caras) y el hecho de que showCover=true deje la
// portada (P1) y la contraportada (P11) solas al abrir/cerrar el libro confirman este conteo.

const BROWN = '#7B3A1E';
const INK = '#333';

export const cumpleanos: PlantillaLayout = {
  id: 'cumpleanos',
  categoria: 'cumpleanos',
  nombre: 'Mi Cumpleaños',
  hojas: 10,
  fotos: 24,
  aspect: 0.707,
  pages: [
    // ── P1: portada — foto del cumpleañero (sola) ──
    {
      bg: '#1a1a1a',
      slots: [{ n: 1, x: 0.1, y: 0.08, w: 0.8, h: 0.84 }],
      texts: [
        { key: 'texto-1', x: 0.1, y: 0.9, w: 0.8, h: 0.06, placeholder: 'Frase de portada', editable: true, align: 'center', size: 0.022, color: '#fff' },
      ],
    },
    // ── P2a: "De mamá" — texto (empareja con P2b) ──
    {
      bg: '#ffffff',
      slots: [],
      texts: [
        { key: 't-titulo-2', x: 0.1, y: 0.08, w: 0.8, h: 0.08, preset: 'De mamá', align: 'left', italic: true, weight: 700, size: 0.04, color: BROWN },
        { key: 'texto-2', x: 0.1, y: 0.2, w: 0.8, h: 0.6, placeholder: 'Mensaje de mamá para ti...', editable: true, align: 'left', size: 0.024, color: INK },
      ],
    },
    // ── P2b: fotos 2, 3 ──
    {
      bg: '#ffffff',
      slots: [
        { n: 2, x: 0.1, y: 0.06, w: 0.8, h: 0.42 },
        { n: 3, x: 0.1, y: 0.52, w: 0.8, h: 0.42 },
      ],
    },
    // ── P3a: foto del abuelo (4) — empareja con P3b ──
    {
      bg: '#ffffff',
      slots: [{ n: 4, x: 0.06, y: 0.06, w: 0.88, h: 0.88 }],
    },
    // ── P3b: "De tu abuelo" — texto ──
    {
      bg: '#ffffff',
      slots: [],
      texts: [
        { key: 't-titulo-3', x: 0.1, y: 0.1, w: 0.8, h: 0.08, preset: 'De tu abuelo', align: 'left', italic: true, weight: 700, size: 0.04, color: BROWN },
        { key: 'texto-3', x: 0.1, y: 0.22, w: 0.8, h: 0.6, placeholder: 'Mensaje del abuelo...', editable: true, align: 'left', size: 0.024, color: INK },
      ],
    },
    // ── P4a: "De tu hermano mayor" — texto (empareja con P4b) ──
    {
      bg: '#ffffff',
      slots: [],
      texts: [
        { key: 't-titulo-4', x: 0.1, y: 0.08, w: 0.8, h: 0.08, preset: 'De tu hermano mayor', align: 'left', italic: true, weight: 700, size: 0.036, color: BROWN },
        { key: 'texto-4', x: 0.1, y: 0.2, w: 0.8, h: 0.6, placeholder: 'Mensaje de tu hermano...', editable: true, align: 'left', size: 0.024, color: INK },
      ],
    },
    // ── P4b: fotos 5, 6 ──
    {
      bg: '#ffffff',
      slots: [
        { n: 5, x: 0.1, y: 0.06, w: 0.8, h: 0.42 },
        { n: 6, x: 0.1, y: 0.52, w: 0.8, h: 0.42 },
      ],
    },
    // ── P5a: "¡Feliz cumpleaños! tus mejores amigos" + foto grande (7) — empareja con P5b ──
    {
      bg: '#f7f5f2',
      slots: [{ n: 7, x: 0.08, y: 0.3, w: 0.84, h: 0.62 }],
      texts: [
        { key: 't-titulo-5', x: 0.06, y: 0.05, w: 0.88, h: 0.14, preset: '¡Feliz\ncumpleaños!', align: 'left', italic: true, weight: 800, size: 0.05, color: INK },
        { key: 'texto-5', x: 0.06, y: 0.2, w: 0.7, h: 0.06, preset: 'tus mejores amigos', editable: false, align: 'left', italic: true, size: 0.026, color: '#888' },
      ],
    },
    // ── P5b: grilla 2x2 (8,9,10,11) ──
    {
      bg: '#f7f5f2',
      slots: [
        { n: 8, x: 0.06, y: 0.08, w: 0.42, h: 0.4 },
        { n: 9, x: 0.52, y: 0.08, w: 0.42, h: 0.4 },
        { n: 10, x: 0.06, y: 0.52, w: 0.42, h: 0.4 },
        { n: 11, x: 0.52, y: 0.52, w: 0.42, h: 0.4 },
      ],
    },
    // ── P6a: foto grande (12) — empareja con P6b ──
    {
      bg: '#ffffff',
      slots: [{ n: 12, x: 0.06, y: 0.06, w: 0.88, h: 0.88 }],
    },
    // ── P6b: "De tu hermana favorita" — texto ──
    {
      bg: '#ffffff',
      slots: [],
      texts: [
        { key: 't-titulo-6', x: 0.1, y: 0.12, w: 0.8, h: 0.12, preset: 'De tu hermana\nfavorita', align: 'left', italic: true, weight: 700, size: 0.036, color: BROWN },
        { key: 'texto-6', x: 0.1, y: 0.3, w: 0.8, h: 0.55, placeholder: 'Mensaje de tu hermana...', editable: true, align: 'left', size: 0.024, color: INK },
      ],
    },
    // ── P7a: foto grande (13) — empareja con P7b ──
    {
      bg: '#ffffff',
      slots: [{ n: 13, x: 0.06, y: 0.06, w: 0.88, h: 0.88 }],
    },
    // ── P7b: foto 14 arriba + 15,16 abajo en par ──
    {
      bg: '#ffffff',
      slots: [
        { n: 14, x: 0.08, y: 0.06, w: 0.84, h: 0.42 },
        { n: 15, x: 0.08, y: 0.52, w: 0.4, h: 0.42 },
        { n: 16, x: 0.52, y: 0.52, w: 0.4, h: 0.42 },
      ],
    },
    // ── P8a: "Con amor, de la abuela" — texto (empareja con P8b) ──
    {
      bg: '#ffffff',
      slots: [],
      texts: [
        { key: 't-titulo-8', x: 0.1, y: 0.1, w: 0.8, h: 0.14, preset: 'Con amor,\nde la abuela', align: 'left', italic: true, weight: 700, size: 0.036, color: BROWN },
        { key: 'texto-7', x: 0.1, y: 0.28, w: 0.8, h: 0.55, placeholder: 'Mensaje de la abuela...', editable: true, align: 'left', size: 0.024, color: INK },
      ],
    },
    // ── P8b: foto grande (17) ──
    {
      bg: '#ffffff',
      slots: [{ n: 17, x: 0.06, y: 0.06, w: 0.88, h: 0.88 }],
    },
    // ── P9a: "De tu viejo querido" — texto (empareja con P9b) ──
    {
      bg: '#ffffff',
      slots: [],
      texts: [
        { key: 't-titulo-9', x: 0.1, y: 0.08, w: 0.8, h: 0.08, preset: 'De tu viejo querido', align: 'left', italic: true, weight: 700, size: 0.034, color: BROWN },
        { key: 'texto-8', x: 0.1, y: 0.2, w: 0.8, h: 0.6, placeholder: 'Mensaje...', editable: true, align: 'left', size: 0.024, color: INK },
      ],
    },
    // ── P9b: fotos 18, 19 ──
    {
      bg: '#ffffff',
      slots: [
        { n: 18, x: 0.1, y: 0.06, w: 0.8, h: 0.42 },
        { n: 19, x: 0.1, y: 0.52, w: 0.8, h: 0.42 },
      ],
    },
    // ── P10a: columna 20,21,22 — empareja con P10b ──
    {
      bg: '#ffffff',
      slots: [
        { n: 20, x: 0.08, y: 0.05, w: 0.84, h: 0.29 },
        { n: 21, x: 0.08, y: 0.36, w: 0.84, h: 0.29 },
        { n: 22, x: 0.08, y: 0.67, w: 0.84, h: 0.29 },
      ],
    },
    // ── P10b: foto grande (23) ──
    {
      bg: '#ffffff',
      slots: [{ n: 23, x: 0.06, y: 0.06, w: 0.88, h: 0.88 }],
    },
    // ── P11: contraportada — foto final (sola, showCover la deja al cierre) ──
    {
      bg: '#1a1a1a',
      slots: [{ n: 24, x: 0.15, y: 0.15, w: 0.7, h: 0.7 }],
      texts: [
        { key: 'texto-9', x: 0.15, y: 0.87, w: 0.7, h: 0.06, placeholder: 'Frase de cierre', editable: true, align: 'center', size: 0.022, color: '#fff' },
      ],
    },
  ],
};
