'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', border: '1.5px solid var(--borde-2)', borderRadius: 14,
  padding: '15px 18px', fontSize: 14, fontFamily: 'var(--font-body)', background: '#fff', outline: 'none',
  transition: 'border-color 0.2s',
};

const focusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = 'var(--coral)'),
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = 'var(--borde-2)'),
};

export default function RegisterPage() {
  const supabase = createClient();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== password2) { setError('Las contraseñas no coinciden'); return; }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre, telefono } },
    });

    if (error) setError(error.message);
    else setSuccess('¡Cuenta creada! Revisa tu correo para confirmar tu cuenta.');
    setLoading(false);
  };

  return (
    <div>
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 6, justifyContent: 'center', marginBottom: 36 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--marron)' }}>Snap</span>
        <span style={{ color: 'var(--coral)', fontSize: 19 }}>✳</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--tinta)' }}>Page</span>
      </Link>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, textAlign: 'center', margin: '0 0 8px', color: 'var(--tinta)' }}>Crear cuenta</h2>
      <p style={{ fontSize: 13.5, color: 'var(--texto-3)', textAlign: 'center', margin: '0 0 30px' }}>Regístrate para hacer seguimiento de tus pedidos</p>

      {error && <p style={{ fontSize: 12, color: '#c0392b', textAlign: 'center', margin: '0 0 16px', background: '#FBEAEA', padding: '8px 12px', borderRadius: 10 }}>{error}</p>}

      {success ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>✉️</div>
          <p style={{ color: 'var(--verde-ok)', fontSize: 14, fontWeight: 600, margin: '0 0 8px' }}>{success}</p>
          <p style={{ color: 'var(--texto-3)', fontSize: 12, margin: '0 0 16px' }}>También puedes ingresar directamente si ya confirmaste</p>
          <Link href="/login" className="btn-primary" style={{ display: 'flex', background: 'var(--marron)', width: '100%', padding: '14px 0' }}>
            Ir a iniciar sesión
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input type="text" required placeholder="Tu nombre" value={nombre} onChange={e => setNombre(e.target.value)} style={inputStyle} {...focusHandlers} />
          <input type="email" required placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} {...focusHandlers} />
          <input type="tel" placeholder="Celular (opcional)" value={telefono} onChange={e => setTelefono(e.target.value)} style={inputStyle} {...focusHandlers} />
          <input type="password" required placeholder="Contraseña (mín. 6 caracteres)" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} {...focusHandlers} />
          <input type="password" required placeholder="Repetir contraseña" value={password2} onChange={e => setPassword2(e.target.value)} style={inputStyle} {...focusHandlers} />
          <button type="submit" disabled={loading} className="btn-primary" style={{ background: 'var(--marron)', border: 'none', width: '100%', padding: '16px 0' }}>
            {loading ? 'Creando cuenta...' : 'CREAR CUENTA'}
          </button>
        </form>
      )}

      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--texto-3)', marginTop: 24 }}>
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" style={{ color: 'var(--coral)', fontWeight: 800, textDecoration: 'none' }}>Ingresar</Link>
      </p>
    </div>
  );
}
