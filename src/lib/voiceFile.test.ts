import { describe, it, expect } from 'vitest';
import { voiceExcerpt, voiceFileError } from './voiceFile';
import { rememberVoicePassage, validVoicePassage } from './voiceHistory';
describe('local file excerpts', () => {
 it('rejects empty, excessive and unrelated files', () => {
  expect(voiceFileError({size:0,type:'audio/mp3',name:'test.mp3'})).toBeTruthy();
  expect(voiceFileError({size:41*1024*1024,type:'video/mp4',name:'test.mp4'})).toBeTruthy();
  expect(voiceFileError({size:42,type:'text/plain',name:'test.txt'})).toBeTruthy();
  expect(voiceFileError({size:42,type:'',name:'test.M4A'})).toBeNull();
 });
 it('crops and downmixes stereo at exactly 16kHz', () => {
  const a = new Float32Array(48000*3).fill(.75), b = new Float32Array(48000*3).fill(.25);
  a.fill(0,0,48000); b.fill(0,0,48000);
  const buffer = {duration:3,sampleRate:48000,numberOfChannels:2,getChannelData:(n:number)=>n ? b : a} as AudioBuffer;
  const clip = voiceExcerpt(buffer,1,2); expect(clip).toHaveLength(16000); expect(clip[0]).toBe(.5); expect(clip.at(-1)).toBe(.5);
  expect(()=>voiceExcerpt(buffer,-1,2)).toThrow(); expect(()=>voiceExcerpt(buffer,1,4)).toThrow();
 });
});
describe('identified passages', () => {
 it('rejects impossible verses and deduplicates recent history', () => {
  expect(validVoicePassage({surah:114,ayah:7})).toBe(false);
  expect(validVoicePassage({surah:0,ayah:1})).toBe(false);
  let history = rememberVoicePassage([],{surah:2,ayah:75},1);
  history = rememberVoicePassage(history,{surah:112,ayah:1},2);
  history = rememberVoicePassage(history,{surah:2,ayah:75},3);
  expect(history).toEqual([{surah:2,ayah:75,at:3},{surah:112,ayah:1,at:2}]);
 });
});

it('accepts a video whose image track outlasts its audio and rejects an excerpt after audio ends', async () => {
 const { vi } = await import('vitest');
 const { decodeVoiceFile } = await import('./voiceFile');
 const close = vi.fn().mockResolvedValue(undefined);
 vi.stubGlobal('AudioContext', class {
  state = 'running'; close = close;
  decodeAudioData = async () => ({duration:3, sampleRate:16000, numberOfChannels:1, getChannelData:()=>new Float32Array(48000).fill(.1)});
 });
 try {
  const file = {size:100, type:'video/mp4', name:'short.mp4', arrayBuffer:async()=>new ArrayBuffer(100)} as File;
  const samples=await decodeVoiceFile(file,0,8,new AbortController().signal);
  expect(samples).toHaveLength(48000);expect(close).toHaveBeenCalledOnce();
  await expect(decodeVoiceFile(file,4,8,new AbortController().signal)).rejects.toThrow('piste audio');
  expect(close).toHaveBeenCalledTimes(2);
 } finally {vi.unstubAllGlobals();}
});
