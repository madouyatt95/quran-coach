import { useEffect, useRef, useState } from "react";
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
import { VerseComparison } from "../components/Learning/VerseComparison";
import { useFavoritesStore } from "../stores/favoritesStore";
import { useReadingBookmarkStore } from "../stores/readingBookmarkStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useListeningEvidenceStore } from "../stores/listeningEvidenceStore";
import type { Ayah } from "../types";
import "../components/Learning/Learning.css";
import "./PassagePage.css";
export function PassagePage() {
  const [params] = useSearchParams();
  const p = parsePassage(params);
  const key = passageKey(p);
  const navigate = useNavigate();
  const from = params.get("from");
  const backRef = /^(\d{1,3}):(\d{1,3})$/.exec(params.get('back') || '');
  const backTo = backRef && Number(backRef[1]) >= 1 && Number(backRef[1]) <= 114 && Number(backRef[2]) >= 1 && Number(backRef[2]) <= 286
    ? `/passage?surah=${Number(backRef[1])}&ayah=${Number(backRef[2])}` : null;
  return (
    <PassageContent
      key={key + params.get("step")}
      passage={p}
      stepId={params.get("step")}
      from={from}
      backTo={backTo}
      onDone={() => navigate("/learning")}
    />
  );
}
function PassageContent({
  passage: p,
  stepId,
  from,
  backTo,
  onDone,
}: {
  passage: { surah: number; ayah: number };
  stepId: string | null;
  from: string | null;
  backTo: string | null;
  onDone: () => void;
}) {
  const [data, setData] = useState<{ ayah: Ayah; translation: string } | null>(
    null,
  );
  const [error, setError] = useState("");
  const [translationLoading, setTranslationLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  const [understood, setUnderstood] = useState(false);
  const [listened, setListened] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [panel, setPanel] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const learning = useLearningStore();
  const srs = useSRSStore();
  const favorites = useFavoritesStore(s => s.favorites);
  const toggleFavorite = useFavoritesStore(s => s.toggleFavorite);
  const bookmark = useReadingBookmarkStore(s => s.bookmark);
  const saveBookmark = useReadingBookmarkStore(s => s.save);
  const viewMode = useSettingsStore(s => s.viewMode);
  const isFavorite = Boolean(data && favorites.some(f => f.number === data.ayah.number));
  const isBookmarked = Boolean(data && bookmark?.precision === 'verse' && bookmark.surah === p.surah && bookmark.ayah === p.ayah);
  const fromTarget = from === 'read' ? `/read?surah=${p.surah}&ayah=${p.ayah}`
    : from === 'hifdh' ? `/hifdh?surah=${p.surah}&ayah=${p.ayah}`
    : from === 'quiz' ? '/quiz?companion=revision'
    : from === 'favorites' ? '/favorites'
    : from === 'compare' && backTo ? backTo
    : '/learning';
  const fromLabel = from === 'read' ? 'Retour au Mushaf' : from === 'hifdh' ? 'Retour à la mémorisation'
    : from === 'quiz' ? 'Retour aux erreurs du quiz' : from === 'favorites' ? 'Retour aux favoris'
    : from === 'compare' ? 'Retour au verset précédent' : 'Retour';
  const step =
    learning.session?.date === localDay()
      ? learning.session.steps.find(
          (s) => s.id === stepId && s.surah === p.surah && s.ayah === p.ayah,
        )
      : undefined;
  useEffect(() => {
    let cancelled = false;
    fetchSurah(p.surah)
      .then(surah => {
        const ayah = surah.ayahs.find((a) => a.numberInSurah === p.ayah);
        if (!ayah) throw new Error("Verset introuvable");
        if (!cancelled) {
          setData({ ayah, translation: "" });
          setError("");
        }
        void fetchSurahTranslation(p.surah, "fr").then(translations => {
          if (!cancelled) setData(current => current?.ayah.number === ayah.number
            ? { ...current, translation: translations.get(ayah.number) || "" } : current);
        }).catch(() => {}).finally(() => { if (!cancelled) setTranslationLoading(false); });
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
    <div className="learning-page verse-hub">
      <Link className="verse-hub__back" to={fromTarget}>← {fromLabel}</Link>
      <header className="verse-hub__hero">
        <span className="learning-kicker">UN VERSET · TOUS VOS PARCOURS</span>
        <h1>Verset {p.surah}:{p.ayah}</h1>
        <p>{step?.label || "Écouter, comprendre et travailler ce verset à votre rythme."}</p>
      </header>
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
          <section className="learning-card verse-hub__text">
            <div className="verse-hub__meta"><span>Coran · {p.surah}:{p.ayah}</span><span>Page {data.ayah.page}</span></div>
            {hidden ? (
              <p className="learning-muted">Texte masqué. Récitez, puis affichez-le pour comparer.</p>
            ) : (
              <>
                <p className="learning-arabic" lang="ar" dir="rtl">{data.ayah.text}</p>
                <p className="verse-hub__translation" lang="fr">{data.translation || (translationLoading ? "Chargement de la traduction…" : "Traduction indisponible.")}</p>
                <small className="learning-muted">Traduction française : Muhammad Hamidullah · texte arabe : édition Uthmani.</small>
              </>
            )}
            <div className="verse-hub__actions" aria-label="Actions du verset">
              <button className="learning-btn" aria-pressed={isBookmarked} onClick={() => saveBookmark({surah:p.surah,ayah:p.ayah,page:data.ayah.page,view:viewMode === 'madinah' || viewMode === 'tajweed' || viewMode === 'tajweed-interactive' ? viewMode : 'mushaf',precision:'verse'})}>{isBookmarked ? '🔖 Signet enregistré' : '🔖 Signet'}</button>
              <button className="learning-btn" aria-pressed={isFavorite} onClick={() => toggleFavorite({number:data.ayah.number,surah:p.surah,numberInSurah:p.ayah,text:data.ayah.text,page:data.ayah.page})}>{isFavorite ? '❤️ Favori' : '♡ Favori'}</button>
              <button className="learning-btn" onClick={() => {void audioRef.current?.play().catch(() => {audioRef.current?.focus();});}}>▶ Écouter</button>
              <button className="learning-btn" onClick={() => setPanel(true)}>✦ Comprendre</button>
              <Link className="learning-btn" to={`/hifdh?surah=${p.surah}&ayah=${p.ayah}&from=passage${stepId ? `&step=${encodeURIComponent(stepId)}` : ""}`}>🧠 Mémoriser</Link>
              <button className="learning-btn" aria-expanded={comparisonOpen} onClick={() => setComparisonOpen(v => !v)}>⇄ Comparer</button>
              <Link className="learning-btn" to={`/read?surah=${p.surah}&ayah=${p.ayah}`}>📖 Reprendre ici</Link>
            </div>
            <audio ref={audioRef} controls preload="none" src={getAudioUrl("ar.alafasy", data.ayah.number)} aria-label={`Écouter le verset ${p.surah}:${p.ayah}`} onPlay={() => document.querySelectorAll<HTMLAudioElement>('.verse-hub audio').forEach(other => {if(other !== audioRef.current)other.pause();})} onEnded={() => {setListened(true);useListeningEvidenceStore.getState().recordVerse(p.surah,p.ayah,'passage');}}/>
            <p className="learning-muted">Mishary Al-Afasy · écoute du verset complet</p>
          </section>
          {comparisonOpen && <VerseComparison verse={data.ayah}/>}
          <section className="learning-card verse-hub__work">
            <h2>Travailler le verset</h2>
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
            <div className="learning-actions">
              <button className="learning-btn" onClick={() => setPanel(true)}>Mots et contexte</button>
              <Link
                className="learning-btn"
                to={`/tafsir?surah=${p.surah}&ayah=${p.ayah}`}
              >
                Tafsir
              </Link>
            </div>
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
