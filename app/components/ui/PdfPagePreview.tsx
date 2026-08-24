'use client';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import HTMLFlipBook from 'react-pageflip';

const F: React.CSSProperties = { fontFamily: "'Raleway', Arial, sans-serif" };
const BROWN = '#7E451B';

export interface PdfPagePreviewHandle {
  flipTo: (n: number) => void;
}

// Vista previa de solo lectura de la plantilla usando el álbum de ejemplo REAL (diseñado por Malú,
// con sus propias fotos curadas), pre-rasterizado a JPEGs — ver PLANTILLA_EJEMPLO_PAGINAS en
// lib/data.ts. Mismo visor (react-pageflip) que AlbumPreview, pero con imágenes planas en vez de
// AlbumPageCanvas, así que no hay nada que renderizar/esperar: las imágenes cargan directo.
const PdfPagePreview = forwardRef<PdfPagePreviewHandle, {
  images: string[];
  editorHref: string;
  totalFotos: number;
}>(function PdfPagePreview({ images, editorHref, totalFotos }, ref) {
  const [pageIdx, setPageIdx] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookRef = useRef<any>(null);
  const flipTo = (n: number) => bookRef.current?.pageFlip()?.flip(n);

  useImperativeHandle(ref, () => ({ flipTo }));

  return (
    <div>
      <p style={{ ...F, fontSize: 12, color: '#999', textAlign: 'center', marginBottom: 16 }}>
        Así queda tu álbum de {totalFotos} fotos — ejemplo real, no una plantilla en blanco.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <div style={{ width: '100%', maxWidth: 700 }}>
          <HTMLFlipBook
            ref={bookRef}
            width={280}
            height={396}
            size="stretch"
            minWidth={240}
            maxWidth={320}
            minHeight={340}
            maxHeight={453}
            startPage={0}
            drawShadow
            flippingTime={500}
            usePortrait
            startZIndex={0}
            autoSize
            maxShadowOpacity={0.4}
            showCover
            mobileScrollSupport={false}
            clickEventForward
            useMouseEvents
            swipeDistance={30}
            showPageCorners
            disableFlipByClick={false}
            className=""
            style={{}}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onFlip={(e: any) => setPageIdx(e.data)}
          >
            {images.map((src, i) => (
              <div key={i} style={{ background: '#fff' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Página ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            ))}
          </HTMLFlipBook>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 12 }}>
        <button onClick={() => bookRef.current?.pageFlip()?.flipPrev()} disabled={pageIdx === 0}
          style={navBtn(pageIdx === 0)}>
          <ChevronLeft size={16} />
        </button>
        <span style={{ ...F, fontSize: 12, color: '#666', minWidth: 90, textAlign: 'center' }}>
          Página {pageIdx + 1} / {images.length}
        </span>
        <button onClick={() => bookRef.current?.pageFlip()?.flipNext()} disabled={pageIdx >= images.length - 2}
          style={navBtn(pageIdx >= images.length - 2)}>
          <ChevronRight size={16} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
        {images.map((_, i) => (
          <button key={i} onClick={() => flipTo(i)} aria-label={`Página ${i + 1}`}
            style={{ width: 8, height: 8, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: i === pageIdx ? BROWN : '#ddd', padding: 0 }} />
        ))}
      </div>

      <Link href={editorHref}
        style={{ ...F, display: 'block', width: '100%', background: BROWN, color: '#fff', fontWeight: 700,
          fontSize: 13, letterSpacing: '0.12em', textAlign: 'center', padding: 15, borderRadius: 99, textDecoration: 'none' }}>
        ✨ PERSONALIZAR CON MIS FOTOS
      </Link>
    </div>
  );
});

export default PdfPagePreview;

const navBtn = (disabled: boolean): React.CSSProperties => ({
  width: 34, height: 34, borderRadius: '50%', border: '1px solid #e0e0e0', background: '#fff',
  cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.3 : 1,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
});
