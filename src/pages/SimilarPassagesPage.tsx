import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchSurah, getAudioUrl } from "../lib/quranApi";
import { differingWordIndices, passageUrl } from "../lib/learning";
import {
  normalizeRecitationWord,
  recitationWords,
} from "../lib/recitationMatching";
import type { Ayah } from "../types";
import "../components/Learning/Learning.css";
const PAIRS = [
  {
    label: "Deux ouvertures : « A réussi… »",
    refs: [
      { surah: 23, ayah: 1 },
      { surah: 87, ayah: 14 },
    ],
  },
  {
    label: "La profession de foi",
    refs: [
      { surah: 2, ayah: 136 },
      { surah: 3, ayah: 84 },
    ],
  },
  {
    label: "Une même invitation, des formulations différentes",
    refs: [
      { surah: 2, ayah: 58 },
      { surah: 7, ayah: 161 },
    ],
  },
];
export function SimilarPassagesPage() {
  const [selected, setSelected] = useState(0);
  const [verses, setVerses] = useState<Ayah[]>([]);
  const [error, setError] = useState("");
  const [hide, setHide] = useState(false);
  const [retry, setRetry] = useState(0);
  const pair = PAIRS[selected];
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      pair.refs.map(
        async (ref) =>
          (await fetchSurah(ref.surah)).ayahs.find(
            (a) => a.numberInSurah === ref.ayah,
          )!,
      ),
    )
      .then((rows) => {
        if(rows.some(row=>!row)) throw new Error("Passage absent");
        if (!cancelled) {
          setVerses(rows);
          setError("");
        }
      })
      .catch(() => {
        if (!cancelled)
          setError(
            "Chargement impossible. Vérifiez la connexion ou vos packs.",
          );
      });
    return () => {
      cancelled = true;
    };
  }, [pair, retry]);
  const tokens = verses.map((v) => {
    const words = recitationWords(v.text);
    const prefix = words.slice(0, 4).map(normalizeRecitationWord).join(' ');
    // Compare the numbered ayahs, without the API's unnumbered opening formula.
    return v.surah !== 1 && v.surah !== 9 && v.numberInSurah === 1 && prefix === 'بسم الله الرحمن الرحيم' ? words.slice(4) : words;
  });
  return (
    <div className="learning-page">
      <Link className="learning-btn" to="/learning">
        ← Ma séance
      </Link>
      <h1>Passages semblables</h1>
      <p className="learning-muted">
        Comparez les formulations, écoutez, puis rappelez le passage choisi. Les
        surlignages indiquent une différence de texte, pas une règle de tajwid.
      </p>
      <label>
        Exercice
        <select
          value={selected}
          onChange={(e) => {
            setSelected(Number(e.target.value));
            setVerses([]);
            setHide(false);
          }}
        >
          {PAIRS.map((p, i) => (
            <option key={i} value={i}>
              {p.label}
            </option>
          ))}
        </select>
      </label>
      {error && (
        <p role="alert">
          {error}
          <button
            className="learning-btn"
            onClick={() => setRetry((x) => x + 1)}
          >
            Réessayer
          </button>
        </p>
      )}
      <button className="learning-btn" onClick={() => setHide((v) => !v)}>
        {hide ? "Comparer ma récitation au texte" : "Masquer les deux passages"}
      </button>
      {verses.map((v, i) => {
        const diffs = differingWordIndices(
          tokens[i].map(normalizeRecitationWord),
          tokens[1 - i].map(normalizeRecitationWord),
        );
        return (
          <section className="learning-card" key={v.number}>
            <h2>
              Coran {v.surah}:{v.numberInSurah}
            </h2>
            {!hide && (
              <p className="learning-arabic" lang="ar">
                {tokens[i].map((word, j) => (
                  <span className={diffs.has(j) ? "learning-diff" : ""} key={j}>
                    {word}{" "}
                  </span>
                ))}
              </p>
            )}
            <audio
              controls
              preload="none"
              src={getAudioUrl("ar.alafasy", v.number)}
            />
            <Link
              className="learning-btn"
              to={passageUrl({ surah: v.surah, ayah: v.numberInSurah })}
            >
              Travailler ce passage
            </Link>
          </section>
        );
      })}
    </div>
  );
}
