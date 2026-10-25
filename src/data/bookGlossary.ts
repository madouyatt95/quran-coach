export interface BookTerm {id:string;label:string;aliases:string[];meaning:string;reference:{label:string;url:string};checkedAt:string}
/** Short original explanations. References are evidence/context, not verbatim translations. */
export const bookGlossary:BookTerm[]=[
 {id:'ansar',label:'Ansar',aliases:['Ansar','Ansars'],meaning:'Les croyants de Médine qui ont accueilli et soutenu le Prophète et les émigrés. Le nom signifie « les soutiens » ; il désigne ici un groupe historique, et non tous les habitants de la ville.',reference:{label:'Coran 59:9 · l’accueil des émigrés',url:'https://quran.com/59/9'},checkedAt:'2026-10-25'},
 {id:'muhajirun',label:'Muhajirun',aliases:['Muhajirun','Muhajirin'],meaning:'Les émigrés : dans ces récits, les premiers croyants qui ont quitté leur terre pour préserver leur foi et rejoindre la communauté. Ils sont distingués des Ansar, qui les ont accueillis.',reference:{label:'Coran 9:100 · émigrés et Ansar',url:'https://quran.com/9/100'},checkedAt:'2026-10-25'},
 {id:'hijra',label:'Hégire',aliases:['hégire','hijra'],meaning:'L’émigration. Lorsqu’une date est donnée « de l’hégire », elle se rapporte au calendrier dont le point de départ est l’émigration vers Médine. Les récits évoquent aussi une émigration antérieure vers l’Abyssinie.',reference:{label:'Al-Bukhari 3905 · le départ vers Médine',url:'https://sunnah.com/bukhari:3905'},checkedAt:'2026-10-25'},
 {id:'kunya',label:'Kunya',aliases:['kunya'],meaning:'Une appellation commençant souvent par Abu (« père de ») ou Umm (« mère de »). Elle peut être employée même sans enfant portant ce nom : elle ne suffit donc pas à établir une parenté.',reference:{label:'Al-Bukhari 6203 · une kunya donnée à un enfant',url:'https://sunnah.com/bukhari:6203'},checkedAt:'2026-10-25'},
 {id:'caliphate',label:'Califat',aliases:['califat','calife','califes'],meaning:'La charge de gouvernement de la communauté après la mort du Prophète ; celui qui l’exerce est appelé calife. Dans ces biographies, le terme renvoie notamment aux gouvernements d’Abu Bakr, Umar, Uthman et Ali. Il ne désigne pas une nouvelle prophétie.',reference:{label:'Al-Bukhari 3700 · la succession après Umar',url:'https://sunnah.com/bukhari:3700'},checkedAt:'2026-10-25'},
 {id:'shura',label:'Shura',aliases:['shura','choura'],meaning:'La consultation. Le mot désigne le fait de délibérer ensemble ; dans certains récits, il renvoie plus précisément au conseil chargé de préparer une succession. Le contexte précise de quelle consultation il s’agit.',reference:{label:'Coran 42:38 · la consultation',url:'https://quran.com/42/38'},checkedAt:'2026-10-25'},
 {id:'mushaf',label:'Mushaf',aliases:['mushaf','mushafs'],meaning:'Un exemplaire écrit du Coran. Le mot désigne le support rassemblant le texte. Les récits de collecte et de copie distinguent les feuillets conservés et les exemplaires préparés pour les différentes régions.',reference:{label:'Al-Bukhari 4987 · les feuillets de Hafsa et les copies',url:'https://sunnah.com/bukhari:4987'},checkedAt:'2026-10-25'},
];
const escape=(text:string)=>text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const patterns=bookGlossary.flatMap(term=>term.aliases.map(alias=>({term,regex:new RegExp(`(^|[^\\p{L}\\p{M}\\p{N}])(${escape(alias)})(?![\\p{L}\\p{M}\\p{N}])`,'giu')})));
export function glossaryMentions(text:string){
 const matches=patterns.flatMap(({term,regex})=>[...text.matchAll(regex)].map(m=>({term,start:m.index+m[1].length,end:m.index+m[1].length+m[2].length})));
 matches.sort((a,b)=>a.start-b.start||b.end-a.end);
 return matches.filter((m,i)=>i===0||m.start>=matches[i-1].end);
}
export function termsInText(text:string){return [...new Map(glossaryMentions(text).map(m=>[m.term.id,m.term])).values()];}
