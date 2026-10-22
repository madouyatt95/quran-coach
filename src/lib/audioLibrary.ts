import type {LibraryAudio} from './audioProduction';
import {sha256} from './audioProduction';
export const AUDIO_LIBRARY_CACHE='quran-coach-audio-library-v1';
export const AUDIO_API=(import.meta.env.VITE_AUDIO_PRODUCTION_URL||'').replace(/\/$/,'');
let catalogue:Promise<LibraryAudio[]>|undefined;
let published:Promise<LibraryAudio[]>|undefined;
export async function publishedNarration(text:string){
 if(!AUDIO_API)return null;
 published??=publicJson(`${AUDIO_API}/catalog`).catch(()=>{published=undefined;return [];});
 return (await published).find(item=>item.text===text)||null;
}
async function publicJson(url:string):Promise<LibraryAudio[]>{
 const cache=typeof caches!=='undefined'?await caches.open(AUDIO_LIBRARY_CACHE):null;
 try{const response=await fetch(url,{signal:AbortSignal.timeout(6000)});if(!response.ok)throw new Error();const data=await response.clone().json();if(!Array.isArray(data))throw new Error();await cache?.put(url,response);return data;}
 catch{const stored=await cache?.match(url);if(stored)return stored.json();throw new Error('La bibliothèque est indisponible. Réessayez avec une connexion.');}
}
export async function loadAudioLibrary(refresh=false){
 if(refresh)catalogue=undefined;
 return catalogue??=Promise.all([publicJson('/audio/library.json'),AUDIO_API?publicJson(`${AUDIO_API}/catalog`).catch(()=>[]):Promise.resolve([])]).then(([local,published])=>{
  const seen=new Set<string>();return [...published,...local].filter(i=>{if(seen.has(i.text))return false;seen.add(i.text);return true;});
 }).catch(e=>{catalogue=undefined;throw e;});
}
export async function downloadedAudioIds(items:LibraryAudio[]){
 if(typeof caches==='undefined')return [];
 const cache=await caches.open(AUDIO_LIBRARY_CACHE),keys=new Set((await cache.keys()).map(k=>k.url));
 return items.filter(i=>keys.has(new URL(i.url,location.origin).href)).map(i=>i.id);
}
export async function downloadLibraryAudio(item:LibraryAudio,signal:AbortSignal){
 if(typeof caches==='undefined')throw new Error('Téléchargement non disponible dans ce navigateur.');
 const cache=await caches.open(AUDIO_LIBRARY_CACHE);if(await cache.match(item.url))return;
 const space=await navigator.storage?.estimate?.();
 if(space?.quota&&space.usage!==undefined&&space.quota-space.usage<item.bytes*1.2)throw new Error('Espace insuffisant. Retirez un téléchargement.');
 const response=await fetch(item.url,{signal,mode:'cors'});if(!response.ok||response.status!==200)throw new Error('Téléchargement interrompu. Réessayez.');
 const bytes=await response.arrayBuffer();if(signal.aborted)throw new DOMException('Téléchargement annulé','AbortError');
 if(bytes.byteLength!==item.bytes||(item.sha256&&await sha256(bytes)!==item.sha256))throw new Error('Le fichier est incomplet. Aucun téléchargement conservé.');
 await cache.put(item.url,new Response(bytes,{headers:{'Content-Type':'audio/mpeg','Content-Length':String(bytes.byteLength)}}));
}
export async function removeLibraryDownload(item:LibraryAudio){await (await caches.open(AUDIO_LIBRARY_CACHE)).delete(item.url);}
export async function libraryAudioSource(item:LibraryAudio){
 if(typeof caches!=='undefined'){const cached=await (await caches.open(AUDIO_LIBRARY_CACHE)).match(item.url);if(cached)return URL.createObjectURL(await cached.blob());}
 return item.url;
}
export function audioSearch(text:string){return text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr');}
