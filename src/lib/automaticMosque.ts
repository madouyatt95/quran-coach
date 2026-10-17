import { distanceKm, type Mosque } from './mosques';
/** Keep an existing selection unless another place is materially closer. */
export function closestStableMosque(mosques: Mosque[], position: {lat:number;lng:number}, previous: Mosque|null): Mosque|null {
 const eligible=mosques.filter(m=>!m.matchUncertain).sort((a,b)=>distanceKm(position,a)-distanceKm(position,b));
 const nearest=eligible[0];if(!nearest)return null;
 const current=previous&&eligible.find(m=>m.id===previous.id||m.aliases?.includes(previous.id));
 return current&&distanceKm(position,current)-distanceKm(position,nearest)<0.2?current:nearest;
}
