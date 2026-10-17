import { expect, it } from 'vitest';
import { searchMenuDestinations } from './menuSearch';
const items = [{ path: '/storage', label: 'Téléchargements' }, { path: '/test-memorization', label: 'Teste-moi' }, { path: '/prayers', label: 'Prières' }];
it('finds features through accent-insensitive names and familiar synonyms', () => {
  expect(searchMenuDestinations(items, 'telechargement')).toEqual([items[0]]);
  expect(searchMenuDestinations(items, 'révision')).toEqual([items[1]]);
  expect(searchMenuDestinations(items, 'SALAT')).toEqual([items[2]]);
  expect(searchMenuDestinations(items, 'hors ligne')).toEqual([items[0]]);
});
it('requires every word and leaves empty or unmatched input to the content search', () => {
  expect(searchMenuDestinations(items, '   ')).toEqual([]);
  expect(searchMenuDestinations(items, 'salat hors')).toEqual([]);
  expect(searchMenuDestinations(items, 'patience')).toEqual([]);
});
