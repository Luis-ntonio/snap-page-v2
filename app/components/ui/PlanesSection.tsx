'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import HTMLFlipBook from 'react-pageflip';
import { waLink, WA_MESSAGES, GOOGLE_CALENDAR, PASOS } from '@/lib/data';
import { renderPdfToImages, type PdfPreviewPage } from '@/lib/pdf/renderPdfPreview';
import { createClient } from '@/lib/supabase/client';

// Bucket privado donde /api/tengo-diseno sube los PDF del cliente (ver lib/supabase/tengoDisenoStorage.ts).
const BUCKET_TENGO_DISENO = 'disenos-clientes';

const PLANES = [
  {
    id: 'minimal', nombre: 'Minimal', precio: 'S/ 70', img: '/images/planes/minimal.jpg', dark: false, destacado: false,
    bullets: ['Elige el estilo de tu portada.', '1 foto por página — 20 fotos protagonistas.'],
    cta: 'EMPEZAR →',
  },
  {
    id: 'personalizado', nombre: 'Personalizado', precio: 'S/ 90', img: '/images/planes/personalizado.jpg', dark: false, destacado: true,
    bullets: ['Arma tu álbum online con nuestras plantillas.', 'Entre 40 y 60 fotos en 20 páginas.', 'Agrega frases personalizadas.'],
    cta: 'DISEÑAR ONLINE →',
  },
  {
    id: 'tengo-mi-diseno', nombre: 'Tengo mi diseño', precio: 'S/ 70', img: '/images/planes/tengo-diseno.jpg', dark: false, destacado: false,
    bullets: ['Envíanos tu PDF o link de Canva en A4, 20 páginas.', 'Elige una portada nuestra o manda la tuya.'],
    cta: 'SUBIR MI PDF →',
  },
  {
    id: 'premium', nombre: 'Premium', precio: 'S/ 120', img: '/images/planes/premium.jpg', dark: true, destacado: false,
    bullets: ['Videollamada 1 a 1 con nuestra diseñadora.', 'Sin límite de elementos en tus 20 páginas.'],
    cta: 'AGENDAR VIDEOLLAMADA →',
  },
];

type Modal = 'minimal-choose'|'minimal-drop'|'minimal-viewer'|'tengo-choose'|'tengo-viewer'|null;
interface Img { id:string; url:string; name:string; }

