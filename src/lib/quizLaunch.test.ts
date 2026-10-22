import {it,expect} from 'vitest';
import {resolveQuizLaunch,QUIZ_ACTIVITIES} from './quizLaunch';
import {learningBank,encodeQuizShare,decodeQuizShare} from './quizLearning';
const resolve=(p:Record<string,string>)=>resolveQuizLaunch(new URLSearchParams(p));
it('launches every advertised activity with real questions and preserved share identities',()=>{
 for(const a of QUIZ_ACTIVITIES){const {questions}=resolve({exercise:a.id});expect(questions.length,a.id).toBeGreaterThan(0);expect(decodeQuizShare(encodeQuizShare(questions.slice(0,6)))).toEqual(questions.slice(0,6));}
 expect(resolve({exercise:'audio'}).questions.every(q=>q.audioUrl&&q.verseRef)).toBe(true);
 expect(resolve({exercise:'spot'}).questions.every(q=>q.feedbacks?.length===q.choices.length)).toBe(true);
});
it('never crosses the exact academy chapter or story, and rejects nonexistent sources',()=>{
 const academy=resolve({source:'academy',scope:'sabirin-tawhid-1'});expect(academy.questions.length).toBeGreaterThan(2);expect(academy.questions.every(q=>q.context?.id==='sabirin-tawhid-1')).toBe(true);
 const story=resolve({source:'story',scope:'prophet:adam'});expect(story.questions).toHaveLength(3);expect(story.questions.every(q=>q.context?.id==='prophet:adam')).toBe(true);
 for(const source of ['academy','story','fahm'])expect(resolve({source,scope:'nonexistent'}).questions).toEqual([]);
});
it('Fahm uses only specified verses and never broadens to a whole surah',()=>{
 const result=resolve({source:'fahm',scope:'1:2,1:6'});expect(result.questions.map(q=>q.id).sort()).toEqual(['fahm-meaning-1:2','fahm-meaning-1:6']);
 for(const scope of ['1:999','0:1','2:3x',',1:2','1:1,999:1'])expect(resolve({source:'fahm',scope}).questions).toEqual([]);
 expect(resolve({source:'fahm',scope:'2:75'}).questions).toEqual([]);
});
it('keeps a local source return and rejects external or backslash redirects',()=>{
 expect(resolve({source:'story',scope:'prophet:adam',return:'/prophets?prophet=adam'}).returnTo).toBe('/prophets?prophet=adam');
 expect(resolve({source:'academy',scope:'sabirin-tawhid-1',return:'/academy?module=sabirin-tawhid-1&section=2'}).returnTo).toContain('section=2');
 for(const value of ['https://evil.test','//evil.test','/\\evil.test','/fahm\\evil.test'])expect(resolve({source:'fahm',scope:'1:1',return:value}).returnTo).toBe('/fahm');
});
it('every vocabulary pair keeps a distinct meaning and an actual reference',()=>{
 for(const q of learningBank().filter(q=>q.activity==='vocabulary')){expect(q.pairs).toHaveLength(3);expect(new Set(q.pairs!.map(p=>p[1])).size).toBe(3);expect(q.pairRefs).toHaveLength(3);}
});
