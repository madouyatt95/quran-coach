import { useListeningJourneyStore } from "../stores/listeningJourneyStore";
import { useDownloadStore } from "../stores/downloadStore";
import {
  annotateJourney,
  chapterFinished,
  journeyTotal,
} from "../lib/listeningJourney";
import { JourneyDownload } from "../components/Listen/JourneyDownload";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DOMPurify from "dompurify";
import type { PlaylistItem } from "../types";
import { useAudioPlayerStore } from "../stores/audioPlayerStore";
import { useListeningNotebookStore } from "../stores/listeningNotebookStore";
import { useQuranStore } from "../stores/quranStore";
import { fetchTafsir } from "../lib/tafsirApi";
import {
  LISTENING_JOURNEYS,
  sourceForChapter,
} from "../data/listeningJourneys";
import type { ListeningChapter } from "../data/listeningJourneys";
import {
  IMMERSIVE_VOICES,
  estimatedSeconds,
  fitSession,
  immersiveVoice,
  momentUrl,
  preparePassages,
  safeSharedAudio,
  shareMoment,
  withVoice,
} from "../lib/listeningExperience";
import { formatListeningTime, listeningSurahs } from "../lib/listening";
import "../components/Listen/Listen.css";
import "../components/Listen/ListeningExperience.css";

