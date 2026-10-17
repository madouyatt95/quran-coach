const aliases: Record<string, string> = {
  '/prayers': 'salat salah horaires adhan', '/adhkar': 'doua dhikr matin soir',
  '/storage': 'telechargement telechargements hors ligne packs offline',
  '/favorites': 'favoris signet signets notes collections sauvegarde',
  '/test-memorization': 'revision reviser evaluation test memorisation',
  '/learning': 'revision reviser seance apprentissage', '/hifdh': 'revision apprendre memoriser',
  '/voice-search': 'identifier micro reconnaissance verset', '/qibla': 'direction boussole',
  '/dashboard': 'progression statistiques khatm khatam', '/settings': 'reglages parametres notifications apparence theme',
};
const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/g, ' ').trim();
export function searchMenuDestinations<T extends { path: string; label: string }>(items: T[], query: string): T[] {
  const words = normalize(query).split(' ').filter(Boolean);
  if (!words.length) return [];
  return items.filter(item => {
    const haystack = normalize(`${item.label} ${aliases[item.path] || ''}`);
    return words.every(word => haystack.includes(word));
  });
}
