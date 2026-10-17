import {useState} from 'react';
import {categoryById,type Invocation} from '../../lib/adhkarExperience';
import {timedInvocationSelection} from '../../lib/invocationLearning';
import {useAdhkarExperienceStore} from '../../stores/adhkarExperienceStore';

export function InvocationQuickSession({period,favorites,onOpen}:{period:string;favorites:Invocation[];onOpen:(session:string)=>void}) {
    const [minutes,setMinutes]=useState(5),[category,setCategory]=useState(period);
    const preferences=useAdhkarExperienceStore(s=>s.preferences);
    const pool=category==='favorites'?favorites:categoryById.get(category)?.items||[];
    const selection=timedInvocationSelection(pool,minutes,{arabic:preferences.arabicAudio,french:preferences.frenchAudio,silence:preferences.repeatSilence,gapMode:preferences.gapMode,gap:preferences.gap,repeats:preferences.repeats,rate:preferences.rate});
    const prepare=()=>{
        const id=`timed:${Date.now()}`;
        useAdhkarExperienceStore.getState().setTimedSession({id,keys:selection.items.map(d=>d.key),minutes,seconds:selection.seconds});
        useAdhkarExperienceStore.getState().configure({mode:'recite',continuous:true});
        onOpen(id);
    };
    return <section className="inv-quick-session">
        <div className="inv-section-heading"><h2>Un moment pour moi</h2><span>⏳</span></div>
        <div className="inv-duration-options" aria-label="Temps disponible">{[2,5,10].map(value=><button key={value} aria-pressed={minutes===value} onClick={()=>setMinutes(value)}>J’ai {value} min</button>)}</div>
        <label>Mon envie <select aria-label="Thème de ma séance" value={category} onChange={e=>setCategory(e.target.value)}><option value="morning">Invocations du matin</option><option value="evening">Invocations du soir</option><option value="hisn_chap_25">Après la prière</option><option value="hisn_chap_28">Avant de dormir</option><option value="favorites">Mes favoris</option></select></label>
        <p>{selection.items.length?`${selection.items.length} invocations entières · environ ${Math.floor(selection.seconds/60)} min ${selection.seconds%60} s`:'Aucune invocation ne correspond à cette durée avec vos réglages. Essayez une durée plus longue ou un autre thème.'}</p>
        <button className="inv-primary" disabled={!selection.items.length} onClick={prepare}>Préparer ma séance</button>
        <small>Une sélection à écouter, avec vos réglages audio. Le recueil complet et ses nombres de répétitions restent accessibles.</small>
    </section>;
}