function Dialog({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    return () => d?.close();
  }, []);
  return (
    <dialog
      className="experience-dialog"
      ref={ref}
      onCancel={close}
      onClick={(e) => {
        if (e.target === ref.current) close();
      }}
    >
      <header>
        <h2>{title}</h2>
        <button autoFocus aria-label="Fermer la fenêtre" onClick={close}>
          ✕
        </button>
      </header>
      {children}
    </dialog>
  );
}
function Understanding({
  item,
  close,
  resume,
}: {
  item: PlaylistItem;
  close: () => void;
  resume: () => void;
}) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let alive = true;
    void fetchTafsir(
      "french_mokhtasar",
      item.surahNumber,
      item.verse!.number,
    ).then((result) => {
      if (alive) {
        setContent(result?.text || null);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [item.surahNumber, item.verse, retry]);
  return (
    <Dialog title="Comprendre ce verset" close={close}>
      <span className="listen-eyebrow">
        {item.surahName} · {item.surahNumber}:{item.verse!.number}
      </span>
      <p className="experience-translation">{item.verse!.translation}</p>
      <small>Traduction du sens · Muhammad Hamidullah / AlQuran Cloud</small>
      <hr />
      <h3>Éclairage du Mokhtasar</h3>
      {loading ? (
        <p role="status">Chargement de l’explication…</p>
      ) : content ? (
        <div
          className="experience-tafsir"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
        />
      ) : (
        <p role="alert">
          L’explication n’est pas disponible pour le moment.{" "}
          <button
            onClick={() => {
              setLoading(true);
              setRetry((n) => n + 1);
            }}
          >
            Réessayer
          </button>
        </p>
      )}
      <a
        href={`https://quranenc.com/fr/browse/french_mokhtasar/${item.surahNumber}/${item.verse!.number}`}
        target="_blank"
        rel="noreferrer"
      >
        Source : Al-Mokhtasar · QuranEnc ↗
      </a>
      <button className="experience-primary" onClick={resume}>
        ▶ Continuer l’écoute
      </button>
    </Dialog>
  );
}
function Notebook({ play }: { play: (items: PlaylistItem[]) => void }) {
  const { notes, save, remove } = useListeningNotebookStore();
  return (
    <section className="experience-notebook">
      <h2>Ce verset m’a touché</h2>
      <p>
        Vos versets, leurs récitations et vos notes, conservés sur cet appareil.
      </p>
      {!notes.length && (
        <div className="listen-empty">
          Pendant l’écoute immersive, touchez ♡ pour garder un verset ici.
        </div>
      )}
      {!!notes.length && (
        <button
          className="experience-primary"
          onClick={() => play(notes.map((n) => n.item))}
        >
          ▶ Écouter mon carnet
        </button>
      )}
      {notes.map((n) => (
        <article key={n.id} className="experience-note">
          <span className="listen-eyebrow">
            {n.item.surahName} · {n.item.surahNumber}:{n.item.verse?.number}
          </span>
          <p lang="ar" dir="rtl" className="experience-note-ar">
            {n.item.verse?.text}
          </p>
          <p>{n.item.verse?.translation}</p>
          <small>{n.item.reciterName} · Traduction du sens : Hamidullah</small>
          <label>
            Ma note
            <textarea
              aria-label={`Note pour ${n.item.surahNumber}:${n.item.verse?.number}`}
              maxLength={2000}
              defaultValue={n.note}
              onBlur={(e) => save(n.item, e.target.value)}
              placeholder="Ce que je souhaite retenir…"
            />
          </label>
          <div className="experience-actions">
            <button onClick={() => play([n.item])}>▶ Réécouter</button>
            <button
              onClick={() => {
                if (window.confirm("Retirer ce verset et sa note du carnet ?"))
                  remove(n.id);
              }}
            >
              Retirer
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}
function CompareDialog({
  item,
  close,
  play,
}: {
  item: PlaylistItem;
  close: () => void;
  play: (items: PlaylistItem[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>([
    immersiveVoice(item.reciterId || "").id,
    item.reciterId === "ar.husary" ? "ar.alafasy" : "ar.husary",
  ]);
  const [from, setFrom] = useState(item.verse!.number);
  const [to, setTo] = useState(item.verse!.number);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const compare = async () => {
    setBusy(true);
    setError("");
    try {
      const base = await preparePassages(
        [
          {
            surah: item.surahNumber,
            from,
            to,
            title: "Un passage, plusieurs voix",
            introduction:
              "Le même passage, récité successivement par les voix choisies.",
          },
        ],
        selected[0],
      );
      if (alive.current) {
        play(selected.flatMap((id) => base.map((v) => withVoice(v, id))));
        close();
      }
    } catch (e) {
      if (alive.current)
        setError(e instanceof Error ? e.message : "Préparation impossible.");
    } finally {
      if (alive.current) setBusy(false);
    }
  };
  return (
    <Dialog title="Un passage, plusieurs voix" close={close}>
      <p>
        Chaque voix récite le même passage en entier. Choisissez de 2 à 6
        récitations parmi les {IMMERSIVE_VOICES.length} disponibles.
      </p>
      <div className="experience-fields">
        <label>
          Du verset
          <input
            type="number"
            min={1}
            max={item.totalAyahs}
            value={from}
            onChange={(e) => setFrom(Number(e.target.value))}
          />
        </label>
        <label>
          Au verset
          <input
            type="number"
            min={from}
            max={item.totalAyahs}
            value={to}
            onChange={(e) => setTo(Number(e.target.value))}
          />
        </label>
      </div>
      <input
        type="search"
        placeholder="Rechercher une voix…"
        aria-label="Rechercher une voix à comparer"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="experience-voice-list">
        {IMMERSIVE_VOICES.filter((v) =>
          v.name.toLowerCase().includes(search.toLowerCase()),
        ).map((v) => (
          <label key={v.id}>
            <input
              type="checkbox"
              checked={selected.includes(v.id)}
              disabled={!selected.includes(v.id) && selected.length >= 6}
              onChange={() =>
                setSelected((ids) =>
                  ids.includes(v.id)
                    ? ids.filter((id) => id !== v.id)
                    : [...ids, v.id],
                )
              }
            />
            {v.name}
          </label>
        ))}
      </div>
      <p>{selected.length} voix sélectionnées</p>
      {error && <p role="alert">{error}</p>}
      <button
        className="experience-primary"
        disabled={
          busy ||
          selected.length < 2 ||
          from < 1 ||
          to < from ||
          to > item.totalAyahs
        }
        onClick={() => void compare()}
      >
        {busy ? "Préparation…" : "▶ Écouter la comparaison"}
      </button>
    </Dialog>
  );
}
const numberParam = (raw: string | null, fallback: number, max: number) =>
  raw && Number.isInteger(Number(raw)) && Number(raw) >= 1 && Number(raw) <= max
    ? Number(raw)
    : fallback;
export function ListeningExperiencePage() {
  const [params] = useSearchParams();
  const p = useAudioPlayerStore();
  const journeys = useListeningJourneyStore();
  const initialPack =
    useDownloadStore.getState().tasks[params.get("pack") || ""];
  const surahs = listeningSurahs(useQuranStore((s) => s.surahs));
  const notes = useListeningNotebookStore((s) => s.notes);
  const save = useListeningNotebookStore((s) => s.save);
  const initialJourney = LISTENING_JOURNEYS.find(
    (j) => j.id === params.get("journey"),
  );
  const [journeyId, setJourneyId] = useState(initialJourney?.id || "custom");
  const [voice, setVoice] = useState<string>(
    immersiveVoice(
      params.get("voice") ||
        (initialJourney && journeys.progress[initialJourney.id]?.voice) ||
        initialPack?.items?.[0]?.reciterId ||
        journeys.preferences.voice,
    ).id,
  );
  const [surah, setSurah] = useState(numberParam(params.get("surah"), initialPack?.items?.[0]?.surahNumber || 1, 114));
  const [from, setFrom] = useState(numberParam(params.get("from"), initialPack?.items?.[0]?.verse?.number || 1, 286));
  const [to, setTo] = useState(
    params.has("to") ? numberParam(params.get("to"), 1, 286) : initialPack?.items?.at(-1)?.verse?.number || 0,
  );
  const [minutes, setMinutes] = useState(
    [5, 10, 20].includes(Number(params.get("minutes")))
      ? Number(params.get("minutes"))
      : 0,
  );
  const [prepared, setPrepared] = useState<PlaylistItem[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [sharedLink, setSharedLink] = useState("");
  const [notebook, setNotebook] = useState(params.get("notebook") === "1");
  const [compare, setCompare] = useState(false);
  const showTranslation = journeys.preferences.translation;
  const setShowTranslation = (next: boolean) =>
    journeys.setPreferences({ translation: next });
  const [showQueue, setShowQueue] = useState(false);
  const fontSize = journeys.preferences.fontSize;
  const setFontSize = (next: number) =>
    journeys.setPreferences({ fontSize: next });
  const prepareId = useRef(0);
  const verseCard = useRef<HTMLElement>(null);
  const selectedJourney = LISTENING_JOURNEYS.find(
    (j) =>
      j.id ===
      (journeyId === "custom" && !prepared
        ? p.playlist[p.currentPlaylistIndex]?.journey?.id
        : journeyId),
  );
  const journeyProgress = selectedJourney
    ? journeys.progress[selectedJourney.id]
    : undefined;
  const selectedSurah = surahs.find((s) => s.number === surah);
  const item = p.playlist[p.currentPlaylistIndex];
  const active = !prepared && !!item?.verse;
  const displayed = prepared?.[0] || (active ? item : undefined);
  const [preparedPosition, setPreparedPosition] = useState(0);
  const [preparedEnd, setPreparedEnd] = useState<number | null>(null);
  const [preparedMinutes, setPreparedMinutes] = useState(0);
  const chapterList: ListeningChapter[] = selectedJourney?.chapters || [
    {
      surah,
      from,
      to: to || selectedSurah?.total || 0,
      title: selectedSurah?.french || `Sourate ${surah}`,
      introduction: "",
    },
  ];
  const prepare = async (
    chapters: ListeningChapter[] = chapterList,
    shared = false,
    resumeJourney = true,
  ) => {
    const request = ++prepareId.current;
    setBusy(true);
    setError("");
    try {
      const pack = Object.values(useDownloadStore.getState().tasks).find(
        (t) =>
          t.kind === "journey" &&
          t.status === "completed" &&
          t.items?.[0]?.reciterId === voice &&
          selectedJourney &&
          t.items[0].journey?.id === selectedJourney.id,
      );
      let queue = pack?.items
        ? pack.items.filter((v) =>
            chapters.some(
              (c) =>
                c.surah === v.surahNumber &&
                c.from === v.verse?.chapterFrom &&
                v.verse.number <= c.to,
            ),
          )
        : await preparePassages(chapters, voice);
      if (selectedJourney) queue = annotateJourney(queue, selectedJourney);
      const saved =
        selectedJourney && resumeJourney
          ? useListeningJourneyStore.getState().progress[selectedJourney.id]
          : undefined;
      const resumeIndex = saved
        ? queue.findIndex((v) => v.journey?.ordinal === saved.ordinal)
        : -1;
      if (resumeIndex > 0) queue = queue.slice(resumeIndex);
      const resumePosition =
        resumeIndex >= 0 && saved?.voice === voice ? saved.position : 0;
      if (request === prepareId.current) {
        setPrepared(minutes ? fitSession(queue, minutes) : queue);
        setPreparedMinutes(minutes);
        setPreparedPosition(
          shared && params.has("t")
            ? Math.min(86400, Math.max(0, Number(params.get("t")) || 0))
            : resumePosition,
        );
        setPreparedEnd(
          shared && Number(params.get("end")) > 0
            ? Number(params.get("end"))
            : null,
        );
      }
    } catch (e) {
      if (request === prepareId.current)
        setError(
          e instanceof Error
            ? e.message
            : "La séance n’a pas pu être préparée.",
        );
    } finally {
      if (request === prepareId.current) setBusy(false);
    }
  };
  useEffect(() => {
    // Shared links prepare content but never start audio without a gesture.
    {
      if (initialPack?.items?.length && initialPack.status === "completed") {
        setPrepared(initialPack.items);
      } else if (params.has("pack")) {
        setError("Ce pack est incomplet ou absent de cet appareil. Retrouvez-le dans Écoute → Hors ligne pour le télécharger.");
      } else if (params.get("audio")) {
        const audio = safeSharedAudio(params.get("audio"));
        if (!audio)
          setError(
            "Ce lien audio n’est pas reconnu. Choisissez un passage ci-dessous.",
          );
        else {
          setPreparedPosition(
            Math.min(86400, Math.max(0, Number(params.get("t")) || 0)),
          );
          setPreparedEnd(Number(params.get("end")) || null);
          setPrepared([
            {
              surahNumber: surah,
              surahName: selectedSurah?.french || `Sourate ${surah}`,
              surahNameAr: "",
              totalAyahs: selectedSurah?.total || 0,
              audioUrl: audio,
              reciterId: params.get("voice") || "",
              reciterName: "Récitation partagée",
              playbackType: "surah",
            },
          ]);
        }
      } else if (!notebook && params.get("current") !== "1")
        void prepare(chapterList, true);
    }
    return () => {
      /* Requests are also invalidated when a newer selection is prepared. */
    };
    // Initial query is a route snapshot; subsequent configuration uses the preparation button.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(
    () => () => {
      prepareId.current++;
    },
    [],
  );
  useEffect(() => {
    if (active)
      verseCard.current?.scrollIntoView({
        block: "nearest",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
  }, [active, p.currentPlaylistIndex]);
  useEffect(() => {
    useAudioPlayerStore.setState({
      immersiveControlsVisible: active && !notebook,
    });
    return () =>
      useAudioPlayerStore.setState({ immersiveControlsVisible: false });
  }, [active, notebook]);
  const play = (queue: PlaylistItem[], position = 0, budget = 0) => {
    if (!queue.length) return;
    prepareId.current++;
    setBusy(false);
    setPrepared(null);
    setNotebook(false);
    useAudioPlayerStore.setState({ repeatMode: "none" });
    p.setPlaylist(queue, 0, queue[0].reciterId || voice, position);
    if (budget) p.setSessionMinutes(budget);
  };
  const share = async (track: PlaylistItem, position: number) => {
    const end = p.loopEnd ?? undefined;
    const start = p.loopStart ?? position;
    setNotice("");
    setSharedLink(momentUrl(track, start, end));
    try {
      setNotice(await shareMoment(track, start, end));
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Partage indisponible.");
    }
  };
  const marked =
    displayed &&
    notes.some(
      (n) =>
        n.id ===
        `${displayed.surahNumber}:${displayed.verse?.number}:${displayed.reciterId}`,
    );
  return (
    <div className="listen-hub experience-page">
      <header className="experience-header">
        <Link to="/listen">← Écoute</Link>
        <button aria-pressed={notebook} onClick={() => setNotebook((v) => !v)}>
          ♡ Mon carnet{notes.length ? ` · ${notes.length}` : ""}
        </button>
      </header>
      <span className="listen-eyebrow">ÉCOUTER ET COMPRENDRE</span>
      <h1>
        Le son. Le sens.
        <br />
        Votre moment.
      </h1>
      {notebook ? (
        <Notebook play={play} />
      ) : (
        <>
          <details className="experience-config" open={!active && !prepared}>
            <summary>
              Composer ma séance <span>{immersiveVoice(voice).name}</span>
            </summary>
            <div className="experience-fields">
              <label>
                Parcours
                <select
                  value={journeyId}
                  onChange={(e) => setJourneyId(e.target.value)}
                >
                  <option value="custom">
                    Choisir une sourate ou un passage
                  </option>
                  {LISTENING_JOURNEYS.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Récitation
                <select
                  value={voice}
                  onChange={(e) => {
                    setVoice(e.target.value);
                    journeys.setPreferences({ voice: e.target.value });
                  }}
                >
                  {IMMERSIVE_VOICES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {journeyId === "custom" && (
              <>
                <label>
                  Sourate
                  <select
                    value={surah}
                    onChange={(e) => {
                      setSurah(Number(e.target.value));
                      setFrom(1);
                      setTo(0);
                    }}
                  >
                    {surahs.map((s) => (
                      <option key={s.number} value={s.number}>
                        {s.number}. {s.transliteration || s.french}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="experience-fields">
                  <label>
                    Du verset
                    <input
                      type="number"
                      min={1}
                      max={selectedSurah?.total || 286}
                      value={from}
                      onChange={(e) => setFrom(Number(e.target.value))}
                    />
                  </label>
                  <label>
                    Au verset
                    <input
                      type="number"
                      min={from}
                      max={selectedSurah?.total || 286}
                      value={to || selectedSurah?.total || 7}
                      onChange={(e) => setTo(Number(e.target.value))}
                    />
                  </label>
                </div>
              </>
            )}
            <label>
              Temps disponible
              <select
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
              >
                <option value={0}>Tout le passage</option>
                {[5, 10, 20].map((m) => (
                  <option key={m} value={m}>
                    {m} minutes environ
                  </option>
                ))}
              </select>
            </label>
            <button
              className="experience-primary"
              disabled={busy}
              onClick={() => void prepare()}
            >
              {busy ? "Préparation…" : "Préparer ma séance"}
            </button>
          </details>
          {selectedJourney && (
            <div className="experience-intro">
              <span aria-hidden="true">{selectedJourney.icon}</span>
              <div>
                <h2>{selectedJourney.title}</h2>
                <p>{selectedJourney.description}</p>
              </div>
            </div>
          )}
          {selectedJourney && journeyProgress && (
            <section
              className="experience-journey-progress"
              aria-label="Progression du parcours"
            >
              <strong>
                {journeyProgress.completed.length} /{" "}
                {journeyTotal(selectedJourney)} versets écoutés
              </strong>
              <progress
                max={journeyTotal(selectedJourney)}
                value={journeyProgress.completed.length}
              />
              <small>
                {
                  selectedJourney.chapters.filter((_, i) =>
                    chapterFinished(
                      selectedJourney,
                      i,
                      journeyProgress.completed,
                    ),
                  ).length
                }{" "}
                / {selectedJourney.chapters.length} étapes terminées ·
                Enregistré sur cet appareil
              </small>
              <button
                disabled={busy}
                onClick={() => {
                  journeys.restart(selectedJourney.id);
                  void prepare(chapterList, false, false);
                }}
              >
                Recommencer ce parcours
              </button>
            </section>
          )}
          {busy && (
            <p role="status" className="listen-empty">
              Nous préparons le texte et la traduction…
            </p>
          )}
          {error && (
            <div role="alert" className="listen-empty">
              {error}
              <button onClick={() => void prepare()}>Réessayer</button>
            </div>
          )}
          {prepared && (
            <section className="experience-ready">
              <span className="listen-eyebrow">VOTRE SÉANCE EST PRÊTE</span>
              <h2>
                {prepared[0].verse
                  ? `${prepared.length} verset${prepared.length > 1 ? "s" : ""} · environ ${Math.max(1, Math.round(estimatedSeconds(prepared) / 60))} min`
                  : prepared[0].surahName}
              </h2>
              <p>
                {prepared[0].reciterName}
                {preparedMinutes
                  ? ` · Arrêt à la fin du verset en cours après ${preparedMinutes} minutes d’écoute, ou à la fin de la sélection.`
                  : ""}
              </p>
              <button
                className="experience-primary"
                onClick={() => {
                  play(prepared, preparedPosition, preparedMinutes);
                  const end = preparedEnd ?? 0;
                  if (end > preparedPosition && end <= 86400)
                    useAudioPlayerStore.setState({ excerptEnd: end });
                }}
              >
                ▶{" "}
                {preparedPosition > 0
                  ? `Écouter à ${formatListeningTime(preparedPosition)}`
                  : prepared[0]?.journey && prepared[0].journey.ordinal > 0
                    ? "Reprendre mon parcours"
                    : "Commencer l’écoute"}
              </button>
              <small>
                Durée estimée : elle varie selon la voix et la vitesse.
              </small>
            </section>
          )}
          {active && (
            <div className="experience-live-status">
              <span>
                {p.isPlaying
                  ? "● À L’ÉCOUTE"
                  : p.isLoading
                    ? "CHARGEMENT…"
                    : "EN PAUSE"}
              </span>
              <span>
                {p.currentPlaylistIndex + 1} / {p.playlist.length}
                {p.sessionSecondsLeft !== null
                  ? ` · ${formatListeningTime(p.sessionSecondsLeft)} restantes`
                  : ""}
              </span>
            </div>
          )}
          {displayed?.verse && (
            <>
              <article
                className="experience-verse"
                ref={verseCard}
                key={displayed.audioUrl}
              >
                <div className="experience-section-heading">
                  <span className="listen-eyebrow">
                    {displayed.surahName} · {displayed.surahNumber}:
                    {displayed.verse.number}
                  </span>
                  <div className="experience-font">
                    <button
                      aria-label="Réduire le texte arabe"
                      disabled={fontSize <= 24}
                      onClick={() => setFontSize(fontSize - 4)}
                    >
                      A−
                    </button>
                    <button
                      aria-label="Agrandir le texte arabe"
                      disabled={fontSize >= 48}
                      onClick={() => setFontSize(fontSize + 4)}
                    >
                      A+
                    </button>
                  </div>
                </div>
                {displayed.verse.chapterTitle && (
                  <h2>{displayed.verse.chapterTitle}</h2>
                )}
                {displayed.verse.number === displayed.verse.chapterFrom &&
                  displayed.verse.introduction && (
                    <p className="experience-context">
                      {displayed.verse.introduction}
                    </p>
                  )}
                <p
                  className="experience-arabic"
                  lang="ar"
                  dir="rtl"
                  style={{ fontSize }}
                >
                  {displayed.verse.text}
                </p>
                {showTranslation && (
                  <>
                    <p className="experience-translation">
                      {displayed.verse.translation}
                    </p>
                    <small>Traduction du sens · Muhammad Hamidullah</small>
                  </>
                )}
                <footer>
                  <span>{displayed.reciterName}</span>
                  <button
                    aria-pressed={showTranslation}
                    onClick={() => setShowTranslation(!showTranslation)}
                  >
                    {showTranslation ? "Masquer" : "Afficher"} le français
                  </button>
                </footer>
              </article>
              {active && (
                <>
                  <div className="experience-transport" role="group" aria-label="Commandes de la séance">
                    <button
                      aria-label="Verset précédent"
                      disabled={p.currentPlaylistIndex === 0}
                      onClick={() =>
                        p.jumpToPlaylistIndex(p.currentPlaylistIndex - 1)
                      }
                    >
                      ⏮
                    </button>
                    <button
                      className="experience-primary"
                      onClick={p.togglePlay}
                    >
                      {p.isPlaying || p.isLoading
                        ? "Ⅱ Pause"
                        : p.boundaryPaused
                          ? "▶ Continuer"
                          : "▶ Écouter"}
                    </button>
                    <button
                      aria-label="Verset suivant"
                      disabled={p.currentPlaylistIndex >= p.playlist.length - 1}
                      onClick={() =>
                        p.jumpToPlaylistIndex(p.currentPlaylistIndex + 1)
                      }
                    >
                      ⏭
                    </button>
                  </div>
                  <label className="experience-seek">
                    <input
                      aria-label="Position dans le verset"
                      type="range"
                      min={0}
                      max={p.duration || 1}
                      step={0.1}
                      value={Math.min(p.currentTime, p.duration || 1)}
                      onChange={(e) => p.seek(Number(e.target.value))}
                    />
                    <span>
                      {formatListeningTime(p.currentTime)} /{" "}
                      {formatListeningTime(p.duration)}
                    </span>
                  </label>
                  <details className="experience-player-options">
                    <summary>Réglages d’écoute · {p.playbackRate}×</summary>
                    <label>
                      Vitesse
                      <select
                        aria-label="Vitesse d’écoute"
                        value={p.playbackRate}
                        onChange={(e) =>
                          p.setPlaybackRate(Number(e.target.value))
                        }
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
                        value={
                          p.sleepAtEnd ? "end" : p.sleepUntil ? "active" : "off"
                        }
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
                            {new Date(p.sleepUntil).toLocaleTimeString(
                              "fr-FR",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </option>
                        )}
                        {[10, 20, 30, 60].map((m) => (
                          <option key={m} value={m}>
                            Dans {m} minutes
                          </option>
                        ))}
                        <option value="end">Fin de la sourate</option>
                      </select>
                    </label>
                    <button onClick={p.toggleRepeatMode}>
                      Répétition :{" "}
                      {p.repeatMode === "none"
                        ? "désactivée"
                        : p.repeatMode === "one"
                          ? "ce verset"
                          : "la séance"}
                    </button>
                    <button onClick={p.setLoopPoint}>
                      {p.loopEnd !== null
                        ? "Retirer la boucle A–B"
                        : p.loopStart === null
                          ? "Placer le début A"
                          : "Placer la fin B"}
                    </button>
                    <button onClick={p.stop}>Arrêter l’écoute</button>
                  </details>
                  <div className="experience-actions">
                    <button
                      aria-pressed={p.pauseForUnderstanding}
                      onClick={p.requestUnderstanding}
                    >
                      💡{" "}
                      {p.pauseForUnderstanding
                        ? "Pause prévue · Annuler"
                        : "Comprendre"}
                    </button>
                    <button
                      aria-pressed={!!marked}
                      onClick={() => {
                        save(displayed);
                        setNotice(
                          "Verset conservé dans votre carnet. Vous pouvez y ajouter une note.",
                        );
                      }}
                    >
                      {marked ? "♥ Dans mon carnet" : "♡ Ce verset me touche"}
                    </button>
                    <button
                      onClick={() => {
                        if (p.isPlaying || p.isLoading) p.togglePlay();
                        setCompare(true);
                      }}
                    >
                      🎙 Comparer les voix
                    </button>
                    <button
                      onClick={() => void share(displayed, p.currentTime)}
                    >
                      ↗ Partager ce moment
                    </button>
                  </div>
                  {p.pauseForUnderstanding && (
                    <p role="status">
                      L’écoute fera une pause à la fin de ce verset pour
                      afficher son explication.
                    </p>
                  )}
                  {p.stopReason === "budget" && (
                    <p className="experience-finished" role="status">
                      Votre temps d’écoute est écoulé. Le verset est terminé.
                      Vous pouvez continuer quand vous le souhaitez.
                    </p>
                  )}
                  {p.stopReason === "complete" && (
                    <p className="experience-finished" role="status">
                      Votre sélection est terminée. Retrouvez les versets qui
                      vous ont touché dans votre carnet.
                    </p>
                  )}
                  {p.error && (
                    <p role="alert">
                      {p.error}
                      <button onClick={p.togglePlay}>Réessayer</button>
                    </p>
                  )}
                  <button
                    className="experience-queue-toggle"
                    aria-expanded={showQueue}
                    onClick={() => setShowQueue((v) => !v)}
                  >
                    {showQueue ? "Masquer" : "Afficher"} les {p.playlist.length}{" "}
                    versets de la séance
                  </button>
                  {showQueue && (
                    <ol className="experience-queue">
                      {p.playlist.map((v, i) => (
                        <li key={`${v.audioUrl}-${i}`}>
                          <button
                            aria-current={
                              i === p.currentPlaylistIndex ? "true" : undefined
                            }
                            onClick={() => p.jumpToPlaylistIndex(i)}
                          >
                            <b>
                              {v.surahNumber}:{v.verse?.number}
                            </b>
                            <span>
                              {v.verse?.translation}
                              <small>{v.reciterName}</small>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ol>
                  )}
                </>
              )}
            </>
          )}
          {!params.get("audio") && (
            <JourneyDownload
              journey={selectedJourney}
              chapters={chapterList}
              voice={voice}
            />
          )}
          {selectedJourney && (
            <section className="experience-chapters">
              <h2>Le parcours</h2>
              <small>
                Repères éditoriaux · Sources : passages du Coran indiqués
                ci-dessous.
              </small>
              {selectedJourney.chapters.map((c, i) => (
                <article key={`${c.surah}-${c.from}`}>
                  <span className="experience-step">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3>
                      {c.title}
                      {chapterFinished(
                        selectedJourney,
                        i,
                        journeyProgress?.completed || [],
                      )
                        ? " · ✓ Écoutée"
                        : ""}
                    </h3>
                    <p>{c.introduction}</p>
                    <a
                      href={sourceForChapter(c)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Coran {c.surah}:{c.from}–{c.to} ↗
                    </a>
                    <button
                      disabled={busy}
                      onClick={() => {
                        const index = p.playlist.findIndex(
                          (v) =>
                            v.surahNumber === c.surah &&
                            v.verse?.number === c.from,
                        );
                        if (active && index >= 0) p.jumpToPlaylistIndex(index);
                        else void prepare([c], false, false);
                      }}
                    >
                      {active &&
                      p.playlist.some(
                        (v) =>
                          v.surahNumber === c.surah &&
                          v.verse?.number === c.from,
                      )
                        ? "▶ Écouter cette étape"
                        : "Préparer cette étape"}
                    </button>
                  </div>
                </article>
              ))}
            </section>
          )}
        </>
      )}
      {notice && (
        <p className="experience-notice" role="status">
          {notice}
          <button aria-label="Masquer le message" onClick={() => setNotice("")}>
            ✕
          </button>
        </p>
      )}
      {sharedLink && (
        <p className="experience-share-link">
          <a href={sharedLink}>Lien vers le moment partagé</a>
          <button onClick={() => setSharedLink("")}>Masquer</button>
        </p>
      )}
      {active && item && p.stopReason === "understand" && (
        <Understanding
          key={item.audioUrl}
          item={item}
          close={() => useAudioPlayerStore.setState({ stopReason: null })}
          resume={() => {
            useAudioPlayerStore.setState({ stopReason: null });
            p.togglePlay();
          }}
        />
      )}
      {compare && item?.verse && (
        <CompareDialog
          item={item}
          close={() => setCompare(false)}
          play={play}
        />
      )}
    </div>
  );
}
