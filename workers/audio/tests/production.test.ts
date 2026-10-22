// @vitest-environment node
import {afterEach, describe, expect, it, vi} from 'vitest';
import {admin, produceOne, media, providerVoices, type Env, type Job} from '../src/service';

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
