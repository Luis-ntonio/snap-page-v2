import { jsPDF } from 'jspdf';
import type { AlbumPageLayout, DecorationLayer, PhotoSlot, PlantillaLayout, TextSlot, TextStylePreset } from '@/types';

// Compone el álbum completo (fondo + fotos + textos de cada página) en un PDF, del lado del cliente.
// Cada página de la plantilla se dibuja en un <canvas> del tamaño exacto de página que usa jsPDF,
// así las coordenadas fraccionales (0-1) de los slots mapean 1:1 sin distorsión.

// jsPDF con unit:'px' calcula el tamaño de página A4 a 96 DPI (~794×1123px) — suficiente para pantalla
// pero bajo para imprenta (300dpi ideal). En vez de subir pageW/pageH (rompería el layout en puntos del
// PDF), se renderiza el <canvas> más grande con ctx.scale() y se sigue insertando en el mismo tamaño de
// página física — el resto del código de dibujo no cambia porque sigue usando pageW/pageH "lógicos".
// 2.5x ≈ 240dpi: buen balance nitidez/tiempo de generación en el navegador del cliente.
const RENDER_SCALE = 2.5;

function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => { resolve(img); URL.revokeObjectURL(url); };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

function loadImageUrl(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

async function renderCoverCanvas(portadaImagen: string, nombre: string, pageW: number, pageH: number): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = pageW * RENDER_SCALE;
  canvas.height = pageH * RENDER_SCALE;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(RENDER_SCALE, RENDER_SCALE);
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, pageW, pageH);
  try {
    const img = await loadImageUrl(portadaImagen);
    drawImageCover(ctx, img, { x: 0, y: 0, w: pageW, h: pageH });
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, pageH * 0.82, pageW, pageH * 0.18);
    ctx.restore();
  } catch {
    // si la imagen de portada no carga, se deja el fondo sólido
  }
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.font = `italic 900 ${pageH * 0.045}px 'Raleway', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(nombre, pageW / 2, pageH * 0.91);
  ctx.restore();
  return canvas;
}

function drawImageCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, rect: { x: number; y: number; w: number; h: number }, rotateDeg?: number) {
  const ir = img.width / img.height;
  const rr = rect.w / rect.h;
  let sx: number, sy: number, sw: number, sh: number;
  if (ir > rr) {
    sh = img.height;
    sw = sh * rr;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = sw / rr;
    sx = 0;
    sy = (img.height - sh) / 2;
  }
  ctx.save();
  if (rotateDeg) {
    ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
    ctx.rotate((rotateDeg * Math.PI) / 180);
    ctx.drawImage(img, sx, sy, sw, sh, -rect.w / 2, -rect.h / 2, rect.w, rect.h);
  } else {
    ctx.drawImage(img, sx, sy, sw, sh, rect.x, rect.y, rect.w, rect.h);
  }
  ctx.restore();
}

function drawSlotPlaceholder(ctx: CanvasRenderingContext2D, rect: { x: number; y: number; w: number; h: number }, label: string) {
  ctx.save();
  ctx.strokeStyle = 'rgba(126,69,27,0.35)';
  ctx.setLineDash([6, 6]);
  ctx.lineWidth = 2;
  ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(126,69,27,0.55)';
  ctx.font = `bold ${Math.max(12, rect.h * 0.08)}px Raleway, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2);
  ctx.restore();
}

