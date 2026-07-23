import { createClient } from '@supabase/supabase-js';

// Bucket privado para los PDFs que los clientes suben en "Tengo mi diseño" (plan sin login).
// Se usa la service-role key (server-only) para poder aceptar la subida sin requerir una
// sesión Supabase real del cliente — el mismo patrón que api/notificaciones y api/chatbot.
export const BUCKET_TENGO_DISENO = 'disenos-clientes';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

async function ensureBucket() {
  const supabase = adminClient();
  const { data: existing } = await supabase.storage.getBucket(BUCKET_TENGO_DISENO);
  if (existing) return supabase;
  // 50MB: tope máximo permitido por el plan actual del proyecto Supabase.
  await supabase.storage.createBucket(BUCKET_TENGO_DISENO, {
    public: false,
    fileSizeLimit: '50MB',
    allowedMimeTypes: ['application/pdf'],
  });
  return supabase;
}

/** Genera un path aleatorio + una URL firmada de subida (el cliente sube directo a Supabase, sin pasar por nuestro servidor). */
export async function createUploadTarget(fileName: string) {
  const supabase = await ensureBucket();
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${crypto.randomUUID()}/${safeName}`;
  const { data, error } = await supabase.storage
    .from(BUCKET_TENGO_DISENO)
    .createSignedUploadUrl(path);
  if (error) throw error;
  return { path, token: data.token };
}

/** URL firmada de lectura para un PDF ya subido (para incluir en el mensaje de WhatsApp). */
export async function createReadLink(path: string, expiresInSeconds = 60 * 60 * 24 * 14) {
  const supabase = adminClient();
  const { data, error } = await supabase.storage
    .from(BUCKET_TENGO_DISENO)
    .createSignedUrl(path, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}
