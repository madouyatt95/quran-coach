import type {EditorialJourney} from './editorialJourneys';
import {getRecordedNarration} from './recordedNarration';
import {getAudioUrl} from './quranApi';
import chapters from './interactiveMushaf/chapters.json';
export async function editorialPackUrls(journey:EditorialJourney){
 const urls=['/audio/narration/fr-v1/manifest.json'];
 for(const step of journey.steps){
  if(step.kind==='narrative'){const entry=await getRecordedNarration(step.text);if(!entry)throw new Error('La narration de ce chapitre manque. Réessayez plus tard.');urls.push(entry.url);}
  if(step.kind==='verse')urls.push(getAudioUrl('ar.alafasy',chapters[step.surah!-1].offset+step.ayah!),`https://api.alquran.cloud/v1/surah/${step.surah}/quran-uthmani`,`https://api.alquran.cloud/v1/surah/${step.surah}/fr.hamidullah`);
 }
 return [...new Set(urls)];
}
