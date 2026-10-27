import {Capacitor,registerPlugin} from '@capacitor/core';
import {parseNativeViewport,type NativeViewport} from './nativeViewport';

const bridge=registerPlugin<{
 getLayout():Promise<unknown>;
 addListener(event:'layoutChanged',listener:(value:unknown)=>void):Promise<{remove:()=>Promise<void>}>;
}>('QuranCoachLayout');
let viewport:NativeViewport|null=null,started=false;
export const getNativeViewport=()=>viewport;

/** One app-lifetime listener; route changes and React StrictMode never recreate it. */
export async function initializeNativeLayout(){
 if(started||!Capacitor.isNativePlatform()||Capacitor.getPlatform()!=='ios')return;
 started=true;
 let events=0;
 const receive=(value:unknown)=>{
  viewport=parseNativeViewport(value);
  window.dispatchEvent(new Event('qc-native-layout'));
 };
 try{
  await bridge.addListener('layoutChanged',value=>{events++;receive(value);});
  const initial=await bridge.getLayout();
  if(events===0)receive(initial);
 }catch{
  // Old installed binaries can still load the web app without this plugin.
  viewport=null;
 }
}
