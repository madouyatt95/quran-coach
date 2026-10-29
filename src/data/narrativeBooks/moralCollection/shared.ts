import type {HadithNarrativeSource} from '../../../lib/narrativeBooks';
export const checkedAt='2026-10-29';
export function hadith(collection:'bukhari'|'muslim',number:string,description:string):HadithNarrativeSource{return {id:`${collection}-${number}`,type:'hadith',collection:collection==='bukhari'?'Sahih al-Bukhari':'Sahih Muslim',number,url:`https://sunnah.com/${collection}:${number}`,grade:'Sahih',description,checkedAt};}
