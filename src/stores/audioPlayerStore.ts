import { useListeningJourneyStore } from "./listeningJourneyStore";
import {
  clearAudioPreload,
  preloadNextVerse,
  prefetchedSource,
} from "../lib/listeningAudioCache";
import { create } from "zustand";
import { syncListeningMediaSession } from "../lib/listeningMediaSession";
import { getAudioUrl } from "../lib/quranApi";
import { useListenStore } from "./listenStore";
import type { LastListened } from "./listenStore";
import { useListeningEvidenceStore } from "./listeningEvidenceStore";
import type { PlaylistItem } from "../types";

interface AudioPlayerState {
  immersiveControlsVisible: boolean;
  pauseForUnderstanding: boolean;
  boundaryPaused: boolean;
  stopReason: "understand" | "budget" | "complete" | null;
  sessionSecondsLeft: number | null;
  excerptEnd: number | null;
  requestUnderstanding: () => void;
  setSessionMinutes: (minutes: number | null) => void;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  currentAyahNumber: number;
  currentAyahInSurah: number;
  currentSurahNumber: number;
  currentSurahName: string;
  currentSurahNameAr: string;
  totalAyahsInSurah: number;
  duration: number;
  currentTime: number;
  playbackType: "ayah" | "surah";
  repeatMode: "none" | "one" | "all";
  playlist: PlaylistItem[];
  currentPlaylistIndex: number;
  reciterId: string;
  ayahs: { number: number; numberInSurah: number; text: string }[];
  playbackRate: number;
  sleepUntil: number | null;
  sleepAtEnd: boolean;
  loopStart: number | null;
  loopEnd: number | null;
  playSurah: (surah: PlaylistItem, reciterId: string) => void;
  setPlaylist: (
    items: PlaylistItem[],
    startIndex: number,
    reciterId: string,
    position?: number,
  ) => void;
  resume: (track: LastListened) => void;
  playAyah: (globalAyahNumber: number, ayahInSurah: number) => void;
  togglePlay: () => void;
  nextAyah: () => void;
  prevAyah: () => void;
  nextSurah: () => void;
  stop: () => void;
  setAyahs: (ayahs: AudioPlayerState["ayahs"]) => void;
  updateTime: (current: number, dur: number) => void;
  seek: (time: number) => void;
  toggleRepeatMode: () => void;
  jumpToPlaylistIndex: (index: number, position?: number) => void;
  getAudioRef: () => HTMLAudioElement;
  addToQueue: (surah: PlaylistItem) => void;
  removeFromQueue: (index: number) => void;
  setPlaybackRate: (rate: number) => void;
  setSleepTimer: (minutes: number | "end" | null) => void;
  setLoopPoint: () => void;
}
let globalAudio: HTMLAudioElement | null = null;
let generation = 0;
let activeSource = "";
let pendingPosition: number | null = null;
let lastSaved = 0;
let lastPlaybackTick = 0;
let heardSeconds = 0;
let lastMediaPosition = 0;
let verseEnded = false;
let sleepTimeout: ReturnType<typeof setTimeout> | undefined;

