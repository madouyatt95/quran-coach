import type {LibraryAudio} from './audioProduction';
export interface BookReturnPoint {
 key:string;bookId:string;title:string;chapterId:string;passageId:string;view:'read'|'listen';immersive:boolean;
 audio?:{item:LibraryAudio;queue:LibraryAudio[];seconds:number;playing:boolean};
}
// Deliberately session-only: a reload or a shared link must never start an old listening session.
const points=new Map<string,BookReturnPoint>();
export const bookExcursions={
 remember(point:BookReturnPoint){points.delete(point.key);points.set(point.key,point);while(points.size>8)points.delete(points.keys().next().value!);},
 get(key:unknown){return typeof key==='string'?points.get(key):undefined;},
 take(key:string){const point=points.get(key);points.delete(key);return point;},
 clear(){points.clear();},
};
