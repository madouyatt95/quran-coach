import {useArabicAdventureStore} from '../stores/arabicAdventureStore';
import {Capacitor} from '@capacitor/core';
export function playFeedback(){
 if(!useArabicAdventureStore.getState().haptics)return;
 if(Capacitor.isNativePlatform()){void import('@capacitor/haptics').then(({Haptics,ImpactStyle})=>Haptics.impact({style:ImpactStyle.Light})).catch(()=>{});}
 else if(typeof navigator!=='undefined'&&navigator.vibrate)navigator.vibrate(20);
}
