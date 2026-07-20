'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutList, Image as ImageIcon, Folder, MessageCircle } from 'lucide-react';
import { useDemo } from '@/lib/demo';
import { useAuth } from '@/lib/auth';

const NAV = [
  { href: '/admin', label: 'PEDIDOS', icon: LayoutList },
  { href: '/admin/fotos', label: 'FOTOS', icon: ImageIcon },
  { href: '/admin/carpetas', label: 'CARPETAS', icon: Folder },
  { href: '/admin/chatbot', label: 'CHATBOT', icon: MessageCircle },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { demoUser, demoLogout } = useDemo();
  const { user, isAdmin, loading, signOut } = useAuth();
  const [checked, setChecked] = useState(false);

  // Admin real (Supabase) si hay sesión real; si no, cae al modo demo (role==='admin').
  const esAdmin = user ? isAdmin : demoUser?.role === 'admin';

  useEffect(() => {
    if (loading) return; // esperar a que AuthProvider resuelva la sesión real antes de decidir
    const t = setTimeout(() => {
      if (!esAdmin) { router.push('/'); return; }
      setChecked(true);
    }, 0);
    return () => clearTimeout(t);
  }, [loading, esAdmin]);

  const salir = async () => {
    await signOut();
    demoLogout();
    router.push('/');
  };

  if (!checked) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ width: 28, height: 28, border: '2px solid var(--marron)', borderTopColor: 'transparent', borderRadius: '50%' }} className="anim-spin" />
      <style>{`.anim-spin { animation: spin 0.7s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const nombreAdmin = user?.nombre ?? demoUser?.nombre ?? 'Admin';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside className="admin-sidebar" style={{
        width: 220, background: 'var(--tinta)', display: 'flex', flexDirection: 'column',
        flexShrink: 0, position: 'sticky', top: 0, height: '100vh', boxSizing: 'border-box',
      }}>
        <div style={{ padding: '26px 24px 22px', borderBottom: '1px solid rgba(251,247,242,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: '#F6E3D5' }}>Snap</span>
            <span style={{ color: 'var(--coral)', fontSize: 14 }}>✳</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: '#FBF7F2' }}>Page</span>
          </div>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', color: '#8A7568', margin: '8px 0 0' }}>PANEL ADMIN</p>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '18px 14px', flex: 1 }}>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} style={{
                display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em',
                color: active ? '#FBF7F2' : '#8A7568', background: active ? 'rgba(232,121,90,0.22)' : 'transparent',
                borderRadius: 12, padding: '13px 16px', textDecoration: 'none', transition: 'all 0.2s',
              }}>
                <Icon size={15} />{label}
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: '18px 24px', borderTop: '1px solid rgba(251,247,242,0.1)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', background: 'var(--coral)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#FBF7F2', flexShrink: 0,
          }}>
            {nombreAdmin[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 12.5, fontWeight: 700, color: '#F6E3D5', margin: 0 }}>{nombreAdmin}</p>
            <button onClick={salir} style={{ fontSize: 11, background: 'none', border: 'none', cursor: 'pointer', color: '#8A7568', padding: 0 }}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="admin-mobile-nav" style={{
        display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'var(--tinta)', padding: '8px 6px', justifyContent: 'space-around', alignItems: 'center',
      }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textDecoration: 'none',
              color: active ? 'var(--coral)' : '#8A7568', fontSize: 9, fontWeight: 700,
            }}>
              <Icon size={18} />{label}
            </Link>
          );
        })}
        <button onClick={salir} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: 'none', border: 'none', color: '#8A7568', fontSize: 9, fontWeight: 700, cursor: 'pointer' }}>
          Salir
        </button>
      </nav>

      {/* Content */}
      <main className="admin-main" style={{ flex: 1, minWidth: 0, padding: '32px 36px 48px', boxSizing: 'border-box', overflowX: 'auto' }}>
        {children}
      </main>

      <style>{`
        @media (max-width: 900px) {
          .admin-sidebar { display: none !important; }
          .admin-mobile-nav { display: flex !important; }
          .admin-main { padding: 20px 16px 76px !important; }
        }
      `}</style>
    </div>
  );
}
