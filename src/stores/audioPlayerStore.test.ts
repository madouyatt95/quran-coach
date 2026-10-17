// @vitest-environment jsdom
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { createJSONStorage } from "zustand/middleware";
import { createMemoryStorage } from "../test/memoryStorage";
import { useListeningEvidenceStore } from "./listeningEvidenceStore";
import { useAudioPlayerStore as player } from "./audioPlayerStore";
import { useListeningJourneyStore as journeys } from "./listeningJourneyStore";
import { useListenStore as library } from "./listenStore";
import type { PlaylistItem } from "../types";
class TestAudio extends EventTarget {
  src = "";
  currentTime = 0;
  duration = 120;
  readyState = 0;
  preload = "";
  playbackRate = 1;
  error: null | Error = null;
  play = vi.fn(async () => {
    this.dispatchEvent(new Event("playing"));
  });
  pause() {
    this.dispatchEvent(new Event("pause"));
  }
  getAttribute() {
    return this.src;
  }
  removeAttribute() {
    this.src = "";
  }
  load() {}
}
const track = (voice: string, surah = 1): PlaylistItem => ({
  surahNumber: surah,
  surahName: `Sourate ${surah}`,
  surahNameAr: "",
  totalAyahs: 7,
  reciterId: voice,
  reciterName: voice,
  audioUrl: `https://example.org/${voice}/${surah}.mp3`,
  playbackType: "surah",
});
const audio = () => player.getState().getAudioRef() as unknown as TestAudio;
const ready = () => {
  audio().readyState = 1;
  audio().dispatchEvent(new Event("loadedmetadata"));
};
describe("lecture et reprise", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createMemoryStorage());
    library.persist.setOptions({
      storage: createJSONStorage(() => localStorage),
    });
    useListeningEvidenceStore.persist.setOptions({
      storage: createJSONStorage(() => localStorage),
    });
    journeys.persist.setOptions({storage:createJSONStorage(()=>localStorage)});
    journeys.setState({progress:{}});
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-07T12:00:00Z"));
    vi.stubGlobal("Audio", TestAudio);
    player.getState().stop();
    audio().readyState = 0;
    audio().play.mockImplementation(async () => {
      audio().dispatchEvent(new Event("playing"));
    });
    player.setState({ repeatMode: "none", playbackRate: 1 });
    library.setState({ history: [], lastListened: null });
  });
  afterEach(() => {
    player.getState().stop();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });
  it("sauvegarde pendant des événements fréquents et garde chaque récitant séparé", () => {
    player.getState().setPlaylist([track("a")], 0, "a");
    ready();
    for (let i = 1; i <= 24; i++) {
      vi.advanceTimersByTime(250);
      audio().currentTime = i / 4;
      audio().dispatchEvent(new Event("timeupdate"));
    }
    expect(library.getState().lastListened?.position).toBeGreaterThanOrEqual(5);
    player.getState().setPlaylist([track("b")], 0, "b");
    ready();
    expect(
      library.getState().history.find((t) => t.reciterId === "a")?.position,
    ).toBe(6);
    expect(library.getState().lastListened?.reciterId).toBe("b");
    audio().currentTime = 12;
    audio().dispatchEvent(new Event("timeupdate"));
    player.getState().togglePlay();
    expect(library.getState().lastListened?.position).toBe(12);
  });
  it("applique la position après les métadonnées sans la perdre sur timeupdate", () => {
    player.getState().resume({
      reciterId: "a",
      reciterName: "a",
      surahNumber: 1,
      surahName: "Fatiha",
      audioUrl: track("a").audioUrl!,
      position: 45,
    });
    audio().currentTime = 0;
    audio().dispatchEvent(new Event("timeupdate"));
    expect(library.getState().lastListened?.position).toBe(45);
    ready();
    expect(audio().currentTime).toBe(45);
    player.getState().seek(-15);
    expect(audio().currentTime).toBe(0);
    player.getState().seek(500);
    expect(audio().currentTime).toBe(120);
  });
  it("ne prétend pas lire après un refus et ignore un rejet devenu obsolète", async () => {
    audio().play.mockRejectedValueOnce(
      new DOMException("permission", "NotAllowedError"),
    );
    player.getState().setPlaylist([track("a")], 0, "a");
    await Promise.resolve();
    await Promise.resolve();
    expect(player.getState().isPlaying).toBe(false);
    expect(player.getState().error).toContain("autoriser");
    let reject!: (e: DOMException) => void;
    audio().play.mockImplementationOnce(
      () =>
        new Promise((_, r) => {
          reject = r;
        }),
    );
    player.getState().setPlaylist([track("a")], 0, "a");
    player.getState().setPlaylist([track("b")], 0, "b");
    reject(new DOMException("old", "NotAllowedError"));
    await Promise.resolve();
    await Promise.resolve();
    expect(player.getState().error).toBeNull();
    expect(player.getState().isPlaying).toBe(true);
  });
  it("arrête au délai et à la fin malgré la répétition", () => {
    player.getState().setPlaylist([track("a"), track("a", 2)], 0, "a");
    ready();
    player.getState().setSleepTimer(10);
    vi.advanceTimersByTime(600000);
    expect(player.getState().isPlaying).toBe(false);
    expect(player.getState().sleepUntil).toBeNull();
    player.getState().togglePlay();
    player.setState({ repeatMode: "all" });
    player.getState().setSleepTimer("end");
    audio().dispatchEvent(new Event("ended"));
    expect(player.getState().currentPlaylistIndex).toBe(0);
    expect(player.getState().isPlaying).toBe(false);
  });
  it("maintient la vitesse et remet la boucle à zéro en changeant de piste", () => {
    player.getState().setPlaylist([track("a"), track("a", 2)], 0, "a");
    ready();
    player.getState().setPlaybackRate(1.25);
    player.getState().seek(10);
    player.getState().setLoopPoint();
    player.getState().seek(20);
    player.getState().setLoopPoint();
    audio().currentTime = 21;
    audio().dispatchEvent(new Event("timeupdate"));
    expect(audio().currentTime).toBe(10);
    player.getState().jumpToPlaylistIndex(1);
    ready();
    expect(player.getState().loopStart).toBeNull();
    expect(audio().playbackRate).toBe(1.25);
    expect(() => player.getState().setPlaylist([], 0, "a")).not.toThrow();
  });
  it("met en pause à la fin du bon verset et reprend au suivant", () => {
    const verse = (n: number): PlaylistItem => ({
      ...track("ar.alafasy"),
      audioUrl: `https://example.org/${n}.mp3`,
      verse: {
        number: n,
        globalNumber: n,
        text: "arabe",
        translation: "français",
      },
    });
    const evidence = vi.spyOn(
      useListeningEvidenceStore.getState(),
      "recordVerse",
    );
    const whole = vi.spyOn(useListeningEvidenceStore.getState(), "recordSurah");
    player.getState().setPlaylist([verse(3), verse(4)], 0, "ar.alafasy");
    ready();
    player.getState().setSessionMinutes(10);
    player.getState().requestUnderstanding();
    expect(player.getState().isPlaying).toBe(true);
    audio().dispatchEvent(new Event("ended"));
    expect(player.getState().stopReason).toBe("understand");
    expect(player.getState().sessionSecondsLeft).toBe(600);
    expect(player.getState().isPlaying).toBe(false);
    expect(player.getState().currentPlaylistIndex).toBe(0);
    expect(evidence).toHaveBeenCalledWith(1, 3, "lecteur");
    expect(whole).not.toHaveBeenCalled();
    player.getState().togglePlay();
    expect(player.getState().currentPlaylistIndex).toBe(1);
    expect(player.getState().isPlaying).toBe(true);
    expect(library.getState().lastListened?.verse?.number).toBe(4);
    evidence.mockRestore();
    whole.mockRestore();
  });
  it("ne compte pas la pause dans le budget et ne coupe pas un verset", () => {
    player.getState().setPlaylist([track("a"), track("b")], 0, "a");
    ready();
    player.getState().setSessionMinutes(1);
    vi.advanceTimersByTime(30000);
    audio().dispatchEvent(new Event("timeupdate"));
    expect(player.getState().sessionSecondsLeft).toBe(30);
    player.getState().togglePlay();
    vi.advanceTimersByTime(60000);
    audio().dispatchEvent(new Event("timeupdate"));
    expect(player.getState().sessionSecondsLeft).toBe(30);
    player.getState().togglePlay();
    vi.advanceTimersByTime(31000);
    audio().dispatchEvent(new Event("timeupdate"));
    expect(player.getState().isPlaying).toBe(true);
    audio().dispatchEvent(new Event("ended"));
    expect(player.getState().stopReason).toBe("budget");
    expect(player.getState().currentPlaylistIndex).toBe(0);
    expect(player.getState().isPlaying).toBe(false);
  });
  it("arrête un extrait partagé à la borne de fin", () => {
    player.getState().setPlaylist([track("a")], 0, "a", 10);
    ready();
    player.setState({ excerptEnd: 15 });
    audio().currentTime = 15.1;
    audio().dispatchEvent(new Event("timeupdate"));
    expect(player.getState().isPlaying).toBe(false);
    expect(player.getState().excerptEnd).toBeNull();
  });
  it("reprend au verset suivant après une fin naturelle et ne valide pas un saut", () => {
    const one={...track('ar.alafasy'),verse:{number:1,globalNumber:1,text:'',translation:''},journey:{id:'fatiha',step:0,ordinal:0,total:7}};
    const two={...one,audioUrl:'https://example.org/second.mp3',verse:{...one.verse,number:2},journey:{...one.journey,ordinal:1}};
    player.getState().setPlaylist([one,two],0,'ar.alafasy');ready();audio().duration=10;
    for(let i=1;i<=10;i++){vi.advanceTimersByTime(1000);audio().currentTime=i;audio().dispatchEvent(new Event('timeupdate'));}
    audio().dispatchEvent(new Event('ended'));
    expect(journeys.getState().progress.fatiha).toMatchObject({ordinal:1,position:0,completed:[0]});
    ready();audio().duration=10;player.getState().seek(9.9);audio().dispatchEvent(new Event('ended'));
    expect(journeys.getState().progress.fatiha.completed).toEqual([0]);
  });

});
