import {afterEach,it,expect,vi} from 'vitest';
import {watchAppUpdates,isSessionRoute} from './appUpdates';
class Worker extends EventTarget { state='installed';postMessage=vi.fn(); }
function setup(protectedSession=true,waiting=true){
 const worker=new Worker();
 const reg=Object.assign(new EventTarget(),{waiting:waiting?worker:null,installing:null,update:vi.fn().mockResolvedValue(undefined)});
 const container=Object.assign(new EventTarget(),{controller:{},getRegistration:vi.fn().mockResolvedValue(reg)});
 const reload=vi.fn(),available=vi.fn();
 const state={protected:protectedSession};
 const watcher=watchAppUpdates(container as unknown as ServiceWorkerContainer,{isProtected:()=>state.protected,onAvailable:available,reload});
 return {worker,reg,container,reload,available,state,watcher};
}
afterEach(()=>vi.useRealTimers());
it('does not activate or reload during a session, including a takeover from another tab',async()=>{
 const s=setup();await Promise.resolve();s.watcher.apply();expect(s.worker.postMessage).not.toHaveBeenCalled();
 s.container.dispatchEvent(new Event('controllerchange'));s.watcher.checkIdle();expect(s.reload).not.toHaveBeenCalled();
 s.state.protected=false;s.watcher.checkIdle();s.watcher.checkIdle();expect(s.reload).toHaveBeenCalledOnce();s.watcher.dispose();
});
it('activates only on a safe explicit request and defers a late controllerchange',async()=>{
 const s=setup(false);await Promise.resolve();expect(s.worker.postMessage).not.toHaveBeenCalled();
 s.watcher.apply();expect(s.worker.postMessage).toHaveBeenCalledExactlyOnceWith({type:'SKIP_WAITING'});
 s.state.protected=true;s.container.dispatchEvent(new Event('controllerchange'));expect(s.reload).not.toHaveBeenCalled();s.watcher.dispose();
});
it('cleans timers and listeners, including late registration resolution',async()=>{
 vi.useFakeTimers();const s=setup();await Promise.resolve();expect(vi.getTimerCount()).toBe(1);s.watcher.dispose();
 expect(vi.getTimerCount()).toBe(0);s.container.dispatchEvent(new Event('controllerchange'));expect(s.reload).not.toHaveBeenCalled();
 const late=setup();late.watcher.dispose();await Promise.resolve();expect(vi.getTimerCount()).toBe(0);expect(late.available).not.toHaveBeenCalled();
});
it('observes an installation already running at mount',async()=>{
 const s=setup(false,false);s.worker.state='installing';Object.assign(s.reg,{installing:s.worker});await Promise.resolve();
 s.worker.state='installed';s.worker.dispatchEvent(new Event('statechange'));expect(s.available).toHaveBeenLastCalledWith(true);s.watcher.dispose();
});
it('protects reading, memorization, identification and invocations throughout the route',()=>{
 for(const path of ['/read','/hifdh','/test-memorization','/voice-search','/adhkar','/passage'])expect(isSessionRoute(path)).toBe(true);
 expect(isSessionRoute('/')).toBe(false);expect(isSessionRoute('/settings')).toBe(false);
});
