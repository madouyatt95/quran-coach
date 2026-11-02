import {Capacitor,registerPlugin} from '@capacitor/core';
import {nativeHeaderClearance,parseNativeViewport,type NativeViewport} from './nativeViewport';

const bridge=registerPlugin<{
 getLayout():Promise<unknown>;
 setImmersive(options:{hidden:boolean}):Promise<void>;
 addListener(event:'layoutChanged',listener:(value:unknown)=>void):Promise<{remove:()=>Promise<void>}>;
}>('QuranCoachLayout');
let viewport:NativeViewport|null=null,started=false;
export const getNativeViewport=()=>viewport;

/** One app-lifetime listener; route changes and React StrictMode never recreate it. */
export async function initializeNativeLayout(){
 if(started||!Capacitor.isNativePlatform()||Capacitor.getPlatform()!=='ios')return;
 started=true;
 document.documentElement.dataset.nativeIos="true";
 // The Mushaf owns a full-screen reading surface, including the desk. Restore
 // system chrome on exit, without changing the system's preferred bar edge.
 let lastHidden:boolean|undefined;
 const syncChrome=()=>{
  const hidden=document.body.classList.contains("iq-reader-active");
  if(hidden===lastHidden)return;lastHidden=hidden;
  void bridge.setImmersive({hidden}).catch(()=>{/* Older installed bridges have no visibility method. */});
 };
 new MutationObserver(syncChrome).observe(document.body,{attributes:true,attributeFilter:["class"]});
 syncChrome();
 let events=0;
 const receive=(value:unknown)=>{
  viewport=parseNativeViewport(value);
  const clearance=nativeHeaderClearance(viewport),root=document.documentElement;
  root.dataset.nativeCornerStatus=String(!!clearance);
  root.style.setProperty('--native-header-left',`${clearance?.left||0}px`);
  root.style.setProperty('--native-header-right',`${clearance?.right||0}px`);
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
