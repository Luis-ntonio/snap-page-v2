-- Migración 005 — Buckets públicos de medios (assets, galería)
-- Aditiva sobre schema.sql + migraciones 002-004. Correr en Supabase SQL Editor.
--
-- Permite reemplazar imágenes/video de marketing (Hero, Carrusel, Planes, "Cómo enviar",
-- Plantillas, Galería) desde /admin/contenido, sin redeploy. Los "espacios" fijos están
-- definidos en código (lib/mediaSlots.ts); la Galería usa la tabla `galeria` que ya existía
-- en schema.sql pero nunca estuvo conectada a Storage.
--
-- Ambos buckets son públicos (contenido de marketing, sin datos sensibles): la lectura no
-- necesita política — Supabase sirve objetos de un bucket público sin pasar por RLS —, pero
-- se agrega igual una policy de SELECT para que el propio SDK del admin pueda listar/leer
-- metadatos sin fricción. La escritura queda protegida con is_admin() (ver migración 004:
-- reemplaza el patrón viejo `EXISTS (SELECT ... FROM profiles ...)` para evitar la recursión
-- infinita que rompía RLS).

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('assets', 'assets', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('galeria', 'galeria', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- ─── Lectura pública ───────────────────────────────────────────────────────────
CREATE POLICY "Public can view assets objects"
  ON storage.objects FOR SELECT USING (bucket_id = 'assets');

CREATE POLICY "Public can view galeria objects"
  ON storage.objects FOR SELECT USING (bucket_id = 'galeria');

-- ─── Escritura solo admin ──────────────────────────────────────────────────────
CREATE POLICY "Admins manage assets objects - insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'assets' AND is_admin());

CREATE POLICY "Admins manage assets objects - update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'assets' AND is_admin());

CREATE POLICY "Admins manage assets objects - delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'assets' AND is_admin());

CREATE POLICY "Admins manage galeria objects - insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'galeria' AND is_admin());

CREATE POLICY "Admins manage galeria objects - update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'galeria' AND is_admin());

CREATE POLICY "Admins manage galeria objects - delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'galeria' AND is_admin());
