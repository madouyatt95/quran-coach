import { expect, it } from 'vitest';
import { DEFAULT_MENU_FAVORITES, moveMenuFavorite, toggleMenuFavorite, validMenuFavorites, validMenuSections } from './menuFavorites';

it('restores only four distinct available destinations', () => {
  expect(validMenuFavorites(['/quiz', '/quiz', '/voice-search', '/adhkar', '/hadiths', '/tafsir', '/atlas']))
    .toEqual(['/quiz', '/adhkar', '/hadiths', '/tafsir']);
  expect(validMenuFavorites(null)).toEqual(DEFAULT_MENU_FAVORITES);
});

it('lets the user remove a favorite before adding another', () => {
  expect(toggleMenuFavorite(DEFAULT_MENU_FAVORITES, '/atlas')).toEqual(DEFAULT_MENU_FAVORITES);
  const three = toggleMenuFavorite(DEFAULT_MENU_FAVORITES, '/quiz');
  expect(toggleMenuFavorite(three, '/atlas')).toEqual(['/adhkar', '/hadiths', '/tafsir', '/atlas']);
});

it('reorders favorites without adding or removing a shortcut', () => {
  expect(moveMenuFavorite(DEFAULT_MENU_FAVORITES, '/hadiths', -1)).toEqual(['/quiz', '/hadiths', '/adhkar', '/tafsir']);
  expect(moveMenuFavorite(DEFAULT_MENU_FAVORITES, '/quiz', -1)).toEqual(DEFAULT_MENU_FAVORITES);
  expect(moveMenuFavorite(DEFAULT_MENU_FAVORITES, '/atlas', 1)).toEqual(DEFAULT_MENU_FAVORITES);
});

it('restores only known expanded section states', () => {
  expect(validMenuSections({ discover: true, practice: false, hidden: true, progress: 'yes' }))
    .toEqual({ discover: true, practice: false });
});

it('replaces a full shortcut slot without changing its position or duplicating another', async () => {
  const { replaceMenuFavorite } = await import('./menuFavorites');
  expect(replaceMenuFavorite(DEFAULT_MENU_FAVORITES, '/adhkar', '/favorites')).toEqual(['/quiz', '/favorites', '/hadiths', '/tafsir']);
  expect(replaceMenuFavorite(DEFAULT_MENU_FAVORITES, '/adhkar', '/quiz')).toEqual(DEFAULT_MENU_FAVORITES);
  expect(replaceMenuFavorite(DEFAULT_MENU_FAVORITES, '/missing', '/storage')).toEqual(DEFAULT_MENU_FAVORITES);
  expect(replaceMenuFavorite(DEFAULT_MENU_FAVORITES, '/adhkar', '/missing')).toEqual(DEFAULT_MENU_FAVORITES);
});
