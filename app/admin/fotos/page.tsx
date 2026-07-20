'use client';
import { useEffect, useState } from 'react';
import { MoreVertical, Download, X } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import { listClientesConPedidos, listPedidoFilesConUrl, planLabel, type DriveCliente, type DriveFile } from '@/lib/admin/drive';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Demo (sin sesión Supabase real): igual que antes.
const DEMO_FOLDERS = [
  {id:'1',nombre:'Alejo (2)',           fecha:'creado: 17 julio 2026'},
  {id:'2',nombre:'Kiara Aguayo',         fecha:'creado: 17 julio 2026'},
  {id:'3',nombre:'Dayana (2)',           fecha:'creado: 17 julio 2026'},
  {id:'4',nombre:'Abuelo mari',          fecha:'creado: 17 julio 2026'},
  {id:'5',nombre:'Alina',               fecha:'creado: 17 julio 2026'},
  {id:'6',nombre:'Mireidy',             fecha:'creado: 17 julio 2026'},
  {id:'7',nombre:'Marianella Rengifo',  fecha:'creado: 17 julio 2026'},
  {id:'8',nombre:'Angela Medina',       fecha:'creado: 17 julio 2026'},
];
const DEMO_PHOTOS = Array.from({length:6},(_,i)=>({ id:`p${i}`, url:`https://picsum.photos/seed/${i+20}/400/500` }));

export default function AdminFotosPage() {
  const { user } = useAuth();
  if (!user) return <DemoFotos />;
  return <RealFotos />;
}

