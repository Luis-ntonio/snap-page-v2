export type Plan = 'minimal' | 'personalizado' | 'tengo-mi-diseno' | 'premium';

export type EstadoPedido =
  | 'pedido-realizado'
  | 'diseno'
  | 'produccion'
  | 'entrega'
  | 'entregado';

export type Tematica = 'parejas' | 'cumpleanos' | 'viajes' | 'familia' | 'otro';

export interface Usuario {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  created_at: string;
}

export interface Pedido {
  id: string;
  numero: string;
  usuario_id: string;
  usuario?: Usuario;
  plan: Plan;
  tematica?: Tematica;
  plantilla_id?: string;
  portada_id?: string;
  descripcion?: string;
  precio: number;
  estado: EstadoPedido;
  lote?: string;
  responsable?: string;
  nota_admin?: string;
  canva_link?: string;
  created_at: string;
  updated_at: string;
}

export interface FotoSubida {
  id: string;
  pedido_id: string;
  nombre: string;
  url: string;
  orden: number;
  storage_path: string;
  created_at: string;
}

export interface Plantilla {
  id: string;
  nombre: string;
  categoria: Tematica;
  descripcion?: string;
  hojas: number;
  fotos: number;
  imagen_preview: string;
  imagenes_interiores: string[];
}

export interface Portada {
  id: string;
  nombre: string;
  imagen: string;
  categorias: Tematica[];
}

export interface GaleriaItem {
  id: string;
  imagen_url: string;
  descripcion?: string;
  plan?: Plan;
  plantilla?: string;
  orden: number;
}

export interface FaqItem {
  id: string;
  pregunta: string;
  respuesta: string;
  orden: number;
}

export interface Lote {
  id: string;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
}

export interface Carpeta {
  id: string;
  nombre: string;
  lote_id?: string;
  tipo: 'cliente' | 'compaginados' | 'portadas';
  parent_id?: string;
  created_at: string;
}

export interface ArchivoAdmin {
  id: string;
  carpeta_id: string;
  nombre: string;
  url: string;
  tipo: 'compaginado' | 'portada' | 'foto';
  storage_path: string;
  created_at: string;
}

// ─── EDITOR DE ÁLBUM (plan Personalizado) ────────────────────────────────────
// Coordenadas en fracciones 0-1 relativas a la página (independiente del tamaño de render).
export interface SlotRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PhotoSlot extends SlotRect {
  /** Número visible de la foto (1..N), el orden que el cliente ve en la plantilla. */
  n: number;
  shape?: 'rect' | 'polaroid' | 'camera';
  /** Rotación en grados (para polaroids). */
  rotate?: number;
}

export interface TextSlot extends SlotRect {
  key: string; // ej. 'texto-1'
  /** Texto de diseño fijo (ej. "Feliz aniversario"); si es editable, sirve de placeholder. */
  preset?: string;
  placeholder?: string;
  editable?: boolean;
  align?: 'left' | 'center' | 'right';
  color?: string;
  /** Tamaño de fuente como fracción de la altura de página (ej. 0.05). */
  size?: number;
  italic?: boolean;
  weight?: number;
}

export interface FrameLayer {
  /** Ruta del SVG del marco bajo /public, ej. '/images/plantillas/marcos/12.svg'. */
  src: string;
  /** background-size CSS. '200% 100%' para marcos cuyo viewBox es un spread de 2 páginas
   *  y en esta página solo se muestra la mitad izquierda o derecha del arte. */
  size?: string;
  /** background-position CSS, ej. 'left center' | 'right center'. */
  position?: string;
}

export interface AlbumPageLayout {
  /** Color de fondo de la página. */
  bg?: string;
  /** Patrón decorativo opcional (fondo fijo, no editable por el cliente). */
  pattern?: 'hearts' | 'landscape' | 'none';
  /** Marco/borde decorativo (imagen SVG), pintado como fondo detrás de los slots de foto. */
  frame?: FrameLayer;
  slots: PhotoSlot[];
  texts?: TextSlot[];
}

export interface PlantillaLayout {
  id: string; // 'parejas' | 'cumpleanos' | 'viajes'
  categoria: Tematica;
  nombre: string; // 'Mi Pareja'
  hojas: number;
  fotos: number;
  /** Relación de aspecto ancho/alto de cada página (A4 vertical ≈ 0.707). */
  aspect: number;
  /** Páginas individuales en orden de lectura (portada, internas, contraportada). */
  pages: AlbumPageLayout[];
}

/** Borrador del álbum en edición (persistido en IndexedDB). */
export interface AlbumDraft {
  plantillaId: string;
  photos: Record<number, Blob>; // slot.n → imagen
  texts: Record<string, string>; // textSlot.key → valor
  portadaId?: string | null;
  updatedAt: number;
}

export const PLAN_LABELS: Record<Plan, string> = {
  minimal: 'Minimal',
  personalizado: 'Personalizado',
  'tengo-mi-diseno': 'Tengo mi Diseño',
  premium: 'Premium',
};

export const PLAN_PRICES: Record<Plan, string> = {
  minimal: 'S/.70',
  personalizado: 'S/.90',
  'tengo-mi-diseno': 'S/.70',
  premium: 'S/.120',
};

export const ESTADO_LABELS: Record<EstadoPedido, string> = {
  'pedido-realizado': 'Pedido realizado',
  diseno: 'Diseño',
  produccion: 'Producción',
  entrega: 'Entrega',
  entregado: 'Entregado',
};

export const ESTADO_BADGE: Record<EstadoPedido, string> = {
  'pedido-realizado': 'badge-realizado',
  diseno: 'badge-diseno',
  produccion: 'badge-produccion',
  entrega: 'badge-entrega',
  entregado: 'badge-entregado',
};
