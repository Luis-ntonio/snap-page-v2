import type { PlantillaLayout } from '@/types';

// Plantilla "Mis Viajes" — 10 hojas, 60 fotos, textos 1-7.
// Base: plantillas/Documentacion/viajes_posiciones.xlsx (posición/tamaño/rotación exactos, provisto por
// Malú) — NO se tocan las coordenadas de fotos que ya venían documentadas ahí, porque están bien. El
// Excel omitió algunas fotos que sí existen en el PDF de ejemplo real (plantillas/viajes - para luis.pdf,
// no versionado en git); esas se agregaron aparte, en huecos libres del diseño, sin mover nada de lo que
// ya estaba correcto: P5/P17 (cascada) 6→7 fotos, P10 2→4 (grilla 2x2 completa), P11 3→5 (+ foto chica al
// centro), P15 5→9 (grilla 3x3 completa, no 2 columnas), P19 4→5 (+ foto chica al centro). P18 se probó
// con una 2da foto en una sesión anterior pero resultó ser la flor decorativa del diseño — se revirtió a
// su única foto real, como ya tenía el Excel.
// A diferencia de parejas/cumpleaños, aquí cada "Página" del Excel ya es una página completa de 210×297mm
// (no un spread de 42cm), así que se usan directo las columnas % Ancho/% Alto/% X/% Y (sin dividir por
// mitad). Cada objeto de `pages` es UNA página física. Total: 20 páginas = 10 hojas × 2 caras. El
// HTMLFlipBook usa showCover=true: la página[0] (P1, portada) se muestra SIEMPRE sola, y desde ahí
// empareja de a 2 en 2 — con 20 páginas esto deja también la P20 (contraportada) sola al final.

const INK = '#333';

