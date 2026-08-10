'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Cat = 'todos' | 'parejas' | 'viajes' | 'cumpleanos' | 'familia';

const FILTROS: { id: Cat; label: string }[] = [
  { id: 'todos', label: 'TODOS' },
  { id: 'parejas', label: 'PAREJAS' },
  { id: 'viajes', label: 'VIAJES' },
  { id: 'cumpleanos', label: 'CUMPLEAÑOS' },
  { id: 'familia', label: 'FAMILIA' },
];

const ROTS = [-2, 1.5, -1, 2, -1.5, 1, -2.5, 1.8, -1.2];

// Fila de la tabla `galeria` (Supabase) — administrable desde /admin/contenido.
// `plantilla` guarda la temática (parejas/viajes/cumpleanos/familia) para poder filtrar.
interface GaleriaRow {
  id: string;
  imagen_url: string;
  descripcion: string | null;
  plantilla: string | null;
  orden: number;
}

export default function GaleriaPage() {
  const [rows, setRows] = useState<GaleriaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<Cat>('todos');
  const [sel, setSel] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    const supabase = createClient();
    supabase
      .from('galeria')
      .select('id, imagen_url, descripcion, plantilla, orden')
      .eq('activo', true)
      .order('orden')
      .then(({ data }) => {
        if (!alive) return;
        setRows((data ?? []) as GaleriaRow[]);
        setLoading(false);
      });
    return () => { alive = false; };
  }, []);

  const items = rows
    .map((r, i) => ({ ...r, rot: ROTS[i % ROTS.length], idx: i }))
    .filter(it => filtro === 'todos' || it.plantilla === filtro);

  const selected = sel !== null ? items.find(it => it.idx === sel) ?? null : null;

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
              color: active ? '#F5F7F6' : '#8A7568', cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Masonry */}
      <section style={{ padding: '0 32px 88px' }}>
        {loading ? (
          <div style={{ maxWidth: 1080, margin: '0 auto', columns: 3, columnGap: 22 }} className="galeria-masonry">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ breakInside: 'avoid', marginBottom: 22, borderRadius: 12, height: 220 + (i % 3) * 40 }} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--texto-3)', maxWidth: 420, margin: '0 auto' }}>
            Todavía no hay fotos en la galería. Se agregan desde el panel admin, en Contenido.
          </p>
        ) : (
          <div style={{ maxWidth: 1080, margin: '0 auto', columns: 3, columnGap: 22 }} className="galeria-masonry">
            {items.map(it => (
              <div key={it.id} className="galeria-item" onClick={() => setSel(it.idx)} style={{
                breakInside: 'avoid', marginBottom: 22, background: '#fff', padding: '9px 9px 30px',
                boxShadow: '0 10px 26px rgba(75,46,26,0.13)', transform: `rotate(${it.rot}deg)`,
                transition: 'transform 0.25s, box-shadow 0.25s', cursor: 'pointer',
              }}>
                <div style={{ width: '100%' }}>
                  <img src={it.imagen_url} alt={it.descripcion ?? ''}
                    style={{ width: '100%', height: 'auto', objectFit: 'cover', display: 'block' }} />
                </div>
                {it.descripcion && (
                  <p style={{ fontFamily: 'var(--font-hand)', fontSize: 20, textAlign: 'center', margin: '10px 0 0', color: 'var(--texto-2)' }}>
                    {it.descripcion}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section style={{ background: '#FFFFFF', padding: '56px 32px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-hand)', fontSize: 24, color: 'var(--marron)', margin: '0 0 8px' }}>el siguiente puede ser el tuyo</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem,2.6vw,2.1rem)', margin: '0 0 22px', color: 'var(--tinta)' }}>Empieza tu photobook hoy</h2>
        <a href="/planes" className="btn-primary" style={{ background: 'var(--coral)', padding: '15px 32px', boxShadow: '0 8px 22px rgba(232,121,90,0.32)' }}>
          VER PLANES
        </a>
      </section>

      {/* Lightbox */}
      {selected && (
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
            <img src={selected.imagen_url} alt={selected.descripcion ?? ''}
              style={{ width: '100%', display: 'block' }} />
            {selected.descripcion && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--borde)' }}>
                <p style={{ fontFamily: 'var(--font-hand)', fontSize: 20, color: 'var(--tinta)', margin: 0 }}>{selected.descripcion}</p>
              </div>
            )}
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
