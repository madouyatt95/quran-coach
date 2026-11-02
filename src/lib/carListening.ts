import type {PlaylistItem} from '../types';
import type {LastListened} from '../stores/listenStore';
import {reciterKey} from './listening';

export interface CarListeningReference {surahNumber:number;surahName:string;reciterId:string;reciterName:string;audioUrl:string;totalAyahs:number;verse?:PlaylistItem['verse']}
export interface CarListeningTrack {id:string;title:string;artist:string;url:string;duration:number;path:string;chapter:string;listening:CarListeningReference}
export function safeCarAudioUrl(raw:unknown):string|null {
 if(typeof raw!=='string')return null;
 try{const u=new URL(raw);if(u.protocol!=='https:'||u.username||u.password||u.port)return null;
 const host=u.hostname.toLowerCase();
 if(['www.quran-coach.fr','quran-coach-audio.madouyatt95.workers.dev','cdn.islamic.network'].includes(host))return u.href;
 if(/^server\d+\.mp3quran\.net$/.test(host)&&/\.mp3$/i.test(u.pathname))return u.href;
 if(host==='cdn.mp3quran.net'&&/^\/audio\/[a-zA-Z0-9_-]+\/r\d+\/\d{3}\.mp3$/.test(u.pathname))return u.href;
 if(host==='archive.org'&&/^\/download\/(Coran_Arabe_Franais_HoudeyfaInconnu|omar-hisham-al-arabi)\/\d{3}\.mp3$/.test(u.pathname))return u.href;
 }catch{/* Invalid catalogue URL. */}return null;
}
export function carListeningTrack(item:PlaylistItem):CarListeningTrack|null {
 const url=safeCarAudioUrl(item.audioUrl);if(!url||!Number.isInteger(item.surahNumber)||item.surahNumber<1||item.surahNumber>114)return null;
 const id=reciterKey(item.reciterId||''),verse=item.verse;
 const listening:CarListeningReference={surahNumber:item.surahNumber,surahName:item.surahName,reciterId:id,reciterName:item.reciterName||'Quran Coach',audioUrl:url,totalAyahs:item.totalAyahs,...(verse?{verse}:{})};
 // A URL differentiates two editions of the same reciter and surah.
 let hash=2166136261;for(const c of url)hash=Math.imul(hash^c.charCodeAt(0),16777619);
 const path=verse?`/listen/experience?surah=${item.surahNumber}&from=${verse.number}&voice=${encodeURIComponent(id)}`:`/listen/${encodeURIComponent(id)}?surah=${item.surahNumber}`;
 return {id:`listen:${id}:${item.surahNumber}:${(hash>>>0).toString(36)}`,title:verse?`${item.surahName} · ${item.surahNumber}:${verse.number}`:item.surahName,artist:listening.reciterName,url,duration:0,path,chapter:String(item.surahNumber),listening};
}
export function carListeningResume(last:LastListened|null){
 if(!last)return null;
 const source=last.playlist?.length?last.playlist:[{...last,reciterId:String(last.reciterId),surahNameAr:'',totalAyahs:0,playbackType:last.verse?'ayah':'surah'} satisfies PlaylistItem];
 const preferred=last.playlistIndex??-1;
 const selected=source[preferred]?.audioUrl===last.audioUrl?preferred:source.findIndex(t=>t.audioUrl===last.audioUrl);
 if(selected<0)return null;
 const start=Math.max(0,selected-1),window=source.slice(start,start+500);
 const tracks=window.flatMap(item=>{const track=carListeningTrack(item);return track?[track]:[];});
 const index=tracks.findIndex(t=>t.url===last.audioUrl);if(index<0)return null;
 return {tracks,index,position:Number.isFinite(last.position)?Math.max(0,last.position):0,updatedAt:last.updatedAt||0};
}
export function readCarListeningReference(value:unknown):CarListeningReference|undefined {
 if(!value||typeof value!=='object')return;
 const v=value as Record<string,unknown>,url=safeCarAudioUrl(v.audioUrl),n=Number(v.surahNumber);
 if(!url||!Number.isInteger(n)||n<1||n>114||typeof v.reciterId!=='string'||!/^[a-zA-Z0-9_.-]{1,80}$/.test(v.reciterId))return;
 const raw=v.verse as Record<string,unknown>|undefined;
 const verse=raw&&Number.isInteger(raw.number)&&Number(raw.number)>0&&Number.isInteger(raw.globalNumber)&&Number(raw.globalNumber)>0&&typeof raw.text==='string'&&typeof raw.translation==='string'?{number:Number(raw.number),globalNumber:Number(raw.globalNumber),text:raw.text,translation:raw.translation}:undefined;
 return {surahNumber:n,surahName:typeof v.surahName==='string'?v.surahName.slice(0,120):`Sourate ${n}`,reciterId:v.reciterId,reciterName:typeof v.reciterName==='string'?v.reciterName.slice(0,120):'Quran Coach',audioUrl:url,totalAyahs:Number.isFinite(v.totalAyahs)?Number(v.totalAyahs):0,...(verse?{verse}:{})};
}
