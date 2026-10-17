import rawGroups from './phrase-groups.json';
import corpus from './context-corpus.json';
import {normalizeFahmWord,validExamples,verseKey,type VerseTarget} from './learning';
import type {MushafWord} from '../interactiveMushaf/model';
import {QURAN_VOCABULARY} from '../../data/quranVocabulary';
export interface PhraseGroup {from:number;to:number;expected:string}
export const PHRASE_GROUPS=rawGroups as Record<string,PhraseGroup[]>;
export function verifiedGroups(key:string,words:MushafWord[]) {
 const groups=PHRASE_GROUPS[key];if(!groups||groups.at(-1)!.to!==words.length)return [];
 return groups.every(g=>normalizeFahmWord(words.slice(g.from-1,g.to).map(w=>w.text).join(' '))===normalizeFahmWord(g.expected))?groups:[];
}
export function contextReferences(word:MushafWord):VerseTarget[] {
 const normalized=normalizeFahmWord(word.text),seen=new Set([word.verseKey]);
 const local=Object.entries(corpus).filter(([,words])=>words.some(w=>normalizeFahmWord(w)===normalized)).map(([key])=>{const [surah,ayah]=key.split(':').map(Number);return {surah,ayah};});
 const legacy=QURAN_VOCABULARY.filter(w=>normalizeFahmWord(w.arabic)===normalized).flatMap(validExamples).map(({surah,ayah})=>({surah,ayah}));
 return [...local,...legacy].filter(v=>!seen.has(verseKey(v))&&!!seen.add(verseKey(v))).slice(0,3);
}
export const PHRASE_ROLES:Record<string,string[]>={
 '1:1':['La formule d’ouverture au nom d’Allah.','Les attributs de miséricorde.'],
 '1:2':['À qui s’adresse la louange.','La qualification du Seigneur.'],
 '1:5':['L’adoration adressée à Allah seul.','La demande de secours adressée à Allah seul.'],
 '1:6':['La demande de guidance.','Le chemin demandé.'],
 '1:7':['Le chemin des bénéficiaires du bienfait.','Une voie dont la demande se distingue.','La suite de cette distinction.'],
 '112:3':['La première négation.','La seconde négation complète la première.'],
 '103:3':['La foi.','Les œuvres.','L’encouragement mutuel à la vérité.','L’encouragement mutuel à la patience.'],
};
