import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from 'cloudflare:workers';
import { admin, accountKey, configuredAccounts, db, event, HttpError, makeQuote, media, patch, produceOne, providerVoices, publishVerified, quota, reconcile, row, saveScript, saveVoice, type Account, type Env, type Job } from './service';
import type { AudioScript, VoiceProfile } from '../../../src/lib/audioProduction';
import { continueProduction, productionWindow, type ProductionRun } from './productionWindow';

export class AudioProduction extends WorkflowEntrypoint<Env,ProductionRun> {
  async run(input:WorkflowEvent<ProductionRun>,step:WorkflowStep) {
    const jobs=await step.do('load-jobs',()=>db<{id:string}[]>(this.env,`qc_audio_jobs?batch_id=eq.${encodeURIComponent(input.payload.batch)}&select=id&order=created_at.asc,id.asc`));
    const window=productionWindow(jobs,input.payload.offset);
    for(const job of window.jobs){
      // Disable retries for the entire paid step. DB claims also prevent duplicates after a crash.
      const proceed=await step.do(`produce-${job.id}`,{retries:{limit:0,delay:'1 second'},timeout:'5 minutes'},()=>produceOne(this.env,job.id));
      if(!proceed)return {paused:true};
    }
    if(window.next!==null){
      // Continue the same approved batch in a fresh invocation. The deterministic
      // ID and atomic DB claims protect against duplicate charges after a crash.
      const offset=window.next;
      await step.do('continue-approved-batch',{retries:{limit:4,delay:'15 seconds',backoff:'exponential'}},async()=>{
        if(this.env.GENERATION_ENABLED!=='true')throw new Error('Génération désactivée.');
        const params={...input.payload,offset};
        await continueProduction(this.env.PRODUCTION,params);
      });
      return {continued:true,offset};
    }
    return {complete:true};
  }
}
const json=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
function check(value:unknown,message:string):asserts value {if(!value)throw new HttpError(400,message);}
async function dispatch(env:Env,batch:string) {
  check(env.GENERATION_ENABLED==='true','La génération réelle est désactivée. Le raccordement doit être validé avant le premier lot.');
  // An interrupted dispatch can be repeated safely: every job is atomically claimed in Postgres.
  const run=crypto.randomUUID();
  const instance=await env.PRODUCTION.create({id:`${batch}-${run}`,params:{batch,run,offset:0}});
  return {batch,workflow:instance.id};
}
async function handle(request:Request,env:Env) {
  const url=new URL(request.url),path=url.pathname;
  if(path==='/health')return json({service:'quran-coach-audio',generationEnabled:env.GENERATION_ENABLED==='true'});
  if(path==='/catalog'&&request.method==='GET'){
    const jobs=await db<Job[]>(env,'qc_audio_jobs?state=eq.published&select=id,artifact&order=created_at.desc&limit=1000');
    return json(jobs.filter(j=>j.artifact).map(j=>{const artifact={...j.artifact!};delete artifact.key;return {...artifact,url:`${url.origin}/media/${j.id}.mp3`};}));
  }
  const publicMedia=/^\/media\/([0-9a-f-]{36})\.mp3$/.exec(path);
  if(publicMedia&&['GET','HEAD'].includes(request.method))return media(env,request,publicMedia[1]);
  if(!path.startsWith('/admin/'))throw new HttpError(404,'Route introuvable.');
  const actor=await admin(env,request);
  if(path==='/admin/access'&&request.method==='GET')return json({audioStudio:true});
  const preview=/^\/admin\/preview\/([0-9a-f-]{36})$/.exec(path);
  if(preview&&request.method==='GET')return media(env,request,preview[1],true);
  if(path==='/admin/state'&&request.method==='GET'){
    const [accounts,scripts,voices,batches,jobs,events]=await Promise.all([
      db<Account[]>(env,'qc_audio_accounts?order=label'),db(env,'qc_audio_scripts?order=created_at.desc&limit=1000'),
      db(env,'qc_audio_voices?order=created_at.desc'),db(env,'qc_audio_batches?order=approved_at.desc&limit=50'),
      db(env,'qc_audio_jobs?order=created_at.desc&limit=1000'),db(env,'qc_audio_events?order=at.desc&limit=50')]);
    return json({configuredAccounts:configuredAccounts(env),accounts:accounts.map(a=>{let configured=false;try{accountKey(env,a.id);configured=true;}catch{/* No key disclosed. */}return {...a,configured};}),scripts,voices,batches,jobs,events,generationEnabled:env.GENERATION_ENABLED==='true'});
  }
  if(request.method!=='POST')throw new HttpError(405,'Méthode non autorisée.');
  if(Number(request.headers.get('Content-Length'))>60000)throw new HttpError(413,'Requête trop volumineuse.');
  const raw=await request.text();check(raw.length<=60000,'Requête trop volumineuse.');
  const b=JSON.parse(raw) as Record<string,unknown>;
  if(path==='/admin/script')return json(await saveScript(env,actor,b.script as AudioScript,b.approve===true));
  if(path==='/admin/voice')return json(await saveVoice(env,actor,b.voice as VoiceProfile));
  if(path==='/admin/account'){
    check(typeof b.id==='string'&&/^[a-z0-9_-]{1,40}$/.test(b.id),'Identifiant de compte invalide.');
    check(typeof b.label==='string'&&b.label.length>0&&b.label.length<100,'Nom requis.');
    check(b.termsConfirmed===true&&b.noOverageConfirmed===true,'Confirmez les droits du compte et la désactivation des dépassements payants.');
    check(typeof b.until==='string'&&Date.parse(b.until)>Date.now(),'Date de fin d’autorisation requise.');
    check(Number.isSafeInteger(b.limit)&&Number(b.limit)>0&&Number(b.limit)<=10000000,'Budget invalide.');
    // Immutable account authorizations: budget increases/renewals require deliberate server maintenance.
    const result=await db(env,'qc_audio_accounts','POST',{id:b.id,label:b.label,enabled:true,authorized_until:b.until,credit_limit:b.limit,terms_confirmed_at:new Date().toISOString()});
    await event(env,actor,'authorize_account',b.id,{limit:b.limit,until:b.until});return json(result);
  }
  if(path==='/admin/quota')return json(await quota(env,String(b.account)));
  if(path==='/admin/provider-voices')return json(await providerVoices(env,String(b.account)));
  if(path==='/admin/publish-verified')return json(await publishVerified(env,actor,b));
  if(path==='/admin/quote')return json(await makeQuote(env,actor,String(b.account),b.scripts as string[],String(b.voice)));
  if(path==='/admin/approve'){
    check(env.GENERATION_ENABLED==='true','La génération réelle est désactivée.');
    const quote=await row<{id:string;account_id:string;ceiling:number}>(env,'quotes',String(b.quote));
    check(b.confirmed===true&&b.ceiling===quote.ceiling,'Validation explicite du plafond requise.');
    const available=await quota(env,quote.account_id);
    const batch=await db<string>(env,'rpc/qc_audio_approve','POST',{p_quote:quote.id,p_actor:actor,p_available:available.remaining});
    return json(await dispatch(env,batch));
  }
  if(path==='/admin/resume'){
    const batch=await row<{id:string;account_id:string}>(env,'batches',String(b.batch));
    check(b.confirmed===true,'Confirmez la reprise des tâches déjà approuvées.');
    await patch(env,'batches',batch.id,{paused:false});await event(env,actor,'resume',batch.id);
    return json(await dispatch(env,batch.id));
  }
  if(path==='/admin/pause'){
    await patch(env,'batches',String(b.batch),{paused:true});await event(env,actor,'pause',String(b.batch));return json({paused:true});
  }
  if(path==='/admin/transfer'){
    check(b.confirmed===true,'Confirmez le compte de destination et ses conditions d’utilisation.');
    const available=await quota(env,String(b.account));
    await db(env,'rpc/qc_audio_transfer','POST',{p_batch:b.batch,p_account:b.account,p_actor:actor,p_available:available.remaining});
    // Switching never dispatches automatically. The admin must explicitly resume the batch.
    await patch(env,'batches',String(b.batch),{paused:true});return json({transferred:true});
  }
  if(path==='/admin/reconcile'){
    const job=await row<Job>(env,'jobs',String(b.job));
    await event(env,actor,'reconcile',job.id);return json(await reconcile(env,job,typeof b.history==='string'?b.history:undefined));
  }
  if(path==='/admin/review'){
    const job=await row<Job>(env,'jobs',String(b.job));
    check(['review','published','rejected'].includes(job.state)&&job.artifact,'Audio à vérifier introuvable.');
    check(b.listened===true,'Écoutez l’audio et confirmez sa vérification.');
    check(['published','rejected'].includes(String(b.state)),'Décision invalide.');
    await event(env,actor,String(b.state),job.id);
    await patch(env,'jobs',job.id,{state:b.state,reviewed_by:actor,reviewed_at:new Date().toISOString()});return json({saved:true});
  }
  throw new HttpError(404,'Route introuvable.');
}
export default {
  async fetch(request:Request,env:Env):Promise<Response>{
    const origin=request.headers.get('Origin'),allowed=env.ALLOWED_ORIGINS?.split(',').map(x=>x.trim())||[];
    if(origin&&!allowed.includes(origin))return json({error:'Origine non autorisée.'},403);
    const cors={'Access-Control-Allow-Origin':origin||allowed[0]||'', 'Access-Control-Allow-Methods':'GET,HEAD,POST,OPTIONS','Access-Control-Allow-Headers':'Authorization,Content-Type,Range','Access-Control-Expose-Headers':'Content-Length,Content-Range,Accept-Ranges,ETag',Vary:'Origin'};
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
    try{const r=await handle(request,env);Object.entries(cors).forEach(([k,v])=>r.headers.set(k,v));r.headers.set('X-Content-Type-Options','nosniff');return r;}
    catch(error){const r=json({error:error instanceof HttpError?error.message:'Opération interrompue. Actualisez son état avant de réessayer.'},error instanceof HttpError?error.status:500);Object.entries(cors).forEach(([k,v])=>r.headers.set(k,v));return r;}
  }
} satisfies ExportedHandler<Env>;
