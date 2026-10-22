// Metadata only: never calls ElevenLabs or generates speech.
import './export-narrations.mjs';
import {readFile,writeFile,stat} from 'node:fs/promises';
const {getJourney,COURSE_LEVELS,allInvocations}=await import('/tmp/qc-narration-catalog.mjs');
const catalog=JSON.parse(await readFile('/tmp/qc-narration-model/catalog.json','utf8'));
const manifest=JSON.parse(await readFile('public/audio/narration/fr-v1/manifest.json','utf8'));
const courses=COURSE_LEVELS.flatMap(l=>l.modules);
const entries=[];
for(const entry of catalog){
 const recorded=manifest.entries[entry.key];if(!recorded||recorded.text!==entry.text)continue;
 const [category,id,...parts]=entry.owners[0].split(':');
 let title='',reference='',sourceUrl='';
 if(category==='prophet'||category==='story'){
  const journey=getJourney(category,id),step=journey.steps.find(s=>s.id===parts.join(':'));
  title=journey.title+' · '+(step?.title||'Présentation');reference=step?.reference||'';sourceUrl=`/journeys/${category}/${id}`;
 }else if(category==='academy'){
  title=courses.find(c=>c.id===id)?.title||id;title+=` · Partie ${Number(parts.join(':').replace('lesson-',''))+1}`;
  reference=`Cours Masjid Sabirin · ${courses.find(c=>c.id===id)?.title||id}`;sourceUrl=`/academy?module=${id}`;
 }else{
  const invocation=allInvocations.find(i=>i.key===[id,...parts].join(':'));
  title=invocation?.title||invocation?.categoryName||'Sens d’une invocation';title+=` · ${entry.text.slice(0,48).trim()}…`;
  reference=invocation?.source||'';sourceUrl='/adhkar';
 }
 const info=await stat('public'+recorded.url);
 entries.push({id:entry.key,title,category,text:entry.text,sourceUrl,reference,url:recorded.url,duration:recorded.duration,bytes:info.size,sha256:recorded.sha256,narrator:'Kokoro · Siwis',sentences:recorded.sentences});
}
await writeFile('public/audio/library.json',JSON.stringify(entries));
console.log(`Bibliothèque : ${entries.length} narrations existantes indexées. Aucun crédit consommé.`);
