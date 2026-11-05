import {carPlaybackCommand} from '../lib/nativeCarPlayback';
import {useState} from 'react';
import {Link} from 'react-router-dom';
import {activeProfile,createLocalProfile,readProfiles,PROFILE_ACTIVE,scopedStorage,type LocalProfile} from '../lib/profileStorage';
import {lockProgressSync} from '../lib/progressSync';
function summary(id:string){
 const storage=scopedStorage(localStorage,id);
 const state=(key:string)=>{try{return JSON.parse(storage.getItem(key)||'{}').state||{};}catch{return {};}};
 const progress=state('academy-store').progress||{};
 let junior:{completedSteps?:string[]}={};try{junior=JSON.parse(storage.getItem('qc_junior_progress')||'{}');}catch{/* Optional legacy progress. */}
 return `${Object.values(progress).filter((p)=>!!(p as {completed?:boolean}).completed).length} cours terminés · ${(state('quran-coach-khatm').validatedPages||[]).length} pages validées · ${(junior.completedSteps||[]).length} étapes Junior`;
}
export function HouseholdProfiles(){
 const [profiles,setProfiles]=useState(readProfiles),[name,setName]=useState(''),[kind,setKind]=useState<LocalProfile['kind']>('child'),[level,setLevel]=useState<LocalProfile['level']>('beginner'),[error,setError]=useState('');
 const select=async(id:string)=>{try{lockProgressSync();await carPlaybackCommand('stop');window.dispatchEvent(new Event('quran-stop-playback'));localStorage.setItem(PROFILE_ACTIVE,id);for(const key of ['scrollToAyah','scrollToPage','isSilentJump'])sessionStorage.removeItem(key);window.location.assign('/');}catch{setError('Le stockage est indisponible. Votre espace actuel est conservé.');}};
 return <section className="settings-section" id="profiles"><h2>Les espaces de la famille</h2><p>Chacun retrouve ses progrès, favoris et notes sur cet appareil. Ces espaces ne sont pas protégés par un mot de passe.</p>
 <div className="learning-grid">{profiles.map(p=><article className="learning-card" key={p.id}><strong>{p.kind==='child'?'🌱':'📖'} {p.name}</strong><p>{summary(p.id)}</p><button className="learning-btn" disabled={p.id===activeProfile.id} onClick={()=>void select(p.id)}>{p.id===activeProfile.id?'Espace actuel':'Ouvrir cet espace'}</button></article>)}</div>
 <form onSubmit={e=>{e.preventDefault();try{createLocalProfile(name,kind,level);setProfiles(readProfiles());setName('');setError('');}catch(e){setError((e as Error).message);}}}><label>Prénom ou pseudonyme<input value={name} maxLength={40} required onChange={e=>setName(e.target.value)}/></label><label>Espace<select value={kind} onChange={e=>setKind(e.target.value as LocalProfile['kind'])}><option value="child">Enfant · apprentissage accompagné</option><option value="adult">Adulte</option></select></label><label>Niveau de départ<select value={level} onChange={e=>setLevel(e.target.value as LocalProfile['level'])}><option value="beginner">Je débute</option><option value="reader">Je sais lire</option><option value="advanced">Je consolide</option></select></label><button className="learning-btn" disabled={!name.trim()||profiles.length>=8}>Créer un espace</button></form>{error&&<p role="alert">{error}</p>}
 </section>;
}
export function ProfileWelcome(){return activeProfile.id==='default'?null:<section className="learning-card"><strong>{activeProfile.kind==='child'?'🌱':'📖'} L’espace de {activeProfile.name}</strong><p>{activeProfile.kind==='child'?'Apprenons ensemble, à ton rythme.':'Retrouvez vos apprentissages et vos favoris.'}</p><div className="learning-actions"><Link className="learning-btn" to={activeProfile.kind==='child'?'/academy':activeProfile.level==='beginner'?'/academy/arabic':'/learning'}>{activeProfile.kind==='child'?'Mon Académie Junior':activeProfile.level==='beginner'?'Découvrir l’arabe':'Ma séance'}</Link><Link className="learning-btn" to="/settings#profiles">Changer d’espace</Link></div></section>;}
