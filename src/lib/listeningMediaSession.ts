import {mediaSessionOwner,claimMediaSession} from './mediaSessionOwner';
import type { PlaylistItem } from "../types";
interface MediaPlayer {
  currentSurahNumber: number;
  currentSurahName: string;
  currentPlaylistIndex: number;
  playlist: PlaylistItem[];
  isPlaying: boolean;
  isLoading: boolean;
  duration: number;
  currentTime: number;
  playbackRate: number;
  togglePlay: () => void;
  seek: (time: number) => void;
  prevAyah: () => void;
  jumpToPlaylistIndex: (index: number) => void;
  stop: () => void;
}
let currentKey = "";
const actions: MediaSessionAction[] = [
  "play",
  "pause",
  "stop",
  "previoustrack",
  "nexttrack",
  "seekbackward",
  "seekforward",
  "seekto",
];
export function syncListeningMediaSession(
  s: MediaPlayer,
  get: () => MediaPlayer,
) {
  if (typeof navigator === "undefined" || !navigator.mediaSession) return;
  if (mediaSessionOwner() && mediaSessionOwner() !== "quran") {
    if (!s.isPlaying) return;
    if(typeof window!=="undefined")window.dispatchEvent(new Event("quran-stop-playback"));
    claimMediaSession("quran"); currentKey = "";
  }
  const session = navigator.mediaSession;
  const item = s.playlist[s.currentPlaylistIndex];
  if (!s.currentSurahNumber) {
    if (!currentKey) return;
    currentKey = "";
    session.metadata = null;
    session.playbackState = "none";
    actions.forEach((action) => {
      try {
        session.setActionHandler(action, null);
      } catch {
        /* Unsupported action. */
      }
    });
    try {
      session.setPositionState?.();
    } catch {
      /* Unsupported position state. */
    }
    return;
  }
  const key = `${item?.audioUrl}:${s.currentSurahName}`;
  if (key !== currentKey) {
    currentKey = key;
    if (typeof MediaMetadata !== "undefined")
      session.metadata = new MediaMetadata({
        title: `${s.currentSurahName}${item?.verse ? ` · verset ${item.verse.number}` : ""}`,
        artist: item?.reciterName || "Quran Coach",
        album: "Quran Coach · Écoute",
      });
    const handlers: Record<string, MediaSessionActionHandler> = {
      play: () => {
        const p = get();
        if (!p.isPlaying && !p.isLoading) p.togglePlay();
      },
      pause: () => {
        const p = get();
        if (p.isPlaying || p.isLoading) p.togglePlay();
      },
      stop: () => get().stop(),
      previoustrack: () => get().prevAyah(),
      nexttrack: () => {
        const p = get();
        if (p.currentPlaylistIndex < p.playlist.length - 1)
          p.jumpToPlaylistIndex(p.currentPlaylistIndex + 1);
      },
      seekbackward: (d) => get().seek(get().currentTime - (d.seekOffset ?? 15)),
      seekforward: (d) => get().seek(get().currentTime + (d.seekOffset ?? 15)),
      seekto: (d) => {
        if (d.seekTime !== undefined) get().seek(d.seekTime);
      },
    };
    actions.forEach((action) => {
      try {
        session.setActionHandler(action, handlers[action]);
      } catch {
        /* Device does not support this action. */
      }
    });
  }
  session.playbackState = s.isPlaying ? "playing" : "paused";
  try {
    if (s.duration > 0 && Number.isFinite(s.duration))
      session.setPositionState?.({
        duration: s.duration,
        position: Math.min(s.duration, Math.max(0, s.currentTime)),
        playbackRate: s.playbackRate,
      });
    else session.setPositionState?.();
  } catch {
    /* Older browser or transitioning metadata. */
  }
}
