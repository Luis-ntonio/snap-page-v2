import { PLAN_PRICES } from '@/types';

/**
 * Reglas de precio extra por páginas — VALORES DE EJEMPLO, confirmar montos reales con el negocio.
 * Los planes Minimal y Tengo mi diseño incluyen hasta BASE_PAGE_LIMIT páginas en el precio base;
 * cada EXTRA_PAGE_BLOCK páginas adicionales suman EXTRA_PAGE_PRICE.
 */
export const BASE_PAGE_LIMIT = 20; // TODO confirmar con el negocio
export const EXTRA_PAGE_BLOCK = 2; // cada 2 páginas extra…
export const EXTRA_PAGE_PRICE = 5; // …+S/5 — TODO confirmar con el negocio

/** Múltiplo válido de páginas: portada + contraportada + interiores en bloques de 4. */
export const PAGE_STEP = 4;
export const PAGE_OFFSET = 2; // portada + contraportada

export function esCantidadValida(totalPaginas: number): boolean {
  return totalPaginas >= PAGE_OFFSET && (totalPaginas - PAGE_OFFSET) % PAGE_STEP === 0;
}

/** Siguientes cantidades válidas de páginas a partir de 0, para mostrar como ejemplo en mensajes de error. */
export const CANTIDADES_VALIDAS_EJEMPLO = [6, 10, 14, 18, 22];

function parsePrecioBase(precio: string): number {
  // Formato de PLAN_PRICES es "S/.70" (símbolo de soles + monto entero), no un decimal — se descarta todo lo que no sea dígito.
  const n = parseInt(precio.replace(/\D/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
}

export const PRECIO_BASE_MINIMAL = parsePrecioBase(PLAN_PRICES.minimal);
export const PRECIO_BASE_TENGO_DISENO = parsePrecioBase(PLAN_PRICES['tengo-mi-diseno']);

export interface CalculoPrecio {
  base: number;
  extra: number;
  total: number;
  paginasExtra: number;
}

export function calcularPrecio(totalPaginas: number, base: number): CalculoPrecio {
  const paginasExtra = Math.max(0, totalPaginas - BASE_PAGE_LIMIT);
  const extra = Math.ceil(paginasExtra / EXTRA_PAGE_BLOCK) * EXTRA_PAGE_PRICE;
  return { base, extra, total: base + extra, paginasExtra };
}

export function formatSoles(monto: number): string {
  return `S/ ${monto}`;
}
