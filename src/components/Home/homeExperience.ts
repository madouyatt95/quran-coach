export const HOME_SECTIONS = ['prayer', 'quick', 'daily', 'hadith', 'surahs', 'dhikr', 'explore'] as const;
export type HomeSection = typeof HOME_SECTIONS[number];
export const HOME_SECTION_LABELS: Record<HomeSection, string> = { prayer:'🕌 Prières et calendrier', quick:'⭐ Mes raccourcis', daily:'🌿 Ma séance du jour', hadith:'📜 Hadith du jour', surahs:'📖 Sourates essentielles', dhikr:'📿 Dhikr', explore:'🧭 Tous les accès' };
export const HOME_ORDER_KEY='quran-coach-home-order-v1';
export function normalizeHomeOrder(value:unknown):HomeSection[]{
    const saved=Array.isArray(value)?value.filter((id):id is HomeSection=>HOME_SECTIONS.includes(id)):[];
    return [...new Set([...saved,...HOME_SECTIONS])];
}
export function readHomeOrder():HomeSection[]{try{return normalizeHomeOrder(JSON.parse(localStorage.getItem(HOME_ORDER_KEY)||'null'));}catch{return [...HOME_SECTIONS];}}
export function moveHomeSection(order:HomeSection[],id:HomeSection,delta:number):HomeSection[]{
    const next=normalizeHomeOrder(order),from=next.indexOf(id),to=from+delta;
    if(from<0||to<0||to>=next.length)return next;
    [next[from],next[to]]=[next[to],next[from]];return next;
}
