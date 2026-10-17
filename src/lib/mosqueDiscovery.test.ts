import { expect, it, vi } from 'vitest';
import { discoverMosque, publicIPv4, publicScheduleLinks, publicWebsite } from '../../server/mosqueDiscovery';
import type { Mosque } from './mosques';
import type { PublishedTimetable } from './mosqueTimetables';
const mosque:Mosque={id:'osm-way-1',name:'Mosquée de Bagnolet',city:'Bagnolet',lat:48.87,lng:2.42,sourceUrl:'https://www.openstreetmap.org/way/1',website:'https://example.org',refs:{osm:'way/1'}};
const timetable={mosque:{...mosque,id:'mawaqit-bagnolet'},mosqueId:'bagnolet',source:'MAWAQIT',fetchedAt:Date.now(),sourceUrl:'https://mawaqit.net/fr/bagnolet',timezone:'Europe/Paris',days:[]} as PublishedTimetable;
it('discovers a single published link and attaches only the geographically matching calendar',async()=>{
 const load=vi.fn().mockResolvedValue(timetable),read=vi.fn().mockResolvedValue('<iframe src="https://mawaqit.net/fr/w/bagnolet"></iframe>');
 expect(await discoverMosque(mosque,load,read)).toMatchObject({status:'found',timetable});expect(load).toHaveBeenCalledWith('bagnolet');
 load.mockResolvedValue({...timetable,mosque:{...mosque,lat:49}});expect(await discoverMosque(mosque,load,read)).toMatchObject({status:'uncertain'});
});
it('refuses ambiguous links and never searches an invented slug',async()=>{
 const load=vi.fn();expect(await discoverMosque(mosque,load,async()=>'<a href="https://mawaqit.net/fr/one"></a><a href="https://mawaqit.net/fr/two"></a>')).toMatchObject({status:'uncertain'});
 expect(await discoverMosque({...mosque,website:undefined},load)).toMatchObject({status:'missing'});expect(load).not.toHaveBeenCalled();
});
it('deduplicates public widget links and rejects lookalike hosts',()=>{
 expect(publicScheduleLinks('https://mawaqit.net/fr/w/bagnolet https://mawaqit.net/fr/bagnolet https://mawaqit.net.evil.org/fr/evil')).toEqual(['bagnolet']);
});
it('blocks local, metadata, reserved and credentialed website destinations',()=>{
 for(const ip of ['127.0.0.1','10.1.2.3','169.254.169.254','172.16.0.1','192.168.1.1','100.64.0.1','198.18.0.1','0.0.0.0','255.255.255.255'])expect(publicIPv4(ip)).toBe(false);
 expect(publicIPv4('1.1.1.1')).toBe(true);
 for(const url of ['http://example.org','https://user:pass@example.org','https://localhost','https://example.org:8443','https://[::1]'])expect(()=>publicWebsite(url)).toThrow();
});
it('reports provider failures separately from absence of published times',async()=>{
 expect(await discoverMosque(mosque,vi.fn(),async()=>{throw new Error('timeout');})).toMatchObject({status:'unavailable'});
});
