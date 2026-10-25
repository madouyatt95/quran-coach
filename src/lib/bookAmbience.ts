import type {BookAmbience} from './bookLibrary';
let layers:HTMLAudioElement[]=[],timer:ReturnType<typeof setInterval>|undefined,revision=0;
/** Two independently fading textures, never routed through the narration signal. */
export function setBookAmbience(kind:BookAmbience,volume:number){
 const token=++revision;if(timer)clearInterval(timer);
 const target=kind==='silence'?0:Math.max(0,Math.min(.25,Number.isFinite(volume)?volume:0));
 const src=target?new URL(`/audio/ambience/${kind}.mp3`,location.origin).href:'';
 let incoming=layers.find(p=>p.src===src);
 if(src&&!incoming){incoming=new Audio();incoming.src=src;incoming.loop=true;incoming.preload='auto';incoming.volume=0;layers.push(incoming);}
 // A rapid third scene change retains only the louder outgoing layer.
 if(layers.length>2){const keep=layers.filter(p=>p!==incoming).sort((a,b)=>b.volume-a.volume)[0];for(const p of layers)if(p!==incoming&&p!==keep)p.pause();layers=layers.filter(p=>p===incoming||p===keep);}
 const starts=layers.map(p=>({p,volume:p.volume})),started=performance.now();
 timer=setInterval(()=>{
  if(token!==revision)return;
  const phase=Math.min(1,(performance.now()-started)/1600),smooth=phase*phase*(3-2*phase);
  for(const {p,volume:from} of starts)p.volume=from+((p===incoming?target:0)-from)*smooth;
  if(phase===1){clearInterval(timer);timer=undefined;for(const p of layers)if(p!==incoming||!target)p.pause();layers=target&&incoming?[incoming]:[];}
 },40);
 if(!incoming||!target)return Promise.resolve();
 const playing=incoming;
 return playing.play().then(()=>{if(token!==revision&&!layers.includes(playing))playing.pause();}).catch(()=>{
  if(token!==revision)return;
  stopBookAmbience();throw new Error('Touchez de nouveau Ambiance pour activer le son.');
 });
}
export function stopBookAmbience(){revision++;if(timer)clearInterval(timer);timer=undefined;for(const player of layers){player.pause();player.volume=0;}layers=[];}
