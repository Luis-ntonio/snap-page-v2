import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Proxy (antes "middleware", renombrado en Next 16). Runtime nodejs.
// 1) Refresca las cookies de sesión de Supabase para que los Server Components lean la sesión.
// 2) Protege /admin y /mi-cuenta SOLO si ENFORCE_AUTH=true (así el modo demo sigue funcionando durante la migración).

const PROTECTED = ['/mi-cuenta', '/admin'];

export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Sin configuración de Supabase: no-op (no rompe el arranque local).
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  const enforce = process.env.ENFORCE_AUTH === 'true';
  if (enforce) {
    const path = request.nextUrl.pathname;
    const isProtected = PROTECTED.some((p) => path === p || path.startsWith(`${p}/`));

    if (isProtected && !user) {
      const redirect = new URL('/login', request.url);
      redirect.searchParams.set('next', path);
      return NextResponse.redirect(redirect);
    }

    // Rol admin: /admin requiere profiles.role === 'admin'.
    if (path.startsWith('/admin') && user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  return response;
}

export const config = {
  // Excluye API, estáticos, imágenes y archivos con extensión.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
