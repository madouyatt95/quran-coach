import type { VercelRequest, VercelResponse } from '@vercel/node';
import { nearbyDirectory, publishedTimetable, automaticTimetable } from '../server/mosqueProviders.js';
const clients=new Map<string,{until:number;count:number}>();
function allowed(client:string){const now=Date.now(),slot=clients.get(client);if(slot&&slot.until>now){slot.count++;return slot.count<=40;}if(clients.size>=500)clients.delete(clients.keys().next().value!);clients.set(client,{until:now+60000,count:1});return true;}
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Vary','Origin');
  const origin=req.headers?.origin;
  if(origin&&['capacitor://localhost','http://localhost','https://localhost'].includes(origin)){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Methods','GET, OPTIONS');}
  if(req.method==='OPTIONS')return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).setHeader('Allow', 'GET').end();
  if(!allowed(String(req.headers?.['x-real-ip']||'unknown'))){res.setHeader('Retry-After','60');return res.status(429).json({error:'Too many requests'});}
  if(req.query.action==='published'){
    const uuid=req.query.slug;
    if(typeof uuid!=='string'||!/^[a-z0-9][a-z0-9_-]{1,179}$/i.test(uuid))return res.status(400).json({error:'Invalid mosque'});
    try{const timetable=await publishedTimetable(uuid);res.setHeader('Cache-Control','public, max-age=60, s-maxage=300');return res.status(200).json({timetable,status:'available'});}catch{return res.status(503).json({error:'Published timetable unavailable'});}
  }
  if(req.query.action==='automatic'){
    const {mosqueId,latitude,longitude,radius}=req.query;
    if(typeof mosqueId!=='string'||!/^[-\w]{1,190}$/.test(mosqueId)||typeof latitude!=='string'||typeof longitude!=='string'||!/^[-]?\d{1,3}(\.\d{1,2})?$/.test(latitude)||!/^[-]?\d{1,3}(\.\d{1,2})?$/.test(longitude)||Math.abs(+latitude)>90||Math.abs(+longitude)>180||!['5000','15000'].includes(String(radius)))return res.status(400).json({error:'Invalid discovery query'});
    try{const result=await automaticTimetable(mosqueId,+latitude,+longitude,Number(radius));res.setHeader('Cache-Control',result.status==='unavailable'?'no-store':'public, max-age=60, s-maxage=300');return res.status(200).json(result);}catch{return res.status(503).json({error:'Discovery unavailable'});}
  }
  let path: string;
  const { id, latitude, longitude, radius } = req.query;
  if (id !== undefined && (typeof id !== 'string' || !/^[\w-]{1,180}$/.test(id))) return res.status(400).json({error:'Invalid mosque'});
  if (typeof id === 'string' && /^[\w-]{1,180}$/.test(id)) path = `/api/public/mosques/${encodeURIComponent(id)}/prayer-times?lang=fr`;
  else {
    if (typeof latitude !== 'string' || typeof longitude !== 'string' || !/^-?\d{1,3}(\.\d{1,2})?$/.test(latitude) || !/^-?\d{1,3}(\.\d{1,2})?$/.test(longitude) || !Number.isFinite(+latitude) || !Number.isFinite(+longitude) || Math.abs(+latitude)>90 || Math.abs(+longitude)>180 || (radius !== '5000' && radius !== '15000')) return res.status(400).json({error:'Invalid coordinates'});
    path = `/api/mosques/nearby?latitude=${latitude}&longitude=${longitude}&maxDistance=${radius}`;
  }
  if(req.query.action==='directory'){
    if(id!==undefined)return res.status(400).json({error:'Invalid directory query'});
    try{const directory=await nearbyDirectory(Number(latitude),Number(longitude),Number(radius));res.setHeader('Cache-Control','public, max-age=60, s-maxage=900');return res.status(200).json(directory);}catch{return res.status(503).json({error:'Directory unavailable'});}
  }
  try {
    const result = await fetch(`https://pray.zone${path}`, { headers: { Accept: 'application/json', 'User-Agent': 'QuranCoach/1.0 (+https://www.quran-coach.fr)' }, signal: AbortSignal.timeout(12000) });
    if (!result.ok) return res.status(result.status === 429 ? 429 : 502).json({error:'Directory unavailable'});
    const data: unknown = await result.json();
    if ((id && (!data || typeof data !== 'object' || !('data' in data))) || (!id && !Array.isArray(data))) return res.status(502).json({error:'Invalid directory response'});
    res.setHeader('Cache-Control', `public, max-age=${id ? 60 : 3600}, s-maxage=${id ? 300 : 86400}`);
    return res.status(200).json(data);
  } catch { return res.status(503).json({error:'Directory unavailable'}); }
}
