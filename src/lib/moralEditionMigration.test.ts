import {expect,it} from 'vitest';
import {migrateMoralLibrary,migrateMoralMemory} from './moralEditionMigration';
import {moralBookDestination,moralVolumes,moralMemberChapters,moralChapterId} from '../data/moralBookEditions';
import {narrativeBooks} from '../data/narrativeBooks';
import {books,bookForAudio,isSupersededBookAudio} from './bookLibrary';
import type {BookMemory} from '../stores/bookNotebookStore';
it('restores all thirteen independent books and their 41 original chapters',()=>{
 const ids=Object.keys(moralMemberChapters);
 expect(ids).toHaveLength(13);
 const restored=ids.map(id=>narrativeBooks.find(b=>b.id===id)!);
 expect(restored.reduce((sum,b)=>sum+b.chapters.length,0)).toBe(41);
 for(const book of restored){expect(book.chapters.map(c=>c.id)).toEqual(moralMemberChapters[book.id]);expect(book.version).not.toContain('-long-');}
 for(const volume of moralVolumes)for(const member of volume.members)for(const chapter of moralMemberChapters[member]){
  expect(moralBookDestination(volume.id,moralChapterId(member,chapter))).toEqual({bookId:member,chapterId:chapter});
 }
});
it('keeps long edition audios archived without showing duplicate books or using mismatched recordings',()=>{
 for(const volume of moralVolumes){const b=books.find(b=>b.id===volume.id)!;
  const old={title:`${b.title} · 1. Chapitre`,reference:`Manuscrit ${b.id}-long-2026-10-29-v2, chapitre ${b.chapters[0].id}, segment 1/1`};
  expect(bookForAudio(old)).toBeUndefined();expect(isSupersededBookAudio(old)).toBe(true);
  expect(bookForAudio({...old,reference:old.reference.replace(`${b.id}-long-2026-10-29-v2`,b.version)})?.id).toBe(b.id);
 }
});
it('restores a combined reading to its original book, preserving notes, favorites and audio offsets',()=>{
 const point={chapterId:'mosquee-apprentissage',passageId:'mosquee-apprentissage:mosquee-1:0',version:'aimer-sans-paraitre-long-2026-10-29-v2',updatedAt:200};
 const state={favorites:['book:aimer-sans-paraitre'],bookReading:{'aimer-sans-paraitre':'mosquee-apprentissage','force-de-douceur':'priere'},bookReadingUpdatedAt:{'aimer-sans-paraitre':200,'force-de-douceur':100},bookReadingPoints:{'aimer-sans-paraitre':point} as Record<string,typeof point>,bookNotes:{'aimer-sans-paraitre':'Ma note'},positions:{old:{seconds:25,updatedAt:200}}};
 const result=migrateMoralLibrary(state);
 expect(result.bookReading['force-de-douceur']).toBe('mosquee');expect(result.bookReading['aimer-sans-paraitre']).toBeUndefined();expect(result.favorites).toContain('book:force-de-douceur');
 expect(result.bookReadingPoints['force-de-douceur']).toMatchObject({chapterId:'mosquee',passageId:'mosquee:mosquee-1:0',version:point.version});
 expect(result.bookNotes).toEqual(state.bookNotes);expect(result.positions).toEqual(state.positions);
 expect(state.bookReading['aimer-sans-paraitre']).toBe('mosquee-apprentissage');expect(migrateMoralLibrary(result)).toEqual(result);
});
it('does not replace a newer independent reading with an older combined one',()=>{
 const state={bookReading:{'aimer-sans-paraitre':'mosquee-apprentissage','force-de-douceur':'priere'},bookReadingUpdatedAt:{'aimer-sans-paraitre':100,'force-de-douceur':200}};
 expect(migrateMoralLibrary(state).bookReading['force-de-douceur']).toBe('priere');
});
it('restores a notebook destination without changing its quote or claiming an exact new audio position',()=>{
 const entry:BookMemory={id:'unique',bookId:'aimer-sans-paraitre',chapterId:'visite-malade',passageId:'visite-malade:scene:2',version:'ancienne',text:'Texte conservé',note:'Ma réflexion',audioId:'old',seconds:37,sources:['source'],createdAt:1};
 expect(migrateMoralMemory(entry)).toEqual({...entry,bookId:'ceux-que-lon-ne-voyait-pas',chapterId:'visite',passageId:'visite:scene:2'});
 expect(migrateMoralMemory(migrateMoralMemory(entry))).toEqual(migrateMoralMemory(entry));
});
