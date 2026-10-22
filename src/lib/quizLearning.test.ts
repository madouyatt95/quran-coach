import {describe,it,expect,vi} from 'vitest';
import {learningBank,buildLearningSession,recallAnswer,encodeQuizShare,decodeQuizShare,contextMatches} from './quizLearning';
import {generateSiraLevels} from './quizEngine';
describe('quiz learning',()=>{
 it('has unique questions and valid sourced interactive formats',()=>{const bank=learningBank();expect(new Set(bank.map(q=>q.id)).size).toBe(bank.length);expect(new Set(bank.map(q=>q.format))).toEqual(new Set(['choice','order','match','passage','audio','spot']));for(const q of bank){expect(q.choices[q.correctIndex],q.id+q.questionFr).toBeTruthy();if(q.stage!=='discover'){expect(q.explanation).toBeTruthy();expect(q.sourceLink||q.verseRef).toBeTruthy();}if(q.format==='order')expect(q.items!.length).toBeGreaterThan(1);if(q.format==='match')expect(q.pairs!.length).toBeGreaterThan(1);}});
 it('alternates learning stages and avoids practiced questions when new ones exist',()=>{const first=buildLearningSession({recalls:{},count:8});expect(new Set(first.map(q=>q.stage)).size).toBe(3);const recalls=Object.fromEntries(first.map(q=>[q.id,recallAnswer(undefined,true,true)]));const second=buildLearningSession({recalls,count:8});expect(second.every(q=>!recalls[q.id])).toBe(true);});
 it('keeps immediate success distinct from delayed mastery',()=>{const now=100000000;const wrong=recallAnswer(undefined,false,true,now);const fixed=recallAnswer(wrong,true,true,now+1000);expect(fixed.successes).toBe(0);expect(fixed.due).toBe(wrong.due);const reviewed=recallAnswer(fixed,true,true,now+3*86400000);expect(reviewed.successes).toBe(1);expect(recallAnswer(reviewed,true,false,now+6*86400000).successes).toBe(0);});
 it('shares exactly the same questions without executing arbitrary content',()=>{const q=buildLearningSession({recalls:{}});expect(decodeQuizShare(encodeQuizShare(q))).toEqual(q);expect(decodeQuizShare('1.<script>')).toBeNull();expect(decodeQuizShare('1.%XX')).toBeNull();expect(decodeQuizShare(encodeQuizShare([q[0],q[0]]))).toBeNull();});
 it('uses actual course and passage context without inventing absent questions',()=>{const q=learningBank().find(q=>q.context?.type==='academy')!;const c={academy:[q.context!.id],stories:[],invocations:[],verses:[],surah:114};expect(contextMatches(q,c)).toBe(true);expect(buildLearningSession({context:c,recalls:{}}).every(item=>contextMatches(item,c))).toBe(true);expect(buildLearningSession({context:{...c,academy:[],surah:999},recalls:{}})).toEqual([]);});
 it('provides explanatory context for every Sira stage',()=>{for(const level of generateSiraLevels()){expect(level.questions.length).toBe(10);expect(level.questions.every(q=>q.explanation&&q.explanation.length>100)).toBe(true);}});
 it('daily questions including choices and IDs survive independent module loads',async()=>{vi.resetModules();const first=(await import('./quizEngine')).getDailyQuestions('2026-10-15');vi.resetModules();const second=(await import('./quizEngine')).getDailyQuestions('2026-10-15');expect(second).toEqual(first);});
});

it('shares the exact easy-mode choices and audio reference across independent loads',async()=>{
 const {getQuestions,generateAudioQuestions}=await import('./quizEngine');
 const {encodeClassicShare}=await import('./quizLearning');
 const questions=[...getQuestions('fiqh',3,'easy'),generateAudioQuestions()[0]];
 const code=encodeClassicShare(questions)!;expect(code).toMatch(/^3\./);
 vi.resetModules();const decoded=(await import('./quizLearning')).decodeQuizShare(code)!;
 expect(decoded.map(q=>q.choices)).toEqual(questions.map(q=>q.choices));
 expect(decoded.map(q=>q.correctIndex)).toEqual(questions.map(q=>q.correctIndex));
 expect(decoded.at(-1)?.audioUrl).toBe(questions.at(-1)?.audioUrl);
 expect(decoded.at(-1)?.format).toBe('audio');
 expect(decodeQuizShare(code.replace(/\.\d+\./,'.9999.'))).toBeNull();
 expect(decodeQuizShare(code+'~'+code.slice(2).split('~')[0])).toBeNull();
});
