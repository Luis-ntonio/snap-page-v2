-- SnapPage Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES (extends auth.users) ───────────────────────────────────────────
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  role TEXT DEFAULT 'cliente' CHECK (role IN ('cliente', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ─── LOTES ───────────────────────────────────────────────────────────────────
CREATE TABLE lotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  activo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read lotes" ON lotes FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Admins can manage lotes" ON lotes FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ─── PEDIDOS ─────────────────────────────────────────────────────────────────
CREATE TABLE pedidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero TEXT UNIQUE NOT NULL,
  usuario_id UUID NOT NULL REFERENCES profiles(id),
  plan TEXT NOT NULL CHECK (plan IN ('minimal', 'personalizado', 'tengo-mi-diseno', 'premium')),
  tematica TEXT CHECK (tematica IN ('parejas', 'cumpleanos', 'viajes', 'familia', 'otro')),
  plantilla_id TEXT,
  portada_id TEXT,
  descripcion TEXT,
  precio DECIMAL(10,2),
  estado TEXT DEFAULT 'pedido-realizado' CHECK (
    estado IN ('pedido-realizado', 'diseno', 'produccion', 'entrega', 'entregado')
  ),
  lote_id UUID REFERENCES lotes(id),
  responsable TEXT,
  nota_admin TEXT,
  canva_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own pedidos" ON pedidos FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Users can create pedidos" ON pedidos FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Admins can manage all pedidos" ON pedidos FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Auto-generate numero de pedido
CREATE OR REPLACE FUNCTION generate_pedido_numero()
RETURNS TRIGGER AS $$
BEGIN
  NEW.numero = 'SP-' || LPAD(NEXTVAL('pedido_sequence')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS pedido_sequence START 1001;
CREATE TRIGGER set_pedido_numero BEFORE INSERT ON pedidos
  FOR EACH ROW WHEN (NEW.numero IS NULL OR NEW.numero = '')
  EXECUTE FUNCTION generate_pedido_numero();

-- ─── FOTOS SUBIDAS ───────────────────────────────────────────────────────────
CREATE TABLE fotos_subidas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  url TEXT NOT NULL,
  orden INTEGER NOT NULL DEFAULT 0,
  storage_path TEXT NOT NULL,
  size_bytes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fotos_subidas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own fotos" ON fotos_subidas FOR ALL USING (
  EXISTS (SELECT 1 FROM pedidos WHERE id = pedido_id AND usuario_id = auth.uid())
);
CREATE POLICY "Admins can view all fotos" ON fotos_subidas FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ─── GALERIA ─────────────────────────────────────────────────────────────────
CREATE TABLE galeria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  imagen_url TEXT NOT NULL,
  descripcion TEXT,
  plan TEXT,
  plantilla TEXT,
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE galeria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view galeria" ON galeria FOR SELECT USING (activo = TRUE);
CREATE POLICY "Admins can manage galeria" ON galeria FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ─── FAQ ─────────────────────────────────────────────────────────────────────
CREATE TABLE faq (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pregunta TEXT NOT NULL,
  respuesta TEXT NOT NULL,
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE faq ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view faq" ON faq FOR SELECT USING (activo = TRUE);
CREATE POLICY "Admins can manage faq" ON faq FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ─── CHATBOT FAQ ─────────────────────────────────────────────────────────────
CREATE TABLE chatbot_faq (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pregunta TEXT NOT NULL,
  respuesta TEXT NOT NULL,
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chatbot_faq ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view chatbot faq" ON chatbot_faq FOR SELECT USING (activo = TRUE);
CREATE POLICY "Admins can manage chatbot faq" ON chatbot_faq FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ─── CARPETAS ADMIN ──────────────────────────────────────────────────────────
CREATE TABLE carpetas_admin (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  lote_id UUID REFERENCES lotes(id),
  tipo TEXT DEFAULT 'cliente' CHECK (tipo IN ('cliente', 'compaginados', 'portadas', 'lote')),
  parent_id UUID REFERENCES carpetas_admin(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE carpetas_admin ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage carpetas" ON carpetas_admin FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ─── STORAGE BUCKETS (run in Supabase dashboard) ──────────────────────────────
-- Create these buckets in Supabase Storage:
-- 1. "fotos-clientes" (private) - customer uploaded photos
-- 2. "archivos-admin" (private) - admin files (compaginados, portadas)
-- 3. "galeria" (public) - gallery images
-- 4. "assets" (public) - hero images, plantilla previews
-- 5. "disenos-clientes" (private) - PDFs subidos en "Tengo mi diseño" (sin login); se
--    autocrea desde /api/tengo-diseno/upload-url si no existe (ver lib/supabase/tengoDisenoStorage.ts)

-- ─── FUNCTIONS ───────────────────────────────────────────────────────────────
-- Handle new user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Fully qualified (public.profiles): el trigger corre sobre auth.users con un search_path
  -- que no incluye "public" por defecto, así que "profiles" a secas no resuelve.
  INSERT INTO public.profiles (id, nombre, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update updated_at on pedidos
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pedidos_updated_at BEFORE UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── SEED DATA ────────────────────────────────────────────────────────────────
-- Insert default FAQ
INSERT INTO faq (pregunta, respuesta, orden) VALUES
  ('¿Hacen delivery?', '¡Sí! El envío a domicilio tiene un costo adicional entre 10 a 15 soles según distrito. Puedes recoger de forma gratuita en la estación Matellini previa coordinación.', 1),
  ('¿En cuánto tiempo llega mi libro?', 'El tiempo de elaboración es de una semana. Las entregas son los días domingos.', 2),
  ('¿Puedo realizarlo con plastificado mate?', 'Sí, con un precio adicional de 10 soles.', 3),
  ('¿Y si quiero más páginas?', 'Puedes realizarlo con un precio adicional. ¡Escríbenos y cotiza!', 4);

-- Insert default chatbot FAQ
INSERT INTO chatbot_faq (pregunta, respuesta, orden) VALUES
  ('¿Cuánto demora?', 'Una semana.', 1),
  ('¿Dónde están?', 'Nos ubicamos en Chorrillos. Hacemos delivery a todo Lima. También hacemos envíos con Olva y Shalom. Puedes recoger de forma gratuita en Chorrillos previa coordinación.', 2),
  ('¿Cómo pago?', 'Aceptamos transferencia, Yape y Plin.', 3);

-- Insert initial lote
INSERT INTO lotes (nombre, fecha_inicio, fecha_fin, activo) VALUES
  ('Lote 13-19 julio', '2025-07-13', '2025-07-19', TRUE);
