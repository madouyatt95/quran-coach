import {audioLibrarySnapshot, loadAudioLibrary} from './audioLibrary';
import {bookForAudio, bookHref, chapterForAudio, recordingsForBook} from './bookLibrary';
import {useAudioLibraryStore} from '../stores/audioLibraryStore';
import {useListenStore} from '../stores/listenStore';

export function latestWidgetAudio(booksOnly=false) {
  const recitation = booksOnly ? null : useListenStore.getState().lastListened;
  const items = audioLibrarySnapshot() ?? [];
  const positions = useAudioLibraryStore.getState().positions;
  let bookTrack: typeof items[number] | undefined;
  let timestamp = recitation?.updatedAt ?? 0;
  for (const item of items) {
    const saved = positions[item.id];
    if (saved && saved.updatedAt > timestamp && bookForAudio(item)) {
      timestamp = saved.updatedAt;
      bookTrack = item;
    }
  }
  if (bookTrack) {
    const book = bookForAudio(bookTrack)!;
    const queue = recordingsForBook(items, book);
    const saved = positions[bookTrack.id];
    const ended = bookTrack.duration > 0 && saved.seconds >= bookTrack.duration - 0.5;
    const track = ended ? queue[queue.indexOf(bookTrack) + 1] : bookTrack;
    if (track) {
      const chapter = book.chapters[chapterForAudio(track, book)];
      return {title: book.title, detail: chapter.title, route: bookHref(book.id, chapter.id),
        play: async () => (await import('../stores/libraryPlayerStore')).useLibraryPlayer.getState().play(track, {queue, startAt: ended ? 0 : saved.seconds})};
    }
  }
  if (recitation) return {title: recitation.surahName, detail: recitation.reciterName, route: '/listen',
    play: async () => (await import('../stores/audioPlayerStore')).useAudioPlayerStore.getState().resume(recitation)};
  return null;
}

export async function prepareWidgetAudio() {
  if (!audioLibrarySnapshot() && Object.keys(useAudioLibraryStore.getState().positions).length) await loadAudioLibrary();
}
