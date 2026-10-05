// @vitest-environment jsdom
import { act, useRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, it, expect } from 'vitest';
import {useReadingReturn} from './useReadingReturn';
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
let root:Root, div:HTMLDivElement, api:ReturnType<typeof useReadingReturn>;
let position={surah:2,ayah:75,page:11,khatm:true};
function Harness(){api=useReadingReturn(useRef<HTMLDivElement|null>(null),position);return null;}
const render=()=>act(async()=>root.render(<Harness/>));
beforeEach(async()=>{position={surah:2,ayah:75,page:11,khatm:true};div=document.createElement('div');document.body.append(div);root=createRoot(div);await render();});
afterEach(async()=>{await act(async()=>root.unmount());div.remove();});
it('opening and cancelling search does not create a return link',()=>{api.capture();expect(api.origin).toBeNull();});
it('keeps the original reading position across chained searches and consumes it once',async()=>{
 api.capture();await act(async()=>api.leave());position={surah:18,ayah:10,page:294,khatm:false};await render();
 api.capture();await act(async()=>api.leave());expect(api.origin).toEqual({surah:2,ayah:75,page:11,khatm:true});
 await act(async()=>{expect(api.consume()).toEqual({surah:2,ayah:75,page:11,khatm:true});});expect(api.origin).toBeNull();expect(api.restore.current?.ayah).toBe(75);
});
it('dismisses an excursion and captures a fresh origin for the next search',async()=>{
 api.capture();await act(async()=>api.leave());await act(async()=>api.dismiss());position={surah:18,ayah:10,page:294,khatm:false};await render();
 api.capture();await act(async()=>api.leave());expect(api.origin?.surah).toBe(18);
});
