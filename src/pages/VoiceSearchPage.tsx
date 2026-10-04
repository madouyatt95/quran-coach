import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { tilawaService } from "../lib/tilawa/service";
import { passageUrl, type Passage } from "../lib/learning";
import { useQuranStore } from "../stores/quranStore";
import "../components/Learning/Learning.css";
export function VoiceSearchPage() {
  const [listening, setListening] = useState(false);
  const [starting, setStarting] = useState(false);
  const [message, setMessage] = useState("");
  const [results, setResults] = useState<Passage[]>([]);
  const request = useRef(0);
  const { surahs } = useQuranStore();
  useEffect(() => {
    const suspend = () => {
      if (document.hidden) {
        request.current++;
        void tilawaService.stop();
        setListening(false);
        setStarting(false);
      }
    };
    document.addEventListener("visibilitychange", suspend);
    return () => {
      // This counter invalidates asynchronous callbacks; it is not a DOM ref.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      request.current++;
      void tilawaService.stop();
      document.removeEventListener("visibilitychange", suspend);
    };
  }, []);
  async function start() {
    const id = ++request.current;
    setStarting(true);
    setMessage("Préparation du moteur local…");
    setResults([]);
    const ok = await tilawaService.startSearch({
      onVerse: (p) => {
        if (id === request.current)
          setResults((rows) =>
            rows.some((r) => r.surah === p.surah && r.ayah === p.ayah)
              ? rows
              : [...rows, p],
          );
      },
      onStatus: (m) => {
        if (id === request.current) setMessage(m);
      },
      onError: (m) => {
        if (id === request.current) setMessage(m);
      },
      onEnd: () => {
        if (id === request.current) {
          setListening(false);
          setStarting(false);
        }
      },
    });
    if (id === request.current) {
      setStarting(false);
      setListening(ok);
      if (ok) setMessage("Récitez quelques mots, puis terminez l’écoute.");
    }
  }
  return (
    <div className="learning-page">
      <Link className="learning-btn" to="/learning">
        ← Ma séance
      </Link>
      <h1>Retrouver un verset à la voix</h1>
      <p className="learning-muted">
        Tilawa recherche localement le passage que vous récitez. Confirmez le
        résultat avant de l’ouvrir. Le pack vocal doit être téléchargé une
        première fois.
      </p>
      <Link className="learning-btn" to="/storage">
        Préparer le pack Tilawa
      </Link>
      <section className="learning-card">
        <div className="learning-actions">
          {listening ? (
            <button
              className="learning-btn primary"
              onClick={() => {
                setListening(false);
                setStarting(true);
                setMessage("Analyse de la fin du passage…");
                void tilawaService.finish();
              }}
            >
              Terminer et analyser
            </button>
          ) : (
            <button
              className="learning-btn primary"
              disabled={starting}
              onClick={() => void start()}
            >
              {starting ? "Préparation…" : "Commencer l’écoute locale"}
            </button>
          )}
          {(starting || listening) && (
            <button
              className="learning-btn"
              onClick={() => {
                request.current++;
                void tilawaService.stop();
                setStarting(false);
                setListening(false);
                setMessage("Écoute arrêtée.");
              }}
            >
              Annuler
            </button>
          )}
        </div>
        <p role="status">{message}</p>
      </section>
      {results.map((p) => (
        <section className="learning-card" key={`${p.surah}:${p.ayah}`}>
          <h2>
            {surahs.find((s) => s.number === p.surah)?.englishName ||
              `Sourate ${p.surah}`}{" "}
            · {p.ayah}
          </h2>
          <p className="learning-muted">
            Passage proposé par le moteur. Vérifiez-le à la lecture.
          </p>
          <Link
            className="learning-btn"
            onClick={() => void tilawaService.stop()}
            to={passageUrl(p)}
          >
            Ouvrir et vérifier ce passage
          </Link>
        </section>
      ))}
      {!listening && !starting && message && !results.length && (
        <p className="learning-muted">
          Aucun passage confirmé pour le moment. Vous pouvez réessayer avec un
          extrait plus long et moins de bruit.
        </p>
      )}
    </div>
  );
}
