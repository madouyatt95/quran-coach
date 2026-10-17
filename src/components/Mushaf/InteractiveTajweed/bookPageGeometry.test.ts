import {describe,it,expect} from 'vitest';
import {bookPageGeometry} from './bookPageGeometry';
describe('flexible RTL book sheet',()=>{
    it('covers the original page with contiguous strips in either direction',()=>{
        for(const direction of [-1,1]){
            const strips=bookPageGeometry(600,0,direction).sort((a,b)=>a.index-b.index);
            strips.forEach((s,i)=>{expect(s.x).toBeCloseTo(i*37.5);expect(s.z).toBe(0);expect(s.angle).toBeCloseTo(0);});
        }
    });
    it('curves above the page and finishes entirely outside it',()=>{
        for(const direction of [-1,1]){
            const halfway=bookPageGeometry(600,.5,direction);
            expect(halfway.every(s=>s.z>=0)).toBe(true);
            expect(new Set(halfway.map(s=>s.angle)).size).toBe(16);
            const end=bookPageGeometry(600,1,direction);
            expect(end.every(s=>direction>0?s.x>=600:s.x<=0)).toBe(true);
            expect(end.every(s=>Math.abs(s.angle)===180)).toBe(true);
        }
    });
});

it('never folds through the book, and mirrors every joined edge in both directions',()=>{
    const width=600,step=width/16;
    for(let frame=0;frame<=100;frame++){
        const next=bookPageGeometry(width,frame/100,1);
        const previous=bookPageGeometry(width,frame/100,-1);
        next.forEach((n,i)=>{
            const p=previous[i],angle=p.angle*Math.PI/180;
            expect(Math.abs(n.angle)).toBeLessThanOrEqual(180);
            expect(n.z).toBeGreaterThanOrEqual(-1e-9);
            expect(n.angle).toBeCloseTo(-p.angle);
            // Compare the same material edge (left on one sheet, right on its mirror).
            expect(n.x).toBeCloseTo(width-(p.x+step*Math.cos(angle)));
            expect(n.z).toBeCloseTo(p.z-step*Math.sin(angle));
            if(i<15){
                expect(previous[i+1].x).toBeCloseTo(p.x+step*Math.cos(angle));
                expect(previous[i+1].z).toBeCloseTo(p.z-step*Math.sin(angle));
            }
        });
    }
});

import {boundPageGeometry} from './bookPageGeometry';
it('pins the entire binding edge and keeps neighbouring strips joined during diagonal drags',()=>{
 const width=600,step=width/16;
 for(const direction of [-1,1])for(const tilt of [-.42,0,.42])for(let frame=0;frame<=100;frame++){
  const parts=boundPageGeometry(width,frame/100,direction,tilt).sort((a,b)=>a.index-b.index);
  const point=(m:number[],x:number,y:number)=>[m[0]*x+m[4]*y+m[12],m[1]*x+m[5]*y+m[13],m[2]*x+m[6]*y+m[14]];
  const bound=direction>0?parts[15]:parts[0];
  for(const y of [0,430,860]){
   const pinned=point(bound.matrix,direction>0?step:0,y);
   [direction>0?width:0,y,0].forEach((value,i)=>expect(pinned[i]).toBeCloseTo(value,7));
  }
  for(let i=0;i<15;i++){
   const a=point(parts[i].matrix,step,400),b=point(parts[i+1].matrix,0,400);
   a.forEach((value,j)=>expect(value).toBeCloseTo(b[j],7));
  }
 }
});
