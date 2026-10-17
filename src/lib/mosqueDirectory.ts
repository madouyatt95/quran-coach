import { distanceKm, safeMosqueUrl, validCoordinates, type Mosque } from './mosques.js';
export type DirectorySource = 'prayerzone' | 'osm' | 'mawaqit';
export interface DirectoryResult { mosques: Mosque[]; fetchedAt: number; unavailable: DirectorySource[]; mawaqit: 'public-pages' | 'public-map'; }
export const normalizeMosqueName = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const distinctive = (value: string) => normalizeMosqueName(value).split(' ').filter(t => !['mosquee','mosque','masjid','great','grand','grande','de','of','the','du','la','le','al','el','association','islamique','centre'].includes(t)).join(' ');
export function sourceRefs(m: Mosque) { return m.refs || { prayerzone: m.id }; }
/** Conservative identity matching. Coordinates alone never transfer a timetable. */
export function matchMosques(a: Mosque, b: Mosque): 'same' | 'possible' | 'different' {
 const ar=sourceRefs(a),br=sourceRefs(b);
 if(a.id===b.id || Object.entries(ar).some(([k,v])=>v&&v===br[k as DirectorySource]))return 'same';
 const distance=distanceKm(a,b),an=distinctive(a.name),bn=distinctive(b.name);
 const conflicting=Object.entries(ar).some(([k,v])=>k!=='osm'&&v&&br[k as DirectorySource]&&v!==br[k as DirectorySource]);
 if(conflicting)return distance<=.3?'possible':'different';
 const address=!!a.address&&!!b.address&&normalizeMosqueName(a.address)===normalizeMosqueName(b.address);
 if(distance<=.12&&an&&an===bn)return 'same';
 if(distance<=.06&&address&&an&&bn&&(an.includes(bn)||bn.includes(an)))return 'same';
 return distance<=.08||(distance<=.3&&an&&an===bn)?'possible':'different';
}
export function mergeMosques(groups: Mosque[][]): Mosque[] {
 const result: Mosque[]=[];
 for(const incoming of groups.flat()){
  const candidates=result.filter(m=>matchMosques(m,incoming)==='same');
  if(candidates.length===1){const found=candidates[0];found.refs={...sourceRefs(incoming),...sourceRefs(found)};found.address ||= incoming.address;found.city ||= incoming.city;found.website ||= incoming.website;found.aliases=Array.from(new Set([...(found.aliases||[]),incoming.id,...(incoming.aliases||[])]));}
  else { const copy={...incoming,refs:{...sourceRefs(incoming)}}; if(candidates.length>1)copy.matchUncertain=true;result.push(copy); }
 }
 for(let i=0;i<result.length;i++)for(let j=i+1;j<result.length;j++)if(matchMosques(result[i],result[j])!=='different'){result[i].matchUncertain=true;result[j].matchUncertain=true;}
 return result.slice(0,180);
}
export function parseOverpass(value: unknown): Mosque[] {
 const data=value as {elements?: {type:string;id:number;lat?:number;lon?:number;center?:{lat:number;lon:number};tags?:Record<string,string>}[]};
 if(!Array.isArray(data?.elements))throw new Error('Annuaire OpenStreetMap indisponible.');
 return data.elements.flatMap(e=>{
  const lat=e.lat??e.center?.lat,lng=e.lon??e.center?.lon,t=e.tags||{};
  if(!validCoordinates(lat,lng)||!['node','way','relation'].includes(e.type)||!Number.isSafeInteger(e.id)||t.religion!=='muslim')return [];
  const id=`osm-${e.type}-${e.id}`,address=[t['addr:housenumber'],t['addr:street'],t['addr:postcode'],t['addr:city']].filter(Boolean).join(' ');
  return [{id,name:(t['name:fr']||t.name||'Mosquée sans nom renseigné').slice(0,180),city:t['addr:city']||'',lat:lat!,lng:lng!,address,sourceUrl:`https://www.openstreetmap.org/${e.type}/${e.id}`,website:safeMosqueUrl(t.website||t['contact:website'])||undefined,refs:{osm:`${e.type}/${e.id}`}}];
 }).slice(0,180);
}
export function mosqueMatchesId(m: Mosque, id: string) { return m.id===id || !!m.aliases?.includes(id); }

export function mawaqitSlug(value: string): string|null {try{const url=new URL(value);if(url.protocol!=='https:'||!['mawaqit.net','www.mawaqit.net'].includes(url.hostname)||url.username||url.password)return null;const m=/^\/(?:fr|en|ar)\/(?:w\/)?([a-z0-9][a-z0-9_-]{1,179})\/?$/i.exec(url.pathname);return m?.[1]||null;}catch{return null;}}
