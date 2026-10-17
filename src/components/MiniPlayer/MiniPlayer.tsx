import { Link } from "react-router-dom";
import { shareMoment, momentUrl } from "../../lib/listeningExperience";
import { useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useAudioPlayerStore } from "../../stores/audioPlayerStore";
import { useListenStore } from "../../stores/listenStore";
import { DownloadButton } from "../DownloadButton";
import { LearnFromAudio } from "../Listen/LearnFromAudio";
import { downloadId, formatListeningTime as time } from "../../lib/listening";
import "./MiniPlayer.css";

export function MiniPlayer() {
  const p = useAudioPlayerStore();
  const [expanded, setExpanded] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [learn, setLearn] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [saved, setSaved] = useState(false);
  if (!p.currentSurahNumber || p.immersiveControlsVisible) return null;
  const item = p.playlist[p.currentPlaylistIndex];
  const progress =
    p.duration > 0 ? Math.min(100, (p.currentTime / p.duration) * 100) : 0;
  const playLabel = p.isPlaying || p.isLoading ? "Mettre en pause" : "Lire";
  const playButton = (
    <button
      className="mini-player__play"
      aria-label={playLabel}
      onClick={p.togglePlay}
    >
      {p.isPlaying || p.isLoading ? <Pause size={20} /> : <Play size={20} />}
    </button>
  );
  const timerValue = p.sleepAtEnd ? "end" : p.sleepUntil ? "active" : "off";
  return (
    <>
      {minimized ? (
        <div className="mini-player-pill">
          {playButton}
          <button
            onClick={() => setMinimized(false)}
            aria-label="Ouvrir le lecteur"
          >
            {p.currentSurahName}
            <ChevronUp size={16} />
          </button>
        </div>
      ) : (
        <section
          className={`mini-player ${expanded ? "expanded" : ""}`}
          aria-label="Lecteur audio"
        >
          <div className="mini-player__progress" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className="mini-player__main">
            <button
              className="mini-player__info"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              aria-label="Afficher les commandes de lecture"
            >
              <strong>
                {p.currentSurahName}
                {item?.verse ? ` · ${item.verse.number}` : ""}
              </strong>
              <small>
                {p.isLoading
                  ? "Chargement audio…"
                  : item?.reciterName || p.currentSurahNameAr}
              </small>
            </button>
            {playButton}
            <button
              aria-label={
                expanded ? "Réduire les commandes" : "Développer le lecteur"
              }
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </button>
            <button aria-label="Fermer le lecteur" onClick={p.stop}>
              <X size={18} />
            </button>
          </div>
          {p.error && (
            <div className="mini-player__error" role="alert">
              {p.error}
              <button onClick={p.togglePlay}>Réessayer</button>
            </div>
          )}
          {expanded && (
            <div className="mini-player__body">
              <label className="mini-player__seek">
                <span className="sr-only">Position de lecture</span>
                <input
                  aria-label="Position de lecture en secondes"
                  type="range"
                  min={0}
                  max={p.duration || 1}
                  step={1}
                  value={Math.min(p.currentTime, p.duration || 1)}
                  disabled={!p.duration}
                  onChange={(e) => p.seek(Number(e.target.value))}
                />
              </label>
              <div className="mini-player__times">
                <span>{time(p.currentTime)}</span>
                <span>{time(p.duration)}</span>
              </div>
              <div className="mini-player__transport">
                <button
                  onClick={p.prevAyah}
                  aria-label="Piste précédente ou retour au début"
                >
                  <SkipBack size={20} />
                </button>
                <button
                  onClick={() => p.seek(p.currentTime - 15)}
                  aria-label="Reculer de 15 secondes"
                >
                  ↶ 15 s
                </button>
                <button
                  onClick={p.toggleRepeatMode}
                  aria-label={`Répétition : ${p.repeatMode === "none" ? "désactivée" : p.repeatMode === "one" ? "cette piste" : "toute la file"}`}
                  aria-pressed={p.repeatMode !== "none"}
                >
                  {p.repeatMode === "one"
                    ? "↻ 1"
                    : p.repeatMode === "all"
                      ? "↻ Tout"
                      : "↻"}
                </button>
                <button
                  onClick={() => p.seek(p.currentTime + 15)}
                  aria-label="Avancer de 15 secondes"
                >
                  15 s ↷
                </button>
                <button
                  disabled={p.currentPlaylistIndex >= p.playlist.length - 1}
                  onClick={() =>
                    p.jumpToPlaylistIndex(p.currentPlaylistIndex + 1)
                  }
                  aria-label="Piste suivante"
                >
                  <SkipForward size={20} />
                </button>
              </div>
              <div className="mini-player__settings">
                <label>
                  Vitesse
                  <select
                    value={p.playbackRate}
                    onChange={(e) => p.setPlaybackRate(Number(e.target.value))}
                  >
                    {[0.75, 1, 1.25, 1.5, 2].map((r) => (
                      <option key={r} value={r}>
                        {r}×
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Arrêt automatique
                  <select
                    value={timerValue}
                    onChange={(e) =>
                      p.setSleepTimer(
                        e.target.value === "off"
                          ? null
                          : e.target.value === "end"
                            ? "end"
                            : Number(e.target.value),
                      )
                    }
                  >
                    <option value="off">Désactivé</option>
                    {p.sleepUntil && (
                      <option value="active">
                        À{" "}
                        {new Date(p.sleepUntil).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </option>
                    )}
                    {[10, 20, 30, 60].map((m) => (
                      <option key={m} value={m}>
                        Dans {m} minutes
                      </option>
                    ))}
                    <option value="end">À la fin de la sourate</option>
                  </select>
                </label>
              </div>
              {p.playbackType === "surah" && item && (
                <div className="mini-player__tools">
                  <Link
                    onClick={() => setExpanded(false)}
                    to={
                      item.verse
                        ? "/listen/experience?current=1"
                        : `/listen/experience?surah=${item.surahNumber}`
                    }
                  >
                    📖 Écouter et comprendre
                  </Link>
                  <button
                    onClick={() => {
                      const start = p.loopStart ?? p.currentTime;
                      setShareUrl(
                        momentUrl(item, start, p.loopEnd ?? undefined),
                      );
                      void shareMoment(item, start, p.loopEnd ?? undefined)
                        .then(setShareStatus)
                        .catch(() =>
                          setShareStatus(
                            "Ouvrez le lien ci-dessous pour le partager.",
                          ),
                        );
                    }}
                  >
                    ↗ Partager ce moment
                  </button>
                  <button
                    disabled={!p.duration}
                    onClick={() => {
                      useListenStore.getState().addBookmark({
                        reciterId: p.reciterId,
                        verse: item.verse,
                        reciterName: item.reciterName || "",
                        surahNumber: item.surahNumber,
                        surahName: item.surahName,
                        audioUrl: item.audioUrl!,
                        position: p.currentTime,
                      });
                      setSaved(true);
                    }}
                  >
                    🔖 Garder un repère
                  </button>
                  <button onClick={() => setLearn(true)}>
                    📖 Lire / Mémoriser
                  </button>
                  <button
                    disabled={
                      !p.duration ||
                      (p.loopStart !== null &&
                        p.loopEnd === null &&
                        p.currentTime <= p.loopStart + 1)
                    }
                    onClick={p.setLoopPoint}
                  >
                    {p.loopEnd !== null
                      ? "↻ Désactiver la boucle"
                      : p.loopStart !== null
                        ? "Marquer la fin B"
                        : "↻ Début de boucle A"}
                  </button>
                  <DownloadButton
                    id={downloadId(p.playlist)}
                    title={`Séance · ${p.playlist.length} sourates`}
                    urls={p.playlist.flatMap((s) =>
                      s.audioUrl ? [s.audioUrl] : [],
                    )}
                    items={p.playlist}
                  />
                </div>
              )}
              {shareStatus && (
                <p role="status" className="mini-player__hint">
                  {shareStatus}
                </p>
              )}
              {shareUrl && (
                <a className="mini-player__hint" href={shareUrl}>
                  Lien vers le moment partagé
                </a>
              )}
              {saved && (
                <p className="mini-player__hint" role="status">
                  Repère enregistré dans Écoute → Favoris.{" "}
                  <button onClick={() => setSaved(false)}>OK</button>
                </p>
              )}
              {p.loopStart !== null && (
                <p className="mini-player__hint">
                  Boucle audio : A {time(p.loopStart)}
                  {p.loopEnd !== null
                    ? ` → B ${time(p.loopEnd)}`
                    : " · Avancez puis marquez B."}
                </p>
              )}
              <div className="mini-player__queue-title">
                <strong>
                  À l’écoute · {p.currentPlaylistIndex + 1}/{p.playlist.length}
                </strong>
                <button
                  onClick={() => {
                    setExpanded(false);
                    setMinimized(true);
                  }}
                >
                  Mode discret
                </button>
              </div>
              <ol className="mini-player__queue">
                {p.playlist.map((s, i) => (
                  <li
                    key={`${s.audioUrl}-${i}`}
                    aria-current={
                      i === p.currentPlaylistIndex ? "true" : undefined
                    }
                  >
                    <button onClick={() => p.jumpToPlaylistIndex(i)}>
                      <span>{i + 1}.</span>
                      <span>
                        <strong>
                          {s.surahName}
                          {s.verse ? ` · verset ${s.verse.number}` : ""}
                        </strong>
                        <small>{s.reciterName}</small>
                      </span>
                    </button>
                    {i > p.currentPlaylistIndex && (
                      <button
                        aria-label={`Retirer ${s.surahName} de la file`}
                        onClick={() => p.removeFromQueue(i)}
                      >
                        ✕
                      </button>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>
      )}
      {learn && item && (
        <LearnFromAudio item={item} onClose={() => setLearn(false)} />
      )}
    </>
  );
}
