// Rasteriza un PDF subido por el cliente a una imagen por PÁGINA DEL PHOTOBOOK, 100% en el
// navegador (usado por el visor de "Tengo mi diseño" en PlanesSection.tsx). El worker de
// pdfjs-dist se sirve como archivo estático en /public/pdf.worker.min.mjs para evitar fricción
// de bundling con Turbopack (en vez de resolverlo vía import.meta.url).
//
// Formato asumido del PDF (imposición típica de imprenta): cada hoja del PDF es horizontal y
// contiene 2 hojas del álbum una junto a la otra (un spread ya compuesto), EXCEPTO la primera y
// la última hoja del PDF, que traen solo 1 hoja de contenido real (la otra mitad va en blanco,
// porque es la primera/última página del libro y no tiene página enfrentada). Por eso cada hoja
// intermedia del PDF se parte en 2 imágenes (mitad izquierda / mitad derecha), y la primera y
// última hoja se recortan a su única mitad con contenido (derecha la primera, izquierda la
// última) descartando el espacio en blanco.

export interface PdfPreviewPage {
  url: string;
}

// Es solo una vista previa en pantalla (no el archivo de impresión): una escala baja alcanza de
// sobra para verse nítida dentro del flipbook (~280px de ancho por página) y evita bloquear el
// hilo principal varios segundos con PDFs de fotos en alta resolución.
const PREVIEW_SCALE = 1;

let workerConfigured = false;

// Cede el hilo principal entre página y página para que el navegador no marque la pestaña como
// "no responde" y pueda repintar (ej. actualizar el contador de progreso) durante el proceso.
const tick = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

function cropHalf(source: HTMLCanvasElement, side: 'left' | 'right'): string {
  const half = document.createElement('canvas');
  half.width = source.width / 2;
  half.height = source.height;
  const ctx = half.getContext('2d')!;
  const sx = side === 'right' ? source.width / 2 : 0;
  ctx.drawImage(source, sx, 0, half.width, half.height, 0, 0, half.width, half.height);
  return half.toDataURL('image/jpeg', 0.85);
}

export async function renderPdfToImages(
  file: File,
  onProgress?: (done: number, total: number) => void,
  // true (default): cada hoja del PDF trae 2 páginas del álbum lado a lado y se parte en 2
  // (con el recorte especial de la primera/última hoja, ver comentario arriba).
  // false: cada hoja del PDF ES una página del álbum, sin partir — para PDFs que no siguen
  // la imposición de imprenta asumida.
  splitSpreads = true,
): Promise<PdfPreviewPage[]> {
  const pdfjsLib = await import('pdfjs-dist');
  if (!workerConfigured) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    workerConfigured = true;
  }

  const data = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const pages: PdfPreviewPage[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: PREVIEW_SCALE });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const canvasContext = canvas.getContext('2d')!;
    await page.render({ canvas, canvasContext, viewport }).promise;

    const isFirst = i === 1;
    const isLast = i === pdf.numPages;

    if (!splitSpreads || pdf.numPages === 1) {
      pages.push({ url: canvas.toDataURL('image/jpeg', 0.85) });
    } else if (isFirst) {
      pages.push({ url: cropHalf(canvas, 'right') });
    } else if (isLast) {
      pages.push({ url: cropHalf(canvas, 'left') });
    } else {
      pages.push({ url: cropHalf(canvas, 'left') });
      pages.push({ url: cropHalf(canvas, 'right') });
    }

    onProgress?.(i, pdf.numPages);
    await tick();
  }

  return pages;
}
