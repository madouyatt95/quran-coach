// @vitest-environment jsdom
import {act} from 'react';
import {createRoot} from 'react-dom/client';
import {expect,it,vi} from 'vitest';
import {readerWakeHandlers} from './readerWakeHandlers';
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
it('keeps a word still until release and delivers the first tap even when controls are asleep',()=>{
 const host=document.createElement('div');document.body.append(host);const root=createRoot(host),wake=vi.fn(),play=vi.fn();
 act(()=>root.render(<div {...readerWakeHandlers(wake)}><span className="iq-word" onClick={play}><span>mot</span></span></div>));
 const glyph=host.querySelector('.iq-word span')!;
 act(()=>glyph.dispatchEvent(new Event('pointerdown',{bubbles:true})));expect(wake).not.toHaveBeenCalled();
 act(()=>glyph.dispatchEvent(new MouseEvent('click',{bubbles:true})));expect(wake).toHaveBeenCalledTimes(1);expect(play).toHaveBeenCalledTimes(1);
 act(()=>root.unmount());host.remove();
});
