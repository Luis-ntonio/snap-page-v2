import { NextResponse } from 'next/server';
import { createReadLink, BUCKET_TENGO_DISENO } from '@/lib/supabase/tengoDisenoStorage';

// Devuelve un link firmado de lectura para un PDF ya subido a disenos-clientes (para incluir
// en el mensaje de WhatsApp). Se llama después de que el cliente terminó de subir el archivo.
export async function POST(req: Request) {
  try {
    const { path } = await req.json();
    if (!path || typeof path !== 'string' || !/^[0-9a-f-]{36}\/[a-zA-Z0-9._-]+$/.test(path)) {
      return NextResponse.json({ error: 'path inválido' }, { status: 400 });
    }
    const url = await createReadLink(path);
    return NextResponse.json({ url });
  } catch (err) {
    console.error(`Error creando link de lectura en ${BUCKET_TENGO_DISENO}:`, err);
    return NextResponse.json({ error: 'No se pudo generar el link' }, { status: 500 });
  }
}