function savePosition() {
  const s = useAudioPlayerStore.getState();
  const item = s.playlist[s.currentPlaylistIndex];
  if (
    s.playbackType !== "surah" ||
    !item?.audioUrl ||
    item.audioUrl !== activeSource
  )
    return;
  if (!verseEnded)
    useListeningJourneyStore
      .getState()
      .saveCursor(item, pendingPosition ?? s.currentTime, heardSeconds);
  useListenStore.getState().setLastListened({
    reciterId: item.reciterId || s.reciterId,
    reciterName: item.reciterName || "",
    verse: item.verse,
    surahNumber: item.surahNumber,
    surahName: item.surahName,
    audioUrl: item.audioUrl,
    position: pendingPosition ?? s.currentTime,
    playlist: s.playlist,
    playlistIndex: s.currentPlaylistIndex,
  });
  lastSaved = Date.now();
}
function checkSleep() {
  const s = useAudioPlayerStore.getState();
  if (s.sleepUntil && Date.now() >= s.sleepUntil) {
    globalAudio?.pause();
    useAudioPlayerStore.setState({ isPlaying: false, isLoading: false });
    s.setSleepTimer(null);
    return true;
  }
  return false;
}
function getOrCreateAudio(): HTMLAudioElement {
  if (globalAudio) return globalAudio;
  const audio = new Audio();
  globalAudio = audio;
  audio.preload = "metadata";
  const ready = () => {
    if (pendingPosition !== null && audio.readyState >= 1) {
      const target = Number.isFinite(audio.duration)
        ? Math.min(pendingPosition, Math.max(0, audio.duration - 0.1))
        : pendingPosition;
      audio.currentTime = target;
      lastMediaPosition = target;
      pendingPosition = null;
      useAudioPlayerStore.setState({ currentTime: target });
    }
    audio.playbackRate = useAudioPlayerStore.getState().playbackRate;
    useAudioPlayerStore.setState({
      duration: Number.isFinite(audio.duration) ? audio.duration : 0,
    });
  };
  audio.addEventListener("loadedmetadata", ready);
  audio.addEventListener("durationchange", ready);
  audio.addEventListener("playing", () => {
    lastPlaybackTick = Date.now();
    if (!checkSleep())
      useAudioPlayerStore.setState({
        isPlaying: true,
        isLoading: false,
        error: null,
      });
  });
  audio.addEventListener("waiting", () =>
    useAudioPlayerStore.setState({ isLoading: true }),
  );
  audio.addEventListener("pause", () => {
    useAudioPlayerStore.setState({ isPlaying: false, isLoading: false });
    savePosition();
  });
  audio.addEventListener("error", () => {
    if (!audio.getAttribute("src")) return;
    useAudioPlayerStore.setState({
      isPlaying: false,
      isLoading: false,
      error: "Audio indisponible. Vérifiez votre connexion puis réessayez.",
    });
  });
  audio.addEventListener("timeupdate", () => {
    const s = useAudioPlayerStore.getState();
    const now = Date.now();
    const advance = audio.currentTime - lastMediaPosition;
    if (
      s.isPlaying &&
      !s.isLoading &&
      !audio.seeking &&
      pendingPosition === null &&
      advance > 0 &&
      advance <=
        Math.max(2, ((now - lastPlaybackTick) / 1000) * s.playbackRate * 1.5)
    )
      heardSeconds += advance;
    lastMediaPosition = audio.currentTime;
    if (
      s.isPlaying &&
      !s.isLoading &&
      !audio.seeking &&
      s.sessionSecondsLeft !== null
    ) {
      useAudioPlayerStore.setState({
        sessionSecondsLeft: Math.max(
          0,
          s.sessionSecondsLeft - Math.max(0, now - lastPlaybackTick) / 1000,
        ),
      });
    }
    lastPlaybackTick = now;
    if (s.excerptEnd !== null && audio.currentTime >= s.excerptEnd) {
      audio.pause();
      useAudioPlayerStore.setState({
        excerptEnd: null,
        stopReason: "complete",
        isPlaying: false,
        isLoading: false,
      });
    }
    if (pendingPosition === null)
      s.updateTime(
        audio.currentTime,
        Number.isFinite(audio.duration) ? audio.duration : 0,
      );
    if (checkSleep()) return;
    if (
      s.loopStart !== null &&
      s.loopEnd !== null &&
      audio.currentTime >= s.loopEnd
    )
      audio.currentTime = s.loopStart;
    if (Date.now() - lastSaved >= 5000) savePosition();
  });
  audio.addEventListener("ended", () => {
    const s = useAudioPlayerStore.getState();
    savePosition();
    const endedItem = s.playlist[s.currentPlaylistIndex];
    verseEnded = true;
    if (endedItem)
      useListeningJourneyStore
        .getState()
        .finishVerse(endedItem, audio.duration, heardSeconds);
    const verse = endedItem?.verse;
    if (verse)
      useListeningEvidenceStore
        .getState()
        .recordVerse(s.currentSurahNumber, verse.number, "lecteur");
    else if (s.playbackType === "ayah" && s.currentAyahInSurah > 0)
      useListeningEvidenceStore
        .getState()
        .recordVerse(s.currentSurahNumber, s.currentAyahInSurah, "lecteur");
    else if (s.playbackType === "surah")
      useListeningEvidenceStore.getState().recordSurah(s.currentSurahNumber);
    if (checkSleep()) return;
    if (s.pauseForUnderstanding || s.sessionSecondsLeft === 0) {
      audio.pause();
      useAudioPlayerStore.setState({
        isPlaying: false,
        isLoading: false,
        boundaryPaused: true,
        pauseForUnderstanding: false,
        stopReason: s.pauseForUnderstanding ? "understand" : "budget",
        sessionSecondsLeft:
          s.sessionSecondsLeft === 0 ? null : s.sessionSecondsLeft,
      });
      return;
    }
    if (
      s.sleepAtEnd &&
      ((s.playbackType === "surah" &&
        (!verse || verse.number >= s.totalAyahsInSurah)) ||
        s.currentAyahInSurah >= s.totalAyahsInSurah)
    ) {
      s.setSleepTimer(null);
      useAudioPlayerStore.setState({ isPlaying: false, isLoading: false });
      return;
    }
    if (s.loopStart !== null && s.loopEnd !== null) {
      audio.currentTime = s.loopStart;
      startPlayback();
      return;
    }
    s.nextAyah();
  });
  if (typeof window !== "undefined") {
    window.addEventListener("pagehide", savePosition);
    document.addEventListener("visibilitychange", () => {
      savePosition();
      checkSleep();
    });
  }
  return audio;
}
function startPlayback(url?: string, position = 0) {
  const audio = getOrCreateAudio();
  const request = ++generation;
  if (verseEnded) {
    verseEnded = false;
    heardSeconds = 0;
    lastMediaPosition = position;
  }
  useAudioPlayerStore.setState({ error: null, isLoading: true });
  if (url) {
    activeSource = url;
    pendingPosition = Math.max(0, position);
    audio.src = prefetchedSource(url);
    audio.playbackRate = useAudioPlayerStore.getState().playbackRate;
  }
  // Keep play() within the user's gesture; metadata applies the pending seek later.
  void audio.play().catch((error: DOMException) => {
    if (request !== generation || error.name === "AbortError") return;
    useAudioPlayerStore.setState({
      isPlaying: false,
      isLoading: false,
      error:
        error.name === "NotAllowedError"
          ? "Touchez Lecture pour autoriser le son."
          : "Impossible de lire cet audio. Réessayez ou choisissez une autre récitation.",
    });
  });
}
export const useAudioPlayerStore = create<AudioPlayerState>()((set, get) => ({
  immersiveControlsVisible: false,
  pauseForUnderstanding: false,
  boundaryPaused: false,
  stopReason: null,
  sessionSecondsLeft: null,
  excerptEnd: null,
  requestUnderstanding: () => {
    const s = get();
    if (s.isPlaying || s.isLoading)
      set({ pauseForUnderstanding: !s.pauseForUnderstanding });
    else set({ stopReason: "understand" });
  },
  setSessionMinutes: (minutes) =>
    set({
      sessionSecondsLeft: minutes === null ? null : Math.max(1, minutes) * 60,
    }),
  isPlaying: false,
  isLoading: false,
  error: null,
  currentAyahNumber: 0,
  currentAyahInSurah: 0,
  currentSurahNumber: 0,
  currentSurahName: "",
  currentSurahNameAr: "",
  totalAyahsInSurah: 0,
  duration: 0,
  currentTime: 0,
  playbackType: "ayah",
  repeatMode: "none",
  playlist: [],
  currentPlaylistIndex: 0,
  reciterId: "ar.alafasy",
  ayahs: [],
  playbackRate: useListeningJourneyStore.getState().preferences.rate,
  sleepUntil: null,
  sleepAtEnd: false,
  loopStart: null,
  loopEnd: null,
  playSurah: (item, id) =>
    get().setPlaylist(
      [{ ...item, playbackType: item.playbackType || "ayah" }],
      0,
      id,
    ),
  setPlaylist: (items, index, id, position = 0) => {
    if (!items.length || !items[index]) return;
    savePosition();
    getOrCreateAudio().pause();
    set({
      playlist: items,
      sessionSecondsLeft: null,
      pauseForUnderstanding: false,
      stopReason: null,
      excerptEnd: null,
      reciterId: id || items[index].reciterId || "ar.alafasy",
    });
    get().jumpToPlaylistIndex(index, position);
  },
  resume: (track) => {
    const saved = track.playlist;
    const index = track.playlistIndex ?? 0;
    const valid = saved?.[index]?.audioUrl === track.audioUrl;
    const items = valid
      ? saved!
      : [
          {
            verse: track.verse,
            surahNumber: track.surahNumber,
            surahName: track.surahName,
            surahNameAr: "",
            totalAyahs: 0,
            audioUrl: track.audioUrl,
            reciterId: String(track.reciterId),
            reciterName: track.reciterName,
            playbackType: "surah" as const,
          },
        ];
    get().setPlaylist(
      items,
      valid ? index : 0,
      String(track.reciterId),
      track.position,
    );
  },
  jumpToPlaylistIndex: (index, position = 0) => {
    const item = get().playlist[index];
    if (!item) return;
    // Flush before changing identity, including automatic transitions.
    savePosition();
    getOrCreateAudio().pause();
    pendingPosition = null;
    set({
      currentPlaylistIndex: index,
      boundaryPaused: false,
      pauseForUnderstanding: false,
      stopReason: null,
      excerptEnd: null,
      currentSurahNumber: item.surahNumber,
      currentSurahName: item.surahName,
      currentSurahNameAr: item.surahNameAr,
      totalAyahsInSurah: item.totalAyahs || 0,
      currentAyahInSurah:
        item.verse?.number ?? (item.playbackType === "ayah" ? 1 : 0),
      currentAyahNumber: 0,
      isPlaying: false,
      isLoading: false,
      error: null,
      reciterId: item.reciterId || get().reciterId,
      ayahs: [],
      playbackType: item.playbackType || "surah",
      currentTime: position,
      duration: 0,
      loopStart: null,
      loopEnd: null,
    });
    verseEnded = false;
    lastMediaPosition = position;
    const cursor =
      item.journey &&
      useListeningJourneyStore.getState().progress[item.journey.id];
    heardSeconds =
      cursor &&
      cursor.ordinal === item.journey?.ordinal &&
      cursor.voice === item.reciterId &&
      position > 0
        ? cursor.heard
        : 0;
    if (item.verse)
      preloadNextVerse(
        item.audioUrl || "",
        get().playlist[index + 1]?.verse
          ? get().playlist[index + 1].audioUrl
          : undefined,
      );
    else clearAudioPreload();
    window.dispatchEvent(new Event("quran-stop-playback"));
    if (item.audioUrl) {
      startPlayback(item.audioUrl, position);
      savePosition();
    } else if (get().playbackType === "surah")
      set({ error: "Aucun fichier audio disponible pour cette piste." });
  },
  setAyahs: (ayahs) => {
    set({ ayahs });
    if (ayahs[0]) get().playAyah(ayahs[0].number, ayahs[0].numberInSurah);
  },
  playAyah: (number, inSurah) => {
    set({
      currentAyahNumber: number,
      currentAyahInSurah: inSurah,
      currentTime: 0,
      duration: 0,
      isPlaying: false,
    });
    startPlayback(getAudioUrl(get().reciterId, number));
  },
  togglePlay: () => {
    if (get().boundaryPaused) {
      const s = get();
      set({ boundaryPaused: false, stopReason: null });
      if (s.currentPlaylistIndex < s.playlist.length - 1)
        s.jumpToPlaylistIndex(s.currentPlaylistIndex + 1);
      else {
        s.seek(0);
        startPlayback();
      }
      return;
    }
    set({ stopReason: null });
    if (get().isPlaying || get().isLoading) {
      ++generation;
      getOrCreateAudio().pause();
      set({ isLoading: false, isPlaying: false });
    } else if (get().currentSurahNumber) {
      const audio = getOrCreateAudio();
      if (audio.error) startPlayback(activeSource, get().currentTime);
      else startPlayback();
    }
  },
  seek: (time) => {
    if (!Number.isFinite(time)) return;
    const s = get();
    const value = Math.max(0, Math.min(time, s.duration || Math.max(0, time)));
    const audio = getOrCreateAudio();
    if (audio.readyState >= 1) audio.currentTime = value;
    else pendingPosition = value;
    lastMediaPosition = value;
    set({ currentTime: value });
    savePosition();
  },
  toggleRepeatMode: () =>
    set((s) => ({
      repeatMode:
        s.repeatMode === "none"
          ? "one"
          : s.repeatMode === "one"
            ? "all"
            : "none",
    })),
  nextAyah: () => {
    const s = get();
    if (s.repeatMode === "one") {
      get().seek(0);
      startPlayback();
      return;
    }
    if (s.playbackType === "surah") {
      s.nextSurah();
      return;
    }
    const next = s.ayahs[s.currentAyahInSurah];
    if (next) s.playAyah(next.number, next.numberInSurah);
    else s.nextSurah();
  },
  prevAyah: () => {
    const s = get();
    if (s.playbackType === "surah") {
      if (s.currentTime < 3 && s.currentPlaylistIndex > 0)
        s.jumpToPlaylistIndex(s.currentPlaylistIndex - 1);
      else s.seek(0);
    } else {
      const prev = s.ayahs[s.currentAyahInSurah - 2];
      if (prev) s.playAyah(prev.number, prev.numberInSurah);
      else s.seek(0);
    }
  },
  nextSurah: () => {
    const s = get();
    if (s.repeatMode === "one") {
      s.seek(0);
      startPlayback();
    } else if (s.currentPlaylistIndex < s.playlist.length - 1)
      s.jumpToPlaylistIndex(s.currentPlaylistIndex + 1);
    else if (s.repeatMode === "all" && s.playlist.length)
      s.jumpToPlaylistIndex(0);
    else {
      if (s.duration > 0 && s.currentTime >= s.duration - 0.25) s.seek(0);
      getOrCreateAudio().pause();
      set({ isPlaying: false, isLoading: false, stopReason: "complete" });
    }
  },
  stop: () => {
    savePosition();
    ++generation;
    getOrCreateAudio().pause();
    pendingPosition = null;
    activeSource = "";
    clearAudioPreload();
    getOrCreateAudio().removeAttribute("src");
    getOrCreateAudio().load();
    get().setSleepTimer(null);
    set({
      isPlaying: false,
      isLoading: false,
      error: null,
      currentSurahNumber: 0,
      sessionSecondsLeft: null,
      pauseForUnderstanding: false,
      boundaryPaused: false,
      stopReason: null,
      excerptEnd: null,
      currentAyahNumber: 0,
      currentAyahInSurah: 0,
      playlist: [],
      currentPlaylistIndex: 0,
      ayahs: [],
      currentTime: 0,
      duration: 0,
      loopStart: null,
      loopEnd: null,
    });
  },
  updateTime: (currentTime, duration) => set({ currentTime, duration }),
  getAudioRef: getOrCreateAudio,
  addToQueue: (item) => {
    if (!get().currentSurahNumber)
      get().playSurah(item, item.reciterId || get().reciterId);
    else set((s) => ({ playlist: [...s.playlist, item] }));
  },
  removeFromQueue: (index) => {
    if (index > get().currentPlaylistIndex)
      set((s) => ({ playlist: s.playlist.filter((_, i) => i !== index) }));
  },
  setPlaybackRate: (rate) => {
    if (![0.75, 1, 1.25, 1.5, 2].includes(rate)) return;
    getOrCreateAudio().playbackRate = rate;
    set({ playbackRate: rate });
    useListeningJourneyStore.getState().setPreferences({ rate });
  },
  setSleepTimer: (minutes) => {
    clearTimeout(sleepTimeout);
    const sleepUntil =
      typeof minutes === "number" && minutes > 0
        ? Date.now() + minutes * 60000
        : null;
    set({ sleepUntil, sleepAtEnd: minutes === "end" });
    if (sleepUntil)
      sleepTimeout = setTimeout(
        checkSleep,
        Math.max(0, sleepUntil - Date.now()),
      );
  },
  setLoopPoint: () => {
    const s = get();
    if (s.loopEnd !== null) set({ loopStart: null, loopEnd: null });
    else if (s.loopStart === null) set({ loopStart: s.currentTime });
    else if (s.currentTime > s.loopStart + 1) set({ loopEnd: s.currentTime });
  },
}));

useAudioPlayerStore.subscribe((state) =>
  syncListeningMediaSession(state, useAudioPlayerStore.getState),
);
