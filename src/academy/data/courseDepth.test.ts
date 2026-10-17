import {describe,it,expect} from 'vitest';
import {conceptDepth,courseCase} from './courseDepth';
import {COURSE_LEVELS,courseChapter} from './courseLibrary';
const modules=COURSE_LEVELS.flatMap(level=>level.modules);
describe('Detailed Sabirin pedagogy',()=>{
 it('covers all 90 notions with a complete source-scoped explanation and two distinct checks',()=>{
  expect(modules).toHaveLength(30);const checks:string[]=[];
  for(const module of modules){const source=courseChapter(module.id)!;
   for(let index=0;index<3;index++){const depth=conceptDepth(module.id,index)!;
    expect(depth).not.toBeNull();expect(depth.index).toBe(index);expect(depth.reasoning).toHaveLength(3);
    for(const text of [depth.definition,...depth.reasoning,depth.example,depth.confusion,depth.alternative])expect(text.length).toBeGreaterThan(15);
    expect(depth.source.page).toBe(source.chapter.start);expect(depth.source.endPage).toBe(source.chapter.end);expect(depth.source.url).toContain(`#page=${source.chapter.start}`);
    expect(depth.check.q).not.toBe(depth.retry.q);
    for(const question of [depth.check,depth.retry]){expect(question.options).toHaveLength(2);expect(new Set(question.options).size).toBe(2);expect(question.answer).toBeGreaterThanOrEqual(0);expect(question.answer).toBeLessThan(question.options.length);expect(question.feedbacks?.[question.answer===0?1:0].length).toBeGreaterThan(80);checks.push(question.q);}
   }
  }
  expect(new Set(checks).size).toBe(checks.length);
 });
 it('provides 30 evolving cases with genuinely different information after each first decision',()=>{
  for(const module of modules){const item=courseCase(module.id)!;expect(item).not.toBeNull();expect(item.choices).toHaveLength(3);expect(new Set(item.choices.map(branch=>branch.reveal)).size).toBe(3);expect(new Set(item.choices.map(branch=>branch.next)).size).toBe(3);
   for(const branch of item.choices){expect(branch.reveal.length).toBeGreaterThan(35);expect(branch.next.length).toBeGreaterThan(20);expect(branch.options).toHaveLength(3);expect(new Set(branch.options).size).toBe(3);expect(branch.answer).toBeGreaterThanOrEqual(0);expect(branch.answer).toBeLessThan(3);expect(branch.reasons).toHaveLength(3);expect(branch.conceptIndex).toBeGreaterThanOrEqual(0);expect(branch.conceptIndex).toBeLessThan(3);expect(branch.conclusion.length).toBeGreaterThan(50);}
  }
 });
 it('rejects unknown courses and concept indices',()=>{expect(conceptDepth('fake',0)).toBeNull();expect(conceptDepth(modules[0].id,3)).toBeNull();expect(conceptDepth('sabirin-tawhid-99',0)).toBeNull();expect(courseCase('sabirin-hadith-99')).toBeNull();});
});
