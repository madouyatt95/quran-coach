import {build} from 'esbuild';
import {writeFile, mkdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const temp = '/tmp/qc-narration-catalog.mjs';
await build({stdin:{contents:`
export {getJourney} from './src/lib/editorialJourneys';
export {courseJourney} from './src/academy/courseExperience';
export {COURSE_LEVELS} from './src/academy/data/courseLibrary';
export {prophets} from './src/data/prophets';
export {stories} from './src/data/storiesData';
export {allInvocations} from './src/lib/adhkarExperience';
export {narrationKey,narrationSentences} from './src/lib/narrationText';
`,resolveDir:process.cwd(),loader:'ts'},jsx:'automatic',bundle:true,platform:'node',format:'esm',outfile:temp});
const {getJourney,courseJourney,COURSE_LEVELS,prophets,stories,allInvocations,narrationKey,narrationSentences} = await import(pathToFileURL(temp));
const entries = new Map();
function add(text, owner) {
 if (!text?.trim()) return;
 const key=narrationKey(text),old=entries.get(key);
 if(old && old.text!==text) throw new Error('Narration key collision');
 if(old) old.owners.push(owner);
 else entries.set(key,{key,text,sentences:narrationSentences(text),owners:[owner]});
}
for(const [kind,items] of [['prophet',prophets],['story',stories]]) for(const item of items) {
 for(const step of getJourney(kind,item.id).steps) if(step.kind==='narrative')add(step.text,`${kind}:${item.id}:${step.id}`);
 add(item.summary,`${kind}:${item.id}:summary`);
}
for(const invocation of allInvocations)add(invocation.translation,`invocation:${invocation.key}`);
for(const level of COURSE_LEVELS)for(const course of level.modules)for(const step of courseJourney(course.id).steps)add(step.text,`academy:${course.id}:${step.id}`);
await mkdir('/tmp/qc-narration-model',{recursive:true});
await writeFile('/tmp/qc-narration-model/catalog.json',JSON.stringify([...entries.values()],null,2));
await writeFile('/tmp/qc-narration-model/invocations.json',JSON.stringify(allInvocations));
console.log(JSON.stringify({entries:entries.size,characters:[...entries.values()].reduce((n,e)=>n+e.text.length,0),output:resolve('/tmp/qc-narration-model/catalog.json')}));
