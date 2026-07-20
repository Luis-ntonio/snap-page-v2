import type { SupabaseClient } from '@supabase/supabase-js';
import { listPedidoFiles, signedUrl, type StorageFile } from '@/lib/supabase/storage';
import { PLAN_LABELS } from '@/types';
import type { Plan, EstadoPedido } from '@/types';

// Vista "Drive" del admin: cliente (usuario_id) → pedido → archivos en Storage.
// Se deriva de la tabla `pedidos` (join profiles) — solo aparecen clientes con al menos un pedido.

export interface DrivePedido {
  id: string;
  numero: string;
  plan: Plan;
  estado: EstadoPedido;
  createdAt: string;
}

export interface DriveCliente {
  usuarioId: string;
  nombre: string;
  pedidos: DrivePedido[];
}

interface PedidoRow {
  id: string;
  numero: string;
  plan: Plan;
  estado: EstadoPedido;
  usuario_id: string;
  created_at: string;
  profiles: { nombre: string } | null;
}

export async function listClientesConPedidos(supabase: SupabaseClient): Promise<DriveCliente[]> {
  const { data, error } = await supabase
    .from('pedidos')
    .select('id, numero, plan, estado, usuario_id, created_at, profiles(nombre)')
    .order('created_at', { ascending: false });
  if (error) throw error;

  const rows = (data ?? []) as unknown as PedidoRow[];
  const porCliente = new Map<string, DriveCliente>();
  for (const r of rows) {
    const key = r.usuario_id;
    if (!porCliente.has(key)) {
      porCliente.set(key, { usuarioId: key, nombre: r.profiles?.nombre ?? 'Cliente', pedidos: [] });
    }
    porCliente.get(key)!.pedidos.push({
      id: r.id,
      numero: r.numero,
      plan: r.plan,
      estado: r.estado,
      createdAt: r.created_at,
    });
  }
  return [...porCliente.values()];
}

export interface DriveFile extends StorageFile {
  url: string;
  isImage: boolean;
}

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|heic)$/i;

/** Lista los archivos de un pedido con su URL firmada, lista para mostrar/descargar. */
export async function listPedidoFilesConUrl(
  usuarioId: string,
  pedidoId: string,
  supabase: SupabaseClient,
): Promise<DriveFile[]> {
  const files = await listPedidoFiles(usuarioId, pedidoId, supabase);
  return Promise.all(
    files.map(async (f) => ({
      ...f,
      url: await signedUrl(f.path, 60 * 60, supabase), // 1h, solo para ver/descargar en el panel
      isImage: IMAGE_EXT.test(f.name),
    })),
  );
}

export const planLabel = (p: Plan) => PLAN_LABELS[p] ?? p;
