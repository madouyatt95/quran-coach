import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BackButton } from '../components/Navigation/BackButton';
import { prayerSurahs, expressionQuiz } from '../lib/fahm/prayerStudy';
import {
  loadFrenchWords,
  FRENCH_SOURCE,
} from '../lib/interactiveMushaf/french';
import arabicWords from '../lib/fahm/prayer-words-ar.json';
import { sourceUrl } from '../lib/fahm/learning';
import { useFahmLearningStore } from '../stores/fahmLearningStore';
import { getAudioUrl, fetchSurahTranslation } from '../lib/quranApi';
import { useSettingsStore } from '../stores/settingsStore';
import { useAudioPlayerStore } from '../stores/audioPlayerStore';
import './FahmExperience.css';
export default function PrayerStudyPage() {
  const [params, setParams] = useSearchParams();
  const checks = useFahmLearningStore((s) => s.checks);
  const records = Object.entries(checks)
    .filter(([id]) => id.startsWith('salat:'))
    .map(([, r]) => r);
  const last = [...records].sort((a, b) => b.at - a.at)[0];
  const resumeSurah = params.has('surah')
    ? Number(params.get('surah'))
    : last?.target.surah || 1;
  const chapter =
    prayerSurahs.find((c) => c.id === resumeSurah) || prayerSurahs[0];
  const requested = params.has('surah')
      ? Number(params.get('ayah'))
      : last?.target.ayah || 1,
    ayah =
      Number.isInteger(requested) &&
      requested >= 1 &&
      requested <= chapter.count
        ? requested
        : 1;
  const move = (surah: number, a: number) =>
    setParams({ surah: String(surah), ayah: String(a) });
  const due = records
    .filter((r) => r.due <= Date.now())
    .sort((a, b) => a.due - b.due);
  const next = prayerSurahs[prayerSurahs.indexOf(chapter) + 1];
  return (
    <main className="fahm-shell">
      <BackButton fallback="/fahm" />
      <header className="fahm-hero">
        <h1>Comprendre ma récitation en prière</h1>
        <p>
          Al-Fatiha et le Juz ‘Amma · {records.length} / 571 versets travaillés
        </p>
      </header>
      {due.length > 0 && (
        <button
          className="fahm-primary"
          onClick={() => move(due[0].target.surah, due[0].target.ayah)}
        >
          Revoir {due[0].target.surah}:{due[0].target.ayah} · {due.length} à
          réviser
        </button>
      )}
      <nav className="fahm-pager">
        <label>
          Sourate
          <select value={chapter.id} onChange={(e) => move(+e.target.value, 1)}>
            {prayerSurahs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} · {c.latin}
              </option>
            ))}
          </select>
        </label>
        <label>
          Verset
          <select
            value={ayah}
            onChange={(e) => move(chapter.id, +e.target.value)}
          >
            {Array.from({ length: chapter.count }, (_, i) => (
              <option key={i} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </label>
      </nav>
      <Study
        key={chapter.id + ':' + ayah}
        surah={chapter.id}
        ayah={ayah}
        number={chapter.offset + ayah}
      />
      {ayah < chapter.count || next ? (
        <button
          className="fahm-primary"
          onClick={() =>
            ayah < chapter.count ? move(chapter.id, ayah + 1) : move(next.id, 1)
          }
        >
          {ayah < chapter.count ? 'Verset suivant' : 'Sourate suivante'} →
        </button>
      ) : (
        <Link to="/fahm">Retrouver Fahm</Link>
      )}
    </main>
  );
}
function Study({
  surah,
  ayah,
  number,
}: {
  surah: number;
  ayah: number;
  number: number;
}) {
  const [quiz, setQuiz] = useState<ReturnType<typeof expressionQuiz>>(null),
    [translation, setTranslation] = useState(''),
    [attempt, setAttempt] = useState(0),
    [error, setError] = useState('');
  const [choice, setChoice] = useState(''),
    [help, setHelp] = useState(false),
    [heard, setHeard] = useState(false),
    [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLAudioElement>(null),
    voice = useSettingsStore((s) => s.selectedReciter),
    check = useFahmLearningStore((s) => s.check);
  const words = (arabicWords as Record<string, string[]>)[surah + ':' + ayah];
  const target = { surah, ayah },
    id = `salat:${surah}:${ayah}`,
    done = choice === quiz?.expression;
  useEffect(() => {
    let live = true;
    loadFrenchWords(surah)
      .then((words) => {
        if (live) setQuiz(expressionQuiz(words, surah, ayah));
      })
      .catch(() => {
        if (live) setError('Les expressions n’ont pas été chargées.');
      });

    const stop = () => ref.current?.pause();
    window.addEventListener('quran-stop-playback', stop);
    return () => {
      live = false;
      window.removeEventListener('quran-stop-playback', stop);
    };
  }, [surah, ayah, attempt]);
  useEffect(() => {
    if (!help && !done) return;
    let live = true;
    void fetchSurahTranslation(surah)
      .then((fr) => {
        if (live) setTranslation(fr.get(number) || '');
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [help, done, surah, number, attempt]);
  const reveal = () => {
    setHelp(true);
  };
  return (
    <article className="fahm-card">
      <h2>
        Écouter le verset {surah}:{ayah}
      </h2>
      <audio
        ref={ref}
        preload="none"
        src={getAudioUrl(voice, number)}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setHeard(true);
          setPlaying(false);
        }}
      />
      <div className="fahm-row">
        <button
          onClick={() => {
            const a = ref.current;
            if (!a) return;
            if (!a.paused) {
              a.pause();
              return;
            }
            window.dispatchEvent(new Event('quran-stop-playback'));
            useAudioPlayerStore.getState().stop();
            void a.play().catch(() => setError('Récitation indisponible.'));
          }}
        >
          {playing ? 'Pause' : heard ? 'Réécouter' : 'Écouter'}
        </button>
        <button onClick={reveal}>Afficher le texte et son sens</button>
      </div>
      {error && (
        <p role="alert">
          {error}{' '}
          <button
            onClick={() => {
              setError('');
              setAttempt((v) => v + 1);
            }}
          >
            Réessayer
          </button>
        </p>
      )}
      {(help || done) && (
        <>
          <p lang="ar" dir="rtl" className="fahm-study-arabic">
            {words.join(' ')}
          </p>
          {translation && (
            <p>
              {translation} <small>· Traduction M. Hamidullah</small>
            </p>
          )}
          {quiz && (
            <p>
              <b lang="ar" dir="rtl">
                {words[quiz.position - 1]}
              </b>{' '}
              · {quiz.expression}
            </p>
          )}
        </>
      )}
      {quiz && (
        <>
          <h3>Quelle expression retrouvez-vous dans ce verset ?</h3>
          <div className="fahm-choices">
            {quiz.options.map((option) => (
              <button
                key={option}
                disabled={done || (!heard && !help)}
                onClick={() => {
                  check(
                    id,
                    target,
                    option === quiz.expression,
                    help || !!choice,
                  );
                  setChoice(option);
                }}
              >
                {option}
              </button>
            ))}
          </div>
          {choice && (
            <p role="status">
              {done
                ? `Oui. « ${quiz.expression} » correspond au mot n° ${quiz.position} · ${words[quiz.position - 1]}. Retrouvez ce verset dans vos révisions.`
                : 'Réécoutez le passage ou affichez son sens, puis réessayez.'}
            </p>
          )}
        </>
      )}
      <div className="fahm-row">
        <Link to={`/read?surah=${surah}&ayah=${ayah}`}>Ouvrir le Mushaf</Link>
        <Link
          to={`/tafsir?surah=${surah}&ayah=${ayah}&edition=french_mokhtasar`}
        >
          Comprendre avec le tafsir
        </Link>
        <a href={sourceUrl(target)} target="_blank" rel="noreferrer">
          Al-Mokhtasar ↗
        </a>
        <a href={FRENCH_SOURCE} target="_blank" rel="noreferrer">
          Source du mot à mot ↗
        </a>
      </div>
    </article>
  );
}
