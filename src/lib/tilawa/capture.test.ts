/// <reference types="node" />
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {describe,it,expect} from 'vitest';
interface Capture {process(inputs:Float32Array[][]):boolean;port:{onmessage:(e:{data:string})=>void};}
function capture(rate:number){const messages:(Float32Array|string)[]=[];let Processor:new()=>Capture;
 class Base{port={postMessage:(data:Float32Array|string)=>messages.push(data)};}
 runInNewContext(readFileSync('public/tilawa/capture-worklet.js','utf8'),{AudioWorkletProcessor:Base,sampleRate:rate,Float32Array,registerProcessor:(_name:string,P:new()=>Capture)=>{Processor=P;}});
 return {processor:new Processor!(),messages};
}
describe('microphone PCM conversion',()=>{
 it.each([44100,48000])('keeps the final partial block at %s Hz',rate=>{
 const {processor,messages}=capture(rate);
 for(let offset=0;offset<rate;offset+=128)processor.process([[new Float32Array(Math.min(128,rate-offset)).fill(0.25)]]);
 processor.port.onmessage({data:'flush'});
 const chunks=messages.filter((m):m is Float32Array=>m instanceof Float32Array);
 expect(chunks.reduce((n,c)=>n+c.length,0)).toBe(16000);
 expect(chunks.every(c=>c.every(v=>Math.abs(v-0.25)<0.00001))).toBe(true);
 expect(messages.at(-1)).toBe('flushed');
 const count=messages.length;processor.process([[new Float32Array(128)]]);expect(messages.length).toBe(count);
 });
});
