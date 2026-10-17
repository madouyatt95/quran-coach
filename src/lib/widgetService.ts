import {Capacitor,registerPlugin} from '@capacitor/core';
interface WidgetBridge {
 updateWidgetContent(data:{hadithText?:string;hadithSource?:string;nextPrayerName?:string;nextPrayerTime?:string;sentinelWordAr?:string;sentinelWordFr?:string;updatedAt?:number}):Promise<void>;
}
const bridge=registerPlugin<WidgetBridge>('QuranCoachCar');
const supported=()=>Capacitor.isNativePlatform()&&Capacitor.getPlatform()==='ios';
/** The PWA does not load the native widget data or subscribe to its stores. */
export function startActivityWidgetBridge(){
 if(!supported())return ()=>{};
 let stopped=false,stop:(()=>void)|undefined;
 void import('./activityWidgets').then(module=>{if(!stopped)stop=module.startActivityWidgetSync();}).catch(()=>{});
 return ()=>{stopped=true;stop?.();};
}
/** The native bridge writes to the App Group suite. Preferences.configure only changes a key prefix. */
export async function updateNextPrayerWidget(nextPrayerName:string,nextPrayerTime:string){
 if(supported())await bridge.updateWidgetContent({nextPrayerName,nextPrayerTime});
}
export async function updateHadithWidget(hadithText:string,hadithSource:string){
 if(supported())await bridge.updateWidgetContent({hadithText,hadithSource,updatedAt:Date.now()});
}
export async function updateSentinelWidget(sentinelWordAr:string,sentinelWordFr:string){
 if(supported())await bridge.updateWidgetContent({sentinelWordAr,sentinelWordFr});
}
