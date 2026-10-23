// @vitest-environment jsdom
import {beforeEach,expect,it,vi} from 'vitest';
vi.hoisted(()=>{const data=new Map<string,string>();Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(k:string)=>data.get(k)||null,setItem:(k:string,v:string)=>data.set(k,v),removeItem:(k:string)=>data.delete(k)}});});
import {useBookNotebook} from './bookNotebookStore';
const entry={bookId:'adam',version:'v1',chapterId:'names',passageId:'names:p:1',text:'Passage conservé',sources:['quran'],audioId:'part2',seconds:12.4};
beforeEach(()=>useBookNotebook.setState({entries:[]}));
it('deduplicates by manuscript and paragraph without erasing a personal note or exact audio point',()=>{const s=useBookNotebook.getState();s.remember(entry);const id=useBookNotebook.getState().entries[0].id;s.annotate(id,'Ma réflexion');s.remember({...entry,seconds:50});expect(useBookNotebook.getState().entries).toHaveLength(1);expect(useBookNotebook.getState().entries[0]).toMatchObject({note:'Ma réflexion',seconds:12.4,audioId:'part2'});s.remove(id);expect(useBookNotebook.getState().entries).toEqual([]);});
it('keeps distinct manuscript editions and bounds notes',()=>{const s=useBookNotebook.getState();s.remember(entry);s.remember({...entry,version:'v2'});expect(useBookNotebook.getState().entries).toHaveLength(2);s.annotate(useBookNotebook.getState().entries[0].id,'a'.repeat(2100));expect(useBookNotebook.getState().entries[0].note).toHaveLength(2000);});
