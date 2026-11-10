// @vitest-environment jsdom
import {beforeEach,expect,it,vi} from 'vitest';
vi.hoisted(()=>{const data=new Map<string,string>();Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(k:string)=>data.get(k)||null,setItem:(k:string,v:string)=>data.set(k,v),removeItem:(k:string)=>data.delete(k)}});});
import {useStudyNotebook,safeStudyHref} from './studyNotebookStore';
const entry={id:'book:adam:1',title:'Adam',text:'Un passage exact.',reference:'Coran 2:30',href:'/books/adam?chapter=names&passage=names%3A1'};
beforeEach(()=>useStudyNotebook.setState({entries:[]}));
it('keeps an exact excerpt and its reference without overwriting a note when saved twice',()=>{const s=useStudyNotebook.getState();s.save(entry);s.annotate(entry.id,'Ma réflexion');s.save(entry);expect(useStudyNotebook.getState().entries).toHaveLength(1);expect(useStudyNotebook.getState().entries[0]).toMatchObject({...entry,note:'Ma réflexion'});});
it('rejects external and executable return links',()=>{for(const href of ['https://example.com','//example.com','javascript:alert(1)','/books/adam\\evil','/settings']){expect(safeStudyHref(href)).toBe(false);useStudyNotebook.getState().save({...entry,href});}expect(useStudyNotebook.getState().entries).toEqual([]);});
it('removes only the requested excerpt',()=>{const s=useStudyNotebook.getState();s.save(entry);s.save({...entry,id:'second'});s.remove(entry.id);expect(useStudyNotebook.getState().entries.map(e=>e.id)).toEqual(['second']);});
