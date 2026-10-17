import { useEffect, useMemo, useState, useRef } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchSurah, getAudioUrl } from '../../lib/quranApi';
import { differingWordIndices, type Passage } from '../../lib/learning';
import { normalizeRecitationWord } from '../../lib/recitationMatching';
import { testWords } from '../../lib/memorizationTest';
import { loadComparisonCorpus, similarCandidates } from '../../lib/similarRecitation';
import { weakWords } from '../../lib/hifdhJourney';
import type { CoachReviewEntry } from '../../lib/coachSession';
import type { Ayah } from '../../types';
interface Pair {
    id: string;
    refs: [
        Passage,
        Passage
    ];
    label: string;
}
const defaults: Pair[] = [{ id: '23:1-87:14', refs: [{ surah: 23, ayah: 1 }, { surah: 87, ayah: 14 }], label: 'Deux ouvertures : « A réussi… »' }, { id: '2:136-3:84', refs: [{ surah: 2, ayah: 136 }, { surah: 3, ayah: 84 }], label: 'La profession de foi' }, { id: '2:58-7:161', refs: [{ surah: 2, ayah: 58 }, { surah: 7, ayah: 161 }], label: 'Deux invitations semblables' }];
interface PairState {
    custom: Pair[];
    results: Record<string, {
        wrong: number;
        right: number;
        at: string;
        due: string;
    }>;
    add: (p: Pair) => void;
    answer: (id: string, ok: boolean) => void;
}
const usePairs = create<PairState>()(persist(set => ({ custom: [], results: {}, add: p => set(s => ({ custom: [p, ...s.custom.filter(a => a.id !== p.id)].slice(0, 100) })), answer: (id, ok) => set(s => {
        const prev = s.results[id] || { wrong: 0, right: 0 };
        const now = new Date(), due = new Date(now);
        due.setDate(due.getDate() + (ok ? 3 : 1));
        return { results: { ...s.results, [id]: { wrong: prev.wrong + Number(!ok), right: prev.right + Number(ok), at: now.toISOString(), due: due.toISOString() } } };
    }) }), { name: 'quran-coach-confusions-v1' }));
