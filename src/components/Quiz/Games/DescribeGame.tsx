import {Pupitre,PupitreTop,PupitreBottom} from '../../Pupitre/Pupitre';
import {useEffect} from 'react';
import {DESCRIBE_CARDS,wordById} from '../../../data/quizGames';
import type {DescribeGame as Game,GameAction} from '../../../lib/quizGames';
import {WordReward} from './WordReward';
export function DescribeBoard({game:g,act}:{game:Game;act:(a:GameAction)=>void}){
 useEffect(()=>{
  if(g.phase!=='active'||g.finished)return;
  const pause=()=>act({type:'pause',now:Date.now()});
  const hidden=()=>{if(document.hidden)pause();};
  const timer=g.remaining===null?undefined:window.setInterval(()=>act({type:'tick',now:Date.now()}),1000);
  document.addEventListener('visibilitychange',hidden);window.addEventListener('pagehide',pause);
  return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',hidden);window.removeEventListener('pagehide',pause);};
 },[g.phase,g.finished,g.remaining===null,act]);
 const card=DESCRIBE_CARDS[g.deck[g.index]];
 if(g.finished)return <><h2>{g.results.filter(r=>r.found).length} / {g.deck.length} mots trouvés ensemble</h2><p>Le groupe valide les réponses. Aucun micro ni reconnaissance vocale n’est nécessaire.</p><ul className="qg-results">{g.results.map((r,i)=><li key={i}><strong>{r.found?'✓':'↻'} {DESCRIBE_CARDS[r.card].answer}</strong><span>{r.reason}</span><small>{wordById(DESCRIBE_CARDS[r.card].word).meaningFr}</small></li>)}</ul></>;
 if(g.phase==='handoff')return <section className="qg-handoff"><span aria-hidden="true">🤫</span><h2>Au tour de la personne qui fait deviner</h2><p>Carte {g.index+1}/{g.deck.length}. Les autres regardent ailleurs. Décris le mot sans le dire, sans le traduire et sans utiliser les trois mots interdits ou leurs dérivés.</p><p>Jouez à deux ou en groupe. Changez de personne après chaque carte.</p><button className="qx-primary" onClick={()=>act({type:'ready',now:Date.now()})}>Je suis prêt · révéler ma carte</button>{g.message&&<p role="status">{g.message}</p>}</section>;
 return <Pupitre title="Faire deviner"><PupitreTop aria-label="Carte et chronomètre"><div className="qg-counters"><span>Carte {g.index+1}/{g.deck.length}</span><span>{g.remaining===null?'Sans chrono':`${Math.ceil(g.remaining/1000)} s`}</span></div><div className="pupitre-only">{g.phase==='active'&&<><h2>{card.answer}</h2><p>Mots interdits : {card.forbidden.join(' · ')}</p></>}</div></PupitreTop><PupitreBottom aria-label="Commandes de la partie">{g.phase==='active'?<><section className="qg-describe-card pupitre-classic-only"><small>LE MOT À FAIRE DEVINER</small><h2>{card.answer}</h2><p>Ces trois mots sont interdits :</p><ul>{card.forbidden.map(word=><li key={word}>{word}</li>)}</ul></section><div className="qg-actions"><button onClick={()=>act({type:'pause',now:Date.now()})}>Masquer · Pause</button><button onClick={()=>act({type:'describe-result',now:Date.now(),found:false,reason:'Carte passée'})}>Passer</button><button onClick={()=>act({type:'describe-result',now:Date.now(),found:false,reason:'Un mot interdit a été utilisé'})}>Mot interdit utilisé</button></div><button className="qx-primary" onClick={()=>act({type:'describe-result',now:Date.now(),found:true,reason:'Validé ensemble'})}>Le groupe a trouvé ✓</button></>:<><h2>{g.found?'Trouvé ensemble !':'Découvrons ce mot'}</h2><p role="status">{g.message}</p><WordReward key={card.word} id={card.word}/><button className="qx-primary" onClick={()=>act({type:'next'})}>{g.index+1===g.deck.length?'Voir le bilan':'Passer le téléphone →'}</button></>}</PupitreBottom></Pupitre>;
}
