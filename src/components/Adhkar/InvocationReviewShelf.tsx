export function InvocationReviewShelf({due,onStart}:{due:string[];onStart:()=>void}){
 return <section className="inv-review-summary"><h2>🧠 Mes révisions</h2><p>{due.length?`${due.length} invocation(s) à revoir, en commençant par les plus difficiles.`:'Aucune révision à faire aujourd’hui. Après avoir appris une invocation, indiquez votre ressenti pour préparer la suite.'}</p>{due.length>0&&<button className="inv-primary" onClick={onStart}>Réviser {Math.min(5,due.length)} invocation(s)</button>}</section>;
}
