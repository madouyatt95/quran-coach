import {describe,it,expect} from 'vitest';
import {selectHomeReminders,nextMoment,reminderGroup} from './reminderExperience';
import {fridayReminder} from './fridayReminder';
import {invocationReminder} from './invocationReminder';
import {useDailyAdhkarStore} from '../stores/dailyAdhkarStore';
import {useAdhkarExperienceStore} from '../stores/adhkarExperienceStore';
import {categoryById,invocationCountKey} from './adhkarExperience';
import {emptyPlan,type MosqueEvent} from './mosquePlanning';
import type {CompanionCard} from './companion';
const base:CompanionCard={id:'x',topic:'morning',origin:'sentinel',title:'Matin',emoji:'🌅',message:'',reason:'',minutes:5,route:'/adhkar',action:'Lire',kind:'Invocation',priority:75};
describe('compact reminders',()=>{
 it('limits future cards, drops expiry and places general suggestions last',()=>{
 const now=1000;const cards=selectHomeReminders([{...base,id:'general',priority:10},{...base,id:'expired',expiresAt:999},{...base,id:'current'}],[1,2,3].map(i=>({...base,id:`future${i}`,startsAt:now+i*1000})),now);
 expect(cards.map(c=>c.id)).toEqual(['current','future1','future2','general']);
 });
 it('uses future local slots and maps themes without conflating coach settings',()=>{
 expect(nextMoment('tonight',+new Date(2026,9,14,21))).toBeNull();
 expect(new Date(nextMoment('tomorrow',+new Date(2026,9,14,21))!).getHours()).toBe(9);
 expect(reminderGroup('prayer-asr')).toBe('mosque');expect(reminderGroup('al-kahf')).toBe('friday');
 });
 it('resumes the first unfinished daily invocation, resets yesterday and respects order',()=>{
 const now=+new Date(2026,9,14,9),items=categoryById.get('morning')!.items;
 const daily={...useDailyAdhkarStore.getState(),day:'2026-10-14',counts:{[invocationCountKey(items[0])]:items[0].count}};
 const exp={...useAdhkarExperienceStore.getState(),order:{morning:[items[1].key,items[0].key]}};
 expect(invocationReminder('morning',daily,exp,now)?.route).toContain(encodeURIComponent(items[1].key));
 expect(invocationReminder('morning',daily,exp,now)?.action).toBe('Reprendre ma série');
 expect(invocationReminder('morning',{...daily,day:'2026-10-13'},exp,now)?.detail).toMatch(/^0 \/ /);
 });
});
describe('Friday journey',()=>{
 const mosque={id:'test',name:'Test',city:'Paris',lat:48,lng:2,sourceUrl:'https://example.org'};
 const plan={...emptyPlan(mosque,'Europe/Paris'),travel:15,margin:5};
 it('prepares Thursday and resumes observed verses Friday',()=>{
 expect(fridayReminder(new Date(2026,9,15,19),[],[])?.title).toBe('Préparer mon vendredi');
 const date=new Date(2026,9,16,9),card=fridayReminder(date,[{day:'2026-10-16',at:+date,surah:18,ayah:1,page:293}],[]);
 expect(card?.route).toBe('/read?surah=18&ayah=2');expect(card?.detail).toContain('1 / 110');
 expect(fridayReminder(new Date(2026,9,17,9),[],[])).toBeNull();
 });
 it('shows departure only with known timing and travel, keeps the source and expires',()=>{
 const date=new Date(2026,9,16,12),target=+date+50*60000;
 const e:MosqueEvent={id:'f',plan,date:'2026-10-16',key:'friday',label:'Jumu’a',at:target,target,depart:target-20*60000,published:true};
 const card=fridayReminder(date,[],[e]);expect(card?.route).toBe('/prayers');expect(card?.title).toContain('30 min');expect(card?.expiresAt).toBe(target);expect(card?.reason).toContain('publié');
 expect(fridayReminder(date,[],[{...e,depart:null,plan:{...plan,travel:null}}])?.route).toContain('/read');
 expect(fridayReminder(new Date(target+1),[],[e])?.route).toContain('/read');
 });
});
