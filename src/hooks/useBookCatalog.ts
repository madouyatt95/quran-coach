import {useEffect,useState} from 'react';
import {loadAudioLibrary} from '../lib/audioLibrary';
import type {LibraryAudio} from '../lib/audioProduction';
export function useBookCatalog(){
 const [items,setItems]=useState<LibraryAudio[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
 useEffect(()=>{let live=true;void loadAudioLibrary().then(data=>{if(live)setItems(data);}).catch(e=>{if(live)setError(e instanceof Error?e.message:'Bibliothèque indisponible.');}).finally(()=>{if(live)setLoading(false);});return()=>{live=false;};},[]);
 return {items,loading,error};
}
