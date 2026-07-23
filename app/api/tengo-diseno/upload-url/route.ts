import { NextResponse } from 'next/server';
import { createUploadTarget } from '@/lib/supabase/tengoDisenoStorage';

// Genera un path + URL firmada de subida para que el cliente suba su PDF directo a Supabase
// Storage (sin pasar el archivo por este servidor — evita el límite de tamaño de las funciones
// de Vercel). No requiere sesión: el plan "Tengo mi diseño" no tiene login.
export async function POST(req: Request) {
  try {
    const { fileName } = await req.json();
    if (!fileName || typeof fileName !== 'string') {
      return NextResponse.json({ error: 'fileName requerido' }, { status: 400 });
    }
    const { path, token } = await createUploadTarget(fileName);
    return NextResponse.json({ path, token });
  } catch (err) {
    console.error('Error creando upload-url de tengo-diseno:', err);
    return NextResponse.json({ error: 'No se pudo preparar la subida' }, { status: 500 });
  }
}
