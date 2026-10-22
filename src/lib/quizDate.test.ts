import {it,expect,vi} from 'vitest';
import {quizDay} from './quizDate';
it('uses local date fields rather than UTC, including month/year boundaries',()=>{
 const d=new Date('2026-12-31T23:30:00Z');vi.spyOn(d,'getFullYear').mockReturnValue(2027);vi.spyOn(d,'getMonth').mockReturnValue(0);vi.spyOn(d,'getDate').mockReturnValue(1);expect(quizDay(d)).toBe('2027-01-01');expect(d.toISOString().slice(0,10)).toBe('2026-12-31');
});
