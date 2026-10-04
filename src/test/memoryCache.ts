/** Response bodies are cloned as real CacheStorage does, to catch consumed-body bugs. */
export function createMemoryCaches() {
 const stores=new Map<string,Map<string,Response>>();
 const key=(request:RequestInfo|URL)=>typeof request==='string'?request:request instanceof URL?request.href:request.url;
 return {open:async(name:string)=>{if(!stores.has(name))stores.set(name,new Map());const data=stores.get(name)!;
 return {match:async(request:RequestInfo|URL)=>data.get(key(request))?.clone(),put:async(request:RequestInfo|URL,response:Response)=>{data.set(key(request),response.clone());},delete:async(request:RequestInfo|URL)=>data.delete(key(request))};},delete:async(name:string)=>stores.delete(name)};
}
