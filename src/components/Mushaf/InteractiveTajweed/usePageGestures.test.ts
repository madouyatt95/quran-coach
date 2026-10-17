import {expect,it} from 'vitest';
import {swipePageDelta} from './usePageGestures';
it('turns pages in Arabic reading direction and never during zoomed panning or vertical scrolling',()=>{
 expect(swipePageDelta(100,5,1)).toBe(1);expect(swipePageDelta(-100,5,1)).toBe(-1);
 expect(swipePageDelta(100,5,1.25)).toBe(0);expect(swipePageDelta(100,130,1)).toBe(0);expect(swipePageDelta(20,5,1)).toBe(0);
});

it('allows a page turn only after exhausting horizontal pan and continuing past the edge',()=>{
 expect(swipePageDelta(160,10,1.2,80)).toBe(1);
 expect(swipePageDelta(-160,10,2,-80)).toBe(-1);
 expect(swipePageDelta(160,10,2,30)).toBe(0);
 expect(swipePageDelta(160,170,2,100)).toBe(0);
});
