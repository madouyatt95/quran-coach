import {build} from 'esbuild';
import {writeFile} from 'node:fs/promises';
const output=await build({stdin:{contents:"export {narrativeBooks} from './src/data/narrativeBooks';export {bookNarrative,narrationLength} from './src/lib/narrativeBooks';",resolveDir:process.cwd(),loader:'ts'},bundle:true,write:false,platform:'node',format:'esm'});
const {narrativeBooks,bookNarrative,narrationLength}=await import(`data:text/javascript;base64,${Buffer.from(output.outputFiles[0].text).toString('base64')}`);
// Public navigation metadata only; manuscripts remain in a lazy reader chunk.
await writeFile('src/data/bookCatalog.json',JSON.stringify(narrativeBooks.map(b=>({id:b.id,title:b.title,subtitle:b.subtitle,version:b.version,category:b.category,scope:b.scope||null,length:narrationLength(bookNarrative(b,true)),...(b.collection?{collection:b.collection,companionIds:b.companionIds||[]}:{}),chapters:b.chapters.map(c=>({id:c.id,title:c.title,...(c.audioVersion?{audioVersion:c.audioVersion}:{})}))})),null,2)+'\n');
