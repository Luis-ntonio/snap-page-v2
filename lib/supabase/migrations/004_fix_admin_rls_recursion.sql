-- Migración 004 — corrige recursión infinita en políticas RLS de "admin"
--
-- Bug: varias políticas hacen `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')`.
-- La política de SELECT de la propia tabla `profiles` ("Admins can view all profiles") usa ese MISMO patrón
-- consultando `profiles` sobre sí misma → cada vez que Postgres evalúa esa subconsulta, vuelve a disparar la
-- política de `profiles`, que vuelve a disparar la subconsulta... → "infinite recursion detected in policy for
-- relation profiles". Esto rompía cualquier INSERT/SELECT en pedidos/fotos_subidas/lotes/galeria/faq/
-- chatbot_faq/carpetas_admin y storage.objects (todas referencian profiles del mismo modo), y también
-- `createSignedUrl` (la política de Storage necesita evaluar SELECT sobre el objeto).
--
-- Fix estándar de Supabase: mover el chequeo de admin a una función SECURITY DEFINER. Al ejecutar con los
-- privilegios del dueño de la función (el rol que corre las migraciones, dueño de las tablas), la consulta
-- interna a `profiles` NO vuelve a evaluar RLS → rompe el ciclo.

CREATE OR REPLACE FUNCTION public.is_admin(uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = uid AND role = 'admin');
$$;

-- profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (is_admin());

-- lotes
DROP POLICY IF EXISTS "Admins can manage lotes" ON lotes;
CREATE POLICY "Admins can manage lotes" ON lotes FOR ALL USING (is_admin());

-- pedidos
DROP POLICY IF EXISTS "Admins can manage all pedidos" ON pedidos;
CREATE POLICY "Admins can manage all pedidos" ON pedidos FOR ALL USING (is_admin());

-- fotos_subidas
DROP POLICY IF EXISTS "Admins can view all fotos" ON fotos_subidas;
CREATE POLICY "Admins can view all fotos" ON fotos_subidas FOR SELECT USING (is_admin());

-- galeria
DROP POLICY IF EXISTS "Admins can manage galeria" ON galeria;
CREATE POLICY "Admins can manage galeria" ON galeria FOR ALL USING (is_admin());

-- faq
DROP POLICY IF EXISTS "Admins can manage faq" ON faq;
CREATE POLICY "Admins can manage faq" ON faq FOR ALL USING (is_admin());

-- chatbot_faq
DROP POLICY IF EXISTS "Admins can manage chatbot faq" ON chatbot_faq;
CREATE POLICY "Admins can manage chatbot faq" ON chatbot_faq FOR ALL USING (is_admin());

-- carpetas_admin
DROP POLICY IF EXISTS "Admins can manage carpetas" ON carpetas_admin;
CREATE POLICY "Admins can manage carpetas" ON carpetas_admin FOR ALL USING (is_admin());

-- storage.objects (bucket fotos-clientes, de la migración 002)
DROP POLICY IF EXISTS "Admins read all client files" ON storage.objects;
CREATE POLICY "Admins read all client files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'fotos-clientes' AND is_admin());
