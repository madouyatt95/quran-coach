// Read-only verification. No TTS call, credit use, publication or deletion.
// Usage: node scripts/audit-siwis-replacements.mjs /path/to/published-catalog.json [--media]
import {build} from 'esbuild';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const path=process.argv[2];if(!path)throw new Error('Indiquez le fichier du catalogue public à contrôler.');
const directory=await mkdtemp(join(tmpdir(),'qc-siwis-audit-'));
try {
 const model=join(directory,'model.mjs');
 await build({stdin:{contents:"export {books,recordingsForBook} from './src/lib/bookLibrary';export {chapterDrafts} from './src/lib/narrativeBooks';export {narrativeBooks} from './src/data/narrativeBooks';",resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:model});
 const {books,recordingsForBook,chapterDrafts,narrativeBooks}=await import(pathToFileURL(model));
 const registry=JSON.parse(await readFile('src/data/retiredSiwis.json','utf8')),catalogue=JSON.parse(await readFile(resolve(path),'utf8')).filter(item=>/George/.test(item.narrator));
 const reports=[],media=new Map();
 for(const id of new Set(Object.values(registry).map(r=>r.bookId))){
  const book=books.find(b=>b.id===id),manuscript=narrativeBooks.find(b=>b.id===id);if(!book||!manuscript)throw new Error(`Livre absent : ${id}`);
  const recordings=recordingsForBook(catalogue,book),expected=manuscript.chapters.flatMap((chapter,index)=>chapterDrafts(manuscript,chapter,false,index===manuscript.chapters.length-1));
  const missing=[];
  for(const script of expected){const item=recordings.find(r=>r.text===script.text&&r.reference===script.reference);if(item)media.set(item.id,item);else missing.push(script.title);}
  reports.push({bookId:id,expected:expected.length,missing});
 }
 let failures=[];
 if(process.argv.includes('--media')){
  const entries=[...media.values()];let cursor=0;
  await Promise.all(Array.from({length:4},async()=>{while(cursor<entries.length){const item=entries[cursor++];try{const url=new URL(item.url);if(url.protocol!=='https:'||url.hostname!=='quran-coach-audio.madouyatt95.workers.dev')throw new Error('Domaine inattendu');const response=await fetch(url,{method:'HEAD',signal:AbortSignal.timeout(15000)});if(!response.ok||Number(response.headers.get('content-length'))!==item.bytes||!response.headers.get('content-type')?.includes('audio'))throw new Error(`HTTP ${response.status}, taille ou type incorrect`);}catch(error){failures.push({id:item.id,error:error.message});}}}));
 }
 console.log(JSON.stringify({checkedAt:new Date().toISOString(),retiredNarrations:Object.keys(registry).length,books:reports,georgeRecordings:media.size,mediaChecked:process.argv.includes('--media'),mediaFailures:failures},null,2));
 if(failures.length||reports.some(r=>r.missing.length))process.exitCode=1;
} finally {await rm(directory,{recursive:true,force:true});}
