import {ListenSections} from '../components/Listen/ListenSections';
import {usePageState} from '../hooks/usePageState';
import { ListenDiscover } from '../components/Listen/ListenDiscover';
import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useListenStore } from "../stores/listenStore";
import { useAssetsStore } from "../stores/assetsStore";
import { usePlaylistsStore } from "../stores/playlistsStore";
import { useAudioPlayerStore } from "../stores/audioPlayerStore";
import { useQuranStore } from "../stores/quranStore";
import {
  COLLECTIONS,
  availableSurahs,
  editionMatches,
  formatListeningTime,
  listeningSurahs,
  matchesReciter,
  matchesSurah,
  normalizeListeningSearch,
  reciterName,
  RECITER_NAMES,
} from "../lib/listening";
import { mp3QuranApi } from "../lib/mp3QuranApi";
import { OfflineLibrary } from "../components/Listen/OfflineLibrary";
import "../components/Listen/Listen.css";

export function ListenPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const {
    reciters,
    isLoading,
    error,
    fetchReciters,
    lastListened,
    history,
    favoriteReciters,
    toggleFavorite,
    bookmarks,
    removeBookmark,
    searchQuery,
    setSearchQuery,
  } = useListenStore();
  const { assets, fetchAssets } = useAssetsStore();
  const playlists = usePlaylistsStore((s) => s.playlists);
  const surahs = useQuranStore((s) => s.surahs);
  const resume = useAudioPlayerStore((s) => s.resume);
  const [tab, setTab] = usePageState<"explore" | "favorites" | "offline">('tab:'+params.toString(),
    params.get("library") === "offline" ? "offline" : "explore",
  );
  const [filter, setFilter] = usePageState('filter', "all");
  const [voice, setVoice] = usePageState('voice', "123");
  const [limit, setLimit] = usePageState('limit', 24);
  useEffect(() => {
    void fetchReciters();
    void fetchAssets();
  }, [fetchReciters, fetchAssets]);
  const query = searchQuery.trim();
  const allReciters = reciters.filter(
    (r) =>
      filter !== "french" && r.moshaf.some((m) => editionMatches(m, filter)),
  );
  const custom = COLLECTIONS.filter(
    (c) =>
      (filter === "all" ||
        (filter === "french" && c.type === "arabic_french") ||
        (filter === "hafs" && c.type === "custom")) &&
      normalizeListeningSearch(c.name + " " + c.nameArabic).includes(
        normalizeListeningSearch(query),
      ),
  );
  const results = allReciters.filter(
    (r) =>
      matchesReciter(r, query) &&
      (tab !== "favorites" || favoriteReciters.includes(String(r.id))),
  );
  const surahResults =
    query && tab === "explore"
      ? listeningSurahs(surahs).filter((s) => matchesSurah(s, query))
      : [];
  const voices = [
    ...COLLECTIONS.filter(
      (c) =>
        filter === "all" ||
        (filter === "french"
          ? c.type === "arabic_french"
          : filter === "hafs" && c.type === "custom"),
    ).map((c) => ({ id: c.id, name: c.name })),
    ...allReciters.map((r) => ({ id: String(r.id), name: reciterName(r) })),
  ];
  const selectedVoice = voices.some((v) => v.id === voice)
    ? voice
    : voices[0]?.id;
  const route = (id: string, surah?: number) => {
    const r = reciters.find((r) => String(r.id) === id);
    const edition = r?.moshaf.find((m) => editionMatches(m, filter));
    const params = new URLSearchParams();
    if (edition && filter !== "all") params.set("edition", String(edition.id));
    if (surah) params.set("surah", String(surah));
    navigate(`/listen/${id}${params.size ? "?" + params : ""}`);
  };
  const card = (id: string, name: string, subtitle: string) => {
    const asset = assets.get(id);
    return (
      <article className="listen-reciter" key={id}>
        <button className="listen-reciter-main" onClick={() => route(id)}>
          <span className="listen-avatar">
            {asset?.status === "approved" ? (
              <img src={asset.image_url} alt="" loading="lazy" />
            ) : (
              name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
            )}
          </span>
          <span>
            <strong>{name}</strong>
            <small>{subtitle}</small>
          </span>
          <span aria-hidden="true">›</span>
        </button>
        <button
          className="listen-star"
          aria-label={`${favoriteReciters.includes(id) ? "Retirer" : "Ajouter"} ${name} ${favoriteReciters.includes(id) ? "des" : "aux"} favoris`}
          aria-pressed={favoriteReciters.includes(id)}
          onClick={() => toggleFavorite(id)}
        >
          {favoriteReciters.includes(id) ? "★" : "☆"}
        </button>
      </article>
    );
  };
  return (
    <div className="listen-hub">
      <header className="listen-page-heading">
        <div>
          <span className="listen-eyebrow">LE CORAN, À VOTRE RYTHME</span>
          <h1>
            Écoute <span aria-hidden="true">🎧</span>
          </h1>
          <p>Une voix, un moment, un passage à garder.</p>
        </div>
        <Link to="/" aria-label="Accueil" className="listen-home">
          ⌂
        </Link>
      </header>
      <ListenSections />
      {lastListened && !query && tab === "explore" && (
        <section className="listen-resume">
          <span className="listen-eyebrow">REPRENDRE MON ÉCOUTE</span>
          <h2>{lastListened.surahName}</h2>
          <p>{lastListened.reciterName}</p>
          <div>
            <span>À {formatListeningTime(lastListened.position)}</span>
            <button onClick={() => {
              const journey = lastListened.playlist?.[lastListened.playlistIndex || 0]?.journey;
              if(journey) navigate(`/listen/experience?journey=${journey.id}&voice=${lastListened.reciterId}`);
              else resume(lastListened);
            }}>▶ Reprendre</button>
          </div>
        </section>
      )}
      {!query && tab === "explore" && <ListenDiscover />}
      <nav className="listen-tabs" aria-label="Bibliothèque d’écoute">
        {(
          [
            ["explore", "🎧 Explorer"],
            ["favorites", "⭐ Favoris"],
            ["offline", "📥 Hors ligne"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            aria-current={tab === id ? "page" : undefined}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>
      {tab === "offline" ? (
        <OfflineLibrary />
      ) : (
        <>
          <label className="listen-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Sourate, numéro ou récitant…"
              aria-label="Rechercher une sourate ou un récitant"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setLimit(24);
              }}
            />
          </label>
          <div className="listen-filters" aria-label="Type de récitation">
            {[
              ["all", "Tout"],
              ["hafs", "Hafs"],
              ["warsh", "Warsh"],
              ["french", "Arabe / français"],
            ].map(([id, label]) => (
              <button
                key={id}
                aria-pressed={filter === id}
                onClick={() => {
                  setFilter(id);
                  setLimit(24);
                }}
              >
                {label}
              </button>
            ))}
          </div>
          {error && (
            <div className="listen-notice" role="alert">
              {error}{" "}
              <button onClick={() => void fetchReciters(true)}>
                Réessayer
              </button>
            </div>
          )}
          {surahResults.length > 0 && (
            <section className="listen-section">
              <div className="listen-section-heading">
                <h2>Sourates</h2>
                <span>
                  {surahResults.length} résultat
                  {surahResults.length > 1 ? "s" : ""}
                </span>
              </div>
              <label className="listen-voice-select">
                Avec la voix de
                <select
                  value={selectedVoice || ""}
                  onChange={(e) => setVoice(e.target.value)}
                >
                  {voices.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="listen-list">
                {surahResults.map((s) => (
                  <button
                    key={s.number}
                    className="listen-track"
                    disabled={!selectedVoice}
                    onClick={() => route(selectedVoice, s.number)}
                  >
                    <span className="listen-number">{s.number}</span>
                    <span>
                      <strong>{s.french}</strong>
                      <small>{s.transliteration}</small>
                    </span>
                    <span lang="ar" dir="rtl">
                      {s.name}
                    </span>
                    <span>›</span>
                  </button>
                ))}
              </div>
            </section>
          )}
          {tab === "explore" && !query && filter === "all" && (
            <>
              {favoriteReciters.length > 0 && (
                <section className="listen-section">
                  <div className="listen-section-heading">
                    <h2>Vos voix favorites</h2>
                    <button onClick={() => setTab("favorites")}>
                      Tout voir →
                    </button>
                  </div>
                  <div className="listen-reciter-grid">
                    {favoriteReciters.slice(0, 4).map((id) => {
                      const r = reciters.find((r) => String(r.id) === id);
                      const c = COLLECTIONS.find((c) => c.id === id);
                      return r
                        ? card(id, reciterName(r), "Votre sélection")
                        : c
                          ? card(id, c.name, "Votre sélection")
                          : null;
                    })}
                  </div>
                </section>
              )}
              {history.length > 0 && (
                <section className="listen-section">
                  <h2>Écoutées récemment</h2>
                  <div className="listen-horizontal">
                    {history.slice(0, 8).map((t) => (
                      <button
                        className="listen-history"
                        key={t.audioUrl}
                        onClick={() => resume(t)}
                      >
                        <span aria-hidden="true">↻</span>
                        <strong>{t.surahName}</strong>
                        <small>{t.reciterName}</small>
                        <span>
                          Reprendre à {formatListeningTime(t.position)}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              )}
              {playlists.length > 0 && (
                <section className="listen-section">
                  <h2>Mes séances d’écoute</h2>
                  <div className="listen-horizontal">
                    {playlists.map((p) => (
                      <Link
                        className="listen-history"
                        key={p.id}
                        to={`/playlists/${p.id}`}
                      >
                        <span>📋</span>
                        <strong>{p.name}</strong>
                        <small>{p.items.length} sourates</small>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
          {tab === "favorites" && bookmarks.length > 0 && (
            <section className="listen-section">
              <h2>Mes repères audio</h2>
              <div className="listen-list">
                {bookmarks.map((b) => (
                  <div className="listen-bookmark" key={b.id}>
                    <button
                      className="listen-track"
                      onClick={() => resume(b.track)}
                    >
                      <span>🔖</span>
                      <span>
                        <strong>
                          {b.track.surahName} ·{" "}
                          {formatListeningTime(b.track.position)}
                        </strong>
                        <small>{b.track.reciterName}</small>
                      </span>
                      <span>▶</span>
                    </button>
                    <button
                      aria-label={`Supprimer le repère ${b.track.surahName}`}
                      onClick={() => removeBookmark(b.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
          <section className="listen-section">
            <div className="listen-section-heading">
              <h2>
                {tab === "favorites"
                  ? "Mes récitants favoris"
                  : query
                    ? "Récitants"
                    : "Choisir une voix"}
              </h2>
              <span>
                {results.length +
                  custom.filter(
                    (c) =>
                      tab !== "favorites" || favoriteReciters.includes(c.id),
                  ).length}
              </span>
            </div>
            <div className="listen-reciter-grid">
              {custom
                .filter(
                  (c) => tab !== "favorites" || favoriteReciters.includes(c.id),
                )
                .map((c) =>
                  card(
                    c.id,
                    c.name,
                    c.type === "arabic_french"
                      ? "Récitation et traduction française"
                      : `${c.surahs.length} sourates · Collection`,
                  ),
                )}
              {[...results]
                .sort(
                  (a, b) =>
                    Number(!!RECITER_NAMES[b.id]) -
                    Number(!!RECITER_NAMES[a.id]),
                )
                .slice(0, limit)
                .map((r) => {
                  const edition =
                    filter === "all"
                      ? mp3QuranApi.getBestMoshaf(r.moshaf)
                      : r.moshaf.find((m) => editionMatches(m, filter));
                  return card(
                    String(r.id),
                    reciterName(r),
                    `${availableSurahs(edition).length} sourates · ${edition?.name || ""}`,
                  );
                })}
            </div>
            {isLoading && <p role="status">Chargement des voix…</p>}
            {!isLoading &&
              !results.length &&
              !custom.some(
                (c) => tab !== "favorites" || favoriteReciters.includes(c.id),
              ) && (
                <p className="listen-empty">
                  {tab === "favorites"
                    ? "Touchez ☆ sur un récitant pour le retrouver ici."
                    : "Aucun récitant ne correspond à votre recherche. Essayez un autre nom ou filtre."}
                </p>
              )}
            {results.length > limit && (
              <button
                className="listen-secondary"
                onClick={() => setLimit((n) => n + 24)}
              >
                Afficher plus de voix ({results.length - limit})
              </button>
            )}
          </section>
        </>
      )}
    </div>
  );
}
