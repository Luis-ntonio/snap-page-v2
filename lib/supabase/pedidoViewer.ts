import { createClient } from '@supabase/supabase-js';
import { BUCKET_FOTOS } from './storage';

// Resuelve el PDF de un pedido (Minimal o Personalizado) para el visor "/mi-pdf/[pedidoId]" —
// con la service-role key (server-only), igual patrón que lib/supabase/tengoDisenoStorage.ts,
// para no exigir que quien abre el link de WhatsApp tenga sesión iniciada. El único "secreto" es
// el UUID del pedido: nunca se expone la ruta cruda del bucket, solo una URL firmada de corta
// duración, suficiente para que el visor cargue el PDF una vez.
function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export interface PedidoPdf {
  url: string;
  nombre: string;
}

export async function getPedidoPdfUrl(pedidoId: string): Promise<PedidoPdf | null> {
  const supabase = adminClient();
  const { data: pedido, error } = await supabase
    .from('pedidos')
    .select('pdf_path, plan, plantilla_id')
    .eq('id', pedidoId)
    .maybeSingle();
  if (error || !pedido?.pdf_path) return null;

  const { data, error: signError } = await supabase.storage
    .from(BUCKET_FOTOS)
    .createSignedUrl(pedido.pdf_path, 60 * 10); // 10 min: solo para que el visor cargue el PDF una vez
  if (signError) return null;

  return { url: data.signedUrl, nombre: pedido.plantilla_id ?? pedido.plan ?? 'Mi álbum' };
}
