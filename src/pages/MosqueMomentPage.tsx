import { Link } from 'react-router-dom';
import { BackButton } from '../components/Navigation/BackButton';
import { useHomeClock } from '../components/Home/useHomeClock';
import { useFavoriteMosqueSchedule } from '../hooks/useFavoriteMosqueSchedule';
import { publishedNext, prayerCountdown } from '../lib/publishedPrayerClock';
import { useQuranStore } from '../stores/quranStore';
import './FahmExperience.css';
export default function MosqueMomentPage() {
  const now = useHomeClock(1000).getTime(),
    { favorite, timetable } = useFavoriteMosqueSchedule(now);
  const next = publishedNext(timetable, now),
    progress = useQuranStore((s) => s.progress);
  return (
    <main className="fahm-shell">
      <BackButton fallback="/prayers" />
      <header className="fahm-hero">
        <h1>À la mosquée</h1>
        <p>{favorite?.name || 'Mosquée à sélectionner'}</p>
      </header>
      <section className="fahm-card">
        <h2>{next ? next.label : 'Horaires de la mosquée'}</h2>
        {next ? (
          <>
            <strong>
              {next.kind} dans {prayerCountdown(next.at, now)}
            </strong>
            <p>
              {next.adhan && 'Adhan ' + next.adhan} ·{' '}
              {next.iqama
                ? 'Iqama ' + next.iqama
                : next.kind === 'Jumu’a'
                  ? next.time
                  : 'Iqama non publiée'}
            </p>
          </>
        ) : (
          <p>Aucun horaire publié disponible.</p>
        )}
        <Link to="/prayers">Voir les horaires</Link>
      </section>
      <Link
        className="fahm-resume"
        to={
          progress
            ? `/read?surah=${progress.lastSurah}&ayah=${progress.lastAyah}&page=${progress.lastPage}`
            : '/read'
        }
      >
        <span>
          AVANT LA PRIÈRE
          <strong>
            {progress ? 'Reprendre ma lecture' : 'Ouvrir le Mushaf'}
          </strong>
          {progress && (
            <small>
              Page {progress.lastPage} · {progress.lastSurah}:
              {progress.lastAyah}
            </small>
          )}
        </span>
        →
      </Link>
      <Link className="fahm-resume" to="/adhkar?cat=hisn_chap_25&dua=83">
        <span>
          APRÈS LA PRIÈRE<strong>Commencer les invocations</strong>
          <small>Arabe, phonétique et traduction</small>
        </span>
        →
      </Link>
    </main>
  );
}
