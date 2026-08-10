'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PdfViewer from '@/app/components/ui/PdfViewer';

// Página a la que apunta el link de WhatsApp ("mira mi PDF") en vez de una URL directa del bucket:
// resuelve una URL firmada fresca en el servidor y la muestra en un visor propio, sin botón de
// descarga. Ver lib/supabase/pedidoViewer.ts para el porqué de no exigir login para abrirla.
export default function MiPdfPage() {
  const { pedidoId } = useParams() as { pedidoId: string };
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/pedidos/${pedidoId}/pdf-url`)
      .then((res) => { if (!res.ok) throw new Error('not found'); return res.json(); })
      .then((data) => { if (!cancelled) setPdfUrl(data.url); })
      .catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [pedidoId]);

  return (
    <main style={{ minHeight: '100vh', background: 'var(--crema-2)', padding: '48px 20px 72px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <h1 style={{ fontWeight: 800, textAlign: 'center', color: 'var(--marron)', fontSize: '2rem', margin: '0 0 8px' }}>
          Tu álbum
        </h1>
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--texto-3)', margin: '0 0 32px' }}>
          En alta calidad, listo para revisar antes de imprimir.
        </p>

        {error && (
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--texto-3)' }}>
            No encontramos este pedido. Si crees que es un error, escríbenos por WhatsApp.
          </p>
        )}
        {!error && !pdfUrl && (
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--texto-3)' }}>Cargando…</p>
        )}
        {pdfUrl && <PdfViewer pdfUrl={pdfUrl} />}
      </div>
    </main>
  );
}
