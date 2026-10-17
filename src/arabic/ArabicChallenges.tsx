import {lessonById} from './data';
import {Link} from 'react-router-dom';
import {nextChallenge,type ExerciseHistory} from './challengeRotation';
import './LearningBridges.css';
import {usePracticeState,useArabicPracticeStore} from '../stores/arabicPracticeStore';
import {useArabicAdventureStore} from '../stores/arabicAdventureStore';
import {DUELS,INQUIRIES,type Duel,type Inquiry} from './playData';
import {PlayFrame} from './PlayFrame';
import {playFeedback} from './playFeedback';
function markChallenge(kind:'duel'|'inquiry',id:string){
 const store=useArabicPracticeStore.getState();const key=`challenge:${kind}`;const old=store.workshops[key] as ExerciseHistory|undefined;
 store.save(key,{seen:[...(old?.seen||[]).filter(v=>v!==id),id]});
}
export function DuelStudio(){return <ChallengeStudio kind="duel"/>;}
function ChallengeStudio({kind}:{kind:'duel'|'inquiry'}){
 const bank=kind==='duel'?DUELS:INQUIRIES;
 const [index,setIndex]=usePracticeState(kind==='duel'?'play:duel:index':'play:inquiry:index',0);
 const [round,setRound]=usePracticeState(`challenge:${kind}:round`,0);
 const current=bank[index]||bank[0];
 const [history]=usePracticeState<ExerciseHistory>(`challenge:${kind}`,{seen:[]});
 const [lesson,setLesson]=usePracticeState(`challenge:${kind}:lesson`,'');
 const available=lesson?bank.filter(t=>t.lesson===lesson):bank;
 function renew(){const next=nextChallenge(bank,current,history.seen);setIndex(bank.findIndex(t=>t.id===next.id));setRound(r=>r+1);}
 return <><h1>{kind==='duel'?'Le duel des phrases':'Les enquêtes de la langue'}</h1><p>{kind==='duel'?'Comparez les constructions et découvrez ce qui change.':'Touchez les mots pour recueillir les indices, puis résolvez l’énigme.'}</p>
 <label>Notion à travailler<select value={lesson} onChange={e=>{const value=e.target.value;setLesson(value);const i=bank.findIndex(t=>!value||t.lesson===value);setIndex(i);setRound(r=>r+1);}}><option value="">Toutes les notions</option>{[...new Set(bank.map(t=>t.lesson))].map(id=><option key={id} value={id}>{lessonById(id)?.title}</option>)}</select></label>
 <details className="arabic-help"><summary>Choisir parmi {available.length} exemples</summary><div className="arabic-options" aria-label="Exemples disponibles">{available.map(t=><button key={t.id} aria-pressed={t.id===current.id} onClick={()=>{setIndex(bank.findIndex(v=>v.id===t.id));setRound(r=>r+1);}}>{t.title}{history.seen.includes(t.id)?' · déjà rencontré':''}</button>)}</div></details>
 <PlayFrame title={current.title} step={index+1} total={bank.length} scene={`${kind}:${current.id}:${round}`}>
 {kind==='duel'?<DuelRound key={`${current.id}:${round}`} task={current as Duel} storageKey={`play:duel:${current.id}${round?`:round:${round}`:''}`} onNext={renew} onAlternative={renew} nextLabel="Un autre exemple de cette notion →"/>:<InquiryRound key={`${current.id}:${round}`} task={current as Inquiry} storageKey={`play:inquiry:${current.id}${round?`:round:${round}`:''}`} onNext={renew} onAlternative={renew} nextLabel="Une autre enquête sur cette notion →"/>}
 </PlayFrame><div className="arabic-renewal"><button onClick={renew}>Changer d’exemple</button><small>{history.seen.length} / {bank.length} exemples rencontrés</small></div><Link to="/academy/arabic?atelier=collection">Mon carnet →</Link></>;
}
export function DuelRound({task,onNext,storageKey,onAlternative,nextLabel="Manche suivante →"}:{task:Duel;onNext?:()=>void;storageKey?:string;onAlternative?:()=>void;nextLabel?:string}){
 const [d,setD]=usePracticeState<{choice:number|null;assisted:boolean}>(storageKey||`play:duel:${task.id}`,{choice:null,assisted:false});const correct=d.choice===task.answer;
 function choose(i:0|1){if(correct)return;markChallenge('duel',task.id);const assisted=d.assisted||d.choice!==null;setD({choice:i,assisted});if(i===task.answer){useArabicAdventureStore.getState().win('duel',task.id,i,assisted);playFeedback();}}
 return <><span className="fahm-eyebrow">EXEMPLES PÉDAGOGIQUES</span><p className="arabic-play-prompt">{task.prompt}</p><div className={`arabic-duel ${d.choice!==null?'is-revealed':''}`}>{task.words.map((words,i)=><button key={i} disabled={correct} aria-pressed={d.choice===i} aria-label={`Choisir la phrase ${i===0?'A':'B'}`} onClick={()=>choose(i as 0|1)}><span className="arabic-duel-letter">{i===0?'A':'B'}</span><span className="arabic-duel-words" lang="ar" dir="rtl">{words.map((w,j)=><span key={j} className={task.changed.includes(j)?'is-difference':''}>{w}{' '}</span>)}</span>{d.choice!==null&&<span className="arabic-duel-meaning">{task.meanings[i]}</span>}</button>)}</div>{d.choice!==null&&<div className={`arabic-reveal ${correct?'is-success':''}`} role="status"><strong>{correct?'Vous avez trouvé la différence.':'Regardez les éléments soulignés.'}</strong><p>{task.explanation}</p>{!correct&&onAlternative&&<button onClick={onAlternative}>Essayer cette notion dans un autre exemple →</button>}{correct&&<><small>{d.assisted?'Avec un coup de pouce.':'Sans aide.'}</small>{onNext?<button className="fahm-primary" onClick={onNext}>{nextLabel}</button>:<Link to="/academy/arabic?atelier=collection">Retrouver mes mots →</Link>}</>}</div>}<details><summary>Reprendre l’explication du cours</summary><Link to={`/academy/arabic/${task.lesson}`}>Ouvrir la leçon →</Link></details></>;
}
export function InquiryStudio(){return <ChallengeStudio kind="inquiry"/>;}
export function InquiryRound({task,onNext,storageKey,onAlternative,nextLabel="Enquête suivante →"}:{task:Inquiry;onNext?:()=>void;storageKey?:string;onAlternative?:()=>void;nextLabel?:string}){
 const [d,setD]=usePracticeState<{clues:number[];choice:number|null}>(storageKey||`play:inquiry:${task.id}`,{clues:[],choice:null});const ready=task.required.every(i=>d.clues.includes(i)),correct=d.choice===task.answer;
 function choose(i:number){if(!ready||correct)return;markChallenge('inquiry',task.id);setD(x=>({...x,choice:i}));if(i===task.answer){useArabicAdventureStore.getState().win('inquiry',task.id,i,true);playFeedback();}}
 return <><span className="fahm-eyebrow">EXEMPLE PÉDAGOGIQUE · DOSSIER À RÉSOUDRE</span><p className="arabic-play-prompt">{task.claim}</p><div className="grammar-words arabic-clue-words" dir="rtl">{task.words.map((w,i)=><button key={i} lang="ar" aria-pressed={d.clues.includes(i)} onClick={()=>setD(x=>({...x,clues:[...new Set([...x.clues,i])]}))}>{w}</button>)}</div><p>{task.required.filter(i=>d.clues.includes(i)).length} / {task.required.length} indices décisifs réunis</p><div className="arabic-clue-list">{task.clues.filter(c=>d.clues.includes(c.word)).map(c=><article key={c.word}><span aria-hidden="true">✦</span><div><strong>{c.label}</strong><p>{c.detail}</p></div></article>)}</div>{!ready&&<p className="arabic-muted">Examinez encore les mots pour réunir les indices nécessaires.</p>}<div className="arabic-options">{task.solutions.map((s,i)=><button key={s} disabled={!ready||correct} aria-pressed={d.choice===i} onClick={()=>choose(i)}>{s}</button>)}</div>{d.choice!==null&&<div className={`arabic-reveal ${correct?'is-success':''}`} role="status"><strong>{correct?'Enquête résolue.':'Reliez votre proposition aux indices.'}</strong><p>{task.explanation}</p>{!correct&&onAlternative&&<button onClick={onAlternative}>Essayer cette notion dans un autre exemple →</button>}{correct&&onNext&&<button className="fahm-primary" onClick={onNext}>{nextLabel}</button>}</div>}<Link to={`/academy/arabic/${task.lesson}`}>Revoir la construction dans le cours →</Link></>;
}