function drawSlot(ctx: CanvasRenderingContext2D, slot: PhotoSlot, img: HTMLImageElement | null, pageW: number, pageH: number) {
  const rect = { x: slot.x * pageW, y: slot.y * pageH, w: slot.w * pageW, h: slot.h * pageH };
  if (slot.shape === 'polaroid') {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 8;
    if (slot.rotate) {
      ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
      ctx.rotate((slot.rotate * Math.PI) / 180);
      ctx.fillRect(-rect.w / 2, -rect.h / 2, rect.w, rect.h);
    } else {
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
    ctx.restore();
    const pad = rect.w * 0.06;
    const inner = { x: rect.x + pad, y: rect.y + pad, w: rect.w - pad * 2, h: rect.h - pad * 2.6 };
    if (img) drawImageCover(ctx, img, inner, slot.rotate);
    return;
  }
  if (img) {
    drawImageCover(ctx, img, rect, slot.rotate);
  } else {
    drawSlotPlaceholder(ctx, rect, String(slot.n));
  }
}

async function drawFrame(ctx: CanvasRenderingContext2D, frame: { src: string; position?: string }, pageW: number, pageH: number) {
  try {
    const img = await loadImageUrl(frame.src);
    // El SVG es un spread de 2 páginas (viewBox ancho = 2x una página); 'left'/'right' recorta la mitad correspondiente.
    const x = frame.position?.includes('right') ? -pageW : 0;
    ctx.drawImage(img, x, 0, pageW * 2, pageH);
  } catch {
    // si el marco no carga, se deja la página sin el borde decorativo
  }
}

function drawHeartsPattern(ctx: CanvasRenderingContext2D, pageW: number, pageH: number) {
  ctx.save();
  ctx.font = `${pageW * 0.028}px sans-serif`;
  ctx.globalAlpha = 0.5;
  const step = pageW * 0.07;
  for (let y = 0; y < pageH; y += step) {
    for (let x = 0; x < pageW; x += step) {
      ctx.fillText('❤️', x, y + step);
    }
  }
  ctx.restore();
}

function drawText(ctx: CanvasRenderingContext2D, t: TextSlot, value: string, pageW: number, pageH: number, textStyle?: TextStylePreset | null, colorOverride?: string, sizeScale?: number) {
  if (!value) return;
  const rect = { x: t.x * pageW, y: t.y * pageH, w: t.w * pageW, h: t.h * pageH };
  const fontPx = (t.size ?? 0.03) * (sizeScale ?? 1) * pageH;
  const weight = t.weight && t.weight >= 700 ? 'bold' : 'normal';
  const style = t.italic ? 'italic' : 'normal';
  ctx.save();
  ctx.font = `${style} ${weight} ${fontPx}px ${textStyle?.fontFamily ?? "'Raleway', sans-serif"}`;
  // Un color elegido para ESE bloque (paleta por texto) pisa el estilo global del álbum, que a su
  // vez pisa el color de fábrica de la plantilla.
  ctx.fillStyle = colorOverride ?? textStyle?.color ?? t.color ?? '#333';
  ctx.textBaseline = 'top';
  const align = t.align ?? 'left';
  ctx.textAlign = align;
  const x = align === 'center' ? rect.x + rect.w / 2 : align === 'right' ? rect.x + rect.w : rect.x;
  const lineHeight = fontPx * 1.25;
  const lines = value.split('\n');
  lines.forEach((line, i) => ctx.fillText(line, x, rect.y + i * lineHeight, rect.w));
  ctx.restore();
}

async function drawDecoration(ctx: CanvasRenderingContext2D, d: DecorationLayer, pageW: number, pageH: number) {
  try {
    const img = await loadImageUrl(d.src);
    const rect = { x: d.x * pageW, y: d.y * pageH, w: d.w * pageW, h: d.h * pageH };
    ctx.save();
    if (d.rotate) {
      ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
      ctx.rotate((d.rotate * Math.PI) / 180);
      ctx.drawImage(img, -rect.w / 2, -rect.h / 2, rect.w, rect.h);
    } else {
      ctx.drawImage(img, rect.x, rect.y, rect.w, rect.h);
    }
    ctx.restore();
  } catch {
    // si el elemento decorativo no carga, se omite (no debe romper el resto del PDF)
  }
}

async function renderPageCanvas(
  page: AlbumPageLayout,
  photos: Record<number, Blob>,
  texts: Record<string, string>,
  pageW: number,
  pageH: number,
  textStyle?: TextStylePreset | null,
  textColors?: Record<string, string>,
  textSizes?: Record<string, number>,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = pageW * RENDER_SCALE;
  canvas.height = pageH * RENDER_SCALE;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(RENDER_SCALE, RENDER_SCALE);

  ctx.fillStyle = page.bg ?? '#ffffff';
  ctx.fillRect(0, 0, pageW, pageH);

  // El marco (marcos/*.svg) suele ser el fondo COMPLETO de la página (blanco opaco + borde
  // decorativo) — va detrás de las fotos. frame.onTop es la excepción: un SVG del mismo marco pero
  // sin su fondo blanco (ver marcos/14-overlay.svg), genuinamente transparente — ese va ENCIMA.
  const frameOnTop = page.frame?.onTop;
  if (page.frame && !frameOnTop) await drawFrame(ctx, page.frame, pageW, pageH);
  else if (page.pattern === 'hearts') drawHeartsPattern(ctx, pageW, pageH);

  for (const d of (page.decorations ?? []).filter((d) => d.layer === 'back')) {
    await drawDecoration(ctx, d, pageW, pageH);
  }

  for (const slot of page.slots) {
    const blob = photos[slot.n];
    const img = blob ? await loadImage(blob) : null;
    drawSlot(ctx, slot, img, pageW, pageH);
  }

  if (page.frame && frameOnTop) await drawFrame(ctx, page.frame, pageW, pageH);

  for (const t of page.texts ?? []) {
    // Si es editable pero el cliente no lo tocó, se usa el preset de fábrica como valor real (no
    // solo como placeholder) para que el PDF final no salga con ese bloque en blanco.
    const value = t.editable ? (texts[t.key] || t.preset || '') : (t.preset ?? '');
    drawText(ctx, t, value, pageW, pageH, textStyle, textColors?.[t.key], textSizes?.[t.key]);
  }

  for (const d of (page.decorations ?? []).filter((d) => d.layer === 'front')) {
    await drawDecoration(ctx, d, pageW, pageH);
  }

  return canvas;
}

/** Compone el álbum completo en un PDF A4. Devuelve el Blob listo para descargar o subir.
 *  Si se pasa `portada`, se antepone como tapa dura (imagen + nombre del álbum) y se agrega la misma
 *  imagen como contraportada al final — como un libro real, tapa dura adelante y atrás. */
export async function composeAlbumPdf(
  layout: PlantillaLayout,
  photos: Record<number, Blob>,
  texts: Record<string, string>,
  onProgress?: (done: number, total: number) => void,
  portada?: { imagen: string; nombre: string } | null,
  textStyle?: TextStylePreset | null,
  textColors?: Record<string, string>,
  textSizes?: Record<string, number>,
): Promise<Blob> {
  if (typeof document !== 'undefined' && document.fonts) {
    await document.fonts.ready.catch(() => {});
  }

  const doc = new jsPDF({ unit: 'px', format: 'a4', compress: true });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const total = layout.pages.length + (portada ? 2 : 0);
  let done = 0;

  if (portada) {
    const cover = await renderCoverCanvas(portada.imagen, portada.nombre, pageW, pageH);
    doc.addImage(cover.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, pageW, pageH);
    onProgress?.(++done, total);
  }

  for (let i = 0; i < layout.pages.length; i++) {
    const canvas = await renderPageCanvas(layout.pages[i], photos, texts, pageW, pageH, textStyle, textColors, textSizes);
    const imgData = canvas.toDataURL('image/jpeg', 0.85);
    if (portada || i > 0) doc.addPage();
    doc.addImage(imgData, 'JPEG', 0, 0, pageW, pageH);
    onProgress?.(++done, total);
  }

  if (portada) {
    const backCover = await renderCoverCanvas(portada.imagen, portada.nombre, pageW, pageH);
    doc.addPage();
    doc.addImage(backCover.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, pageW, pageH);
    onProgress?.(++done, total);
  }

  return doc.output('blob');
}

/** Compone un PDF simple de 1 imagen por página (portada + interiores + contraportada, en orden) —
 *  usado por el Plan Minimal, que no tiene una plantilla con slots como el editor Personalizado. */
export async function composeImagesPdf(images: Blob[], onProgress?: (done: number, total: number) => void): Promise<Blob> {
  if (typeof document !== 'undefined' && document.fonts) {
    await document.fonts.ready.catch(() => {});
  }

  const doc = new jsPDF({ unit: 'px', format: 'a4', compress: true });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  for (let i = 0; i < images.length; i++) {
    const img = await loadImage(images[i]);
    const canvas = document.createElement('canvas');
    canvas.width = pageW;
    canvas.height = pageH;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, pageW, pageH);
    drawImageCover(ctx, img, { x: 0, y: 0, w: pageW, h: pageH });
    if (i > 0) doc.addPage();
    doc.addImage(canvas.toDataURL('image/jpeg', 0.85), 'JPEG', 0, 0, pageW, pageH);
    onProgress?.(i + 1, images.length);
  }

  return doc.output('blob');
}

/** Descarga un Blob en el navegador (fallback local cuando no hay backend para subirlo). */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
