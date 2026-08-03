import { NextResponse } from 'next/server';
import { getPedidoPdfUrl } from '@/lib/supabase/pedidoViewer';

export async function GET(_req: Request, { params }: { params: Promise<{ pedidoId: string }> }) {
  const { pedidoId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(pedidoId)) {
    return NextResponse.json({ error: 'Id inválido' }, { status: 400 });
  }

  const pdf = await getPedidoPdfUrl(pedidoId);
  if (!pdf) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  return NextResponse.json(pdf);
}
