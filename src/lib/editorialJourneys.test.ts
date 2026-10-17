import { describe,it,expect } from 'vitest';
import { getJourney,referenceVerses,narrativeSentences,LIFE_THEMES } from './editorialJourneys';
import {chapterBooks} from '../data/storyChapters';
import { prophets } from '../data/prophets';
import { stories } from '../data/storiesData';
import { additionalStories,prophetEpisodes } from '../data/editorialExpansion';
import { prophetRelations } from '../data/prophetRelations';
import chapters from './interactiveMushaf/chapters.json';
const normalize=(s:string)=>s.replace(/\s+/g,' ').trim();
describe('Editorial content integrity',()=>{
 it('has 50 distinct stories including 10 new sourced entries and 15 additional prophet episodes',()=>{
 expect(stories).toHaveLength(50);expect(new Set(stories.map(s=>s.id)).size).toBe(50);expect(additionalStories).toHaveLength(10);expect(Object.values(prophetEpisodes).flat()).toHaveLength(15);
 for(const story of additionalStories){expect(story.summary.length).toBeGreaterThan(250);expect(story.sourceRefs?.every(ref=>referenceVerses(ref).length>0)).toBe(true);}
 });
 it('keeps the original narrative and produces unique valid steps for every story and prophet',()=>{
 for(const [kind,items] of [['prophet',prophets],['story',stories]] as const)for(const item of items){
 const j=getJourney(kind,item.id)!;expect(j).not.toBeNull();expect(j.steps.at(-1)?.kind).toBe('reflection');expect(new Set(j.steps.map(s=>s.id)).size).toBe(j.steps.length);
 expect(normalize(j.steps.filter(s=>s.id.startsWith('story-')||s.id.startsWith('chapter-')).map(s=>s.text).join(' '))).toBe(normalize(item.summary));
 for(const step of j.steps.filter(s=>s.kind==='verse')){expect(step.ayah).toBeGreaterThan(0);expect(step.ayah).toBeLessThanOrEqual(chapters[step.surah!-1].count);}
 }
 });
 it('includes the complete cited ranges and source episode texts',()=>{
 for(const [id,episodes] of Object.entries(prophetEpisodes)){const j=getJourney('prophet',id)!;if(chapterBooks[`prophet:${id}`])continue;for(const e of episodes){expect(j.steps.find(s=>s.id===`extra-${e.id}`)?.text).toBe(e.text);for(const v of referenceVerses(e.reference))expect(j.steps.some(s=>s.surah===v.surah&&s.ayah===v.ayah)).toBe(true);}}
 });
 it('resolves every curated theme and sourced relationship',()=>{
 for(const theme of LIFE_THEMES)for(const id of theme.stories)expect(stories.some(s=>s.id===id),id).toBe(true);
 for(const r of prophetRelations){expect(prophets.some(p=>p.id===r.source)).toBe(true);expect(prophets.some(p=>p.id===r.target)).toBe(true);expect(referenceVerses(r.reference).length).toBeGreaterThan(0);}
 });
 it('rejects invalid references and unknown routes',()=>{for(const ref of ['115:1','0:1','2:287','2:0','2:3-2','missing'])expect(referenceVerses(ref)).toEqual([]);expect(referenceVerses('2:1-3')).toHaveLength(3);expect(getJourney('story','unknown')).toBeNull();expect(getJourney('invalid','adam')).toBeNull();});
 it('keeps narration punctuation and trailing sentences',()=>{for(const text of ['Une phrase. Puis une autre ! Une fin','Le récit ? Oui.','Une phrase sans point'])expect(normalize(narrativeSentences(text).join(' '))).toBe(normalize(text));});
});
