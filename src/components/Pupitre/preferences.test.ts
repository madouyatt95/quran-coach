// @vitest-environment jsdom
import {expect,it,vi} from 'vitest';
vi.hoisted(()=>{const data=new Map<string,string>();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:(key:string)=>data.get(key)??null,setItem:(key:string,v:string)=>data.set(key,v),removeItem:(key:string)=>data.delete(key)}});});
import {migrateLayoutPreferences,safePreference,useLayoutPreferences} from './usePupitreLayout';
it('migrates the previous global layout without losing user choices',()=>{
 const migrated=migrateLayoutPreferences({choice:'desk'});expect(migrated.preferences.reader.choice).toBe('desk');expect(migrated.preferences.book.choice).toBe('desk');expect(migrated.preferences.quiz.ratio).toBe(50);
 expect(safePreference({ratio:500,pins:['a','a','b','c','d','e']})).toMatchObject({ratio:70,pins:['a','b','c','d']});
});
it('keeps layouts, tab selection and shortcut preferences separate by activity',()=>{
 useLayoutPreferences.setState({preferences:{}});const update=useLayoutPreferences.getState().update;
 update('reader',{choice:'book',ratio:65,pins:['word']});update('book',{choice:'desk',tab:'settings'});
 expect(useLayoutPreferences.getState().preferences.reader).toMatchObject({choice:'book',ratio:65,pins:['word'],tab:'listen'});
 expect(useLayoutPreferences.getState().preferences.book).toMatchObject({choice:'desk',ratio:50,tab:'settings'});
});
