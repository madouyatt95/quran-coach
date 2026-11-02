import {describe,expect,it} from 'vitest';
import {nativeFold,nativeHeaderClearance,parseNativeViewport,type NativeViewport} from './nativeViewport';
import {resolveLayout} from '../components/Pupitre/posture';

const base:NativeViewport={width:951,height:620,divisions:[],occlusions:[]};
describe('native Duo reserved regions',()=>{
 it('never infers a fold from the dimensions or a camera occlusion',()=>{
  expect(nativeFold(base,951,620)).toBeNull();
  expect(nativeFold({...base,occlusions:[{x:900,y:0,width:51,height:130}]},951,620)).toBeNull();
 });
 it('puts the desk controls below the exact UIKit division and scales with the viewport',()=>{
  const folded={...base,divisions:[{x:0,y:300,width:951,height:20}]};
  expect(nativeFold(folded,951,620)).toEqual({layout:'desk',start:300,size:20});
  expect(nativeFold(folded,475.5,310)).toEqual({layout:'desk',start:150,size:10});
  expect(nativeFold({...folded,divisions:[]},951,620)).toBeNull();
 });
 it('uses an actual side-by-side division even on a narrower inner display',()=>{
  const folded={width:669,height:902,divisions:[{x:329,y:0,width:11,height:902}],occlusions:[]};
  const fold=nativeFold(folded,669,902);
  expect(fold).toEqual({layout:'book',start:329,size:11});
  const posture={width:669,height:902,folded:true,vertical:false,horizontal:fold?.layout==='book',nativeFold:fold};
  expect(resolveLayout('auto',posture)).toBe('book');
  expect(resolveLayout('plain',posture)).toBe('plain');
  expect(resolveLayout('auto',{...posture,horizontal:false,nativeFold:null})).toBe('plain');
 });
 it('rejects invalid snapshots and divisions that do not divide the viewport',()=>{
  expect(parseNativeViewport({width:NaN,height:620})).toBeNull();
  expect(parseNativeViewport({width:0,height:620})).toBeNull();
  expect(parseNativeViewport({...base,divisions:[{x:0,y:300,width:'951',height:20}]})).toEqual(base);
  expect(nativeFold({...base,divisions:[{x:0,y:0,width:951,height:20}]},951,620)).toBeNull();
  expect(nativeFold({...base,divisions:[{x:0,y:300,width:50,height:20}]},951,620)).toBeNull();
 });
});

it('waits for a matching native snapshot during rotation instead of stretching the hinge',()=>{
 const portrait={width:669,height:902,divisions:[{x:329,y:0,width:11,height:902}],occlusions:[]};
 expect(nativeFold(portrait,902,669)).toBeNull();
 const landscape={width:902,height:669,divisions:[{x:0,y:329,width:902,height:11}],occlusions:[]};
 expect(nativeFold(landscape,902,669)).toEqual({layout:'desk',start:329,size:11});
});

it('avoids a real corner status bar without adding a full-width top band',()=>{
 expect(nativeHeaderClearance({...base,statusBar:{x:867,y:0,width:84,height:160}})).toEqual({left:0,right:84});
 expect(nativeHeaderClearance({...base,statusBar:{x:0,y:0,width:84,height:160}})).toEqual({left:84,right:0});
 expect(nativeHeaderClearance({...base,statusBar:{x:0,y:0,width:951,height:59}})).toBeNull();
 expect(nativeHeaderClearance({...base,statusBar:{x:0,y:0,width:0,height:0}})).toBeNull();
 expect(nativeHeaderClearance(base)).toBeNull();
 expect(nativeHeaderClearance(null)).toBeNull();
 const realDuo={width:669,height:951,divisions:[],occlusions:[{x:535,y:0,width:134,height:82}],statusBar:{x:0,y:0,width:669,height:2}};
 expect(nativeHeaderClearance(realDuo)).toEqual({left:0,right:134});
 expect(nativeHeaderClearance({...realDuo,occlusions:[{x:0,y:0,width:134,height:82}]})).toEqual({left:134,right:0});
 expect(nativeHeaderClearance({...realDuo,occlusions:[{x:270,y:0,width:129,height:35}]})).toBeNull(); // Centered island.
 expect(nativeHeaderClearance({...realDuo,occlusions:[{x:0,y:0,width:44,height:951}]})).toBeNull(); // Full-height edge keeps normal safe areas.
 const value={...base,statusBar:{x:867,y:0,width:84,height:160}};
 expect(parseNativeViewport(value)).toEqual(value);
 expect(parseNativeViewport({...base,statusBar:{x:NaN,y:0,width:84,height:160}})).toEqual(base);
});
