import {it,expect} from 'vitest';
import {createGame,reduceGame,mysteryBank,mysteryAudioUrl,mysteryTarget,mysteryMaxLevel,type FamiliesGame,type MemoryGame,type StoryGame,type EscapeGame,type MysteryGame,type DescribeGame} from './quizGames';
import {FAMILY_BOARDS,MEMORY_PACKS,STORY_GAMES,ESCAPE_GAMES,DESCRIBE_CARDS,wordById,escapeSteps} from '../data/quizGames';
import {chapterBooks} from '../data/storyChapters';
import {validTarget} from './fahm/learning';
it('all authored packs resolve to unique words, distinct meanings and real story chapters',()=>{
 for(const b of FAMILY_BOARDS){expect(b.groups).toHaveLength(4);const ids=b.groups.flatMap(g=>g.ids);expect(new Set(ids).size).toBe(16);expect(new Set(ids.map(id=>wordById(id).meaningFr)).size).toBe(16);for(const g of b.groups){expect(g.ids).toHaveLength(4);expect(g.why.length).toBeGreaterThan(15);}}
 for(const p of MEMORY_PACKS){expect(new Set(p.ids.map(id=>wordById(id).arabic)).size).toBe(6);expect(new Set(p.ids.map(id=>wordById(id).meaningFr)).size).toBe(6);}
 expect(STORY_GAMES).toHaveLength(6);for(const s of STORY_GAMES)expect(chapterBooks[s.id].chapters.length).toBeGreaterThan(2);
 for(const c of DESCRIBE_CARDS){expect(wordById(c.word)).toBeTruthy();expect(new Set(c.forbidden).size).toBe(3);}
});
it('families rejects incomplete/invalid groups, limits selection and solves all four exactly once',()=>{
 let g=createGame('families',FAMILY_BOARDS[0].id) as FamiliesGame;const b=FAMILY_BOARDS[0];
 expect(reduceGame(g,{type:'check'})).toBe(g);expect(reduceGame(g,{type:'toggle',index:999999})).toBe(g);
 for(const id of [b.groups[0].ids[0],b.groups[0].ids[1],b.groups[0].ids[2],b.groups[1].ids[0],b.groups[2].ids[0]])g=reduceGame(g,{type:'toggle',index:id}) as FamiliesGame;
 expect(g.selected).toHaveLength(4);g=reduceGame(g,{type:'check'}) as FamiliesGame;expect(g.solved).toHaveLength(0);expect(g.message).toContain('Trois cartes');
 g=reduceGame(g,{type:'reset-selection'}) as FamiliesGame;
 for(const group of b.groups){for(const id of group.ids)g=reduceGame(g,{type:'toggle',index:id}) as FamiliesGame;g=reduceGame(g,{type:'check'}) as FamiliesGame;}
 expect(g.finished).toBe(true);expect(g.solved).toHaveLength(4);expect(g.attempts).toBe(5);expect(reduceGame(g,{type:'check'})).toBe(g);
});
it('family hints never reveal completed groups or count the same hint twice',()=>{let g=createGame('families','language') as FamiliesGame;for(let i=0;i<8;i++)g=reduceGame(g,{type:'hint'}) as FamiliesGame;expect(g.hints).toBe(4);expect(new Set(g.hinted).size).toBe(4);});
it('memory conceals unmatched cards, rejects double/third flips and matches identity rather than visible text',()=>{
 let g=createGame('memory','nature') as MemoryGame;expect(g.cards).toHaveLength(12);const first=0,other=g.cards.findIndex(c=>c.word!==g.cards[first].word);
 g=reduceGame(g,{type:'toggle',index:first}) as MemoryGame;expect(reduceGame(g,{type:'toggle',index:first})).toBe(g);
 g=reduceGame(g,{type:'toggle',index:other}) as MemoryGame;expect(g.matched).toEqual([]);expect(g.attempts).toBe(1);expect(reduceGame(g,{type:'toggle',index:5})).toBe(g);
 g=reduceGame(g,{type:'next'}) as MemoryGame;expect(g.open).toEqual([]);
 for(const word of MEMORY_PACKS[0].ids){for(const i of g.cards.map((c,i)=>c.word===word?i:-1).filter(i=>i>=0))g=reduceGame(g,{type:'toggle',index:i}) as MemoryGame;if(!g.finished)g=reduceGame(g,{type:'next'}) as MemoryGame;}
 expect(g.finished).toBe(true);expect(g.matched).toHaveLength(6);expect(g.attempts).toBe(7);
});
it('every story requires the correct sequence, then each scene meaning, without skipping',()=>{
 for(const book of STORY_GAMES){let g=createGame('story',book.id) as StoryGame;const chapters=chapterBooks[g.id].chapters;
 expect(reduceGame(g,{type:'next'})).toBe(g);for(const i of chapters.map((_,i)=>i).reverse())g=reduceGame(g,{type:'toggle',index:i}) as StoryGame;g=reduceGame(g,{type:'check'}) as StoryGame;expect(g.stage).toBe('order');
 g=reduceGame(g,{type:'reset-selection'}) as StoryGame;for(let i=0;i<chapters.length;i++)g=reduceGame(g,{type:'toggle',index:i}) as StoryGame;g=reduceGame(g,{type:'check'}) as StoryGame;expect(g.stage).toBe('meaning');
 for(const chapter of chapters){g=reduceGame(g,{type:'answer',index:(chapter.answer+1)%3}) as StoryGame;expect(g.unlocked).toBe(false);expect(reduceGame(g,{type:'next'})).toBe(g);g=reduceGame(g,{type:'answer',index:chapter.answer}) as StoryGame;expect(g.unlocked).toBe(true);g=reduceGame(g,{type:'next'}) as StoryGame;}
 expect(g.finished).toBe(true);}
});
it('all three investigation gates require correct answers and count hints once',()=>{
 for(const item of ESCAPE_GAMES){let g=createGame('escape',item.id) as EscapeGame;const steps=escapeSteps(item.id);expect(steps).toHaveLength(3);
 for(const q of steps){expect(reduceGame(g,{type:'next'})).toBe(g);g=reduceGame(g,{type:'hint'}) as EscapeGame;const before=g.hints;g=reduceGame(g,{type:'hint'}) as EscapeGame;expect(g.hints).toBe(before);g=reduceGame(g,{type:'answer',index:(q.correctIndex+1)%q.choices.length}) as EscapeGame;expect(g.unlocked).toBe(false);g=reduceGame(g,{type:'answer',index:q.correctIndex}) as EscapeGame;g=reduceGame(g,{type:'next'}) as EscapeGame;}expect(g.finished).toBe(false);for(const index of [2,1,0])g=reduceGame(g,{type:'toggle',index}) as EscapeGame;g=reduceGame(g,{type:'check'}) as EscapeGame;expect(g.finished).toBe(false);g=reduceGame(g,{type:'reset-selection'}) as EscapeGame;for(const index of [0,1,2])g=reduceGame(g,{type:'toggle',index}) as EscapeGame;g=reduceGame(g,{type:'check'}) as EscapeGame;expect(g.finished).toBe(true);expect(g.hints).toBe(3);}
});
it('mystery uses five different surahs and only whole in-range verses, including short surahs',()=>{
 let g=createGame('mystery','session') as MysteryGame;expect(new Set(g.rounds).size).toBe(5);
 const bank=mysteryBank();for(let i=0;i<bank.length;i++){g={...g,index:0,rounds:[i]};expect(mysteryAudioUrl({...g,level:0})).toBe(bank[i].audioUrl);for(let level=0;level<=mysteryMaxLevel(g);level++){const t=mysteryTarget({...g,level});expect(validTarget(t.surah,t.ayah)).toBe(true);expect(t.ayah).toBe(bank[i].verseRef!.ayah+level);}}
});
it('mystery requires listening, excludes repeats, advances hints and ends after five resolved rounds',()=>{
 let g=createGame('mystery','session',{},()=>.4) as MysteryGame;const bank=mysteryBank();
 expect(reduceGame(g,{type:'answer',index:g.choices[0][0]})).toBe(g);
 const correct=bank[g.rounds[0]].verseRef!.surah,wrong=g.choices[0].find(id=>id!==correct)!;
 g=reduceGame(g,{type:'heard'}) as MysteryGame;g=reduceGame(g,{type:'answer',index:wrong}) as MysteryGame;expect(g.guesses).toEqual([wrong]);expect(g.attempts).toBe(1);expect(reduceGame(g,{type:'answer',index:wrong})).toBe(g);
 for(let n=0;n<5;n++){g=reduceGame(g,{type:'heard'}) as MysteryGame;g=reduceGame(g,{type:'answer',index:bank[g.rounds[g.index]].verseRef!.surah}) as MysteryGame;g=reduceGame(g,{type:'next'}) as MysteryGame;}
 expect(g.finished).toBe(true);expect(g.results).toHaveLength(5);expect(g.results.every(r=>r.correct)).toBe(true);expect(reduceGame(g,{type:'next'})).toBe(g);
});
it('revealing a mystery answer is never credited as recognized, and three wrong guesses reveal it',()=>{
 let g=createGame('mystery','session') as MysteryGame;const correct=mysteryBank()[g.rounds[0]].verseRef!.surah;for(const wrong of g.choices[0].filter(id=>id!==correct)){g=reduceGame(g,{type:'heard'}) as MysteryGame;g=reduceGame(g,{type:'answer',index:wrong}) as MysteryGame;}
 expect(g.revealed).toBe(true);g=reduceGame(g,{type:'next'}) as MysteryGame;expect(g.results[0].correct).toBe(false);
 g=reduceGame(g,{type:'reveal'}) as MysteryGame;g=reduceGame(g,{type:'next'}) as MysteryGame;expect(g.results[1].correct).toBe(false);
});
it('describe masks the card before play, pauses the real timer and rejects success after expiration',()=>{
 let g=createGame('describe','session',{seconds:60}) as DescribeGame;expect(g.phase).toBe('handoff');expect(reduceGame(g,{type:'describe-result',found:true,reason:'yes',now:0})).toBe(g);
 g=reduceGame(g,{type:'ready',now:1000}) as DescribeGame;g=reduceGame(g,{type:'pause',now:11000}) as DescribeGame;expect(g.phase).toBe('handoff');expect(g.remaining).toBe(50000);
 g=reduceGame(g,{type:'tick',now:1000000}) as DescribeGame;expect(g.remaining).toBe(50000);g=reduceGame(g,{type:'ready',now:1000000}) as DescribeGame;
 g=reduceGame(g,{type:'describe-result',now:1050001,found:true,reason:'found'}) as DescribeGame;expect(g.found).toBe(false);expect(g.phase).toBe('review');g=reduceGame(g,{type:'next'}) as DescribeGame;expect(g.results[0].found).toBe(false);expect(g.phase).toBe('handoff');
});
it('describe untimed mode does not expire and finishes ten cards once each',()=>{
 let g=createGame('describe','session') as DescribeGame;expect(new Set(g.deck).size).toBe(10);
 for(let i=0;i<10;i++){g=reduceGame(g,{type:'ready',now:0}) as DescribeGame;g=reduceGame(g,{type:'tick',now:9999999}) as DescribeGame;expect(g.phase).toBe('active');g=reduceGame(g,{type:'describe-result',now:9999999,found:i%2===0,reason:'groupe'}) as DescribeGame;g=reduceGame(g,{type:'next'}) as DescribeGame;}
 expect(g.finished).toBe(true);expect(g.results).toHaveLength(10);expect(g.results.filter(r=>r.found)).toHaveLength(5);
});
