import { useState } from "react";
import { Link } from "react-router-dom";
import { useLearningStore } from "../stores/learningStore";
import { useSRSStore } from "../stores/srsStore";
import { useQuranStore } from "../stores/quranStore";
import { useFahmStore } from "../stores/fahmStore";
import { READING_PATHS } from "../data/readingPaths";
import { localDay, masteryLabel, passageUrl } from "../lib/learning";
import "../components/Learning/Learning.css";
export function LearningPage() {
  const learning = useLearningStore();
  const { cards } = useSRSStore();
  const quran = useQuranStore();
  const fahm = useFahmStore();
  const [minutes, setMinutes] = useState<5 | 10 | 20>(learning.minutes);
  const [surah, setSurah] = useState(quran.currentSurah || 1);
  const [ayah, setAyah] = useState(quran.currentAyah || 1);
  const session =
    learning.session?.date === localDay() ? learning.session : null;
  const step = session?.steps.find(
    (s) => !session.done.includes(s.id) && !session.skipped.includes(s.id),
  );
  const due = Object.values(cards).filter(
    (c) => c.nextReviewDate <= localDay(),
  ).length;
  const path = READING_PATHS.find((p) => p.id === fahm.activePath);
  const nextDay = path?.days.find(
    (d) => !fahm.pathProgress[path.id]?.includes(d.day),
  );
  const max = quran.surahs.find((s) => s.number === surah)?.numberOfAyahs || 7;
  const records = [
    ...new Set([...Object.keys(cards), ...Object.keys(learning.records)]),
  ];
  return (
    <div className="learning-page">
      <span className="learning-kicker">Un peu chaque jour</span>
      <h1>Ma séance du jour</h1>
      <p className="learning-muted">
        Comprendre, écouter et rappeler de mémoire. {due} verset
        {due > 1 ? "s" : ""} à réviser aujourd’hui.
      </p>
      <section className="learning-card learning-hero">
        <h2>
          {session ? "Votre parcours" : "De combien de temps disposez-vous ?"}
        </h2>
        {!session ? (
          <>
            <div className="learning-actions">
              {([5, 10, 20] as const).map((n) => (
                <button
                  className="learning-btn"
                  aria-pressed={minutes === n}
                  key={n}
                  onClick={() => setMinutes(n)}
                >
                  {n} min
                </button>
              ))}
            </div>
            <p className="learning-muted">
              Durée indicative. Choisissez le verset que vous souhaitez
              travailler ; les révisions dues passent en premier.
            </p>
            <div className="learning-grid">
              <label>
                Sourate
                <select
                  value={surah}
                  onChange={(e) => {
                    setSurah(Number(e.target.value));
                    setAyah(1);
                  }}
                >
                  {quran.surahs.map((s) => (
                    <option value={s.number} key={s.number}>
                      {s.number}. {s.englishName}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Verset
                <select
                  value={ayah}
                  onChange={(e) => setAyah(Number(e.target.value))}
                >
                  {Array.from({ length: max }, (_, i) => (
                    <option key={i} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button
              className="learning-btn primary"
              onClick={() => learning.start(minutes, cards, { surah, ayah })}
            >
              Préparer ma séance
            </button>
          </>
        ) : (
          <>
            <progress
              className="learning-progress"
              value={session.done.length + session.skipped.length}
              max={session.steps.length}
            />
            {session.steps.map((s, i) => (
              <div key={s.id} className="learning-step">
                <span className="number">
                  {session.done.includes(s.id) ? "✓" : i + 1}
                </span>
                <div>
                  <p>{s.label}</p>
                  <small className="learning-muted">
                    {s.surah}:{s.ayah}
                    {session.skipped.includes(s.id) ? " · reporté" : ""}
                  </small>
                </div>
              </div>
            ))}
            {step ? (
              <div className="learning-actions">
                <Link
                  className="learning-btn primary"
                  to={`${passageUrl(step)}&step=${encodeURIComponent(step.id)}`}
                >
                  Continuer : {step.label.toLowerCase()}
                </Link>
                <button
                  className="learning-btn"
                  onClick={() => learning.completeStep(step.id, true)}
                >
                  Reporter cette étape
                </button>
              </div>
            ) : (
              <p className="learning-status">
                Séance terminée : {session.done.length} étapes effectuées,{" "}
                {session.skipped.length} reportées. Vous pouvez poursuivre
                librement.
              </p>
            )}
          </>
        )}
      </section>
      <div className="learning-actions">
        <Link className="learning-btn" to="/similar-passages">
          Passages semblables
        </Link>
        <Link className="learning-btn" to="/voice-search">
          Retrouver un verset à la voix
        </Link>
        <Link className="learning-btn" to="/storage">
          Mes packs hors ligne
        </Link>
      </div>
      {nextDay && path && (
        <section className="learning-card">
          <h2>Votre parcours de compréhension</h2>
          <p>
            {path.title} · Jour {nextDay.day} : {nextDay.title}
          </p>
          <Link
            className="learning-btn"
            to={`/fahm/lesson/${path.id}/${nextDay.day}`}
          >
            Poursuivre Fahm
          </Link>
        </section>
      )}
      <section className="learning-card">
        <h2>Ma mémorisation</h2>
        <p className="learning-muted">
          Les états reposent sur votre autoévaluation et vos révisions espacées.
          Le moteur vocal ne certifie pas la maîtrise.
        </p>
        {!records.length && (
          <p>Travaillez un verset pour commencer votre carte de progression.</p>
        )}
        {records
          .sort((a, b) => {
            const [as, aa] = a.split(":").map(Number);
            const [bs, ba] = b.split(":").map(Number);
            return as - bs || aa - ba;
          })
          .map((key) => {
            const [s, a] = key.split(":").map(Number);
            return (
              <div className="learning-step" key={key}>
                <div style={{ flex: 1 }}>
                  <strong>
                    {quran.surahs.find((x) => x.number === s)?.englishName ||
                      `Sourate ${s}`}{" "}
                    · {a}
                  </strong>
                  <p className="learning-muted">
                    {masteryLabel(learning.records[key], cards[key])}
                  </p>
                </div>
                <Link
                  className="learning-btn"
                  to={passageUrl({ surah: s, ayah: a })}
                >
                  Travailler
                </Link>
              </div>
            );
          })}
      </section>
    </div>
  );
}
