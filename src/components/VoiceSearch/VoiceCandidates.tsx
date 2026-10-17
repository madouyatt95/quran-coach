import { useEffect, useState } from 'react';
import type { Passage } from '../../lib/learning';
import { fetchSurah } from '../../lib/quranApi';
import { normalizeRecitationWord, recitationWords } from '../../lib/recitationMatching';
export function VoiceCandidates({ passages, listening, name, onChoose }: { passages: Passage[]; listening: boolean; name: (p: Passage) => string; onChoose: (p: Passage) => void }) {
    const [texts, setTexts] = useState<Record<string, string>>({}), [error, setError] = useState(false), [retry, setRetry] = useState(0);
    const keys = passages.map(p => `${p.surah}:${p.ayah}`).join(',');
    useEffect(() => {
        let cancelled = false;
        const refs = keys.split(',').map(key => key.split(':').map(Number));
        void Promise.all([...new Set(refs.map(p => p[0]))].map(async surah => {
            const data = await fetchSurah(surah);
            return Object.fromEntries(data.ayahs.map(a => [`${surah}:${a.numberInSurah}`, a.text]));
        })).then(results => { if (!cancelled) { setTexts(Object.assign({}, ...results)); setError(false); } }).catch(() => { if (!cancelled) setError(true); });
        return () => { cancelled = true; };
    }, [keys, retry]);
    const lists = passages.map(p => recitationWords(texts[`${p.surah}:${p.ayah}`] || ''));
    return <section className="voice-candidates" aria-label="Passages possibles"><h2>{passages.length > 1 ? 'Plusieurs passages possibles' : 'Un passage à confirmer'}</h2><p>{listening ? 'Poursuivez quelques mots. Les passages affichés restent disponibles si vous souhaitez en choisir un.' : 'L’écoute est arrêtée. Prenez le temps de choisir le passage que vous reconnaissez, ou relancez une recherche.'}</p>
        {passages.map((passage, index) => <article key={`${passage.surah}:${passage.ayah}`}><h3>{name(passage)} <small>{passage.surah}:{passage.ayah}</small></h3>
            <p lang="ar" dir="rtl" className="voice-candidate-text">{lists[index].map((word, wi) => <span key={wi} data-different={lists.length > 1 && lists.every(words => words.length > 0) && lists.some(words => normalizeRecitationWord(words[wi] || '') !== normalizeRecitationWord(word)) ? true : undefined}>{word} </span>)}</p>
            <button onClick={() => onChoose(passage)}>Choisir ce passage</button></article>)}
        {error && <button onClick={() => setRetry(n => n + 1)}>Réessayer les textes</button>}
        {lists.length > 1 && lists.every(words => words.length) && <small>Les différences de texte sont mises en évidence.</small>}
    </section>;
}
