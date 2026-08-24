-- Migración 006 — canal de pedido + pedidos manuales por WhatsApp + dirección de envío
-- Aditiva sobre schema.sql + migraciones 002-005. Correr en Supabase SQL Editor.

-- ─── PEDIDOS: canal de origen + pedido manual sin cuenta ──────────────────────
-- usuario_id pasa a ser opcional: un pedido cargado a mano por el admin (alguien que solo
-- escribió por WhatsApp, sin cuenta en el sitio) no tiene un usuario real al que asociarse.
ALTER TABLE pedidos ALTER COLUMN usuario_id DROP NOT NULL;

ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS canal TEXT DEFAULT 'web' CHECK (canal IN ('web', 'whatsapp'));
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS cliente_nombre_manual TEXT;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS cliente_telefono_manual TEXT;

-- Las políticas existentes de pedidos no necesitan cambiar: "Users can view/create own" comparan
-- auth.uid() = usuario_id, que nunca hace match con una fila usuario_id = NULL (correcto — un pedido
-- manual no le pertenece a ningún cliente logueado); "Admins can manage all" ya cubre lectura/escritura
-- completa vía is_admin().

-- ─── PROFILES: dirección de envío ──────────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS distrito TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS direccion TEXT;

-- ─── FIX: handle_new_user() no copiaba telefono (bug previo) ni distrito/direccion ────
-- Antes (migración 003) solo copiaba id/nombre/email — el campo "Celular" del formulario de
-- registro se recolectaba pero nunca llegaba a profiles.telefono. Se corrige de paso.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre, email, telefono, distrito, direccion)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario'),
    NEW.email,
    NEW.raw_user_meta_data->>'telefono',
    NEW.raw_user_meta_data->>'distrito',
    NEW.raw_user_meta_data->>'direccion'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
