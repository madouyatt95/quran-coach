export interface Mosque {
  id: string; name: string; city: string; lat: number; lng: number;
  sourceUrl: string; address?: string; website?: string;
  directoryArea?: {lat:number;lng:number;radius:number};
  refs?: { prayerzone?: string; osm?: string; mawaqit?: string }; aliases?: string[]; matchUncertain?: boolean;
}
export interface MosqueSchedule {
  date: string; timezone: string; address: string; fetchedAt: number;
  times: { id: string; name: string; time: string }[];
  // PrayerZone currently documents calculated starts, not mosque-published iqamas.
  kind: 'calculated';
}
export function safeMosqueUrl(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 1500) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' || url.username || url.password || !url.hostname.includes('.') || /^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.)/.test(url.hostname)) return null;
    return url.href;
  } catch { return null; }
}
export function validCoordinates(lat: unknown, lng: unknown): boolean {
  return typeof lat === 'number' && typeof lng === 'number' && Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}
export function distanceKm(a: {lat: number; lng: number}, b: {lat: number; lng: number}): number {
  const rad = Math.PI / 180, deltaLat = (b.lat - a.lat) * rad, deltaLng = (b.lng - a.lng) * rad;
  const h = Math.sin(deltaLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(deltaLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, h)));
}
export function parseMosques(value: unknown): Mosque[] {
  if (!Array.isArray(value)) throw new Error('Réponse de l’annuaire indisponible.');
  const seen = new Set<string>();
  return value.flatMap(row => {
    if (!row || typeof row !== 'object') return [];
    const { slug, title, city, coordinates, publicUrl } = row;
    if (typeof slug !== 'string' || !/^[\w-]{1,180}$/.test(slug) || seen.has(slug) || typeof title !== 'string' || !Array.isArray(coordinates) || !validCoordinates(coordinates[1], coordinates[0])) return [];
    seen.add(slug);
    const sourceUrl = typeof publicUrl === 'string' && publicUrl.startsWith('/') && !publicUrl.startsWith('//') ? new URL(publicUrl, 'https://pray.zone').href : 'https://pray.zone';
    if (new URL(sourceUrl).origin !== 'https://pray.zone') return [];
    return [{ id: slug, name: title.slice(0, 180), city: typeof city === 'string' ? city.slice(0, 120) : '', lat: coordinates[1], lng: coordinates[0], sourceUrl }];
  }).slice(0, 100);
}
const names: Record<string, string> = { Fajr: 'Fajr', Sunrise: 'Lever du soleil', Dhuhr: 'Dhouhr', Asr: 'Asr', Maghrib: 'Maghrib', Isha: 'Isha' };
export function parseMosqueSchedule(value: unknown): MosqueSchedule {
  const v = value as { data?: { date?: string; timezone?: string; prayerTimes?: {id: string; time: string}[] }; mosque?: {address?: string} };
  if (!v?.data || !/^\d{4}-\d{2}-\d{2}$/.test(v.data.date || '') || !Array.isArray(v.data.prayerTimes) || typeof v.data.timezone !== 'string') throw new Error('Horaires indisponibles.');
  try { new Intl.DateTimeFormat('fr', { timeZone: v.data.timezone }).format(); } catch { throw new Error('Fuseau horaire indisponible.'); }
  const times = v.data.prayerTimes.filter(row => row && names[row.id] && /^([01]\d|2[0-3]):[0-5]\d$/.test(row.time)).map(row => ({ id: row.id, name: names[row.id], time: row.time }));
  if (!times.length) throw new Error('Horaires indisponibles.');
  return { date: v.data.date!, timezone: v.data.timezone, address: typeof v.mosque?.address === 'string' ? v.mosque.address : '', times, kind: 'calculated', fetchedAt: Date.now() };
}
export function mosqueDate(timezone: string, now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  return ['year','month','day'].map(key => parts.find(p => p.type === key)?.value).join('-');
}
export function directionsUrl(mosque: Mosque, provider: 'google' | 'apple'): string {
  const target = `${mosque.lat},${mosque.lng}`;
  return provider === 'apple' ? `https://maps.apple.com/?daddr=${target}&dirflg=w` : `https://www.google.com/maps/dir/?api=1&destination=${target}&travelmode=walking`;
}
const pending = new Map<string, Promise<unknown>>();
export async function mosqueApiUrl(query: string): Promise<string> {
  const { Capacitor } = await import('@capacitor/core');
  return `${Capacitor.isNativePlatform() ? 'https://www.quran-coach.fr' : ''}/api/mosques?${query}`;
}
async function cachedRequest(path: string, ttl: number): Promise<unknown> {
  const key = `mosques-v1:${path}`;
  try { const cached = JSON.parse(localStorage.getItem(key) || 'null'); if (cached && Date.now() - cached.at < ttl) return cached.data; } catch { /* Fetch if unavailable. */ }
  const existing = pending.get(key); if (existing) return existing;
  const task = (async () => {
    // Same-origin production proxy provides shared CDN caching. Vite has the same proxy configured.
    const response = await fetch(await mosqueApiUrl(path), { signal: AbortSignal.timeout(18000) });
    if (!response.ok) throw new Error(response.status === 429 ? 'L’annuaire est très sollicité. Réessayez dans un instant.' : 'L’annuaire est momentanément indisponible.');
    const data: unknown = await response.json();
    if (path.startsWith('id=')) parseMosqueSchedule(data); else parseMosques(data);
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('mosques-v1:'));
      if (keys.length >= 20) localStorage.removeItem(keys[0]);
      localStorage.setItem(key, JSON.stringify({at: Date.now(), data}));
    } catch { /* Browsing works without persistence. */ }
    return data;
  })().finally(() => pending.delete(key));
  pending.set(key, task); return task;
}
export async function fetchNearbyMosques(lat: number, lng: number, radius = 5000): Promise<Mosque[]> {
  if (!validCoordinates(lat, lng)) throw new Error('Choisissez une ville.');
  const data = await cachedRequest(`latitude=${lat.toFixed(2)}&longitude=${lng.toFixed(2)}&radius=${radius === 15000 ? 15000 : 5000}`, 86400000);
  return parseMosques(data).sort((a,b) => distanceKm({lat,lng},a) - distanceKm({lat,lng},b));
}
export async function fetchMosqueSchedule(id: string): Promise<MosqueSchedule> {
  return parseMosqueSchedule(await cachedRequest(`id=${encodeURIComponent(id)}`, 5 * 60000));
}
