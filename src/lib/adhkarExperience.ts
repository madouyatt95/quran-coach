import {ADHKAR_DATA, type Dhikr} from '../data/adhkarCatalog';
import {HISNUL_MUSLIM_DATA} from '../data/hisnulMuslim';
export interface Invocation extends Dhikr {key:string;categoryId:string;categoryName:string;group:string;}
export interface InvocationCategory {id:string;name:string;icon:string;group:string;items:Invocation[];}
export const invocationKey=(category:string,id:number)=>`${category}:${id}`;
export const normalizeInvocation=(text:string)=>text.normalize('NFD').replace(/[\u0300-\u036f\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').toLocaleLowerCase().replace(/[’'ʿʾʻ]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const sourceCorrections:Record<string,Partial<Invocation>>={
 'duas_exaucees:601':{source:'Coran 21:87',sourceUrl:'https://quran.com/21/87'},
 'duas_exaucees:608':{source:'Coran 3:173',sourceUrl:'https://quran.com/3/173'},
 'duas_exaucees:610':{source:'Coran 2:201',sourceUrl:'https://quran.com/2/201'},
};
const names:Record<string,string>={duas_exaucees:'Invocations de confiance et d’espoir'};
export const invocationCategories:InvocationCategory[]=[
 ...ADHKAR_DATA.map((c,i)=>({id:c.id,name:names[c.id]||c.name,icon:['🌅','🌙','🤲','✨','📖','💚','🌿','🤲'][i]||'📿',group:'Sélections',items:c.adhkar.map(d=>({...d,...sourceCorrections[invocationKey(c.id,d.id)],translation:sourceCorrections[invocationKey(c.id,d.id)]?d.translation.replace(/\s*\([^)]*\)/g,''):d.translation,key:invocationKey(c.id,d.id),categoryId:c.id,categoryName:names[c.id]||c.name,group:'Sélections'}))})),
 ...HISNUL_MUSLIM_DATA.flatMap(m=>m.chapters.map(c=>({id:`hisn_${c.id}`,name:c.title.trim(),icon:m.emoji,group:m.name,items:c.duas.map(d=>({...d,transliteration:d.phonetic,key:invocationKey(`hisn_${c.id}`,d.id),categoryId:`hisn_${c.id}`,categoryName:c.title.trim(),group:m.name}))})))
];
export const allInvocations=invocationCategories.flatMap(c=>c.items);
export const invocationByKey=new Map(allInvocations.map(d=>[d.key,d]));
export const categoryById=new Map(invocationCategories.map(c=>[c.id,c]));
export const isDailyInvocation=(d:Invocation)=>['morning','evening','hisn_chap_27'].includes(d.categoryId);
export const invocationCountKey=(d:Invocation)=>d.daily?`daily-${d.id}`:`${d.categoryId}-${d.id}`;
export const quranReference=(d:Invocation)=>{
 const match=/(?:^|Coran\s+|[—·]\s*)(\d{1,3}):(\d{1,3})(?:[-–](\d+))?(?:$|\s)/i.exec(d.source||'');
 if(!match||+match[1]<1||+match[1]>114||+match[2]<1)return null;
 return {surah:+match[1],ayah:+match[2],end:match[3]?+match[3]:undefined};
};
export const countEvidence=(d:Invocation)=>d.hisnReference&&d.sourceUrl?{url:d.sourceUrl,label:`Repère du recueil · Hisn ${d.hisnReference}`,description:d.count===1?'Une lecture dans ce parcours. Aucun nombre supplémentaire n’est attribué à cette référence.':`${d.count} répétitions indiquées dans cette entrée du recueil${d.daily?' sur la journée':''}. Consulter la référence pour les variantes et leurs conditions.`}:null;
export function invocationTitle(d:Invocation):string {
 if(d.title)return d.title;
 const sentence=d.translation.replace(/\([^)]*\)/g,'').split(/[.!?]/)[0].replace(/\s+/g,' ').trim();
 if(!sentence)return d.categoryName;
 return sentence.length>80?sentence.slice(0,80).replace(/\s+\S*$/,'').replace(/[,;:]$/,'')+'…':sentence;
}
const aliases:[RegExp,string][]=[[/voyag|trajet|deplac|voiture/,'voyage transport monture'],[/inquiet|anxie|stress|angoiss|tristess/,'angoisse tristesse souci'],[/remerc|gratitud/,'louange merci bienfait'],[/pardonn|pardon|repent/,'pardon repentir'],[/dorm|couch|sommeil/,'dormir sommeil'],[/mang|repas/,'repas nourriture'],[/parent|famill|enfant/,'parents famille enfants']];
const index=allInvocations.map(d=>({d,text:normalizeInvocation(`${d.categoryName} ${d.title||''} ${d.arabic} ${d.transliteration||''} ${d.translation} ${d.source||''}`),title:normalizeInvocation(d.categoryName)}));
export function searchInvocations(query:string):Invocation[]{
 const q=normalizeInvocation(query);if(!q)return [];
 const words=q.split(' ').filter(w=>!['je','de','du','des','la','le','les','un','une','me','mon','ma','mes','pour','a','en','ai','suis','veux','demander'].includes(w));
 const extra=aliases.filter(([re])=>re.test(q)).flatMap(([,value])=>value.split(' '));
 const scored=index.map(row=>({...row,score:row.text.includes(q)?100:words.length&&words.every(w=>row.text.includes(w))?80:extra.reduce((n,w)=>n+(row.text.includes(w)?2:0)+(row.title.includes(w)?4:0),0)})).filter(r=>r.score>0).sort((a,b)=>b.score-a.score);
 const seen=new Set<string>();return scored.filter(({d})=>{const key=normalizeInvocation(d.arabic);if(seen.has(key))return false;seen.add(key);return true;}).map(r=>r.d);
}
/** Segment only at existing punctuation; no word or diacritic is changed. */
export function invocationPhrases(text:string):string[]{return text.match(/[^،؛.!؟\n]+[،؛.!؟\n]*/gu)?.map(s=>s.trim()).filter(Boolean)||[text];}
export const invocationGlossary=[
 {arabic:'اللهم',label:'Allāhumma',meaning:'Une manière de s’adresser à Allah : « Ô Allah ».'},
 {arabic:'ربنا',label:'Rabbanā',meaning:'« Notre Seigneur » : l’invocation est formulée au pluriel.'},
 {arabic:'رب',label:'Rabb',meaning:'« Seigneur ». Le contexte et les terminaisons précisent : mon Seigneur, notre Seigneur…'},
 {arabic:'اغفر',label:'Ighfir',meaning:'Une demande de pardon.'},
 {arabic:'اعوذ',label:'Aʿūdhu',meaning:'« Je cherche refuge » : une demande de protection.'},
 {arabic:'الحمد',label:'Al-ḥamd',meaning:'La louange, adressée à Allah dans ces formules.'},
 {arabic:'سبحان',label:'Subḥān',meaning:'Une formule qui proclame la perfection d’Allah, exempt de défaut.'},
 {arabic:'ارحم',label:'Irḥam',meaning:'Une demande de miséricorde.'},
];
