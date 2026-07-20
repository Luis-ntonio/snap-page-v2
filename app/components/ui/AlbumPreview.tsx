'use client';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import HTMLFlipBook from 'react-pageflip';
import type { PlantillaLayout } from '@/types';
import { AlbumPageCanvas } from './album/AlbumPageCanvas';

const F: React.CSSProperties = { fontFamily: "'Raleway', Arial, sans-serif" };
const BROWN = '#7B3A1E';

export interface AlbumPreviewHandle {
  flipTo: (n: number) => void;
}

// Vista previa de solo lectura de la plantilla: navega las páginas mostrando las posiciones fijas
// de foto (numeradas) y los textos de diseño, sin subir nada. CTA → abre el editor interactivo.
const AlbumPreview = forwardRef<AlbumPreviewHandle, { layout: PlantillaLayout }>(function AlbumPreview({ layout }, ref) {
  const [pageIdx, setPageIdx] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookRef = useRef<any>(null);
  const flipTo = (n: number) => bookRef.current?.pageFlip()?.flip(n);

  useImperativeHandle(ref, () => ({ flipTo }));

  return (
    <div>
      <p style={{ ...F, fontSize: 12, color: '#999', textAlign: 'center', marginBottom: 16 }}>
        Vista previa · así se organizan tus {layout.fotos} fotos. Los números marcan cada posición.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        {/* El wrapper decide portrait vs. landscape: page-flip entra en modo "2 páginas" (spread) solo si
            blockWidth >= minWidth*2 (ver page-flip Render.ts calculateBoundsRect). Con usePortrait=true cae
            automáticamente a 1 página cuando el contenedor es angosto (mobile). */}
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
          {layout.pages.map((p, i) => (
            <div key={i} style={{ background: p.bg ?? '#fff' }}>
              <AlbumPageCanvas page={p} editable={false} maxWidth={9999} />
            </div>
          ))}
        </HTMLFlipBook>
        </div>
      </div>

      {/* Navegación */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 12 }}>
        {/* flipPrev/flipNext (no flipTo(pageIdx±1)): pageIdx es el índice izquierdo del spread actual, así
            que sumar/restar 1 a veces cae dentro del mismo spread (no avanza). flipPrev/flipNext navegan
            por spread. */}
        <button onClick={() => bookRef.current?.pageFlip()?.flipPrev()} disabled={pageIdx === 0}
          style={navBtn(pageIdx === 0)}>
          <ChevronLeft size={16} />
        </button>
        <span style={{ ...F, fontSize: 12, color: '#666', minWidth: 90, textAlign: 'center' }}>
          Página {pageIdx + 1} / {layout.pages.length}
        </span>
        <button onClick={() => bookRef.current?.pageFlip()?.flipNext()} disabled={pageIdx >= layout.pages.length - 2}
          style={navBtn(pageIdx >= layout.pages.length - 2)}>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Puntos */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
        {layout.pages.map((_, i) => (
          <button key={i} onClick={() => flipTo(i)} aria-label={`Página ${i + 1}`}
            style={{ width: 8, height: 8, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: i === pageIdx ? BROWN : '#ddd', padding: 0 }} />
        ))}
      </div>

      <Link href={`/editor/${layout.id}`}
        style={{ ...F, display: 'block', width: '100%', background: BROWN, color: '#fff', fontWeight: 700,
          fontSize: 13, letterSpacing: '0.12em', textAlign: 'center', padding: 15, borderRadius: 99, textDecoration: 'none' }}>
        ✨ PERSONALIZAR CON MIS FOTOS
      </Link>
    </div>
  );
});

export default AlbumPreview;

const navBtn = (disabled: boolean): React.CSSProperties => ({
  width: 34, height: 34, borderRadius: '50%', border: '1px solid #e0e0e0', background: '#fff',
  cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.3 : 1,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
});
