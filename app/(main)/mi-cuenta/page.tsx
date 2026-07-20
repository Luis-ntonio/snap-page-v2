'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDemo, DEMO_PEDIDOS, DEMO_FOTOS } from '@/lib/demo';
import { useAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import { uploadFoto, signedUrl, BUCKET_FOTOS } from '@/lib/supabase/storage';
import { waLink, WA_MESSAGES } from '@/lib/data';
import { FolderOpen, Plus, Upload, Download, Pencil, Check, X } from 'lucide-react';
import type { Pedido, FotoSubida, EstadoPedido, Tematica } from '@/types';
import { PLAN_LABELS } from '@/types';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

type Tab = 'pedidos' | 'datos' | 'fotos';

const ESTADOS: EstadoPedido[] = ['pedido-realizado', 'diseno', 'produccion', 'entrega', 'entregado'];
const ETAPAS = ['Pedido', 'Diseño', 'Producción', 'Entrega', 'Entregado'];
const TEMATICA_LABELS: Record<Tematica, string> = {
  parejas: 'Parejas', cumpleanos: 'Cumpleaños', viajes: 'Viajes', familia: 'Familia', otro: '',
};

async function resolveFotos(rows: FotoSubida[], supabase: ReturnType<typeof createClient>): Promise<Record<string, FotoSubida[]>> {
  const withUrls = await Promise.all(rows.map(async (f) => ({
    ...f,
    url: await signedUrl(f.storage_path, 60 * 60, supabase).catch(() => f.url),
  })));
  const map: Record<string, FotoSubida[]> = {};
  for (const f of withUrls) (map[f.pedido_id] ??= []).push(f);
  return map;
}

export default function MiCuentaPage() {
  const router = useRouter();
  const { demoUser, demoLogout } = useDemo();
  const { user, signOut } = useAuth();
  const sesion = user ?? demoUser;

  const [tab, setTab] = useState<Tab>('pedidos');
  const [pedidos, setPedidos] = useState<Pedido[]>(user ? [] : DEMO_PEDIDOS);
  const [fotosMap, setFotosMap] = useState<Record<string, FotoSubida[]>>(user ? {} : DEMO_FOTOS);
  const [loadingPedidos, setLoadingPedidos] = useState(!!user);
  const [editNombre, setEditNombre] = useState(sesion?.nombre ?? '');
  const [editTel, setEditTel] = useState(sesion?.telefono ?? '');
  const [profileMsg, setProfileMsg] = useState('');

  useEffect(() => {
    if (!sesion) router.push('/login');
  }, [sesion]);

  // Carga pedidos + fotos reales del usuario autenticado.
  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    (async () => {
      const { data: pedidosData } = await supabase
        .from('pedidos').select('*').eq('usuario_id', user.id).order('created_at', { ascending: false });
      const rows = (pedidosData ?? []) as Pedido[];
      setPedidos(rows);

      const ids = rows.map((p) => p.id);
      if (ids.length) {
        const { data: fotosData } = await supabase
          .from('fotos_subidas').select('*').in('pedido_id', ids).order('orden');
        setFotosMap(await resolveFotos((fotosData ?? []) as FotoSubida[], supabase));
      }
      setLoadingPedidos(false);
    })();
  }, [user]);

  if (!sesion) return null;

  const handleLogout = async () => {
    await signOut();
    demoLogout();
    router.push('/');
  };

  const saveProfile = async () => {
    if (user) {
      const supabase = createClient();
      const { error } = await supabase.from('profiles').update({ nombre: editNombre, telefono: editTel }).eq('id', user.id);
      setProfileMsg(error ? 'No se pudo guardar' : '¡Datos actualizados!');
    } else {
      setProfileMsg('¡Datos actualizados!');
    }
    setTimeout(() => setProfileMsg(''), 2500);
  };

  const handleDownloadZip = async (pedidoId: string) => {
    const fotos = fotosMap[pedidoId] ?? [];
    if (!fotos.length) { alert('No hay fotos en este pedido.'); return; }
    const zip = new JSZip();
    await Promise.all(fotos.map(async (f, i) => {
      try {
        const res = await fetch(f.url);
        const blob = await res.blob();
        zip.file(`${String(i + 1).padStart(2, '0')}_${f.nombre}.jpg`, blob);
      } catch {}
    }));
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `SnapPage_${pedidoId.slice(0, 8)}.zip`);
  };

  const addFoto = async (pedidoId: string, file: File) => {
    if (!user) {
      const newFoto: FotoSubida = {
        id: `demo-${Date.now()}`,
        pedido_id: pedidoId,
        nombre: file.name.replace(/\.[^.]+$/, ''),
        url: URL.createObjectURL(file),
        orden: (fotosMap[pedidoId]?.length ?? 0),
        storage_path: '',
        created_at: new Date().toISOString(),
      };
      setFotosMap(prev => ({ ...prev, [pedidoId]: [...(prev[pedidoId] ?? []), newFoto] }));
      return;
    }
    const supabase = createClient();
    const orden = fotosMap[pedidoId]?.length ?? 0;
    const ext = file.name.split('.').pop() || 'jpg';
    const nombre = file.name.replace(/\.[^.]+$/, '');
    try {
      const storagePath = await uploadFoto(user.id, pedidoId, file, `extra-${Date.now()}.${ext}`, supabase);
      const { data, error } = await supabase
        .from('fotos_subidas')
        .insert({ pedido_id: pedidoId, nombre, storage_path: storagePath, url: storagePath, orden })
        .select().single();
      if (error || !data) throw error;
      const url = await signedUrl(storagePath, 60 * 60, supabase);
      setFotosMap(prev => ({ ...prev, [pedidoId]: [...(prev[pedidoId] ?? []), { ...(data as FotoSubida), url }] }));
    } catch (err) {
      console.error('Error al subir foto:', err);
    }
  };

  const deleteFoto = async (pedidoId: string, fotoId: string) => {
    if (user) {
      const foto = fotosMap[pedidoId]?.find((f) => f.id === fotoId);
      const supabase = createClient();
      if (foto?.storage_path) await supabase.storage.from(BUCKET_FOTOS).remove([foto.storage_path]);
      await supabase.from('fotos_subidas').delete().eq('id', fotoId);
    }
    setFotosMap(prev => ({ ...prev, [pedidoId]: prev[pedidoId].filter(f => f.id !== fotoId) }));
  };

  const renameFoto = async (pedidoId: string, fotoId: string, name: string) => {
    if (user) {
      const supabase = createClient();
      await supabase.from('fotos_subidas').update({ nombre: name }).eq('id', fotoId);
    }
    setFotosMap(prev => ({
      ...prev,
      [pedidoId]: prev[pedidoId].map(f => f.id === fotoId ? { ...f, nombre: name } : f),
    }));
  };

  return (
    <main style={{ padding: '48px 32px 88px' }}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 30, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-hand)', fontSize: 24, color: 'var(--coral)', margin: '0 0 6px' }}>tu espacio</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.9rem,3vw,2.6rem)', margin: 0, color: 'var(--tinta)' }}>Mi cuenta</h1>
          </div>
          <button onClick={handleLogout} className="btn-outline" style={{ padding: '9px 18px', fontSize: 12 }}>SALIR</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, borderBottom: '1px solid var(--borde)' }}>
          {([
            { id: 'pedidos', label: 'MIS PEDIDOS' },
            { id: 'fotos', label: 'MIS FOTOS' },
            { id: 'datos', label: 'MIS DATOS' },
          ] as const).map(t => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', padding: '12px 22px', border: 'none',
                background: 'none', color: active ? 'var(--marron)' : 'var(--texto-3)', cursor: 'pointer',
                borderBottom: `2.5px solid ${active ? 'var(--coral)' : 'transparent'}`, marginBottom: -1, transition: 'all 0.2s',
              }}>
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ─── PEDIDOS ─── */}
        {tab === 'pedidos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {loadingPedidos ? (
              <div style={{ padding: '40px 0', textAlign: 'center', fontSize: 13, color: 'var(--texto-3)' }}>Cargando pedidos...</div>
            ) : pedidos.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', fontSize: 13, color: 'var(--texto-3)' }}>Todavía no tienes pedidos.</div>
            ) : pedidos.map(pedido => {
              const estadoIdx = ESTADOS.indexOf(pedido.estado);
              const tematicaLabel = pedido.tematica ? TEMATICA_LABELS[pedido.tematica] : '';
              return (
                <div key={pedido.id} style={{ background: '#fff', border: '1px solid var(--borde)', borderRadius: 20, padding: '26px 30px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--marron)' }}>{pedido.numero}</span>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--texto-2)', background: 'var(--crema-2)', borderRadius: 999, padding: '6px 14px' }}>
                      {PLAN_LABELS[pedido.plan]}{tematicaLabel ? ` · ${tematicaLabel}` : ''}
                    </span>
                    <span style={{ fontFamily: 'var(--font-hand)', fontSize: 19, color: 'var(--texto-3)' }}>
                      {new Date(pedido.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <span style={{ marginLeft: 'auto', fontWeight: 800, fontSize: 15, color: 'var(--tinta)' }}>S/ {pedido.precio}</span>
                  </div>

                  {/* Timeline de estado */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {ETAPAS.map((label, i) => {
                      const done = i < estadoIdx;
                      const current = i === estadoIdx;
                      const bg = done ? 'var(--verde-ok)' : current ? 'var(--coral)' : 'var(--crema)';
                      const borde = done ? 'var(--verde-ok)' : current ? 'var(--coral)' : 'var(--borde-2)';
                      const conLinea = i < ETAPAS.length - 1;
                      return (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', flex: conLinea ? 1 : '0 0 auto' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, minWidth: 64 }}>
                            <div style={{
                              width: 26, height: 26, borderRadius: '50%', background: bg, border: `2px solid ${borde}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#FBF7F2',
                            }}>
                              {done ? '✓' : current ? '●' : ''}
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', color: i <= estadoIdx ? 'var(--tinta)' : '#C9B8A8', textAlign: 'center' }}>
                              {label}
                            </span>
                          </div>
                          {conLinea && (
                            <div style={{ flex: 1, height: 2, background: done ? 'var(--verde-ok)' : 'var(--borde)', margin: '0 4px 20px' }} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', gap: 12, marginTop: 22, flexWrap: 'wrap' }}>
                    <a href={waLink(WA_MESSAGES.pedido(pedido.numero))} target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ padding: '10px 20px', fontSize: 11.5 }}>
                      CONSULTAR POR WHATSAPP
                    </a>
                    <button onClick={() => setTab('fotos')} style={{
                      fontSize: 11.5, fontWeight: 800, letterSpacing: '0.08em', color: '#8A7568',
                      background: 'none', border: 'none', cursor: 'pointer',
                    }}>
                      VER MIS FOTOS →
                    </button>
                  </div>
                </div>
              );
            })}
            <a href="/planes" className="nuevo-pedido-card" style={{
              border: '2px dashed var(--borde-2)', borderRadius: 20, padding: 30, textAlign: 'center',
              textDecoration: 'none', transition: 'border-color 0.2s, background 0.2s',
            }}>
              <span style={{ fontFamily: 'var(--font-hand)', fontSize: 24, color: 'var(--coral)' }}>+ empezar un nuevo photobook</span>
            </a>
          </div>
        )}

        {/* ─── FOTOS (Drive view) ─── */}
        {tab === 'fotos' && (
          <FotosDriveTab pedidos={pedidos} fotosMap={fotosMap} loading={loadingPedidos}
            onAdd={addFoto} onDelete={deleteFoto} onRename={renameFoto} onDownloadZip={handleDownloadZip} />
        )}

        {/* ─── DATOS ─── */}
        {tab === 'datos' && (
          <div style={{ background: '#fff', border: '1px solid var(--borde)', borderRadius: 20, padding: 34, maxWidth: 460 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, margin: '0 0 22px', color: 'var(--tinta)' }}>Mis datos</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="NOMBRE" value={editNombre} onChange={setEditNombre} />
              <Field label="TELÉFONO" value={editTel} onChange={setEditTel} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <label style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', color: 'var(--texto-3)' }}>CORREO</label>
                <input value={sesion.email ?? ''} disabled style={{
                  border: '1.5px solid var(--borde)', borderRadius: 12, padding: '13px 16px', fontSize: 14,
                  fontFamily: 'var(--font-body)', background: 'var(--crema-2)', color: 'var(--texto-3)', outline: 'none',
                }} />
              </div>
              {profileMsg && <p style={{ fontSize: 13, color: 'var(--verde-ok)', margin: 0 }}>{profileMsg}</p>}
              <button onClick={saveProfile} className="btn-primary" style={{ background: 'var(--marron)', border: 'none', width: '100%', padding: '14px 0', marginTop: 6 }}>
                GUARDAR CAMBIOS
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .nuevo-pedido-card:hover { border-color: var(--coral); background: #FDF3EC; }
      `}</style>
    </main>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <label style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', color: 'var(--texto-3)' }}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} style={{
        border: '1.5px solid var(--borde-2)', borderRadius: 12, padding: '13px 16px', fontSize: 14,
        fontFamily: 'var(--font-body)', background: 'var(--crema)', outline: 'none', transition: 'border-color 0.2s',
      }}
        onFocus={e => (e.currentTarget.style.borderColor = 'var(--coral)')}
        onBlur={e => (e.currentTarget.style.borderColor = 'var(--borde-2)')} />
    </div>
  );
}

// ── Drive-style fotos tab (todos los pedidos, estilo carpetas) ────────────────
function FotosDriveTab({ pedidos, fotosMap, loading, onAdd, onDelete, onRename, onDownloadZip }: {
  pedidos: Pedido[]; fotosMap: Record<string, FotoSubida[]>; loading: boolean;
  onAdd: (id: string, f: File) => void; onDelete: (id: string, fotoId: string) => void;
  onRename: (id: string, fotoId: string, n: string) => void; onDownloadZip: (id: string) => void;
}) {
  const [selected, setSelected] = useState<Pedido | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const fotos = selected ? (fotosMap[selected.id] ?? []) : [];

  if (loading) return <div style={{ padding: '40px 0', textAlign: 'center', fontSize: 13, color: 'var(--texto-3)' }}>Cargando...</div>;

  if (!selected) return (
    <div>
      {pedidos.length === 0 ? (
        <div style={{ padding: '40px 0', textAlign: 'center', fontSize: 13, color: 'var(--texto-3)' }}>Todavía no tienes pedidos.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 16 }}>
          {pedidos.map(p => (
            <button key={p.id} onClick={() => setSelected(p)} style={{
              background: '#fff', border: '1px solid var(--borde)', borderRadius: 16, padding: 18, textAlign: 'left', cursor: 'pointer',
            }}>
              <FolderOpen size={26} color="var(--marron)" style={{ marginBottom: 8 }} />
              <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--tinta)', margin: 0 }}>{p.numero}</p>
              <p style={{ fontSize: 12, color: 'var(--texto-3)', margin: '2px 0 0' }}>{PLAN_LABELS[p.plan]}</p>
              <p style={{ fontSize: 12, color: 'var(--texto-3)', margin: '4px 0 0' }}>{fotosMap[p.id]?.length ?? 0} fotos</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, margin: '0 0 4px', color: 'var(--tinta)' }}>Fotos del pedido {selected.numero}</h3>
          <p style={{ fontSize: 12.5, color: 'var(--texto-3)', margin: 0 }}>{fotos.length} fotos subidas · se enumeran solas en el orden que las subes</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={() => setSelected(null)} style={{ fontSize: 12, color: 'var(--texto-3)', background: 'none', border: 'none', cursor: 'pointer' }}>← Mis fotos</button>
          {fotos.length > 0 && (
            <button onClick={() => onDownloadZip(selected.id)} className="btn-outline" style={{ padding: '10px 16px', fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Download size={13} /> ZIP
            </button>
          )}
          <button onClick={() => fileRef.current?.click()} className="btn-primary" style={{ background: 'var(--coral)', padding: '12px 22px', fontSize: 11.5 }}>
            ⤒ SUBIR FOTOS
          </button>
          <input ref={fileRef} type="file" multiple accept="image/*" style={{ display: 'none' }}
            onChange={e => Array.from(e.target.files ?? []).forEach(f => onAdd(selected.id, f))} />
        </div>
      </div>

      {fotos.length === 0 ? (
        <div onClick={() => fileRef.current?.click()} style={{
          border: '2px dashed var(--borde-2)', borderRadius: 16, padding: 44, textAlign: 'center', cursor: 'pointer',
        }}>
          <Upload size={22} color="var(--borde-2)" style={{ margin: '0 auto 8px' }} />
          <p style={{ fontSize: 13, color: 'var(--texto-3)', margin: 0 }}>Sube tus fotos</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 12 }} className="fotos-drive-grid">
          {fotos.map((f, i) => (
            <div key={f.id} className="foto-drive-item" style={{ position: 'relative' }}>
              <div style={{ aspectRatio: '1', borderRadius: 10, overflow: 'hidden', background: 'var(--crema-2)' }}>
                <img src={f.url} alt={f.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <span style={{ position: 'absolute', top: 6, left: 6, background: 'rgba(43,33,28,0.55)', color: '#fff', fontSize: 9, fontFamily: 'monospace', padding: '1px 5px', borderRadius: 4 }}>{i + 1}</span>
              <button onClick={() => onDelete(selected.id, f.id)} className="foto-drive-btn" style={{
                position: 'absolute', top: 6, right: 6, width: 20, height: 20, borderRadius: '50%', background: '#c0392b',
                color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
                <X size={11} />
              </button>
              {editId === f.id ? (
                <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                  <input autoFocus value={editName} onChange={e => setEditName(e.target.value)} style={{
                    flex: 1, fontSize: 11, border: '1.5px solid var(--coral)', borderRadius: 6, padding: '3px 6px', minWidth: 0,
                  }} />
                  <button onClick={() => { onRename(selected.id, f.id, editName); setEditId(null); }} style={{ color: 'var(--verde-ok)', background: 'none', border: 'none', cursor: 'pointer' }}><Check size={13} /></button>
                  <button onClick={() => setEditId(null)} style={{ color: 'var(--texto-3)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={13} /></button>
                </div>
              ) : (
                <div className="foto-drive-btn" style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <span style={{ flex: 1, fontSize: 11, color: 'var(--texto-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.nombre}</span>
                  <button onClick={() => { setEditId(f.id); setEditName(f.nombre); }} style={{ color: 'var(--texto-3)', background: 'none', border: 'none', cursor: 'pointer' }}><Pencil size={12} /></button>
                </div>
              )}
            </div>
          ))}
          <div onClick={() => fileRef.current?.click()} style={{
            aspectRatio: '1', borderRadius: 10, border: '2px dashed var(--borde-2)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--borde-2)', fontSize: 22,
          }}>
            <Plus />
          </div>
        </div>
      )}
      <style>{`
        @media (max-width: 640px) { .fotos-drive-grid { grid-template-columns: repeat(3,1fr) !important; } }
      `}</style>
    </div>
  );
}
