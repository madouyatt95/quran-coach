import {build} from 'esbuild';
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';

// Preparation only: no keys, remote calls, approvals, generation or publishing.
const arg=key=>process.argv.find(a=>a.startsWith(`--${key}=`))?.slice(key.length+3);
const requested=arg('books')?.split(',').filter(Boolean);
if(!requested?.length||new Set(requested).size!==requested.length)throw Error('Indiquer une sélection de livres distincts avec --books.');
const ceiling=Number(arg('credit-ceiling')||130000);
if(!Number.isSafeInteger(ceiling)||ceiling<1||ceiling>130000)throw Error('Plafond invalide.');
const directory=resolve(arg('out')||'outputs/prophet-production');
const result=await build({stdin:{contents:"export {narrativeProductionBooks as books} from './src/data/narrativeBooks';export {chapterDrafts,bookMarkdown,bookNarrative,narrationLength} from './src/lib/narrativeBooks';",resolveDir:process.cwd(),loader:'ts'},bundle:true,write:false,platform:'node',format:'esm'});
const {books,chapterDrafts,bookMarkdown,bookNarrative,narrationLength}=await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
const selected=requested.map(id=>books.find(b=>b.id===id&&b.category==='prophet' && b.id.startsWith('prophete-')));
if(selected.some(b=>!b))throw Error('Chapitre de la collection Le Prophète inconnu.');
await mkdir(directory,{recursive:true});
const all=[],manifest=[];
for(const book of selected){
 const scripts=book.chapters.flatMap((chapter,i)=>chapterDrafts(book,chapter,false,i===book.chapters.length-1)).map(({id,approved_by,...draft})=>({...draft,rights:'Narration française originale de Quran Coach fondée sur les sources anciennes référencées ; aucune traduction moderne ni aucun article tiers reproduit. Relecture des textes et sources avant synthèse et publication.'}));
 const bytes=JSON.stringify(scripts,null,2)+'\n';await writeFile(resolve(directory,`${book.id}-scripts.json`),bytes);await writeFile(resolve(directory,`${book.id}.md`),bookMarkdown(book));
 all.push(...scripts);manifest.push({id:book.id,title:book.title,version:book.version,chapters:book.chapters.length,segments:scripts.length,characters:scripts.reduce((n,s)=>n+s.text.length,0),words:narrationLength(bookNarrative(book,true)).words,sha256:createHash('sha256').update(bytes).digest('hex')});
}
if(all.length>100)throw Error('Maximum 100 segments par fichier d’import.');
await writeFile(resolve(directory,'scripts.json'),JSON.stringify(all,null,2)+'\n');
await writeFile(resolve(directory,'manifest.json'),JSON.stringify({authorizedCreditCeiling:ceiling,paidOverageAllowed:false,generationStarted:false,books:manifest},null,2)+'\n');
console.log(JSON.stringify({books:manifest,segments:all.length,characters:all.reduce((n,s)=>n+s.text.length,0),paidCalls:0}));
