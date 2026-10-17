import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDownloadStore } from "../../stores/downloadStore";
import { useAudioPlayerStore } from "../../stores/audioPlayerStore";
export function OfflineLibrary() {
  const {
    tasks,
    startDownload,
    pauseDownload,
    removeDownload,
    verifyCacheStatus,
  } = useDownloadStore();
  const [space, setSpace] = useState<number | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    for (const task of Object.values(useDownloadStore.getState().tasks))
      if (task.kind !== "text") void verifyCacheStatus(task.id, task.urls[0]);
    void navigator.storage
      ?.estimate()
      .then((s) => setSpace(Math.max(0, (s.quota || 0) - (s.usage || 0))))
      .catch(() => {});
  }, [verifyCacheStatus]);
  const audio = Object.values(tasks).filter((t) => t.kind !== "text");
  return (
    <section className="listen-section">
      <div className="listen-section-heading">
        <h2>Ma bibliothèque hors ligne</h2>
        <Link to="/storage">Stockage →</Link>
      </div>
      <p className="listen-muted">
        {space !== null
          ? `${(space / 1024 / 1024).toFixed(0)} Mo disponibles estimés sur cet appareil. `
          : ""}
        Gardez l’application ouverte pendant le téléchargement.
      </p>
      {!audio.length && (
        <div className="listen-empty">
          📥<h3>Vos récitations, même sans réseau</h3>
          <p>Ouvrez un récitant et sélectionnez les sourates à emporter.</p>
        </div>
      )}
      {error && <p role="alert">{error}</p>}
      <div className="listen-list">
        {audio.map((task) => (
          <article className="listen-download" key={task.id}>
            <div>
              <strong>{task.title}</strong>
              <small>
                {task.urls.length} fichier{task.urls.length > 1 ? "s" : ""} ·{" "}
                {task.bytes
                  ? `${(task.bytes / 1024 / 1024).toFixed(1)} Mo`
                  : "Taille connue après téléchargement"}
              </small>
            </div>
            <progress
              max={100}
              value={task.progress}
              aria-label={`Téléchargement de ${task.title}`}
            />
            <small role="status">
              {task.status === "completed"
                ? "✓ Disponible hors ligne"
                : task.status === "downloading"
                  ? `Téléchargement · ${task.progress} %`
                  : task.error || `En pause · ${task.progress} %`}
            </small>
            <div className="listen-actions">
              {task.status === "completed" && task.kind === "journey" && (
                <Link
                  className="experience-primary"
                  to={
                    task.items?.[0]?.journey
                      ? `/listen/experience?journey=${task.items[0].journey.id}&voice=${task.items[0].reciterId}`
                      : `/listen/experience?pack=${encodeURIComponent(task.id)}`
                  }
                >
                  📖 Ouvrir le parcours
                </Link>
              )}
              {task.status === "completed" &&
                task.kind !== "journey" &&
                task.items?.length && (
                  <button
                    onClick={() =>
                      useAudioPlayerStore
                        .getState()
                        .setPlaylist(
                          task.items!,
                          0,
                          task.items![0].reciterId || "",
                        )
                    }
                  >
                    ▶ Écouter
                  </button>
                )}
              {task.status === "downloading" ? (
                <button onClick={() => pauseDownload(task.id)}>Pause</button>
              ) : (
                <button
                  onClick={() =>
                    void startDownload(
                      task.id,
                      task.title,
                      task.urls,
                      task.kind,
                      task.items,
                    )
                  }
                >
                  {task.status === "completed"
                    ? "Vérifier les fichiers"
                    : "Reprendre"}
                </button>
              )}
              <button
                disabled={task.status === "downloading"}
                onClick={() => {
                  if (
                    window.confirm(
                      `Supprimer « ${task.title} » du stockage hors ligne ?`,
                    )
                  )
                    void removeDownload(task.id, task.urls).catch(() =>
                      setError(
                        "Suppression impossible. Réessayez depuis Stockage.",
                      ),
                    );
                }}
              >
                Supprimer
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
