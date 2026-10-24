import {narratedChapterText,segmentNumber} from './bookLibrary';
import {narrationSentences} from './narrationText';
import type {LibraryAudio} from './audioProduction';
import type {NarrativeBook,NarrativeChapter} from './narrativeBooks';
export interface BookPassage {id:string;text:string;sources:string[];start:number;end:number;scene:number}
export function bookPassages(book:NarrativeBook,chapter:NarrativeChapter):BookPassage[]{
 let cursor=0;const text=narratedChapterText(book,chapter),result:BookPassage[]=[];
 for(const [sceneIndex,scene] of chapter.scenes.entries())for(const [index,p] of scene.paragraphs.entries()){
  const start=text.indexOf(p.text,cursor);if(start<0)continue;cursor=start+p.text.length;
  result.push({id:`${chapter.id}:${scene.id}:${index}`,text:p.text,sources:p.sources,start,end:cursor,scene:sceneIndex});
 }
 if(book.chapters.at(-1)?.id===chapter.id){const start=text.indexOf(book.epilogue.text,cursor);if(start>=0)result.push({id:`${chapter.id}:epilogue`,text:book.epilogue.text,sources:book.epilogue.sources,start,end:start+book.epilogue.text.length,scene:chapter.scenes.length});}
 return result;
}
export function bookAudioMarks(book:NarrativeBook,chapter:NarrativeChapter,recordings:LibraryAudio[]){
 const text=narratedChapterText(book,chapter);let cursor=0;
 return [...recordings].sort((a,b)=>segmentNumber(a)-segmentNumber(b)).flatMap(item=>{
  const partStart=text.indexOf(item.text,cursor);if(partStart<0)return [];cursor=partStart+item.text.length;
  let local=0;const sentences=narrationSentences(item.text).map(sentence=>{const start=item.text.indexOf(sentence,local);local=start+sentence.length;return {start,end:local};});
  return item.sentences.flatMap(mark=>{const sentence=sentences[mark.sentence];return sentence&&Number.isFinite(mark.start)&&mark.start>=0&&mark.end>=mark.start?[{item,seconds:mark.start,endSeconds:mark.end,start:partStart+sentence.start,end:partStart+sentence.end}]:[];});
 });
}
export function passageAtAudio(passages:BookPassage[],marks:ReturnType<typeof bookAudioMarks>,itemId:string,seconds:number){
 const mark=marks.filter(m=>m.item.id===itemId&&m.seconds<=seconds).at(-1);
 return mark?passages.find(p=>mark.start<p.end&&mark.end>p.start):undefined;
}
export function audioAtPassage(passage:BookPassage,marks:ReturnType<typeof bookAudioMarks>){
 return marks.find(mark=>mark.start<passage.end&&mark.end>passage.start);
}
/** A scene may have text without a recorded cue. Never fabricate a timestamp. */
export function bookSceneCues(book:NarrativeBook,chapter:NarrativeChapter,recordings:LibraryAudio[]){
 const passages=bookPassages(book,chapter),marks=bookAudioMarks(book,chapter,recordings);
 return chapter.scenes.map((scene,index)=>{const passage=passages.find(p=>p.scene===index);return {scene,index,passage,mark:passage?audioAtPassage(passage,marks):undefined};});
}
