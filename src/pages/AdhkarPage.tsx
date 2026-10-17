import {InvocationReviewShelf} from '../components/Adhkar/InvocationReviewShelf';
import {useEffect,useMemo,useState} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {Search,Heart,ArrowUp,ArrowDown,X} from 'lucide-react';
import {HISNUL_MUSLIM_DATA} from '../data/hisnulMuslim';
import {allInvocations,categoryById,countEvidence,invocationByKey,invocationCategories,invocationCountKey,invocationKey,invocationTitle,isDailyInvocation,searchInvocations,type Invocation} from '../lib/adhkarExperience';
import {useFavoritesStore,duaFavoriteKey} from '../stores/favoritesStore';
import {useAdhkarExperienceStore} from '../stores/adhkarExperienceStore';
import {useDailyAdhkarStore,localAdhkarDay} from '../stores/dailyAdhkarStore';
import {InvocationQuickSession} from '../components/Adhkar/InvocationQuickSession';
import {InvocationReader} from '../components/Adhkar/InvocationReader';
import {DownloadButton} from '../components/DownloadButton';
import {getAdhkarAudioUrl} from '../lib/adhkarAudioService';
import './AdhkarPage.css';
export function AdhkarPage(){
 const [params,setParams]=useSearchParams(),[query,setQuery]=useState(''),[now,setNow]=useState(()=>new Date()),[name,setName]=useState(''),[autoStart,setAutoStart]=useState(false);
 const experience=useAdhkarExperienceStore(),daily=useDailyAdhkarStore(),favorites=useFavoritesStore();
 useEffect(()=>{
  const previous=favorites.favoriteDuas.find(f=>f.chapterId==='hisn_chap_130'&&f.duaId===276&&f.arabic===invocationByKey.get('hisn_chap_130:100276')?.arabic);
  if(!previous)return;
  const oldKey=duaFavoriteKey(previous.chapterId,276),newKey=duaFavoriteKey(previous.chapterId,100276);
  useFavoritesStore.setState(state=>({favoriteDuas:state.favoriteDuas.map(f=>f===previous?{...f,duaId:100276}:f),annotations:{...state.annotations,...(state.annotations[oldKey]?{[newKey]:state.annotations[oldKey]}:{})}}));
 },[favorites.favoriteDuas]);
 useEffect(()=>{const id=setInterval(()=>setNow(new Date()),30000);return()=>clearInterval(id);},[]);
 const session=params.get('cat')||'',collection=params.get('collection'),mega=params.get('mega');
 const currentId=collection?`collection:${collection}`:session;
 const timed=experience.timedSession?.id===session?experience.timedSession:null;
 const selectedCategory=categoryById.get(session);
 const savedFavorites=favorites.favoriteDuas.map(f=>invocationByKey.get(invocationKey(f.chapterId,f.duaId))).filter((d):d is Invocation=>!!d);
 const collectionItems=collection?savedFavorites.filter(d=>favorites.annotations[duaFavoriteKey(d.categoryId,d.id)]?.collectionIds.includes(collection)):[];
 const list=session==='review'?experience.reviewSession.map(key=>invocationByKey.get(key)).filter((d):d is Invocation=>!!d):timed?timed.keys.map(key=>invocationByKey.get(key)).filter((d):d is Invocation=>!!d):collection?collectionItems:session==='favorites'?savedFavorites:selectedCategory?.items||[];
 const order=experience.order[currentId]||[];
 const items=[...list].sort((a,b)=>{const x=order.indexOf(a.key),y=order.indexOf(b.key);return (x<0?1e6:x)-(y<0?1e6:y);});
 const title=session==='review'?'Mes révisions':timed?`Ma séance de ${timed.minutes} minutes`:collection?favorites.collections.find(c=>c.id===collection)?.name||'Recueil':session==='favorites'?'Mes favoris':selectedCategory?.name||'Invocations';
 const active=params.get('dua');const index=active?items.findIndex(d=>d.key===active||String(d.id)===active):-1;
 const results=useMemo(()=>searchInvocations(query),[query]);
 const today=localAdhkarDay();
 const getCount=(d:Invocation)=>isDailyInvocation(d)?daily.day===today?daily.counts[invocationCountKey(d)]||0:0:experience.counts[invocationCountKey(d)]||0;
 const target=(d:Invocation)=>countEvidence(d)?d.count:experience.targets[d.key]||d.count||1;
 const open=(cat:string,key?:string)=>{setAutoStart(false);setQuery('');const next=new URLSearchParams(cat.startsWith('collection:')?{collection:cat.slice(11)}:{cat});if(key)next.set('dua',key);setParams(next);};
 const view=(d:Invocation)=>open(d.categoryId,d.key);
 const select=(n:number,auto=false)=>{setAutoStart(auto);const next=new URLSearchParams(params);next.set('dua',items[n].key);setParams(next,{replace:true});window.scrollTo({top:0,behavior:'instant'});};
 const period=now.getHours()>=4&&now.getHours()<16?'morning':'evening';const suggested=categoryById.get(period)!;
 const completed=suggested.items.filter(d=>getCount(d)>=target(d)).length;
 const nextDaily=suggested.items.find(d=>getCount(d)<target(d))||suggested.items[0];
 const persisted=experience.resume;
 const legacyCat=localStorage.getItem('adhkar_category_id'),legacyIndex=Number(localStorage.getItem('adhkar_dhikr_index')||0);
 const legacy=legacyCat?categoryById.get(legacyCat)?.items[legacyIndex]:undefined;
 const candidate= persisted&&invocationByKey.has(persisted.key)?persisted:legacy?{session:legacy.categoryId,key:legacy.key}:null;
 const entry=candidate?invocationByKey.get(candidate.key):undefined;
 const validCollection=candidate?.session.startsWith('collection:')&&entry?favorites.collections.some(c=>`collection:${c.id}`===candidate.session&&favorites.annotations[duaFavoriteKey(entry.categoryId,entry.id)]?.collectionIds.includes(c.id)):false;
 const validSession=candidate&&(categoryById.has(candidate.session)||candidate.session===experience.timedSession?.id||candidate.session==='review'||validCollection||(candidate.session==='favorites'&&entry&&favorites.isFavoriteDua(entry.categoryId,entry.id)));
 const resume=candidate&&entry?{...candidate,session:validSession?candidate.session:entry.categoryId}:null;
 const move=(n:number,delta:number)=>{const keys=items.map(d=>d.key);[keys[n],keys[n+delta]]=[keys[n+delta],keys[n]];experience.setOrder(currentId,keys);};
 const availableUrls=[...new Set(items.map(d=>getAdhkarAudioUrl(d.categoryId,d.id)).filter((u):u is string=>!!u))];
 const due=Object.entries(experience.reviews).filter(([key,r])=>invocationByKey.has(key)&&r.due<=now.getTime()).sort((a,b)=>({again:0,hesitant:1,easy:2}[a[1].rating]-{again:0,hesitant:1,easy:2}[b[1].rating])||a[1].due-b[1].due).map(([key])=>key);
 const collectionView=!!session||!!collection;
 return <main className={`inv-page${index>=0?' inv-page-reading':''}`}>
 <header className="inv-header"><div><span className="inv-eyebrow">UN MOMENT POUR SE RECENTRER</span><h1>Invocations</h1></div><span className="inv-header-ar" lang="ar" dir="rtl">حصن المسلم</span></header>
 {index>=0?<InvocationReader key={`${currentId}:${items[index].key}`} session={currentId} items={items} index={index} autoStart={autoStart} onAdvance={()=>select(index+1,true)} onSelect={select} onBack={()=>{const next=new URLSearchParams(params);next.delete('dua');setParams(next);}}/>:<>
 <label className="inv-search"><Search size={19}/><input aria-label="Rechercher une invocation" placeholder="Un mot, une situation, une invocation…" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button aria-label="Effacer la recherche" onClick={()=>setQuery('')}><X size={18}/></button>}</label>
 {query?<section><div className="inv-section-heading"><h2>Résultats</h2><span>{results.length}</span></div><p className="inv-muted">Arabe, phonétique, traduction et situations.</p>{results.length?results.map(d=><InvocationTile key={d.key} d={d} open={()=>view(d)}/>):<p className="inv-empty">Aucune invocation trouvée. Essayez un mot comme « pardon », « voyage » ou une expression de la traduction.</p>}</section>:collectionView?<section>
 <button className="inv-back" onClick={()=>setParams({})}>← Toutes les invocations</button><div className="inv-section-heading"><h2>{title}</h2><span>{items.length} invocations</span>{availableUrls.length>0&&<DownloadButton id={`adhkar-${currentId}`} title={title} urls={availableUrls} sampleUrlForCheck={availableUrls[0]}/>}</div>
 {timed&&<p className="inv-muted">Sélection de {items.length} invocations · environ {Math.floor(timed.seconds/60)} min {timed.seconds%60} s à la préparation. Cette sélection ne remplace pas le recueil complet. Aucun texte n’est interrompu pour respecter la durée.</p>}
 {availableUrls.length>0&&<p className="inv-muted">Téléchargement : {availableUrls.length} enregistrements arabes disponibles. La narration française est lue en ligne.</p>}
 {items.length>0?<><button className="inv-primary" onClick={()=>{const saved=resume?.session===currentId?items.find(d=>d.key===resume.key):undefined;open(currentId,(saved||items.find(d=>getCount(d)<target(d))||items[0]).key);}}>Accompagne-moi · {resume?.session===currentId?'reprendre':'commencer'}</button><p className="inv-muted">{items.filter(d=>getCount(d)>=target(d)).length} compteurs terminés sur {items.length}{['morning','evening'].includes(session)?' aujourd’hui':''}</p>
 {items.map((d,n)=><div className="inv-list-row" key={d.key}><InvocationTile d={d} open={()=>select(n)} count={`${getCount(d)}/${target(d)}`}/>{collection&&<div className="inv-order"><button aria-label={`Monter ${invocationTitle(d)}`} disabled={n===0} onClick={()=>move(n,-1)}><ArrowUp size={16}/></button><button aria-label={`Descendre ${invocationTitle(d)}`} disabled={n===items.length-1} onClick={()=>move(n,1)}><ArrowDown size={16}/></button><button aria-label={`Retirer ${invocationTitle(d)} du recueil`} onClick={()=>{const key=duaFavoriteKey(d.categoryId,d.id);favorites.setCollections(key,(favorites.annotations[key]?.collectionIds||[]).filter(id=>id!==collection));}}><X size={16}/></button></div>}</div>)}</>:<p className="inv-empty">Ce recueil est vide. Ouvrez une invocation puis « Ajouter à un recueil » pour le composer.</p>}
 {collection&&<details className="inv-details"><summary>Gérer ce recueil</summary><div className="inv-details-body"><form onSubmit={e=>{e.preventDefault();if(favorites.renameCollection(collection,name))setName('');}}><label htmlFor="inv-rename">Nouveau nom</label><div className="inv-input-row"><input id="inv-rename" value={name} onChange={e=>setName(e.target.value)} maxLength={60}/><button disabled={!name.trim()}>Renommer</button></div></form><button onClick={()=>{if(window.confirm('Supprimer ce recueil ? Vos favoris et leurs textes seront conservés.')){favorites.removeCollection(collection);setParams({});}}}>Supprimer ce recueil</button></div></details>}
 </section>:<>
 <section className="inv-hero"><span className="inv-hero-icon">{suggested.icon}</span><span className="inv-eyebrow">VOTRE MOMENT {period==='morning'?'DU MATIN':'DU SOIR'}</span><h2>{suggested.name}</h2><p>Une invocation après l’autre, à votre rythme.</p><progress aria-label="Progression de la séance quotidienne" max={suggested.items.length} value={completed}/><div className="inv-hero-meta"><span>{completed} / {suggested.items.length} terminées aujourd’hui</span><button onClick={()=>open(period==='morning'?'evening':'morning')}>{period==='morning'?'Voir le soir':'Voir le matin'} →</button></div><button className="inv-primary" onClick={()=>open(period,nextDaily.key)}>{completed===suggested.items.length?'Relire la séance':completed?'Reprendre ma séance':'Commencer ma séance'}</button></section>
 {resume&&<button className="inv-resume" onClick={()=>open(resume.session,resume.key)}><span>REPRENDRE MA LECTURE</span><strong>{invocationTitle(invocationByKey.get(resume.key)!)}</strong><small>{invocationByKey.get(resume.key)?.categoryName} →</small></button>}
 <nav className="inv-shortcuts" aria-label="Accès rapides"><button onClick={()=>open('hisn_chap_25')}>🕌<span>Après la prière</span></button><button onClick={()=>open('hisn_chap_28')}>🌙<span>Avant de dormir</span></button><button onClick={()=>open('favorites')}>💜<span>Mes favoris</span></button></nav>
 <InvocationReviewShelf due={due} onStart={()=>{experience.startReview(due.slice(0,5));open("review",due[0]);}}/>
 <InvocationQuickSession period={period} favorites={savedFavorites} onOpen={open}/>
 <section><div className="inv-section-heading"><h2>Mes recueils</h2><span>{favorites.collections.length}</span></div><div className="inv-collection-grid">{favorites.collections.map(c=><button key={c.id} onClick={()=>open(`collection:${c.id}`)}><span>📚</span><strong>{c.name}</strong><small>{savedFavorites.filter(d=>favorites.annotations[duaFavoriteKey(d.categoryId,d.id)]?.collectionIds.includes(c.id)).length} invocations</small></button>)}</div>
 <form className="inv-new-collection" onSubmit={e=>{e.preventDefault();const id=favorites.createCollection(name);if(id){setName('');open(`collection:${id}`);}}}><label htmlFor="inv-new-name">Composer un recueil</label><div className="inv-input-row"><input id="inv-new-name" maxLength={60} placeholder="Mon matin, En voyage, À apprendre…" value={name} onChange={e=>setName(e.target.value)}/><button disabled={!name.trim()}>Créer</button></div></form></section>
 <section><div className="inv-section-heading"><h2>Toutes les invocations</h2><span>{allInvocations.length} entrées</span></div><div className="inv-collections-tabs"><button aria-pressed={!mega} onClick={()=>setParams({})}>Sélections</button>{HISNUL_MUSLIM_DATA.map(m=><button key={m.id} aria-pressed={mega===m.id} onClick={()=>setParams({mega:m.id})}>{m.emoji} {m.name}</button>)}</div><div className="inv-category-grid">{invocationCategories.filter(c=>mega?HISNUL_MUSLIM_DATA.find(m=>m.id===mega)?.chapters.some(ch=>`hisn_${ch.id}`===c.id):c.group==='Sélections').map(c=><button key={c.id} onClick={()=>open(c.id)}><span>{c.icon}</span><strong>{c.name}</strong><small>{c.items.length} invocations →</small></button>)}</div></section>
 <Link className="inv-foot-link" to="/favorites">Retrouver tous mes favoris et mes notes →</Link>
 </>}
 </>}
 </main>;
}
function InvocationTile({d,open,count}:{d:Invocation;open:()=>void;count?:string}){
 const favorites=useFavoritesStore();const active=favorites.isFavoriteDua(d.categoryId,d.id);
 return <article className="inv-tile"><button className="inv-tile-main" onClick={open}><small>{d.categoryName}{count?` · ${count}`:''}</small><strong>{invocationTitle(d)}</strong><span lang="ar" dir="rtl">{d.arabic}</span><p>{d.translation}</p></button><button className="inv-tile-fav" aria-label={`${active?'Retirer':'Ajouter'} ${invocationTitle(d)} ${active?'des':'aux'} favoris`} aria-pressed={active} onClick={()=>favorites.toggleFavoriteDua({chapterId:d.categoryId,duaId:d.id,arabic:d.arabic,translation:d.translation,source:d.source||'',chapterTitle:d.categoryName})}><Heart size={18} fill={active?'currentColor':'none'}/></button></article>;
}
