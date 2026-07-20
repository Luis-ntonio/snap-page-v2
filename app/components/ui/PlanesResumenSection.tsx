import Link from 'next/link';
import { PLAN_LABELS, PLAN_PRICES, type Plan } from '@/types';

const RESUMEN: { id: Plan; desc: string; cta: string; seed: string }[] = [
  { id: 'minimal', desc: 'Una foto por página, 20 fotos en total. Simple, limpio y directo al corazón.', cta: 'EMPEZAR', seed: 'plan-minimal' },
  { id: 'personalizado', desc: 'Arma tu álbum online con nuestras plantillas: 40–60 fotos, frases propias y vista previa al instante.', cta: 'DISEÑAR ONLINE', seed: 'plan-pers' },
  { id: 'tengo-mi-diseno', desc: '¿Ya lo tienes listo en Canva o PDF? Envíanoslo en A4 (20 páginas) y lo imprimimos por ti.', cta: 'SUBIR MI PDF', seed: 'plan-tengo' },
  { id: 'premium', desc: 'Videollamada con nuestra diseñadora para crear juntos un álbum sin límites de elementos.', cta: 'AGENDAR CITA', seed: 'plan-premium' },
];

export default function PlanesResumenSection() {
  return (
    <section id="planes" style={{ padding: '0 32px 96px' }}>
      <div style={{ maxWidth: 1140, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', marginBottom: 36, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-hand)', fontSize: 24, color: 'var(--coral)', margin: '0 0 6px' }}>elige tu camino</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.9rem,3vw,2.5rem)', margin: 0, color: 'var(--tinta)' }}>Un plan para cada historia</h2>
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--texto-3)', margin: 0 }}>Todos incluyen tapa dura A4 · 20 páginas</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 22 }} className="planes-resumen-grid">
          {RESUMEN.map(plan => {
            const destacado = plan.id === 'personalizado';
            return (
              <Link key={plan.id} href="/planes" style={{
                background: '#fff',
                border: destacado ? '2px solid var(--coral)' : '1px solid var(--borde)',
                borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column',
                position: 'relative', textDecoration: 'none', transition: 'transform 0.25s, box-shadow 0.25s',
              }}
                className="plan-resumen-card"
              >
                {destacado && (
                  <span style={{
                    position: 'absolute', top: 14, right: 14, background: 'var(--coral)', color: '#fff',
                    fontSize: 10.5, fontWeight: 800, letterSpacing: '0.1em', padding: '5px 10px',
                    borderRadius: 999, zIndex: 2, whiteSpace: 'nowrap',
                  }}>
                    EL MÁS PEDIDO
                  </span>
                )}
                <div style={{ height: 170, background: 'var(--crema-2)' }}>
                  <img
                    src={`https://picsum.photos/seed/${plan.seed}/400/300`}
                    alt={PLAN_LABELS[plan.id]}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
                <div style={{ padding: '22px 22px 26px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 19, margin: 0, color: 'var(--marron)' }}>{PLAN_LABELS[plan.id]}</h3>
                    <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--tinta)', whiteSpace: 'nowrap' }}>{PLAN_PRICES[plan.id]}</span>
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--texto-2)', margin: 0, flex: 1 }}>{plan.desc}</p>
                  <span style={{
                    fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', textAlign: 'center',
                    borderRadius: 999, padding: '11px 0',
                    color: destacado ? '#fff' : 'var(--marron)',
                    background: destacado ? 'var(--coral)' : 'transparent',
                    border: destacado ? 'none' : '1.5px solid #E4D5C5',
                  }}>
                    {plan.cta}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <style>{`
        .plan-resumen-card:hover { transform: translateY(-8px); box-shadow: 0 20px 44px rgba(75,46,26,0.16); }
        @media (max-width: 900px) { .planes-resumen-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 640px) { .planes-resumen-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
