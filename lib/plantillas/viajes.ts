import type { PlantillaLayout } from '@/types';

// Plantilla "Mis Viajes" — 10 hojas, 58 fotos, textos 1-7.
// Transcrita de ./plantillas/PLANTILLA VIAJES.pdf. Coordenadas en fracciones 0-1 (página A4 vertical).
// Posiciones fijas y fidelidad de layout razonable (no pixel-perfect).
// IMPORTANTE: cada objeto de `pages` es UNA página física (una cara). Total: 20 páginas = 10 hojas × 2
// caras (confirmado: la suma de fotos por página de este archivo da exactamente 58, y el orden de fotos
// 1..58 no tiene saltos ni repeticiones — verificado contra el PDF página por página, no por patrón).
// El HTMLFlipBook usa showCover=true: la página[0] (P1, portada) se muestra SIEMPRE sola, y desde ahí
// empareja de a 2 en 2 — con 20 páginas esto deja también la P20 (contraportada) sola al final, tal como
// en el PDF.

const INK = '#333';

export const viajes: PlantillaLayout = {
  id: 'viajes',
  categoria: 'viajes',
  nombre: 'Mis Viajes',
  hojas: 10,
  fotos: 58,
  aspect: 0.707,
  pages: [
    // ── P1: portada — 1 foto de viaje (sola) ──
    {
      bg: '#2b2b2b',
      slots: [{ n: 1, x: 0.08, y: 0.06, w: 0.84, h: 0.88 }],
      texts: [
        { key: 'texto-1', x: 0.1, y: 0.42, w: 0.5, h: 0.1, placeholder: '¡Italia, allá voy!', editable: true, align: 'left', size: 0.026, color: '#fff' },
      ],
    },
    // ── P2: foto grande (2) — empareja con P3 ──
    {
      bg: '#ffffff',
      slots: [{ n: 2, x: 0.06, y: 0.08, w: 0.88, h: 0.84 }],
    },
    // ── P3: fotos 3, 4 apiladas ──
    {
      bg: '#ffffff',
      slots: [
        { n: 3, x: 0.08, y: 0.06, w: 0.84, h: 0.44 },
        { n: 4, x: 0.08, y: 0.52, w: 0.84, h: 0.44 },
      ],
    },
    // ── P4: foto suelta (5) con descripción tipo postal — empareja con P5 ──
    {
      bg: '#f3f1ec',
      slots: [{ n: 5, x: 0.18, y: 0.1, w: 0.64, h: 0.46, shape: 'polaroid', rotate: -3 }],
      texts: [
        { key: 'texto-2', x: 0.12, y: 0.62, w: 0.76, h: 0.28, placeholder: 'Un recuerdo de este viaje...', editable: true, align: 'center', size: 0.022, color: INK },
      ],
    },
    // ── P5: cascada de polaroids 6-11 (orden = z-order: cada una tapa una esquina de la anterior) + "Julio 2024" ──
    {
      bg: '#f3f1ec',
      slots: [
        { n: 8, x: 0.34, y: 0.22, w: 0.42, h: 0.3, shape: 'polaroid', rotate: -6 },
        { n: 10, x: 0.57, y: 0.52, w: 0.38, h: 0.3, shape: 'polaroid', rotate: 5 },
        { n: 11, x: 0.24, y: 0.64, w: 0.48, h: 0.34, shape: 'polaroid', rotate: -4 },
        { n: 9, x: 0.13, y: 0.46, w: 0.42, h: 0.3, shape: 'polaroid' },
        { n: 6, x: 0.11, y: 0.14, w: 0.32, h: 0.22, shape: 'polaroid', rotate: 3 },
        { n: 7, x: 0.58, y: 0.15, w: 0.4, h: 0.2, shape: 'camera' },
      ],
      texts: [
        { key: 'texto-3', x: 0.08, y: 0.0, w: 0.6, h: 0.06, preset: 'Julio 2024', align: 'left', italic: true, size: 0.022, color: '#999' },
      ],
    },
    // ── P6: "verano con gelato" + foto grande (12) — empareja con P7 ──
    {
      bg: '#8fb7c9',
      slots: [{ n: 12, x: 0.06, y: 0.1, w: 0.88, h: 0.82 }],
      texts: [
        { key: 'texto-4', x: 0.06, y: 0.02, w: 0.88, h: 0.08, preset: 'verano con gelato', align: 'left', italic: true, weight: 700, size: 0.036, color: '#fff' },
      ],
    },
    // ── P7: columna 13,14,15 ──
    {
      bg: '#ffffff',
      slots: [
        { n: 13, x: 0.08, y: 0.05, w: 0.84, h: 0.28 },
        { n: 14, x: 0.08, y: 0.36, w: 0.84, h: 0.28 },
        { n: 15, x: 0.08, y: 0.67, w: 0.84, h: 0.28 },
      ],
      texts: [
        { key: 'texto-5', x: 0.08, y: 0.96, w: 0.6, h: 0.03, placeholder: 'Nota', editable: true, align: 'left', size: 0.014, color: '#999' },
      ],
    },
    // ── P8: grilla "ventana" 2x2 (16,17,18,19) — empareja con P9 ──
    {
      bg: '#ffffff',
      slots: [
        { n: 16, x: 0.06, y: 0.06, w: 0.42, h: 0.42 },
        { n: 17, x: 0.52, y: 0.06, w: 0.42, h: 0.42 },
        { n: 18, x: 0.06, y: 0.52, w: 0.42, h: 0.42 },
        { n: 19, x: 0.52, y: 0.52, w: 0.42, h: 0.42 },
      ],
    },
    // ── P9: foto grande (20) ──
    {
      bg: '#ffffff',
      slots: [{ n: 20, x: 0.06, y: 0.06, w: 0.88, h: 0.88 }],
    },
    // ── P10: grilla 2x2 sin espacio (21,22,23,24) — empareja con P11 ──
    {
      bg: '#ffffff',
      slots: [
        { n: 21, x: 0.05, y: 0.05, w: 0.45, h: 0.45 },
        { n: 22, x: 0.5, y: 0.05, w: 0.45, h: 0.45 },
        { n: 23, x: 0.05, y: 0.5, w: 0.45, h: 0.45 },
        { n: 24, x: 0.5, y: 0.5, w: 0.45, h: 0.45 },
      ],
    },
    // ── P11: grilla 2x2 con espacio (25,26,27,28) + foto chica superpuesta en medio (29) ──
    {
      bg: '#ffffff',
      slots: [
        { n: 25, x: 0.06, y: 0.06, w: 0.4, h: 0.4 },
        { n: 26, x: 0.54, y: 0.06, w: 0.4, h: 0.4 },
        { n: 27, x: 0.06, y: 0.54, w: 0.4, h: 0.4 },
        { n: 28, x: 0.54, y: 0.54, w: 0.4, h: 0.4 },
        { n: 29, x: 0.36, y: 0.36, w: 0.28, h: 0.28, rotate: 8 },
      ],
    },
    // ── P12: foto grande (30) — empareja con P13 ──
    {
      bg: '#ffffff',
      slots: [{ n: 30, x: 0.06, y: 0.06, w: 0.88, h: 0.88 }],
    },
    // ── P13: fotos 31,32 apiladas sin superponerse, sobre fondo fijo de paisaje ──
    {
      bg: '#fff8ee',
      pattern: 'landscape',
      slots: [
        { n: 31, x: 0.1, y: 0.06, w: 0.8, h: 0.42 },
        { n: 32, x: 0.1, y: 0.52, w: 0.8, h: 0.42 },
      ],
    },
    // ── P14: columna sin bordes (33,34,35) — empareja con P15 ──
    {
      bg: '#ffffff',
      slots: [
        { n: 33, x: 0.06, y: 0.04, w: 0.88, h: 0.29 },
        { n: 34, x: 0.06, y: 0.35, w: 0.88, h: 0.29 },
        { n: 35, x: 0.06, y: 0.66, w: 0.88, h: 0.29 },
      ],
    },
    // ── P15: grilla 3x3 (36-44) ──
    {
      bg: '#ffffff',
      slots: Array.from({ length: 9 }, (_, i) => ({
        n: 36 + i,
        x: 0.04 + (i % 3) * 0.32,
        y: 0.06 + Math.floor(i / 3) * 0.3,
        w: 0.3,
        h: 0.28,
      })),
    },
    // ── P16: foto grande (45) — empareja con P17 ──
    {
      bg: '#ffffff',
      slots: [{ n: 45, x: 0.06, y: 0.06, w: 0.88, h: 0.88 }],
    },
    // ── P17: cascada de polaroids 46-51 (mismo orden/superposición que P5) + "Julio 2024" ──
    {
      bg: '#f3f1ec',
      slots: [
        { n: 48, x: 0.34, y: 0.22, w: 0.42, h: 0.3, shape: 'polaroid', rotate: -6 },
        { n: 50, x: 0.57, y: 0.52, w: 0.38, h: 0.3, shape: 'polaroid', rotate: 5 },
        { n: 51, x: 0.24, y: 0.64, w: 0.48, h: 0.34, shape: 'polaroid', rotate: -4 },
        { n: 49, x: 0.13, y: 0.46, w: 0.42, h: 0.3, shape: 'polaroid' },
        { n: 46, x: 0.11, y: 0.14, w: 0.32, h: 0.22, shape: 'polaroid', rotate: 3 },
        { n: 47, x: 0.58, y: 0.15, w: 0.4, h: 0.2, shape: 'camera' },
      ],
      texts: [
        { key: 'texto-6', x: 0.08, y: 0.0, w: 0.6, h: 0.06, placeholder: 'Julio 2024', editable: true, align: 'left', size: 0.022, color: '#999' },
      ],
    },
    // ── P18: foto suelta (52) con descripción tipo postal — empareja con P19 ──
    {
      bg: '#f3f1ec',
      slots: [{ n: 52, x: 0.18, y: 0.1, w: 0.64, h: 0.46, shape: 'polaroid', rotate: 3 }],
      texts: [
        { key: 'texto-7', x: 0.12, y: 0.62, w: 0.76, h: 0.28, placeholder: 'Castello di Sant Angelo — sus imponentes muros guardan siglos de historia', editable: true, align: 'center', size: 0.02, color: INK },
      ],
    },
    // ── P19: grilla sin bordes (53,54,56,57) + foto centrada superpuesta (55) ──
    {
      bg: '#ffffff',
      slots: [
        { n: 53, x: 0.05, y: 0.05, w: 0.44, h: 0.44 },
        { n: 54, x: 0.51, y: 0.05, w: 0.44, h: 0.44 },
        { n: 56, x: 0.05, y: 0.51, w: 0.44, h: 0.44 },
        { n: 57, x: 0.51, y: 0.51, w: 0.44, h: 0.44 },
        { n: 55, x: 0.3, y: 0.3, w: 0.4, h: 0.4 },
      ],
    },
    // ── P20: contraportada — foto grupal final (sola, showCover la deja al cierre) ──
    {
      bg: '#2b2b2b',
      slots: [{ n: 58, x: 0.1, y: 0.08, w: 0.8, h: 0.84 }],
    },
  ],
};
