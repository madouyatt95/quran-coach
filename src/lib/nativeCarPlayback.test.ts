import {it,expect} from 'vitest';
import {readCarPlayback} from './nativeCarPlayback';

it('keeps finite playback progress and only internal reading destinations',()=>{
 expect(readCarPlayback({active:true,playing:true,id:'audio-id',title:'Adam',path:'/books/adam?chapter=names',position:24.5,duration:400})).toMatchObject({active:true,playing:true,path:'/books/adam?chapter=names',position:24.5,duration:400});
 expect(readCarPlayback({active:'true',playing:'false',path:'https://evil.example/',position:NaN,duration:Infinity})).toMatchObject({active:false,playing:false,path:'',position:0,duration:0});
 expect(readCarPlayback({path:'/read?surah=2&ayah=17',position:-1})).toMatchObject({path:'/read?surah=2&ayah=17',position:0});
});
