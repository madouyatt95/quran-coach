import {describe,it,expect} from 'vitest';
import {latestContinuation,bookContinuations,type Continuation} from './homeContinuation';
import {books} from './bookLibrary';
const entry=(kind:Continuation['kind'],updatedAt:number):Continuation=>({kind,updatedAt,title:kind,detail:''});
describe('latest home activity',()=>{
 it('selects actual newest activity regardless of type',()=>{expect(latestContinuation([entry('reading',100),entry('course',500),entry('book',300)],1000)?.kind).toBe('course');});
 it('ignores invalid and implausibly future dates',()=>{expect(latestContinuation([entry('book',NaN),entry('course',0),entry('listening',Infinity),entry('memorizing',1000000)],1000)).toBeUndefined();});
 it('retains exact written passage and never estimates an unknown duration',()=>{
  const book=books.find(b=>b.id==='adam')!,chapter=book.chapters[0].id;
  const values=bookContinuations({bookReading:{adam:chapter},bookReadingUpdatedAt:{adam:100},positions:{},bookReadingPoints:{adam:{chapterId:chapter,passageId:'names:scene:3',version:book.version,updatedAt:200}}},[]);
  expect(values).toHaveLength(1);expect(values[0].href).toContain('passage=names%3Ascene%3A3');expect(values[0].updatedAt).toBe(200);expect(values[0].remaining).toBeUndefined();
 });
 it('excludes obsolete books and invalid chapters',()=>{expect(bookContinuations({bookReading:{adam:'removed',removed:'x'},bookReadingUpdatedAt:{adam:999,removed:999},positions:{}},[])).toEqual([]);});
});
