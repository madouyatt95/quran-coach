import type { Passage } from './learning';
import { normalizeRecitationWord } from './recitationMatching';
import { fetchWithCache } from './apiCache';
export interface CorpusVerse extends Passage { words:string[] }
/** Textual candidates only: a shared phrase is not proof the reader confused two verses. */
export function similarCandidates(source:CorpusVerse, verses:CorpusVerse[], limit=3):CorpusVerse[] {
  const words=source.words.map(normalizeRecitationWord);
  if(words.length<3)return [];
  const grams=new Set(words.slice(0,-1).map((w,i)=>`${w} ${words[i+1]}`));
  return verses.filter(v=>v.surah!==source.surah||v.ayah!==source.ayah).map(v=>{
    const target=v.words.map(normalizeRecitationWord);
    if(target.join(' ')===words.join(' ')||target.length<3)return {v,score:0};
    const shared=target.slice(0,-1).filter((w,i)=>grams.has(`${w} ${target[i+1]}`)).length;
    const prefix=target[0]===words[0]&&target[1]===words[1];
    const score=shared/Math.max(grams.size,target.length-1);
    return {v,score:shared>=2&&score>=.4||prefix&&Math.min(words.length,target.length)<=6?score:0};
  }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,limit).map(x=>x.v);
}
let corpusPromise:Promise<CorpusVerse[]>|null=null;
export function loadComparisonCorpus():Promise<CorpusVerse[]> {
  if(!corpusPromise)corpusPromise=(async()=>{
    const {QuranCorpus}=await import('@tilawa/core');
    const corpus=new QuranCorpus(await fetchWithCache('/tilawa/v1/corpus.json'));
    const verses:CorpusVerse[]=[];
    for(let i=0;i<corpus.wordCount;i++){
      if(corpus.wordInAyah[i]!==0)continue;
      const surah=corpus.wordSurah[i],ayah=corpus.wordAyah[i];
      verses.push({surah,ayah,words:corpus.plain.slice(i,i+corpus.ayahWordCount(surah,ayah))});
    }
    return verses;
  })().catch(e=>{corpusPromise=null;throw e;});
  return corpusPromise;
}
