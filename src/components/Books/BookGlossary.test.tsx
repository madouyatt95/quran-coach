// @vitest-environment jsdom
import {act} from 'react';
import {createRoot} from 'react-dom/client';
import {expect,it,vi} from 'vitest';
import {BookNames} from './BookNames';
import {BookGlossary} from './BookGlossary';
import {bookGlossary,glossaryMentions} from '../../data/bookGlossary';
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
it('wraps whole terms only, preserves text and keeps person buttons independent',async()=>{
 const text='Hafsa garde les mushafs après l’Hégire. Les Ansar, le califat et la kunya : ansard inconnu.';
 const host=document.createElement('div');document.body.append(host);const root=createRoot(host),onTerm=vi.fn(),onPerson=vi.fn();
 await act(async()=>root.render(<BookNames text={text} onTerm={onTerm} onPerson={onPerson}/>));
 expect(host.textContent).toBe(text);expect(glossaryMentions('ansard califatsuper')).toEqual([]);
 const term=host.querySelector<HTMLButtonElement>('[aria-label="Comprendre : Mushaf"]')!;
 await act(async()=>term.click());expect(onTerm).toHaveBeenCalledWith(expect.objectContaining({id:'mushaf'}));expect(onPerson).not.toHaveBeenCalled();
 await act(async()=>host.querySelector<HTMLButtonElement>('.book-person-name')!.click());expect(onPerson).toHaveBeenCalled();
 await act(async()=>root.unmount());host.remove();
});
it('opens a bounded modal and restores keyboard focus without replacing the book',async()=>{
 HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
 const host=document.createElement('div'),trigger=document.createElement('button');trigger.textContent='kunya';document.body.append(host,trigger);trigger.focus();const root=createRoot(host),close=vi.fn();
 await act(async()=>root.render(<BookGlossary terms={bookGlossary} initial={bookGlossary.find(t=>t.id==='kunya')} onClose={close}/>));
 const modal=document.querySelector('dialog[open]')!;expect(modal.textContent).toContain('même sans enfant');expect(modal.querySelector('a')?.getAttribute('href')).toBe('https://sunnah.com/bukhari:6203');
 await act(async()=>modal.querySelector('button')!.click());expect(close).toHaveBeenCalledOnce();
 await act(async()=>root.unmount());expect(document.activeElement).toBe(trigger);host.remove();trigger.remove();
});
