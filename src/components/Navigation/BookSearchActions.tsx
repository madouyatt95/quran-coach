import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SearchResult } from '../../lib/coachSearch';
import { loadAudioLibrary } from '../../lib/audioLibrary';
import {
  bookAudioMarks,
  bookPassages,
  audioAtPassage,
} from '../../lib/bookPassages';
import {
  books,
  recordingsForBook,
  chapterForAudio,
} from '../../lib/bookLibrary';
import { useLibraryPlayer } from '../../stores/libraryPlayerStore';
import type { LibraryAudio } from '../../lib/audioProduction';
export function BookSearchActions({
  passage,
  href,
}: {
  passage: NonNullable<SearchResult['passage']>;
  href: string;
}) {
  const [open, setOpen] = useState(false),
    [retry, setRetry] = useState(0),
    [error, setError] = useState(false),
    [ready, setReady] = useState(false);
  const [cue, setCue] = useState<{
    item: LibraryAudio;
    queue: LibraryAudio[];
    seconds: number;
    chapterSeconds: number;
  }>();
  const navigate = useNavigate();
  useEffect(() => {
    if (!open) return;
    let live = true;
    Promise.all([import('../../data/narrativeBooks'), loadAudioLibrary()])
      .then(([{ narrativeBooks }, items]) => {
        const book = narrativeBooks.find((b) => b.id === passage.bookId),
          summary = books.find((b) => b.id === passage.bookId),
          chapter = book?.chapters.find((c) => c.id === passage.chapterId);
        if (!live) return;
        if (!book || !summary || !chapter) {
          setReady(true);
          return;
        }
        const queue = recordingsForBook(items, summary),
          parts = queue.filter(
            (i) =>
              chapterForAudio(i, summary) === book.chapters.indexOf(chapter),
          );
        const p = bookPassages(book, chapter).find((p) => p.id === passage.id),
          mark = p && audioAtPassage(p, bookAudioMarks(book, chapter, parts));
        if (mark)
          setCue({
            item: mark.item,
            queue,
            seconds: mark.seconds,
            chapterSeconds: parts
              .slice(0, parts.indexOf(mark.item))
              .reduce((s, i) => s + i.duration, mark.seconds),
          });
        setReady(true);
      })
      .catch(() => {
        if (live) setError(true);
      });
    return () => {
      live = false;
    };
  }, [open, retry, passage]);
  return (
    <details
      onToggle={(e) => setOpen(e.currentTarget.open)}
      className="coach-card-source"
    >
      <summary>Sources et écoute de l’extrait</summary>
      {passage.sources.map((s) => (
        <p key={s.url + s.label}>
          <a href={s.url} target="_blank" rel="noreferrer">
            {s.label} ↗
          </a>
        </p>
      ))}
      {cue ? (
        <button
          onClick={() => {
            void useLibraryPlayer
              .getState()
              .play(cue.item, { queue: cue.queue, startAt: cue.seconds });
            navigate(href, { state: { bookView: 'listen' } });
          }}
        >
          Écouter ce passage · {Math.floor(cue.chapterSeconds / 60)}:
          {String(Math.floor(cue.chapterSeconds % 60)).padStart(2, '0')}
        </button>
      ) : error ? (
        <button
          onClick={() => {
            setError(false);
            setRetry((n) => n + 1);
          }}
        >
          Réessayer de charger l’audio
        </button>
      ) : (
        <small>
          {ready
            ? 'Aucun repère audio vérifié pour cet extrait.'
            : 'Recherche du repère audio…'}
        </small>
      )}
    </details>
  );
}
