import {useState} from 'react';
import {Link} from 'react-router-dom';
import {Pupitre,PupitreTop,PupitreBottom} from '../components/Pupitre/Pupitre';
import {usePracticeState} from '../stores/arabicPracticeStore';
import {TRANSFORMATIONS,TRANSFORM_MODES,type TransformMode} from './studioData';
import {SarfLab} from './SarfLab';
import './ArabicLaboratory.css';
export function ArabicLaboratory(){
 const [track,setTrack]=usePracticeState<'nahw'|'sarf'>('laboratory:track','nahw');
 return <><header className="arabic-laboratory-heading"><span className="fahm-eyebrow">TOUCHER · TRANSFORMER · COMPRENDRE</span><h1>Le laboratoire d’arabe</h1><p>Vos manipulations changent la construction et révèlent son sens. Les exemples sont pédagogiques, hors versets.</p><div className="arabic-options" aria-label="Science étudiée"><button aria-pressed={track==='nahw'} onClick={()=>setTrack('nahw')}>Naḥw · Construire une phrase</button><button aria-pressed={track==='sarf'} onClick={()=>setTrack('sarf')}>Ṣarf · Fabriquer un mot</button></div></header>{track==='nahw'?<NahwLaboratory/>:<SarfLab/>}</>;
}
interface Draft {task:string;mode:TransformMode;selected:number;answers:string[];challenge:boolean}
const initial:Draft={task:'house',mode:'base',selected:0,answers:[],challenge:false};
export function NahwLaboratory(){
 const [draft,setDraft]=usePracticeState<Draft>('laboratory:nahw',initial),[previous,setPrevious]=useState<Draft|null>(null);
 const task=TRANSFORMATIONS.find(t=>t.id===draft.task)||TRANSFORMATIONS[0],form=task.forms[draft.mode]||task.forms.base;
 const words=draft.challenge&&draft.answers.length===form.words.length?draft.answers:form.words;
 const correct=words.every((w,i)=>w===form.words[i]),selected=Math.min(draft.selected,words.length-1);
 const update=(next:Draft)=>{setPrevious(draft);setDraft(next);};
 const transform=(mode:TransformMode)=>{const target=task.forms[mode];update({...draft,mode,selected:mode==='base'?0:1,answers:draft.challenge&&mode!=='base'?[target.words[0],...task.forms.base.words]:target.words});};
 const course=draft.mode==='base'?'nominal':draft.mode==='preposition'?'prepositions':draft.mode;
 return <Pupitre activity="arabic" title="Atelier de Naḥw" documentKey="nahw-laboratory" className="arabic-laboratory"><PupitreTop aria-label="Phrase et résultat"><div className="arabic-lab-result"><span className="fahm-eyebrow">{draft.challenge?'À VOUS DE CONSTRUIRE':'TRANSFORMATION EN DIRECT'}</span><div className="arabic-lab-words" dir="rtl" lang="ar">{words.map((w,i)=><button key={i} aria-pressed={selected===i} className={form.changed.includes(i)?'is-changed':''} onClick={()=>setDraft({...draft,selected:i})}>{w}</button>)}</div><p aria-live="polite">{correct?form.meaning:'Ajustez les terminaisons pour retrouver la construction.'}</p><div className="arabic-lab-explanation" role="status"><strong>{correct?'Pourquoi cette forme ?':'Une terminaison reste à ajuster'}</strong><p>{form.reason}</p></div>{draft.mode!=='base'&&<div className="arabic-lab-before"><small>Avant la transformation</small><span dir="rtl" lang="ar">{task.forms.base.words.join(' ')}</span><small>{task.forms.base.meaning}</small></div>}</div></PupitreTop>
 <PupitreBottom aria-label="Manipuler la phrase"><fieldset><legend>1 · Choisir une phrase</legend><div className="arabic-options">{TRANSFORMATIONS.map(t=><button key={t.id} aria-pressed={task.id===t.id} onClick={()=>update({...initial,task:t.id,challenge:draft.challenge})}>{t.label}</button>)}</div></fieldset><fieldset><legend>2 · Appliquer une construction</legend><div className="arabic-options">{(Object.keys(TRANSFORM_MODES) as TransformMode[]).map(mode=><button key={mode} aria-pressed={draft.mode===mode} onClick={()=>transform(mode)}>{TRANSFORM_MODES[mode]}</button>)}</div></fieldset>
 <label className="arabic-lab-challenge"><input type="checkbox" checked={draft.challenge} onChange={e=>update({...draft,challenge:e.target.checked,answers:form.words})}/> Je choisis moi-même les terminaisons</label>
 <fieldset><legend>3 · Examiner le mot sélectionné</legend><div className="arabic-options" dir="rtl" lang="ar">{form.choices[selected].map(w=><button key={w} aria-pressed={words[selected]===w} onClick={()=>update({...draft,challenge:true,answers:words.map((old,i)=>i===selected?w:old)})}>{w}</button>)}</div><p className="arabic-muted">Touchez un mot en haut pour examiner ses formes. La couleur dorée indique les positions transformées dans l’exemple correct.</p></fieldset>
 <div className="arabic-actions"><button disabled={!previous} onClick={()=>{if(previous){setDraft(previous);setPrevious(null);}}}>Annuler ma dernière action</button><button onClick={()=>update(initial)}>Recommencer</button><Link to={`/academy/arabic/${course}?view=read`}>Comprendre la règle →</Link></div>
 </PupitreBottom></Pupitre>;
}
