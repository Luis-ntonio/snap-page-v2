import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';

interface FotoInput {
  nombre: string;
  storage_path: string;
  orden: number;
}

export async function POST(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const body = await req.json();
  const {
    id, plan, tematica, plantilla_id, portada_id, precio, descripcion, canva_link,
    pdf_path, layout, fotos,
  }: {
    id?: string; plan: string; tematica?: string; plantilla_id?: string; portada_id?: string;
    precio?: number; descripcion?: string; canva_link?: string;
    pdf_path?: string; layout?: Record<string, unknown>; fotos?: FotoInput[];
  } = body;

  // Get active lote
  const { data: lote } = await supabase.from('lotes').select('id').eq('activo', true).single();

  const { data: pedido, error } = await supabase.from('pedidos').insert({
    ...(id ? { id } : {}),
    usuario_id: user.id,
    plan,
    tematica: tematica ?? null,
    plantilla_id: plantilla_id ?? null,
    portada_id: portada_id ?? null,
    precio: precio ?? null,
    descripcion: descripcion ?? null,
    canva_link: canva_link ?? null,
    pdf_path: pdf_path ?? null,
    layout: layout ?? null,
    lote_id: lote?.id ?? null,
    estado: 'pedido-realizado',
    numero: '',
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // El editor de álbum (plan Personalizado) ya subió las fotos a Storage; aquí solo se registran los metadatos.
  if (fotos && fotos.length > 0) {
    const { error: fotosError } = await supabase.from('fotos_subidas').insert(
      fotos.map((f) => ({
        pedido_id: pedido.id,
        nombre: f.nombre,
        url: f.storage_path, // bucket privado: los consumidores resuelven la URL firmada a partir de storage_path
        storage_path: f.storage_path,
        orden: f.orden,
      })),
    );
    if (fotosError) console.error('Error al registrar fotos_subidas:', fotosError.message);
  }

  // Trigger notification asynchronously
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  fetch(`${siteUrl}/api/notificaciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pedido_id: pedido.id }),
  }).catch(console.error);

  return NextResponse.json({ pedido });
}