export default function PlanesSection() {
  const [modal, setModal] = useState<Modal>(null);
  const [imgs, setImgs]   = useState<Img[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string|null>(null);
  const [pdfName, setPdfName] = useState('');
  const [pdfPages, setPdfPages] = useState<PdfPreviewPage[]|null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<{done:number; total:number}|null>(null);
  const [pdfFile, setPdfFile] = useState<File|null>(null);
  const [pdfSplitSpreads, setPdfSplitSpreads] = useState(true);
  const [pdfSending, setPdfSending] = useState(false);
  const [pdfSendError, setPdfSendError] = useState(false);
  const [spread, setSpread] = useState(0);
  const [drag, setDrag]   = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);

  const addImgs = (files: FileList|null) => {
    if (!files) return;
    const n: Img[] = Array.from(files).filter(f=>f.type.startsWith('image/')).map(f=>({
      id:`${Date.now()}-${Math.random()}`, url:URL.createObjectURL(f), name:f.name.replace(/\.[^.]+$/,''),
    }));
    setImgs(prev=>[...prev,...n]);
    setModal('minimal-viewer');
  };

  const runPdfPreview = (f: File, splitSpreads: boolean) => {
    setPdfPages(null); setPdfError(false); setPdfLoading(true); setPdfProgress(null); setSpread(0);
    renderPdfToImages(f, (done, total)=>setPdfProgress({done, total}), splitSpreads)
      .then(setPdfPages)
      .catch((err)=>{ console.error('renderPdfToImages failed:', err); setPdfError(true); })
      .finally(()=>setPdfLoading(false));
  };

  const addPdf = (files:FileList|null) => {
    const f=files?.[0]; if (!f||f.type!=='application/pdf') return;
    setPdfUrl(URL.createObjectURL(f)); setPdfName(f.name); setPdfFile(f); setModal('tengo-viewer');
    runPdfPreview(f, pdfSplitSpreads);
  };

  const toggleSplitSpreads = () => {
    const next = !pdfSplitSpreads;
    setPdfSplitSpreads(next);
    if (pdfFile) runPdfPreview(pdfFile, next);
  };

  const close = () => {
    setModal(null); setImgs([]); setPdfUrl(null); setPdfFile(null); setSpread(0);
    setPdfPages(null); setPdfLoading(false); setPdfError(false); setPdfProgress(null);
    setPdfSending(false); setPdfSendError(false);
  };

  // Sube el PDF a Storage (directo, sin pasar por nuestro servidor) para poder incluir un link
  // real en el mensaje de WhatsApp — sin necesitar que el cliente inicie sesión. Si algo falla,
  // cae de vuelta al mensaje genérico (mismo criterio que el envío del plan Personalizado).
  const handleComprarTengoDiseno = async () => {
    if (!pdfFile) return;
    setPdfSending(true); setPdfSendError(false);
    try {
      const initRes = await fetch('/api/tengo-diseno/upload-url', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: pdfFile.name }),
      });
      if (!initRes.ok) throw new Error('upload-url failed');
      const { path, token } = await initRes.json();

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_TENGO_DISENO)
        .uploadToSignedUrl(path, token, pdfFile, { contentType: 'application/pdf' });
      if (uploadError) throw uploadError;

      const linkRes = await fetch('/api/tengo-diseno/link', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      });
      if (!linkRes.ok) throw new Error('link failed');
      const { url } = await linkRes.json();

      window.open(waLink(WA_MESSAGES.tengoDisenoConPdf(url)), '_blank');
    } catch (err) {
      console.error('No se pudo subir el PDF a Storage; se envía el mensaje sin link.', err);
      setPdfSendError(true);
      window.open(waLink(WA_MESSAGES.tengoDiseno), '_blank');
    } finally {
      setPdfSending(false);
    }
  };

  // Build spreads
  // imgs[0] = portada (tapa), imgs[último] = contraportada (tapa)
  // páginas internas = imgs[1] a imgs[n-2]
  // primera interna sola a la DERECHA, última interna sola a la IZQUIERDA
  // total internas siempre múltiplo de 4
  const portada = imgs[0] ?? null;
  const contraportada = imgs.length > 1 ? imgs[imgs.length - 1] : null;
  const internas = imgs.length > 2 ? imgs.slice(1, -1) : [];

  const padded: (Img | null)[] = [...internas];
  while (padded.length % 4 !== 0) padded.push(null);

  const spreads:(Img|null)[][] = [];
  spreads.push([portada]);
  if (padded.length > 0) {
    spreads.push([null, padded[0]]);
    for (let i = 1; i < padded.length - 1; i += 2) {
      spreads.push([padded[i], padded[i+1] ?? null]);
    }
    spreads.push([padded[padded.length - 1], null]);
  }
  spreads.push([contraportada]);
  const cur = spreads[spread]??[null];
  const isSingle = spread===0||spread===spreads.length-1;

  return (
    <>
      <section style={{ padding: '64px 32px 96px' }} id="planes">
        <div style={{ maxWidth: 1020, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26 }} className="planes-grid">
            {PLANES.map(plan => {
              const isLink = plan.id==='personalizado';
              const cardInner = (
                <>
                  <div><img src={plan.img} alt={plan.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e=>(e.currentTarget.style.background = plan.dark ? '#3a2f28' : 'var(--crema-2)')} /></div>
                  <div style={{ padding: '26px 26px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, margin: 0, color: plan.dark ? '#F6E3D5' : 'var(--marron)' }}>{plan.nombre}</h2>
                      <span style={{ fontWeight: 800, fontSize: 17, whiteSpace: 'nowrap', color: plan.dark ? '#FBF7F2' : 'var(--tinta)' }}>{plan.precio}</span>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                      {plan.bullets.map((b,i)=>(
                        <li key={i} style={{ display: 'flex', gap: 9, fontSize: 13.5, lineHeight: 1.55, color: plan.dark ? '#CBB9AB' : 'var(--texto-2)' }}>
                          <span style={{ color: 'var(--coral)' }}>✳</span>{b}
                        </li>
                      ))}
                    </ul>
                    {plan.id === 'personalizado' && (
                      <span style={{
                        fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', textDecoration: 'none',
                        color: '#FBF7F2', background: 'var(--coral)', borderRadius: 999, padding: '12px 22px',
                        textAlign: 'center', alignSelf: 'start',
                      }}>{plan.cta}</span>
                    )}
                    {plan.id === 'premium' && (
                      <span style={{
                        fontSize: 12, fontWeight: 800, letterSpacing: '0.1em',
                        color: '#2B211C', background: '#F6E3D5', borderRadius: 999, padding: '12px 22px',
                        textAlign: 'center', alignSelf: 'start',
                      }}>{plan.cta}</span>
                    )}
                    {(plan.id === 'minimal' || plan.id === 'tengo-mi-diseno') && (
                      <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', color: 'var(--marron)' }}>{plan.cta}</span>
                    )}
                  </div>
                </>
              );

              const cardStyle: React.CSSProperties = {
                background: plan.dark ? 'var(--tinta)' : '#fff',
                border: plan.destacado ? '2px solid var(--coral)' : plan.dark ? 'none' : '1px solid var(--borde)',
                borderRadius: 22, overflow: 'hidden', display: 'grid', gridTemplateColumns: '190px 1fr',
                position: 'relative', textDecoration: 'none', cursor: 'pointer',
              };

              const card = (
                <div className="planes-card" style={cardStyle}
                  onClick={isLink ? undefined : () => {
                    if(plan.id==='minimal') setModal('minimal-choose');
                    else if(plan.id==='tengo-mi-diseno') setModal('tengo-choose');
                    else if(plan.id==='premium') window.open(GOOGLE_CALENDAR,'_blank');
                  }}>
                  {plan.destacado && (
                    <span style={{
                      position: 'absolute', top: 14, right: 14, background: 'var(--coral)', color: '#fff',
                      fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', padding: '5px 12px',
                      borderRadius: 999, zIndex: 2,
                    }}>EL MÁS PEDIDO</span>
                  )}
                  {cardInner}
                </div>
              );

              return isLink
                ? <Link key={plan.id} href="/plantillas" style={{ textDecoration: 'none' }}>{card}</Link>
                : <div key={plan.id}>{card}</div>;
            })}
          </div>
        </div>
      </section>

      <Pasos />

      {/* Ayuda */}
      <section style={{ background: 'var(--crema-2)', padding: '56px 32px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-hand)', fontSize: 24, color: 'var(--marron)', margin: '0 0 8px' }}>¿no sabes cuál elegir?</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem,2.6vw,2.1rem)', margin: '0 0 22px', color: 'var(--tinta)' }}>Cuéntanos tu idea y te guiamos</h2>
        <a href={waLink(WA_MESSAGES.general)} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ background: 'var(--marron)', padding: '15px 32px' }}>
          ESCRÍBENOS POR WHATSAPP
        </a>
      </section>

      {/* ── MODAL: Minimal choose ── */}
      {modal==='minimal-choose' && (
        <Overlay onClose={close} kicker={`plan minimal · S/ 70`} title="¿Cómo quieres empezar?" desc="Sube tus 20 fotos aquí mismo y arma tu vista previa, o envíalas directo por WhatsApp.">
          <Btn onClick={()=>setModal('minimal-drop')}>SUBIR MIS FOTOS</Btn>
          <BtnOut href={waLink(WA_MESSAGES.minimal)}>PEDIR POR WHATSAPP</BtnOut>
        </Overlay>
      )}

      {/* ── MODAL: Minimal dropzone ── */}
      {modal==='minimal-drop' && (
        <Overlay onClose={close} title="Sube tus fotos" maxWidth={480}>
          <div
            style={{
              width:'100%', border:`2px dashed ${drag?'var(--coral)':'var(--borde-2)'}`,
              borderRadius:18, padding:'44px 24px', textAlign:'center', cursor:'pointer',
              background: drag ? '#FDF3EC':'#fff', transition:'all 0.15s',
            }}
            onClick={()=>imgRef.current?.click()}
            onDragOver={e=>{e.preventDefault();setDrag(true);}}
            onDragLeave={()=>setDrag(false)}
            onDrop={e=>{e.preventDefault();setDrag(false);addImgs(e.dataTransfer.files);}}>
            <div style={{ fontSize: 34, marginBottom: 10 }}>⤒</div>
            <p style={{ fontWeight: 700, fontSize: 14, margin: '0 0 6px', color: 'var(--tinta)' }}>Arrastra tus fotos aquí</p>
            <p style={{ fontSize: 12.5, color: 'var(--texto-3)', margin: 0 }}>o haz clic para elegirlas · JPG o PNG, alta calidad, enumeradas</p>
            <input ref={imgRef} type="file" multiple accept="image/*" style={{display:'none'}}
              onChange={e=>addImgs(e.target.files)} />
          </div>
          <p style={{ fontFamily: 'var(--font-hand)', fontSize: 19, color: 'var(--texto-3)', margin: '18px 0 0' }}>
            la primera foto será tu portada y la última la contraportada
          </p>
        </Overlay>
      )}

      {/* ── FULLSCREEN: Minimal visualizer ── */}
      {modal==='minimal-viewer' && (
        <Full onBack={()=>setModal('minimal-drop')} onClose={close}>
          <div style={{ maxWidth:380, margin:'0 auto', padding:'32px 20px' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', color:'var(--marron)', fontSize:'2rem', textAlign:'center', marginBottom:28 }}>Minimal</h1>

            {/* Thumbnails */}
            <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4, marginBottom:4 }}>
              {imgs.map((img,i)=>{
                const si = i===0?1:1+Math.ceil(i/2);
                return (
                  <button key={img.id} onClick={()=>setSpread(si)} style={{
                    flexShrink:0, width:52, height:64, padding:0, cursor:'pointer',
                    border:`2px solid ${spread===si?'var(--marron)':'var(--borde)'}`,
                    borderRadius:4, overflow:'hidden', position:'relative',
                  }}>
                    <img src={img.url} style={{width:'100%',height:'100%',objectFit:'cover'}} alt="" />
                    <span style={{ position:'absolute',bottom:0,left:0,right:0,background:'rgba(43,33,28,0.5)',
                      color:'#fff',fontSize:8,textAlign:'center',padding:'1px 0' }}>{i+1}</span>
                  </button>
                );
              })}
              <button onClick={()=>imgRef.current?.click()} style={{
                flexShrink:0, width:52, height:64, border:'2px dashed var(--borde-2)',
                borderRadius:4, background:'#fff', cursor:'pointer', color:'var(--texto-3)', fontSize:20,
              }}>+</button>
              <input ref={imgRef} type="file" multiple accept="image/*" style={{display:'none'}}
                onChange={e=>addImgs(e.target.files)} />
            </div>

            {/* Progress bar */}
            <div style={{ height:3, background:'var(--borde)', borderRadius:2, marginBottom:24, overflow:'hidden' }}>
              <div style={{ height:'100%', borderRadius:2, background:'var(--coral)', transition:'width 0.2s',
                width:`${spreads.length>1?(spread/(spreads.length-1))*100:0}%` }} />
            </div>

            <SpreadBook cur={cur} isSingle={isSingle} />
            <SpreadNav
              spread={spread} total={spreads.length}
              onPrev={()=>setSpread(s=>Math.max(0,s-1))}
              onNext={()=>setSpread(s=>Math.min(spreads.length-1,s+1))}
              label={spread===0?'Portada':spread===spreads.length-1?'Contraportada':`Pliego ${spread}`}
            />

            {/* Notes */}
            <div style={{ marginBottom:24 }}>
              <p style={{ fontSize:11, color:'var(--texto-3)', marginBottom:2 }}>• La primera y última página interna van solas.</p>
              <p style={{ fontSize:11, color:'var(--texto-3)' }}>• Las demás páginas van en pliegos (doble).</p>
            </div>

            <a href={waLink(WA_MESSAGES.minimal)} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display:'flex', width:'100%', background:'var(--marron)' }}>
              COMPRAR
            </a>
          </div>
        </Full>
      )}

      {/* ── MODAL: Tengo diseño choose ── */}
      {modal==='tengo-choose' && (
        <Overlay onClose={close} kicker="tengo mi diseño · S/ 70" title="Envíanos tu archivo" desc="Tu diseño en PDF (A4, 20 páginas) o el link de tu proyecto en Canva.">
          <Btn onClick={()=>pdfRef.current?.click()}>SUBIR MI PDF</Btn>
          <BtnOut href={waLink(WA_MESSAGES.tengoDiseno)}>ENVIAR LINK DE CANVA</BtnOut>
          <input ref={pdfRef} type="file" accept="application/pdf" style={{display:'none'}}
            onChange={e=>addPdf(e.target.files)} />
        </Overlay>
      )}

      {/* ── FULLSCREEN: Tengo diseño viewer ── */}
      {modal==='tengo-viewer' && pdfUrl && (
        <Full onBack={()=>setModal('tengo-choose')} onClose={close}>
          <div style={{ maxWidth:900, margin:'0 auto', padding:'32px 20px' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', color:'var(--marron)', fontSize:'1.8rem', textAlign:'center', marginBottom:16 }}>Tengo mi diseño</h1>
            <p style={{ fontSize:11, color:'var(--texto-3)', textAlign:'center', marginBottom:12 }}>{pdfName}</p>

            <label style={{
              display:'flex', alignItems:'center', gap:8, justifyContent:'center',
              fontSize:12, color:'var(--texto-2)', margin:'0 auto 20px', maxWidth:420,
              textAlign:'center', cursor: pdfLoading ? 'default' : 'pointer', opacity: pdfLoading ? 0.5 : 1,
            }}>
              <input type="checkbox" checked={pdfSplitSpreads} disabled={pdfLoading} onChange={toggleSplitSpreads}
                style={{ width:16, height:16, accentColor:'var(--marron)', flexShrink:0 }} />
              cada hoja de mi PDF trae 2 páginas del álbum, una al lado de la otra
            </label>

            {pdfLoading && (
              <p style={{ fontSize:12.5, color:'var(--texto-3)', textAlign:'center', margin:'0 0 20px' }}>
                Generando vista previa{pdfProgress ? ` (${pdfProgress.done}/${pdfProgress.total})` : '…'}
              </p>
            )}

            {!pdfLoading && pdfError && (
              <>
                <p style={{ fontSize:12.5, color:'var(--texto-3)', textAlign:'center', margin:'0 0 12px' }}>Vista previa no disponible</p>
                <div style={{ border:'1px solid var(--borde)', borderRadius:12, overflow:'hidden', marginBottom:16, height:420, maxWidth:380, marginLeft:'auto', marginRight:'auto' }}>
                  <iframe src={`${pdfUrl}#toolbar=0`} style={{width:'100%',height:'100%',border:'none'}} title="PDF" />
                </div>
              </>
            )}

            {!pdfLoading && !pdfError && pdfPages && <PdfFlipBook pages={pdfPages} />}

            {pdfSendError && (
              <p style={{ fontSize:11, color:'var(--texto-3)', textAlign:'center', margin:'0 0 10px' }}>
                No pudimos subir tu PDF — te escribimos igual, adjúntalo manualmente en el chat.
              </p>
            )}

            <button onClick={handleComprarTengoDiseno} disabled={pdfSending} className="btn-primary"
              style={{ display:'flex', width:'100%', maxWidth:380, margin:'0 auto', background:'var(--marron)', border:'none', cursor: pdfSending?'default':'pointer', opacity: pdfSending?0.7:1 }}>
              {pdfSending ? 'SUBIENDO PDF…' : 'COMPRAR'}
            </button>
          </div>
        </Full>
      )}

      <style>{`
        .planes-card:hover { transform: translateY(-6px); box-shadow: 0 18px 40px rgba(75,46,26,0.15); }
        @media (max-width: 900px) { .planes-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 560px) {
          .planes-card { grid-template-columns: 1fr !important; }
          .planes-card > div:first-child { height: 160px; }
        }
        @media (max-width: 900px) { .planes-pasos-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 640px) { .planes-pasos-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
}

/* ── Primitives ── */
function Pasos() {
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 36 }} className="planes-pasos-grid">
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
    </section>
  );
}

function PdfFlipBook({ pages }: { pages: PdfPreviewPage[] }) {
  const [pageIdx, setPageIdx] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookRef = useRef<any>(null);

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}>
        <div style={{ width:'100%', maxWidth:900 }}>
          <HTMLFlipBook
            ref={bookRef}
            width={460}
            height={650}
            size="stretch"
            minWidth={320}
            maxWidth={560}
            minHeight={453}
            maxHeight={792}
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
            useMouseEvents
            swipeDistance={30}
            showPageCorners
            disableFlipByClick={false}
            className=""
            style={{}}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onFlip={(e: any) => setPageIdx(e.data)}
          >
            {pages.map((p, i) => (
              <div key={i} style={{ background:'#fff' }}>
                <img src={p.url} alt="" style={{ width:'100%', height:'100%', objectFit:'contain', display:'block' }} />
              </div>
            ))}
          </HTMLFlipBook>
        </div>
      </div>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16 }}>
        <button onClick={()=>bookRef.current?.pageFlip()?.flipPrev()} disabled={pageIdx===0}
          style={{ width:32,height:32,borderRadius:'50%',border:'1px solid var(--borde-2)',background:'#fff',
            cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',opacity:pageIdx===0?0.3:1 }}>
          <ChevronLeft size={14} color="var(--marron)" />
        </button>
        <span style={{ fontSize:11, color:'var(--texto-3)', minWidth:80, textAlign:'center' }}>
          Página {pageIdx+1} / {pages.length}
        </span>
        <button onClick={()=>bookRef.current?.pageFlip()?.flipNext()} disabled={pageIdx>=pages.length-2}
          style={{ width:32,height:32,borderRadius:'50%',border:'1px solid var(--borde-2)',background:'#fff',
            cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',opacity:pageIdx>=pages.length-2?0.3:1 }}>
          <ChevronRight size={14} color="var(--marron)" />
        </button>
      </div>
    </div>
  );
}

function SpreadBook({ cur, isSingle }: { cur: ({url:string}|null)[]; isSingle: boolean }) {
  return (
    <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}>
      {isSingle ? (
        <div style={{ width:200,height:260,background:'var(--crema-2)',borderRadius:2,boxShadow:'0 4px 20px rgba(75,46,26,0.15)', overflow:'hidden', position:'relative' }}>
          {cur[0] && <img src={cur[0].url} style={{width:'100%',height:'100%',objectFit:'cover'}} alt="" />}
        </div>
      ) : (
        <div style={{ display:'flex', width:320, height:224, boxShadow:'0 4px 20px rgba(75,46,26,0.15)' }}>
          <div style={{ flex:1, overflow:'hidden', borderRight:'1px solid rgba(255,255,255,0.4)', background:'var(--crema-2)' }}>
            {cur[0]&&<img src={cur[0].url} style={{width:'100%',height:'100%',objectFit:'cover'}} alt="" />}
          </div>
          <div style={{ flex:1, overflow:'hidden', background:'#EFE2D5' }}>
            {cur[1]&&<img src={cur[1].url} style={{width:'100%',height:'100%',objectFit:'cover'}} alt="" />}
          </div>
        </div>
      )}
    </div>
  );
}

function SpreadNav({ spread, total, onPrev, onNext, label }: {
  spread:number; total:number; onPrev:()=>void; onNext:()=>void; label:string;
}) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, marginBottom:12 }}>
      <button onClick={onPrev} disabled={spread===0}
        style={{ width:32,height:32,borderRadius:'50%',border:'1px solid var(--borde-2)',background:'#fff',
          cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',opacity:spread===0?0.3:1 }}>
        <ChevronLeft size={14} color="var(--marron)" />
      </button>
      <span style={{ fontSize:11, color:'var(--texto-3)', minWidth:80, textAlign:'center' }}>{label}</span>
      <button onClick={onNext} disabled={spread===total-1}
        style={{ width:32,height:32,borderRadius:'50%',border:'1px solid var(--borde-2)',background:'#fff',
          cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',opacity:spread===total-1?0.3:1 }}>
        <ChevronRight size={14} color="var(--marron)" />
      </button>
    </div>
  );
}

function Overlay({ kicker, title, desc, onClose, children, maxWidth = 420 }: {
  kicker?: string; title:string; desc?: string; onClose:()=>void; children:React.ReactNode; maxWidth?: number;
}) {
  return (
    <div style={{ position:'fixed',inset:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:16,
      background:'rgba(43,33,28,0.55)', backdropFilter:'blur(3px)' }}
      onClick={onClose}>
      <div className="anim-popIn" style={{ position:'relative',background:'var(--crema)',borderRadius:24,width:'100%',maxWidth,
        padding:'40px 44px',textAlign:'center' }}
        onClick={e=>e.stopPropagation()}>
        <button onClick={onClose} style={{ position:'absolute',top:16,right:20,background:'none',border:'none',
          fontSize:20,color:'var(--texto-3)',cursor:'pointer',lineHeight:1 }}>✕</button>
        {kicker && <p style={{ fontFamily:'var(--font-hand)', fontSize:22, color:'var(--coral)', margin:'0 0 4px' }}>{kicker}</p>}
        <h3 style={{ fontFamily:'var(--font-display)', fontSize:26, margin:'0 0 10px', color:'var(--tinta)' }}>{title}</h3>
        {desc && <p style={{ fontSize:13.5, color:'var(--texto-2)', lineHeight:1.6, margin:'0 0 26px' }}>{desc}</p>}
        <div style={{ display:'flex',flexDirection:'column',gap:12 }}>{children}</div>
      </div>
    </div>
  );
}

function Btn({ onClick, children }: { onClick:()=>void; children:React.ReactNode }) {
  return (
    <button onClick={onClick} className="btn-primary" style={{ background:'var(--coral)', border:'none', width:'100%', padding:'15px 0' }}>
      {children}
    </button>
  );
}

function BtnOut({ href, children }: { href:string; children:React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ width:'100%', padding:'14px 0' }}>
      {children}
    </a>
  );
}

function Full({ children, onBack, onClose }: { children:React.ReactNode; onBack:()=>void; onClose:()=>void }) {
  return (
    <div style={{ position:'fixed',inset:0,zIndex:100,background:'var(--crema)',overflowY:'auto' }}>
      <div style={{ position:'sticky',top:0,background:'var(--crema)',zIndex:10,
        display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 20px',borderBottom:'1px solid var(--borde)' }}>
        <button onClick={onBack} style={{ fontSize:13,color:'var(--texto-3)',cursor:'pointer',background:'none',border:'none' }}>← Volver</button>
        <button onClick={onClose} style={{ fontSize:18,color:'var(--texto-3)',cursor:'pointer',lineHeight:1,background:'none',border:'none' }}>✕</button>
      </div>
      {children}
    </div>
  );
}
