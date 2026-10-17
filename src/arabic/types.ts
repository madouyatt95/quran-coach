export type Skill = 'category'|'role'|'form';
export interface GrammarQuestion {id:string;skill:Skill;prompt:string;options:string[];answer:number;explanation:string}
export interface TeachingWord {text:string;label:string;detail:string}
export interface ArabicLesson {id:string;level?:number;prerequisites?:string[];track:'Fondations'|'Naḥw'|'Ṣarf';title:string;arabic:string;goal:string;paragraphs:string[];advanced:string;example:TeachingWord[];translation:string;takeaway:string;target:{surah:number;ayah:number};questions:GrammarQuestion[];source:string}
export interface WordGrammar {position:number;lesson:string;category:'nom'|'verbe'|'particule'|'composé';simple:string;detail:string;root?:string;pattern?:string;related?:number[]}
export interface VerseGrammar {words:WordGrammar[];note:string}
export const SKILL_LABELS:Record<Skill,string>={category:'Reconnaître les catégories',role:'Comprendre les fonctions',form:'Reconnaître les formes'};
