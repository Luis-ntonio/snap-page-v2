'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', border: '1.5px solid var(--borde-2)', borderRadius: 14,
  padding: '15px 18px', fontSize: 14, fontFamily: 'var(--font-body)', background: '#fff', outline: 'none',
  transition: 'border-color 0.2s',
};

export default function ResetPasswordPage() {
  const [supabase] = useState(() => createClient());
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  // El enlace del correo trae el token de recuperación en la URL; el cliente de Supabase lo
  // detecta solo y abre una sesión temporal (evento PASSWORD_RECOVERY) — no hay nada que leer
  // de la URL a mano aquí, solo esperar a que esa sesión aparezca.
  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      if (data.session) setReady(true);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) { setReady(true); setChecking(false); }
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) { setError(error.message); return; }
    setDone(true);
  };

  return (
    <div>
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 6, justifyContent: 'center', marginBottom: 36 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--marron)' }}>Snap</span>
        <span style={{ color: 'var(--coral)', fontSize: 19 }}>✳</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--tinta)' }}>Page</span>
      </Link>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, textAlign: 'center', margin: '0 0 8px', color: 'var(--tinta)' }}>Nueva contraseña</h2>

      {checking ? (
        <p style={{ fontSize: 13.5, color: 'var(--texto-3)', textAlign: 'center', margin: '30px 0' }}>Verificando enlace...</p>
      ) : done ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
          <p style={{ color: 'var(--verde-ok)', fontSize: 14, fontWeight: 600, margin: '0 0 16px' }}>Tu contraseña se actualizó.</p>
          <Link href="/" style={{ color: 'var(--marron)', fontSize: 13, textDecoration: 'none' }}>Ir al inicio</Link>
        </div>
      ) : !ready ? (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 13.5, color: 'var(--texto-3)', margin: '0 0 16px' }}>
            Este enlace no es válido o ya expiró. Pide uno nuevo.
          </p>
          <Link href="/forgot-password" style={{ color: 'var(--marron)', fontSize: 13, textDecoration: 'none' }}>Volver a solicitar el enlace</Link>
        </div>
      ) : (
        <>
          <p style={{ fontSize: 13.5, color: 'var(--texto-3)', textAlign: 'center', margin: '0 0 30px' }}>Elige tu nueva contraseña</p>
          {error && <p style={{ fontSize: 12, color: '#c0392b', textAlign: 'center', margin: '0 0 16px', background: '#FBEAEA', padding: '8px 12px', borderRadius: 10 }}>{error}</p>}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input type="password" required placeholder="Nueva contraseña" value={password} onChange={e => setPassword(e.target.value)}
              autoComplete="new-password" autoCapitalize="none" autoCorrect="off" spellCheck={false}
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--coral)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--borde-2)')} />
            <input type="password" required placeholder="Repite la contraseña" value={confirm} onChange={e => setConfirm(e.target.value)}
              autoComplete="new-password" autoCapitalize="none" autoCorrect="off" spellCheck={false}
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--coral)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--borde-2)')} />
            <button type="submit" disabled={saving} className="btn-primary" style={{ background: 'var(--marron)', border: 'none', width: '100%', padding: '16px 0' }}>
              {saving ? 'Guardando...' : 'GUARDAR CONTRASEÑA'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
