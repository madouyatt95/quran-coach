import {build} from 'esbuild';
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';

// Preparation only: no credentials, API calls, approvals, publication or synthesis.
const outArg=process.argv.find(x=>x.startsWith('--out='));
const directory=resolve(outArg?.slice(6)||'outputs/companions-production');
const rateArg=process.argv.find(x=>x.startsWith('--verified-rate='));
const rate=rateArg?Number(rateArg.split('=')[1]):null;
if(rate!==null&&(!Number.isFinite(rate)||rate<.1||rate>10))throw Error('Tarif vérifié invalide.');
const result=await build({stdin:{contents:"export {narrativeProductionBooks as narrativeBooks} from './src/data/narrativeBooks';export {chapterDrafts,bookMarkdown,bookNarrative,narrationLength} from './src/lib/narrativeBooks';",resolveDir:process.cwd(),loader:'ts'},bundle:true,write:false,platform:'node',format:'esm'});
const {narrativeBooks,chapterDrafts,bookMarkdown,bookNarrative,narrationLength}=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
await mkdir(directory,{recursive:true});
const plan=[];
for(const book of narrativeBooks.filter(b=>b.collection==='companions')){
 const drafts=book.chapters.flatMap((chapter,index)=>chapterDrafts(book,chapter,false,index===book.chapters.length-1));
 const scripts=drafts.map(({id,approved_by,...script})=>({...script,rights:'Narration française originale de Quran Coach, adaptée des textes anciens arabes référencés. Aucun article de Sirayassira ni traduction moderne n’est reproduit. Relecture éditoriale requise avant synthèse et redistribution.'}));
 const lengths=scripts.map(s=>s.text.length),chars=lengths.reduce((n,x)=>n+x,0);
 const estimate=rate===null?null:lengths.reduce((n,x)=>n+Math.ceil(x*rate),0);
 const reserve=rate===null?null:lengths.reduce((n,x)=>n+Math.ceil(Math.ceil(x*rate)*1.15),0);
 const file=`${book.id}-scripts.json`,checksum=createHash('sha256').update(JSON.stringify(scripts)).digest('hex');
 await writeFile(resolve(directory,file),JSON.stringify(scripts,null,2)+'\n');
 await writeFile(resolve(directory,`${book.id}.md`),bookMarkdown(book));
 plan.push({id:book.id,title:book.title,version:book.version,chapters:book.chapters.length,segments:scripts.length,words:narrationLength(bookNarrative(book,true)).words,characters:chars,estimate,reserve,scripts:file,sha256:checksum,sources:book.sources.map(s=>s.type!=='quran'?s.url:`https://quran.com/${s.surah}/${s.first}-${s.last}`)});
}
const manifest={schema:1,collection:'companions',authorizedCreditCeiling:100000,paidOverageAllowed:false,automaticAccountSwitching:false,rate,rateStatus:rate===null?'À vérifier sur le nouveau compte avant devis':'Tarif fourni par l’opérateur, à confirmer avec le devis serveur',generationStarted:false,books:plan,totalCharacters:plan.reduce((n,b)=>n+b.characters,0),totalEstimate:rate===null?null:plan.reduce((n,b)=>n+b.estimate,0),totalReserve:rate===null?null:plan.reduce((n,b)=>n+b.reserve,0),requirements:['Compte ElevenLabs identifié, éligible et raccordé par secret serveur.','Quota fournisseur, dépassements désactivés et budget cumulé à vérifier.','Scripts relus et devis atomique approuvé dans le studio.','Aucune reprise automatique d’un appel facturé ambigu.','Publication des éditions complètes après les contrôles de production, sans fausse attestation d’écoute.']};
await writeFile(resolve(directory,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({directory,books:plan.length,segments:plan.reduce((n,b)=>n+b.segments,0),characters:manifest.totalCharacters,estimate:manifest.totalEstimate,reserve:manifest.totalReserve,paidCalls:0}));
