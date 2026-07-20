-- Migración 002 — Editor de álbum + Storage
-- Aditiva sobre lib/supabase/schema.sql. Correr en Supabase SQL Editor.

-- ─── PEDIDOS: campos del editor ───────────────────────────────────────────────
-- layout: asignación foto→slot por página (JSON del AlbumEditor).
-- pdf_path: ruta del PDF compuesto en el bucket privado 'fotos-clientes'.
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS layout JSONB;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS pdf_path TEXT;

-- ─── STORAGE: bucket privado de fotos y PDFs de clientes ──────────────────────
-- Estructura tipo Drive: fotos-clientes/{usuario_id}/{pedido_id}/{archivo}
INSERT INTO storage.buckets (id, name, public)
VALUES ('fotos-clientes', 'fotos-clientes', false)
ON CONFLICT (id) DO NOTHING;

-- El dueño (usuario autenticado) gestiona SOLO su propia carpeta {usuario_id}/...
-- La primera carpeta de la ruta (name split por '/') debe ser su auth.uid().
CREATE POLICY "Users manage own folder - select"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'fotos-clientes' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users manage own folder - insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'fotos-clientes' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users manage own folder - update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'fotos-clientes' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users manage own folder - delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'fotos-clientes' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Los admins pueden leer TODAS las carpetas (vista Drive del panel).
CREATE POLICY "Admins read all client files"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'fotos-clientes'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
