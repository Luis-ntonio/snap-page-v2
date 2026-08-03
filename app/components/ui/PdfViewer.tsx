'use client';
import { useEffect, useRef, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { renderPdfPagesFromUrl } from '@/lib/pdf/renderPdfPreview';

// Visor embebido de solo lectura — sin botón de descarga ni link directo al PDF, para que el
// destinatario del mensaje de WhatsApp pueda ver el álbum en alta calidad sin poder bajarlo.
// No es a prueba de balas (la URL firmada es visible en la pestaña de red del navegador), pero
// cubre el caso normal: nada de eso se muestra ni se ofrece en la propia interfaz.
export default function PdfViewer({ pdfUrl }: { pdfUrl: string }) {
  const [pages, setPages] = useState<string[] | null>(null);
  // URL cuyo resultado (éxito o error) ya se resolvió — evita setState síncrono al inicio del
  // efecto (ver https://react.dev/learn/you-might-not-need-an-effect): "loading" se deriva
  // comparando esto contra pdfUrl, en vez de un flag aparte que el efecto tendría que resetear.
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [pageIdx, setPageIdx] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    renderPdfPagesFromUrl(pdfUrl, (done, total) => { if (!cancelled) setProgress({ done, total }); })
      .then((p) => { if (!cancelled) { setPages(p); setError(false); setResolvedUrl(pdfUrl); setPageIdx(0); } })
      .catch((err) => {
        console.error('No se pudo renderizar el PDF del pedido:', err);
        if (!cancelled) { setError(true); setResolvedUrl(pdfUrl); }
      });
    return () => { cancelled = true; };
  }, [pdfUrl]);

  const loading = resolvedUrl !== pdfUrl;

  if (loading) {
    return (
      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--texto-3)' }}>
        Cargando tu álbum{progress ? ` (${progress.done}/${progress.total})` : '…'}
      </p>
    );
  }

  if (error || !pages || pages.length === 0) {
    return (
      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--texto-3)' }}>
        No pudimos cargar la vista previa. Escríbenos por WhatsApp y te ayudamos.
      </p>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <div style={{ width: '100%', maxWidth: 900 }}>
          <HTMLFlipBook
            ref={bookRef}
            width={460}
            height={650}
            size="stretch"
            minWidth={320}
            maxWidth={560}
            minHeight={453}
            maxHeight={792}
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
            {pages.map((url, i) => (
              <div key={i} style={{ background: '#fff' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
              </div>
            ))}
          </HTMLFlipBook>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <button onClick={() => bookRef.current?.pageFlip()?.flipPrev()} disabled={pageIdx === 0}
          style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--borde-2)', background: '#fff',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: pageIdx === 0 ? 0.3 : 1 }}>
          <ChevronLeft size={14} color="var(--marron)" />
        </button>
        <span style={{ fontSize: 11, color: 'var(--texto-3)', minWidth: 80, textAlign: 'center' }}>
          Página {pageIdx + 1} / {pages.length}
        </span>
        <button onClick={() => bookRef.current?.pageFlip()?.flipNext()} disabled={pageIdx >= pages.length - 2}
          style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--borde-2)', background: '#fff',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: pageIdx >= pages.length - 2 ? 0.3 : 1 }}>
          <ChevronRight size={14} color="var(--marron)" />
        </button>
      </div>
    </div>
  );
}