export function HifdhSimilar({ errors }: {
    errors: CoachReviewEntry[];
}) {
    const { custom, results, add, answer } = usePairs();
    const players=useRef<Array<HTMLAudioElement|null>>([]);
    useEffect(()=>{const refs=players;return ()=>refs.current.forEach(a=>a?.pause());},[]);
    const [suggested,setSuggested]=useState<Pair[]>([]);
    const errorRefs=[...new Set(weakWords(errors).map(p=>`${p.surah}:${p.ayah}`))].slice(0,12).join(',');
    useEffect(()=>{
        let cancelled=false;
        if(!errorRefs){setSuggested([]);return;}
        void loadComparisonCorpus().then(corpus=>{
            const pairs=new Map<string,Pair>();
            for(const ref of errorRefs.split(',')){
                const [surah,ayah]=ref.split(':').map(Number),source=corpus.find(v=>v.surah===surah&&v.ayah===ayah);
                if(!source)continue;
                for(const candidate of similarCandidates(source,corpus,2)){
                    const key=[ref,`${candidate.surah}:${candidate.ayah}`].sort().join('-');
                    pairs.set(key,{id:key,refs:[{surah,ayah},{surah:candidate.surah,ayah:candidate.ayah}],label:`À comparer · ${ref} et ${candidate.surah}:${candidate.ayah}`});
                }
            }
            if(!cancelled)setSuggested([...pairs.values()].slice(0,12));
        }).catch(()=>{if(!cancelled)setSuggested([]);});
        return ()=>{cancelled=true;};
    },[errorRefs]);
    const pairs = useMemo(() => [...new Map([...custom, ...suggested, ...defaults].map(p=>[p.id,p])).values()].sort((a, b) => {
        const weak = weakWords(errors);
        const score = (p: Pair) => (results[p.id]?.wrong || 0) * 2 - (results[p.id]?.right || 0) + Number(p.refs.some(r => weak.some(w => w.surah === r.surah && w.ayah === r.ayah))) * 5;
        return score(b) - score(a);
    }), [custom, suggested, results, errors]); // Order by observed difficulty; refs are always fetched from the Quran API.
    const [id, setId] = useState(pairs[0].id), [verses, setVerses] = useState<Ayah[]>([]), [error, setError] = useState('');
    const [refs, setRefs] = useState(['', '']), [quiz, setQuiz] = useState(false), [target, setTarget] = useState(0), [result, setResult] = useState<boolean | null>(null), [reverse, setReverse] = useState(false), [retry, setRetry] = useState(0);
    const pair = pairs.find(p => p.id === id) || pairs[0];
    useEffect(() => {
        let cancelled = false;
        setVerses([]);
        setError('');
        setQuiz(false);
        setResult(null);
        Promise.all(pair.refs.map(async (p) => (await fetchSurah(p.surah)).ayahs.find(a => a.numberInSurah === p.ayah))).then(rows => {
            if (rows.some(a => !a))
                throw Error('Référence inexistante');
            if (!cancelled)
                setVerses(rows as Ayah[]);
        }).catch(() => { if (!cancelled)
            setError('Ces références ne sont pas disponibles. Vérifiez les numéros ou téléchargez les textes.'); });
        return () => { cancelled = true; };
    }, [pair.id, pair.refs, retry]);
    const words = verses.map(a => testWords(a).words), normalized = words.map(w => w.map(normalizeRecitationWord));
    const diffs = words.map((_, i) => differingWordIndices(normalized[i], normalized[1 - i]));
    const firstDiff = verses.length === 2 ? Math.min(...diffs[target]) : 0;
    const canQuiz = verses.length === 2 && diffs.every(d => d.size > 0) && Number.isFinite(firstDiff);
    function startQuiz() { setTarget(n => 1 - n); setReverse(Math.random() < 0.5); setResult(null); setQuiz(true); }
    async function addPair() {
        const parsed = refs.map(v => /^(\d{1,3}):(\d{1,3})$/.exec(v.trim()));
        if (parsed.some(p => !p || Number(p[1]) < 1 || Number(p[1]) > 114 || Number(p[2]) < 1 || Number(p[2]) > 286)) {
            setError('Saisissez deux références comme 2:58 et 7:161.');
            return;
        }
        const ps = parsed.map(p => ({ surah: Number(p![1]), ayah: Number(p![2]) })) as [
            Passage,
            Passage
        ];
        if (refs[0] === refs[1]) {
            setError('Choisissez deux passages différents.');
            return;
        }
        try {
            const data = await Promise.all(ps.map(p => fetchSurah(p.surah)));
            if (data.some((s, i) => !s.ayahs.some(a => a.numberInSurah === ps[i].ayah)))
                throw Error();
            const key = ps.map(p => `${p.surah}:${p.ayah}`).join('-');
            add({ id: key, refs: ps, label: `Ma confusion · ${key}` });
            setId(key);
            setError('');
        }
        catch {
            setError('Impossible de vérifier ces deux références. Réessayez avec une connexion.');
        }
    }
    return <section className="journey-card"><h3>Ne plus confondre les passages</h3><p className="journey-muted">Les différences proviennent du texte des versets. Les propositions « À comparer » sont des proximités textuelles autour de vos difficultés, pas des confusions vocales avérées.</p>
    <label>Paire à travailler<select value={pair.id} onChange={e => setId(e.target.value)}>{pairs.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}</select></label>
    {error && <p role="alert">{error}<button onClick={() => setRetry(n => n + 1)}>Réessayer</button></p>}
    {quiz && canQuiz ? <div className="journey-quiz"><h4>Quelle formulation appartient à {pair.refs[target].surah}:{pair.refs[target].ayah} ?</h4><p dir="rtl" lang="ar">{words[target].slice(0, firstDiff).join(' ')} …</p>
      {(reverse ? [1, 0] : [0, 1]).map(i => <button key={i} disabled={result !== null} dir="rtl" lang="ar" onClick={() => { const ok = i === target; setResult(ok); answer(pair.id, ok); }}>{words[i].slice(Math.min(...diffs[i])).join(' ')}</button>)}
      {result !== null && <><p role="status">{result ? 'Bonne distinction.' : 'À revoir : comparez les mots surlignés.'} Prochaine vérification : {new Date(results[pair.id].due).toLocaleDateString('fr-FR')}.</p><button onClick={() => setQuiz(false)}>Comparer les deux versets</button><button onClick={startQuiz}>Tester l’autre passage</button></>}
    </div> : <>{verses.map((v, i) => <div className="journey-verse" key={v.number}><strong>{v.surah}:{v.numberInSurah}</strong><p dir="rtl" lang="ar">{words[i].map((w, j) => <span key={j} className={diffs[i].has(j) ? 'journey-difference' : ''}>{w} </span>)}</p><audio ref={node=>{if(!node)players.current[i]?.pause();players.current[i]=node;}} onPlay={()=>players.current.forEach((a,j)=>{if(i!==j)a?.pause();})} controls preload="none" src={getAudioUrl('ar.alafasy', v.number)}/></div>)}<button disabled={!canQuiz} onClick={startQuiz}>Tester les formulations</button></>}
    {results[pair.id] && <p>{results[pair.id].right} réussites · {results[pair.id].wrong} confusions · {Date.parse(results[pair.id].due) <= Date.now() ? 'À revoir aujourd’hui' : `À revoir le ${new Date(results[pair.id].due).toLocaleDateString('fr-FR')}`}</p>}
    <details><summary>Ajouter deux passages que je confonds</summary><div className="journey-ref-inputs">{refs.map((v, i) => <label key={i}>Référence {i + 1}<input placeholder={i ? '7:161' : '2:58'} value={v} onChange={e => setRefs(a => a.map((x, j) => j === i ? e.target.value : x))}/></label>)}</div><button onClick={() => void addPair()}>Vérifier et ajouter</button></details>
  </section>;
}
