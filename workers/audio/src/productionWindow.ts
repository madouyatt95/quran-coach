/** Bound every Workflow invocation below the free-plan subrequest budget.
 * The approved batch is immutable; offsets only partition its existing jobs.
 */
export interface ProductionRun {batch:string;run:string;offset:number}
interface DispatchBinding {
  create(options:{id:string;params:ProductionRun}):Promise<unknown>;
  get(id:string):Promise<{status():Promise<{status:string}>}>;
}
/** This retries scheduling only, never synthesis. A lost acknowledgement can
 * be resolved by the exact child ID instead of creating a second child. */
export async function continueProduction(binding:DispatchBinding,params:ProductionRun){
  const id=`${params.batch}-${params.run}-${params.offset}`;
  try{await binding.create({id,params});}
  catch(error){
    let status='';
    try{status=(await(await binding.get(id)).status()).status;}catch{/* Not yet created: let the scheduling step retry. */}
    if(!['queued','running','waiting','complete'].includes(status))throw error;
  }
}
export function productionWindow<T>(jobs: T[], offset: number) {
  if(!Number.isSafeInteger(offset)||offset<0||offset>jobs.length)throw new Error('Invalid production offset');
  const end=Math.min(offset+3,jobs.length);
  return {jobs:jobs.slice(offset,end),next:end<jobs.length?end:null};
}
