import { useEffect, useState } from "react";
import { useDownloadStore } from "../../stores/downloadStore";
import { preparePassages } from "../../lib/listeningExperience";
import { annotateJourney } from "../../lib/listeningJourney";
import { journeyPackUrls } from "../../lib/listeningOffline";
import type {
  ListeningChapter,
  ListeningJourney,
} from "../../data/listeningJourneys";
export function JourneyDownload({
  journey,
  chapters,
  voice,
}: {
  journey?: ListeningJourney;
  chapters: ListeningChapter[];
  voice: string;
}) {
  const id = `journey-${journey?.id || chapters.map((c) => `${c.surah}-${c.from}-${c.to}`).join("_")}-${voice}`;
  const task = useDownloadStore((s) => s.tasks[id]);
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const t = useDownloadStore.getState().tasks[id];
    if (t) void useDownloadStore.getState().verifyCacheStatus(id, t.urls[0]);
  }, [id]);
  async function download() {
    setPreparing(true);
    setError("");
    try {
      const raw =
        task?.items ||
        (await preparePassages(journey?.chapters || chapters, voice));
      const items = journey ? annotateJourney(raw, journey) : raw;
      await useDownloadStore
        .getState()
        .startDownload(
          id,
          journey?.title || "Mon passage immersif",
          journeyPackUrls(items),
          "journey",
          items,
        );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Préparation impossible.");
    } finally {
      setPreparing(false);
    }
  }
  const busy = preparing || task?.status === "downloading";
  return (
    <section
      className="experience-offline"
      aria-label="Pack du parcours hors ligne"
    >
      <div>
        <strong>📥 Emporter {journey ? "ce parcours" : "ce passage"}</strong>
        <p>
          Audio de la voix choisie, arabe, traduction et explications Mokhtasar.
          Le parcours entier est inclus.
        </p>
      </div>
      {task && (
        <>
          <progress
            max={100}
            value={task.progress}
            aria-label="Téléchargement du parcours"
          />
          <small role="status">
            {task.status === "completed"
              ? "✓ Pack complet disponible hors ligne"
              : `${task.progress} % · ${task.status === "downloading" ? "Téléchargement…" : task.error || "En pause"}`}
            {task.bytes ? ` · ${(task.bytes / 1024 / 1024).toFixed(1)} Mo` : ""}
          </small>
        </>
      )}
      {error && <p role="alert">{error}</p>}
      {task?.status === "downloading" ? (
        <button onClick={() => useDownloadStore.getState().pauseDownload(id)}>
          Mettre en pause
        </button>
      ) : (
        <button disabled={busy} onClick={() => void download()}>
          {busy
            ? "Préparation…"
            : task?.status === "completed"
              ? "Vérifier le pack"
              : task
                ? "Reprendre le téléchargement"
                : "Télécharger le pack complet"}
        </button>
      )}
      <small>
        Conservé sur cet appareil. Gardez l’application ouverte pendant le
        téléchargement.
      </small>
    </section>
  );
}
