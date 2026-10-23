import {AUDIO_API} from './audioLibrary';
import {progressClient} from './progressVault';
export async function audioAdmin<T>(path:string,body?:unknown,signal?:AbortSignal):Promise<T>{
 if(!AUDIO_API)throw new Error('Le serveur de production audio n’est pas encore raccordé. Les générations restent désactivées.');
 const {data:{session}}=await progressClient().auth.getSession();
 if(!session)throw new Error('Connectez-vous dans Réglages → Sauvegarde avec le compte administrateur autorisé.');
 const response=await fetch(`${AUDIO_API}/admin/${path}`,{method:body===undefined?'GET':'POST',headers:{Authorization:`Bearer ${session.access_token}`,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:signal??AbortSignal.timeout(60000)});
 const result=await response.json();if(!response.ok)throw new Error(result.error||'Opération indisponible.');return result as T;
}
export async function audioPreview(job:string){
 const {data:{session}}=await progressClient().auth.getSession();if(!session)throw new Error('Session expirée.');
 const response=await fetch(`${AUDIO_API}/admin/preview/${job}`,{headers:{Authorization:`Bearer ${session.access_token}`},signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw new Error('Préécoute indisponible.');return URL.createObjectURL(await response.blob());
}
