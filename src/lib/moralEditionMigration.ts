import {moralBookDestination,moralVolumes} from '../data/moralBookEditions';
import type {BookMemory} from '../stores/bookNotebookStore';
import type {BookReadingPoint} from './bookResume';
interface SavedLibrary {
 favorites?:string[];bookReading?:Record<string,string>;bookReadingUpdatedAt?:Record<string,number>;
 bookReadingPoints?:Record<string,BookReadingPoint>;
}
/** Add canonical pointers without deleting the original notes, positions or bookmarks. */
export function migrateMoralLibrary<T extends SavedLibrary>(state:T):T {
 const reading={...state.bookReading},dates={...state.bookReadingUpdatedAt},points={...state.bookReadingPoints};
 const favorites=new Set(state.favorites||[]);
 for(const volume of moralVolumes){
  if(volume.members.some(id=>favorites.has(`book:${id}`)))favorites.add(`book:${volume.id}`);
  const latest=volume.members.filter(id=>state.bookReading?.[id]).sort((a,b)=>(state.bookReadingUpdatedAt?.[b]||0)-(state.bookReadingUpdatedAt?.[a]||0))[0];
  if(!latest)continue;
  const target=moralBookDestination(latest,state.bookReading![latest])!;
  reading[volume.id]=target.chapterId;dates[volume.id]=state.bookReadingUpdatedAt?.[latest]||0;
  const point=state.bookReadingPoints?.[latest];
  if(point)points[volume.id]={...point,chapterId:target.chapterId,passageId:remapPassage(point.passageId,point.chapterId,target.chapterId),previousPassageId:point.previousPassageId?remapPassage(point.previousPassageId,point.chapterId,target.chapterId):undefined};
 }
 return {...state,favorites:[...favorites],bookReading:reading,bookReadingUpdatedAt:dates,bookReadingPoints:points};
}
function remapPassage(id:string,oldChapter:string,newChapter:string){return id.startsWith(`${oldChapter}:`)?newChapter+id.slice(oldChapter.length):id;}
export function migrateMoralMemory(entry:BookMemory):BookMemory {
 const target=moralBookDestination(entry.bookId,entry.chapterId);
 if(!target||target.bookId===entry.bookId&&target.chapterId===entry.chapterId)return entry;
 // Keep the source edition and audio point: a new recording must not inherit an old timestamp.
 return {...entry,bookId:target.bookId,chapterId:target.chapterId,passageId:remapPassage(entry.passageId,entry.chapterId,target.chapterId)};
}
