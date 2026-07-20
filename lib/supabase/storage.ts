import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from './client';

// Bucket privado con estructura tipo Drive: {usuario_id}/{pedido_id}/{archivo}
export const BUCKET_FOTOS = 'fotos-clientes';

export const pedidoDir = (usuarioId: string, pedidoId: string) =>
  `${usuarioId}/${pedidoId}`;

/** Sube una foto del cliente a fotos-clientes/{usuario}/{pedido}/{nombre}. Devuelve el storage_path. */
export async function uploadFoto(
  usuarioId: string,
  pedidoId: string,
  file: Blob,
  nombre: string,
  client?: SupabaseClient,
): Promise<string> {
  const supabase = client ?? createClient();
  const path = `${pedidoDir(usuarioId, pedidoId)}/${nombre}`;
  const { error } = await supabase.storage
    .from(BUCKET_FOTOS)
    .upload(path, file, { upsert: true, contentType: file.type || 'image/jpeg' });
  if (error) throw error;
  return path;
}

/** Sube el PDF compuesto del álbum. Devuelve el storage_path. */
export async function uploadPdf(
  usuarioId: string,
  pedidoId: string,
  pdf: Blob,
  client?: SupabaseClient,
): Promise<string> {
  const supabase = client ?? createClient();
  const path = `${pedidoDir(usuarioId, pedidoId)}/album.pdf`;
  const { error } = await supabase.storage
    .from(BUCKET_FOTOS)
    .upload(path, pdf, { upsert: true, contentType: 'application/pdf' });
  if (error) throw error;
  return path;
}

/** URL firmada temporal para un objeto del bucket privado. */
export async function signedUrl(
  path: string,
  expiresInSeconds = 60 * 60 * 24 * 7, // 7 días (para el link de WhatsApp)
  client?: SupabaseClient,
): Promise<string> {
  const supabase = client ?? createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET_FOTOS)
    .createSignedUrl(path, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}

export interface StorageFile {
  name: string;
  path: string;
  size?: number;
  updatedAt?: string;
}

/** Lista los archivos de un pedido (fotos + album.pdf) para la vista Drive del admin/cliente. */
export async function listPedidoFiles(
  usuarioId: string,
  pedidoId: string,
  client?: SupabaseClient,
): Promise<StorageFile[]> {
  const supabase = client ?? createClient();
  const dir = pedidoDir(usuarioId, pedidoId);
  const { data, error } = await supabase.storage
    .from(BUCKET_FOTOS)
    .list(dir, { limit: 200, sortBy: { column: 'name', order: 'asc' } });
  if (error) throw error;
  return (data ?? [])
    .filter((f) => f.id !== null) // descarta subcarpetas (placeholders)
    .map((f) => ({
      name: f.name,
      path: `${dir}/${f.name}`,
      size: (f.metadata as { size?: number } | null)?.size,
      updatedAt: f.updated_at ?? undefined,
    }));
}
