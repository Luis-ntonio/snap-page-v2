'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDemo } from '@/lib/demo';
import { useAuth } from '@/lib/auth';

const linkStyle = (active: boolean): React.CSSProperties => ({
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: 12,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: active ? 'var(--tinta)' : 'var(--texto-3)',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
});

const NAV_LEFT = [
  { href: '/', label: 'INICIO' },
  { href: '/planes', label: 'PLANES' },
  { href: '/plantillas', label: 'PLANTILLAS' },
];

const NAV_RIGHT = [
  { href: '/galeria', label: 'GALERÍA' },
];

export default function Navbar() {
  const { demoUser } = useDemo();
  const { user } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Sesión efectiva: usuario real de Supabase si existe, si no el usuario demo.
  const sesion = user ?? demoUser;

  const sesionLink = sesion
    ? { href: sesion.role === 'admin' ? '/admin' : '/mi-cuenta', label: sesion.role === 'admin' ? 'ADMIN' : 'MI CUENTA' }
    : { href: '/login', label: 'INGRESAR' };

  const allLinks = [...NAV_LEFT, ...NAV_RIGHT, sesionLink];

  return (
    <>
      {/* Announcement bar — en flujo normal, se desplaza con el scroll */}
      <div style={{
        background: 'var(--marron)',
        color: '#F6E3D5',
        fontFamily: 'var(--font-body)',
        fontSize: 11.5,
        fontWeight: 600,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        textAlign: 'center',
        padding: '9px 16px',
      }}>
        Entrega en 1 semana &nbsp;·&nbsp; Recojo gratis en Matellini &nbsp;·&nbsp; Delivery a todo Lima
      </div>

      <header style={{
        position: 'sticky',
        top: 32, // debajo del DemoBanner fijo (32px)
        background: 'rgba(251,247,242,0.92)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--borde)',
        zIndex: 50,
      }}>
        <div style={{
          maxWidth: 1140,
          margin: '0 auto',
          height: 64,
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
        }}>
          {/* Left */}
          <nav style={{ display: 'none', gap: 32, flex: 1 }} className="nav-desktop">
            {NAV_LEFT.map(l => (
              <Link key={l.href} href={l.href} style={linkStyle(pathname === l.href)}>{l.label}</Link>
            ))}
          </nav>

          {/* Center logo — absolutely centered */}
          <Link href="/" style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'baseline',
            gap: 6,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--marron)' }}>Snap</span>
            <span style={{ color: 'var(--coral)', fontSize: 18 }}>✳</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--tinta)' }}>Page</span>
          </Link>

          {/* Right */}
          <nav style={{ display: 'none', gap: 28, flex: 1, justifyContent: 'flex-end', alignItems: 'center' }} className="nav-desktop">
            {NAV_RIGHT.map(l => (
              <Link key={l.href} href={l.href} style={linkStyle(pathname === l.href)}>{l.label}</Link>
            ))}
            <Link href={sesionLink.href} style={linkStyle(pathname === sesionLink.href)}>{sesionLink.label}</Link>
            <Link href="/planes" style={{
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textDecoration: 'none',
              color: 'var(--crema)',
              background: 'var(--marron)',
              padding: '10px 20px',
              borderRadius: 999,
              transition: 'background 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--coral)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--marron)'; }}
            >
              CREA EL TUYO
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            aria-label="Abrir menú"
            onClick={() => setOpen(v => !v)}
            className="nav-mobile-toggle"
            style={{
              display: 'flex',
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
              flexDirection: 'column',
              gap: 5,
            }}
          >
            <span style={{ width: 22, height: 2, background: 'var(--tinta)', display: 'block' }} />
            <span style={{ width: 22, height: 2, background: 'var(--tinta)', display: 'block' }} />
            <span style={{ width: 22, height: 2, background: 'var(--tinta)', display: 'block' }} />
          </button>
        </div>

        {/* Mobile slide panel */}
        {open && (
          <div style={{
            borderTop: '1px solid var(--borde)',
            background: 'var(--crema)',
            padding: '16px 32px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}>
            {allLinks.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} style={linkStyle(pathname === l.href)}>
                {l.label}
              </Link>
            ))}
            <Link href="/planes" onClick={() => setOpen(false)} style={{
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textDecoration: 'none',
              color: 'var(--crema)',
              background: 'var(--marron)',
              padding: '12px 20px',
              borderRadius: 999,
              textAlign: 'center',
            }}>
              CREA EL TUYO
            </Link>
          </div>
        )}
      </header>

      <style>{`
        @media (min-width: 900px) {
          .nav-desktop { display: flex !important; }
          .nav-mobile-toggle { display: none !important; }
        }
      `}</style>
    </>
  );
}
