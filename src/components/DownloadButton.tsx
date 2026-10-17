import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { CloudDownload, Pause, RotateCcw, CheckCircle2 } from "lucide-react";
import { useDownloadStore } from "../stores/downloadStore";
import type { PlaylistItem } from "../types";
import "./DownloadButton.css";
interface Props {
  id: string;
  title: string;
  urls: string[];
  className?: string;
  sampleUrlForCheck?: string;
  items?: PlaylistItem[];
}
export function DownloadButton({
  id,
  title,
  urls,
  className = "",
  sampleUrlForCheck,
  items,
}: Props) {
  const task = useDownloadStore((s) => s.tasks[id]);
  const { startDownload, pauseDownload, removeDownload, verifyCacheStatus } =
    useDownloadStore(
      useShallow((s) => ({
        startDownload: s.startDownload,
        pauseDownload: s.pauseDownload,
        removeDownload: s.removeDownload,
        verifyCacheStatus: s.verifyCacheStatus,
      })),
    );
  useEffect(() => {
    void verifyCacheStatus(id, sampleUrlForCheck || "");
  }, [id, sampleUrlForCheck, verifyCacheStatus]);
  const done = task?.status === "completed";
  const loading = task?.status === "downloading";
  const label = done
    ? `Supprimer ${title} du mode hors ligne`
    : loading
      ? `Mettre le téléchargement de ${title} en pause`
      : task
        ? `Reprendre le téléchargement de ${title}`
        : `Télécharger ${title}`;
  return (
    <button
      className={`download-btn ${className}`}
      aria-label={label}
      title={task?.error || label}
      disabled={!urls.length}
      onClick={(e) => {
        e.stopPropagation();
        if (loading) pauseDownload(id);
        else if (done) {
          if (window.confirm(`Supprimer « ${title} » des téléchargements ?`))
            void removeDownload(id, urls);
        } else void startDownload(id, title, urls, "audio", items);
      }}
    >
      {done ? (
        <CheckCircle2 size={18} />
      ) : loading ? (
        <>
          <Pause size={16} />
          <small>{task.progress}%</small>
        </>
      ) : task ? (
        <RotateCcw size={18} />
      ) : (
        <CloudDownload size={18} />
      )}
    </button>
  );
}
