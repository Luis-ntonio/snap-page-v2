// Bucket público de recursos de marketing (Hero, Carrusel, Planes, video, Plantillas).
// Administrable desde /admin/contenido — ver lib/mediaSlots.ts para la lista de espacios.
const BUCKET_ASSETS = 'assets';

/**
 * URL pública y determinística de un archivo del bucket `assets`. Es solo una plantilla de
 * string (sin llamada de red), así que funciona igual en Server y Client Components.
 */
export const mediaUrl = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET_ASSETS}/${path}`;
