import {Pupitre,PupitreTop,PupitreBottom} from '../../Pupitre/Pupitre';
import {useState} from 'react';
import {CHAPTERS} from '../../../lib/interactiveMushaf/model';
import {mysteryBank,mysteryAudioUrl,mysteryMaxLevel,type MysteryGame,type GameAction} from '../../../lib/quizGames';
import {AudioPlayer} from '../AudioPlayer';
import {AudioDiscovery} from '../AudioDiscovery';
import {legacyLearningQuestion} from '../../../lib/quizLearning';
export function ListeningGame({game:g,act}:{game:MysteryGame;act:(a:GameAction)=>void}){
 const [search,setSearch]=useState('');const q=mysteryBank()[g.rounds[g.index]],done=g.solved||g.revealed;
 const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]/g,'');
 const candidates=g.advanced?CHAPTERS.map((c,i)=>({id:i+1,title:c.latin})).filter(c=>!search||normalize(c.title).includes(normalize(search))||String(c.id)===search):g.choices[g.index].map(id=>({id,title:CHAPTERS[id-1].latin}));
 if(g.finished)return <><h2>{g.results.filter(r=>r.correct).length} / {g.rounds.length} sourates reconnues</h2><ul className="qg-results">{g.results.map((r,i)=><li key={i}><strong>{r.correct?'✓':'↻'} {CHAPTERS[r.surah-1].latin}</strong><span>{r.attempts} essai{r.attempts>1?'s':''} · {r.hints} indice{r.hints>1?'s':''}</span></li>)}</ul><p>Retrouver une sourate à l’oreille est un jeu de reconnaissance, sans évaluer la qualité de ta récitation.</p></>;
 return <Pupitre title="Reconnaître une sourate"><PupitreTop aria-label="Écoute et indices"><div className="qg-counters"><span>Sourate {g.index+1} / {g.rounds.length}</span><span>{g.guesses.length} / 3 essais</span></div><div className="qg-listening-orb" aria-hidden="true">🎧</div><h2>{done?'Le passage révélé':`Indice audio ${g.level+1}`}</h2><p>Écoute un verset entier. Si tu hésites, le verset suivant peut t’aider. Aucun démarrage automatique.</p>
 {!done&&<><AudioPlayer key={`${g.index}-${g.level}`} url={mysteryAudioUrl(g)} onListened={()=>act({type:'heard'})}/>{!g.heard&&<p className="qx-muted">Écoute l’extrait jusqu’au bout pour proposer une réponse.</p>}
 </>}</PupitreTop><PupitreBottom aria-label="Réponses et aides">{!done?<>
 {g.advanced&&<label>Rechercher une sourate<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nom ou numéro" autoComplete="off"/></label>}
 <div className={`qx-choices ${g.advanced?'qg-surah-list':''}`}>{candidates.map(c=><button key={c.id} disabled={!g.heard||g.guesses.includes(c.id)} onClick={()=>{act({type:'answer',index:c.id});setSearch('');}}>{c.title}{g.guesses.includes(c.id)?' · déjà essayée':''}</button>)}</div>{!candidates.length&&<p>Aucune sourate pour cette recherche.</p>}<div className="qg-actions"><button disabled={g.level>=mysteryMaxLevel(g)} onClick={()=>act({type:'hint'})}>Écouter un autre verset</button><button onClick={()=>act({type:'reveal'})}>Découvrir la réponse</button></div></>:<><AudioDiscovery key={g.index} question={legacyLearningQuestion(q)}/><button className="qx-primary" onClick={()=>{setSearch('');act({type:'next'});}}>{g.index+1===g.rounds.length?'Voir mon bilan':'Sourate suivante →'}</button></>}
 <p className="qg-status" role="status">{g.message}</p></PupitreBottom></Pupitre>;
}
