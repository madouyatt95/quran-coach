import {useState} from 'react';
import {Link} from 'react-router-dom';
import {QUIZ_THEMES,type QuizThemeId} from '../../data/quizTypes';
import {getQuestions,getSprintQuestions} from '../../lib/quizEngine';
import {legacyLearningQuestion} from '../../lib/quizLearning';
import {useQuizLearningStore} from '../../stores/quizLearningStore';
import {useQuizStore} from '../../stores/quizStore';
export function DuelChoice(){
 const setView=useQuizStore(s=>s.setView);
 return <main className="quiz-container qx"><header className="qx-header"><button onClick={()=>setView('home')}>← Quiz & défis</button></header><h1>Comment voulez-vous jouer ?</h1>
 <button className="qx-card qx-launch" onClick={()=>setView('local-duel')}>📱 <span><strong>Sur ce téléphone</strong><small>Deux joueurs · les mêmes questions · sans code</small></span><b>→</b></button>
 <Link className="qx-card qx-launch" to="/quiz?table=1">🤝 <span><strong>Face à face</strong><small>Une moitié par joueur · réponses révélées ensemble</small></span><b>→</b></Link>
 <button className="qx-card qx-launch" onClick={()=>setView('lobby')}>⚔️ <span><strong>À distance</strong><small>Créer un duel en ligne et inviter un ami</small></span><b>→</b></button>
 <button onClick={()=>setView('join')}>🔑 Rejoindre avec un code</button></main>;
}

export function LocalDuelSetup(){
 const [first,setFirst]=useState('Joueur 1'),[second,setSecond]=useState('Joueur 2'),[theme,setTheme]=useState<QuizThemeId|'all'>('all');
 const study=useQuizLearningStore();const setView=useQuizStore(s=>s.setView);
 const start=()=>{const questions=theme==='all'?getSprintQuestions(5):getQuestions(theme,5,'medium');study.start('Duel sur un téléphone',questions.map(legacyLearningQuestion),'local-duel',[first,second]);setView('study');};
 return <main className="quiz-container qx"><header className="qx-header"><button onClick={()=>setView('duel-choice')}>← Duel</button></header><h1>Un téléphone, deux joueurs</h1><p>5 questions chacun, les mêmes pour tous les deux. Un point par bonne réponse, sans chronomètre.</p>
 <section className="qx-card"><label>Premier joueur<input value={first} maxLength={24} onChange={e=>setFirst(e.target.value)}/></label><label>Deuxième joueur<input value={second} maxLength={24} onChange={e=>setSecond(e.target.value)}/></label>
 <label>Thème<select value={theme} onChange={e=>setTheme(e.target.value as QuizThemeId|'all')}><option value="all">Un peu de tout</option>{QUIZ_THEMES.map(t=><option key={t.id} value={t.id}>{t.emoji} {t.name}</option>)}</select></label>
 <p>Passez le téléphone à chaque tour. Les réponses et la correction se découvrent ensemble à la fin.</p>
 {study.session&&!study.session.finished&&<p>Cette partie remplacera la séance en pause.</p>}
 <button className="qx-primary" disabled={!first.trim()||!second.trim()} onClick={start}>Commencer le duel →</button></section></main>;
}
