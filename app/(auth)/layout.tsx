export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 'calc(100vh - 32px)' }} className="auth-shell">
      {/* Lado visual */}
      <div className="auth-visual" style={{
        position: 'relative', overflow: 'hidden', background: 'var(--marron)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 64,
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(251,247,242,0.06)' }} />
        <div className="auth-visual-extra" style={{ position: 'absolute', bottom: 40, left: 44, fontSize: 30, color: 'rgba(232,121,90,0.5)' }}>✳</div>
        <div style={{ position: 'relative', maxWidth: 400 }}>
          <p style={{ fontFamily: 'var(--font-hand)', fontSize: 26, color: 'var(--coral-suave)', margin: '0 0 12px', transform: 'rotate(-1.5deg)' }}>
            bienvenido de vuelta
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,3.4vw,2.9rem)', lineHeight: 1.15, color: 'var(--crema)', margin: '0 0 20px' }}>
            Tus recuerdos te estaban esperando.
          </h1>
          <p className="auth-visual-extra" style={{ fontSize: 14.5, lineHeight: 1.7, color: 'rgba(251,247,242,0.75)', margin: '0 0 36px' }}>
            Ingresa para ver tus pedidos, seguir tu photobook en producción o empezar uno nuevo.
          </p>
          <div className="auth-visual-extra" style={{ width: 230, background: '#fff', padding: '9px 9px 34px', boxShadow: '0 16px 36px rgba(0,0,0,0.28)', transform: 'rotate(-4deg)' }}>
            <div style={{ width: '100%', height: 220 }}>
              <img src="https://picsum.photos/seed/snap-login/300/300" alt="Tu foto favorita" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <p style={{ fontFamily: 'var(--font-hand)', fontSize: 21, textAlign: 'center', margin: '10px 0 0', color: 'var(--texto-2)' }}>
              tu próxima historia
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 32px', background: 'var(--crema)' }}>
        <div className="anim-fadeUp" style={{ width: '100%', maxWidth: 380 }}>
          {children}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .auth-shell { grid-template-columns: 1fr !important; min-height: auto !important; }
          .auth-visual { padding: 36px 32px !important; }
          .auth-visual-extra { display: none !important; }
        }
      `}</style>
    </div>
  );
}
