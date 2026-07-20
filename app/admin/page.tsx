'use client';
import { useEffect, useMemo, useState } from 'react';
import { DEMO_ADMIN_PEDIDOS } from '@/lib/demo';
import { useAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import { ESTADO_LABELS } from '@/types';
import type { Plan, EstadoPedido, Tematica } from '@/types';

const ESTADOS = ['pedido-realizado', 'diseno', 'produccion', 'entrega', 'entregado'] as const;
const RESP = ['mari', 'malú', 'malú y mari'];

const RESP_LABELS: Record<string, string> = { mari: 'Mari', 'malú': 'Malú', 'malú y mari': 'Malú y Mari' };
const RESP_STYLES: Record<string, [string, string]> = {
  mari: ['#A03E6B', '#F9E0EC'], 'malú': ['#B05A1F', '#FBE8D8'], 'malú y mari': ['#5B4B9E', '#E6E1F7'],
};
const ESTADO_STYLES: Record<EstadoPedido, [string, string]> = {
  'pedido-realizado': ['#8A6D00', '#FBF0C9'], diseno: ['#1D5F8A', '#D9EBF5'],
  produccion: ['#6B3FA0', '#EBE0F7'], entrega: ['#3F7A46', '#DDF0DE'], entregado: ['#7B3A1E', '#F6E3D5'],
};
const TEMA_LABELS: Record<Tematica, string> = {
  parejas: 'Parejas', viajes: 'Viajes', cumpleanos: 'Cumpleaños', familia: 'Familia', otro: '—',
};
const TEMA_STYLES: Record<Tematica, [string, string]> = {
  parejas: ['#A03E6B', '#F9E0EC'], viajes: ['#1D5F8A', '#D9EBF5'], cumpleanos: ['#8A6D00', '#FBF0C9'],
  familia: ['#3F7A46', '#DDF0DE'], otro: ['#8A7568', '#F3EBE0'],
};
const AVATARES = ['#E8795A', '#7C9A72', '#5B8FA8', '#B05A1F', '#A03E6B', '#5B4B9E', '#8A6D00'];

interface Row {
  id: string;
  numero: string;
  plan: Plan;
  tematica?: Tematica | null;
  estado: EstadoPedido;
  responsable?: string | null;
  nota_admin?: string | null;
  precio: number;
  cliente_nombre: string;
}

export default function AdminPedidosPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [lote, setLote] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<'todos' | EstadoPedido>('todos');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    if (!user) {
      // Sin sesión Supabase real (modo demo): datos de muestra, edición solo local.
      Promise.resolve().then(() => {
        setRows(DEMO_ADMIN_PEDIDOS.map((p) => ({
          id: p.id, numero: p.numero, plan: p.plan, tematica: p.tematica as Tematica | undefined,
          estado: p.estado, responsable: p.responsable, nota_admin: p.nota_admin,
          precio: p.precio, cliente_nombre: p.profiles?.nombre ?? '—',
        })));
        setLoading(false);
      });
      return;
    }
    const supabase = createClient();
    supabase.from('lotes').select('nombre').eq('activo', true).single()
      .then(({ data }) => setLote(data?.nombre ?? null));
    supabase
      .from('pedidos')
      .select('id, numero, plan, tematica, estado, responsable, nota_admin, precio, profiles(nombre)')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setRows(
            (data as unknown as Array<{
              id: string; numero: string; plan: Plan; tematica: Tematica | null; estado: EstadoPedido;
              responsable: string | null; nota_admin: string | null; precio: number;
              profiles: { nombre: string } | null;
            }>).map((r) => ({
              id: r.id, numero: r.numero, plan: r.plan, tematica: r.tematica, estado: r.estado,
              responsable: r.responsable, nota_admin: r.nota_admin, precio: r.precio,
              cliente_nombre: r.profiles?.nombre ?? '—',
            })),
          );
        }
        setLoading(false);
      });
  }, [user]);

  const upd = (id: string, field: 'estado' | 'responsable' | 'nota_admin', value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    if (user) {
      const supabase = createClient();
      supabase.from('pedidos').update({ [field]: value }).eq('id', id).then(({ error }) => {
        if (error) console.error(`Error al actualizar ${field}:`, error.message);
      });
    }
  };

  const counts = useMemo(() => {
    const c: Partial<Record<EstadoPedido, number>> = {};
    rows.forEach((r) => { c[r.estado] = (c[r.estado] ?? 0) + 1; });
    return c;
  }, [rows]);

  const ingresos = useMemo(() => rows.reduce((sum, r) => sum + (r.precio || 0), 0), [rows]);

  const visibles = rows.filter((r) => {
    if (filtro !== 'todos' && r.estado !== filtro) return false;
    if (busqueda && !`${r.numero} ${r.cliente_nombre}`.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 26, flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-hand)', fontSize: 21, color: 'var(--coral)', margin: 0 }}>lote actual</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, margin: 0, color: 'var(--tinta)' }}>{lote ?? 'Lote actual'}</h1>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          <input placeholder="Buscar pedido o cliente…" value={busqueda} onChange={e => setBusqueda(e.target.value)} style={{
            border: '1.5px solid var(--borde-2)', borderRadius: 999, padding: '11px 20px', fontSize: 13,
            fontFamily: 'var(--font-body)', background: '#fff', outline: 'none', width: 230,
          }} />
          <button className="btn-primary" style={{ background: 'var(--marron)', padding: '12px 22px', fontSize: 11.5 }}>
            + NUEVO PEDIDO
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 26 }} className="admin-stats-grid">
        <StatCard label="PEDIDOS DEL LOTE" valor={String(rows.length)} sub="pedidos activos" color="var(--tinta)" />
        <StatCard label="EN PRODUCCIÓN" valor={String(counts.produccion ?? 0)} sub="imprimiéndose" color="#6B3FA0" />
        <StatCard label="POR ENTREGAR" valor={String(counts.entrega ?? 0)} sub="este domingo" color="#3F7A46" />
        <StatCard label="INGRESOS DEL LOTE" valor={`S/ ${ingresos}`} sub="50% cobrado" color="var(--marron)" />
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
        {(['todos', ...ESTADOS] as const).map((id) => {
          const active = filtro === id;
          const label = id === 'todos' ? 'TODOS' : ESTADO_LABELS[id].toUpperCase();
          const count = id === 'todos' ? rows.length : (counts[id] ?? 0);
          return (
            <button key={id} onClick={() => setFiltro(id)} style={{
              fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', padding: '9px 16px', borderRadius: 999,
              border: `1.5px solid ${active ? 'var(--marron)' : 'var(--borde-2)'}`,
              background: active ? 'var(--marron)' : '#fff', color: active ? '#FBF7F2' : '#8A7568',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
            }}>
              {label}
              <span style={{
                background: active ? 'rgba(251,247,242,0.25)' : 'var(--crema-2)',
                color: active ? '#FBF7F2' : '#8A7568', borderRadius: 999, padding: '2px 8px', fontSize: 10,
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tabla */}
      {loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center', fontSize: 13, color: 'var(--texto-3)' }}>Cargando pedidos...</div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid var(--borde)', borderRadius: 20, overflow: 'hidden' }}>
          <div className="admin-tabla-row admin-tabla-head" style={{
            background: 'var(--crema-2)', fontSize: 10.5, fontWeight: 800, letterSpacing: '0.12em', color: '#8A7568',
          }}>
            <span>N.º</span><span>CLIENTE</span><span>PLAN</span><span>TEMÁTICA</span><span>ESTADO</span><span>RESPONSABLE</span><span></span>
          </div>
          {visibles.map((row, i) => (
            <div key={row.id} className="admin-tabla-row admin-tabla-body-row" style={{ borderTop: '1px solid #F3EBE0' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--marron)' }}>{row.numero}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', background: AVATARES[i % AVATARES.length], flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 800, color: '#FBF7F2',
                }}>
                  {row.cliente_nombre[0]?.toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--tinta)' }}>
                  {row.cliente_nombre}
                </span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--texto-2)', background: 'var(--crema-2)', borderRadius: 999, padding: '5px 12px', justifySelf: 'start' }}>
                {row.plan === 'tengo-mi-diseno' ? 'Tengo mi diseño' : row.plan[0].toUpperCase() + row.plan.slice(1)}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: row.tematica ? TEMA_STYLES[row.tematica][0] : '#8A7568',
                background: row.tematica ? TEMA_STYLES[row.tematica][1] : 'var(--crema-2)',
                borderRadius: 999, padding: '5px 12px', justifySelf: 'start',
              }}>
                {row.tematica ? TEMA_LABELS[row.tematica] : '—'}
              </span>
              <select value={row.estado} onChange={e => upd(row.id, 'estado', e.target.value)} style={{
                fontSize: 11, fontWeight: 800, letterSpacing: '0.04em', color: ESTADO_STYLES[row.estado][0],
                background: ESTADO_STYLES[row.estado][1], border: 'none', borderRadius: 999, padding: '6px 14px',
                cursor: 'pointer', fontFamily: 'var(--font-body)', justifySelf: 'start', outline: 'none', appearance: 'none',
              }}>
                {ESTADOS.map(e => <option key={e} value={e}>{ESTADO_LABELS[e].toUpperCase()}</option>)}
              </select>
              <select value={row.responsable ?? ''} onChange={e => upd(row.id, 'responsable', e.target.value)} style={{
                fontSize: 11, fontWeight: 700, color: row.responsable ? RESP_STYLES[row.responsable]?.[0] : '#8A7568',
                background: row.responsable ? RESP_STYLES[row.responsable]?.[1] : 'var(--crema-2)', border: 'none',
                borderRadius: 999, padding: '5px 12px', cursor: 'pointer', fontFamily: 'var(--font-body)', justifySelf: 'start',
                outline: 'none', appearance: 'none',
              }}>
                <option value="">—</option>
                {RESP.map(r => <option key={r} value={r}>{RESP_LABELS[r]}</option>)}
              </select>
              <input defaultValue={row.nota_admin ?? ''} onBlur={e => upd(row.id, 'nota_admin', e.target.value)}
                placeholder="✎" title="Nota" style={{ fontSize: 13, color: 'var(--texto-3)', background: 'none', border: 'none', outline: 'none', width: '100%' }} />
            </div>
          ))}
          {visibles.length === 0 && (
            <p style={{ textAlign: 'center', padding: 36, fontFamily: 'var(--font-hand)', fontSize: 22, color: 'var(--texto-3)', margin: 0 }}>
              no hay pedidos en este estado
            </p>
          )}
        </div>
      )}
      <p style={{ fontFamily: 'var(--font-hand)', fontSize: 19, color: 'var(--texto-3)', margin: '16px 0 0', textAlign: 'center' }}>
        cambia el estado de un pedido directo desde la tabla — el cliente lo ve al instante en su cuenta
      </p>

      <style>{`
        .admin-tabla-row {
          display: grid; grid-template-columns: 90px 1.3fr 1.1fr 1fr 1.1fr 1fr 40px; gap: 14px;
          padding: 15px 24px; align-items: center;
        }
        .admin-tabla-body-row:hover { background: #FDFAF5; }
        @media (max-width: 900px) { .admin-stats-grid { grid-template-columns: repeat(2,1fr) !important; } }
      `}</style>
    </div>
  );
}

function StatCard({ label, valor, sub, color }: { label: string; valor: string; sub: string; color: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid var(--borde)', borderRadius: 16, padding: '20px 22px' }}>
      <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', color: 'var(--texto-3)', margin: '0 0 8px' }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 30, color, whiteSpace: 'nowrap' }}>{valor}</span>
        <span style={{ fontSize: 12, color: 'var(--texto-3)' }}>{sub}</span>
      </div>
    </div>
  );
}
