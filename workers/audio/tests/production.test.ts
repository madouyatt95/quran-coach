// @vitest-environment node
import {afterEach, describe, expect, it, vi} from 'vitest';
import {admin, accountKey, configuredAccounts, decodeAudioBase64, encodeAudioBase64, discoverHistory, produceOne, media, providerVoices, publishVerified, type Env, type Job} from '../src/service';
import type {AudioScript} from '../../../src/lib/audioProduction';

function fixture() {
 const job: Job = {id:'job',batch_id:'batch',account_id:'primary',script_id:'script',fingerprint:'hash',state:'queued',reserved:100,actual:null,started_at:new Date().toISOString(),voice:{id:'voice',name:'Cours',voice_id:'abcdefgh12345678',model_id:'eleven_multilingual_v2',stability:.5,similarity:.7,style:.1,credits_per_character:1}};
 const puts = new Map<string,unknown>();
 const bucket = {put:vi.fn(async(key:string,value:unknown)=>{puts.set(key,value);}),head:vi.fn(async()=>({size:1000,httpEtag:'"etag"'})),get:vi.fn(async()=>({body:new Uint8Array(10)}))};
 const env = {GENERATION_ENABLED:'true',SUPABASE_URL:'https://db.test',SUPABASE_SERVICE_ROLE_KEY:'test-only',ELEVENLABS_ACCOUNTS:JSON.stringify({primary:'test-only-key'}),AUDIO:bucket} as unknown as Env;
 let remaining = 1000;
 const tts = vi.fn(async()=>new Response('unavailable',{status:503}));
 const fetchMock = vi.fn(async(input:string|URL|Request,init?:RequestInit)=>{
  const url=String(input), body=init?.body?JSON.parse(String(init.body)):{};
  if(url.includes('/user/subscription'))return Response.json({character_limit:remaining,character_count:0,tier:'creator',status:'active'});
  if(url.includes('/text-to-speech/'))return tts();
  if(url.includes('/qc_audio_jobs?')){if(init?.method==='PATCH')Object.assign(job,body);return Response.json([job]);}
  if(url.includes('/qc_audio_accounts?'))return Response.json([{reserved:100}]);
  if(url.includes('/qc_audio_scripts?'))return Response.json([{id:'script',text:'Bonjour.',title:'Test',category:'academy'}]);
  if(url.endsWith('/rpc/qc_audio_claim')){if(job.state!=='queued')return Response.json(null);job.state='generating';return Response.json(job);}
  if(url.endsWith('/rpc/qc_audio_finish')){job.state='review';return Response.json(null);}
  return Response.json([]);
 });
 vi.stubGlobal('fetch',fetchMock);
 return {job,env,tts,fetchMock,puts,bucket,setRemaining:(value:number)=>{remaining=value;}};
}
afterEach(()=>vi.unstubAllGlobals());
describe('paid production boundaries',()=>{
 it('requires an explicit owner waiver and records that no human listening is attested',async()=>{
  const f=fixture(),id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  Object.assign(f.job,{id,state:'review',actual:50,artifact:{text:'Bonjour.',key:'recordings/hash.mp3',duration:8,bytes:1000,sha256:'digest',sentences:[{sentence:0,start:0,end:8}]}});
  f.bucket.head.mockResolvedValue({size:1000,httpEtag:'etag',customMetadata:{sha256:'digest'}});
  const writes:Record<string,unknown>[]=[];
  vi.stubGlobal('fetch',vi.fn(async(input:string|URL|Request,init?:RequestInit)=>{
   const url=String(input);
   if(init?.method==='POST'||init?.method==='PATCH'){writes.push(JSON.parse(String(init.body)));return Response.json([]);}
   if(url.includes('qc_audio_jobs?'))return Response.json([f.job]);
   if(url.includes('qc_audio_scripts?'))return Response.json([{text:'Bonjour.',approved_by:'admin'}]);
   return Response.json([]);
  }));
  const approval={jobs:[id],ownerAuthorized:true,textsChecked:true,filesChecked:true};
  await expect(publishVerified(f.env,'admin',{...approval,ownerAuthorized:false})).rejects.toThrow();
  expect(writes).toHaveLength(0);
  await expect(publishVerified(f.env,'admin',approval)).resolves.toEqual({published:1,humanListened:false});
  expect(writes[0]).toMatchObject({action:'publish_owner_authorized',detail:{humanListened:false}});
  expect(writes[1]).toMatchObject({state:'published'});
 });
 it('refuses publication of incomplete, unsettled or mismatching audio before writing',async()=>{
  const f=fixture(),id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  Object.assign(f.job,{id,state:'review',actual:null});
  const calls=vi.fn(async(input:string|URL|Request)=>Response.json(String(input).includes('qc_audio_jobs?')?[f.job]:[]));
  vi.stubGlobal('fetch',calls);
  await expect(publishVerified(f.env,'admin',{jobs:[id],ownerAuthorized:true,textsChecked:true,filesChecked:true})).rejects.toThrow();
  expect(calls.mock.calls).toHaveLength(1);
  expect(f.bucket.head).not.toHaveBeenCalled();
 });
 it('adds an independent account secret without exposing or replacing the first account',()=>{
  const {env}=fixture();
  env.ELEVENLABS_KEY_LIVRES_COMPTE_2='test-only-second-key';
  expect(configuredAccounts(env)).toEqual(['primary','livres_compte_2']);
  expect(accountKey(env,'primary')).toBe('test-only-key');
  expect(accountKey(env,'livres_compte_2')).toBe('test-only-second-key');
  expect(()=>accountKey(env,'SUPABASE_SERVICE_ROLE_KEY')).toThrow();
  expect(()=>accountKey(env,'constructor')).toThrow();
  expect(()=>accountKey(env,'__proto__')).toThrow();
 });
 it('preserves every byte of a long MP3-size binary without per-byte callback or concatenation overhead',()=>{
  const audio=new Uint8Array(3500001);for(let i=0;i<audio.length;i++)audio[i]=i%256;
  const base64=encodeAudioBase64(audio);
  expect(base64).toBe(Buffer.from(audio).toString('base64'));
  expect(Buffer.from(decodeAudioBase64(base64)).equals(Buffer.from(audio))).toBe(true);
  expect(decodeAudioBase64('')).toHaveLength(0);
 });
 it('finds a lost result by exact text, voice, settings and time without another TTS call',async()=>{
  const f=fixture(),script={text:'Bonjour.'} as AudioScript;
  const match={history_item_id:'existing',text:script.text,voice_id:f.job.voice.voice_id,model_id:f.job.voice.model_id,date_unix:Math.floor(Date.parse(f.job.started_at)/1000),settings:{stability:.5,similarity_boost:.7,style:.1}};
  const read=vi.fn(async()=>Response.json({history:[{...match,voice_id:'another-voice'},match],has_more:false}));
  vi.stubGlobal('fetch',read);
  expect(await discoverHistory(f.env,f.job,script)).toBe('existing');
  expect(String(read.mock.calls[0][0])).toContain('/v1/history?');
  expect(String(read.mock.calls[0][0])).toContain('date_after_unix=');
  expect(f.tts).not.toHaveBeenCalled();
 });
 it('does not choose an ambiguous, incomplete or mismatching history result',async()=>{
  const f=fixture(),script={text:'Bonjour.'} as AudioScript;
  const match={history_item_id:'one',text:script.text,voice_id:f.job.voice.voice_id,model_id:f.job.voice.model_id,date_unix:Math.floor(Date.parse(f.job.started_at)/1000),settings:{stability:.5,similarity_boost:.7,style:.1}};
  for(const result of [{history:[match,{...match,history_item_id:'two'}],has_more:false},{history:[match],has_more:true},{history:[{...match,text:'Un autre texte.'}],has_more:false}]){
   vi.stubGlobal('fetch',vi.fn(async()=>Response.json(result)));
   await expect(discoverHistory(f.env,f.job,script)).rejects.toThrow();
  }
  expect(f.tts).not.toHaveBeenCalled();
 });
 it('rejects anonymous and non-allowlisted admin sessions',async()=>{const f=fixture();await expect(admin(f.env,new Request('https://audio.test/admin/state'))).rejects.toMatchObject({status:401});expect(f.fetchMock).not.toHaveBeenCalled();vi.stubGlobal('fetch',vi.fn(async()=>Response.json({id:'someone-else'})));f.env.AUDIO_ADMIN_IDS='owner-id';await expect(admin(f.env,new Request('https://audio.test/admin/state',{headers:{Authorization:'Bearer session'}}))).rejects.toMatchObject({status:403});});
 it('accepts only the verified Supabase user selected by the owner',async()=>{const f=fixture();vi.stubGlobal('fetch',vi.fn(async()=>Response.json({id:'owner-id'})));f.env.AUDIO_ADMIN_IDS='owner-id';expect(await admin(f.env,new Request('https://audio.test/admin/state',{headers:{Authorization:'Bearer session'}}))).toBe('owner-id');});
 it('lists multilingual voice choices without returning private provider metadata',async()=>{const f=fixture();const read=vi.fn(async()=>Response.json({voices:[{voice_id:'a-voice',name:'Narrateur',category:'professional',preview_url:'https://cdn.test/preview.mp3',sharing:{whitelisted_emails:['private@test']},samples:[{private:true}]}]}));vi.stubGlobal('fetch',read);const voices=await providerVoices(f.env,'primary');expect(read.mock.calls[0][0]).toBe('https://api.elevenlabs.io/v2/voices?page_size=100');expect(JSON.stringify(voices)).not.toContain('private@test');expect(voices[0].name).toBe('Narrateur');});
 it('does not even call a provider when generation is disabled',async()=>{const f=fixture();f.env.GENERATION_ENABLED='false';await expect(produceOne(f.env,'job')).rejects.toThrow();expect(f.fetchMock).not.toHaveBeenCalled();});
 it('does not regenerate finished work',async()=>{const f=fixture();f.job.state='review';expect(await produceOne(f.env,'job')).toBe(true);expect(f.tts).not.toHaveBeenCalled();});
 it('pauses before spending when remaining credits no longer cover reservations',async()=>{const f=fixture();f.setRemaining(99);expect(await produceOne(f.env,'job')).toBe(false);expect(f.tts).not.toHaveBeenCalled();expect(f.job.state).toBe('queued');});
 it('never retries a failed paid request on resume',async()=>{const f=fixture();expect(await produceOne(f.env,'job')).toBe(false);expect(f.job.state).toBe('uncertain');expect(await produceOne(f.env,'job')).toBe(false);expect(f.tts).toHaveBeenCalledTimes(1);});
 it('keeps an ambiguous network failure blocked',async()=>{const f=fixture();f.tts.mockRejectedValueOnce(new Error('response lost'));expect(await produceOne(f.env,'job')).toBe(false);expect(await produceOne(f.env,'job')).toBe(false);expect(f.tts).toHaveBeenCalledTimes(1);});
 it('saves a durable receipt before metadata, without inventing actual cost',async()=>{const f=fixture();f.tts.mockResolvedValueOnce(Response.json({audio_base64:btoa('x'.repeat(600)),alignment:{characters:Array.from('Bonjour.'),character_start_times_seconds:[0,1,2,3,4,5,6,7],character_end_times_seconds:[1,2,3,4,5,6,7,8]}}));expect(await produceOne(f.env,'job')).toBe(true);expect([...f.puts.keys()]).toEqual(['receipts/job.json','recordings/hash.mp3']);const finish=f.fetchMock.mock.calls.find(([url])=>String(url).endsWith('rpc/qc_audio_finish'));expect(JSON.parse(String(finish?.[1]?.body)).p_actual).toBeNull();});
 it('never serves unpublished audio',async()=>{const f=fixture();f.job.artifact={key:'private.mp3'};await expect(media(f.env,new Request('https://audio.test/media/job.mp3'),'job')).rejects.toMatchObject({status:404});expect(f.bucket.get).not.toHaveBeenCalled();});
 it('supports iOS range headers and rejects invalid byte ranges',async()=>{const f=fixture();f.job.state='published';f.job.artifact={key:'recording.mp3'};const response=await media(f.env,new Request('https://audio.test/media/job.mp3',{method:'HEAD',headers:{Range:'bytes=100-199'}}),'job');expect(response.status).toBe(206);expect(response.headers.get('Content-Range')).toBe('bytes 100-199/1000');expect(f.bucket.get).not.toHaveBeenCalled();expect((await media(f.env,new Request('https://audio.test/media/job.mp3',{headers:{Range:'bytes=1001-'}}),'job')).status).toBe(416);});
});
