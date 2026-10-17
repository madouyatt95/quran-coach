import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchSurah, getAudioUrl } from '../../lib/quranApi';
import { differingWordIndices } from '../../lib/learning';
import { normalizeRecitationWord, recitationWords } from '../../lib/recitationMatching';
import { loadComparisonCorpus, similarCandidates } from '../../lib/similarRecitation';
import type { Ayah } from '../../types';

export function VerseComparison({ verse }: { verse: Ayah }) {
  const [candidates, setCandidates] = useState<Ayah[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    setCandidates([]);
    setStatus('loading');
    void loadComparisonCorpus().then(async corpus => {
      const source = corpus.find(v => v.surah === verse.surah && v.ayah === verse.numberInSurah);
      if (!source) throw Error('Passage absent du corpus');
      const matches = similarCandidates(source, corpus, 2);
      const rows = await Promise.all(matches.map(async match =>
        (await fetchSurah(match.surah)).ayahs.find(v => v.numberInSurah === match.ayah)));
      if (!cancelled) {
        setCandidates(rows.filter((row): row is Ayah => Boolean(row)));
        setStatus('ready');
      }
    }).catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, [verse.surah, verse.numberInSurah]);

  const sourceWords = recitationWords(verse.text);
  return <section className="learning-card verse-hub-comparison" aria-label="Comparer les passages semblables">
    <h2>Comparer les formulations</h2>
    <p className="learning-muted">Ces propositions viennent de ressemblances dans le texte. Elles ne signifient pas que votre récitation comporte une confusion.</p>
    {status === 'loading' && <p role="status">Recherche de passages proches…</p>}
    {status === 'error' && <p role="alert">Comparaison indisponible pour le moment. Réessayez en rouvrant cette section avec une connexion.</p>}
    {status === 'ready' && candidates.length === 0 && <p>Aucun passage suffisamment proche trouvé pour ce verset.</p>}
    {candidates.map(candidate => {
      const words = recitationWords(candidate.text);
      const diffs = differingWordIndices(
        words.map(normalizeRecitationWord), sourceWords.map(normalizeRecitationWord));
      return <article key={`${candidate.surah}:${candidate.numberInSurah}`} className="verse-hub-comparison__row">
        <h3>{verse.surah}:{verse.numberInSurah} et {candidate.surah}:{candidate.numberInSurah}</h3>
        <p lang="ar" dir="rtl" className="learning-arabic">{words.map((word, i) => <span key={i} className={diffs.has(i) ? 'learning-diff' : undefined}>{word} </span>)}</p>
        <audio controls preload="none" src={getAudioUrl('ar.alafasy', candidate.number)} aria-label={`Écouter le verset ${candidate.surah}:${candidate.numberInSurah}`} onPlay={e => document.querySelectorAll<HTMLAudioElement>('.verse-hub audio').forEach(other => {if(other !== e.currentTarget)other.pause();})}/>
        <Link className="learning-btn" to={`/passage?surah=${candidate.surah}&ayah=${candidate.numberInSurah}&from=compare&back=${verse.surah}:${verse.numberInSurah}`}>Ouvrir {candidate.surah}:{candidate.numberInSurah}</Link>
      </article>;
    })}
  </section>;
}
