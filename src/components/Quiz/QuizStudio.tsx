import {useEffect,useMemo,useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {QUIZ_THEMES,type QuizThemeId} from '../../data/quizTypes';
import {buildLearningSession,learningCandidates,decodeQuizShare,type LearningStage,type LearningQuestion,type QuizContext} from '../../lib/quizLearning';
import {useQuizStore} from '../../stores/quizStore';
import {useQuizLearningStore} from '../../stores/quizLearningStore';
import {useAcademyStore} from '../../stores/academyStore';
import {useEditorialJourneyStore} from '../../stores/editorialJourneyStore';
import {useFahmLearningStore} from '../../stores/fahmLearningStore';
import {useAdhkarExperienceStore} from '../../stores/adhkarExperienceStore';
import {useQuranStore} from '../../stores/quranStore';
import {QuizStudy,Correction} from './QuizStudy';
export function QuizStudio(){
 const [now,setNow]=useState(()=>Date.now());
 useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),60000);return()=>clearInterval(timer);},[]);
 const [params,setParams]=useSearchParams();const shared=params.get('challenge');
 const [screen,setScreen]=useState<'choose'|'session'|'notebook'>('choose');
 const [stage,setStage]=useState<LearningStage|'all'>('all'),[theme,setTheme]=useState<QuizThemeId|'all'>('all'),[personal,setPersonal]=useState(false),[surah,setSurah]=useState('');
 const [format,setFormat]=useState<LearningQuestion['format']|'all'>('all');
 const [includeAudio,setIncludeAudio]=useState(false),[adaptive,setAdaptive]=useState(true);
 const [mode,setMode]=useState<'learn'|'family'|'coop'>('learn'),[names,setNames]=useState('Joueur 1, Joueur 2');
 const store=useQuizLearningStore();
 const academy=useAcademyStore(s=>s.progress),stories=useEditorialJourneyStore(s=>s.progress),fahm=useFahmLearningStore(s=>s.studied),adhkar=useAdhkarExperienceStore(s=>s.learned),currentSurah=useQuranStore(s=>s.currentSurah);
 const context:QuizContext={academy:Object.keys(academy).filter(k=>academy[k].lastVisitedAt||academy[k].completed),stories:Object.keys(stories),invocations:Object.keys(adhkar),verses:Object.values(fahm).flat(),surah:currentSurah};
 const validSurah=!surah||Number.isInteger(Number(surah))&&Number(surah)>=1&&Number(surah)<=114;
 const options={stage:stage==='all'?undefined:stage,theme:theme==='all'?undefined:theme,context:personal?context:undefined,recalls:store.recalls,count:8,includeAudio,now,surah:surah?Number(surah):undefined,format:format==='all'?undefined:format};
 const candidates=validSurah?learningCandidates(options):[];
 const questions=validSurah?buildLearningSession(options):[];
 const sharedQuestions=useMemo(()=>shared?decodeQuizShare(shared):null,[shared]);
 if(screen==='session'&&store.session)return <QuizStudy/>;
 const home=()=>useQuizStore.getState().setView('home');
 if(screen==='notebook')return <main className="quiz-container qx"><button onClick={()=>setScreen('choose')}>← Mes séances</button><h1>À retenir</h1>{Object.keys(store.saved).length===0?<p>Enregistre une correction pour la retrouver ici.</p>:Object.values(store.saved).map(q=><details className="qx-card" key={q.id}><summary>{q.questionFr}</summary><Correction q={q}/></details>)}</main>;
 const due=learningCandidates({recalls:store.recalls,reviewOnly:true,now,includeAudio:true}).length;
 return <main className="quiz-container qx"><header className="qx-header"><button onClick={home}>← Quiz & défis</button><button onClick={()=>setScreen('notebook')}>☆ À retenir ({Object.keys(store.saved).length})</button></header><h1>Une séance à ton rythme</h1><p>Comprendre, pratiquer et retrouver ce que tu as appris. Sans chronomètre.</p>
 {shared&&<section className="qx-card"><h2>Un défi pour toi</h2>{sharedQuestions?<><p>{sharedQuestions.length} questions partagées. La correction se découvre à la fin.</p><button className="qx-primary" onClick={()=>{store.start('Défi partagé',sharedQuestions,'shared');setScreen('session');setParams({}, {replace:true});}}>Relever ce défi</button></>:<p>Ce lien est incomplet ou correspond à une ancienne édition. Choisis une nouvelle séance ci-dessous.</p>}</section>}
 {store.session&&!store.session.finished&&<button className="qx-resume" onClick={()=>setScreen('session')}>▶ Reprendre « {store.session.title} » · {store.session.index+1}/{store.session.questions.length}</button>}
 <section className="qx-card"><div className="qx-tabs" aria-label="Mode de séance">{([['learn','🌱 Apprendre'],['family','📱 À tour de rôle'],['coop','🤝 Ensemble']] as const).map(([id,label])=><button key={id} aria-pressed={mode===id} onClick={()=>setMode(id)}>{label}</button>)}</div>{mode==='family'&&<label>Prénoms, séparés par des virgules<input value={names} maxLength={150} onChange={e=>setNames(e.target.value)}/></label>}{mode==='coop'&&<p>Discutez ensemble avant de répondre. Votre objectif commun : 70 % de bonnes réponses.</p>}
 <h2>Que veux-tu travailler ?</h2><div className="qx-tabs">{([['all','Un peu de tout'],['discover','Découvrir'],['understand','Comprendre'],['apply','Appliquer']] as const).map(([id,label])=><button key={id} aria-pressed={stage===id} onClick={()=>setStage(id)}>{label}</button>)}</div>
 <label>Thème<select value={theme} onChange={e=>setTheme(e.target.value as QuizThemeId|'all')}><option value="all">Tous les thèmes</option>{QUIZ_THEMES.map(t=><option key={t.id} value={t.id}>{t.emoji} {t.name}</option>)}</select></label>
 <label>Exercices<select value={format} onChange={e=>setFormat(e.target.value as LearningQuestion['format']|'all')}><option value="all">Formats variés</option><option value="match">Associations tactiles</option><option value="order">Chronologies à reconstruire</option><option value="choice">Questions à choix</option><option value="passage">Lecture et compréhension</option></select></label><label className="qx-check"><input type="checkbox" checked={personal} onChange={e=>setPersonal(e.target.checked)}/> À partir de mes lectures et cours</label><p className="qx-muted">Cours visités, récits ouverts, invocations étudiées et passages de Fahm.</p>
 <label className="qx-check"><input type="checkbox" checked={includeAudio} onChange={e=>setIncludeAudio(e.target.checked)}/> Inclure l’écoute et la compréhension audio</label>
 <p className="qx-muted">Les filtres se cumulent : thème, niveau, lectures personnelles et sourate.</p><label>Sourate précise (facultatif)<input inputMode="numeric" type="number" min={1} max={114} placeholder="Numéro de 1 à 114" value={surah} onChange={e=>setSurah(e.target.value)}/></label>
 {!validSurah&&<p role="alert">Choisis un numéro entier entre 1 et 114.</p>}<label className="qx-check"><input type="checkbox" checked={adaptive} onChange={e=>setAdaptive(e.target.checked)}/> Adapter la suite à mes réponses</label><p className="qx-muted">En mode Apprendre, les exercices s’ajustent en respectant tous tes filtres.</p>{questions.length?<p>{questions.length} exercices prêts · les révisions dues passent en premier.</p>:<p role="status">Aucun exercice préparé pour cette sélection. Essaie un autre thème ou un autre niveau.</p>}
 {store.session&&!store.session.finished&&<p>Commencer une nouvelle séance remplace la partie en pause. Les acquis sont conservés.</p>}
 <button className="qx-primary" disabled={!questions.length||(mode==='family'&&names.split(',').filter(n=>n.trim()).length<2)} onClick={()=>{store.start(mode==='learn'?'Ma séance d’apprentissage':mode==='family'?'À tour de rôle':'Ensemble',questions,mode,names.split(','),{adaptive,poolIds:candidates.map(q=>q.id)});setScreen('session');}}>Commencer · {questions.length} exercices</button>
 </section><button disabled={!due} onClick={()=>{const q=buildLearningSession({recalls:store.recalls,reviewOnly:true,includeAudio:true});store.start('Mes révisions',q);setScreen('session');}}>↻ Mes révisions dues ({due})</button><p className="qx-muted">Une réponse retrouvée le jour même ne suffit pas à confirmer un acquis : il sera revu à distance.</p></main>;
}
