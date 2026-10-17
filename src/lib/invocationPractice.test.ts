import {it,expect} from 'vitest';
import {repeatPauseSeconds,scheduleRecall} from './invocationPractice';
it('adapts silence to the heard duration, speed and extra time without overriding fixed choices',()=>{
 expect(repeatPauseSeconds('auto',30,1,4)).toBe(32);expect(repeatPauseSeconds('auto',30,.5,4)).toBe(62);expect(repeatPauseSeconds('slow',30,1,4)).toBe(44);expect(repeatPauseSeconds('fixed',30,.5,4)).toBe(4);
});
it('schedules declared difficulty progressively and caps distant reviews',()=>{
 const now=new Date(2026,9,12,12).getTime();const first=scheduleRecall(undefined,'easy',now),second=scheduleRecall(first,'easy',now);expect(first.interval).toBe(3);expect(second.interval).toBe(7);expect(scheduleRecall(second,'again',now).interval).toBe(1);expect(scheduleRecall(second,'hesitant',now).interval).toBe(5);expect(scheduleRecall({...second,interval:90},'easy',now).interval).toBe(90);expect(new Date(first.due).getDate()).toBe(15);
});
