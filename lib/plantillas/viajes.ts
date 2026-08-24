import type { PlantillaLayout } from '@/types';

// Plantilla "Mis Viajes" — 10 hojas, 61 fotos, textos 1-7.
// Coordenadas en fracciones 0-1 (página A4 vertical), extraídas DIRECTO del PDF de ejemplo real
// (plantillas/viajes - para luis.pdf, no versionado en git) con PyMuPDF (bbox + matriz de transform de
// cada imagen incrustada por página) — no del Excel de posiciones. El Excel que envió Malú resultó tener
// varias filas omitidas (fotos reales del PDF que no quedaron documentadas ahí), lo que hacía que varias
// páginas se vieran con huecos: P5/P17 tenían 6 fotos y son 7, P8 se mantiene en 4 (la 5ta imagen de esa
// página es un sticker/sello decorativo cuadrado, no una foto de cliente), P10 tenía 2 y son 4 (grilla
// 2x2 completa), P11 tenía 3 y son 5, P15 tenía 5 y son 9 (grilla 3x3), P18 tenía 1 y son 2, P19 tenía 4
// y son 5 (con foto superpuesta al centro). Total corregido: 49 → 61.
// Cada objeto de `pages` es UNA página física. Total: 20 páginas = 10 hojas × 2 caras. El HTMLFlipBook
// usa showCover=true: la página[0] (P1, portada) se muestra SIEMPRE sola, y desde ahí empareja de a 2 en
// 2 — con 20 páginas esto deja también la P20 (contraportada) sola al final.

const INK = '#333';

