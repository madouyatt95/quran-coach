import {beforeEach, expect, it, vi} from 'vitest';

const state = vi.hoisted(() => ({
  recitation: {surahName: 'Al-Kahf', reciterName: 'Voix', updatedAt: 10, position: 42},
  tracks: [{id: 'first', duration: 100}, {id: 'second', duration: 200}],
  positions: {} as Record<string, {seconds: number; updatedAt: number}>,
  play: vi.fn(), resume: vi.fn(),
}));
vi.mock('./audioLibrary', () => ({audioLibrarySnapshot: () => state.tracks}));
vi.mock('../stores/audioLibraryStore', () => ({useAudioLibraryStore: {getState: () => state}}));
vi.mock('../stores/listenStore', () => ({useListenStore: {getState: () => ({lastListened: state.recitation})}}));
vi.mock('../stores/libraryPlayerStore', () => ({useLibraryPlayer: {getState: () => state}}));
vi.mock('../stores/audioPlayerStore', () => ({useAudioPlayerStore: {getState: () => state}}));
vi.mock('./bookLibrary', () => ({
  bookForAudio: () => ({id: 'adam', title: 'Adam', chapters: [{title: 'Début', id: 'debut'}, {title: 'Suite', id: 'suite'}]}),
  chapterForAudio: (item: {id: string}) => item.id === 'first' ? 0 : 1,
  recordingsForBook: () => state.tracks,
  bookHref: (book: string, chapter: string) => '/books/' + book + '?chapter=' + chapter,
}));
import {latestWidgetAudio} from './lockScreenAudio';

beforeEach(() => {state.positions = {}; vi.clearAllMocks();});
it('reprend la récitation si elle est plus récente que le livre', async () => {
  state.positions.first = {seconds: 40, updatedAt: 9};
  await latestWidgetAudio()?.play();
  expect(state.resume).toHaveBeenCalledWith(state.recitation);
});
it('reprend le dernier chapitre à la seconde enregistrée', async () => {
  state.positions.first = {seconds: 42.5, updatedAt: 11};
  const result = latestWidgetAudio();
  expect(result?.route).toBe('/books/adam?chapter=debut');
  await result?.play();
  expect(state.play).toHaveBeenCalledWith(state.tracks[0], {queue: state.tracks, startAt: 42.5});
});
it('reprend au segment suivant si le précédent est terminé', async () => {
  state.positions.first = {seconds: 100, updatedAt: 11};
  const result = latestWidgetAudio();
  expect(result?.detail).toBe('Suite');
  await result?.play();
  expect(state.play).toHaveBeenCalledWith(state.tracks[1], {queue: state.tracks, startAt: 0});
});
