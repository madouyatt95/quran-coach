import { useEffect, useRef, useState } from 'react';
import { Map, NavigationControl, AttributionControl, Marker, setWorkerUrl, type GeoJSONSource } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import type { FeatureCollection, Point } from 'geojson';
import type { Mosque } from '../../lib/mosques';
import { mosqueMatchesId } from '../../lib/mosqueDirectory';
import 'maplibre-gl/dist/maplibre-gl.css';
setWorkerUrl(workerUrl);
function pin(color:string){
 const canvas=document.createElement('canvas');canvas.width=72;canvas.height=88;const c=canvas.getContext('2d')!;
 c.shadowColor='#05081788';c.shadowBlur=8;c.fillStyle=color;c.beginPath();c.moveTo(36,83);c.bezierCurveTo(30,70,8,58,8,36);c.arc(36,36,28,Math.PI,0);c.bezierCurveTo(64,58,42,70,36,83);c.fill();c.shadowBlur=0;
 c.strokeStyle='#f6e8c9';c.lineWidth=2;c.stroke();c.fillStyle='#fff5db';c.fillRect(21,34,30,20);c.beginPath();c.arc(36,34,15,Math.PI,0);c.fill();c.fillStyle=color;c.fillRect(32,42,8,12);c.fillStyle='#fff5db';c.fillRect(17,26,3,28);c.fillRect(52,26,3,28);c.beginPath();c.arc(36,16,3,0,2*Math.PI);c.fill();return c.getImageData(0,0,72,88);
}
function points(mosques:Mosque[],favoriteId?:string):FeatureCollection<Point>{return {type:'FeatureCollection',features:mosques.map(m=>({type:'Feature',geometry:{type:'Point',coordinates:[m.lng,m.lat]},properties:{id:m.id,name:m.name,favorite:favoriteId?mosqueMatchesId(m,favoriteId):false}}))};}
export default function MosqueMap({mosques,lat,lng,favoriteId,onSelect,onLocate,locating}:{mosques:Mosque[];lat:number;lng:number;favoriteId?:string;onSelect:(m:Mosque)=>void;onLocate:()=>void;locating:boolean}) {
 const container=useRef<HTMLDivElement>(null),mapRef=useRef<Map|null>(null),centerRef=useRef<Marker|null>(null),latest=useRef({mosques,onSelect,favoriteId});latest.current={mosques,onSelect,favoriteId};
 const [status,setStatus]=useState<'loading'|'ready'|'unavailable'>('loading'),[attempt,setAttempt]=useState(0);
 useEffect(()=>{
  if(!container.current)return;let map:Map|undefined,active=true;setStatus('loading');
  const timeout=window.setTimeout(()=>{if(active)setStatus(s=>s==='loading'?'unavailable':s);},15000);
  try{
   map=new Map({container:container.current,style:'https://tiles.openfreemap.org/styles/fiord',center:[lng,lat],zoom:11.5,minZoom:3,maxZoom:18,attributionControl:false,cooperativeGestures:true,renderWorldCopies:false,locale:{'NavigationControl.ZoomIn':'Zoomer','NavigationControl.ZoomOut':'Dézoomer','NavigationControl.ResetBearing':'Orienter au nord','CooperativeGesturesHandler.TouchPanBlocker':'Utilisez deux doigts pour déplacer la carte','CooperativeGesturesHandler.WindowsHelpText':'Ctrl + défilement pour zoomer','CooperativeGesturesHandler.MacHelpText':'⌘ + défilement pour zoomer'}});
   mapRef.current=map;
   map.addControl(new NavigationControl({showCompass:false}),'top-right');
   map.addControl(new AttributionControl({compact:false}),'bottom-right');
   const center=document.createElement('div');center.className='mosque-map-center';center.setAttribute('aria-label','Centre de votre recherche');centerRef.current=new Marker({element:center}).setLngLat([lng,lat]).addTo(map);
   map.on('load',()=>{if(!active||!map)return;
    map.addImage('mosque-violet',pin('#746090'),{pixelRatio:2});map.addImage('mosque-gold',pin('#b48a42'),{pixelRatio:2});
    map.addSource('mosques',{type:'geojson',data:points(latest.current.mosques,latest.current.favoriteId),cluster:true,clusterMaxZoom:14,clusterRadius:44});
    map.addLayer({id:'mosque-clusters',type:'circle',source:'mosques',filter:['has','point_count'],paint:{'circle-color':'#746090','circle-radius':['step',['get','point_count'],21,10,25,30,29],'circle-stroke-width':2,'circle-stroke-color':'#d7bd85'}});
    map.addLayer({id:'mosque-cluster-count',type:'symbol',source:'mosques',filter:['has','point_count'],layout:{'text-field':['get','point_count_abbreviated'],'text-size':14,'text-font':['Noto Sans Regular']},paint:{'text-color':'#fff5dc'}});
    map.addLayer({id:'mosque-pins',type:'symbol',source:'mosques',filter:['!',['has','point_count']],layout:{'icon-image':['case',['get','favorite'],'mosque-gold','mosque-violet'],'icon-anchor':'bottom','icon-allow-overlap':true}});
    setStatus('ready');window.clearTimeout(timeout);
   });
   map.on('click','mosque-clusters',async e=>{try{const feature=e.features?.[0];if(!feature||!map)return;const zoom=await (map.getSource('mosques') as GeoJSONSource).getClusterExpansionZoom(Number(feature.properties.cluster_id));if(active&&feature.geometry.type==='Point')map.easeTo({center:feature.geometry.coordinates as [number,number],zoom,duration:window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:450});}catch{/* Retry via manual zoom. */}});
   map.on('click','mosque-pins',e=>{const found=latest.current.mosques.find(m=>m.id===e.features?.[0]?.properties.id);if(found)latest.current.onSelect(found);});
   for(const layer of ['mosque-pins','mosque-clusters']){map.on('mouseenter',layer,()=>{if(map)map.getCanvas().style.cursor='pointer';});map.on('mouseleave',layer,()=>{if(map)map.getCanvas().style.cursor='';});}
   map.on('webglcontextlost',()=>{if(active)setStatus('unavailable');});
   map.on('error',()=>{/* The timeout shows a fallback if the initial style fails. Transient tile errors need no modal. */});
  }catch{setStatus('unavailable');}
  const observer=new ResizeObserver(()=>map?.resize());observer.observe(container.current);
  return()=>{active=false;window.clearTimeout(timeout);observer.disconnect();centerRef.current?.remove();centerRef.current=null;map?.remove();mapRef.current=null;};
 // The map instance is retained while the search center and marker data change.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[attempt]);
 useEffect(()=>{const map=mapRef.current;if(!map)return;(map.getSource('mosques') as GeoJSONSource|undefined)?.setData(points(mosques,favoriteId));},[mosques,favoriteId,status]);
 useEffect(()=>{mapRef.current?.easeTo({center:[lng,lat],zoom:11.5,duration:window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:500});centerRef.current?.setLngLat([lng,lat]);},[lat,lng]);
 return <div className="mosque-map" role="region" aria-label="Carte des mosquées, également accessibles dans la liste ci-dessous">
  <div className="mosque-map-canvas" ref={container}/>
  <div className="mosque-map-label"><span/> AUTOUR DE VOUS</div>
  <button type="button" className="mosque-map-gps" onClick={onLocate} disabled={locating} aria-label="Recentrer la carte sur ma position GPS">{locating?'…':'⌖'}</button>
  {status==='loading'&&<p className="mosque-map-message" role="status">Chargement de la carte…</p>}
  {status==='unavailable'&&<div className="mosque-map-message" role="status"><p>Carte indisponible. Retrouvez les mosquées dans la liste.</p><button type="button" onClick={()=>setAttempt(n=>n+1)}>Réessayer la carte</button></div>}
 </div>;
}
