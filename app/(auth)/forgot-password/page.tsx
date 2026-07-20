'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', border: '1.5px solid var(--borde-2)', borderRadius: 14,
  padding: '15px 18px', fontSize: 14, fontFamily: 'var(--font-body)', background: '#fff', outline: 'none',
  transition: 'border-color 0.2s',
};

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    });
    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  };

  return (
    <div>
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 6, justifyContent: 'center', marginBottom: 36 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--marron)' }}>Snap</span>
        <span style={{ color: 'var(--coral)', fontSize: 19 }}>✳</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--tinta)' }}>Page</span>
      </Link>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, textAlign: 'center', margin: '0 0 8px', color: 'var(--tinta)' }}>Recuperar contraseña</h2>
      <p style={{ fontSize: 13.5, color: 'var(--texto-3)', textAlign: 'center', margin: '0 0 30px' }}>Te enviamos un enlace a tu correo</p>

      {error && <p style={{ fontSize: 12, color: '#c0392b', textAlign: 'center', margin: '0 0 16px', background: '#FBEAEA', padding: '8px 12px', borderRadius: 10 }}>{error}</p>}

      {sent ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📬</div>
          <p style={{ color: 'var(--verde-ok)', fontSize: 14, fontWeight: 600, margin: '0 0 16px' }}>¡Enlace enviado! Revisa tu correo.</p>
          <Link href="/login" style={{ color: 'var(--marron)', fontSize: 13, textDecoration: 'none' }}>Volver a iniciar sesión</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input type="email" required placeholder="Tu correo electrónico" value={email} onChange={e => setEmail(e.target.value)}
            style={inputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--coral)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--borde-2)')} />
          <button type="submit" disabled={loading} className="btn-primary" style={{ background: 'var(--marron)', border: 'none', width: '100%', padding: '16px 0' }}>
            {loading ? 'Enviando...' : 'ENVIAR ENLACE'}
          </button>
        </form>
      )}
      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--texto-3)', marginTop: 16 }}>
        <Link href="/login" style={{ color: 'var(--marron)', textDecoration: 'none' }}>← Volver</Link>
      </p>
    </div>
  );
}
