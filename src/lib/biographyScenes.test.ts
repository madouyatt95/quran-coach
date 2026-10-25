import {expect,it} from 'vitest';
import {newCompanionBiographies} from '../data/narrativeBooks';
import {chapterNarrative,chapterDrafts} from './narrativeBooks';
import {bookPassages,bookSceneCues} from './bookPassages';
import {bookForAudio,activeBookScene} from './bookLibrary';
import {narrationSentences} from './narrationText';
import type {LibraryAudio} from './audioProduction';
it('keeps 300 stable paragraph identities across 180 scenes and resolves every scene to a real supplied cue',()=>{
 let scenes=0,paragraphs=0,reused=0;
 for(const book of newCompanionBiographies)for(const chapter of book.chapters){
  expect(chapter.scenes).toHaveLength(3);scenes+=chapter.scenes.length;
  const ps=chapter.scenes.flatMap(s=>s.paragraphs);expect(ps).toHaveLength(5);paragraphs+=ps.length;
  expect(ps.map(p=>p.id)).toEqual(Array.from({length:5},(_,i)=>`${chapter.id}:${chapter.id}-1:${i}`));
  expect(new Set(bookPassages(book,chapter).map(p=>p.id)).size).toBe(bookPassages(book,chapter).length);
  const parts=chapterDrafts(book,chapter,false,chapter===book.chapters.at(-1));
  const audio=parts.map((p,i)=>({...p,id:`audio:${i}`,duration:10000,sentences:narrationSentences(p.text).map((_,sentence)=>({sentence,start:sentence*7,end:sentence*7+6}))} as unknown as LibraryAudio));
  for(const cue of bookSceneCues(book,chapter,audio)){
   expect(cue.mark).toBeDefined();expect(activeBookScene(book,chapter,cue.mark!.item,cue.mark!.seconds+.1)).toBe(cue.index);
  }
  if(chapter.audioVersion){reused++;expect(bookForAudio(audio[0])?.id).toBe(book.id);}
  else expect(bookForAudio({...audio[0],reference:audio[0].reference.replace('-v2,','-v1,')})).toBeUndefined();
 }
 expect(scenes).toBe(180);expect(paragraphs).toBe(300);expect(reused).toBe(24);
});
it('keeps material historical uncertainty spoken while moving method details to notes',()=>{
 const nusayba=newCompanionBiographies.find(b=>b.id==='nusayba-presence')!;
 expect(chapterNarrative(nusayba.chapters.find(c=>c.id==='parole')!)).toContain('rattachement personnel de cette parole à Nusayba reste donc discuté');
 expect(chapterNarrative(nusayba.chapters.find(c=>c.id==='uhud')!)).toContain('narrateurs discutés');
 const jafar=newCompanionBiographies.find(b=>b.id==='jafar-deux-rivages')!;
 expect(chapterNarrative(jafar.chapters[0])).not.toContain('journal de leur jeunesse');
 expect(jafar.chapters[0].scenes[0].studyNote).toContain('journal de leur jeunesse');
});
