'use client';
import { useState } from 'react';

type Cat = 'todos' | 'parejas' | 'viajes' | 'cumpleanos' | 'familia';

const FILTROS: { id: Cat; label: string }[] = [
  { id: 'todos', label: 'TODOS' },
  { id: 'parejas', label: 'PAREJAS' },
  { id: 'viajes', label: 'VIAJES' },
  { id: 'cumpleanos', label: 'CUMPLEAÑOS' },
  { id: 'familia', label: 'FAMILIA' },
];

const ROTS = [-2, 1.5, -1, 2, -1.5, 1, -2.5, 1.8, -1.2];

const ITEMS = [
  { cat: 'parejas', h: 300, caption: 'The Story of Us', seed: 'gal-0' },
  { cat: 'viajes', h: 220, caption: 'Cusco, juntos', seed: 'gal-1' },
  { cat: 'cumpleanos', h: 260, caption: 'los 30 de Andrea', seed: 'gal-2' },
  { cat: 'familia', h: 240, caption: 'domingos en casa', seed: 'gal-3' },
  { cat: 'parejas', h: 250, caption: 'nuestro aniversario', seed: 'gal-4' },
  { cat: 'viajes', h: 300, caption: 'Máncora 2025', seed: 'gal-5' },
  { cat: 'familia', h: 220, caption: 'bienvenida, Luna', seed: 'gal-6' },
  { cat: 'cumpleanos', h: 280, caption: 'quinceañera', seed: 'gal-7' },
  { cat: 'parejas', h: 230, caption: "I'm in Love", seed: 'gal-8' },
] as const;

export default function GaleriaPage() {
  const [filtro, setFiltro] = useState<Cat>('todos');
  const [sel, setSel] = useState<number | null>(null);

  const items = ITEMS.map((it, i) => ({ ...it, rot: ROTS[i % ROTS.length], idx: i }))
    .filter(it => filtro === 'todos' || it.cat === filtro);

  return (
    <main>
      <section style={{ padding: '64px 32px 36px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-hand)', fontSize: 26, color: 'var(--coral)', margin: '0 0 8px', transform: 'rotate(-1deg)' }}>
          historias que ya viven en papel
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem,4vw,3.2rem)', margin: '0 0 12px', color: 'var(--tinta)' }}>Galería</h1>
        <p style={{ fontSize: 15, color: 'var(--texto-2)', margin: 0 }}>Photobooks reales, hechos para clientes reales.</p>
      </section>

      {/* Filtros */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '0 32px 40px', flexWrap: 'wrap' }}>
        {FILTROS.map(f => {
          const active = filtro === f.id;
          return (
            <button key={f.id} onClick={() => setFiltro(f.id)} style={{
              fontSize: 11.5, fontWeight: 800, letterSpacing: '0.12em', padding: '10px 22px', borderRadius: 999,
              border: `1.5px solid ${active ? 'var(--marron)' : 'var(--borde-2)'}`,
              background: active ? 'var(--marron)' : 'transparent',
              color: active ? '#FBF7F2' : '#8A7568', cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Masonry */}
      <section style={{ padding: '0 32px 88px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', columns: 3, columnGap: 22 }} className="galeria-masonry">
          {items.map(it => (
            <div key={it.idx} className="galeria-item" onClick={() => setSel(it.idx)} style={{
              breakInside: 'avoid', marginBottom: 22, background: '#fff', padding: '9px 9px 30px',
              boxShadow: '0 10px 26px rgba(75,46,26,0.13)', transform: `rotate(${it.rot}deg)`,
              transition: 'transform 0.25s, box-shadow 0.25s', cursor: 'pointer',
            }}>
              <div style={{ width: '100%', height: it.h }}>
                <img src={`https://picsum.photos/seed/${it.seed}/400/${it.h}`} alt={it.caption}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
              <p style={{ fontFamily: 'var(--font-hand)', fontSize: 20, textAlign: 'center', margin: '10px 0 0', color: 'var(--texto-2)' }}>
                {it.caption}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--crema-2)', padding: '56px 32px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-hand)', fontSize: 24, color: 'var(--marron)', margin: '0 0 8px' }}>el siguiente puede ser el tuyo</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem,2.6vw,2.1rem)', margin: '0 0 22px', color: 'var(--tinta)' }}>Empieza tu photobook hoy</h2>
        <a href="/planes" className="btn-primary" style={{ background: 'var(--coral)', padding: '15px 32px', boxShadow: '0 8px 22px rgba(232,121,90,0.32)' }}>
          VER PLANES
        </a>
      </section>

      {/* Lightbox */}
      {sel !== null && (
        <div onClick={() => setSel(null)} style={{
          position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(43,33,28,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            position: 'relative', background: '#fff', borderRadius: 12, overflow: 'hidden',
            maxWidth: 420, width: '100%',
          }}>
            <button onClick={() => setSel(null)} style={{
              position: 'absolute', top: 10, right: 14, background: 'none', border: 'none',
              fontSize: 20, color: '#fff', cursor: 'pointer', zIndex: 2, textShadow: '0 1px 4px rgba(0,0,0,0.5)',
            }}>✕</button>
            <img src={`https://picsum.photos/seed/${ITEMS[sel].seed}/500/${ITEMS[sel].h * 2}`} alt={ITEMS[sel].caption}
              style={{ width: '100%', display: 'block' }} />
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--borde)' }}>
              <p style={{ fontFamily: 'var(--font-hand)', fontSize: 20, color: 'var(--tinta)', margin: 0 }}>{ITEMS[sel].caption}</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .galeria-item:hover { transform: rotate(0deg) translateY(-4px) !important; box-shadow: 0 18px 40px rgba(75,46,26,0.2); }
        @media (max-width: 900px) { .galeria-masonry { columns: 2 !important; } }
        @media (max-width: 560px) { .galeria-masonry { columns: 1 !important; } }
      `}</style>
    </main>
  );
}
