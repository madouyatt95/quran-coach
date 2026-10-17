import {expect,it} from 'vitest';
import {bookTurnPages,dragTilt,foldAxes,releaseVelocity,settleDuration,settleProgress,shouldCommitTurn} from './bookTurnMotion';
it('selects the actual reverse face and exposed page in both reading layouts',()=>{
 expect(bookTurnPages(4,1,false)).toEqual({target:5,back:5,under:5});
 expect(bookTurnPages(4,-1,false)).toEqual({target:3,back:3,under:3});
 expect(bookTurnPages(4,1,true)).toEqual({target:5,back:5,under:6});
 expect(bookTurnPages(3,-1,true)).toEqual({target:1,back:2,under:1});
});
it('bounds diagonal axes and reconstructs front and correctly oriented back coordinates',()=>{
 for(const tilt of [-.42,-.2,0,.2,.42]){
  const a=foldAxes(600,860,tilt);
  for(const [x,y] of [[0,0],[600,0],[0,860],[600,860],[250,470]]){
   const u=a.c*x+a.s*y,v=-a.s*x+a.c*y;
   expect(u).toBeGreaterThanOrEqual(a.u-1e-9);expect(u).toBeLessThanOrEqual(a.u+a.width+1e-9);
   expect(v).toBeGreaterThanOrEqual(a.v-1e-9);expect(v).toBeLessThanOrEqual(a.v+a.height+1e-9);
   expect(a.c*u-a.s*v).toBeCloseTo(x);expect(a.s*u+a.c*v).toBeCloseTo(y);
   const step=a.width/16,start=a.u+5*step;
   const bx=a.c*(600-x)-a.s*y+start+step-a.c*600;
   expect(bx).toBeCloseTo(start+step-u);
   const by=a.s*(600-x)+a.c*y-a.s*600-a.v;
   expect(by).toBeCloseTo(v-a.v);
  }
 }
 expect(dragTilt(200,-80,1)).toBeCloseTo(-dragTilt(-200,-80,-1));
});
it('uses recent momentum, supports flicks and honours a reversal',()=>{
 expect(releaseVelocity(2,150)).toBe(0);expect(releaseVelocity(20,30)).toBe(3);
 expect(shouldCommitTurn(.15,1)).toBe(true);expect(shouldCommitTurn(.15,0)).toBe(false);
 expect(shouldCommitTurn(.6,-.8)).toBe(false);expect(shouldCommitTurn(.6,0)).toBe(true);
 expect(settleDuration(.4,1,2)).toBeLessThan(settleDuration(.4,1,0));
 expect(settleDuration(.9,1,3)).toBeGreaterThanOrEqual(460);
});
it('keeps inertia continuous and monotonic without overshooting the landing',()=>{
 for(const velocity of [0,.5,1,3]){
  const duration=settleDuration(.3,1,velocity);let previous=0;
  for(let i=0;i<=100;i++){
   const p=settleProgress(i/100,velocity,duration,.7);
   expect(p).toBeGreaterThanOrEqual(previous-1e-9);expect(p).toBeLessThanOrEqual(1);previous=p;
  }
  expect(settleProgress(0,velocity,duration,.7)).toBe(0);expect(previous).toBe(1);
 }
});
