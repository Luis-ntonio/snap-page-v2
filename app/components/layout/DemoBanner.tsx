'use client';
import { useDemo } from '@/lib/demo';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function DemoBanner() {
  const { demoUser, demoLogin, demoLogout } = useDemo();
  const { signOut } = useAuth();
  const router = useRouter();

  const login = (role: 'cliente' | 'admin') => {
    demoLogin(role);
    router.push(role === 'admin' ? '/admin' : '/mi-cuenta');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: 32,
      background: '#FBBF24',
      color: '#78350F',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      zIndex: 60,
      fontFamily: 'Raleway, sans-serif',
      fontSize: 11,
      fontWeight: 600,
    }}>
      <span>🧪 MODO DEMO</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {demoUser ? (
          <>
            <span style={{ opacity: 0.8 }}>
              Sesión: <strong>{demoUser.nombre}</strong> ({demoUser.role})
            </span>
            <button onClick={() => { demoLogout(); signOut(); router.push('/'); }} style={{
              background: '#92400E', color: 'white', border: 'none', borderRadius: 20,
              padding: '2px 10px', fontSize: 10, fontWeight: 700, cursor: 'pointer',
            }}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <span style={{ opacity: 0.8 }}>Probar como:</span>
            <button onClick={() => login('cliente')} style={{
              background: 'white', color: '#78350F', border: 'none', borderRadius: 20,
              padding: '2px 10px', fontSize: 10, fontWeight: 700, cursor: 'pointer',
            }}>
              👤 Cliente
            </button>
            <button onClick={() => login('admin')} style={{
              background: '#92400E', color: 'white', border: 'none', borderRadius: 20,
              padding: '2px 10px', fontSize: 10, fontWeight: 700, cursor: 'pointer',
            }}>
              🔧 Admin
            </button>
          </>
        )}
      </div>
    </div>
  );
}
