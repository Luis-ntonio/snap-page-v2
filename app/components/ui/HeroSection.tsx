import Link from 'next/link';

const polaroids = [
  { id: 1, seed: 'snap-hero-1', caption: 'nuestro aniversario', top: 18, left: '8%', right: undefined, w: 240, h: 250, rotate: -7, z: 1 },
  { id: 2, seed: 'snap-hero-2', caption: 'Cusco 2025', top: 120, left: undefined, right: 0, w: 230, h: 240, rotate: 5, z: 2 },
  { id: 3, seed: 'snap-hero-3', caption: 'los domingos en casa', top: undefined, left: '22%', right: undefined, w: 190, h: 190, rotate: -2, z: 3 },
];

export default function HeroSection() {
  return (
    <section style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: -70, right: -70, width: 340, height: 340,
        borderRadius: '50%', background: '#F3E3D7', opacity: 0.7,
      }} />
      <div style={{ position: 'absolute', bottom: 40, left: '44%', fontSize: 28, color: 'var(--coral)', opacity: 0.5 }}>✳</div>

      <div style={{
        maxWidth: 1140, margin: '0 auto', padding: '72px 32px 88px',
        display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 48,
        alignItems: 'center', position: 'relative',
      }}
        className="hero-grid"
      >
        <div className="anim-fadeUp">
          <p style={{
            fontFamily: 'var(--font-hand)', fontSize: 26, color: 'var(--coral)',
            margin: '0 0 10px', transform: 'rotate(-1.5deg)',
          }}>
            hecho a mano, con amor
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(2.6rem,4.6vw,4.2rem)',
            lineHeight: 1.06, margin: '0 0 22px', color: 'var(--tinta)',
          }}>
            Tus recuerdos merecen más que una galería<span style={{ color: 'var(--coral)' }}>.</span>
          </h1>
          <p style={{
            fontSize: 17, lineHeight: 1.7, color: 'var(--texto-2)',
            margin: '0 0 32px', maxWidth: 460,
          }}>
            Convertimos tus fotos en photobooks: pequeñas revistas de tu propia vida, impresas en tapa dura para hojearlas mil veces. Desde <strong style={{ color: 'var(--marron)' }}>S/ 70</strong>.
          </p>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/planes" className="btn-primary">CREA EL TUYO</Link>
            <Link href="/planes" className="btn-outline">VER PLANES</Link>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--texto-3)', margin: '26px 0 0', letterSpacing: '0.04em' }}>
            Tapa dura · A4 · 20 páginas · Listo en 1 semana
          </p>
        </div>

        <div style={{ position: 'relative', height: 440 }} className="anim-fadeUp hero-polaroids">
          {polaroids.map(p => (
            <div key={p.id} className="hero-polaroid" style={{
              position: 'absolute',
              top: p.top, left: p.left, right: p.right,
              width: p.w, background: '#fff', padding: '10px 10px 40px',
              boxShadow: '0 12px 32px rgba(75,46,26,0.18)',
              zIndex: p.z,
              ['--rot' as string]: `${p.rotate}deg`,
            }}>
              <div style={{
                position: 'absolute', top: -12, left: '50%',
                transform: `translateX(-50%) rotate(${p.rotate > 0 ? -4 : 3}deg)`,
                width: 84, height: 24, background: 'rgba(238,199,164,0.75)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }} />
              <div style={{ width: '100%', height: p.h }}>
                <img
                  src={`https://picsum.photos/seed/${p.seed}/400/${Math.round(400 * p.h / p.w)}`}
                  alt={p.caption}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <p style={{ fontFamily: 'var(--font-hand)', fontSize: 22, textAlign: 'center', margin: '12px 0 0', color: 'var(--texto-2)' }}>
                {p.caption}
              </p>
            </div>
          ))}
          <div style={{ position: 'absolute', top: 0, right: '26%', fontSize: 34, color: 'var(--coral)' }} className="anim-floaty">✳</div>
        </div>
      </div>

      <style>{`
        .hero-polaroid { transform: rotate(var(--rot)); transition: transform 0.3s; }
        .hero-polaroid:hover { transform: rotate(calc(var(--rot) / 2)) translateY(-6px); }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-polaroids {
            height: auto !important; display: flex !important; gap: 16px;
            overflow-x: auto; padding: 8px 4px 24px !important; margin-top: 8px;
          }
          .hero-polaroid {
            position: static !important; flex-shrink: 0; width: 180px !important;
          }
        }
      `}</style>
    </section>
  );
}
