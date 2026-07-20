-- Migración 003 — corrige handle_new_user()
-- Bug: el trigger corre sobre auth.users con un search_path que no incluye "public",
-- así que "profiles" sin calificar no resolvía → signUp fallaba con
-- "Database error saving new user" (500) en /auth/v1/signup.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
