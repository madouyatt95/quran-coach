import {FAHM_MEANING} from '../../lib/fahm/meaning';
import {useEffect} from 'react';
import type {MushafWord} from '../../lib/interactiveMushaf/model';
import {useFahmLearningStore} from '../../stores/fahmLearningStore';
import {verseKey,type VerseTarget} from '../../lib/fahm/learning';
/** Exercises use the exact supplied French text and structured word positions. */
export function FahmExercises({target,translation,words,explanation,onComplete,exerciseId}:{exerciseId:string;target:VerseTarget;translation:string;words:MushafWord[];explanation:string;onComplete:()=>void}) {
    const learning=useFahmLearningStore();
    const saved=learning.records[verseKey(target)];
    const meaning=FAHM_MEANING[verseKey(target)];
    const saveDraft=learning.draft;
    const draft=learning.drafts[exerciseId];
    const meaningChoice=draft?.meaningChoice??null,stage=draft?.stage??0,choice=draft?.choice??null,compared=draft?.compared??false;
    const update=(patch:Parameters<typeof learning.draft>[1])=>learning.draft(exerciseId,patch);
    const setStage=(stage:number)=>update({stage});
    const usable=words.filter(w=>w.french && w.french.length>1);
    const targetWord=usable.find(w=>!learning.words[w.key]?.correct)||usable.find(w=>w.position>1)||usable[0];
    // Freeze the exercise: answering must not change its target when the store updates.
    const questionWord=usable.find(w=>w.key===draft?.wordKey)||targetWord;
    useEffect(()=>{if(!draft?.wordKey&&targetWord)saveDraft(exerciseId,{wordKey:targetWord.key});},[draft?.wordKey,exerciseId,targetWord,saveDraft]);
    const options=questionWord?[...new Set([questionWord.french!,...usable.filter(w=>w.french!==questionWord.french).map(w=>w.french!)])].slice(0,3).sort((a,b)=>a.localeCompare(b)):[];
    const canQuiz=options.length>=2;
    const evidence=draft?.evidence||'';
    const setEvidence=(evidence:string)=>update({evidence});
    const note=saved?.note||'';
    if(draft?.completed)return <section className="fahm-card"><h2>Exercice enregistré</h2><p>Votre formulation et vos réponses sont conservées.</p><button onClick={onComplete}>Continuer le parcours →</button><button onClick={()=>learning.resetExercise(exerciseId)}>Refaire l’exercice</button></section>;
    return <section className="fahm-card fahm-exercises" aria-label="Vérifier ma compréhension">
        <small>Une correction immédiate reste un entraînement. Le rappel sans aide se vérifie lors d’une prochaine séance.</small><span className="fahm-eyebrow">À VOUS · {stage+1} / 3</span><h2>Comprendre et retenir</h2>
        {stage===0&&<><h3>Retrouver le sens</h3>{canQuiz?<><p>Dans ce verset, quel sens accompagne <b lang="ar" dir="rtl">{questionWord.text}</b> ?</p><div className="fahm-choices">{options.map(option=><button key={option} disabled={choice===questionWord.french} aria-pressed={choice===option} onClick={()=>{update({choice:option});learning.check(`word:${questionWord.key}`,target,option===questionWord.french,true);learning.answer(target,option===questionWord.french);learning.wordAnswer(questionWord.key,questionWord.text,option===questionWord.french);}}>{option}</button>)}</div>{choice&&<p role="status">{choice===questionWord.french?'Oui. Relisez maintenant le mot dans la phrase.':`À revoir : dans le français mot à mot, ce mot est associé à « ${questionWord.french} ». Écoutez-le puis replacez-le dans la traduction complète.`}</p>}<button className="fahm-primary" disabled={choice!==questionWord.french} onClick={()=>setStage(1)}>Retrouver une preuve dans le texte →</button></>:<><p>Lisez la traduction puis repérez une expression que vous comprenez mieux. Vous allez la citer à l’étape suivante.</p><blockquote>{translation}</blockquote><button onClick={()=>setStage(1)}>Choisir mon expression →</button></>}</>}
        {stage===1&&<><h3>Appuyer sa réponse sur le texte</h3>{meaning&&<><p>{meaning.question}</p><div className="fahm-choices">{meaning.options.map((option,i)=><button key={option} disabled={meaningChoice===meaning.answer} aria-pressed={meaningChoice===i} onClick={()=>{update({meaningChoice:i});learning.check(`meaning:${verseKey(target)}`,target,i===meaning.answer,true);learning.answer(target,i===meaning.answer);}}>{option}</button>)}</div>{meaningChoice!==null&&<p role="status">{meaningChoice===meaning.answer?'Oui. ':'À revoir. '}{meaning.explanation}</p>}</>}<p>Choisissez les mots de la traduction qui vous semblent essentiels. Ils resteront liés au verset {verseKey(target)}.</p><div className="fahm-excerpt">{translation.split(/(?<=[,;.!?])\s+/).filter(Boolean).map((part,i)=><button key={i} aria-pressed={evidence===part} onClick={()=>setEvidence(part)}>{part}</button>)}</div><p>Pourquoi avez-vous choisi cette expression ? Expliquez son lien avec le reste du verset.</p><label>Mon explication<textarea value={note} maxLength={3000} onChange={e=>learning.note(target,e.target.value)} /></label><button className="fahm-primary" disabled={!evidence||note.trim().length<15||!!meaning&&meaningChoice!==meaning.answer} onClick={()=>setStage(2)}>Comparer avec l’explication →</button></>}
        {stage===2&&<><h3>Comparer et préciser</h3><blockquote>{evidence}</blockquote><p>{note}</p><details onToggle={e=>{if(e.currentTarget.open)update({compared:true});}}><summary>Relire l’explication du passage</summary><p>{explanation||translation}</p><small>{explanation?'Al-Mokhtasar · QuranEnc':'Traduction · Muhammad Hamidullah'}</small></details><p>Vérifiez votre formulation : le sujet est-il le même ? Avez-vous conservé les précisions du texte ? Corrigez votre note si nécessaire.</p><label>Ma formulation finale<textarea value={note} maxLength={3000} onChange={e=>learning.note(target,e.target.value)} /></label><small>Votre formulation est une autoévaluation ; elle n’est pas notée automatiquement.</small><button className="fahm-primary" disabled={!compared||note.trim().length<15} onClick={()=>{learning.note(target,note,true);update({completed:true});onComplete();}}>J’ai comparé et terminé cet exercice ✓</button></>}
    </section>;
}
