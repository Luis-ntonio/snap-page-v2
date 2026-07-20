'use client';
import { FAQ_DEFAULT, DATOS_GENERALES } from '@/lib/data';
import type { FaqItem } from '@/types';

export default function DatosYFaqSection({ faq = FAQ_DEFAULT }: { faq?: FaqItem[] }) {
  const specs = [
    { label: 'Tamaño', value: DATOS_GENERALES.tamano },
    { label: 'Material', value: DATOS_GENERALES.material },
    { label: 'Tapa', value: DATOS_GENERALES.tapa },
    { label: 'Cantidad', value: DATOS_GENERALES.cantidad },
  ];

  return (
    <section style={{ background: 'var(--crema-2)', padding: '88px 32px' }}>
      <div style={{
        maxWidth: 1080, margin: '0 auto', display: 'grid',
        gridTemplateColumns: '1fr 1.1fr', gap: 64,
      }}
        className="datos-faq-grid"
      >
        {/* Left */}
        <div>
          <p style={{ fontFamily: 'var(--font-hand)', fontSize: 24, color: 'var(--coral)', margin: '0 0 8px' }}>lo que recibes</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.7rem,2.6vw,2.2rem)', margin: '0 0 24px', color: 'var(--tinta)' }}>Datos generales</h2>
          <div style={{ borderRadius: 20, overflow: 'hidden', height: 220, marginBottom: 26, boxShadow: '0 14px 34px rgba(75,46,26,0.16)' }}>
            <img
              src="/images/photobook-datos.jpg"
              alt="Photobook"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.style.background = 'var(--borde)'; }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {specs.map((s, i) => (
              <div key={s.label} style={{
                display: 'grid', gridTemplateColumns: '110px 1fr', gap: 12, padding: '13px 0',
                borderBottom: i < specs.length - 1 ? '1px dashed var(--borde-2)' : 'none',
              }}>
                <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: '0.04em', color: 'var(--tinta)' }}>{s.label}</span>
                <span style={{ fontSize: 13.5, color: 'var(--texto-2)' }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div>
          <p style={{ fontFamily: 'var(--font-hand)', fontSize: 24, color: 'var(--coral)', margin: '0 0 8px' }}>resolvemos tus dudas</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.7rem,2.6vw,2.2rem)', margin: '0 0 24px', color: 'var(--tinta)' }}>Preguntas frecuentes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {faq.map((q, i) => (
              <details key={q.id} open={i === 0} style={{
                background: 'var(--crema)', border: '1px solid var(--borde)', borderRadius: 16, padding: '18px 22px',
              }}>
                <summary style={{
                  fontWeight: 700, fontSize: 14.5, cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                  color: 'var(--tinta)',
                }}>
                  {q.pregunta}
                  <span style={{ color: 'var(--coral)', fontSize: 20, flexShrink: 0 }}>＋</span>
                </summary>
                <p style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--texto-2)', margin: '12px 0 0' }}>
                  {q.respuesta}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) { .datos-faq-grid { grid-template-columns: 1fr !important; gap: 40px !important; } }
      `}</style>
    </section>
  );
}
