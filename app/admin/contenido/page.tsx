'use client';
import { useEffect, useMemo, useState } from 'react';
import { Upload, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth';
import { mediaUrl } from '@/lib/media';
import { MEDIA_SLOTS, type MediaSlot } from '@/lib/mediaSlots';

const CATEGORIAS = ['parejas', 'viajes', 'cumpleanos', 'familia'] as const;

interface GaleriaRow {
  id: string;
  imagen_url: string;
  descripcion: string | null;
  plantilla: string | null;
  orden: number;
  activo: boolean;
}

export default function AdminContenidoPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
        <div style={{ width: 24, height: 24, border: '2px solid var(--marron)', borderTopColor: 'transparent', borderRadius: '50%' }} className="anim-spin" />
        <style>{`.anim-spin { animation: spin 0.7s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl">
        <h2 className="font-semibold text-lg text-[var(--tinta)]">Contenido</h2>
        <p className="text-sm text-[var(--texto-3)] mt-3 bg-white border border-[var(--borde)] rounded-2xl p-4">
          Esta sección requiere una sesión real de Supabase (no el modo demo). Inicia sesión con tu
          cuenta admin para poder subir o reemplazar imágenes y video.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h2 className="font-semibold text-lg text-[var(--tinta)]">Contenido</h2>
        <p className="text-sm text-[var(--texto-3)] mt-0.5">Imágenes y video que se ven en el sitio — se reemplazan aquí, sin tocar código.</p>
      </div>
      <RecursosFijos />
      <Galeria />
    </div>
  );
}

// ─── Recursos fijos (Hero, Carrusel, Planes, video, Plantillas) ────────────────

function RecursosFijos() {
  const secciones = useMemo(() => {
    const map = new Map<string, MediaSlot[]>();
    for (const slot of MEDIA_SLOTS) {
      if (!map.has(slot.section)) map.set(slot.section, []);
      map.get(slot.section)!.push(slot);
    }
    return [...map.entries()];
  }, []);

  return (
    <div className="space-y-6">
      {secciones.map(([section, slots]) => (
        <div key={section}>
          <p className="text-xs font-bold tracking-widest text-[var(--texto-3)] mb-2" style={{ letterSpacing: '0.12em' }}>
            {section.toUpperCase()}
          </p>
          <div className="space-y-2">
            {slots.map(slot => <SlotRow key={slot.key} slot={slot} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

function SlotRow({ slot }: { slot: MediaSlot }) {
  const [cacheBust, setCacheBust] = useState(0);
  const [missing, setMissing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const src = `${mediaUrl(slot.key)}${cacheBust ? `?t=${cacheBust}` : ''}`;

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const { error } = await supabase.storage
      .from('assets')
      .upload(slot.key, file, { upsert: true, cacheControl: '3600', contentType: file.type });
    setUploading(false);
    if (error) { alert('No se pudo subir: ' + error.message); return; }
    setMissing(false);
    setCacheBust(Date.now());
  };

  return (
    <div className="bg-white border border-[var(--borde)] rounded-2xl p-3 flex items-center gap-3">
      <div style={{
        width: 64, height: 64, borderRadius: 10, overflow: 'hidden', flexShrink: 0,
        background: 'var(--crema-2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: missing ? '1.5px dashed var(--borde-2)' : 'none',
      }}>
        {missing ? (
          <span className="text-[9px] text-center text-[var(--texto-3)] px-1">Sin subir</span>
        ) : slot.tipo === 'video' ? (
          <video src={src} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setMissing(true)} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={slot.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setMissing(true)} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--tinta)]">{slot.label}</p>
        <p className="text-xs text-[var(--texto-3)]">{slot.tipo === 'video' ? 'Video' : 'Imagen'}{slot.recomendado ? ` · ${slot.recomendado}` : ''}</p>
      </div>
      <label className="btn-outline" style={{ padding: '8px 16px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: uploading ? 'default' : 'pointer', opacity: uploading ? 0.6 : 1 }}>
        <Upload size={13} /> {uploading ? 'Subiendo...' : 'Reemplazar'}
        <input
          type="file"
          accept={slot.tipo === 'video' ? 'video/mp4' : 'image/*'}
          disabled={uploading}
          onChange={e => onFile(e.target.files?.[0])}
          style={{ display: 'none' }}
        />
      </label>
    </div>
  );
}

// ─── Galería (lista variable, tabla `galeria`) ─────────────────────────────────

function Galeria() {
  const [rows, setRows] = useState<GaleriaRow[]>([]);
  const [loadingRows, setLoadingRows] = useState(true);
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);

  const load = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('galeria').select('*').order('orden');
    setRows((data ?? []) as GaleriaRow[]);
    setLoadingRows(false);
  };

  useEffect(() => { Promise.resolve().then(() => { load(); }); }, []);

  const toggleActivo = async (row: GaleriaRow) => {
    const supabase = createClient();
    await supabase.from('galeria').update({ activo: !row.activo }).eq('id', row.id);
    setRows(prev => prev.map(r => r.id === row.id ? { ...r, activo: !r.activo } : r));
  };

  const deleteRow = async (id: string) => {
    if (!confirm('¿Eliminar esta foto de la galería?')) return;
    const supabase = createClient();
    await supabase.from('galeria').delete().eq('id', id);
    setRows(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold tracking-widest text-[var(--texto-3)]" style={{ letterSpacing: '0.12em' }}>GALERÍA</p>
        <button onClick={() => setEditingId('new')} className="btn-primary" style={{ background: 'var(--marron)', padding: '8px 16px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={13} /> Agregar foto
        </button>
      </div>

      {loadingRows ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-20 skeleton rounded-2xl" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {editingId === 'new' && (
            <GaleriaForm onDone={() => { setEditingId(null); load(); }} onCancel={() => setEditingId(null)} />
          )}
          {rows.map(row => (
            <div key={row.id}>
              {editingId === row.id ? (
                <GaleriaForm row={row} onDone={() => { setEditingId(null); load(); }} onCancel={() => setEditingId(null)} />
              ) : (
                <div className="bg-white border border-[var(--borde)] rounded-2xl p-3 flex items-center gap-3" style={{ opacity: row.activo ? 1 : 0.5 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'var(--crema-2)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={row.imagen_url} alt={row.descripcion ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--tinta)]">{row.descripcion || '(sin descripción)'}</p>
                    <p className="text-xs text-[var(--texto-3)]">{row.plantilla ?? 'sin categoría'}{!row.activo ? ' · oculta' : ''}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => toggleActivo(row)} className="p-1.5 text-[var(--texto-3)] hover:text-[var(--marron)] transition-colors" title={row.activo ? 'Ocultar' : 'Mostrar'}>
                      {row.activo ? <Check size={14} /> : <X size={14} />}
                    </button>
                    <button onClick={() => setEditingId(row.id)} className="p-1.5 text-[var(--texto-3)] hover:text-[var(--marron)] transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => deleteRow(row.id)} className="p-1.5 text-[var(--texto-3)] hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {rows.length === 0 && editingId !== 'new' && (
            <p className="text-center text-sm text-[var(--texto-3)] py-8">No hay fotos en la galería todavía.</p>
          )}
        </div>
      )}
    </div>
  );
}

function GaleriaForm({ row, onDone, onCancel }: { row?: GaleriaRow; onDone: () => void; onCancel: () => void }) {
  const [descripcion, setDescripcion] = useState(row?.descripcion ?? '');
  const [plantilla, setPlantilla] = useState(row?.plantilla ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const supabase = createClient();
    let imagenUrl = row?.imagen_url;

    if (file) {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from('galeria').upload(path, file, { contentType: file.type });
      if (error) { alert('No se pudo subir la foto: ' + error.message); setSaving(false); return; }
      imagenUrl = supabase.storage.from('galeria').getPublicUrl(path).data.publicUrl;
    }

    if (!imagenUrl) { alert('Elige una foto.'); setSaving(false); return; }

    if (row) {
      await supabase.from('galeria').update({ descripcion: descripcion || null, plantilla: plantilla || null, imagen_url: imagenUrl }).eq('id', row.id);
    } else {
      const { count } = await supabase.from('galeria').select('id', { count: 'exact', head: true });
      await supabase.from('galeria').insert({
        descripcion: descripcion || null, plantilla: plantilla || null, imagen_url: imagenUrl,
        orden: (count ?? 0) + 1, activo: true,
      });
    }
    setSaving(false);
    onDone();
  };

  return (
    <div className={`bg-white rounded-2xl p-4 space-y-3 ${row ? 'border border-[var(--borde)]' : 'border-2'}`} style={row ? undefined : { borderColor: 'rgba(126,69,27,0.2)' }}>
      <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] ?? null)}
        className="w-full border border-[var(--borde-2)] rounded-xl px-3 py-2.5 text-sm outline-none" />
      <input value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripción (ej. 'The Story of Us')"
        className="w-full border border-[var(--borde-2)] rounded-xl px-3 py-2.5 text-sm outline-none" />
      <select value={plantilla} onChange={e => setPlantilla(e.target.value)}
        className="w-full border border-[var(--borde-2)] rounded-xl px-3 py-2.5 text-sm outline-none bg-white">
        <option value="">Sin categoría</option>
        {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <div className="flex gap-2">
        <button onClick={save} disabled={saving || (!row && !file)} className="btn-primary" style={{ background: 'var(--marron)', padding: '8px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, opacity: (saving || (!row && !file)) ? 0.5 : 1 }}>
          <Check size={13} /> {saving ? 'Guardando...' : 'Guardar'}
        </button>
        <button onClick={onCancel} className="btn-outline" style={{ padding: '8px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <X size={13} /> Cancelar
        </button>
      </div>
    </div>
  );
}
