'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Pedido, FotoSubida } from '@/types';

// ─── DEMO DATA ────────────────────────────────────────────────────────────────
export const DEMO_USER = {
  id: 'demo-user-001',
  nombre: 'María García',
  email: 'maria@demo.com',
  telefono: '+51 999 888 777',
  role: 'cliente',
};

export const DEMO_ADMIN = {
  id: 'demo-admin-001',
  nombre: 'Administradora',
  email: 'admin@snappageph.com',
  telefono: '+51 922 272 439',
  role: 'admin',
};

export const DEMO_PEDIDOS: Pedido[] = [
  {
    id: 'pedido-001',
    numero: 'SP-1001',
    usuario_id: 'demo-user-001',
    plan: 'personalizado',
    tematica: 'parejas',
    plantilla_id: 'parejas-1',
    portada_id: 'portada-1',
    descripcion: 'Photobook de aniversario con fotos de nuestro viaje a Cusco',
    precio: 90,
    estado: 'diseno',
    lote: 'Lote 13-19 julio',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pedido-002',
    numero: 'SP-1002',
    usuario_id: 'demo-user-001',
    plan: 'minimal',
    tematica: 'viajes',
    descripcion: 'Fotos de mi viaje a Europa 2024',
    precio: 70,
    estado: 'pedido-realizado',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pedido-003',
    numero: 'SP-0998',
    usuario_id: 'demo-user-001',
    plan: 'premium',
    tematica: 'familia',
    descripcion: 'Álbum familiar navideño',
    precio: 120,
    estado: 'entregado',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const DEMO_FOTOS: Record<string, FotoSubida[]> = {
  'pedido-001': [
    { id: 'f1', pedido_id: 'pedido-001', nombre: 'foto_cusco_1', url: 'https://picsum.photos/seed/cusco1/400/500', orden: 0, storage_path: '', created_at: '' },
    { id: 'f2', pedido_id: 'pedido-001', nombre: 'foto_cusco_2', url: 'https://picsum.photos/seed/cusco2/400/500', orden: 1, storage_path: '', created_at: '' },
    { id: 'f3', pedido_id: 'pedido-001', nombre: 'foto_cusco_3', url: 'https://picsum.photos/seed/cusco3/400/500', orden: 2, storage_path: '', created_at: '' },
    { id: 'f4', pedido_id: 'pedido-001', nombre: 'foto_cusco_4', url: 'https://picsum.photos/seed/cusco4/400/500', orden: 3, storage_path: '', created_at: '' },
  ],
  'pedido-002': [],
  'pedido-003': [
    { id: 'f5', pedido_id: 'pedido-003', nombre: 'navidad_familia', url: 'https://picsum.photos/seed/nav1/400/500', orden: 0, storage_path: '', created_at: '' },
  ],
};

export const DEMO_ADMIN_PEDIDOS = [
  { ...DEMO_PEDIDOS[0], profiles: { nombre: 'María García' }, responsable: 'mari', nota_admin: '' },
  { ...DEMO_PEDIDOS[1], profiles: { nombre: 'María García' }, responsable: 'malu', nota_admin: '' },
  { id: 'p-admin-1', numero: 'SP-0995', usuario_id: 'u2', plan: 'personalizado' as const, tematica: 'parejas' as const, precio: 90, estado: 'entregado' as const, created_at: '', updated_at: '', profiles: { nombre: 'Camila Díaz' }, responsable: 'malu', nota_admin: '', descripcion: '' },
  { id: 'p-admin-2', numero: 'SP-0996', usuario_id: 'u3', plan: 'tengo-mi-diseno' as const, precio: 70, estado: 'entregado' as const, created_at: '', updated_at: '', profiles: { nombre: 'Alina Torres' }, responsable: 'mari', nota_admin: 'YA ENVIÓ SUS FOTOS', descripcion: '' },
  { id: 'p-admin-3', numero: 'SP-0997', usuario_id: 'u4', plan: 'minimal' as const, precio: 70, estado: 'produccion' as const, created_at: '', updated_at: '', profiles: { nombre: 'Abuelo mari' }, responsable: 'mari', nota_admin: '', descripcion: '' },
  { id: 'p-admin-4', numero: 'SP-0999', usuario_id: 'u5', plan: 'premium' as const, precio: 120, estado: 'diseno' as const, created_at: '', updated_at: '', profiles: { nombre: 'Angela Medina' }, responsable: 'mari', nota_admin: 'RECURRENTE', descripcion: '' },
];

// ─── CONTEXT ──────────────────────────────────────────────────────────────────
interface DemoCtx {
  demoUser: typeof DEMO_USER | typeof DEMO_ADMIN | null;
  isDemo: boolean;
  demoLogin: (role?: 'cliente' | 'admin') => void;
  demoLogout: () => void;
}

const DemoContext = createContext<DemoCtx>({
  demoUser: null, isDemo: true,
  demoLogin: () => {}, demoLogout: () => {},
});

export function DemoProvider({ children }: { children: ReactNode }) {
  const [demoUser, setDemoUser] = useState<typeof DEMO_USER | typeof DEMO_ADMIN | null>(null);

  useEffect(() => {
    Promise.resolve().then(() => {
      const saved = sessionStorage.getItem('demo_user');
      if (saved) setDemoUser(JSON.parse(saved));
    });
  }, []);

  const demoLogin = (role: 'cliente' | 'admin' = 'cliente') => {
    const u = role === 'admin' ? DEMO_ADMIN : DEMO_USER;
    setDemoUser(u);
    sessionStorage.setItem('demo_user', JSON.stringify(u));
  };

  const demoLogout = () => {
    setDemoUser(null);
    sessionStorage.removeItem('demo_user');
  };

  return (
    <DemoContext.Provider value={{ demoUser, isDemo: true, demoLogin, demoLogout }}>
      {children}
    </DemoContext.Provider>
  );
}

export const useDemo = () => useContext(DemoContext);
