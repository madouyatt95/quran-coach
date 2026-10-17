import { usePrayerStore } from '../stores/prayerStore';
import { Capacitor } from '@capacitor/core';
import { distanceKm } from './mosques';

type Position = {lat:number;lng:number;accuracy?:number};
let gpsRequest: Promise<Position> | null = null;
let recentPosition: {point:Position;at:number} | null = null;
let prayerRequest: Promise<void> | null = null;
let lastPrayerAttempt = 0;
let requestRevision = -1;

/** Shared short-lived GPS fix for prayer times and nearby mosques. Never a saved city. */
export function locateMosqueSearch(): Promise<Position> {
    if (gpsRequest) return gpsRequest;
    if (recentPosition && Date.now()-recentPosition.at<30000) return Promise.resolve(recentPosition.point);
    gpsRequest = requestPosition().then(point=>{recentPosition={point,at:Date.now()};return point;}).finally(()=>{gpsRequest=null;});
    return gpsRequest;
}

/** Use the exact same fix as the mosque lookup; late reverse-geocoding cannot override a manual city. */
export async function syncPrayerPosition(point:Position, revision=usePrayerStore.getState().locationRevision): Promise<void> {
    const current=()=>usePrayerStore.getState().locationMode==='auto'&&usePrayerStore.getState().locationRevision===revision;
    if(!current())return;
    if(point.accuracy && point.accuracy>1500) throw new Error('Position trop approximative. Activez la position précise ou choisissez une ville.');
    const state=usePrayerStore.getState();
    const moved=state.lat==null||state.lng==null||distanceKm(point,{lat:state.lat,lng:state.lng})>=.5;
    if(!moved&&state.locationUpdatedAt>0){usePrayerStore.setState({locationUpdatedAt:Date.now(),locationError:''});return;}
    state.updateCoords(point.lat,point.lng,'Position actuelle','');
    usePrayerStore.setState({locationUpdatedAt:Date.now(),locationError:''});
    // Prayer calculations can already update; place-name lookup is optional.
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),2500);
    try {
        const response=await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${point.lat.toFixed(2)}&longitude=${point.lng.toFixed(2)}&localityLanguage=fr`,{signal:controller.signal});
        if(!response.ok)return;
        const geo=await response.json();
        const latest=usePrayerStore.getState();
        if(current()&&latest.lat===point.lat&&latest.lng===point.lng)latest.updateCoords(point.lat,point.lng,geo.city||geo.locality||'Position actuelle',geo.countryName||'');
    }catch{/* Coordinates remain usable without a place name. */}finally{clearTimeout(timer);}
}

export function refreshPrayerLocation(force=false):Promise<void> {
    const state=usePrayerStore.getState();
    if(state.locationMode!=='auto')return Promise.resolve();
    if(prayerRequest)return requestRevision===state.locationRevision?prayerRequest:prayerRequest.then(()=>refreshPrayerLocation(true));
    if(!force&&Date.now()-lastPrayerAttempt<60000)return Promise.resolve();
    const revision=state.locationRevision;
    requestRevision=revision;
    lastPrayerAttempt=Date.now();
    prayerRequest=(async()=>{
        try{await syncPrayerPosition(await locateMosqueSearch(),revision);}
        catch(error){
            const latest=usePrayerStore.getState();
            if(latest.locationMode==='auto'&&latest.locationRevision===revision)usePrayerStore.setState({locationError:error instanceof Error?error.message:'Position indisponible.'});
        }
    })().finally(()=>{prayerRequest=null;});
    return prayerRequest;
}

/** Saved coordinates are a fallback, never a reason to stop refreshing automatic location. */
export async function resolveCoords():Promise<{lat:number;lng:number}> {
    await refreshPrayerLocation();
    const state=usePrayerStore.getState();
    if(state.lat!=null&&state.lng!=null)return {lat:state.lat,lng:state.lng};
    state.updateCoords(48.8566,2.3522,'Paris','France');
    return {lat:48.8566,lng:2.3522};
}

/** Explicit GPS request for the mosque explorer: never substitutes a saved city or Paris. */
async function requestPosition(): Promise<{lat:number;lng:number;accuracy?:number}> {
    if(Capacitor.isNativePlatform()) {
        const {Geolocation}=await import('@capacitor/geolocation');
        const permission=await Geolocation.checkPermissions();
        if(permission.location!=='granted'&&permission.coarseLocation!=='granted') {
            const requested=await Geolocation.requestPermissions();
            if(requested.location!=='granted'&&requested.coarseLocation!=='granted')throw new Error('Autorisez la localisation dans les réglages pour vous recentrer.');
        }
        const position=await Geolocation.getCurrentPosition({enableHighAccuracy:false,timeout:10000,maximumAge:60000});
        return {lat:position.coords.latitude,lng:position.coords.longitude,accuracy:position.coords.accuracy};
    }
    if(!navigator.geolocation)throw new Error('La localisation est indisponible. Choisissez une ville.');
    return new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(p=>resolve({lat:p.coords.latitude,lng:p.coords.longitude,accuracy:p.coords.accuracy}),e=>reject(new Error(e.code===1?'Localisation refusée. Vous pouvez choisir une ville.':'Position introuvable. Réessayez ou choisissez une ville.')),{timeout:10000,maximumAge:60000,enableHighAccuracy:false}));
}
