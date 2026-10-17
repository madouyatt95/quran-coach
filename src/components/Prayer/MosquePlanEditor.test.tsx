// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { createJSONStorage } from 'zustand/middleware';
import { createMemoryStorage } from '../../test/memoryStorage';
import { useMosquePlansStore } from '../../stores/mosquePlansStore';
import { MosquePlanEditor } from './MosquePlanEditor';
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
it('retains a chosen time across parent updates',async()=>{
 const memory=createMemoryStorage();useMosquePlansStore.persist.setOptions({storage:createJSONStorage(()=>memory)});useMosquePlansStore.setState({plans:{}});
 const mosque={id:'test',name:'Test',lat:48,lng:2,city:'Paris',sourceUrl:'https://pray.zone'},done=vi.fn(),host=document.createElement('div'),root=createRoot(host);document.body.append(host);
 const render=()=>root.render(<MosquePlanEditor mosque={mosque} timezone="Europe/Paris" onDone={done}/>);
 await act(async()=>render());
 const time=host.querySelector<HTMLInputElement>('input[type=time]')!;
 await act(async()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(time,'06:15');time.dispatchEvent(new Event('input',{bubbles:true}));});
 await act(async()=>render());expect(time.value).toBe('06:15');
 await act(async()=>root.unmount());host.remove();
});
