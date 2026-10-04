import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  fetchSurah,
  fetchSurahTranslation,
  getAudioUrl,
} from "../lib/quranApi";
import {
  localDay,
  parsePassage,
  passageKey,
  type Recall,
} from "../lib/learning";
import { useLearningStore } from "../stores/learningStore";
import { useSRSStore } from "../stores/srsStore";
import { ComprehensionCheck } from "../components/Learning/ComprehensionCheck";
import { FahmPanel } from "../components/Fahm/FahmPanel";
import type { Ayah } from "../types";
import "../components/Learning/Learning.css";
export function PassagePage() {
  const [params] = useSearchParams();
  const p = parsePassage(params);
  const key = passageKey(p);
  const navigate = useNavigate();
  return (
    <PassageContent
      key={key + params.get("step")}
      passage={p}
      stepId={params.get("step")}
      onDone={() => navigate("/learning")}
    />
  );
}
function PassageContent({
  passage: p,
  stepId,
  onDone,
}: {
  passage: { surah: number; ayah: number };
  stepId: string | null;
  onDone: () => void;
}) {
  const [data, setData] = useState<{ ayah: Ayah; translation: string } | null>(
    null,
  );
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [understood, setUnderstood] = useState(false);
  const [listened, setListened] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [panel, setPanel] = useState(false);
  const [feedback, setFeedback] = useState("");
  const learning = useLearningStore();
  const srs = useSRSStore();
  const step =
    learning.session?.date === localDay()
      ? learning.session.steps.find(
          (s) => s.id === stepId && s.surah === p.surah && s.ayah === p.ayah,
        )
      : undefined;
  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchSurah(p.surah), fetchSurahTranslation(p.surah, "fr")])
      .then(([surah, translations]) => {
        const ayah = surah.ayahs.find((a) => a.numberInSurah === p.ayah);
        if (!ayah) throw new Error("Verset introuvable");
        if (!cancelled) {
          setData({ ayah, translation: translations.get(ayah.number) || "" });
          setError("");
        }
      })
      .catch(() => {
        if (!cancelled)
          setError(
            "Ce passage ne peut pas être chargé. Connectez-vous ou téléchargez son pack.",
          );
      });
    return () => {
      cancelled = true;
    };
  }, [p.surah, p.ayah, retry]);
  const finish = () => {
    if (step) learning.completeStep(step.id);
    onDone();
  };
  const assess = (recall: Recall) => {
    if (feedback) return;
    learning.recordRecall(p, recall);
    srs.addCard(p.surah, p.ayah);
    const reviewedToday = srs.cards[passageKey(p)]?.lastReviewDate === new Date().toISOString().slice(0, 10);
    if (recall !== "learning" && (!reviewedToday || recall === "consolidate"))
      srs.reviewCard(
        passageKey(p),
        recall === "independent" ? 4 : 1,
      );
    setFeedback(
      "Progression enregistrée. La prochaine révision est programmée.",
    );
    if (step?.kind === "review" || step?.kind === "recite")
      learning.completeStep(step.id);
  };
  return (
    <div className="learning-page">
      <Link className="learning-btn" to="/learning">
        ← Ma séance
      </Link>
      <h1>
        Travailler {p.surah}:{p.ayah}
      </h1>
      <p className="learning-muted">
        {step?.label || "Comprendre le sens, écouter, puis rappeler sans aide."}
      </p>
      {error && (
        <div role="alert" className="learning-status">
          {error}
          <button
            className="learning-btn"
            onClick={() => setRetry((v) => v + 1)}
          >
            Réessayer
          </button>
        </div>
      )}
      {!data && !error && <p role="status">Chargement du passage…</p>}
      {data && (
        <>
          <section className="learning-card">
            <div className="learning-actions">
              <button
                className="learning-btn"
                onClick={() => setHidden((v) => !v)}
              >
                {hidden ? "Afficher le texte" : "Masquer pour me tester"}
              </button>
              <Link
                className="learning-btn"
                to={`/read?surah=${p.surah}&ayah=${p.ayah}`}
              >
                Ouvrir le Mushaf
              </Link>
            </div>
            {hidden ? (
              <p className="learning-muted">
                Texte masqué. Récitez, puis affichez-le pour comparer.
              </p>
            ) : (
              <>
                <p className="learning-arabic" lang="ar">
                  {data.ayah.text}
                </p>
                <p className="learning-muted">
                  {data.translation || "Traduction indisponible."}
                </p>
              </>
            )}
            <div className="learning-actions">
              <button className="learning-btn" onClick={() => setPanel(true)}>
                Mots et contexte
              </button>
              <Link
                className="learning-btn"
                to={`/tafsir?surah=${p.surah}&ayah=${p.ayah}`}
              >
                Tafsir
              </Link>
            </div>
            <audio
              controls
              preload="none"
              src={getAudioUrl("ar.alafasy", data.ayah.number)}
              onEnded={() => setListened(true)}
            />
            <p className="learning-muted">
              Mishary Al-Afasy · écoute du verset complet
            </p>
          </section>
          {(!step || step.kind === "understand") && (
            <ComprehensionCheck
              arabic={data.ayah.text}
              reference={data.translation}
              onComplete={() => setUnderstood(true)}
            />
          )}
          <section className="learning-card">
            <h2>Réciter</h2>
            <p className="learning-muted">
              Le coach peut vous suivre. Vous pouvez aussi travailler sans
              microphone et vous autoévaluer.
            </p>
            <Link
              className="learning-btn primary"
              to={`/hifdh?surah=${p.surah}&ayah=${p.ayah}&from=learning${stepId ? `&step=${encodeURIComponent(stepId)}` : ""}`}
            >
              Ouvrir le coach sur ce verset
            </Link>
            <h3>Comment s’est passé votre rappel ?</h3>
            <div className="learning-actions">
              <button
                className="learning-btn"
                disabled={Boolean(feedback)} onClick={() => assess("consolidate")}
              >
                À consolider
              </button>
              <button
                className="learning-btn"
                disabled={Boolean(feedback)} onClick={() => assess("assisted")}
              >
                Avec aide
              </button>
              <button
                className="learning-btn"
                disabled={Boolean(feedback)} onClick={() => assess("independent")}
              >
                Sans aide
              </button>
            </div>
            <p className="learning-muted">
              Votre déclaration personnelle, distincte du suivi vocal.
            </p>
            {feedback && (
              <p className="learning-status" role="status">
                {feedback}
              </p>
            )}
          </section>
          {step && (
            <button
              className="learning-btn primary"
              disabled={
                step.kind === "understand"
                  ? !understood
                  : step.kind === "listen"
                    ? !listened
                    : !feedback
              }
              onClick={finish}
            >
              {step.kind === "listen" && !listened
                ? "Écoutez le verset jusqu’au bout"
                : "Étape terminée · Continuer"}
            </button>
          )}
        </>
      )}
      {panel && data && (
        <FahmPanel
          surah={p.surah}
          ayah={p.ayah}
          verseTextAr={data.ayah.text}
          verseTextFr={data.translation}
          onClose={() => setPanel(false)}
        />
      )}
    </div>
  );
}
