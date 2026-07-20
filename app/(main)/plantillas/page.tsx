import Link from 'next/link';
import { PLANTILLAS } from '@/lib/data';

const CATS = [
  { id: 'parejas', label: 'Parejas', seed: 'cat-parejas' },
  { id: 'cumpleanos', label: 'Cumpleaños', seed: 'cat-cumple' },
  { id: 'viajes', label: 'Viajes', seed: 'cat-viajes' },
];

export default function PlantillasPage() {
  return (
    <main style={{ padding: '64px 32px 88px' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <p style={{ fontFamily: 'var(--font-hand)', fontSize: 26, color: 'var(--coral)', margin: '0 0 8px', transform: 'rotate(-1deg)' }}>
            plan personalizado · S/ 90
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem,4vw,3.2rem)', margin: '0 0 12px', color: 'var(--tinta)' }}>
            Elige tu plantilla
          </h1>
          <p style={{ fontSize: 15, color: 'var(--texto-2)', margin: 0 }}>
            Cada una diseñada a mano para un tipo de historia distinto.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {CATS.map((c, i) => {
            const plantilla = PLANTILLAS.find(p => p.categoria === c.id);
            const fotos = plantilla?.fotos ?? 30;
            const hojas = plantilla?.hojas ?? 10;
            const odd = i % 2 === 0;
            return (
              <Link key={c.id} href={`/plantillas/${c.id}`} className="plantilla-banda" style={{
                position: 'relative', height: 200, borderRadius: 24, overflow: 'hidden',
                cursor: 'pointer', textDecoration: 'none', transition: 'transform 0.3s, box-shadow 0.3s',
              }}>
                <img src={`https://picsum.photos/seed/${c.seed}/900/400`} alt={c.label}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: odd
                    ? 'linear-gradient(90deg, transparent 30%, rgba(43,33,28,0.55))'
                    : 'linear-gradient(90deg, rgba(43,33,28,0.55), transparent 70%)',
                }} />
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                  alignItems: odd ? 'flex-end' : 'flex-start', justifyContent: 'center', padding: '0 44px',
                }}>
                  <span style={{ fontFamily: 'var(--font-hand)', fontSize: 22, color: 'var(--coral-suave)' }}>
                    {fotos} fotos · {hojas} hojas
                  </span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4.5vw,3rem)', color: '#FBF7F2' }}>
                    {c.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <style>{`
        .plantilla-banda:hover { transform: translateY(-4px); box-shadow: 0 20px 44px rgba(75,46,26,0.2); }
      `}</style>
    </main>
  );
}
