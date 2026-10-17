import { useListeningJourneyStore } from "../../stores/listeningJourneyStore";
import {
  SESSION_THEMES,
  chooseSessionJourney,
  journeyTotal,
} from "../../lib/listeningJourney";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LISTENING_JOURNEYS } from "../../data/listeningJourneys";
import { IMMERSIVE_VOICES } from "../../lib/listeningExperience";
import { normalizeListeningSearch } from "../../lib/listening";
import "./ListeningExperience.css";
export function ListenDiscover() {
  const navigate = useNavigate();
  const journeyState = useListeningJourneyStore();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const results = LISTENING_JOURNEYS.filter((j) => {
    const whole = j.eyebrow === "UNE SOURATE, UN PARCOURS";
    const short = j.chapters.reduce((n, c) => n + c.to - c.from + 1, 0) <= 20;
    const text = [
      j.title,
      j.description,
      ...j.chapters.map((c) => `${c.title} ${c.introduction}`),
    ].join(" ");
    return (
      (filter === "all" ||
        (filter === "surahs" && whole) ||
        (filter === "themes" && !whole) ||
        (filter === "short" && short)) &&
      normalizeListeningSearch(text).includes(normalizeListeningSearch(query))
    );
  });
  return (
    <section className="listen-discover" aria-label="Écouter et comprendre">
      <div className="listen-discover-hero">
        <span className="listen-eyebrow">ÉCOUTER ET COMPRENDRE</span>
        <h2>Une écoute qui vous accompagne.</h2>
        <p>
          Le verset, son sens et votre voix préférée. Prenez un moment pour
          vous.
        </p>
        <Link className="experience-primary" to="/listen/experience?surah=1">
          📖 Ouvrir le lecteur immersif
        </Link>
        <small>
          {IMMERSIVE_VOICES.length} récitations synchronisées · Texte arabe et
          français
        </small>
      </div>
      <section
        className="experience-session-composer"
        aria-label="Une séance à votre rythme"
      >
        <label>
          De quoi avez-vous envie ?
          <select
            value={journeyState.preferences.theme}
            onChange={(e) =>
              journeyState.setPreferences({ theme: e.target.value })
            }
          >
            {SESSION_THEMES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <div className="experience-time-row">
          <strong>J’ai…</strong>
          {[5, 10, 20].map((m) => (
            <button
              key={m}
              onClick={() => {
                const id = chooseSessionJourney(
                  journeyState.preferences.theme,
                  journeyState.recent,
                  m,
                );
                journeyState.rememberChoice(id);
                navigate(`/listen/experience?journey=${id}&minutes=${m}`);
              }}
            >
              {m} minutes
            </button>
          ))}
        </div>
        <small>
          Une proposition variée, avec reprise de votre parcours si vous l’avez
          commencé.
        </small>
      </section>
      <div className="experience-section-heading">
        <div>
          <h2>Des passages à découvrir</h2>
          <small>
            {LISTENING_JOURNEYS.length} parcours et sélections à explorer
          </small>
        </div>
        <Link to="/listen/experience?notebook=1">♡ Mon carnet</Link>
      </div>
      <div
        className="experience-discovery-filters"
        aria-label="Catégories de parcours"
      >
        {[
          ["all", "Tout"],
          ["surahs", "Sourates"],
          ["themes", "Thèmes"],
          ["short", "Courts"],
        ].map(([id, label]) => (
          <button
            key={id}
            aria-pressed={filter === id}
            onClick={() => {
              setFilter(id);
              setExpanded(false);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <label className="listen-search experience-discovery-search">
        <span aria-hidden="true">⌕</span>
        <input
          type="search"
          aria-label="Rechercher un parcours"
          placeholder="Patience, Youssouf, parents, gratitude…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setExpanded(false);
          }}
        />
      </label>
      <p className="experience-result-count" role="status">
        {results.length} parcours
        {filter === "short" ? " · 20 versets maximum" : ""}
      </p>
      <div className="experience-journey-grid">
        {(expanded ? results : results.slice(0, 6)).map((j) => (
          <Link
            key={j.id}
            to={`/listen/experience?journey=${j.id}`}
            className="experience-journey-card"
          >
            <span aria-hidden="true">{j.icon}</span>
            <small>{j.eyebrow}</small>
            <h3>{j.title}</h3>
            <p>{j.description}</p>
            <b>{j.chapters.length} étapes →</b>
            {journeyState.progress[j.id] && (
              <small className="experience-card-progress">
                {journeyState.progress[j.id].completed.length} /{" "}
                {journeyTotal(j)} versets écoutés
                <progress
                  max={journeyTotal(j)}
                  value={journeyState.progress[j.id].completed.length}
                />
              </small>
            )}
          </Link>
        ))}
      </div>
      {!results.length && (
        <p className="listen-empty">
          Aucun parcours trouvé. Essayez « patience », « parents » ou une autre
          catégorie.
        </p>
      )}
      {results.length > 6 && (
        <button
          className="experience-queue-toggle"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded
            ? "Réduire la sélection"
            : `Voir les ${results.length} parcours`}
        </button>
      )}
    </section>
  );
}
