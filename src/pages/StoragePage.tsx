import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuranStore } from "../stores/quranStore";
import { useDownloadStore } from "../stores/downloadStore";
import { fetchSurah, getAudioUrl } from "../lib/quranApi";
import { TilawaPackCard } from "../components/Learning/TilawaPackCard";
import "../components/Learning/Learning.css";
export function StoragePage() {
  const { surahs } = useQuranStore();
  const downloads = useDownloadStore();
  const [surah, setSurah] = useState(1);
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const state = useDownloadStore.getState();
    for (const task of Object.values(state.tasks))
      void state.verifyCacheStatus(task.id, task.urls[0]);
  }, []);
  const textPack = () => {
    const base = "https://api.alquran.cloud/v1";
    void downloads.startDownload(
      `text-${surah}`,
      `Sourate ${surah} · texte et traduction`,
      [
        `${base}/surah`,
        `${base}/surah/${surah}/quran-uthmani`,
        `${base}/surah/${surah}/fr.hamidullah`,
        `${base}/surah/${surah}/en.transliteration`,
      ],
      "text",
    );
  };
  const audioPack = async () => {
    setPreparing(true);
    setError("");
    try {
      const data = await fetchSurah(surah);
      await downloads.startDownload(
        `alafasy-${surah}`,
        `${data.surah.englishName} · Mishary Al-Afasy`,
        data.ayahs.map((a) => getAudioUrl("ar.alafasy", a.number)),
      );
    } catch {
      setError(
        "Impossible de préparer les fichiers. Vérifiez votre connexion.",
      );
    } finally {
      setPreparing(false);
    }
  };
  return (
    <div className="learning-page">
      <Link className="learning-btn" to="/learning">
        ← Ma séance
      </Link>
      <h1>Mes packs hors ligne</h1>
      <p className="learning-muted">
        Téléchargez les contenus dont vous avez besoin. Les fichiers complets
        sont conservés si le téléchargement est interrompu.
      </p>
      <section className="learning-card">
        <h2>Mes sourates</h2>
        <label>
          Sourate
          <select
            value={surah}
            onChange={(e) => setSurah(Number(e.target.value))}
          >
            {surahs.map((s) => (
              <option key={s.number} value={s.number}>
                {s.number}. {s.englishName}
              </option>
            ))}
          </select>
        </label>
        <p className="learning-muted">
          Texte, traduction française et phonétique : généralement moins de 1
          Mio par sourate. L’audio occupe davantage d’espace selon la durée. Le
          tafsir n’est pas inclus dans ce pack.
        </p>
        <div className="learning-actions">
          <button
            className="learning-btn"
            disabled={preparing}
            onClick={textPack}
          >
            Texte et traduction
          </button>
          <button
            className="learning-btn"
            disabled={preparing}
            onClick={() => void audioPack()}
          >
            {preparing ? "Préparation…" : "Audio Al-Afasy"}
          </button>
        </div>
        {error && <p role="alert">{error}</p>}
      </section>
      <TilawaPackCard />
      <section className="learning-card">
        <h2>Mes téléchargements</h2>
        {!Object.keys(downloads.tasks).length && (
          <p className="learning-muted">
            Aucun pack de sourate ajouté ici pour le moment.
          </p>
        )}
        {Object.values(downloads.tasks).map((task) => (
          <div className="learning-card" key={task.id}>
            <h3>{task.title || task.id}</h3>
            <p>
              {task.urls.length} fichiers ·{" "}
              {((task.bytes || 0) / 1024 / 1024).toFixed(1)} Mio ·{" "}
              {task.status === "completed"
                ? "Disponible hors ligne"
                : task.status === "downloading"
                  ? "Téléchargement…"
                  : "Incomplet"}
            </p>
            <progress
              className="learning-progress"
              max={100}
              value={task.progress}
            />
            {task.error && <p role="status">{task.error}</p>}
            <div className="learning-actions">
              {task.status === "downloading" ? (
                <button
                  className="learning-btn"
                  onClick={() => downloads.pauseDownload(task.id)}
                >
                  Pause
                </button>
              ) : (
                <>
                  <button
                    className="learning-btn"
                    onClick={() =>
                      void downloads.startDownload(
                        task.id,
                        task.title,
                        task.urls,
                        task.kind,
                      )
                    }
                  >
                    {task.status === "completed"
                      ? "Vérifier les fichiers"
                      : "Reprendre"}
                  </button>
                  <button
                    className="learning-btn"
                    onClick={() =>
                      void downloads
                        .removeDownload(task.id, task.urls)
                        .catch(() =>
                          setError("Impossible de libérer ces fichiers."),
                        )
                    }
                  >
                    Supprimer ce pack
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </section>
      <p className="learning-muted">
        Pour contrôler votre préparation : fermez l’application, passez en mode
        avion, puis rouvrez le passage téléchargé.
      </p>
    </div>
  );
}
