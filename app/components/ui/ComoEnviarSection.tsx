export default function ComoEnviarSection() {
  return (
    <section style={{ padding: '88px 32px' }}>
      <div style={{
        maxWidth: 1040, margin: '0 auto', display: 'grid',
        gridTemplateColumns: '1fr 1.15fr', gap: 56, alignItems: 'center',
      }}
        className="como-enviar-grid"
      >
        <div>
          <p style={{ fontFamily: 'var(--font-hand)', fontSize: 24, color: 'var(--coral)', margin: '0 0 8px' }}>
            te lo mostramos en video
          </p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,2.8vw,2.4rem)', lineHeight: 1.2, margin: '0 0 18px', color: 'var(--tinta)' }}>
            ¿Cómo enviar tus fotos?
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--texto-2)', margin: '0 0 24px' }}>
            En un minuto te enseñamos a seleccionar, enumerar y enviar tus fotos en alta calidad para que tu photobook quede perfecto.
          </p>
        </div>
        <div className="como-enviar-video" style={{
          position: 'relative', borderRadius: 24, overflow: 'hidden', aspectRatio: '16/10',
          boxShadow: '0 20px 48px rgba(75,46,26,0.2)',
        }}>
          <video
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            src="/videos/como-enviar.mp4"
            controls
            playsInline
            poster="/images/video-poster.jpg"
          />
        </div>
      </div>
      <style>{`
        .como-enviar-video { transform: rotate(1deg); transition: transform 0.3s; }
        .como-enviar-video:hover { transform: rotate(0deg); }
        @media (max-width: 900px) { .como-enviar-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
