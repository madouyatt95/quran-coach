import {it,expect} from 'vitest';
import {COURSE_LEVELS,COURSE_DOCUMENTS} from './data/courseLibrary';
import {moduleQuestions,attemptResult,moduleProgress} from './learning';
import {JUNIOR_PRACTICE} from './data/junior/practice-paths';
import {courseChallenge} from './data/courseChallenges';
import {transferQuestion} from './mastery';
it('turns both complete course structures into interactive modules with assessment',()=>{
 expect(COURSE_LEVELS.map(l=>l.modules.length)).toEqual([10,20]);
 for(const level of COURSE_LEVELS)for(const m of level.modules){expect(m.content.filter(c=>c.type==='lesson').length).toBe(2);expect(moduleQuestions(m)).toHaveLength(4);expect(m.sourceDocument).toBeTruthy();expect(attemptResult(m,{}).passed).toBe(false);const answers=Object.fromEntries(moduleQuestions(m).map(q=>[q.key,q.answer]));expect(attemptResult(m,answers)).toEqual({score:100,complete:true,passed:true});delete answers[moduleQuestions(m)[0].key];expect(attemptResult(m,answers).passed).toBe(false);}
});
it('keeps every extracted source page and chapter traceable',()=>{expect(COURSE_DOCUMENTS.map(d=>d.pageCount)).toEqual([75,66]);for(const d of COURSE_DOCUMENTS){expect(d.pages).toHaveLength(d.pageCount);expect(d.pages.every((p,i)=>p.page===i+1&&p.rawText.includes(p.text.slice(-40)))).toBe(true);expect(d.chapters.at(-1)?.end).toBe(d.pageCount);}});
it('keeps progress across inactive modules and distinguishes assessment from completion',()=>{const m=COURSE_LEVELS[0].modules[0];expect(moduleProgress(m,false,0,2)).toBeGreaterThan(0);expect(moduleProgress(m,false,3,0)).toBeLessThan(100);expect(moduleProgress(m,true)).toBe(100);const qs=moduleQuestions(m),answers=Object.fromEntries(qs.map(q=>[q.key,q.answer]));answers[qs.at(-1)!.key]=(qs.at(-1)!.answer+1)%3;expect(attemptResult(m,answers).passed).toBe(false);});
it('provides four functional Junior paths with unique steps and valid activities',()=>{expect(JUNIOR_PRACTICE).toHaveLength(4);const steps=JUNIOR_PRACTICE.flatMap(m=>m.steps);expect(steps).toHaveLength(12);expect(new Set(steps.map(s=>s.id)).size).toBe(12);for(const s of steps){expect(s.activity.pairs!.length).toBeGreaterThan(1);for(const q of s.quiz)expect(q.options[q.answer]).toBeTruthy();}});
it('gives every source chapter an authored practice and a distinct delayed question',()=>{for(const m of COURSE_LEVELS.flatMap(level=>level.modules)){const challenge=courseChallenge(m.id);expect(challenge).not.toBeNull();const transfer=transferQuestion(challenge!);expect(transfer.options).toHaveLength(3);expect(transfer.options[transfer.answer]).toBeTruthy();expect(moduleQuestions(m).every(q=>q.q!==transfer.q)).toBe(true);if(challenge?.kind==='order')expect(new Set(challenge.steps).size).toBe(3);else expect(challenge?.reasons[challenge.correct].length).toBeGreaterThan(20);}});
it('keeps a source excerpt and accurate speaker distinction for every Hadith workshop',()=>{const doc=COURSE_DOCUMENTS[1];for(const chapter of doc.chapters.slice(1)){const pages=doc.pages.slice(chapter.start-1,chapter.end).map(p=>p.text).join('\n');expect(pages.match(/PAROLE (?:DU PROPHÈTE ﷺ|DE UMAR)[\s\S]*?«([\s\S]*?)»/)?.[1].trim().length).toBeGreaterThan(20);}expect(doc.pages[doc.chapters[12].start-1].text).toContain('PAROLE DE UMAR');});

import {chapterTeaching} from './data/courseExplanations';
import {courseNarration,narrationBlocks} from './courseReading';
it('provides explained chapters while retaining saved lesson and assessment identities',()=>{
 for(const m of COURSE_LEVELS.flatMap(level=>level.modules)){
  const teaching=chapterTeaching(m.id)!;
  expect(teaching.developments).toHaveLength(3);
  expect(teaching.developments.every(text=>text.split('\n\n').length>=2)).toBe(true);
  expect(m.content[0].type).toBe('lesson');expect(m.content[1].type).toBe('quiz');
  expect(m.content[2].type).toBe('lesson');expect(m.content[3].type).toBe('quiz');
  // Existing answer and cursor keys remain valid; no progress migration is required.
  expect(moduleQuestions(m).map(q=>q.key)).toEqual([`${m.id}:1:0`,`${m.id}:1:1`,`${m.id}:1:2`,`${m.id}:3:0`]);
 }
});
it('retains complete opening narrations, variants and speaker boundaries rather than the first quote',()=>{
 for(const m of COURSE_LEVELS[1].modules){const narration=courseNarration(m.id)!;expect(narration.length).toBeGreaterThan(100);expect(narration).not.toContain('\nRapporteur');expect(narrationBlocks(narration).map(b=>b.text).join(' ').replace(/\s+/g,' ')).toBe(narration.replace(/\s+/g,' '));}
 const jibril=courseNarration('sabirin-hadith-2')!;
 expect(jibril).toContain('Informe-moi sur la foi');expect(jibril).toContain('Il s\'agissait de Jibrîl');expect(jibril).toContain('PAROLE DE UMAR');
 expect(courseNarration('sabirin-hadith-17')).toContain('Dans une autre version de Muslim');
 expect(narrationBlocks(courseNarration('sabirin-hadith-12')!).filter(b=>b.type==='speaker').map(b=>b.text)).toContain('PAROLE DE UMAR');
 expect(courseNarration('sabirin-tawhid-1')).toBeNull();
});
