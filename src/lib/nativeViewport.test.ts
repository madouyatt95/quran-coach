import {describe,expect,it} from 'vitest';
import {nativeFold,parseNativeViewport,type NativeViewport} from './nativeViewport';
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
