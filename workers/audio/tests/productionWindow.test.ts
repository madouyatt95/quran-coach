import {describe,expect,it,vi} from 'vitest';
import {continueProduction,productionWindow} from '../src/productionWindow';
describe('bounded approved production',()=>{
 it('visits all 25 approved jobs exactly once using at most three per invocation',()=>{
  const jobs=Array.from({length:25},(_,i)=>i),visited:number[]=[];let offset:number|null=0;
  while(offset!==null){const part=productionWindow(jobs,offset);expect(part.jobs.length).toBeLessThanOrEqual(3);visited.push(...part.jobs);offset=part.next;}
  expect(visited).toEqual(jobs);expect(new Set(visited).size).toBe(25);
 });
 it('does not invent jobs for empty or completed batches',()=>{
  expect(productionWindow([],0)).toEqual({jobs:[],next:null});
  expect(productionWindow([1,2,3],3)).toEqual({jobs:[],next:null});
 });
 it('rejects invalid cursors before dispatch',()=>{for(const offset of [-1,.5,4,NaN])expect(()=>productionWindow([1,2,3],offset)).toThrow();});
 it('schedules the exact continuation of the approved run',async()=>{
  const binding={create:vi.fn(async()=>({})),get:vi.fn()},params={batch:'batch',run:'run',offset:3};
  await continueProduction(binding,params);
  expect(binding.create).toHaveBeenCalledExactlyOnceWith({id:'batch-run-3',params});expect(binding.get).not.toHaveBeenCalled();
 });
 it('recognizes a previously dispatched child after a lost acknowledgement',async()=>{
  const binding={create:vi.fn(async()=>{throw Error('lost acknowledgement');}),get:vi.fn(async()=>({status:async()=>({status:'running'})}))};
  await expect(continueProduction(binding,{batch:'batch',run:'run',offset:3})).resolves.toBeUndefined();
  expect(binding.create).toHaveBeenCalledTimes(1);expect(binding.get).toHaveBeenCalledWith('batch-run-3');
 });
 it('surfaces a missing or failed child so the non-paying scheduling step can retry',async()=>{
  for(const state of ['missing','errored','terminated','paused']){
   const binding={create:vi.fn(async()=>{throw Error('dispatch interrupted');}),get:vi.fn(async()=>{if(state==='missing')throw Error('not found');return {status:async()=>({status:state})};})};
   await expect(continueProduction(binding,{batch:'batch',run:'run',offset:6})).rejects.toThrow('dispatch interrupted');
  }
 });
});
