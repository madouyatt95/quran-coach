const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));

/** Coordinates of the rectangular page in the diagonal fold's local axes. */
export function foldAxes(width:number,height:number,tilt:number){
    const c=Math.cos(tilt),s=Math.sin(tilt);
    const corners=[[0,0],[width,0],[0,height],[width,height]];
    const us=corners.map(([x,y])=>c*x+s*y),vs=corners.map(([x,y])=>-s*x+c*y);
    const u=Math.min(...us),v=Math.min(...vs);
    return {c,s,u,v,width:Math.max(...us)-u,height:Math.max(...vs)-v};
}
export function bookTurnPages(page:number,direction:number,spread:boolean){
    const target=spread?Math.floor((page-1)/2)*2+1+direction*2:page+direction;
    return {target,back:spread&&direction<0?target+1:target,under:spread&&direction>0?target+1:target};
}
export function dragTilt(dx:number,dy:number,direction:number){
    return clamp(Math.atan2(direction*dy,Math.max(80,Math.abs(dx))),-.42,.42);
}
/** Signed page-widths per second; stale release samples carry no momentum. */
export function releaseVelocity(velocity:number,ageMs:number){return ageMs>100?0:clamp(velocity,-3,3);}
export function shouldCommitTurn(progress:number,velocity:number){
    if(velocity<-.35)return false;
    return progress>.3||(progress>.08&&velocity>.65);
}
export function settleDuration(from:number,end:number,velocity:number){
    const distance=Math.abs(end-from),towards=Math.max(0,velocity*Math.sign(end-from));
    const slow=end===1?Math.max(620,distance*1400):Math.max(400,distance*900);
    return Math.max(end===1?460:320,slow/(1+towards*.55));
}
/** Cubic Hermite, preserving a bounded release velocity and landing at rest. */
export function settleProgress(t:number,velocity:number,duration:number,distance:number){
    const slope=clamp(velocity*duration/1000/Math.max(.001,distance),0,2.5);
    return (-2*t*t*t+3*t*t)+(t*t*t-2*t*t+t)*slope;
}
