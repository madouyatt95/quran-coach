import { expect, it } from 'vitest';
import { mawaqitSlug, matchMosques, mergeMosques, parseOverpass } from './mosqueDirectory';
import type { Mosque } from './mosques';
const mosque:Mosque={id:'legacy',name:'Mosquée An Nour',city:'Paris',lat:48.85,lng:2.35,sourceUrl:'https://pray.zone/test'};
it('merges a close named match while preserving legacy IDs, aliases and provider references',()=>{
 const osm={...mosque,id:'osm-node-1',name:'Masjid An Nour',refs:{osm:'node/1'}};
 const result=mergeMosques([[mosque],[osm]]);expect(result).toHaveLength(1);expect(result[0]).toMatchObject({id:'legacy',refs:{prayerzone:'legacy',osm:'node/1'},aliases:['osm-node-1']});
});
it('does not attach a timetable just because two mosques are close or an identity is ambiguous',()=>{
 const other={...mosque,id:'different',name:'Mosquée Al Huda'};
 expect(matchMosques(mosque,other)).toBe('possible');const result=mergeMosques([[mosque],[other]]);expect(result).toHaveLength(2);expect(result.every(m=>m.matchUncertain)).toBe(true);
 expect(mergeMosques([[mosque,{...mosque,id:'second'}],[{...mosque,id:'third',refs:{osm:'way/1'}}]]).length).toBeGreaterThan(0);
});
it('accepts only muslim places with valid coordinates and controlled public URLs',()=>{
 const result=parseOverpass({elements:[{type:'way',id:123,center:{lat:48.85,lon:2.35},tags:{religion:'muslim',name:'Mosquée','addr:street':'Rue A',website:'javascript:alert(1)'}},{type:'node',id:2,lat:95,lon:2,tags:{religion:'muslim'}}]});
 expect(result).toHaveLength(1);expect(result[0].sourceUrl).toBe('https://www.openstreetmap.org/way/123');expect(result[0].website).toBeUndefined();
});
it('only accepts a mosque slug from the exact HTTPS public MAWAQIT host',()=>{
 expect(mawaqitSlug('https://mawaqit.net/fr/zawiya-tidjaniya-trappes')).toBe('zawiya-tidjaniya-trappes');
 for(const value of ['https://mawaqit.net.evil.test/fr/test','https://user:pass@mawaqit.net/fr/test','http://mawaqit.net/fr/test','https://mawaqit.net/api/2.0/mosque','https://mawaqit.net/fr/../../private'])expect(mawaqitSlug(value)).toBeNull();
});

it('merges bilingual Bagnolet names and preserves the public website for automatic discovery',()=>{
 const result=mergeMosques([[{...mosque,id:'bagnolet',name:'Great Mosque of Bagnolet'}],[{...mosque,id:'osm-way-1',name:'Mosquée de Bagnolet',website:'https://www.mosquee-bagnolet.fr/',refs:{osm:'way/1'}}]]);
 expect(result).toHaveLength(1);expect(result[0].website).toBe('https://www.mosquee-bagnolet.fr/');expect(result[0].aliases).toContain('osm-way-1');
});
