export const MENU_FAVORITES_KEY = 'quran-coach-menu-favorites-v1';
export const MENU_SECTIONS_KEY = 'quran-coach-menu-sections-v1';
export const MENU_SECTION_IDS = ['discover', 'practice', 'daily', 'progress'] as const;

export const MENU_DESTINATIONS = [
  '/quiz', '/test-memorization', '/prophets', '/companions', '/stories', '/atlas',
  '/qibla', '/prayers', '/themes', '/adhkar', '/hadiths', '/tafsir',
  '/academy', '/circles', '/fahm', '/sentinel', '/dashboard', '/favorites', '/storage',
] as const;

export const DEFAULT_MENU_FAVORITES = ['/quiz', '/adhkar', '/hadiths', '/tafsir'];

export function validMenuFavorites(value: unknown): string[] {
  if (!Array.isArray(value)) return [...DEFAULT_MENU_FAVORITES];
  const valid = value.filter(
    (path): path is string =>
      typeof path === 'string' &&
      (MENU_DESTINATIONS as readonly string[]).includes(path),
  );
  return [...new Set(valid)].slice(0, 4);
}

export function readMenuFavorites(): string[] {
  try {
    const raw = localStorage.getItem(MENU_FAVORITES_KEY);
    return raw === null ? [...DEFAULT_MENU_FAVORITES] : validMenuFavorites(JSON.parse(raw));
  } catch {
    return [...DEFAULT_MENU_FAVORITES];
  }
}

export function toggleMenuFavorite(current: string[], path: string): string[] {
  const favorites = validMenuFavorites(current);
  if (favorites.includes(path)) return favorites.filter((item) => item !== path);
  if (!(MENU_DESTINATIONS as readonly string[]).includes(path) || favorites.length >= 4)
    return favorites;
  return [...favorites, path];
}

export function moveMenuFavorite(current: string[], path: string, direction: -1 | 1): string[] {
  const favorites = validMenuFavorites(current);
  const index = favorites.indexOf(path);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= favorites.length) return favorites;
  [favorites[index], favorites[target]] = [favorites[target], favorites[index]];
  return favorites;
}

export type MenuSections = Partial<Record<(typeof MENU_SECTION_IDS)[number], boolean>>;

export function validMenuSections(value: unknown): MenuSections {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const source = value as Record<string, unknown>;
  return Object.fromEntries(MENU_SECTION_IDS.filter(id => typeof source[id] === 'boolean').map(id => [id, source[id]])) as MenuSections;
}

export function readMenuSections(): MenuSections {
  try { return validMenuSections(JSON.parse(localStorage.getItem(MENU_SECTIONS_KEY) || '{}')); }
  catch { return {}; }
}

export function replaceMenuFavorite(current: string[], oldPath: string, newPath: string): string[] {
  const favorites = validMenuFavorites(current);
  if (!favorites.includes(oldPath) || favorites.includes(newPath) || !(MENU_DESTINATIONS as readonly string[]).includes(newPath)) return favorites;
  return favorites.map(path => path === oldPath ? newPath : path);
}
