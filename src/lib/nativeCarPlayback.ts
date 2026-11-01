import {Capacitor,registerPlugin} from '@capacitor/core';
import {create} from 'zustand';

export interface NativeCarPlayback {active:boolean;id:string;title:string;path:string;playing:boolean;position:number;duration:number;error:string}
export const emptyCarPlayback:NativeCarPlayback={active:false,id:'',title:'',path:'',playing:false,position:0,duration:0,error:''};
export const useNativeCarPlayback=create<NativeCarPlayback>(()=>emptyCarPlayback);
const native=registerPlugin<{carPlaybackCommand(data:{action:string;seconds?:number}):Promise<NativeCarPlayback>}>('QuranCoachCar');
export function readCarPlayback(value:unknown):NativeCarPlayback {
 if(!value||typeof value!=='object')return emptyCarPlayback;
 const data=value as Record<string,unknown>;
 const text=(key:string)=>typeof data[key]==='string'?String(data[key]).slice(0,300):'';
 const number=(key:string)=>typeof data[key]==='number'&&Number.isFinite(data[key])?Math.max(0,data[key]):0;
 const path=text('path');
 return {active:data.active===true,id:text('id'),title:text('title'),path:/^\/(?:read\?|books\/[a-z0-9-]+(?:\?|$)|prayers$)/.test(path)?path:'',playing:data.playing===true,position:number('position'),duration:number('duration'),error:text('error')};
}
export async function carPlaybackCommand(action:string,seconds?:number) {
 if(!Capacitor.isNativePlatform()||Capacitor.getPlatform()!=='ios')return;
 const state=await native.carPlaybackCommand({action,...(Number.isFinite(seconds)?{seconds}:{})});
 useNativeCarPlayback.setState(readCarPlayback(state));
}
