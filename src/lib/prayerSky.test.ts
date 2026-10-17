import {expect,it} from 'vitest';
import {skyFrame} from './prayerSky';
const times=[5,7,13,16,19,21].map(h=>h*3600000);
it('shows sunrise and sunset at the horizon, with the sun above it during the day',()=>{
 expect(skyFrame(times[1],times)).toMatchObject({x:35,y:156,stars:0,night:false});
 expect(skyFrame(times[4],times)?.y).toBeCloseTo(156);
 expect(skyFrame(times[2],times)?.y).toBeLessThan(60);
 expect(skyFrame(times[5],times)).toMatchObject({stars:1,night:true});
 expect(skyFrame(0,times)?.night).toBe(true);
});
it('interpolates colors continuously and clamps nighttime navigation',()=>{
 const before=skyFrame(times[1]-1,times)!,after=skyFrame(times[1]+1,times)!;
 expect(before.colors).toEqual(after.colors);
 expect(skyFrame(0,times)?.progress).toBe(0);
 expect(skyFrame(24*3600000,times)?.progress).toBe(1);
 expect(skyFrame(times[3],times)?.colors).not.toEqual(skyFrame(times[5],times)?.colors);
});
it('does not render a sky with unavailable or unordered solar times',()=>{
 expect(skyFrame(0,[NaN,...times.slice(1)])).toBeNull();
 expect(skyFrame(0,[...times].reverse())).toBeNull();
});
