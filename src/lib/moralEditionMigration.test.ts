import {expect,it} from 'vitest';
import {migrateMoralLibrary,migrateMoralMemory} from './moralEditionMigration';
import {moralBookDestination,moralVolumes,moralMemberChapters} from '../data/moralBookEditions';
import {narrativeBooks} from '../data/narrativeBooks';
import {books,bookForAudio,chapterForAudio} from './bookLibrary';
import {bookNarrative,narrationLength} from './narrativeBooks';
import type {BookMemory} from '../stores/bookNotebookStore';
it('keeps all 41 subjects once in five long volumes, without the retired books',()=>{
 const volumes=moralVolumes.map(v=>narrativeBooks.find(b=>b.id===v.id)!);
 expect(volumes.reduce((sum,b)=>sum+b.chapters.length,0)).toBe(41);
 for(const volume of moralVolumes){
  const book=volumes.find(b=>b.id===volume.id)!;
  expect(narrationLength(bookNarrative(book,true)).words).toBeGreaterThan(3000);
  const targets=volume.members.flatMap(id=>moralMemberChapters[id].map(ch=>moralBookDestination(id,ch)!.chapterId));
  expect(book.chapters.map(c=>c.id)).toEqual(targets);expect(new Set(targets).size).toBe(targets.length);
  for(const id of volume.members.filter(id=>id!==volume.id))expect(books.some(b=>b.id===id)).toBe(false);
 }
});
it('maps only the exact reused editions, accepting the former title',()=>{
 const reused=books.filter(b=>moralVolumes.some(v=>v.id===b.id)).flatMap(b=>b.chapters.filter(c=>c.audioTitle).map(c=>({b,c})));
 expect(reused).toHaveLength(14);
 for(const {b,c} of reused){
  const item={title:`${c.audioTitle} · Ancien numéro`,reference:`Manuscrit ${c.audioVersion}, chapitre ${c.id}, segment 1/1`};
  expect(bookForAudio(item)?.id).toBe(b.id);expect(chapterForAudio(item)).toBe(b.chapters.indexOf(c));
  expect(bookForAudio({...item,title:'Un autre livre · Ancien numéro'})).toBeUndefined();
  expect(bookForAudio({...item,reference:item.reference.replace('Manuscrit ','Manuscrit obsolete-')})).toBeUndefined();
 }
});
it('preserves source data and selects the most recent reading within a merged volume',()=>{
 const state={favorites:['book:force-de-douceur'],bookReading:{'aimer-sans-paraitre':'uways','force-de-douceur':'mosquee'},bookReadingUpdatedAt:{'aimer-sans-paraitre':100,'force-de-douceur':200},bookNotes:{'force-de-douceur':'Ma note'},positions:{old:{seconds:25,updatedAt:200}}};
 const result=migrateMoralLibrary(state);
 expect(result.bookReading['aimer-sans-paraitre']).toBe('mosquee-apprentissage');expect(result.favorites).toContain('book:aimer-sans-paraitre');
 expect(result.bookNotes).toEqual(state.bookNotes);expect(result.positions).toEqual(state.positions);expect(state.bookReading['aimer-sans-paraitre']).toBe('uways');
 expect(migrateMoralLibrary(result)).toEqual(result);
});
it('preserves the personal quote, note and original audio offset when relocating a bookmark',()=>{
 const entry:BookMemory={id:'unique',bookId:'ceux-que-lon-ne-voyait-pas',chapterId:'visite',passageId:'visite:scene:2',version:'ancienne',text:'Texte conservé',note:'Ma réflexion',audioId:'old',seconds:37,sources:['source'],createdAt:1};
 expect(migrateMoralMemory(entry)).toEqual({...entry,bookId:'aimer-sans-paraitre',chapterId:'visite-malade',passageId:'visite-malade:scene:2'});
 expect(migrateMoralMemory(migrateMoralMemory(entry))).toEqual(migrateMoralMemory(entry));
});
