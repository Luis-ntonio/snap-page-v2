import { PORTADAS } from '@/lib/data';

const rotations = [-2, 2.5, -1.5, 2, -2.5, 1.5];

function Card({ id, nombre, rotate, offset }: { id: string; nombre: string; rotate: number; offset: number }) {
  return (
    <div style={{
      width: 180, background: '#fff', padding: '8px 8px 14px',
      boxShadow: '0 8px 22px rgba(75,46,26,0.14)',
      transform: `rotate(${rotate}deg)`, marginTop: offset,
    }}>
      <div style={{ width: '100%', height: 210 }}>
        <img
          src={`https://picsum.photos/seed/snap-cover-${id}/300/420`}
          alt={nombre}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
      <p style={{ fontFamily: 'var(--font-hand)', fontSize: 19, textAlign: 'center', margin: '8px 0 0', color: 'var(--texto-2)' }}>
        {nombre}
      </p>
    </div>
  );
}

export default function CarruselSection() {
  const items = PORTADAS.length ? PORTADAS : [];
  return (
    <section style={{
      background: 'var(--crema-2)', borderTop: '1px solid var(--borde)', borderBottom: '1px solid var(--borde)',
      padding: '40px 0', overflow: 'hidden',
    }}>
      <p style={{
        fontFamily: 'var(--font-hand)', fontSize: 24, color: 'var(--marron)',
        textAlign: 'center', margin: '0 0 24px', transform: 'rotate(-1deg)',
      }}>
        photobooks que ya son parte de una historia
      </p>
      <div className="marquee-track" style={{ display: 'flex', width: 'max-content', gap: 28, padding: '6px 0' }}>
        {[0, 1].map(dup => (
          <div key={dup} style={{ display: 'flex', gap: 28 }} aria-hidden={dup === 1}>
            {items.map((p, i) => (
              <Card key={`${dup}-${p.id}`} id={p.id} nombre={p.nombre} rotate={rotations[i % rotations.length]} offset={i % 3 === 0 ? 14 : 0} />
            ))}
          </div>
        ))}
      </div>
      <style>{`
        .marquee-track { animation: marquee 32s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }
      `}</style>
    </section>
  );
}
