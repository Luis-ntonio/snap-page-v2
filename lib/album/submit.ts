import { createClient } from '@/lib/supabase/client';
import { uploadFoto, uploadPdf } from '@/lib/supabase/storage';
import type { PlantillaLayout } from '@/types';

export interface SubmitAlbumResult {
  numero: string;
  pedidoId: string;
}

// Sube fotos + PDF del álbum a Storage y registra el pedido en Supabase.
// Requiere una sesión Supabase real (usuarioId = auth.uid()); se llama únicamente cuando useAuth().user existe.
export async function submitAlbumOrder({
  layout,
  photos,
  texts,
  pdf,
  usuarioId,
  portadaId,
}: {
  layout: PlantillaLayout;
  photos: Record<number, Blob>;
  texts: Record<string, string>;
  pdf: Blob;
  usuarioId: string;
  portadaId?: string | null;
}): Promise<SubmitAlbumResult> {
  const supabase = createClient();
  const pedidoId = crypto.randomUUID();

  // 1. Subir cada foto asignada bajo la carpeta del pedido (estructura Drive: {usuario}/{pedido}/...).
  const fotos: { nombre: string; storage_path: string; orden: number }[] = [];
  for (const [nStr, blob] of Object.entries(photos)) {
    const n = Number(nStr);
    const nombre = `foto-${n}.jpg`;
    const storage_path = await uploadFoto(usuarioId, pedidoId, blob, nombre, supabase);
    fotos.push({ nombre, storage_path, orden: n });
  }

  // 2. Subir el PDF compuesto.
  const pdfPath = await uploadPdf(usuarioId, pedidoId, pdf, supabase);

  // 3. Registrar el pedido (con el mismo id ya usado en Storage) + metadatos de fotos.
  const res = await fetch('/api/pedidos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: pedidoId,
      plan: 'personalizado',
      tematica: layout.categoria,
      plantilla_id: layout.id,
      portada_id: portadaId ?? null,
      layout: { texts },
      pdf_path: pdfPath,
      fotos,
    }),
  });
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error ?? 'No se pudo registrar el pedido');
  }
  const { pedido } = await res.json();

  // El link de WhatsApp ya no lleva la URL firmada cruda del PDF (era descargable directo) —
  // apunta a /mi-pdf/[pedidoId], que resuelve una URL firmada fresca del lado del servidor.
  return { numero: pedido.numero, pedidoId: pedido.id };
}
