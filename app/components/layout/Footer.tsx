import Link from 'next/link';
import { WHATSAPP, EMAIL_ADMIN } from '@/lib/data';

const footerLink: React.CSSProperties = {
  fontSize: 13,
  textDecoration: 'none',
  color: '#CBB9AB',
};

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--tinta)',
      color: '#CBB9AB',
      padding: '56px 32px 32px',
      fontFamily: 'var(--font-body)',
    }}>
      <div style={{ maxWidth: 1140, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr 1fr',
          gap: 48,
          paddingBottom: 40,
          borderBottom: '1px solid rgba(251,247,242,0.12)',
        }}
          className="footer-grid"
        >
          <div>
            <Link href="/" style={{ display: 'flex', alignItems: 'baseline', gap: 6, textDecoration: 'none', marginBottom: 14 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: '#F6E3D5' }}>Snap</span>
              <span style={{ color: 'var(--coral)', fontSize: 16 }}>✳</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--crema)' }}>Page</span>
            </Link>
            <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0, maxWidth: 280, color: 'var(--texto-3)' }}>
              Photobooks personalizados hechos a mano en Lima. Pequeñas revistas de tu propia vida.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', color: '#F6E3D5', margin: '0 0 4px' }}>EXPLORA</p>
            <Link href="/planes" style={footerLink}>Planes</Link>
            <Link href="/plantillas" style={footerLink}>Plantillas</Link>
            <Link href="/galeria" style={footerLink}>Galería</Link>
            <Link href="/mi-cuenta" style={footerLink}>Mi cuenta</Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', color: '#F6E3D5', margin: '0 0 4px' }}>CONTACTO</p>
            <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" style={footerLink}>
              WhatsApp · {WHATSAPP.replace(/^51/, '').replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')}
            </a>
            <a href={`mailto:${EMAIL_ADMIN}`} style={footerLink}>{EMAIL_ADMIN}</a>
            <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
              <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#CBB9AB' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a href="https://tiktok.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#CBB9AB' }}>
                <svg width="19" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.2 8.2 0 004.79 1.53V6.76a4.85 4.85 0 01-1.02-.07z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <p style={{ fontSize: 12, color: '#8A7568', margin: '24px 0 0', textAlign: 'center' }}>
          © {new Date().getFullYear()} Snap Page · Lima, Perú
        </p>
      </div>
      <style>{`
        @media (max-width: 640px) {
          .footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </footer>
  );
}
