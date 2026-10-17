import { expect, it } from 'vitest';
import { parseMawaqitMap, nearbyPublishedMosques } from '../../server/mawaqitDirectory';
import { mergeMosques } from './mosqueDirectory';
const row={slug:'mosquee-test',name:'Mosquée An Nour',lat:48.85,lng:2.35,city:'Paris',address:'12 rue A'};
it('validates public identities, deduplicates slugs and never trusts a supplied URL',()=>{
 const result=parseMawaqitMap([row,row,{...row,slug:'../../admin'},{...row,slug:'bad-location',lat:91},{...row,slug:'unnamed',name:''}]);
 expect(result).toHaveLength(1);expect(result[0]).toMatchObject({id:'mawaqit-mosquee-test',refs:{mawaqit:'mosquee-test'},sourceUrl:'https://mawaqit.net/fr/mosquee-test'});
 expect(()=>parseMawaqitMap({error:'unauthorized'})).toThrow();
});
it('restricts the public national directory to the requested area',()=>{
 const mosques=parseMawaqitMap([row,{...row,slug:'lyon',lat:45.76,lng:4.84}]);
 expect(nearbyPublishedMosques(mosques,48.85,2.35,5000).map(m=>m.id)).toEqual(['mawaqit-mosquee-test']);
});
it('preserves legacy identities as aliases and does not conflate conflicting public calendars',()=>{
 const m=parseMawaqitMap([row])[0];
 const merged=mergeMosques([[m],[{...m,id:'legacy',refs:{prayerzone:'legacy'}}]]);
 expect(merged).toHaveLength(1);expect(merged[0].aliases).toContain('legacy');expect(merged[0].refs?.prayerzone).toBe('legacy');
 const conflicting=parseMawaqitMap([{...row,slug:'other-calendar'}]);
 expect(mergeMosques([[m],conflicting])).toHaveLength(2);
});
