import { AUDIO_CATEGORIES, alignmentDuration, assertFrenchScript, assertVoice, estimatedCredits, historyAlignment, productionIdentity, sentenceTimings, sha256, type Alignment, type AudioScript, type VoiceProfile } from '../../../src/lib/audioProduction';

export interface Env {
  AUDIO: R2Bucket; PRODUCTION: Workflow<{batch: string}>;
  SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string; AUDIO_ADMIN_IDS: string;
  ELEVENLABS_ACCOUNTS: string; ALLOWED_ORIGINS: string; GENERATION_ENABLED: string;
}
export interface Account {id: string; label: string; enabled: boolean; authorized_until: string; credit_limit: number; spent: number; reserved: number}
export interface Job {id: string; batch_id: string; account_id: string; script_id: string; fingerprint: string; state: string; voice: VoiceProfile; reserved: number; actual: number|null; started_at: string; history_id?: string; request_id?: string; artifact?: Record<string, unknown>}
export class HttpError extends Error {constructor(public status: number, message: string) {super(message);}}
const requireValue = (condition: unknown, message: string) => {if (!condition) throw new HttpError(400, message);};
export async function db<T>(env: Env, path: string, method = 'GET', body?: unknown): Promise<T> {
  const r = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {method, headers: {apikey:env.SUPABASE_SERVICE_ROLE_KEY, Authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type':'application/json', Prefer:'return=representation'}, body:body === undefined ? undefined : JSON.stringify(body), signal:AbortSignal.timeout(15000)});
  if (!r.ok) throw new HttpError(r.status === 409 ? 409 : 503, r.status === 409 ? 'Cette narration est déjà réservée ou produite. Actualisez le devis.' : 'Opération refusée ou service indisponible. Vérifiez le quota, les validations et les tâches en cours.');
  return (r.status === 204 ? null : await r.json()) as T;
}
const table = (name: string, id: string) => `qc_audio_${name}?id=eq.${encodeURIComponent(id)}`;
export async function row<T>(env: Env, name: string, id: string): Promise<T> {
  const rows = await db<T[]>(env, table(name,id)); if (!rows.length) throw new HttpError(404,'Élément introuvable.'); return rows[0];
}
export const patch = (env: Env, name: string, id: string, body: unknown) => db(env,table(name,id),'PATCH',body);
export const event = (env: Env, actor: string, action: string, entity: string, detail = {}) => db(env,'qc_audio_events','POST',{actor,action,entity,detail});
export function accountKey(env: Env, id: string): string {
  const keys = JSON.parse(env.ELEVENLABS_ACCOUNTS || '{}') as Record<string,string>;
  const key = keys[id]; if (typeof key !== 'string' || key.length < 10) throw new HttpError(409,'Clé serveur absente pour ce compte.'); return key;
}
export async function eleven(env: Env, account: string, path: string, init: RequestInit = {}, version='v1') {
  return fetch(`https://api.elevenlabs.io/${version}/${path}`, {...init, headers:{'xi-api-key':accountKey(env,account),'Content-Type':'application/json'}, signal:AbortSignal.timeout(120000)});
}
export function configuredAccounts(env: Env) {
  const keys = JSON.parse(env.ELEVENLABS_ACCOUNTS || '{}') as Record<string,unknown>;
  return Object.keys(keys).filter(id => /^[a-z0-9_-]{1,40}$/.test(id) && typeof keys[id]==='string' && String(keys[id]).length>=10);
}
export async function providerVoices(env: Env, id: string) {
  const response=await eleven(env,id,'voices?page_size=100',{},'v2');
  if(!response.ok)throw new HttpError(503,'Les voix de ce compte sont momentanément indisponibles.');
  const result=await response.json() as {voices:{voice_id:string;name:string;category:string;description?:string;preview_url?:string;labels?:{language?:string};verified_languages?:{language:string;preview_url?:string}[]}[]};
  const french=(v:typeof result.voices[number])=>v.labels?.language==='fr'||v.verified_languages?.some(l=>l.language==='fr');
  return result.voices.sort((a,b)=>Number(!!french(b))-Number(!!french(a))).map(v=>{
    const preview=v.verified_languages?.find(l=>l.language==='fr')?.preview_url||v.preview_url||'';
    return {id:v.voice_id,name:v.name,category:v.category,description:v.description||'',preview:/^https:\/\//.test(preview)?preview:''};
  });
}
export async function quota(env: Env, id: string) {
  const r = await eleven(env,id,'user/subscription');
  if (!r.ok) throw new HttpError(503,'Quota ElevenLabs inaccessible. Aucune génération lancée.');
  const q = await r.json() as {character_limit:number;character_count:number;tier:string;status:string;next_character_count_reset_unix:number};
  if (!Number.isFinite(q.character_limit) || !Number.isFinite(q.character_count) || !['creator','pro','scale','business','enterprise','starter'].includes(q.tier) || q.status !== 'active') throw new HttpError(409,'Abonnement éligible actif non confirmé.');
  return {remaining:Math.max(0,q.character_limit-q.character_count),tier:q.tier,reset:q.next_character_count_reset_unix};
}
export async function admin(env: Env, request: Request) {
  const bearer=request.headers.get('Authorization'); if (!bearer?.startsWith('Bearer ')) throw new HttpError(401,'Connectez-vous avec votre compte administrateur.');
  const r=await fetch(`${env.SUPABASE_URL}/auth/v1/user`,{headers:{Authorization:bearer,apikey:env.SUPABASE_SERVICE_ROLE_KEY},signal:AbortSignal.timeout(10000)});
  if(!r.ok)throw new HttpError(401,'Session expirée. Reconnectez-vous.');
  const user=await r.json() as {id:string};
  if(!env.AUDIO_ADMIN_IDS?.split(',').map(x=>x.trim()).includes(user.id))throw new HttpError(403,'Ce compte ne dispose pas du rôle de production audio.');
  return user.id;
}
export async function makeQuote(env: Env, actor: string, account: string, scriptIds: string[], voiceId: string) {
  requireValue(Array.isArray(scriptIds)&&scriptIds.length>0&&scriptIds.length<=25&&new Set(scriptIds).size===scriptIds.length,'Sélectionnez entre 1 et 25 scripts distincts.');
  const a=await row<Account>(env,'accounts',account);
  requireValue(a.enabled&&Date.parse(a.authorized_until)>Date.now(),'Ce compte n’est pas autorisé pour cette période.');
  const voice=(await row<{config:VoiceProfile}>(env,'voices',voiceId)).config;assertVoice(voice);
  const available=await quota(env,account);
  const items=[];
  for(const id of scriptIds){
    const script=await row<AudioScript>(env,'scripts',id); requireValue(script.approved_by,'Un script attend sa validation éditoriale.');
    const amounts=estimatedCredits(script.text,voice),fingerprint=await sha256(productionIdentity(script.text,voice));
    const duplicates=await db<Job[]>(env,`qc_audio_jobs?fingerprint=eq.${fingerprint}&select=id,state`);
    requireValue(!duplicates.length,`« ${script.title} » possède déjà une production avec ces réglages.`);
    items.push({script_id:id,title:script.title,voice,fingerprint,...amounts});
  }
  const estimated=items.reduce((n,i)=>n+i.estimate,0),ceiling=items.reduce((n,i)=>n+i.reserved,0);
  requireValue(a.spent+a.reserved+ceiling<=a.credit_limit&&a.reserved+ceiling<=available.remaining,'Ce lot dépasse le budget autorisé ou les crédits disponibles. Réduisez la sélection ou choisissez un autre compte autorisé.');
  const [quote]=await db<Record<string,unknown>[]>(env,'qc_audio_quotes','POST',{account_id:account,items,estimated,ceiling,created_by:actor});
  return {...quote,remaining:available.remaining};
}
export async function saveScript(env: Env, actor: string, input: AudioScript, approve: boolean) {
  assertFrenchScript(input.text);
  requireValue(input.title?.trim()&&input.title.length<=180&&Object.hasOwn(AUDIO_CATEGORIES,input.category),'Titre ou catégorie invalide.');
  requireValue(input.original_text?.length<=20000&&input.original_text.length>0,'Texte d’origine requis.');
  requireValue(input.reference?.trim()&&input.rights?.trim()&&input.source_url?.trim(),'Référence, provenance et droits sont requis.');
  requireValue(input.reference.length<=2000&&input.rights.length<=3000&&input.source_url.length<=1000,'Références trop longues.');
  requireValue(/^https:\/\//.test(input.source_url)||/^\/(?!\/)/.test(input.source_url),'Source invalide.');
  const clean={title:input.title,category:input.category,text:input.text,original_text:input.original_text,source_url:input.source_url,reference:input.reference,rights:input.rights};
  const id=await sha256(JSON.stringify(clean));
  const old=await db<AudioScript[]>(env,table('scripts',id));
  if(!old.length)await db(env,'qc_audio_scripts','POST',{...clean,id});
  if(approve){await event(env,actor,'approve_script',id,{reference:input.reference,rights:input.rights});await patch(env,'scripts',id,{approved_by:actor,approved_at:new Date().toISOString()});}
  return row<AudioScript>(env,'scripts',id);
}
export async function saveVoice(env: Env, actor: string, voice: VoiceProfile) {
  assertVoice(voice);requireValue(voice.name?.trim()&&voice.name.length<=100,'Nom du profil requis.');
  const clean={name:voice.name,voice_id:voice.voice_id,model_id:voice.model_id,stability:voice.stability,similarity:voice.similarity,style:voice.style,credits_per_character:voice.credits_per_character};
  const id=await sha256(JSON.stringify(clean));
  if(!(await db(env,table('voices',id)) as unknown[]).length)await db(env,'qc_audio_voices','POST',{id,config:{...clean,id}});
  await event(env,actor,'save_voice',id);return {id,config:{...clean,id}};
}

interface Result {audio_base64:string;alignment:Alignment|null;request_id?:string;history_id?:string;actual?:number|null}
export async function storeResult(env: Env, job: Job, result: Result, script: AudioScript) {
  if(!result.audio_base64||result.audio_base64.length>16000000)throw new Error('Audio absent ou trop volumineux.');
  const audio=Uint8Array.from(atob(result.audio_base64),c=>c.charCodeAt(0));
  if(audio.length<512)throw new Error('Audio incomplet.');
  const duration=alignmentDuration(script.text,result.alignment);
  if(duration<=0)throw new Error('Durée ou alignement absent. Résultat conservé pour vérification.');
  const key=`recordings/${job.fingerprint}.mp3`,digest=await sha256(audio.buffer);
  await env.AUDIO.put(key,audio,{httpMetadata:{contentType:'audio/mpeg'},customMetadata:{sha256:digest,job:job.id}});
  const sentences=sentenceTimings(script.text,result.alignment);
  const artifact={id:job.id,title:script.title,category:script.category,text:script.text,original_text:script.original_text,sourceUrl:script.source_url,reference:script.reference,key,duration,bytes:audio.length,sha256:digest,sentences,narrator:`ElevenLabs · ${job.voice.name}`};
  await patch(env,'jobs',job.id,{request_id:result.request_id||job.request_id||null,history_id:result.history_id||job.history_id||null});
  await db(env,'rpc/qc_audio_finish','POST',{p_job:job.id,p_artifact:artifact,p_actual:result.actual??null});
}
export async function reconcile(env: Env, job: Job, suppliedHistory?: string) {
  requireValue(job.state!=='generating'||Date.parse(job.started_at)<Date.now()-180000,'La génération est encore en cours.');
  const script=await row<AudioScript>(env,'scripts',job.script_id);
  const saved=await env.AUDIO.get(`receipts/${job.id}.json`);
  let receipt=saved?await saved.json<Result>():null;
  const historyId=suppliedHistory||receipt?.history_id||job.history_id;
  let actual=receipt?.actual??null;
  if(historyId){
    requireValue(/^[\w-]{1,100}$/.test(historyId),'Identifiant historique invalide.');
    const response=await eleven(env,job.account_id,`history/${historyId}`);
    requireValue(response.ok,'Historique introuvable sur ce compte.');
    const h=await response.json() as {text:string;voice_id:string;model_id:string;request_id:string;date_unix:number;character_count_change_to:number;character_count_change_from:number;alignments?:{alignment?:Alignment;normalized_alignment?:Alignment}};
    requireValue(h.text===script.text&&h.voice_id===job.voice.voice_id&&h.model_id===job.voice.model_id&&h.date_unix>=Math.floor(Date.parse(job.started_at)/1000)-5,'L’historique ne correspond pas exactement à cette production.');
    requireValue(!job.request_id||h.request_id===job.request_id,'La requête ne correspond pas.');
    const assigned=await db<Job[]>(env,`qc_audio_jobs?account_id=eq.${encodeURIComponent(job.account_id)}&history_id=eq.${encodeURIComponent(historyId)}&id=neq.${job.id}`);
    requireValue(!assigned.length,'Cet historique est déjà associé à un autre audio.');
    const delta=h.character_count_change_to-h.character_count_change_from;
    if(Number.isSafeInteger(delta)&&delta>=0)actual=delta;
    if(!receipt){
      const r=await eleven(env,job.account_id,`history/${historyId}/audio`);requireValue(r.ok,'Téléchargement de l’historique indisponible.');
      const bytes=new Uint8Array(await r.arrayBuffer());let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);
      receipt={audio_base64:btoa(binary),alignment:h.alignments?.alignment||null,request_id:h.request_id,history_id:historyId};
    }
    receipt.history_id=historyId;receipt.actual=actual;
  }
  requireValue(receipt,'Aucun fichier récupérable. Retrouvez l’identifiant dans l’historique ElevenLabs. Aucune nouvelle génération n’a été lancée.');
  receipt!.alignment=historyAlignment(script.text,receipt!.alignment);
  const duration=alignmentDuration(script.text,receipt!.alignment);
  requireValue(duration>0,'Horodatages récupérés incohérents. Le fichier est conservé ; aucune nouvelle génération lancée.');
  await env.AUDIO.put(`receipts/${job.id}.json`,JSON.stringify(receipt),{httpMetadata:{contentType:'application/json'}});
  if(job.artifact){
    if(actual!==null)await db(env,'rpc/qc_audio_settle','POST',{p_job:job.id,p_actual:actual});
    // Metadata repair is independent of idempotent billing: a recovered file may
    // already be in review. Keep its bytes, digest and publication status intact.
    await patch(env,'jobs',job.id,{artifact:{...job.artifact,duration,sentences:sentenceTimings(script.text,receipt!.alignment)}});
  }else await storeResult(env,job,receipt!,script);
  return {recovered:true,actual};
}
export async function produceOne(env: Env, jobId: string): Promise<boolean> {
  if(env.GENERATION_ENABLED!=='true')throw new Error('Génération désactivée sur le serveur.');
  const original=await row<Job>(env,'jobs',jobId);
  if(original.state!=='queued')return original.state!=='uncertain'&&original.state!=='generating';
  // Preflight calls cannot spend TTS credits. Keep queued jobs resumable on quota/network errors.
  const q=await quota(env,original.account_id);
  const a=await row<Account>(env,'accounts',original.account_id);
  if(q.remaining<a.reserved){await patch(env,'batches',original.batch_id,{paused:true});return false;}
  const script=await row<AudioScript>(env,'scripts',original.script_id);assertFrenchScript(script.text);assertVoice(original.voice);
  const job=await db<Job|null>(env,'rpc/qc_audio_claim','POST',{p_job:jobId});if(!job)return false;
  try {
    if(job.account_id!==original.account_id)throw new Error('Le compte a changé pendant la préparation. Vérification requise.');
    // No retry here: provider billing may have happened even if the response was lost.
    const response=await eleven(env,job.account_id,`text-to-speech/${job.voice.voice_id}/with-timestamps?output_format=mp3_44100_128`,{method:'POST',body:JSON.stringify({text:script.text,model_id:job.voice.model_id,language_code:'fr',voice_settings:{stability:job.voice.stability,similarity_boost:job.voice.similarity,style:job.voice.style,use_speaker_boost:true},apply_text_normalization:'auto'})});
    if(!response.ok)throw new Error(`ElevenLabs HTTP ${response.status}. Vérification requise avant toute reprise.`);
    const result=await response.json() as Result;
    result.request_id=response.headers.get('request-id')||undefined;
    result.history_id=response.headers.get('history-item-id')||undefined;
    const cost=response.headers.get('character-cost');
    result.actual=cost!==null&&/^\d+$/.test(cost)?Number(cost):null;
    // Durable receipt first. A failed DB write or encoding step never requires a new paid call.
    await env.AUDIO.put(`receipts/${job.id}.json`,JSON.stringify(result),{httpMetadata:{contentType:'application/json'}});
    await storeResult(env,job,result,script);return true;
  } catch {
    await patch(env,'jobs',job.id,{state:'uncertain',error:'Résultat à vérifier. Reprendre par récupération, sans nouvelle dépense.'});
    await patch(env,'batches',job.batch_id,{paused:true});
    await event(env,'worker','uncertain',job.id);return false;
  }
}

export async function media(env: Env, request: Request, id: string, preview=false) {
  const job=await row<Job>(env,'jobs',id);
  if(!preview&&job.state!=='published')throw new HttpError(404,'Audio introuvable.');
  if(!job.artifact?.key)throw new HttpError(404,'Audio indisponible.');
  const key=String(job.artifact.key),head=await env.AUDIO.head(key);if(!head)throw new HttpError(404,'Fichier indisponible.');
  const headers=new Headers({'Content-Type':'audio/mpeg','Accept-Ranges':'bytes','ETag':head.httpEtag,'Cache-Control':preview?'private, no-store':'public, max-age=300'});
  let range:{offset:number;length:number}|undefined;
  const requested=request.headers.get('Range');
  if(requested){
    const m=/^bytes=(\d*)-(\d*)$/.exec(requested);
    if(!m||(!m[1]&&!m[2]))return new Response(null,{status:416,headers:{'Content-Range':`bytes */${head.size}`}});
    const offset=m[1]?Number(m[1]):Math.max(0,head.size-Number(m[2]));
    const end=m[1]?(m[2]?Math.min(head.size-1,Number(m[2])):head.size-1):head.size-1;
    if(offset> end||offset>=head.size)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${head.size}`}});
    range={offset,length:end-offset+1};headers.set('Content-Range',`bytes ${offset}-${end}/${head.size}`);
  }
  headers.set('Content-Length',String(range?.length??head.size));
  const object=request.method==='HEAD'?null:await env.AUDIO.get(key,range?{range}:undefined);
  return new Response(object?.body||null,{status:range?206:200,headers});
}
