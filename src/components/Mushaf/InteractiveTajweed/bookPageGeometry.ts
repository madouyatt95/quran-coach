/** A flexible sheet attached to the right spine for next-page turns (RTL). */
export function bookPageGeometry(width:number, progress:number, direction:number, count=16) {
    const p=Math.max(0,Math.min(1,progress));
    const step=width/count, hinge=direction>0?width:0;
    let x=hinge,z=0;
    return Array.from({length:count},(_,index)=>{
        // Curvature is distributed around the sheet, with a lagging spine and
        // a leading free edge. Keep every segment within [0, pi]: an edge
        // rotating beyond pi dips through the page during the landing.
        // Time easing belongs to the animation, not this drag geometry.
        const angle=Math.PI*p+Math.sin(Math.PI*p)*.9*((index+.5)/count-.4);
        const dx=(direction>0?-1:1)*step*Math.cos(angle),dz=step*Math.sin(angle);
        const segment={index:direction>0?count-1-index:index,x:direction>0?x+dx:x,z:direction>0?z+dz:z,
            angle:(direction>0?1:-1)*angle*180/Math.PI,shade:Math.min(.34,Math.abs(Math.sin(angle))*.25)};
        x+=dx;z+=dz;return segment;
    });
}

/** Bound sheet: every point along the spine remains fixed throughout the turn.
 * The vertical component of the drag bends the free edge progressively, rather
 * than rotating the entire sheet (which would lift it off its binding).
 */
export function boundPageGeometry(width:number,progress:number,direction:number,tilt:number,count=16){
    const step=width/count,p=Math.max(0,Math.min(1,progress));
    const lift=(u:number)=>direction*tilt*Math.sin(Math.PI*p)*width*.65*Math.pow(direction>0?(width-u)/width:u/width,2);
    return bookPageGeometry(width,p,direction,count).map(part=>{
        const u=part.index*step,angle=part.angle*Math.PI/180;
        const y=lift(u),slope=(lift(u+step)-y)/step;
        return {...part,y,matrix:[Math.cos(angle),slope,-Math.sin(angle),0,0,1,0,0,Math.sin(angle),0,Math.cos(angle),0,part.x,y,part.z,1]};
    });
}
