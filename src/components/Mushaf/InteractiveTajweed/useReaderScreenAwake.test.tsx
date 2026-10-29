// @vitest-environment jsdom
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {useReaderScreenAwake} from './useReaderScreenAwake';
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
let root:Root,host:HTMLDivElement,request:ReturnType<typeof vi.fn>;
class Lock extends EventTarget{released=false;release=vi.fn(async()=>{this.released=true;this.dispatchEvent(new Event('release'));});}
function App({enabled}:{enabled:boolean}){const {status}=useReaderScreenAwake(enabled);return <output>{status}</output>;}
const render=async(enabled:boolean)=>{await act(async()=>root.render(<App enabled={enabled}/>));};
const visibility=async(value:string)=>{Object.defineProperty(document,'visibilityState',{configurable:true,value});await act(async()=>document.dispatchEvent(new Event('visibilitychange')));};
beforeEach(()=>{host=document.createElement('div');document.body.append(host);root=createRoot(host);request=vi.fn();Object.defineProperty(navigator,'wakeLock',{configurable:true,value:{request}});Object.defineProperty(document,'visibilityState',{configurable:true,value:'visible'});});
afterEach(()=>{act(()=>root.unmount());host.remove();Reflect.deleteProperty(navigator,'wakeLock');});
it('acquires only after opting in, releases when disabled and keeps page updates from duplicating locks',async()=>{
 const lock=new Lock();request.mockResolvedValue(lock);await render(false);expect(request).not.toHaveBeenCalled();await render(true);expect(host.textContent).toBe('active');await render(true);expect(request).toHaveBeenCalledTimes(1);await render(false);expect(lock.release).toHaveBeenCalledTimes(1);expect(host.textContent).toBe('off');
});
it('releases on backgrounding and reacquires on returning to the visible reader',async()=>{
 const first=new Lock(),second=new Lock();request.mockResolvedValueOnce(first).mockResolvedValueOnce(second);await render(true);await visibility('hidden');expect(first.released).toBe(true);await visibility('visible');expect(request).toHaveBeenCalledTimes(2);expect(host.textContent).toBe('active');
});
it('releases a delayed request after the user disables the setting',async()=>{
 let resolve!:(value:Lock)=>void;request.mockReturnValue(new Promise<Lock>(r=>{resolve=r;}));await render(true);await render(false);const lock=new Lock();await act(async()=>resolve(lock));expect(lock.released).toBe(true);expect(host.textContent).toBe('off');
});
it('reports a refusal or system release without claiming protection or repeatedly requesting',async()=>{
 request.mockRejectedValue(new Error('power saving'));await render(true);expect(host.textContent).toBe('paused');expect(request).toHaveBeenCalledTimes(1);
 await render(false);const lock=new Lock();request.mockResolvedValue(lock);await render(true);await act(async()=>lock.release());expect(host.textContent).toBe('paused');expect(request).toHaveBeenCalledTimes(2);
});
it('handles browsers without wake lock',async()=>{Reflect.deleteProperty(navigator,'wakeLock');await render(true);expect(host.textContent).toBe('unavailable');});
it('releases when leaving the reader',async()=>{const lock=new Lock();request.mockResolvedValue(lock);await render(true);await act(async()=>root.render(null));expect(lock.released).toBe(true);});