export const viajes: PlantillaLayout = {
  id: 'viajes',
  categoria: 'viajes',
  nombre: 'Mis Viajes',
  hojas: 10,
  fotos: 58,
  aspect: 0.707,
  pages: [
    // ── P1: portada — 1 foto de viaje a página completa (sola) ──
    {
      bg: '#2b2b2b',
      slots: [{ n: 1, x: 0, y: 0, w: 1, h: 1 }],
      texts: [
        { key: 'texto-1', x: 0.1, y: 0.42, w: 0.5, h: 0.1, placeholder: '¡Italia, allá voy!', editable: true, align: 'left', size: 0.026, color: '#fff' },
      ],
    },
    // ── P2: foto grande (2) — empareja con P3 ──
    {
      bg: '#ffffff',
      slots: [{ n: 2, x: 0.1769, y: 0.133, w: 0.6462, h: 0.734 }],
    },
    // ── P3: fotos 3, 4 apiladas ──
    {
      bg: '#ffffff',
      slots: [
        { n: 3, x: 0.1769, y: 0.1321, w: 0.6462, h: 0.3557 },
        { n: 4, x: 0.1769, y: 0.5122, w: 0.6462, h: 0.3557 },
      ],
    },
    // ── P4: foto suelta (5) con descripción tipo postal — empareja con P5 ──
    {
      bg: '#f3f1ec',
      slots: [{ n: 5, x: 0.2445, y: 0.1667, w: 0.4452, h: 0.3657, shape: 'polaroid', rotate: 5.4 }],
      texts: [
        { key: 'texto-2', x: 0.12, y: 0.62, w: 0.76, h: 0.28, placeholder: 'Un recuerdo de este viaje...', editable: true, align: 'center', size: 0.022, color: INK },
      ],
    },
    // ── P5: cascada de polaroids 6-11 (posiciones del Excel, sin tocar salvo la 6, ver nota abajo) +
    // 12 nueva (foto que el Excel no registraba, en el hueco libre arriba a la derecha) + "Julio 2024" ──
    // La foto 7 ya no usa el shape:'camera' genérico (caja negra abstracta): en su lugar, la foto va
    // dentro de la pantalla de una cámara Sony real (marcos/viajes-camara-sony.png, recorte con la
    // pantalla LCD vaciada a transparente) pintada como `decorations` front — el slot 7 solo cubre el
    // hueco de la pantalla (x/y/w/h calculados a partir del bbox de esa zona en el PNG), y el marco de
    // la cámara se dibuja encima, tapando el borde del slot igual que un marco real.
    // La foto 6 se agrandó (era la polaroid más chica de la cascada) centrada en el mismo punto, mismo
    // aspect ratio 4:3.29 y misma rotación -2° — el padding del marco polaroid es un % del propio slot
    // (AlbumPageCanvas.tsx/pdf.ts), así que agrandar el slot agranda foto y marco juntos en proporción;
    // no hay forma de agrandar solo la foto sin también agrandar el marco. ──
    {
      bg: '#f3f1ec',
      slots: [
        { n: 8, x: 0.259, y: 0.2145, w: 0.3979, h: 0.3268, shape: 'polaroid', rotate: -10.6 },
        { n: 10, x: 0.4879, y: 0.4529, w: 0.3538, h: 0.2906, shape: 'polaroid', rotate: 11.9 },
        { n: 11, x: 0.2904, y: 0.5829, w: 0.3979, h: 0.3268, shape: 'polaroid', rotate: -2 },
        { n: 9, x: 0.119, y: 0.443, w: 0.3519, h: 0.289, shape: 'polaroid' },
        { n: 6, x: 0.0947, y: 0.1549, w: 0.32, h: 0.263, shape: 'polaroid', rotate: -2 },
        { n: 7, x: 0.5877, y: 0.2359, w: 0.177, h: 0.0945 },
      ],
      texts: [
        { key: 'texto-3', x: 0.08, y: 0.0, w: 0.6, h: 0.06, preset: 'Julio 2024', editable: true, align: 'left', italic: true, size: 0.022, color: '#999' },
      ],
      decorations: [
        { src: '/images/plantillas/marcos/viajes-camara-sony.png', layer: 'front', x: 0.5398, y: 0.1938, w: 0.3331, h: 0.1699 },
      ],
    },
    // ── P6: "verano con gelato" + foto grande a página completa (13) — empareja con P7 ──
    {
      bg: '#8fb7c9',
      slots: [{ n: 12, x: 0, y: 0, w: 1, h: 1 }],
      texts: [
        { key: 'texto-4', x: 0.06, y: 0.02, w: 0.88, h: 0.08, preset: 'verano con gelato', editable: true, align: 'left', italic: true, weight: 700, size: 0.036, color: '#fff' },
      ],
    },
    // ── P7: columna 14,15,16 ──
    {
      bg: '#ffffff',
      slots: [
        { n: 13, x: 0.1265, y: 0.0907, w: 0.747, h: 0.2532 },
        { n: 14, x: 0.1265, y: 0.3735, w: 0.747, h: 0.2532 },
        { n: 15, x: 0.1265, y: 0.6561, w: 0.747, h: 0.2532 },
      ],
      texts: [
        { key: 'texto-5', x: 0.08, y: 0.96, w: 0.6, h: 0.03, placeholder: 'Nota', editable: true, align: 'left', size: 0.014, color: '#999' },
      ],
    },
    // ── P8: grilla "ventana" 2x2 (17,18,19,20) — empareja con P9 ──
    {
      bg: '#ffffff',
      slots: [
        { n: 16, x: 0.1462, y: 0.1542, w: 0.3365, h: 0.3365 },
        { n: 17, x: 0.5172, y: 0.1542, w: 0.3365, h: 0.3365 },
        { n: 18, x: 0.1462, y: 0.5093, w: 0.3365, h: 0.3365 },
        { n: 19, x: 0.5172, y: 0.5093, w: 0.3365, h: 0.3365 },
      ],
    },
    // ── P9: foto grande (21) ──
    {
      bg: '#ffffff',
      slots: [{ n: 20, x: 0.0805, y: 0.1098, w: 0.839, h: 0.7803 }],
    },
    // ── P10: 2 fotos del Excel (22,23, mitad superior) + 24,25 nuevas abajo — grilla 2x2 completa ──
    {
      bg: '#ffffff',
      slots: [
        { n: 21, x: 0.0025, y: 0, w: 0.5, h: 0.5 },
        { n: 22, x: 0.5025, y: 0, w: 0.5, h: 0.5 },
        { n: 23, x: 0.0025, y: 0.5, w: 0.5, h: 0.5 },
        { n: 24, x: 0.5025, y: 0.5, w: 0.5, h: 0.5 },
      ],
    },
    // ── P11: 3 fotos del Excel (26,27,28, en L) + 29 nueva (arriba-der) + 30 nueva chica al centro ──
    {
      bg: '#ffffff',
      slots: [
        { n: 25, x: 0.0975, y: 0.0902, w: 0.3921, h: 0.4021 },
        { n: 26, x: 0.0975, y: 0.5162, w: 0.3921, h: 0.4021 },
        { n: 27, x: 0.5214, y: 0.5162, w: 0.3921, h: 0.4021 },
        { n: 28, x: 0.5214, y: 0.0902, w: 0.3921, h: 0.4021 },
        { n: 29, x: 0.364, y: 0.375, w: 0.272, h: 0.251, rotate: 5 },
      ],
    },
    // ── P12: foto grande a página completa (31) — empareja con P13 ──
    {
      bg: '#ffffff',
      slots: [{ n: 30, x: 0, y: 0, w: 1, h: 1 }],
    },
    // ── P13: fotos 32,33 apiladas sin superponerse, sobre fondo fijo de paisaje ──
    {
      bg: '#fff8ee',
      pattern: 'landscape',
      slots: [
        { n: 31, x: 0.1769, y: 0.1321, w: 0.6462, h: 0.3557 },
        { n: 32, x: 0.1769, y: 0.5122, w: 0.6462, h: 0.3557 },
      ],
    },
    // ── P14: columna sin bordes, a todo el ancho de la página (34,35,36) — empareja con P15 ──
    {
      bg: '#ffffff',
      slots: [
        { n: 33, x: 0, y: 0, w: 1, h: 0.3093 },
        { n: 34, x: 0, y: 0.3455, w: 1, h: 0.3093 },
        { n: 35, x: 0, y: 0.6907, w: 1, h: 0.3093 },
      ],
    },
    // ── P15: 5 fotos del Excel (37-41, 2 columnas) + 42,43,44,45 nuevas — grilla 3x3 completa ──
    {
      bg: '#ffffff',
      slots: [
        { n: 36, x: 0.1, y: 0.0825, w: 0.2552, h: 0.2662 },
        { n: 37, x: 0.3724, y: 0.0825, w: 0.2552, h: 0.2662 },
        { n: 38, x: 0.1, y: 0.3648, w: 0.2552, h: 0.2662 },
        { n: 39, x: 0.3724, y: 0.3648, w: 0.2552, h: 0.2662 },
        { n: 40, x: 0.1, y: 0.6475, w: 0.2552, h: 0.2662 },
        { n: 41, x: 0.3724, y: 0.6475, w: 0.2552, h: 0.2662 },
        { n: 42, x: 0.6448, y: 0.0825, w: 0.2552, h: 0.2662 },
        { n: 43, x: 0.6448, y: 0.3648, w: 0.2552, h: 0.2662 },
        { n: 44, x: 0.6448, y: 0.6475, w: 0.2552, h: 0.2662 },
      ],
    },
    // ── P16: foto grande a página completa (46) — empareja con P17 ──
    {
      bg: '#ffffff',
      slots: [{ n: 45, x: 0, y: 0, w: 1, h: 1 }],
    },
    // ── P17: cascada de polaroids 47-52 (mismo diseño que P5, posiciones del Excel salvo la 46, ver
    // nota en P5) + 53 nueva + "Julio 2024" ──
    // La foto 47 usa el mismo marco de cámara Sony que la 7 de P5 (mismo recorte sin rotar, misma
    // posición/tamaño) — al ser el mismo diseño de cascada que P5, el hueco libre queda en el mismo
    // sitio, así que no hace falta la variante rotada 90° (marcos/viajes-camara-sony-90.png, que quedó
    // sin usar; se probó para esta página pero se prefirió mantener el mismo marco que P5). ──
    {
      bg: '#f3f1ec',
      slots: [
        { n: 48, x: 0.259, y: 0.2145, w: 0.3979, h: 0.3268, shape: 'polaroid', rotate: -10.6 },
        { n: 50, x: 0.4879, y: 0.4529, w: 0.3538, h: 0.2906, shape: 'polaroid', rotate: 11.9 },
        { n: 51, x: 0.2904, y: 0.5829, w: 0.3979, h: 0.3268, shape: 'polaroid', rotate: -2 },
        { n: 49, x: 0.119, y: 0.443, w: 0.3519, h: 0.289, shape: 'polaroid' },
        { n: 46, x: 0.0947, y: 0.1549, w: 0.32, h: 0.263, shape: 'polaroid', rotate: -2 },
        { n: 47, x: 0.5877, y: 0.2359, w: 0.177, h: 0.0945 },
      ],
      texts: [
        { key: 'texto-6', x: 0.08, y: 0.0, w: 0.6, h: 0.06, placeholder: 'Julio 2024', editable: true, align: 'left', size: 0.022, color: '#999' },
      ],
      decorations: [
        { src: '/images/plantillas/marcos/viajes-camara-sony.png', layer: 'front', x: 0.5398, y: 0.1938, w: 0.3331, h: 0.1699 },
      ],
    },
    // ── P18: foto suelta (54) con descripción tipo postal — empareja con P19 (la flor rosa del diseño es
    // decorativa, no una foto de cliente) ──
    {
      bg: '#f3f1ec',
      slots: [{ n: 52, x: 0.2736, y: 0.177, w: 0.4452, h: 0.3657, shape: 'polaroid', rotate: 5.4 }],
      texts: [
        { key: 'texto-7', x: 0.12, y: 0.62, w: 0.76, h: 0.28, placeholder: 'Castello di Sant Angelo — sus imponentes muros guardan siglos de historia', editable: true, align: 'center', size: 0.02, color: INK },
      ],
    },
    // ── P19: grilla 2x2 del Excel (55,56,57,58) + 59 nueva chica al centro ──
    {
      bg: '#ffffff',
      slots: [
        { n: 53, x: 0, y: 0, w: 0.5, h: 0.5 },
        { n: 54, x: 0.5, y: 0, w: 0.5, h: 0.5 },
        { n: 55, x: 0, y: 0.5, w: 0.5, h: 0.5 },
        { n: 56, x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
        { n: 57, x: 0.364, y: 0.276, w: 0.281, h: 0.265 },
      ],
    },
    // ── P20: contraportada — foto grupal final a página completa (sola, showCover la deja al cierre) ──
    {
      bg: '#2b2b2b',
      slots: [{ n: 58, x: 0.1769, y: 0.1313, w: 0.6462, h: 0.734 }],
    },
  ],
};
