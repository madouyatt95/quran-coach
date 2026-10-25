import type {HadithNarrativeSource} from '../../lib/narrativeBooks';
import {classicalHistory,companionHadith} from './companionSources';
export const B=(n:string,d:string)=>({...companionHadith('bukhari',n,d),checkedAt:'2026-10-25'});
export const M=(n:string,d:string)=>({...companionHadith('muslim',n,d),checkedAt:'2026-10-25'});
export const S=(collection:'nasai'|'abudawud'|'tirmidhi',number:string,description:string,grade:string):HadithNarrativeSource=>({id:`${collection}-${number}`,type:'hadith',collection:{nasai:'Sunan an-Nasa’i',abudawud:'Sunan Abi Dawud',tirmidhi:'Jami at-Tirmidhi'}[collection],number,description,grade,url:`https://sunnah.com/${collection}:${number}`,checkedAt:'2026-10-25'});
export const H=(id:string,name:string,arabic:string,url?:string)=>({...classicalHistory(`dhahabi-${id}`,'Adh-Dhahabi','Siyar a‘lam an-nubala’, XIIIe–XIVe siècle',`Notice de ${name}`,url||`https://ar.wikisource.org/wiki/سير_أعلام_النبلاء/${arabic.replaceAll(' ','_')}`,`Repères biographiques de ${name}. Les traditions historiques ne reçoivent pas automatiquement le degré d’un hadith authentifié.`),checkedAt:'2026-10-25'});
