import { useEffect, useRef, useState } from "react";
import {
  downloadTilawaPack,
  removeTilawaPack,
  tilawaPackStatus,
} from "../../lib/tilawa/assets";
import { useLearningStore } from "../../stores/learningStore";
import "./Learning.css";
export function TilawaPackCard() {
  const [ready, setReady] = useState(false);
  const [bytes, setBytes] = useState(0);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const cancel = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const { engine, setEngine } = useLearningStore();
  useEffect(() => {
    mounted.current = true;
    void tilawaPackStatus().then((s) => {
      if (mounted.current) {
        setReady(s.ready);
        setBytes(s.bytes);
      }
    });
    return () => {
      mounted.current = false;
      cancel.current?.abort();
    };
  }, []);
  async function download() {
    const controller = new AbortController();
    cancel.current = controller;
    setError("");
    setProgress(0);
    try {
      await downloadTilawaPack((n) => {
        if (mounted.current) setProgress(n);
      }, controller.signal);
      if (mounted.current) {
        const status = await tilawaPackStatus();
        setReady(status.ready);
        setBytes(status.bytes);
        if (status.ready) setEngine("tilawa");
      }
    } catch (e) {
      if (mounted.current)
        setError(
          controller.signal.aborted
            ? "Téléchargement en pause. Les fichiers complets sont conservés."
            : e instanceof Error
              ? e.message
              : "Téléchargement impossible.",
        );
    } finally {
      if (mounted.current) setProgress(null);
    }
  }
  return (
    <section className="learning-card">
      <span className="learning-kicker">Voix locale · Tilawa</span>
      <h2>Coach vocal hors ligne</h2>
      <p className="learning-muted">
        Pack d’environ 83 Mio. Après téléchargement, l’analyse de votre voix
        s’exécute sur cet appareil. Aucun enregistrement n’est envoyé par
        Tilawa. Le navigateur peut libérer le stockage en cas de manque
        d’espace.
      </p>
      <p>
        {ready
          ? "✓ Pack complet et vérifié"
          : bytes
            ? `${(bytes / 1024 / 1024).toFixed(1)} Mio conservés · pack incomplet`
            : "Pack non installé"}
      </p>
      {progress !== null && (
        <>
          <progress className="learning-progress" max={100} value={progress} />
          <p role="status">Téléchargement : {Math.floor(progress)} %</p>
          <button
            className="learning-btn"
            onClick={() => cancel.current?.abort()}
          >
            Mettre en pause
          </button>
        </>
      )}
      {error && (
        <p role="alert" className="learning-status">
          {error}
        </p>
      )}
      <div className="learning-actions">
        {!ready && progress === null && (
          <button
            className="learning-btn primary"
            onClick={() => void download()}
          >
            Télécharger ou reprendre le pack
          </button>
        )}
        {ready && (
          <button
            className="learning-btn"
            aria-pressed={engine === "tilawa"}
            onClick={() =>
              setEngine(engine === "tilawa" ? "standard" : "tilawa")
            }
          >
            {engine === "tilawa" ? "Tilawa sélectionné" : "Utiliser Tilawa"}
          </button>
        )}
        {progress === null && (ready || bytes > 0) && (
          <button
            className="learning-btn"
            onClick={async () => {
              try {
                await removeTilawaPack();
                setEngine("standard");
                setReady(false);
                setBytes(0);
              } catch (e) {
                setError(
                  e instanceof Error ? e.message : "Suppression impossible",
                );
              }
            }}
          >
            Libérer le pack vocal
          </button>
        )}
      </div>
      <details className="learning-muted">
        <summary>Sources et conditions d’utilisation</summary>
        <p>
          Moteur Tilawa 0.4.0 (MIT), modèle et corpus Quran-Lab NPL-1.2, ONNX
          Runtime 1.24.2 (MIT). Les signalements restent à vérifier et ne
          constituent pas une note de tajwid.
        </p>
        <a href="/tilawa/v1/NPL-1.2.txt" target="_blank" rel="noreferrer">
          Licence du modèle
        </a>{" "}
        ·{" "}
        <a href="/tilawa/v1/NOTICE.md" target="_blank" rel="noreferrer">
          Notices
        </a>
      </details>
    </section>
  );
}
