import type {HadithNarrativeSource,HistoricalNarrativeSource} from '../../lib/narrativeBooks';
/** References checked against the ancient Arabic report; French narration is newly authored. */
export const companionHadith=(collection:'bukhari'|'muslim',number:string,description:string):HadithNarrativeSource=>({
 id:`${collection}-${number}`,type:'hadith',collection:collection==='bukhari'?'Sahih al-Bukhari':'Sahih Muslim',number,
 url:`https://sunnah.com/${collection}:${number}`,grade:`Sahih — recueil de ${collection==='bukhari'?'Sahih al-Bukhari':'Sahih Muslim'}`,
 description,checkedAt:'2026-10-24',
});
export const companionTirmidhi=(number:string,description:string,grade:string):HadithNarrativeSource=>({
 id:`tirmidhi-${number}`,type:'hadith',collection:'Jami at-Tirmidhi',number,
 url:`https://sunnah.com/tirmidhi:${number}`,grade,description,checkedAt:'2026-10-24',
});
/** Historical chronology is identified separately from authenticated hadith. No modern translation is copied. */
export const classicalHistory=(id:string,author:string,work:string,location:string,url:string,description:string):HistoricalNarrativeSource=>({
 id,type:'history',author,work,location,url,description,checkedAt:'2026-10-24',
 assessment:'Chronique historique : les repères retenus ne donnent pas une authenticité uniforme à tous les récits du chapitre.',
 rights:url.includes('wikisource.org')?'Œuvre arabe ancienne dans le domaine public. Faits reformulés en français original ; transcription et présentation Wikisource sous CC BY-SA, non reproduites.':'Œuvre arabe ancienne dans le domaine public. Seuls les faits sont reformulés en français original ; les ajouts éditoriaux et traductions modernes ne sont pas reproduits.',
});
