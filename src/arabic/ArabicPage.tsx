import {useArabicAdventureStore} from '../stores/arabicAdventureStore';
import {useEffect,useState} from 'react';
import {Link,useParams,useSearchParams} from 'react-router-dom';
import {ARABIC_LESSONS,lessonById,grammarCheckId} from './data';
import {SKILL_LABELS,type ArabicLesson} from './types';
import {useArabicLearningStore} from '../stores/arabicLearningStore';
import {useFahmLearningStore} from '../stores/fahmLearningStore';
import {useHomeClock} from '../components/Home/useHomeClock';
import {loadFahmVerse,fahmWords} from '../lib/fahm/content';
import type {MushafWord} from '../lib/interactiveMushaf/model';
import {applicationQuestion} from './applicationQuestions';
import {ApplicationCheck} from './ApplicationCheck';
import {CoursePassages} from './CoursePassages';
import {GrammarExplorer} from './GrammarExplorer';
import {SentenceWorkshop} from './ArabicWorkshops';
import {GuidedExplanation} from './GuidedExplanation';
import {AdaptiveQuestion} from './AdaptiveQuestion';
import {SentenceBuilder} from './SentenceBuilder';
import {SarfLab} from './SarfLab';
import {ArabicReview} from './ArabicReview';
import {TransformationStudio,RepairStudio,ProgressiveStudio} from './ConstructionStudio';
import {SegmentStudio} from './SegmentStudio';
import {SurahJourney} from './SurahJourney';
import {ArabicAdventure} from './ArabicAdventure';
import {DuelStudio,InquiryStudio} from './ArabicChallenges';
import {WordCollection} from './WordCollection';
import {DailySession} from './DailySession';
import {AnalysisPractice,AnalysisWorkshop} from './AnalysisWorkshop';
import {ANALYSES} from './analysisData';
import {Diagnostic} from './Diagnostic';
import {ListeningPractice} from './ListeningPractice';
import {useArabicPracticeStore} from '../stores/arabicPracticeStore';
import {arabicReviewItems} from './reviewData';
import '../pages/FahmExperience.css';
import './ArabicLearning.css';
import './ArabicPlay.css';
export function ArabicPage(){
 const {lessonId}=useParams(),[params]=useSearchParams();
 const tool=params.get('atelier');const motion=useArabicAdventureStore(s=>s.motion);
 const studios:Record<string,React.ReactNode>={adventure:<ArabicAdventure/>,duels:<DuelStudio/>,inquiries:<InquiryStudio/>,collection:<WordCollection/>,transform:<TransformationStudio/>,repair:<RepairStudio/>,progressive:<ProgressiveStudio/>,segments:<SegmentStudio/>,surahs:<SurahJourney/>,daily:<DailySession/>};
 if(tool&&studios[tool])return <main className={`fahm-shell arabic-page ${motion?'':'arabic-no-motion'}`}><Link to="/academy/arabic">← Programme d’arabe</Link>{studios[tool]}</main>;
 if(['diagnostic','endings','analysis','listening'].includes(tool||''))return <main className="fahm-shell arabic-page"><Link to="/academy/arabic">← Programme d’arabe</Link>{tool==='diagnostic'?<Diagnostic/>:tool==='listening'?<ListeningPractice/>:<AnalysisPractice endings={tool==='endings'}/>}</main>;
 if(params.get('review')==='1')return <ArabicReview/>;
 if(lessonId){const lesson=lessonById(lessonId);return lesson?<ArabicCourse key={lessonId} lesson={lesson}/>:<main className="fahm-shell"><h1>Ce cours n’existe pas</h1><Link to="/academy/arabic">Voir le programme</Link></main>;}
 return <ArabicHub/>;
}
function ArabicHub(){
 const state=useArabicLearningStore(),checks=useFahmLearningStore(s=>s.checks),now=useHomeClock().getTime();
 const evidence=useArabicPracticeStore(s=>s.evidence);
 const completed=ARABIC_LESSONS.filter(l=>state.drafts[l.id]?.complete).length;
 const resume=lessonById(state.last||'')||ARABIC_LESSONS.find(l=>!state.drafts[l.id]?.complete)||ARABIC_LESSONS[0];
 const due=arabicReviewItems(checks,now);
 return <main className="fahm-shell arabic-page"><Link to="/academy">← Académie</Link><header className="fahm-hero arabic-hero"><span className="fahm-eyebrow">LA LANGUE DU CORAN</span><h1>Comprendre l’arabe</h1><p className="arabic-calligraphy" lang="ar" dir="rtl">النَّحْو وَالصَّرْف</p><p>Reconnaître les mots, comprendre leur construction et les retrouver dans vos lectures.</p><progress value={completed} max={ARABIC_LESSONS.length} aria-label="Leçons terminées"/><p>{completed} / {ARABIC_LESSONS.length} leçons terminées · deux niveaux pour progresser</p><Link className="fahm-primary" to={`/academy/arabic/${resume.id}`}>{state.last?'Reprendre':'Commencer'} : {resume.title} →</Link></header>
 <section className="arabic-adventure-entry"><span className="arabic-earned-symbol" aria-hidden="true">✦</span><div><span className="fahm-eyebrow">VOTRE PROCHAINE DÉCOUVERTE</span><h2>Ma première sourate comprise</h2><p>Des missions courtes pour écouter, enquêter et faire parler la grammaire.</p><Link className="fahm-primary" to="/academy/arabic?atelier=adventure">Entrer dans l’aventure →</Link></div></section>
 <section className="arabic-play-launchers">{[['duels','⚖️','Duel de phrases','Trouvez la différence.'],['inquiries','🔎','Enquêtes','Réunissez les indices.'],['collection','📓','Mon carnet vivant','Retrouvez vos découvertes.']].map(([id,icon,title,body])=><Link key={id} to={`/academy/arabic?atelier=${id}`}><span aria-hidden="true">{icon}</span><strong>{title}</strong><small>{body}</small></Link>)}</section>
 <section className="fahm-card arabic-daily-entry"><span className="fahm-eyebrow">5 · 10 · 20 MINUTES</span><h2>Un peu chaque jour, au bon endroit</h2><p>Vos rappels, un repère à comprendre et son application dans une sourate. La séance se reprend là où vous la laissez.</p><Link className="fahm-primary" to="/academy/arabic?atelier=daily">Ma séance du jour →</Link></section>
 <section className="fahm-card"><h2>Explorer et comprendre</h2><div className="arabic-tool-grid">{[['transform','Une phrase se transforme','Observer une construction, puis la reconstruire.'],['surahs','Comprendre ce que je récite','Al-Ikhlas, Al-Falaq et An-Nas : quinze étapes guidées.'],['segments','À l’intérieur d’un mot','Distinguer les segments et leur fonction.'],['repair','Trouver et réparer l’erreur','Corriger six phrases et expliquer pourquoi.'],['progressive','Comprendre avec moins d’aide','De l’assemblage à votre propre formulation.']].map(([id,title,body])=><Link key={id} to={`/academy/arabic?atelier=${id}`}><strong>{title} →</strong><span>{body}</span></Link>)}</div></section>
 <section className="fahm-card"><h2>Mes trois repères</h2><div className="arabic-skills">{Object.entries(SKILL_LABELS).map(([skill,label])=>{const qs=ARABIC_LESSONS.flatMap(l=>l.questions).filter(q=>q.skill===skill);const seen=qs.filter(q=>checks[grammarCheckId(q.id)]),retained=seen.filter(q=>checks[grammarCheckId(q.id)].retainedAt>0);return <div key={skill}><strong>{label}</strong><span>{seen.length} / {qs.length} questions rencontrées</span><small>{qs.filter(q=>evidence[q.id]?.transferAt).length} réussies sur un autre exemple</small><small>{retained.length} retrouvées sans aide à distance</small></div>;})}</div><details className="arabic-help"><summary>Comment fonctionne ma progression ?</summary><p>Les leçons terminées et les notions retenues sont suivies séparément. Une révision proposée au moins un jour plus tard permet de vérifier ce que vous retrouvez sans aide.</p></details>{due.length?<Link className="fahm-primary" to="/academy/arabic?review=1">{due.length} rappel{due.length>1?'s':''} à faire →</Link>:<small>Aucune révision arrivée à échéance.</small>}</section>
 <section className="fahm-card"><h2>Choisir mon entraînement</h2><div className="arabic-tool-grid">{[['diagnostic','Mon point de départ','Six questions pour choisir un premier cours.'],['endings','Pourquoi cette terminaison ?','Relier chaque marque à sa construction.'],['listening','Reconnaître à l’oreille','Écouter, comparer, puis découvrir le texte.'],['analysis','À moi d’expliquer','Construire une analyse et la justifier.']].map(([id,title,body])=><Link key={id} to={`/academy/arabic?atelier=${id}`}><strong>{title} →</strong><span>{body}</span></Link>)}</div></section>
 {[1,2].map(level=><section key={level}><div className="fahm-section-heading"><h2>{level===1?'Niveau 1 · Les fondations':'Niveau 2 · Construire et analyser'}</h2><span>{ARABIC_LESSONS.filter(l=>(l.level||1)===level).length} leçons</span></div>{(['Fondations','Naḥw','Ṣarf'] as const).map(track=>{const lessons=ARABIC_LESSONS.filter(l=>(l.level||1)===level&&l.track===track);return lessons.length>0&&<div key={track}><h3>{track}</h3><div className="arabic-curriculum">{lessons.map(l=><Link className="arabic-course-card" to={`/academy/arabic/${l.id}`} key={l.id}><span lang="ar" dir="rtl">{l.arabic}</span><h3>{l.title}</h3><p>{l.goal}</p><small>{state.drafts[l.id]?.complete?'✓ Leçon terminée':state.drafts[l.id]?'Reprendre la leçon':'Explication · manipulation · application'} →</small></Link>)}</div></div>;})}</section>)}
 <section className="fahm-card"><h2>Retrouver ces notions dans Fahm</h2><p>L’analyse interactive accompagne pour le moment sept versets d’Al-Fatiha et d’Al-Ikhlas. Elle utilise les mots du lecteur et propose les cours correspondants.</p><div className="arabic-actions"><Link to="/fahm/surah/1">Explorer Al-Fatiha →</Link><Link to="/fahm/surah/112">Explorer Al-Ikhlas →</Link></div></section><details className="fahm-card"><summary>Les ressources du parcours</summary><p>Les explications françaises et les exercices sont rédigés pour Quran Coach. Les notions et analyses s’appuient sur les références grammaticales du Quranic Arabic Corpus. Les textes coraniques viennent du lecteur existant.</p><a href="https://corpus.quran.com/documentation/grammar.jsp" target="_blank" rel="noreferrer">Documentation grammaticale ↗</a></details></main>;
}
function ArabicCourse({lesson}:{lesson:ArabicLesson}){
 const state=useArabicLearningStore(),learning=useFahmLearningStore();
 const [params,setParams]=useSearchParams();
 const revisiting=params.get("view")==="read";
 const draft=state.drafts[lesson.id],stage=draft?.stage||0;
 useEffect(()=>{const s=useArabicLearningStore.getState();s.move(lesson.id,s.drafts[lesson.id]?.stage||0);},[lesson.id]);
 const [words,setWords]=useState<MushafWord[]>([]),[failed,setFailed]=useState(false),[retry,setRetry]=useState(0);
 useEffect(()=>{if(lesson.level===2)return;let disposed=false;void loadFahmVerse(lesson.target).then(fahmWords).then(w=>{if(!disposed)setWords(w);}).catch(()=>{if(!disposed)setFailed(true);});return()=>{disposed=true;};},[lesson,retry]);
 const applied=!!draft?.application&&(lesson.level===2||draft.complete||draft.applicationAnswer===applicationQuestion(lesson.id)?.answer);
 const allCorrect=lesson.questions.every(q=>draft?.answers[q.id]===q.answer);
 const application=ANALYSES.find(t=>t.lesson===lesson.id);
 const next=ARABIC_LESSONS[ARABIC_LESSONS.indexOf(lesson)+1];
 return <main className="fahm-shell arabic-page"><Link to="/academy/arabic">← Programme d’arabe</Link><header className="arabic-course-heading"><span className="fahm-eyebrow">{lesson.track} · LEÇON {ARABIC_LESSONS.indexOf(lesson)+1}</span><h1>{lesson.title}</h1><p>{lesson.goal}</p><label className="arabic-detail-toggle"><input type="checkbox" checked={state.detailed} onChange={e=>state.setDetailed(e.target.checked)}/> Termes et analyse détaillée</label></header>
 {lesson.prerequisites&&<details className="fahm-card"><summary>Les repères utiles avant ce cours</summary><div className="arabic-actions">{lesson.prerequisites.map(id=><Link key={id} to={`/academy/arabic/${id}?view=read`} onClick={()=>state.move(id,0)}>{lessonById(id)?.title} {state.drafts[id]?.complete?'✓':''}</Link>)}</div><p>Vous pouvez poursuivre ce cours ou reprendre un repère à tout moment.</p></details>}
 {draft?.complete&&!revisiting?<section className="fahm-card"><h2>Vous avez terminé cette leçon</h2><p>{lesson.takeaway}</p><p>Les révisions vérifieront ce que vous retrouvez plus tard sans aide.</p><div className="arabic-actions">{next?<Link className="fahm-primary" to={`/academy/arabic/${next.id}`}>Continuer : {next.title} →</Link>:<Link className="fahm-primary" to="/academy/arabic">Voir ma progression</Link>}<button onClick={()=>{state.move(lesson.id,0);setParams({view:"read"});}}>Relire sans perdre ma progression</button><button onClick={()=>{state.restart(lesson.id);state.move(lesson.id,1);setParams({view:"read"});}}>Refaire les exercices</button></div></section>:<>
 {revisiting&&draft?.complete&&<p className="arabic-muted">Votre validation reste acquise. <button onClick={()=>setParams({})}>Retour au bilan</button></p>}
 <nav className="arabic-steps" aria-label="Étapes du cours">{['Comprendre','Manipuler','Appliquer'].map((label,i)=><button key={label} aria-current={stage===i?'step':undefined} onClick={()=>state.move(lesson.id,i)}>{i+1}. {label}</button>)}</nav>
 {stage===0&&<article className="fahm-card arabic-prose"><GuidedExplanation lessonId={lesson.id}/><h2>Le cours en détail</h2><p className="arabic-calligraphy" dir="rtl" lang="ar">{lesson.arabic}</p>{lesson.paragraphs.map(p=><p key={p}>{p}</p>)}{state.detailed&&<aside><h3>Le vocabulaire de l’analyse</h3><p>{lesson.advanced}</p></aside>}<blockquote>{lesson.takeaway}</blockquote><a href={lesson.source} target="_blank" rel="noreferrer">Référence grammaticale ↗</a><button className="fahm-primary" onClick={()=>state.move(lesson.id,1)}>Manipuler un exemple →</button></article>}
 {stage===1&&<><SentenceWorkshop lesson={lesson} detailed={state.detailed}/><SentenceBuilder lessonId={lesson.id}/>{lesson.track==='Ṣarf'&&<SarfLab/>}<button className="fahm-primary" onClick={()=>state.move(lesson.id,2)}>M’exercer et appliquer →</button></>}
 {stage===2&&<><section className="fahm-card"><h2>À vous de retrouver</h2>{lesson.questions.map(q=><AdaptiveQuestion key={q.id} question={q} choice={draft?.answers[q.id]} remedyChoice={draft?.remedies?.[q.id]===-1?undefined:draft?.remedies?.[q.id]} onRemedy={value=>state.remedy(lesson.id,q.id,value)} onAnswer={value=>{state.answer(lesson.id,q.id,value);learning.check(grammarCheckId(q.id),lesson.target,value===q.answer,true);}}/>)}</section>
 {lesson.level===2&&application?<AnalysisWorkshop task={application} endings onSuccess={()=>state.apply(lesson.id)}/>:<section className="fahm-card"><span className="fahm-eyebrow">APPLICATION · CORAN {lesson.target.surah}:{lesson.target.ayah}</span><h2>Retrouver la notion dans le verset</h2><p>Ouvrez l’analyse et touchez un mot pour observer sa construction.</p>{!words.length&&(failed?<p role="alert">Le passage n’a pas pu être chargé. <button onClick={()=>{setFailed(false);setRetry(n=>n+1);}}>Réessayer</button></p>:<p role="status">Chargement du mot à mot…</p>)}{words.length>0&&<GrammarExplorer verseKey={`${lesson.target.surah}:${lesson.target.ayah}`} words={words}/>}<Link to={`/fahm?surah=${lesson.target.surah}&ayah=${lesson.target.ayah}`}>Lire et écouter tout le passage dans Fahm →</Link></section>}
 <ApplicationCheck key={lesson.id} lessonId={lesson.id}/><button className="fahm-primary" disabled={!allCorrect||!applied} onClick={()=>{state.finish(lesson.id);setParams({});}}>Terminer cette leçon ✓</button>{(!allCorrect||!applied)&&<p className="arabic-muted">Répondez aux questions et réussissez l’exercice d’application pour terminer.</p>}</>}
 </>}
 <CoursePassages lessonId={lesson.id}/>
 </main>;
}
