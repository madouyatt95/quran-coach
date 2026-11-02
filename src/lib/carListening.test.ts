import {expect,it} from 'vitest';
import {carListeningTrack,carListeningResume,safeCarAudioUrl,readCarListeningReference} from './carListening';
import {collectionItems} from './listening';
import type {PlaylistItem} from '../types';

const item:PlaylistItem={surahNumber:2,surahName:'Al-Baqarah',surahNameAr:'',totalAyahs:286,reciterId:'123',reciterName:'Alafasy',audioUrl:'https://server8.mp3quran.net/afs/002.mp3',playbackType:'surah'};
it('uses the same approved complete recording as Écoute and returns to that screen',()=>{
 const track=carListeningTrack(item)!;
 expect(track.url).toBe(item.audioUrl);expect(track.path).toBe('/listen/123?surah=2');expect(track.listening.surahNumber).toBe(2);
 expect(carListeningTrack({...item,audioUrl:'https://server8.mp3quran.net/afs/002.mp3?edition=2'})?.id).not.toBe(track.id);
 expect(carListeningTrack({...item,audioUrl:'https://cdn.mp3quran.net/audio/mishary-alafasy/r1/002.mp3'})?.listening.audioUrl).toBe('https://cdn.mp3quran.net/audio/mishary-alafasy/r1/002.mp3');
});
it('allows the two existing custom collections without widening access to arbitrary hosts',()=>{
 for(const id of ['omar-hisham','hudhayfi-leclerc']){
  const tracks=collectionItems(id,[],[]);expect(tracks.length).toBeGreaterThan(4);expect(tracks.every(t=>carListeningTrack(t))).toBe(true);
 }
 for(const url of ['http://server8.mp3quran.net/afs/002.mp3','https://server8.mp3quran.net.evil.example/002.mp3','https://evilserver8.mp3quran.net/002.mp3','https://user:password@server8.mp3quran.net/002.mp3','https://server8.mp3quran.net:444/002.mp3','https://archive.org/download/unrelated/001.mp3','file:///private/audio.mp3','javascript:alert(1)'])expect(safeCarAudioUrl(url)).toBeNull();
});
it('keeps the exact decimal position and continuing queue when resuming a phone listening session',()=>{
 const playlist=[{...item,surahNumber:1,audioUrl:'https://server8.mp3quran.net/afs/001.mp3'},item,{...item,surahNumber:3,audioUrl:'https://server8.mp3quran.net/afs/003.mp3'}];
 const resume=carListeningResume({...item,audioUrl:item.audioUrl!,reciterId:'123',reciterName:'Alafasy',position:467.25,playlist,playlistIndex:1,updatedAt:1234})!;
 expect(resume.index).toBe(1);expect(resume.position).toBe(467.25);expect(resume.tracks[resume.index].url).toBe(item.audioUrl);expect(resume.tracks.at(-1)?.listening.surahNumber).toBe(3);
});
it('keeps a late current item in a bounded queue instead of dropping resumes after track 500',()=>{
 const playlist=Array.from({length:700},(_,i)=>({...item,audioUrl:`https://cdn.islamic.network/test/${i}.mp3`}));
 const resume=carListeningResume({...item,audioUrl:playlist[610].audioUrl,reciterId:'123',reciterName:'Alafasy',position:31,playlist,playlistIndex:610})!;
 expect(resume.tracks.length).toBeLessThanOrEqual(500);expect(resume.tracks[resume.index].url).toBe(playlist[610].audioUrl);expect(resume.tracks[resume.index+1].url).toBe(playlist[611].audioUrl);
});
it('keeps a standalone bookmark at its saved moment and rejects an unmatched or unsafe source',()=>{
 expect(carListeningResume({...item,audioUrl:item.audioUrl!,reciterId:'123',reciterName:'Alafasy',position:15.5})?.position).toBe(15.5);
 expect(carListeningResume({...item,audioUrl:'https://evil.example/002.mp3',reciterId:'123',reciterName:'Alafasy',position:0})).toBeNull();
 expect(carListeningTrack({...item,surahNumber:115})).toBeNull();
});
it('preserves verse identities for existing interactive listening journeys',()=>{
 const verse={number:17,globalNumber:24,text:'',translation:''};
 const track=carListeningTrack({...item,verse})!;
 expect(track.path).toBe('/listen/experience?surah=2&from=17&voice=123');expect(readCarListeningReference(track.listening)?.verse).toEqual(verse);
 expect(readCarListeningReference({...track.listening,audioUrl:'https://evil.example/002.mp3'})).toBeUndefined();
});
