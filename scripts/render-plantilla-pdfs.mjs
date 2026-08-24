// Script de un solo uso: rasteriza los 3 PDF de ejemplo de Malú (plantillas/*.pdf) a JPEGs estáticos
// (uno por página de álbum, con el mismo recorte de imposición de imprenta que
// lib/pdf/renderPdfPreview.ts) y los deja en scripts/out/{categoria}/{n}.jpg — listos para subir a
// Supabase Storage. No se ejecuta en producción; es una herramienta de generación de assets.
import { createCanvas } from '@napi-rs/canvas';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'node:fs';
import path from 'node:path';

const SCALE = 1.6; // ~calidad de pantalla razonable sin generar JPEGs enormes

const JOBS = [
  { name: 'parejas', file: 'parejas - para luis.pdf', splitSpreads: true, maxSheets: 11 },
  { name: 'cumpleanos', file: 'para luis - cumpleaños.pdf', splitSpreads: true },
  { name: 'viajes', file: 'viajes - para luis.pdf', splitSpreads: false },
];

function cropHalf(sourceCanvas, side) {
  const half = createCanvas(sourceCanvas.width / 2, sourceCanvas.height);
  const ctx = half.getContext('2d');
  const sx = side === 'right' ? sourceCanvas.width / 2 : 0;
  ctx.drawImage(sourceCanvas, sx, 0, half.width, half.height, 0, 0, half.width, half.height);
  return half;
}

async function renderJob(job) {
  const pdfPath = path.join('plantillas', job.file);
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const pdf = await pdfjsLib.getDocument({ data, disableWorker: true }).promise;
  const numSheets = job.maxSheets ? Math.min(job.maxSheets, pdf.numPages) : pdf.numPages;

  const outDir = path.join('scripts', 'out', job.name);
  fs.mkdirSync(outDir, { recursive: true });

  let n = 0;
  for (let i = 1; i <= numSheets; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: SCALE });
    const canvas = createCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;

    const isFirst = i === 1;
    const isLast = i === numSheets;
    const pieces = [];
    if (!job.splitSpreads || numSheets === 1) {
      pieces.push(canvas);
    } else if (isFirst) {
      pieces.push(cropHalf(canvas, 'right'));
    } else if (isLast) {
      pieces.push(cropHalf(canvas, 'left'));
    } else {
      pieces.push(cropHalf(canvas, 'left'), cropHalf(canvas, 'right'));
    }

    for (const piece of pieces) {
      n += 1;
      const buf = piece.toBuffer('image/jpeg', 85);
      fs.writeFileSync(path.join(outDir, `${n}.jpg`), buf);
    }
    console.log(`${job.name}: hoja ${i}/${numSheets} -> ${pieces.length} página(s), total ${n}`);
  }
  console.log(`${job.name}: TOTAL ${n} páginas`);
}

for (const job of JOBS) {
  await renderJob(job);
}
