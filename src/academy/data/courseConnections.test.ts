import {describe,it,expect} from 'vitest';
import {COURSE_LEVELS} from './courseLibrary';
import {courseConnections,courseHref,courseReturnFrom} from './courseConnections';

describe('curated course connections',()=>{
 it('opens existing, distinct concepts for all 30 source chapters',()=>{
  const modules=COURSE_LEVELS.flatMap(level=>level.modules);
  expect(modules).toHaveLength(30);
  for(const module of modules){
   const links=courseConnections(module.id);
   expect(links).toHaveLength(3);
   expect(new Set(links.map(link=>link.to)).size).toBe(3);
   for(const link of links){
    expect(link.to).not.toBe(module.id);
    const destination=modules.find(candidate=>candidate.id===link.to);
    expect(destination,`${module.id} → ${link.to}`).toBeDefined();
    const lesson=destination!.content[0];expect(lesson.type).toBe('lesson');
    if(lesson.type==='lesson')expect(lesson.sections[link.section].title).toBe(link.title);
    expect(link.reason.length).toBeGreaterThan(50);
   }
  }
 });
 it('connects intention to conformity and the study of faith to Jibril rather than chapter order',()=>{
  const intention=courseConnections('sabirin-hadith-3',0)[0];
  expect(intention).toMatchObject({to:'sabirin-hadith-17',section:1,title:'Intention et conformité'});
  expect(intention.reason).toContain('pourquoi agir');
  expect(courseConnections('sabirin-tawhid-1',0)[0]).toMatchObject({to:'sabirin-hadith-2',section:1,title:'Islam, foi, excellence'});
  expect(courseConnections('sabirin-tawhid-1',2)[0].to).toBe('sabirin-tawhid-2');
 });
 it('validates return state against the catalog and rejects external or invalid targets',()=>{
  expect(courseReturnFrom({courseReturn:{moduleId:'sabirin-tawhid-1',title:'Untrusted title',section:2}})).toEqual({moduleId:'sabirin-tawhid-1',title:'La croyance authentique',section:2});
  for(const state of [undefined,{courseReturn:{moduleId:'https://example.com',section:0}},{courseReturn:{moduleId:'sabirin-tawhid-1',section:3}},{courseReturn:{moduleId:'sabirin-tawhid-1',section:-1}},{courseReturn:{moduleId:'sabirin-tawhid-1',section:'1'}}])expect(courseReturnFrom(state)).toBeNull();
  expect(courseHref('sabirin-hadith-17',1)).toBe('/academy?module=sabirin-hadith-17&section=1');
 });
});
