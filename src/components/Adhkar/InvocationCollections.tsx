import {useState} from 'react';
import {useFavoritesStore,duaFavoriteKey} from '../../stores/favoritesStore';
import type {Invocation} from '../../lib/adhkarExperience';
export function InvocationCollections({invocation:d}:{invocation:Invocation}){
 const favorites=useFavoritesStore();const [name,setName]=useState('');
 const key=duaFavoriteKey(d.categoryId,d.id), selected=favorites.annotations[key]?.collectionIds||[];
 const ensureFavorite=()=>{if(!favorites.isFavoriteDua(d.categoryId,d.id))favorites.toggleFavoriteDua({chapterId:d.categoryId,duaId:d.id,arabic:d.arabic,translation:d.translation,source:d.source||'',chapterTitle:d.categoryName});};
 const add=(id:string)=>{ensureFavorite();favorites.setCollections(key,[...selected,id]);};
 return <details className="inv-details"><summary>📚 Ajouter à un recueil</summary><div className="inv-details-body">
 {favorites.collections.map(c=><label className="inv-check" key={c.id}><input type="checkbox" checked={selected.includes(c.id)} onChange={e=>{if(e.target.checked)add(c.id);else favorites.setCollections(key,selected.filter(id=>id!==c.id));}}/>{c.name}</label>)}
 <form onSubmit={e=>{e.preventDefault();const id=favorites.createCollection(name);if(id){add(id);setName('');}}}><label htmlFor="inv-collection-name">Nouveau recueil</label><div className="inv-input-row"><input id="inv-collection-name" value={name} maxLength={60} placeholder="Mon matin, En voyage…" onChange={e=>setName(e.target.value)}/><button disabled={!name.trim()}>Créer</button></div></form>
 </div></details>;
}
