// @vitest-environment jsdom
import {it,expect,vi,beforeEach} from 'vitest';
import {createJSONStorage} from 'zustand/middleware';
import {useQuizGamesStore} from './quizGamesStore';
import {createMemoryStorage} from '../test/memoryStorage';
import {FAMILY_BOARDS} from '../data/quizGames';
const initial=useQuizGamesStore.getState();
beforeEach(()=>{vi.stubGlobal('localStorage',createMemoryStorage());useQuizGamesStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});useQuizGamesStore.setState(initial,true);});
it('restores every game independently and hides an active secret card after reload',async()=>{
 const s=()=>useQuizGamesStore.getState();s().start('families','everyday');s().act('families',{type:'toggle',index:FAMILY_BOARDS[0].groups[0].ids[0]});s().start('memory','nature');s().act('memory',{type:'toggle',index:0});s().start('describe','session',{seconds:60});s().act('describe',{type:'ready',now:100});s().act('describe',{type:'tick',now:10100});
 await useQuizGamesStore.persist.rehydrate();const f=s().games.families,m=s().games.memory;expect(f?.kind==='families'&&f.selected).toHaveLength(1);expect(m?.kind==='memory'&&m.open).toEqual([0]);const g=s().games.describe;expect(g?.kind==='describe'&&g.phase).toBe('handoff');expect(g?.kind==='describe'&&g.remaining).toBe(50000);
});
it('invalid packs do not destroy a running game',()=>{useQuizGamesStore.getState().start('memory','nature');const g=useQuizGamesStore.getState().games.memory;useQuizGamesStore.getState().start('memory','missing');expect(useQuizGamesStore.getState().games.memory).toBe(g);});
it('restores the three new games and ignores a corrupt game without losing the others',async()=>{
 const s=()=>useQuizGamesStore.getState();s().start('roots','independent');s().act('roots',{type:'toggle',index:0});s().start('sentences','all');s().act('sentences',{type:'place',word:'theme'});s().start('expedition','yusuf');s().act('expedition',{type:'branch',index:1});s().start('memory','nature');
 const raw=JSON.parse(localStorage.getItem('quran-coach-games-v1')!);raw.state.games.memory.cards=null;localStorage.setItem('quran-coach-games-v1',JSON.stringify(raw));await useQuizGamesStore.persist.rehydrate();expect(s().games.memory).toBeUndefined();const roots=s().games.roots,sentence=s().games.sentences,exp=s().games.expedition;expect(roots?.kind==='roots'&&roots.chain).toHaveLength(1);expect(sentence?.kind==='sentences'&&sentence.placed.includes('theme')).toBe(true);expect(exp?.kind==='expedition'&&exp.branch).toBe(1);
});