export const viajes: PlantillaLayout = {
  id: 'viajes',
  categoria: 'viajes',
  nombre: 'Mis Viajes',
  hojas: 10,
  fotos: 60,
  aspect: 0.707,
  pages: [
    // ── P1: portada — 1 foto de viaje a página completa (sola) ──
    {
      bg: '#2b2b2b',
      slots: [{ n: 1, x: 0, y: -0.1271, w: 1, h: 1.2539 }],
      texts: [
        { key: 'texto-1', x: 0.1, y: 0.42, w: 0.5, h: 0.1, placeholder: '¡Italia, allá voy!', editable: true, align: 'left', size: 0.026, color: '#fff' },
      ],
    },
    // ── P2: foto grande (2) — empareja con P3 ──
    {
      bg: '#ffffff',
      slots: [{ n: 2, x: 0.1107, y: 0.133, w: 0.7775, h: 0.7335 }],
    },
    // ── P3: fotos 3, 4 en cascada (se superponen levemente) ──
    {
      bg: '#ffffff',
      slots: [
        { n: 3, x: 0.1769, y: 0.0244, w: 0.6466, h: 0.5711 },
        { n: 4, x: 0.1769, y: 0.4063, w: 0.6466, h: 0.5669 },
      ],
    },
    // ── P4: foto suelta (5) con descripción tipo postal — empareja con P5 ──
    {
      bg: '#f3f1ec',
      slots: [{ n: 5, x: 0.2919, y: 0.1449, w: 0.3988, h: 0.3754, shape: 'polaroid', rotate: 5.4 }],
      texts: [
        { key: 'texto-2', x: 0.12, y: 0.62, w: 0.76, h: 0.28, placeholder: 'Un recuerdo de este viaje...', editable: true, align: 'center', size: 0.022, color: INK },
      ],
    },
    // ── P5: cascada de polaroids 6-12 + cámara (orden = z-order del PDF) + "Julio 2024" ──
    {
      bg: '#f3f1ec',
      slots: [
        { n: 6, x: 0.5496, y: 0.3976, w: 0.3169, h: 0.3976, shape: 'polaroid', rotate: 11.9 },
        { n: 7, x: 0.3091, y: 0.157, w: 0.3563, h: 0.4347, shape: 'polaroid', rotate: -10.6 },
        { n: 8, x: 0.4734, y: 0.1352, w: 0.4448, h: 0.2272, shape: 'camera' },
        { n: 9, x: 0.3149, y: 0.5014, w: 0.3563, h: 0.4445, shape: 'polaroid', rotate: -2 },
        { n: 10, x: 0.135, y: 0.371, w: 0.3151, h: 0.3844, shape: 'polaroid' },
        { n: 11, x: 0.1559, y: 0.1785, w: 0.2017, h: 0.1899, shape: 'polaroid', rotate: -2 },
        { n: 12, x: 0.5398, y: 0.0704, w: 0.2329, h: 0.2927, shape: 'polaroid' },
      ],
      texts: [
        { key: 'texto-3', x: 0.08, y: 0.0, w: 0.6, h: 0.06, preset: 'Julio 2024', editable: true, align: 'left', italic: true, size: 0.022, color: '#999' },
      ],
    },
    // ── P6: "verano con gelato" + foto grande a página completa (13) — empareja con P7 ──
    {
      bg: '#8fb7c9',
      slots: [{ n: 13, x: -0.0304, y: 0, w: 1.0625, h: 0.9998 }],
      texts: [
        { key: 'texto-4', x: 0.06, y: 0.02, w: 0.88, h: 0.08, preset: 'verano con gelato', editable: true, align: 'left', italic: true, weight: 700, size: 0.036, color: '#fff' },
      ],
    },
    // ── P7: cascada 14,15,16 (se superponen) ──
    {
      bg: '#ffffff',
      slots: [
        { n: 14, x: 0.1265, y: 0.0214, w: 0.747, h: 0.3917 },
        { n: 15, x: 0.1265, y: 0.4604, w: 0.747, h: 0.5282 },
        { n: 16, x: 0.1265, y: 0.2153, w: 0.747, h: 0.6587 },
      ],
      texts: [
        { key: 'texto-5', x: 0.08, y: 0.96, w: 0.6, h: 0.03, placeholder: 'Nota', editable: true, align: 'left', size: 0.014, color: '#999' },
      ],
    },
    // ── P8: grilla "ventana" 2x2 (17,18,19,20) — empareja con P9 ──
    {
      bg: '#ffffff',
      slots: [
        { n: 17, x: 0.136, y: 0.1542, w: 0.3576, h: 0.3364 },
        { n: 18, x: 0.4841, y: 0.1542, w: 0.4022, h: 0.3364 },
        { n: 19, x: 0.1354, y: 0.5092, w: 0.3576, h: 0.3364, rotate: 180 },
        { n: 20, x: 0.507, y: 0.5092, w: 0.3576, h: 0.3364 },
      ],
    },
    // ── P9: foto grande (21) ──
    {
      bg: '#ffffff',
      slots: [{ n: 21, x: 0.0805, y: 0.1045, w: 0.839, h: 0.7902 }],
    },
    // ── P10: grilla 2x2 a página completa (22,23,24,25) — empareja con P11 ──
    {
      bg: '#ffffff',
      slots: [
        { n: 22, x: 0.0025, y: 0, w: 0.5645, h: 0.4999 },
        { n: 23, x: 0.4696, y: 0, w: 0.5664, h: 0.4999 },
        { n: 24, x: -0.0524, y: 0.5, w: 0.6094, h: 0.4999 },
        { n: 25, x: 0.4888, y: 0.5, w: 0.5313, h: 0.4999 },
      ],
    },
    // ── P11: collage de 5 (grilla 2x2 + 30 chica al centro) ──
    {
      bg: '#ffffff',
      slots: [
        { n: 26, x: 0.0975, y: 0.0902, w: 0.4259, h: 0.4018 },
        { n: 27, x: 0.0975, y: 0.5093, w: 0.3922, h: 0.4159 },
        { n: 28, x: 0.5042, y: 0.0902, w: 0.4259, h: 0.4018 },
        { n: 29, x: 0.5214, y: 0.5006, w: 0.3922, h: 0.4332 },
        { n: 30, x: 0.3638, y: 0.3745, w: 0.2723, h: 0.2512, rotate: 5.2 },
      ],
    },
    // ── P12: foto grande a página completa (31) — empareja con P13 ──
    {
      bg: '#ffffff',
      slots: [{ n: 31, x: 0, y: -0.2205, w: 1.0004, h: 1.2569 }],
    },
    // ── P13: fotos 32,33 en cascada, sobre fondo fijo de paisaje ──
    {
      bg: '#fff8ee',
      pattern: 'landscape',
      slots: [
        { n: 32, x: 0.1769, y: -0.1214, w: 0.6466, h: 0.6086 },
        { n: 33, x: 0.1769, y: 0.4067, w: 0.6466, h: 0.5669 },
      ],
    },
    // ── P14: cascada 34,35,36 a todo el ancho de la página (se superponen) — empareja con P15 ──
    {
      bg: '#ffffff',
      slots: [
        { n: 34, x: 0, y: -0.1076, w: 0.9996, h: 0.5243 },
        { n: 35, x: 0, y: 0.4139, w: 0.9996, h: 0.7068 },
        { n: 36, x: 0, y: 0.1189, w: 0.9996, h: 0.8819 },
      ],
    },
    // ── P15: collage 3x3 (37-45) ──
    {
      bg: '#ffffff',
      slots: [
        { n: 37, x: 0.0861, y: 0.0824, w: 0.2831, h: 0.2664 },
        { n: 38, x: 0.0864, y: 0.3648, w: 0.2821, h: 0.2664 },
        { n: 39, x: 0.1, y: 0.6201, w: 0.2552, h: 0.3207 },
        { n: 40, x: 0.3495, y: 0.0824, w: 0.301, h: 0.2664 },
        { n: 41, x: 0.3724, y: 0.3375, w: 0.2552, h: 0.3207 },
        { n: 42, x: 0.3589, y: 0.6474, w: 0.2821, h: 0.2664 },
        { n: 43, x: 0.6314, y: 0.0824, w: 0.2821, h: 0.2664 },
        { n: 44, x: 0.6191, y: 0.3648, w: 0.307, h: 0.2664 },
        { n: 45, x: 0.6448, y: 0.62, w: 0.2552, h: 0.3214 },
      ],
    },
    // ── P16: foto grande a página completa (46) — empareja con P17 ──
    {
      bg: '#ffffff',
      slots: [{ n: 46, x: 0, y: 0, w: 1.1327, h: 1.0004 }],
    },
    // ── P17: cascada de polaroids 47-53 + cámara (mismo diseño que P5) + "Julio 2024" ──
    {
      bg: '#f3f1ec',
      slots: [
        { n: 47, x: 0.5496, y: 0.3976, w: 0.3169, h: 0.3976, shape: 'polaroid', rotate: 11.9 },
        { n: 48, x: 0.3091, y: 0.157, w: 0.3563, h: 0.4347, shape: 'polaroid', rotate: -10.6 },
        { n: 49, x: 0.4734, y: 0.1352, w: 0.4448, h: 0.2272, shape: 'camera' },
        { n: 50, x: 0.3149, y: 0.5014, w: 0.3563, h: 0.4445, shape: 'polaroid', rotate: -2 },
        { n: 51, x: 0.1302, y: 0.371, w: 0.3151, h: 0.3844, shape: 'polaroid' },
        { n: 52, x: 0.1559, y: 0.1785, w: 0.2017, h: 0.1899, shape: 'polaroid', rotate: -2 },
        { n: 53, x: 0.5398, y: 0.0704, w: 0.2329, h: 0.2927, shape: 'polaroid' },
      ],
      texts: [
        { key: 'texto-6', x: 0.08, y: 0.0, w: 0.6, h: 0.06, placeholder: 'Julio 2024', editable: true, align: 'left', size: 0.022, color: '#999' },
      ],
    },
    // ── P18: foto grande rotada (54) — empareja con P19 (la flor rosa es decorativa, no es una foto) ──
    {
      bg: '#f3f1ec',
      slots: [{ n: 54, x: 0.321, y: 0.1672, w: 0.3988, h: 0.3513, shape: 'polaroid', rotate: 5.4 }],
      texts: [
        { key: 'texto-7', x: 0.12, y: 0.62, w: 0.76, h: 0.28, placeholder: 'Castello di Sant Angelo — sus imponentes muros guardan siglos de historia', editable: true, align: 'center', size: 0.02, color: INK },
      ],
    },
    // ── P19: grilla 2x2 (55,56,57,58) + foto chica superpuesta al centro (59) ──
    {
      bg: '#ffffff',
      slots: [
        { n: 55, x: 0, y: -0.0594, w: 0.5, h: 0.6187 },
        { n: 56, x: -0.0152, y: 0.5, w: 0.5312, h: 0.4999 },
        { n: 57, x: 0.4848, y: 0, w: 0.5312, h: 0.4999 },
        { n: 58, x: 0.4627, y: 0.5, w: 0.5742, h: 0.4999 },
        { n: 59, x: 0.364, y: 0.2761, w: 0.281, h: 0.2646 },
      ],
    },
    // ── P20: contraportada — foto grupal final a página completa (sola, showCover la deja al cierre) ──
    {
      bg: '#2b2b2b',
      slots: [{ n: 60, x: 0.1542, y: 0.1313, w: 0.6916, h: 0.7335 }],
    },
  ],
};
