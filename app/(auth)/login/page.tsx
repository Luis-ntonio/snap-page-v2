'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDemo } from '@/lib/demo';
import { useAuth } from '@/lib/auth';

// Lee ?next= desde la URL en el momento de la acción (sin useSearchParams → sin requisito de Suspense).
const getNext = (fallback = '/mi-cuenta') =>
  (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('next')) || fallback;

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', border: '1.5px solid var(--borde-2)', borderRadius: 14,
  padding: '15px 18px', fontSize: 14, fontFamily: 'var(--font-body)', background: '#fff', outline: 'none',
  transition: 'border-color 0.2s',
};

export default function LoginPage() {
  const router = useRouter();
  const { demoLogin } = useDemo();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) { setError(error); return; }
    router.push(getNext());
  };

  const loginDemo = (role: 'cliente' | 'admin') => {
    demoLogin(role);
    router.push(role === 'admin' ? '/admin' : getNext());
  };

  return (
    <div>
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 6, justifyContent: 'center', marginBottom: 36 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--marron)' }}>Snap</span>
        <span style={{ color: 'var(--coral)', fontSize: 19 }}>✳</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--tinta)' }}>Page</span>
      </Link>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, textAlign: 'center', margin: '0 0 8px', color: 'var(--tinta)' }}>Iniciar sesión</h2>
      <p style={{ fontSize: 13.5, color: 'var(--texto-3)', textAlign: 'center', margin: '0 0 30px' }}>Ingresa para continuar con tu pedido</p>

      {error && <p style={{ fontSize: 12, color: '#c0392b', textAlign: 'center', margin: '0 0 16px', background: '#FBEAEA', padding: '8px 12px', borderRadius: 10 }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <input type="email" required placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)}
          style={inputStyle}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--coral)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--borde-2)')} />
        <input type="password" required placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)}
          style={inputStyle}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--coral)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--borde-2)')} />
        <button type="submit" disabled={loading} className="btn-primary" style={{ background: 'var(--marron)', border: 'none', width: '100%', padding: '16px 0' }}>
          {loading ? 'Ingresando...' : 'INGRESAR'}
        </button>
      </form>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 }}>
        <Link href="/forgot-password" style={{ fontSize: 12, textDecoration: 'none', color: 'var(--texto-3)' }}>¿Olvidaste tu contraseña?</Link>
        <Link href="/register" style={{ fontSize: 12, fontWeight: 800, textDecoration: 'none', color: 'var(--coral)' }}>Crear cuenta</Link>
      </div>

      {/* ── Acceso demo (entorno de prueba) ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '30px 0 20px' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--borde)' }} />
        <span style={{ fontFamily: 'var(--font-hand)', fontSize: 18, color: 'var(--texto-3)' }}>¿solo explorando?</span>
        <div style={{ flex: 1, height: 1, background: 'var(--borde)' }} />
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => loginDemo('cliente')} className="btn-outline" style={{ flex: 1, padding: '13px 0' }}>
          Entrar como cliente
        </button>
        <button onClick={() => loginDemo('admin')} className="btn-outline" style={{ flex: 1, padding: '13px 0' }}>
          Entrar como admin
        </button>
      </div>
      <p style={{ fontSize: 11, color: 'var(--texto-3)', textAlign: 'center', margin: '16px 0 0' }}>
        El modo demo usa datos ficticios que no se guardan
      </p>
    </div>
  );
}
