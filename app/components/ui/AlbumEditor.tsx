'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import HTMLFlipBook from 'react-pageflip';
import type { PlantillaLayout } from '@/types';
import { loadDraft, saveDraft, clearDraft } from '@/lib/album/draftStore';
import { composeAlbumPdf, downloadBlob } from '@/lib/album/pdf';
import { submitAlbumOrder } from '@/lib/album/submit';
import { useAuth } from '@/lib/auth';
import { useDemo } from '@/lib/demo';
import { waLink, WA_MESSAGES, PORTADAS } from '@/lib/data';
import { PLAN_PRICES } from '@/types';
import { AlbumPageCanvas } from './album/AlbumPageCanvas';

export default function AlbumEditor({ layout }: { layout: PlantillaLayout }) {
  const router = useRouter();
  const { user } = useAuth();
  const { demoUser } = useDemo();
  const sesion = user ?? demoUser;

  const [photos, setPhotos] = useState<Record<number, Blob>>({});
  const [urls, setUrls] = useState<Record<number, string>>({});
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [portadaId, setPortadaId] = useState<string | null>(null);
  const [pageIdx, setPageIdx] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  const portadas = PORTADAS.filter((p) => p.categorias.includes(layout.categoria));
  const portadaSel = portadas.find((p) => p.id === portadaId) ?? null;

  const fileRef = useRef<HTMLInputElement>(null);
  const activeSlot = useRef<number | null>(null);
  const urlsRef = useRef<Record<number, string>>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookRef = useRef<any>(null);
  const flipTo = (n: number) => bookRef.current?.pageFlip()?.flip(n);

  const setPhotoBlob = useCallback((n: number, blob: Blob) => {
    setPhotos((prev) => ({ ...prev, [n]: blob }));
    const url = URL.createObjectURL(blob);
    setUrls((prev) => {
      const old = prev[n];
      if (old) URL.revokeObjectURL(old);
      const next = { ...prev, [n]: url };
      urlsRef.current = next;
      return next;
    });
  }, []);

  const removePhoto = useCallback((n: number) => {
    setPhotos((prev) => {
      const next = { ...prev };
      delete next[n];
      return next;
    });
    setUrls((prev) => {
      if (prev[n]) URL.revokeObjectURL(prev[n]);
      const next = { ...prev };
      delete next[n];
      urlsRef.current = next;
      return next;
    });
  }, []);

  // Rehidratar borrador desde IndexedDB (sobrevive recargas y el paso por /register).
  useEffect(() => {
    let cancelled = false;
    loadDraft(layout.id).then((draft) => {
      if (cancelled || !draft) { setHydrated(true); return; }
      setPhotos(draft.photos ?? {});
      setTexts(draft.texts ?? {});
      setPortadaId(draft.portadaId ?? null);
      const nextUrls: Record<number, string> = {};
      for (const [n, blob] of Object.entries(draft.photos ?? {})) {
        nextUrls[Number(n)] = URL.createObjectURL(blob as Blob);
      }
      urlsRef.current = nextUrls;
      setUrls(nextUrls);
      setHydrated(true);
    });
    const urlsAtCleanup = urlsRef;
    return () => {
      cancelled = true;
      Object.values(urlsAtCleanup.current).forEach((u) => URL.revokeObjectURL(u));
    };
  }, [layout.id]);

  // Autoguardado en cada cambio (una vez hidratado, para no pisar el borrador con el estado vacío inicial).
  useEffect(() => {
    if (!hydrated) return;
    saveDraft({ plantillaId: layout.id, photos, texts, portadaId, updatedAt: Date.now() });
  }, [photos, texts, portadaId, hydrated, layout.id]);

  const openPicker = (n: number) => {
    activeSlot.current = n;
    fileRef.current?.click();
  };

  const onFile = (files: FileList | null) => {
    const f = files?.[0];
    const n = activeSlot.current;
    if (f && n !== null && f.type.startsWith('image/')) setPhotoBlob(n, f);
    activeSlot.current = null;
    if (fileRef.current) fileRef.current.value = '';
  };

  const filled = Object.keys(photos).length;

  const onSend = async () => {
    if (!sesion) {
      router.push(`/login?next=/editor/${layout.id}`);
      return;
    }
    setSendError('');
    setSending(true);
    try {
      const pdf = await composeAlbumPdf(layout, photos, texts, undefined, portadaSel);
      let waMessage = WA_MESSAGES.personalizado(layout.nombre, portadaSel?.nombre ?? 'a definir');

      // Solo se intenta registrar en Supabase si hay una sesión REAL (no demo) — usuario.id debe ser un auth.uid() válido.
      if (user) {
        try {
          const { numero, pdfUrl } = await submitAlbumOrder({ layout, photos, texts, pdf, usuarioId: user.id, portadaId });
          waMessage = WA_MESSAGES.pedidoPersonalizado(numero, pdfUrl);
        } catch (err) {
          console.warn('No se pudo registrar el pedido en Supabase; se entrega el PDF localmente.', err);
          downloadBlob(pdf, `${layout.nombre}.pdf`);
        }
      } else {
        // Sin sesión Supabase real (modo demo o Supabase aún no conectado): entrega local del PDF.
        downloadBlob(pdf, `${layout.nombre}.pdf`);
      }

      await clearDraft(layout.id);
      window.open(waLink(waMessage), '_blank');
    } catch (err) {
      console.error('Error al generar el PDF del álbum:', err);
      setSendError('No pudimos generar tu PDF. Intenta nuevamente.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--crema-2)' }}>
      {/* Top bar */}
      <header style={{ background: 'var(--crema)', borderBottom: '1px solid var(--borde)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 20 }} className="editor-topbar">
          <button onClick={() => router.push(`/plantillas/${layout.categoria}`)} style={{
            fontSize: 11.5, fontWeight: 800, letterSpacing: '0.1em', color: 'var(--texto-3)',
            background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            ← SALIR
          </button>
          <div style={{ width: 1, height: 22, background: 'var(--borde)' }} />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, whiteSpace: 'nowrap' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--marron)' }}>{layout.nombre}</span>
            <span style={{ fontSize: 11.5, color: 'var(--texto-3)' }}>plan personalizado · {PLAN_PRICES.personalizado}</span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
            {hydrated && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, fontWeight: 600, color: 'var(--verde-ok)' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--verde-ok)' }} />
                Borrador guardado
              </span>
            )}
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--texto-2)', background: 'var(--crema-2)', borderRadius: 999, padding: '7px 14px' }}>
              {filled} / {layout.fotos} fotos
            </span>
            <button onClick={onSend} disabled={sending} style={{
              fontSize: 11.5, fontWeight: 800, letterSpacing: '0.08em', color: '#FBF7F2', background: '#25D366',
              border: 'none', borderRadius: 999, padding: '11px 20px', cursor: sending ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 7, opacity: sending ? 0.7 : 1, whiteSpace: 'nowrap',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              {sending ? 'GENERANDO...' : sesion ? 'ENVIAR A WHATSAPP' : 'INICIAR SESIÓN'}
            </button>
          </div>
        </div>
      </header>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '240px 1fr', maxWidth: 1240, width: '100%', margin: '0 auto' }} className="editor-layout">
        {/* Sidebar: portada + tip */}
        <aside style={{ padding: '28px 20px', borderRight: '1px solid var(--borde-2)', display: 'flex', flexDirection: 'column', gap: 24 }} className="editor-sidebar">
          {portadas.length > 0 && (
            <div>
              <p style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.16em', color: 'var(--texto-3)', margin: '0 0 12px' }}>TU PORTADA</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }} className="editor-portadas-grid">
                {portadas.map((p) => {
                  const active = portadaId === p.id;
                  return (
                    <button key={p.id} onClick={() => setPortadaId(active ? null : p.id)} style={{
                      aspectRatio: '3/4', borderRadius: 10, border: `2px solid ${active ? 'var(--coral)' : 'var(--borde)'}`,
                      background: active ? '#FDF3EC' : '#fff', cursor: 'pointer', padding: 6, position: 'relative',
                      overflow: 'hidden', transition: 'all 0.2s',
                    }}>
                      <img src={p.imagen} alt={p.nombre} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
                        onError={(e) => (e.currentTarget.style.display = 'none')} />
                      <span style={{ position: 'relative', fontFamily: 'var(--font-hand)', fontSize: 15, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.5)', textAlign: 'center', lineHeight: 1.2, display: 'block' }}>
                        {p.nombre}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div className="editor-tip-card" style={{ background: 'var(--crema)', borderRadius: 14, padding: 16 }}>
            <p style={{ fontFamily: 'var(--font-hand)', fontSize: 20, color: 'var(--coral)', margin: '0 0 6px' }}>tip</p>
            <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--texto-2)', margin: 0 }}>
              Haz clic en un recuadro o arrastra una foto encima para llenarlo. Tu avance se guarda solo.
            </p>
          </div>
        </aside>

        {/* Canvas */}
        <main style={{ padding: '32px 40px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          {/* Página (con animación de volteo; el flip solo se dispara por botones/puntos, no por gestos, para no interferir con el drag&drop de fotos) */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            {/* El wrapper decide portrait vs. landscape: page-flip entra en modo "2 páginas" (spread) solo si
                blockWidth >= minWidth*2 (ver page-flip Render.ts calculateBoundsRect). Con usePortrait=true cae
                automáticamente a 1 página cuando el contenedor es angosto (mobile) — no hace falta un breakpoint
                manual aparte. useMouseEvents=false ya desactiva TODO el manejo propio de click/mouse de page-flip
                (ver page-flip UI.ts), así que el modo landscape no interfiere con el clic/drag&drop de fotos. */}
            <div style={{ width: '100%', maxWidth: 720, position: 'relative' }}>
            <div style={{
              position: 'absolute', top: 10, right: 14, fontSize: 10, fontWeight: 700, color: '#C9B8A8', zIndex: 2,
            }} className="editor-page-badge">
              página {pageIdx + 1} / {layout.pages.length}
            </div>
            <HTMLFlipBook
              ref={bookRef}
              width={280}
              height={396}
              size="stretch"
              minWidth={240}
              maxWidth={320}
              minHeight={340}
              maxHeight={453}
              startPage={0}
              drawShadow
              flippingTime={500}
              usePortrait
              startZIndex={0}
              autoSize
              maxShadowOpacity={0.4}
              showCover
              mobileScrollSupport={false}
              clickEventForward
              useMouseEvents={false}
              swipeDistance={30}
              showPageCorners={false}
              disableFlipByClick
              className=""
              style={{}}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onFlip={(e: any) => setPageIdx(e.data)}
            >
              {layout.pages.map((p, i) => (
                <div key={i} style={{ background: p.bg ?? '#fff' }}>
                  <AlbumPageCanvas
                    page={p}
                    urls={urls}
                    texts={texts}
                    editable
                    onSlot={openPicker}
                    onRemove={removePhoto}
                    onDropFile={(n, file) => setPhotoBlob(n, file)}
                    onText={(k, v) => setTexts((prev) => ({ ...prev, [k]: v }))}
                    maxWidth={9999}
                  />
                </div>
              ))}
            </HTMLFlipBook>
            </div>
          </div>

          {/* Navegación */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* flipPrev/flipNext (no flipTo(pageIdx±1)): pageIdx es el índice IZQUIERDO del spread actual,
                así que en modo 2 páginas sumar/restar 1 a veces apunta a una página que ya es parte del
                mismo spread (el flip no avanza). flipPrev/flipNext navegan por spread, no por índice. */}
            <NavBtn onClick={() => bookRef.current?.pageFlip()?.flipPrev()} disabled={pageIdx === 0}>
              <ChevronLeft size={16} />
            </NavBtn>
            <div style={{ display: 'flex', gap: 7 }}>
              {layout.pages.map((_, i) => {
                const active = i === pageIdx;
                return (
                  <button key={i} onClick={() => flipTo(i)} aria-label={`Página ${i + 1}`} style={{
                    width: active ? 22 : 8, height: 8, borderRadius: 999, border: 'none', cursor: 'pointer',
                    background: active ? 'var(--coral)' : 'var(--borde-2)', padding: 0, transition: 'all 0.25s',
                  }} />
                );
              })}
            </div>
            <NavBtn onClick={() => bookRef.current?.pageFlip()?.flipNext()} disabled={pageIdx >= layout.pages.length - 2}>
              <ChevronRight size={16} />
            </NavBtn>
          </div>
          <p style={{ fontFamily: 'var(--font-hand)', fontSize: 20, color: 'var(--texto-3)', margin: 0, textAlign: 'center' }}>
            la página gira con una animación de volteo, como un libro real
          </p>

          {sendError && (
            <p style={{ fontSize: 12, color: '#c0392b', textAlign: 'center', margin: 0 }}>{sendError}</p>
          )}
          <p style={{ fontSize: 11, color: 'var(--texto-3)', textAlign: 'center', margin: 0 }}>
            Tu diseño se guarda automáticamente. Puedes registrarte y volver: seguirá aquí.
          </p>
        </main>
      </div>

      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => onFile(e.target.files)} />

      <style>{`
        @media (max-width: 900px) {
          .editor-layout { grid-template-columns: 1fr !important; }
          .editor-sidebar {
            flex-direction: row !important; border-right: none !important;
            border-bottom: 1px solid var(--borde-2); overflow-x: auto; align-items: flex-start;
          }
          .editor-portadas-grid { grid-template-columns: repeat(4, 80px) !important; }
          .editor-tip-card { flex-shrink: 0; width: 200px; }
          .editor-page-badge { right: 12px !important; }
        }
        @media (max-width: 640px) {
          .editor-topbar { flex-wrap: wrap; height: auto !important; padding: 12px 16px !important; }
        }
      `}</style>
    </div>
  );
}

function NavBtn({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid var(--borde-2)', background: 'var(--crema)',
        cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.3 : 1, color: 'var(--marron)',
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </button>
  );
}
