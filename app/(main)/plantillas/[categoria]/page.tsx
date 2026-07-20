'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { waLink, WA_MESSAGES, PLANTILLAS, PORTADAS } from '@/lib/data';
import { getPlantillaLayout } from '@/lib/plantillas';
import AlbumPreview, { type AlbumPreviewHandle } from '@/app/components/ui/AlbumPreview';
import type { Tematica } from '@/types';

const LABELS: Record<string,string> = { parejas:'Mi Pareja', cumpleanos:'Feliz Cumpleaños', viajes:'Aventuras' };

export default function PlantillaDetallePage() {
  const { categoria } = useParams() as { categoria: string };
  const router = useRouter();
  const [tab, setTab] = useState<'plantilla'|'portada'>('plantilla');
  const [portadaSel, setPortadaSel] = useState<number|null>(null);
  const previewRef = useRef<AlbumPreviewHandle>(null);

  const plantilla = PLANTILLAS.find(p => p.categoria === categoria);
  const layout = getPlantillaLayout(categoria);
  const hojas = layout?.pages.length ?? plantilla?.hojas ?? 10;
  const fotos = plantilla?.fotos ?? layout?.fotos ?? 30;
  const label = LABELS[categoria] ?? plantilla?.nombre ?? categoria;

  const portadas = PORTADAS.filter(p => p.categorias.includes(categoria as Tematica));
  const portadasList = portadas.length ? portadas : PORTADAS;

  return (
    <main style={{ padding: '48px 32px 88px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <button
          onClick={() => router.push('/plantillas')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', color: 'var(--texto-3)',
            display: 'flex', alignItems: 'center', gap: 6, padding: 0, marginBottom: 22,
          }}
        >
          ← TODAS LAS PLANTILLAS
        </button>

        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <p style={{ fontFamily: 'var(--font-hand)', fontSize: 24, color: 'var(--coral)', margin: '0 0 6px' }}>plantilla</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem,4vw,3.2rem)', margin: 0, color: 'var(--tinta)' }}>{label}</h1>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 36 }}>
          {(['plantilla','portada'] as const).map(t => {
            const active = tab === t;
            return (
              <button key={t} onClick={() => setTab(t)} style={{
                fontSize: 12, fontWeight: 800, letterSpacing: '0.14em', padding: '11px 26px',
                borderRadius: 999, border: `1.5px solid ${active ? 'var(--marron)' : 'var(--borde-2)'}`,
                background: active ? 'var(--marron)' : 'transparent',
                color: active ? '#FBF7F2' : '#8A7568', cursor: 'pointer', transition: 'all 0.2s',
              }}>
                {t.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* ── PLANTILLA ── */}
        {tab === 'plantilla' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 36, marginBottom: 32, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 44, lineHeight: 1, color: 'var(--marron)' }}>{hojas}</span>
                <span style={{ fontSize: 13.5, color: 'var(--texto-2)' }}>hojas</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 44, lineHeight: 1, color: 'var(--marron)' }}>{fotos}</span>
                <span style={{ fontSize: 13.5, color: 'var(--texto-2)' }}>fotos</span>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href={layout ? `/editor/${categoria}` : '/planes'} className="btn-primary" style={{ background: 'var(--coral)', padding: '14px 28px' }}>
                  ✦ PERSONALIZAR ONLINE
                </Link>
                <a href={waLink(WA_MESSAGES.personalizado(label, 'a definir'))} target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ padding: '13px 24px' }}>
                  PEDIR POR WHATSAPP
                </a>
              </div>
            </div>

            {/* Preview del libro — visor interactivo existente, solo re-envuelto */}
            <div style={{ background: 'var(--crema-2)', borderRadius: 24, padding: 32, marginBottom: 28 }}>
              {layout ? (
                <AlbumPreview ref={previewRef} layout={layout} />
              ) : (
                <div style={{ maxWidth: 560, margin: '0 auto', background: '#fff', borderRadius: 6, boxShadow: '0 24px 48px rgba(75,46,26,0.22)', aspectRatio: '210/148', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'var(--texto-3)', fontSize: 13 }}>Vista previa no disponible todavía para esta categoría.</span>
                </div>
              )}
            </div>

            {/* Miniaturas */}
            {layout && (
              <>
                <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', color: 'var(--texto-3)', margin: '0 0 14px' }}>
                  PÁGINAS INTERIORES
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }} className="miniaturas-grid">
                  {layout.pages.map((pg, i) => (
                    <div key={i} className="miniatura-pagina" onClick={() => previewRef.current?.flipTo(i)} style={{
                      aspectRatio: '210/148', background: '#fff', border: '1px solid var(--borde)', borderRadius: 8,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer',
                    }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--marron)' }}>{i + 1}</span>
                      <span style={{ fontSize: 10, color: 'var(--texto-3)' }}>{pg.slots.length} fotos</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── PORTADA ── */}
        {tab === 'portada' && (
          <div>
            <p style={{ textAlign: 'center', fontSize: 14.5, color: 'var(--texto-2)', margin: '0 0 30px' }}>
              Elige la portada de tu álbum — el nombre se personaliza con tu historia.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18, marginBottom: 34 }} className="portadas-grid">
              {portadasList.map((p, i) => {
                const active = portadaSel === i;
                return (
                  <div key={p.id} onClick={() => setPortadaSel(i)} style={{
                    cursor: 'pointer', borderRadius: 16, padding: 8,
                    border: `2px solid ${active ? 'var(--coral)' : 'var(--borde)'}`,
                    background: active ? '#FDF3EC' : '#fff', transition: 'all 0.2s',
                  }}>
                    <div style={{ aspectRatio: '3/4', borderRadius: 10, overflow: 'hidden', background: 'var(--borde)', marginBottom: 10 }}>
                      <img src={p.imagen} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => (e.currentTarget.style.display = 'none')} />
                    </div>
                    <p style={{ fontFamily: 'var(--font-hand)', fontSize: 19, textAlign: 'center', margin: 0, color: 'var(--tinta)' }}>{p.nombre}</p>
                  </div>
                );
              })}
            </div>
            <div style={{ textAlign: 'center' }}>
              <Link href={layout ? `/editor/${categoria}` : '/planes'} className="btn-primary" style={{ background: 'var(--marron)', padding: '16px 36px' }}>
                CONTINUAR CON ESTA PORTADA →
              </Link>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .miniatura-pagina { transition: border-color 0.2s, transform 0.2s; }
        .miniatura-pagina:hover { border-color: var(--coral); transform: translateY(-2px); }
        @media (max-width: 640px) {
          .miniaturas-grid { grid-template-columns: repeat(3,1fr) !important; }
          .portadas-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
    </main>
  );
}
