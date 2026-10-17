/** Illustrative sky driven by prayer times; not an astronomical elevation model. */
const palettes = [
 ['#17162f','#554467','#bd8599'],
 ['#554576','#ba809b','#f5c69a'],
 ['#645c97','#a09bc8','#e0c9cb'],
 ['#59477e','#9b739e','#e8b38d'],
 ['#302449','#a26588','#f0a579'],
 ['#13142d','#292445','#595071'],
];
export function skyFrame(at:number,times:number[]){
 if(times.length!==6||!times.every(Number.isFinite)||times.some((t,i)=>i>0&&t<=times[i-1]))return null;
 const start=times[0]-3600000,end=times[5]+3600000;
 const stops=[start,...times,end];
 const colors=[palettes[5],...palettes,palettes[5]];
 const time=Math.max(start,Math.min(end,at));
 const index=Math.min(stops.length-2,Math.max(0,stops.findIndex((t,i)=>i<stops.length-1&&time>=t&&time<=stops[i+1])));
 const ratio=(time-stops[index])/(stops[index+1]-stops[index]);
 const mix=(a:string,b:string)=>`rgb(${[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-ratio)+parseInt(b.slice(i,i+2),16)*ratio)).join(',')})`;
 const daylight=(at-times[1])/(times[4]-times[1]);
 const night=at<times[0]||at>=times[5];
 const stars=at<times[1]?Math.max(0,Math.min(1,(times[1]-at)/(times[1]-times[0]))):Math.max(0,Math.min(1,(at-times[4])/(times[5]-times[4])));
 return {start,end,progress:(time-start)/(end-start),colors:colors[index].map((c,i)=>mix(c,colors[index+1][i])),x:35+330*Math.max(0,Math.min(1,daylight)),y:156-108*Math.sin(Math.PI*Math.max(-.25,Math.min(1.25,daylight))),stars,night};
}
