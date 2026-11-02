// @vitest-environment jsdom
import {it,expect} from 'vitest';
import {readerShortcut} from './readerShortcuts';
function key(value:string,target?:HTMLElement,options:KeyboardEventInit={}){const event=new KeyboardEvent('keydown',{key:value,...options});if(target)Object.defineProperty(event,'target',{value:target});return event;}
it('turns pages in Quran reading direction and handles pause with Space',()=>{expect(readerShortcut(key('ArrowLeft'),false)).toBe('next');expect(readerShortcut(key('PageUp'),false)).toBe('previous');expect(readerShortcut(key(' '),false)).toBe('toggle');});
it('never hijacks form controls, a word action, modals or modified/repeating keys',()=>{
 for(const tag of ['input','select','textarea','button','a'])expect(readerShortcut(key('ArrowLeft',document.createElement(tag)),false)).toBeNull();
 const word=document.createElement('span');word.setAttribute('role','button');expect(readerShortcut(key(' ' ,word),false)).toBeNull();
 const editor=document.createElement('div');editor.contentEditable='true';editor.setAttribute('contenteditable','true');expect(readerShortcut(key('ArrowLeft',editor),false)).toBeNull();
 expect(readerShortcut(key('ArrowLeft'),true)).toBeNull();expect(readerShortcut(key('ArrowLeft',undefined,{ctrlKey:true}),false)).toBeNull();expect(readerShortcut(key(' ',undefined,{repeat:true}),false)).toBeNull();
});
