import {useMemo,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useSmartCoaching} from '../../../hooks/useSmartCoaching';
import {useReaderCoachStore,type ReaderCoachTask} from '../../../stores/readerCoachStore';
import {useInvisibleCoachStore} from '../../../stores/invisibleCoachStore';
import {useCompanionStore} from '../../../stores/companionStore';
import {pageLessons,PAGE_LESSON_TAGS} from '../../../lib/interactiveMushaf/pageLessons';
import {CHAPTERS,type InteractivePage,type MushafWord} from '../../../lib/interactiveMushaf/model';
export function MushafCoachContent({data,surah,ayah,onTask,onWord,onExercise,onClose}:{
    data:InteractivePage|null;surah:number;ayah:number;
    onTask:(task:ReaderCoachTask,surah:number,ayah:number)=>void;
    onWord:(word:MushafWord)=>void;onExercise:(rule:string)=>void;onClose:()=>void;
}) {
    const navigate=useNavigate();
    const inbox=useReaderCoachStore();
    const coach=useInvisibleCoachStore();
    const {cards}=useSmartCoaching();
    const lessons=useMemo(()=>pageLessons(data?.words||[]),[data]);
    const [selected,setSelected]=useState<string|null>(null);
    const lesson=lessons.find(l=>l.id===selected);
    const dismiss=(id:string)=>{inbox.remove(id);useCompanionStore.getState().complete(id);};
    const name=(s:number,a:number)=>`${CHAPTERS[s-1]?.latin||s} · ${s}:${a}`;
    return <div className="iq-coach-content">
        <p>Un accompagnement à votre rythme. Les suggestions restent ici pendant votre lecture.</p>
        {data&&<section><h3>Votre passage · {name(surah,ayah)}</h3><div className="iq-detail-actions">
            <button onClick={()=>onTask('practice',surah,ayah)}>Me tester sur ce verset</button>
            <button onClick={()=>onTask('repeat',surah,ayah)}>Répéter ce verset</button>
            <button onClick={()=>onTask('understand',surah,ayah)}>Comprendre ce verset</button>
            <button onClick={()=>{onClose();navigate('/sentinel');}}>Personnaliser mon coach</button>
        </div></section>}
        {!coach.enabled&&<p>Les suggestions automatiques sont désactivées. Les exercices restent disponibles.</p>}
        {coach.enabled&&cards.filter(c=>c.origin==='coach'&&c.topic==='review').slice(0,1).map(card=>{
            const params=new URLSearchParams(card.route.split('?')[1]);const s=Number(params.get('surah')),a=Number(params.get('ayah'));
            return <section className="iq-coach-suggestion" key={card.id}><h3>{card.title}</h3><p>{name(s,a)}</p><p>{card.reason}</p><div className="iq-detail-actions"><button onClick={()=>onTask('practice',s,a)}>Réviser dans le Mushaf</button><button onClick={()=>useCompanionStore.getState().snooze(card.id)}>Plus tard</button></div></section>;
        })}
        {coach.enabled&&inbox.suggestions.map(item=><section className="iq-coach-suggestion" key={item.id}>
            <h3>{item.emoji} {item.title}</h3><small>{name(item.surah,item.ayah)} · page {item.page}</small><p>{item.message}</p>{item.source&&<small>{item.source}</small>}
            <div className="iq-detail-actions">{item.action&&<button onClick={()=>{
                coach.recordAction(item.id);dismiss(item.id);
                if(item.trigger==='page_reread')onTask('practice',item.surah,item.ayah);
                else if(['verse_emotion','fahm_push'].includes(item.trigger))onTask('understand',item.surah,item.ayah);
                else {onClose();navigate(item.action!.route);}
            }}>{item.trigger==='page_reread'?'Travailler ce passage':item.action.label}</button>}<button onClick={()=>{coach.recordDismiss(item.id);dismiss(item.id);}}>Retirer ce conseil</button></div>
        </section>)}
        <section className="iq-coach-lessons"><h3>Tajwid sur cette page</h3>
            {!data?<p>Les leçons seront disponibles après le chargement de la page.</p>:!lessons.length?<p>Aucune mini-leçon n’est disponible à partir des balises de cette page.</p>:<>
                <div className="iq-lesson-choices">{lessons.map(l=><button key={l.id} aria-pressed={selected===l.id} onClick={()=>setSelected(l.id)}>{l.name}<small>{l.examples.length} exemple{l.examples.length>1?'s':''}</small></button>)}</div>
                {lesson&&<section className="iq-lesson-detail" aria-label={`Leçon ${lesson.name}`}><h3>{lesson.name}</h3><p>{lesson.description}</p><p>{lesson.howTo}</p>
                    {lesson.examples.slice(0,3).map(word=><div key={word.key} className="iq-lesson-example"><p dir="rtl" lang="ar">{word.tajweedSegments.map((segment,i)=><span key={i} className={segment.rule&&PAGE_LESSON_TAGS[segment.rule]===lesson.id?'iq-lesson-segment':''}>{segment.text}</span>)}</p><small>{name(...word.verseKey.split(':').map(Number) as [number,number])} · mot {word.position}</small><div className="iq-detail-actions"><button onClick={()=>onWord(word)}>Voir et écouter le mot</button><button onClick={()=>onTask('repeat',...word.verseKey.split(':').map(Number) as [number,number])}>Écouter dans le verset</button></div></div>)}
                    <button className="iq-primary" onClick={()=>onExercise(lesson.id)}>M’entraîner au repérage</button>
                    <small>Repérage des segments : balises Tajwid Quran.com. Explication : leçons de l’Académie Quran Coach. Cet exercice porte sur le repérage, sans évaluation de votre prononciation.</small>
                </section>}
            </>}
        </section>
    </div>;
}
