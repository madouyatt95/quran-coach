import { expect,it } from 'vitest';
import { sunPosition } from './prayerSun';
it('positions the sun between sunrise and sunset and keeps nighttime off the daylight arc',()=>{
 expect(sunPosition(6,6,18)).toMatchObject({progress:0,x:24,y:120,daylight:true});
 expect(sunPosition(12,6,18)).toMatchObject({progress:.5,x:180,y:34,daylight:true});
 expect(sunPosition(18,6,18)).toMatchObject({progress:1,daylight:false});
 expect(sunPosition(2,6,18)).toMatchObject({progress:0,daylight:false});
});
it('does not draw misleading positions when solar times are unavailable',()=>{
 expect(sunPosition(1,NaN,18)).toBeNull();expect(sunPosition(1,18,6)).toBeNull();
});
