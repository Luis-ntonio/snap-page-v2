import type { PlantillaLayout } from '@/types';
import { parejas } from './parejas';
import { cumpleanos } from './cumpleanos';
import { viajes } from './viajes';

// Registro de plantillas del plan Personalizado (id = categoría).
export const PLANTILLA_LAYOUTS: Record<string, PlantillaLayout> = {
  parejas,
  cumpleanos,
  viajes,
};

export function getPlantillaLayout(id: string): PlantillaLayout | null {
  return PLANTILLA_LAYOUTS[id] ?? null;
}

export const PLANTILLA_IDS = Object.keys(PLANTILLA_LAYOUTS);
