import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface PedidoConCliente {
  numero: string;
  plan: string;
  tematica: string | null;
  precio: number | null;
  created_at: string;
  profiles: { nombre: string; email: string | null; telefono: string | null } | null;
}

export async function POST(req: Request) {
  try {
    const { pedido_id } = await req.json();

    // Fetch pedido details
    const { data: pedido } = await supabase
      .from('pedidos')
      .select('*, profiles(nombre, email, telefono)')
      .eq('id', pedido_id)
      .single<PedidoConCliente>();

    if (!pedido) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });

    const cliente = pedido.profiles;
    const email = process.env.NEXT_PUBLIC_EMAIL_ADMIN ?? 'fotolibros.snap@gmail.com';

    const subject = `🎉 Nuevo pedido ${pedido.numero} - ${cliente?.nombre ?? 'Cliente'}`;
    const body = `
Nuevo pedido recibido en SnapPage!

📦 Pedido: ${pedido.numero}
👤 Cliente: ${cliente?.nombre ?? '—'}
📧 Email: ${cliente?.email ?? '—'}
📱 Teléfono: ${cliente?.telefono ?? '—'}
📋 Plan: ${pedido.plan}
🎨 Temática: ${pedido.tematica ?? '—'}
💰 Precio: S/.${pedido.precio ?? '—'}
📅 Fecha: ${new Date(pedido.created_at).toLocaleString('es-PE')}

Ver en el admin: ${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/admin
    `.trim();

    // ─── Email via Resend ─────────────────────────────────────────────────────
    if (process.env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'SnapPage <notificaciones@snappageph.com>',
          to: [email],
          subject,
          text: body,
        }),
      });
    }

    // ─── WhatsApp notification via wa.me link (simple approach) ──────────────
    // In production, use WhatsApp Business API (Twilio, Meta Cloud API, etc.)
    // For now we store the notification in Supabase for manual review
    await supabase.from('pedidos').update({
      nota_admin: `[Notif enviada ${new Date().toLocaleString('es-PE')}]`,
    }).eq('id', pedido_id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Notification error:', err);
    return NextResponse.json({ error: 'Error al enviar notificación' }, { status: 500 });
  }
}

// Supabase webhook handler - called automatically when estado = 'pedido-realizado'
export async function GET() {
  return NextResponse.json({ status: 'Notification API active' });
}
