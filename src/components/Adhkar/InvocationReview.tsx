import {useAdhkarExperienceStore} from '../../stores/adhkarExperienceStore';
export function InvocationReview({invocationKey}:{invocationKey:string}){
 const store=useAdhkarExperienceStore(),review=store.reviews[invocationKey];
 return <details className="inv-details"><summary>🧠 Entretenir ma mémoire</summary><div className="inv-details-body"><p>Après avoir récité, choisissez votre ressenti pour préparer la prochaine révision.</p><div className="inv-review-ratings">{([['again','À retravailler'],['hesitant','Avec hésitation'],['easy','Facile']] as const).map(([rating,label])=><button key={rating} onClick={()=>store.rateRecall(invocationKey,rating)}>{label}</button>)}</div>{review&&<><p role="status">Prochaine révision : {new Date(review.due).toLocaleDateString('fr-FR')}. Votre compteur de récitations reste inchangé.</p><button onClick={()=>store.postponeRecall(invocationKey)}>Reporter à demain</button></>}</div></details>;
}
