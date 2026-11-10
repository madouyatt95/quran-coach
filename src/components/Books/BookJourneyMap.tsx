import {useEffect,useState} from 'react';
import {MapContainer,TileLayer,CircleMarker,Tooltip,useMap} from 'react-leaflet';
import type {JourneyPlace} from '../../lib/bookJourney';
import 'leaflet/dist/leaflet.css';
function Fit({places}:{places:JourneyPlace[]}){
 const map=useMap();
 useEffect(()=>{const resize=()=>{map.invalidateSize();map.fitBounds(places.map(p=>[p.lat,p.lng] as [number,number]),{padding:[35,35],maxZoom:8,animate:false});};resize();const observer=new ResizeObserver(resize);observer.observe(map.getContainer());return()=>observer.disconnect();},[map,places]);return null;
}
export default function BookJourneyMap({places,onChoose}:{places:JourneyPlace[];onChoose:(id:string)=>void}){
 const [failed,setFailed]=useState(false);
 return <div className="book-journey-map"><MapContainer center={[places[0].lat,places[0].lng]} zoom={6} scrollWheelZoom={false} dragging={false} touchZoom={false} doubleClickZoom={false} keyboard={false} attributionControl>
 <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' eventHandlers={{tileerror:()=>setFailed(true)}}/>
 <Fit places={places}/>{places.map(p=><CircleMarker key={p.id} center={[p.lat,p.lng]} radius={9} pathOptions={{color:'#f4d58c',fillColor:'#30365a',fillOpacity:1,weight:3}} eventHandlers={{click:()=>onChoose(p.id)}}><Tooltip permanent direction="top">{p.name}</Tooltip></CircleMarker>)}
 </MapContainer>{failed&&<small role="status">Fond de carte indisponible. Les lieux et leurs références restent accessibles ci-dessous.</small>}</div>;
}
