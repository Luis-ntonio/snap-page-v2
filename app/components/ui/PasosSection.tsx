import { PASOS } from '@/lib/data';

export default function PasosSection() {
  return (
    <section style={{ background: 'var(--marron)', padding: '80px 32px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -40, left: -40, fontSize: 120, color: 'rgba(251,247,242,0.06)', fontFamily: 'var(--font-display)' }}>✳</div>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <p style={{ fontFamily: 'var(--font-hand)', fontSize: 24, color: 'var(--coral-suave)', textAlign: 'center', margin: '0 0 8px' }}>
          sin complicaciones
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.9rem,3vw,2.5rem)', color: 'var(--crema)', textAlign: 'center', margin: '0 0 56px' }}>
          Así de sencillo
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 36 }} className="pasos-grid">
          {PASOS.map(p => (
            <div key={p.numero} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-hand)', fontSize: 52, color: 'var(--coral)', lineHeight: 1 }}>
                {p.numero.replace('.', '')}
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--crema)', margin: '12px 0 8px', letterSpacing: '0.04em' }}>
                {p.titulo}
              </h3>
              <p style={{ fontSize: 13, lineHeight: 1.65, color: 'rgba(251,247,242,0.72)', margin: 0 }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) { .pasos-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 640px) { .pasos-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
