import {it,expect} from 'vitest';
import {getQuestionBank,generateSiraLevels,generateAudioQuestions,getDuelRoundQuestions,getQuestions} from './quizEngine';
import {learningBank} from './quizLearning';
import {CHAPTERS} from './interactiveMushaf/model';
import {FAMILY_BOARDS,MEMORY_PACKS,DESCRIBE_CARDS,wordById,STORY_GAMES,ESCAPE_GAMES,escapeSteps} from '../data/quizGames';
import {chapterBooks} from '../data/storyChapters';
const classic=[...Object.values(getQuestionBank()).flat(),...generateSiraLevels().flatMap(l=>l.questions),...generateAudioQuestions()];
it('audits every classic, Sira, audio and learning question for answer integrity and valid Quran references',()=>{
 const errors:string[]=[];
 for(const q of [...classic,...learningBank()]){
  if(!q.questionFr.trim()||!q.id||!q.choices.length||!Number.isInteger(q.correctIndex)||!q.choices[q.correctIndex]?.trim())errors.push(`${q.id}: missing question/answer`);
  if(q.choices.some(c=>!c.trim()))errors.push(`${q.id}: empty option`);
  if(new Set(q.choices.map(c=>c.trim().toLowerCase())).size!==q.choices.length)errors.push(`${q.id}: duplicate choice ${q.questionFr}`);
  if(q.verseRef){const {surah,ayah}=q.verseRef;if(!Number.isInteger(surah)||!Number.isInteger(ayah)||!CHAPTERS[surah-1]||ayah<1||ayah>CHAPTERS[surah-1].count)errors.push(`${q.id}: invalid reference`);}
 }
 console.info(`Audit: ${classic.length} classic/Sira/audio questions, ${learningBank().length} learning questions`);
 expect(errors).toEqual([]);
});
it('all 15 themes support each difficulty and duels contain three playable rounds',()=>{
 for(const theme of Object.keys(getQuestionBank()) as (keyof ReturnType<typeof getQuestionBank>)[]){
  for(const d of ['easy','medium','hard'] as const){const qs=getQuestions(theme,10,d);expect(qs.length).toBeGreaterThan(0);expect(new Set(qs.map(q=>q.id)).size).toBe(qs.length);expect(qs.every(q=>q.correctIndex>=0&&q.correctIndex<q.choices.length)).toBe(true);}
 }
 const duel=getDuelRoundQuestions();expect(duel.questions).toHaveLength(3);expect(duel.questions.every(q=>q.length===3)).toBe(true);
});
it('all six original games use complete unique content and answer references',()=>{
 for(const b of FAMILY_BOARDS){const ids=b.groups.flatMap(g=>g.ids);expect(new Set(ids).size).toBe(16);expect(ids.every(id=>wordById(id))).toBe(true);}
 for(const p of MEMORY_PACKS){expect(new Set(p.ids).size).toBe(6);expect(p.ids.every(id=>wordById(id))).toBe(true);}
 expect(DESCRIBE_CARDS.every(c=>wordById(c.word)&&c.forbidden.length===3)).toBe(true);
 for(const s of STORY_GAMES)expect(chapterBooks[s.id].chapters.every(c=>c.options[c.answer]&&c.explanation&&c.reading)).toBe(true);
 for(const s of ESCAPE_GAMES)expect(escapeSteps(s.id)).toHaveLength(3);
});
