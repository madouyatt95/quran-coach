import {useSmartBack,usePageState} from '../hooks/usePageState';
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  useParams,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import { useListenStore } from "../stores/listenStore";
import { useAssetsStore } from "../stores/assetsStore";
import { useAudioPlayerStore } from "../stores/audioPlayerStore";
import { useQuranStore } from "../stores/quranStore";
import { usePlaylistsStore } from "../stores/playlistsStore";
import { useDownloadStore } from "../stores/downloadStore";
import { mp3QuranApi } from "../lib/mp3QuranApi";
import {
  COLLECTIONS,
  collectionItems,
  downloadId,
  listeningSurahs,
  matchesSurah,
  reciterKey,
  reciterName,
} from "../lib/listening";
import { AddToPlaylistModal } from "../components/Playlist/AddToPlaylistModal";
import { DownloadButton } from "../components/DownloadButton";
import { LearnFromAudio } from "../components/Listen/LearnFromAudio";
import type { PlaylistItem } from "../types";
import "../components/Listen/Listen.css";

export function ReciterDetailPage() {
  const {id} = useParams();
  const [params] = useSearchParams();
  return <ReciterDetailContent key={`${id}:${params}`} />;
}

function ReciterDetailContent() {
  const { id: routeId = "" } = useParams();
  const id = reciterKey(routeId);
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();const goBack=useSmartBack('/listen');
  const {
    reciters,
    isLoading,
    error,
    fetchReciters,
    favoriteReciters,
    toggleFavorite,
  } = useListenStore();
  const assets = useAssetsStore((s) => s.assets);
  const surahs = useQuranStore((s) => s.surahs);
  const player = useAudioPlayerStore(
    useShallow((s) => ({
      playlist: s.playlist,
      currentPlaylistIndex: s.currentPlaylistIndex,
      isPlaying: s.isPlaying,
      togglePlay: s.togglePlay,
      setPlaylist: s.setPlaylist,
    })),
  );
  const [query, setQuery] = usePageState('query:'+params.toString(),params.get("surah") || "");
  const [selection, setSelection] = useState<number[]>([]);
  const [selecting, setSelecting] = useState(false);
  const [name, setName] = useState("Ma séance d’écoute");
  const [modalItem, setModalItem] = useState<PlaylistItem | null>(null);
  const [learn, setLearn] = useState<PlaylistItem | null>(null);
  useEffect(() => {
    void fetchReciters();
  }, [fetchReciters]);
  const custom = COLLECTIONS.find((c) => c.id === id);
  const reciter = reciters.find((r) => String(r.id) === id);
  const edition =
    reciter?.moshaf.find((m) => m.id === Number(params.get("edition"))) ||
    mp3QuranApi.getBestMoshaf(reciter?.moshaf || []);
  const items = collectionItems(id, reciters, surahs, edition?.id);
  const allSurahs = listeningSurahs(surahs);
  const filtered = items.filter((item) =>
    matchesSurah(allSurahs[item.surahNumber - 1], query),
  );
  const selected = items.filter((item) => selection.includes(item.surahNumber));
  const title = custom?.name || (reciter ? reciterName(reciter) : "");
  const current = player.playlist[player.currentPlaylistIndex];
  if (!custom && !reciter)
    return (
      <div className="listen-hub">
        <button className="listen-back" onClick={goBack}>← Retour</button>
        <h1>
          {isLoading
            ? "Chargement du récitant…"
            : error
              ? "Catalogue indisponible"
              : "Récitant introuvable"}
        </h1>
        <p>
          {error ||
            "Le catalogue doit être chargé pour ouvrir cette récitation."}
        </p>
        <button
          className="listen-primary"
          onClick={() => void fetchReciters(true)}
        >
          Réessayer
        </button>
      </div>
    );
  const asset = assets.get(id);
  const play = (item: PlaylistItem) => {
    if (current?.audioUrl === item.audioUrl) player.togglePlay();
    else
      player.setPlaylist(
        items,
        items.findIndex((s) => s.audioUrl === item.audioUrl),
        id,
      );
  };
  return (
    <div className="listen-hub">
      <header className="listen-section-heading">
        <button className="listen-back" onClick={goBack}>← Retour</button>
        <button
          className="listen-secondary"
          aria-pressed={favoriteReciters.includes(id)}
          onClick={() => toggleFavorite(id)}
        >
          {favoriteReciters.includes(id)
            ? "★ Dans mes favoris"
            : "☆ Ajouter aux favoris"}
        </button>
      </header>
      <section className="listen-profile">
        <span className="listen-avatar">
          {asset?.status === "approved" ? (
            <img src={asset.image_url} alt="" />
          ) : (
            title
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
          )}
        </span>
        <div>
          <span className="listen-eyebrow">UNE VOIX À RETROUVER</span>
          <h1>{title}</h1>
          <p>
            {items.length} sourates disponibles
            {custom?.type === "arabic_french" ? " · Arabe et français" : ""}
          </p>
        </div>
      </section>
      {error && (
        <p className="listen-notice" role="status">
          {error}
        </p>
      )}
      {reciter && (
        <label className="listen-voice-select">
          Récitation
          <select
            value={edition?.id || ""}
            onChange={(e) => {
              const next = new URLSearchParams(params);
              next.set("edition", e.target.value);
              setParams(next);
            }}
          >
            {reciter.moshaf.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} · {m.surah_total} sourates
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="listen-actions">
        <button
          className="listen-primary"
          disabled={!items.length}
          onClick={() => player.setPlaylist(items, 0, id)}
        >
          ▶ Tout écouter
        </button>
        <button
          className="listen-secondary"
          onClick={() => {
            setSelecting((v) => !v);
            setSelection([]);
          }}
        >
          {selecting ? "Annuler la sélection" : "Sélectionner des sourates"}
        </button>
      </div>
      <label className="listen-search">
        <span>⌕</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher dans cette récitation…"
          aria-label="Rechercher une sourate"
        />
      </label>
      {selecting && (
        <section className="listen-selection">
          <div className="listen-section-heading">
            <h2>
              {selected.length} sélectionnée{selected.length > 1 ? "s" : ""}
            </h2>
            <button
              onClick={() => setSelection(filtered.map((s) => s.surahNumber))}
            >
              Tout sélectionner ({filtered.length})
            </button>
          </div>
          <label>
            Nom de la séance
            <input
              value={name}
              maxLength={80}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <div className="listen-actions">
            <button
              disabled={!selected.length}
              onClick={() => player.setPlaylist(selected, 0, id)}
            >
              ▶ Écouter la sélection
            </button>
            <button
              disabled={!selected.length || !name.trim()}
              onClick={() => {
                const store = usePlaylistsStore.getState();
                const key = store.createPlaylist(name.trim());
                selected.forEach((s) => store.addItemToPlaylist(key, s));
                navigate(`/playlists/${key}`);
              }}
            >
              Créer une séance
            </button>
            <button
              disabled={!selected.length}
              onClick={() => {
                void useDownloadStore.getState().startDownload(
                  downloadId(selected),
                  `${title} · ${selected.length} sourates`,
                  selected.map((s) => s.audioUrl!),
                  "audio",
                  selected,
                );
                navigate("/listen?library=offline");
              }}
            >
              📥 Télécharger la sélection
            </button>
          </div>
          <small>
            Le téléchargement peut être volumineux. Vous pourrez le mettre en
            pause dans « Hors ligne ».
          </small>
        </section>
      )}
      <div className="listen-section-heading">
        <h2>
          Sourates <small>({filtered.length})</small>
        </h2>
        {!selecting && (
          <button
            onClick={() => {
              setSelecting(true);
              setSelection(items.map((s) => s.surahNumber));
            }}
          >
            Tout télécharger…
          </button>
        )}
      </div>
      {!filtered.length && (
        <p className="listen-empty">
          Aucune sourate disponible ne correspond à cette recherche.{" "}
          <button onClick={() => setQuery("")}>
            Afficher toute la collection
          </button>
        </p>
      )}
      <div className="listen-list">
        {filtered.map((item) => (
          <article
            className={`listen-surah-row ${current?.audioUrl === item.audioUrl ? "is-current" : ""}`}
            key={item.audioUrl}
          >
            {selecting && (
              <input
                type="checkbox"
                aria-label={`Sélectionner ${item.surahName}`}
                checked={selection.includes(item.surahNumber)}
                onChange={() =>
                  setSelection((s) =>
                    s.includes(item.surahNumber)
                      ? s.filter((n) => n !== item.surahNumber)
                      : [...s, item.surahNumber],
                  )
                }
              />
            )}
            <button
              className="listen-track"
              onClick={() => play(item)}
              aria-label={`${current?.audioUrl === item.audioUrl && player.isPlaying ? "Mettre en pause" : "Écouter"} ${item.surahName}`}
            >
              <span className="listen-number">
                {current?.audioUrl === item.audioUrl && player.isPlaying
                  ? "Ⅱ"
                  : item.surahNumber}
              </span>
              <span>
                <strong>{item.surahName}</strong>
                <small>
                  {item.transliteration}
                  {item.totalAyahs ? ` · ${item.totalAyahs} versets` : ""}
                </small>
                <span className="listen-arabic" lang="ar" dir="rtl">
                  {item.surahNameAr}
                </span>
              </span>
              <span aria-hidden="true">▶</span>
            </button>
            <details className="listen-track-menu">
              <summary aria-label={`Actions pour ${item.surahName}`}>
                •••
              </summary>
              <div>
                <button onClick={() => setModalItem(item)}>
                  ＋ Ajouter à une séance
                </button>
                <button onClick={() => setLearn(item)}>
                  📖 Lire ou mémoriser
                </button>
                <span>
                  Hors ligne{" "}
                  <DownloadButton
                    id={downloadId([item])}
                    title={`${item.surahName} · ${title}`}
                    urls={[item.audioUrl!]}
                    items={[item]}
                  />
                </span>
              </div>
            </details>
          </article>
        ))}
      </div>
      {modalItem && (
        <AddToPlaylistModal
          item={modalItem}
          onClose={() => setModalItem(null)}
        />
      )}
      {learn && <LearnFromAudio item={learn} onClose={() => setLearn(null)} />}
    </div>
  );
}
