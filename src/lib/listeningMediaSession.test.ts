// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { syncListeningMediaSession } from "./listeningMediaSession";
afterEach(() => vi.unstubAllGlobals());
it("expose des commandes idempotentes, la bonne voix et nettoie après arrêt", () => {
  const handlers = new Map<string, MediaSessionActionHandler | null>();
  const session = {
    metadata: null,
    playbackState: "none",
    setPositionState: vi.fn(),
    setActionHandler: vi.fn((action, fn) => handlers.set(action, fn)),
  };
  vi.stubGlobal("navigator", { mediaSession: session });
  vi.stubGlobal(
    "MediaMetadata",
    class {
      constructor(data: object) {
        Object.assign(this, data);
      }
    },
  );
  const p = {
    currentSurahNumber: 1,
    currentSurahName: "Al-Fatiha",
    currentPlaylistIndex: 0,
    playlist: [
      {
        surahNumber: 1,
        surahName: "Al-Fatiha",
        surahNameAr: "",
        totalAyahs: 7,
        reciterName: "Al-Husary",
        audioUrl: "test.mp3",
        verse: { number: 2, globalNumber: 2, text: "", translation: "" },
      },
    ],
    isPlaying: true,
    isLoading: false,
    duration: 10,
    currentTime: 15,
    playbackRate: 1,
    togglePlay: vi.fn(),
    seek: vi.fn(),
    prevAyah: vi.fn(),
    jumpToPlaylistIndex: vi.fn(),
    stop: vi.fn(),
  };
  syncListeningMediaSession(p, () => p);
  expect(session.metadata).toMatchObject({
    title: "Al-Fatiha · verset 2",
    artist: "Al-Husary",
  });
  expect(session.setPositionState).toHaveBeenLastCalledWith({
    duration: 10,
    position: 10,
    playbackRate: 1,
  });
  handlers.get("play")?.({ action: "play" });
  expect(p.togglePlay).not.toHaveBeenCalled();
  handlers.get("pause")?.({ action: "pause" });
  expect(p.togglePlay).toHaveBeenCalledOnce();
  handlers.get("seekto")?.({ action: "seekto", seekTime: 4 });
  expect(p.seek).toHaveBeenCalledWith(4);
  p.currentSurahNumber = 0;
  syncListeningMediaSession(p, () => p);
  expect(session.metadata).toBeNull();
  expect(handlers.get("play")).toBeNull();
});
