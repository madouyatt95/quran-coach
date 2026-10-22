import {ROOT_PACKS,SENTENCE_PACKS,EXPEDITIONS} from '../../../data/quizExploration';
import {RootsBoard,SentenceBoard,ExpeditionBoard} from './ExplorationGames';
import {useCallback,useEffect,useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {GAME_CATALOG,FAMILY_BOARDS,MEMORY_PACKS,STORY_GAMES,ESCAPE_GAMES,type GameKind} from '../../../data/quizGames';
import {useQuizGamesStore} from '../../../stores/quizGamesStore';
import {useQuizStore} from '../../../stores/quizStore';
import type {GameAction} from '../../../lib/quizGames';
import {FamiliesBoard,MemoryBoard} from './CardGames';
import {StoryBoard,EscapeBoard} from './StoryGames';
import {ListeningGame} from './ListeningGame';
import {DescribeBoard} from './DescribeGame';
import './QuizGames.css';
export function QuizGames(){
 const [params,setParams]=useSearchParams();const kind=params.get('game');const item=GAME_CATALOG.find(g=>g.id===kind);
 const home=()=>{useQuizStore.getState().setView('home');setParams({}, {replace:true});};
 if(!item)return <main className="quiz-container qx qg"><button onClick={home}>← Quiz & défis</button><h1>Choisis un jeu</h1><p>Ce jeu n’existe pas. Retrouve les jeux dans Quiz & défis.</p></main>;
 return <GameScreen key={item.id} kind={item.id} home={home}/>;
}
function GameScreen({kind,home}:{kind:GameKind;home:()=>void}){
 const item=GAME_CATALOG.find(i=>i.id===kind)!;const game=useQuizGamesStore(s=>s.games[kind]);const start=useQuizGamesStore(s=>s.start);const dispatch=useQuizGamesStore(s=>s.act);
 const [playing,setPlaying]=useState(!!game),[advanced,setAdvanced]=useState(false),[seconds,setSeconds]=useState(0);
 const act=useCallback((action:GameAction)=>dispatch(kind,action),[dispatch,kind]);
 const pause=()=>act({type:'pause',now:Date.now()});
 // Leaving the screen always masks a secret card, including via global navigation/back.
 useEffect(()=>()=>{dispatch(kind,{type:'pause',now:Date.now()});},[dispatch,kind]);
 useEffect(()=>{window.scrollTo({top:0});},[playing,game?.finished]);
 const packs=kind==='roots'?ROOT_PACKS:kind==='sentences'?SENTENCE_PACKS:kind==='expedition'?EXPEDITIONS:kind==='families'?FAMILY_BOARDS:kind==='memory'?MEMORY_PACKS:kind==='story'?STORY_GAMES:kind==='escape'?ESCAPE_GAMES:[{id:'session',title:kind==='mystery'?'Cinq sourates à découvrir':'Dix mots à faire deviner'}];
 const begin=(id:string)=>{start(kind,id,{advanced,seconds});setPlaying(true);};
 return <main className={`quiz-container qx qg qg-${kind}`}><header className="qx-header"><button onClick={()=>{pause();home();}}>← Quiz & défis</button>{playing&&<button onClick={()=>{pause();setPlaying(false);}}>Changer de partie</button>}</header><div className="qg-title"><span aria-hidden="true">{item.icon}</span><div><small>{item.tag}</small><h1>{item.title}</h1></div></div>
 {!playing||!game?<><p>{item.description}</p>{game&&<button className="qx-primary" onClick={()=>setPlaying(true)}>{game.finished?'Revoir mon dernier résultat':'Reprendre ma partie'}</button>}
 {kind==='mystery'&&<fieldset className="qg-settings"><legend>Comment veux-tu répondre ?</legend><label><input type="radio" checked={!advanced} onChange={()=>setAdvanced(false)}/> Quatre propositions</label><label><input type="radio" checked={advanced} onChange={()=>setAdvanced(true)}/> Rechercher parmi les 114 sourates</label><p>Les extraits nécessitent une connexion s’ils ne sont pas déjà disponibles sur l’appareil.</p></fieldset>}
 {kind==='describe'&&<label className="qg-settings">Temps par carte<select value={seconds} onChange={e=>setSeconds(Number(e.target.value))}><option value={0}>Sans chronomètre</option><option value={60}>60 secondes</option><option value={90}>90 secondes</option></select><small>Le temps est suspendu lorsque tu masques la carte ou quittes l’écran.</small></label>}
 {game&&!game.finished&&<p>Commencer une nouvelle partie remplacera celle en pause dans ce jeu. Tes autres jeux restent conservés.</p>}
 <div className="qg-pack-grid">{packs.map(pack=><button key={pack.id} onClick={()=>begin(pack.id)}><strong>{pack.title}</strong><span>{game&&!game.finished?'Remplacer ma partie et jouer':'Commencer'} →</span></button>)}</div><p className="qx-muted">Parties enregistrées sur cet appareil. Les résultats de jeu ne valident pas automatiquement tes cours.</p></>:<>
 {game.finished&&<section className="qg-finished" role="status"><span aria-hidden="true">✨</span><strong>Partie terminée</strong><button onClick={()=>setPlaying(false)}>Une nouvelle partie →</button></section>}
 <section className="qx-card qg-board">{game.kind==='roots'?<RootsBoard game={game} act={act}/>:game.kind==='sentences'?<SentenceBoard game={game} act={act}/>:game.kind==='expedition'?<ExpeditionBoard game={game} act={act}/>:game.kind==='families'?<FamiliesBoard game={game} act={act}/>:game.kind==='memory'?<MemoryBoard game={game} act={act}/>:game.kind==='story'?<StoryBoard game={game} act={act}/>:game.kind==='mystery'?<ListeningGame game={game} act={act}/>:game.kind==='escape'?<EscapeBoard game={game} act={act}/>:<DescribeBoard game={game} act={act}/>}</section>
 </>}
 </main>;
}
