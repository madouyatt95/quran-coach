import {useState} from 'react';
import type {SarfFamily} from './sarfData';
/** Selection uses source indexes so repeated radical letters remain distinguishable. */
export function RootWorkbench({family}:{family:SarfFamily}){
 const [chosen,setChosen]=useState<number[]>([]),[practising,setPractising]=useState(false);
 const letters=family.root.split(' '),order=[2,0,1],correct=chosen.length===letters.length&&chosen.every((v,i)=>letters[v]===letters[i]);
 return <section className="arabic-root-workbench"><button aria-expanded={practising} onClick={()=>{setPractising(!practising);setChosen([]);}}>Assembler les trois radicales</button>{practising&&<><p>Touchez les lettres dans l’ordre de la racine, de droite à gauche.</p><div className="arabic-root-slots" dir="rtl">{letters.map((_,i)=><button key={i} disabled={chosen[i]===undefined} aria-label={`Retirer la radicale ${i+1}`} onClick={()=>setChosen(chosen.slice(0,i))}>{chosen[i]===undefined?'＋':letters[chosen[i]]}</button>)}</div><div className="arabic-options" dir="rtl">{order.map(i=><button key={i} lang="ar" disabled={chosen.includes(i)} onClick={()=>setChosen([...chosen,i])}>{letters[i]}</button>)}</div><p role="status">{chosen.length<3?'Trois lettres, une famille de mots.':correct?'Racine retrouvée. Faites maintenant varier les formes ci-dessous.':'Cet ordre ne correspond pas à la famille choisie. Touchez une case pour la reprendre.'}</p><button onClick={()=>setChosen([])}>Vider les cases</button></>}</section>;
}
