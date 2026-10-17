import { Link } from 'react-router-dom';
import { NEEDS, type Need } from '../../lib/companion';
import { useCompanionStore } from '../../stores/companionStore';
const steps=['Lire','Comprendre','Invoquer','Agir'];
export function NeedJourney(){
    const c=useCompanionStore(),journey=c.journey;
    const selected=journey?NEEDS[journey.need]:null;
    return <section className="companion-section"><h2>Ce dont j’ai besoin aujourd’hui</h2><p className="companion-muted">Choisissez vous-même votre intention. Vous pouvez changer à tout moment.</p><div className="companion-needs">{(Object.keys(NEEDS) as Need[]).map(key=><button key={key} aria-pressed={journey?.need===key} onClick={()=>c.startJourney(key)}><span aria-hidden="true">{NEEDS[key].emoji}</span>{NEEDS[key].label}</button>)}</div>
        {journey && selected && <div className="companion-journey"><div className="companion-steps" aria-label="Étapes du parcours">{steps.map((s,i)=><span key={s} aria-current={journey.step===i?'step':undefined}>{journey.step>i?'✓':i+1} {s}</span>)}</div>
            {journey.step<4?<><h3>{steps[journey.step]} · {selected.label}</h3><p>{journey.step===1?selected.reflection:journey.step===3?selected.task:journey.step===0?'Lisez le passage et sa traduction à votre rythme.':'Retrouvez cette invocation coranique et son sens.'}</p>
                {journey.step<3 && <Link className="companion-primary" to={`/passage?surah=${(journey.step===2?selected.dua:selected.verse)[0]}&ayah=${(journey.step===2?selected.dua:selected.verse)[1]}`}>{journey.step===1?'Ouvrir le passage et son explication':journey.step===2?'Lire l’invocation':'Lire le verset'} →</Link>}
                <button className="companion-secondary" onClick={c.advance}>{['J’ai lu · continuer','J’ai pris ce temps · continuer','J’ai invoqué · continuer','Terminer mon parcours'][journey.step]}</button></>:<><h3>Votre parcours est terminé 🌿</h3><p>Vous avez pris ce temps selon votre intention. Retrouvez vos autres moments quand vous le souhaitez.</p><button onClick={()=>c.startJourney(journey.need)}>Recommencer ce parcours</button></>}
        </div>}
    </section>;
}