// ── Modo demo ──────────────────────────────────────────────────────────────────
function DemoFotos() {
  const [sel, setSel] = useState<typeof DEMO_FOLDERS[0] | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <div>
      <div className="flex justify-end mb-5">
        <button className="btn-primary" style={{ background: 'var(--coral)', padding: '10px 22px', fontSize: 11.5 }}>
          + NUEVO
        </button>
      </div>
      <div className="border-t border-[var(--borde)] mb-5" />

      {!sel ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {DEMO_FOLDERS.map(f => (
            <button key={f.id} onClick={()=>setSel(f)}
              className="bg-white border border-[var(--borde)] rounded-2xl p-4 text-left hover:shadow-sm transition-all">
              <div className="flex items-start justify-between mb-2.5">
                <div>
                  <p className="font-semibold text-[13px] text-[var(--tinta)]">{f.nombre}</p>
                  <p className="text-[10.5px] text-[var(--texto-3)] mt-0.5">{f.fecha}</p>
                </div>
                <MoreVertical size={14} className="text-[var(--texto-3)] flex-shrink-0" />
              </div>
              <div className="bg-[var(--crema-2)] rounded-xl" style={{height:90}} />
            </button>
          ))}
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-5 text-[13px]">
            <button onClick={()=>setSel(null)} className="text-[var(--marron)] hover:underline">Fotos</button>
            <span className="text-[var(--borde-2)]">›</span>
            <span className="font-semibold text-[var(--tinta)]">{sel.nombre}</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {DEMO_PHOTOS.map((p,i) => (
              <div key={p.id} className="relative group aspect-square rounded-xl overflow-hidden bg-[var(--crema-2)] cursor-pointer"
                onClick={()=>setLightbox(p.url)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300" />
                <span className="absolute bottom-1 left-1.5 text-white text-[9px] font-bold bg-black/30 px-1 rounded">{i+1}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85" onClick={()=>setLightbox(null)}>
          <button onClick={()=>setLightbox(null)} className="absolute top-4 right-4 text-white/60 hover:text-white"><X size={24}/></button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="" className="max-w-lg max-h-[80vh] object-contain rounded-xl" onClick={e=>e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

// ── Modo real: solo fotos (excluye PDF), mismo drill cliente → pedido ─────────
function RealFotos() {
  const [clientes, setClientes] = useState<DriveCliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [cliente, setCliente] = useState<DriveCliente | null>(null);
  const [pedidoId, setPedidoId] = useState<string | null>(null);
  const [fotos, setFotos] = useState<DriveFile[]>([]);
  const [fotosLoading, setFotosLoading] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    listClientesConPedidos(supabase)
      .then(setClientes)
      .catch((e) => console.error('Error al listar clientes:', e))
      .finally(() => setLoading(false));
  }, []);

  const abrirPedido = (usuarioId: string, id: string) => {
    setPedidoId(id);
    setFotosLoading(true);
    const supabase = createClient();
    listPedidoFilesConUrl(usuarioId, id, supabase)
      .then((files) => setFotos(files.filter((f) => f.isImage)))
      .catch((e) => console.error('Error al listar fotos:', e))
      .finally(() => setFotosLoading(false));
  };

  const descargarZip = async () => {
    if (!fotos.length) return;
    const zip = new JSZip();
    await Promise.all(fotos.map(async (f) => {
      try {
        const res = await fetch(f.url);
        zip.file(f.name, await res.blob());
      } catch { /* omite fallos individuales */ }
    }));
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${cliente?.nombre ?? 'fotos'}-${pedidoId?.slice(0, 8)}.zip`);
  };

  const pedidoActual = cliente?.pedidos.find((p) => p.id === pedidoId);

  return (
    <div>
      <div className="border-t border-[var(--borde)] mb-5" />

      {loading ? (
        <div className="py-10 text-center text-sm text-[var(--texto-3)]">Cargando clientes...</div>
      ) : clientes.length === 0 ? (
        <div className="py-10 text-center text-sm text-[var(--texto-3)]">Aún no hay pedidos con fotos.</div>
      ) : !cliente ? (
        <div>
          <h2 className="font-semibold text-lg text-[var(--tinta)] mb-5" style={{ fontFamily: 'var(--font-display)' }}>Fotos por cliente</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {clientes.map((c) => (
              <button key={c.usuarioId} onClick={() => setCliente(c)}
                className="bg-white border border-[var(--borde)] rounded-2xl p-4 text-left hover:shadow-sm transition-all">
                <p className="font-semibold text-[13px] text-[var(--tinta)]">{c.nombre}</p>
                <p className="text-[10.5px] text-[var(--texto-3)] mt-0.5">{c.pedidos.length} pedido{c.pedidos.length !== 1 ? 's' : ''}</p>
                <div className="bg-[var(--crema-2)] rounded-xl mt-2.5" style={{height:90}} />
              </button>
            ))}
          </div>
        </div>
      ) : !pedidoId ? (
        <div>
          <div className="flex items-center gap-2 mb-6 text-[13px]">
            <button onClick={() => setCliente(null)} className="text-[var(--marron)] hover:underline">Fotos</button>
            <span className="text-[var(--borde-2)]">›</span>
            <span className="font-semibold text-[var(--tinta)]">{cliente.nombre}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {cliente.pedidos.map((p) => (
              <button key={p.id} onClick={() => abrirPedido(cliente.usuarioId, p.id)}
                className="bg-white border border-[var(--borde)] rounded-2xl p-4 text-left hover:shadow-sm transition-all">
                <p className="font-semibold text-[13px] text-[var(--tinta)]">{p.numero}</p>
                <p className="text-[10.5px] text-[var(--texto-3)] mt-0.5">{planLabel(p.plan)}</p>
                <div className="bg-[var(--crema-2)] rounded-xl mt-2.5" style={{height:90}} />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-5 text-[13px]">
            <button onClick={() => setPedidoId(null)} className="text-[var(--marron)] hover:underline">{cliente.nombre}</button>
            <span className="text-[var(--borde-2)]">›</span>
            <span className="font-semibold text-[var(--tinta)]">{pedidoActual?.numero}</span>
            {fotos.length > 0 && (
              <button onClick={descargarZip} className="btn-primary" style={{ marginLeft: 'auto', background: 'var(--marron)', padding: '8px 16px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Download size={12} /> ZIP
              </button>
            )}
          </div>
          {fotosLoading ? (
            <div className="py-10 text-center text-sm text-[var(--texto-3)]">Cargando fotos...</div>
          ) : fotos.length === 0 ? (
            <div className="py-10 text-center text-sm text-[var(--texto-3)]">Este pedido no tiene fotos.</div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {fotos.map((f, i) => (
                <div key={f.path} className="relative group aspect-square rounded-xl overflow-hidden bg-[var(--crema-2)] cursor-pointer"
                  onClick={() => setLightbox(f.url)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.url} alt="" className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300" />
                  <span className="absolute bottom-1 left-1.5 text-white text-[9px] font-bold bg-black/30 px-1 rounded">{i+1}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85" onClick={()=>setLightbox(null)}>
          <button onClick={()=>setLightbox(null)} className="absolute top-4 right-4 text-white/60 hover:text-white"><X size={24}/></button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="" className="max-w-lg max-h-[80vh] object-contain rounded-xl" onClick={e=>e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
