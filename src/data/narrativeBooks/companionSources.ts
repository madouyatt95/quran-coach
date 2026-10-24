import type {HadithNarrativeSource} from '../../lib/narrativeBooks';
/** References checked against the ancient Arabic report; French narration is newly authored. */
export const companionHadith=(collection:'bukhari'|'muslim',number:string,description:string):HadithNarrativeSource=>({
 id:`${collection}-${number}`,type:'hadith',collection:collection==='bukhari'?'Sahih al-Bukhari':'Sahih Muslim',number,
 url:`https://sunnah.com/${collection}:${number}`,grade:`Sahih — recueil de ${collection==='bukhari'?'Sahih al-Bukhari':'Sahih Muslim'}`,
 description,checkedAt:'2026-10-24',
});
