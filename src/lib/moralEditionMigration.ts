import {moralBookDestination,moralVolumes} from '../data/moralBookEditions';
import type {BookMemory} from '../stores/bookNotebookStore';
import type {BookReadingPoint} from './bookResume';
interface SavedLibrary {
 favorites?:string[];bookReading?:Record<string,string>;bookReadingUpdatedAt?:Record<string,number>;
 bookReadingPoints?:Record<string,BookReadingPoint>;
}
/** Restore independent destinations without changing notes or audio offsets. */
export function migrateMoralLibrary<T extends SavedLibrary>(state:T):T {
 const reading={...state.bookReading},dates={...state.bookReadingUpdatedAt},points={...state.bookReadingPoints};
 const favorites=new Set(state.favorites||[]);
 for(const volume of moralVolumes){
  const chapter=state.bookReading?.[volume.id];if(!chapter)continue;
  const target=moralBookDestination(volume.id,chapter);
  if(!target||target.bookId===volume.id)continue;
  const date=dates[volume.id]||0;
  if(!reading[target.bookId]||date>=(dates[target.bookId]||0)){
   reading[target.bookId]=target.chapterId;dates[target.bookId]=date;
   const point=points[volume.id];
   if(point)points[target.bookId]={...point,chapterId:target.chapterId,passageId:remapPassage(point.passageId,point.chapterId,target.chapterId),previousPassageId:point.previousPassageId?remapPassage(point.previousPassageId,point.chapterId,target.chapterId):undefined};
  }
  if(favorites.has(`book:${volume.id}`))favorites.add(`book:${target.bookId}`);
  // The moved chapter does not belong to this independent book. Do not redirect its cover forever.
  delete reading[volume.id];delete dates[volume.id];delete points[volume.id];
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
