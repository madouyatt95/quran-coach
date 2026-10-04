import { useState } from "react";
import { QURAN_VOCABULARY } from "../../data/quranVocabulary";
import {
  normalizeRecitationWord,
  recitationWords,
} from "../../lib/recitationMatching";
import "./Learning.css";
export function ComprehensionCheck({
  arabic,
  reference,
  onComplete,
}: {
  arabic: string;
  reference: string;
  onComplete: () => void;
}) {
  const [answer, setAnswer] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [revealed, setRevealed] = useState(false);
  const words = new Set(recitationWords(arabic).map(normalizeRecitationWord));
  const word = QURAN_VOCABULARY.find((w) =>
    words.has(normalizeRecitationWord(w.arabic)),
  );
  const choices = word
    ? [
        word.meaningFr,
        ...QURAN_VOCABULARY.filter(
          (w) => w.id !== word.id && w.meaningFr !== word.meaningFr,
        )
          .map((w) => w.meaningFr)
          .filter((v, i, a) => a.indexOf(v) === i)
          .slice(0, 2),
      ].sort((a, b) => a.localeCompare(b))
    : [];
  return (
    <div className="learning-word-check">
      <h3>Un instant pour retenir</h3>
      {word ? (
        <>
          <p>
            Quel est le sens de{" "}
            <span lang="ar" dir="rtl" style={{ fontSize: "1.8rem" }}>
              {word.arabic}
            </span>{" "}
            ?
          </p>
          <div className="learning-actions">
            {choices.map((choice) => (
              <button
                type="button"
                className="learning-btn"
                key={choice}
                aria-pressed={answer === choice}
                onClick={() => {
                  setAnswer(choice);
                  if (choice === word.meaningFr) onComplete();
                }}
              >
                {choice}
              </button>
            ))}
          </div>
          {answer && (
            <p role="status">
              {answer === word.meaningFr
                ? "Oui. Vous pouvez continuer."
                : "À revoir : relisez le passage puis essayez une autre réponse."}
            </p>
          )}
        </>
      ) : (
        <>
          <label>
            Résumez en quelques mots ce que vous avez compris.
            <textarea
              style={{
                width: "100%",
                minHeight: 85,
                padding: 12,
                borderRadius: 10,
                marginTop: 10,
                color: "var(--color-text-primary)",
                background: "var(--color-bg-primary)",
              }}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="learning-btn"
            disabled={draft.trim().length < 10}
            onClick={() => setRevealed(true)}
          >
            Comparer au texte
          </button>
          {revealed && (
            <>
              <p className="learning-muted">{reference}</p>
              <button
                type="button"
                className="learning-btn primary"
                onClick={onComplete}
              >
                J’ai comparé et corrigé mon résumé
              </button>
              <p className="learning-muted">
                Autoévaluation : votre résumé n’est pas noté automatiquement.
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}
