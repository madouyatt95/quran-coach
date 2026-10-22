// @vitest-environment jsdom
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {MemoryRouter} from 'react-router-dom';
import {it,expect,beforeEach,afterEach,vi} from 'vitest';
import {createJSONStorage} from 'zustand/middleware';
import {createMemoryStorage} from '../../../test/memoryStorage';
import {QuizGames} from './QuizGames';
import {useQuizGamesStore} from '../../../stores/quizGamesStore';
import {useQuizStore} from '../../../stores/quizStore';
import {FAMILY_BOARDS,wordById,escapeSteps,DESCRIBE_CARDS} from '../../../data/quizGames';
import {chapterBooks} from '../../../data/storyChapters';
import {mysteryBank} from '../../../lib/quizGames';
vi.mock('../../../lib/supabase',()=>({supabase:null}));
vi.mock('../../../lib/fahm/content',()=>({loadFahmVerse:vi.fn(async()=>{throw new Error('offline');}),fahmWords:vi.fn()}));
vi.mock('../AudioPlayer',()=>({AudioPlayer:({onListened}:{onListened?:()=>void})=><button data-testid="audio" onClick={onListened}>Écouter le verset entier</button>}));
vi.mock('../AudioDiscovery',()=>({AudioDiscovery:({question}:{question:{verseRef:{surah:number;ayah:number}}})=><p>Passage révélé {question.verseRef.surah}:{question.verseRef.ayah}</p>}));
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
let root:Root,div:HTMLDivElement;const initial=useQuizGamesStore.getState();
beforeEach(()=>{vi.stubGlobal('localStorage',createMemoryStorage());useQuizGamesStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});useQuizGamesStore.setState(initial,true);useQuizStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});vi.spyOn(window,'scrollTo').mockImplementation(()=>{});div=document.createElement('div');document.body.append(div);root=createRoot(div);});
afterEach(async()=>{await act(async()=>root.unmount());div.remove();vi.restoreAllMocks();});
async function render(kind:string){await act(async()=>root.render(<MemoryRouter initialEntries={['/quiz?game='+kind]}><QuizGames/></MemoryRouter>));}
async function click(text:string){const button=[...div.querySelectorAll('button')].find(b=>b.textContent!.includes(text));expect(button,`button ${text}`).toBeTruthy();await act(async()=>button!.click());}
it('all sixteen family cards are selectable and completing a group removes just its four cards',async()=>{
 await render('families');await click('Les mots du quotidien');expect(div.querySelectorAll('.qg-family-grid button')).toHaveLength(16);
 for(const id of FAMILY_BOARDS[0].groups[0].ids)await click(wordById(id).meaningFr);
 expect(div.querySelectorAll('.qg-family-grid [aria-pressed=true]')).toHaveLength(4);await click('Valider ces 4');expect(div.querySelectorAll('.qg-family-grid button')).toHaveLength(12);expect(div.querySelector('.qg-solved')?.textContent).toContain('Liens familiaux');
});
it('Memory has no hidden answer in the DOM or accessible label and does not hide pairs on a timer',async()=>{
 useQuizGamesStore.getState().start('memory','nature');await render('memory');const g=useQuizGamesStore.getState().games.memory!;if(g.kind!=='memory')throw Error();
 expect(div.querySelector('.qg-memory-grid')?.textContent).not.toContain(wordById(g.cards[0].word).arabic);
 expect([...div.querySelectorAll('.qg-memory-grid button')].every(b=>b.getAttribute('aria-label')?.includes('face cachée'))).toBe(true);
 const positions=g.cards.map((c,i)=>c.word===g.cards[0].word?i:-1).filter(i=>i>=0);
 for(const index of positions)await act(async()=>{(div.querySelectorAll('.qg-memory-grid button')[index] as HTMLButtonElement).click();});
 expect(div.querySelectorAll('.qg-memory-grid .is-matched')).toHaveLength(2);expect(div.textContent).toContain('Continuer à jouer');expect(div.textContent).toContain(wordById(g.cards[0].word).meaningFr);
 await click('Continuer à jouer');const saved=useQuizGamesStore.getState().games.memory;expect(saved?.kind==='memory'&&saved.open).toEqual([]);
});
it('word pronunciation fails explicitly without substituting another word',async()=>{
 const {WordReward}=await import('./WordReward');await act(async()=>root.render(<MemoryRouter><WordReward id={1}/></MemoryRouter>));await click('Prononciation du mot');expect(div.textContent).toContain('Audio indisponible');expect(div.querySelector('a')?.href).toContain('/read?surah=1&ayah=1');
});
it('story cards become a scene lesson only after the correct order',async()=>{
 await render('story');await click('Yusuf :');const book=chapterBooks['prophet:yusuf'];for(const c of book.chapters)await click(c.title);await click('Vérifier le récit');expect(div.textContent).toContain('Comprendre la scène 1/4');expect(div.textContent).toContain(book.chapters[0].text);await click(book.chapters[0].options[book.chapters[0].answer]);expect(div.textContent).toContain('La scène suivante');
});
it('an investigation never exposes later gates before the current proof is solved',async()=>{
 await render('escape');await click('Le rapport de la huppe');const steps=escapeSteps('verifier-un-rapport');expect(div.textContent).toContain(steps[0].questionFr);expect(div.textContent).not.toContain(steps[1].questionFr);await click(steps[0].choices[steps[0].correctIndex]);await click('Passer la porte');expect(div.textContent).toContain(steps[1].questionFr);expect(div.querySelectorAll('.qg-doors .is-unlocked')).toHaveLength(1);
});
it('mystery keeps choices disabled until listening ends and reveals the exact passage on success',async()=>{
 useQuizGamesStore.getState().start('mystery','session');await render('mystery');expect([...div.querySelectorAll('.qx-choices button')].every(b=>(b as HTMLButtonElement).disabled)).toBe(true);
 await click('Écouter le verset entier');const g=useQuizGamesStore.getState().games.mystery!;if(g.kind!=='mystery')throw Error();const q=mysteryBank()[g.rounds[0]],surah=q.verseRef!.surah;const choice=g.choices[0].indexOf(surah);await act(async()=>{(div.querySelectorAll('.qx-choices button')[choice] as HTMLButtonElement).click();});expect(div.textContent).toContain(`Passage révélé ${surah}:`);expect(div.textContent).toContain('Tu as reconnu');
});
it('Fais deviner conceals the answer during handoff, pause, leaving the screen and rehydration',async()=>{
 useQuizGamesStore.getState().start('describe','session');const g=useQuizGamesStore.getState().games.describe!;if(g.kind!=='describe')throw Error();const card=DESCRIBE_CARDS[g.deck[0]];
 await render('describe');expect(div.textContent).not.toContain(card.answer);await click('Je suis prêt');expect(div.querySelector('.qg-describe-card')?.textContent).toContain(card.answer);for(const w of card.forbidden)expect(div.textContent).toContain(w);
 await click('Masquer');expect(div.querySelector('.qg-describe-card')).toBeNull();await click('Je suis prêt');await click('Changer de partie');const saved=useQuizGamesStore.getState().games.describe;expect(saved?.kind==='describe'&&saved.phase).toBe('handoff');expect(div.querySelector('.qg-describe-card')).toBeNull();
});
it('Fais deviner renders a learning card then requires another handoff',async()=>{
 await render('describe');await click('Dix mots');await click('Je suis prêt');await click('Le groupe a trouvé');expect(div.textContent).toContain('Trouvé ensemble');await click('Passer le téléphone');expect(div.textContent).toContain('Les autres regardent ailleurs');expect(div.textContent).toContain('Carte 2/10');
});
it('opening another game does not replace the saved one and changing a pack requires an explicit click',async()=>{
 useQuizGamesStore.getState().start('memory','nature');const before=useQuizGamesStore.getState().games.memory;await render('families');expect(useQuizGamesStore.getState().games.memory).toBe(before);await click('Les mots du quotidien');await click('Changer de partie');expect(div.textContent).toContain('Remplacer ma partie');expect(useQuizGamesStore.getState().games.families?.id).toBe('everyday');
});
it('an unknown game has an exit back to the legacy quiz home',async()=>{await render('unknown');await click('Quiz & défis');expect(useQuizStore.getState().view).toBe('home');});
