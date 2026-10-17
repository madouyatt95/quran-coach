// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { createJSONStorage } from 'zustand/middleware';
import { createMemoryStorage } from '../../test/memoryStorage';
import { afterEach, expect, it, vi } from 'vitest';
import { MosqueDepartureCard, FridayCard, MosqueTimelineDetail } from './MosquePlanning';
import { useMosqueStore } from '../../stores/mosqueStore';
import { useMosquePlansStore } from '../../stores/mosquePlansStore';
import { useMosqueDirectoryStore } from '../../stores/mosqueDirectoryStore';
import { mosqueScheduleEvents, scheduleSlug } from '../../lib/mosqueScheduleEvents';
import type { PublishedTimetable } from '../../lib/mosqueTimetables';
useMosqueStore.persist.setOptions({storage:createJSONStorage(()=>createMemoryStorage())});
useMosquePlansStore.persist.setOptions({storage:createJSONStorage(()=>createMemoryStorage())});
useMosqueDirectoryStore.persist.setOptions({storage:createJSONStorage(()=>createMemoryStorage())});
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
const now=Date.parse('2026-10-09T09:00:00Z'),mosque={id:'mawaqit-test',name:'Ma mosquée',city:'Paris',lat:48.85,lng:2.35,sourceUrl:'https://mawaqit.net/fr/test',refs:{mawaqit:'test'}};
const timetable:PublishedTimetable={mosque,mosqueId:'test',source:'MAWAQIT',sourceUrl:mosque.sourceUrl,timezone:'Europe/Paris',fetchedAt:now,days:[{date:'2026-10-09',prayers:[{key:'asr',adhan:'16:30',adhanAt:Date.parse('2026-10-09T14:30:00Z'),iqama:'16:45',iqamaAt:Date.parse('2026-10-09T14:45:00Z')}],jumua:[{time:'13:00',at:Date.parse('2026-10-09T11:00:00Z')},{time:'14:00',at:Date.parse('2026-10-09T12:00:00Z')}]}]};
afterEach(()=>vi.restoreAllMocks());
it('shows published Friday sessions, next prayer and timeline without a manually entered plan',async()=>{
 const load=vi.fn().mockResolvedValue(timetable);
 useMosqueStore.setState({favorite:mosque,selectionMode:'favorite'});useMosquePlansStore.setState({plans:{}});useMosqueDirectoryStore.setState({links:{},automatic:{},published:{test:timetable},loadPublished:load});
 const host=document.createElement('div'),root=createRoot(host);
 await act(async()=>{root.render(<MemoryRouter><FridayCard now={now} onOpen={()=>{}}/><MosqueDepartureCard now={now} onOpen={()=>{}} onChoose={()=>{}}/><MosqueTimelineDetail now={now} date="2026-10-09" prayer="asr"/></MemoryRouter>);});
 expect(host.textContent).toContain('13:00');expect(host.textContent).toContain('14:00');expect(host.textContent).toContain('MA PROCHAINE PRIÈRE');expect(host.textContent).toContain('Adhan 16:30 · Iqama 16:45');expect(host.textContent).not.toContain('Khutba');expect(host.textContent).not.toContain('pas encore disponibles');expect(load).toHaveBeenCalledWith('test');
 await act(async()=>root.unmount());
});
it('refreshes a selected mosque when its calendar is absent from the persisted cache',async()=>{
 const load=vi.fn(async()=>{useMosqueDirectoryStore.setState({published:{test:timetable}});return timetable;});
 useMosqueStore.setState({favorite:mosque,selectionMode:'favorite'});useMosqueDirectoryStore.setState({links:{},automatic:{},published:{},loadPublished:load});
 const host=document.createElement('div'),root=createRoot(host);
 await act(async()=>{root.render(<MemoryRouter><FridayCard now={now} onOpen={()=>{}}/></MemoryRouter>);});
 expect(host.textContent).toContain('13:00');expect(load).toHaveBeenCalledWith('test');await act(async()=>root.unmount());
});
it('does not invent khutba or replace missing iqama with adhan, and excludes stale public data',()=>{
 const events=mosqueScheduleEvents(mosque,{},timetable,now);
 expect(events.filter(e=>e.key==='friday')).toHaveLength(2);expect(events.every(e=>e.khutba===undefined)).toBe(true);
 expect(mosqueScheduleEvents(mosque,{},timetable,now+3600001)).toEqual([]);
 const noIqama={...timetable,days:timetable.days.map(d=>({...d,jumua:[],prayers:d.prayers.map(p=>({...p,iqama:null,iqamaAt:null}))}))};
 expect(mosqueScheduleEvents(mosque,{},noIqama,now)).toEqual([]);
 expect(scheduleSlug({...mosque,id:'old',refs:undefined,aliases:['linked']},{linked:'test'},{})).toBe('test');
});

it('counts down to the published iqama and switches to the next prayer when it starts',async()=>{
 const before=Date.parse('2026-10-09T11:59:58Z');
 const fresh={...timetable,fetchedAt:before};
 useMosqueStore.setState({favorite:mosque,selectionMode:'favorite'});useMosquePlansStore.setState({plans:{}});useMosqueDirectoryStore.setState({links:{},automatic:{},published:{test:fresh},loadPublished:vi.fn().mockResolvedValue(fresh)});
 const host=document.createElement('div'),root=createRoot(host);
 const renderAt=async(time:number)=>act(async()=>root.render(<MosqueDepartureCard now={time} onOpen={()=>{}} onChoose={()=>{}}/>));
 await renderAt(before);
 expect(host.querySelector('[role="timer"]')?.getAttribute('aria-label')).toBe('Jumu’a dans 0 heures 0 minutes 2 secondes');
 await renderAt(before+1000);
 expect(host.querySelector('[role="timer"]')?.getAttribute('aria-label')).toBe('Jumu’a dans 0 heures 0 minutes 1 secondes');
 await renderAt(before+2000);
 expect(host.querySelector('[role="timer"]')?.getAttribute('aria-label')).toBe('Iqama dans 2 heures 45 minutes 0 secondes');
 expect(host.textContent).toContain('Asr');
 await act(async()=>root.unmount());
});
