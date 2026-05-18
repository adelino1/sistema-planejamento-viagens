import { Trip } from '../../models/trip.model';

/**
 * Imagens curadas (Unsplash — uso conforme licença Unsplash).
 * Variam por destino para evitar monotonia em listas e galerias.
 */
export const TRAVEL_HERO_HOME =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=2400&q=85';

export const TRAVEL_HERO_AUTH =
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=85';

const TRAVEL_POOL = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1493976040374-85c8e12e0bff?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1526778548025-f6c948cdd0db?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1527004013197-936c4cc39f91?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
] as const;

const MAP_STYLE =
  'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80';

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Imagem de capa para cards e listas (determinística por cidade/país/nome). */
export function coverImageForTrip(trip: Pick<Trip, 'id' | 'name' | 'city' | 'country'>): string {
  const seed = `${trip.city}|${trip.country}|${trip.name}|${trip.id}`;
  return TRAVEL_POOL[hashSeed(seed) % TRAVEL_POOL.length];
}

/** Galeria estilo “destino” (rotação pelo id da viagem). */
export function galleryImagesForTrip(trip: Pick<Trip, 'id'>): string[] {
  const start = trip.id % TRAVEL_POOL.length;
  const out: string[] = [];
  for (let i = 0; i < 5; i++) {
    out.push(TRAVEL_POOL[(start + i) % TRAVEL_POOL.length]);
  }
  return out;
}

export function mapIllustrationUrl(): string {
  return MAP_STYLE;
}

export function openStreetMapSearchUrl(city: string, country: string): string {
  const q = encodeURIComponent(`${city}, ${country}`.trim());
  return `https://www.openstreetmap.org/search?query=${q}`;
}
