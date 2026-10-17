import {useRef,useState} from 'react';
import {courseChapter} from '../data/courseLibrary';
import {HADITH_PLANS} from '../data/coursePedagogy';

const REPORTERS=[
 'Abd-Allah ibn Umar','Umar ibn al-Khattâb','Umar ibn al-Khattâb','Abou Houreira','Ibn Abbâs, rapportant le récit de Muâdh','Abou Houreira','Alî ibn Abî Tâlib','Abd-Allah ibn Mas‘ûd','Abou Houreira','Umar ibn al-Khattâb','Jundab ibn Abd-Allah','Umar ibn al-Khattâb, locuteur de ce récit','Abd-Allah ibn Umar','Anas ibn Mâlik','Abou Houreira','Anas ibn Mâlik','Aïcha','Al-Irbâd ibn Sâriya','Abd-Allah ibn Mas‘ûd','Abou Houreira'
];
const TERMS=[
 ['« bâti sur cinq »','L’image d’une construction aide à distinguer les piliers des autres enseignements.'],
 ['Islam, foi, excellence','Le récit présente ces trois degrés et explique les éléments de chacun.'],
 ['Intention','Le geste visible et ce que la personne recherche par son geste sont deux questions différentes.'],
 ['Branches de la foi','Le texte relie paroles, dispositions et actes concrets.'],
 ['Enseigner par étapes','L’ordre d’enseignement à Muâdh donne une place aux fondements avant les détails.'],
 ['Insinuation','Le cours distingue une pensée surgie malgré soi d’une conviction adoptée.'],
 ['Œuvrer','Le conseil d’agir accompagne ici la foi au destin.'],
 ['Issue des œuvres','Le récit appelle à la vigilance, sans révéler l’avenir d’une personne.'],
 ['Ce qui est utile','L’effort et la demande d’aide sont liés dans le conseil.'],
 ['Serviteur et messager','Le texte précise la place du Prophète et met en garde contre l’exagération.'],
 ['Tombes et prière','Le chapitre relie la mise en garde à la protection de l’adoration.'],
 ['Pierre noire','La parole citée est celle de Umar ; il explique suivre l’exemple du Prophète.'],
 ['Serment','Le cours distingue le serment et certaines expressions habituelles.'],
 ['Amour','Le récit relie l’amour des personnes vertueuses au choix d’un modèle.'],
 ['Compagnons','Le chapitre rappelle leurs mérites et leur place dans la transmission.'],
 ['Douceur de la foi','Le texte réunit trois qualités concernant l’amour et les choix.'],
 ['Conformité','Une intention sincère ne remplace pas l’examen de la forme d’une adoration.'],
 ['Conseils','Le texte rassemble plusieurs conseils dont les termes sont expliqués par le cours.'],
 ['Chemin droit','Le dessin donne une image des choix et des voies qui en détournent.'],
 ['Appeler à la droiture','Transmettre un conseil implique de vérifier sa source et son sens.'],
] as const;
const TABS=['Le texte','Qui rapporte ?','Une expression','Ce que j’en retiens','Dans ma vie'] as const;
export function HadithWorkshop({moduleId}:{moduleId:string}){
 const source=courseChapter(moduleId),number=source?.chapter.number||0,plan=HADITH_PLANS[number-1];
 const [tab,setTab]=useState(0),[check,setCheck]=useState<number|null>(null);
 const tabRefs=useRef<Array<HTMLButtonElement|null>>([]);
 if(!source||source.doc.subject!=='hadith'||!plan)return null;
 const raw=source.pages.map(p=>p.text).join('\n');
 const match=raw.match(/PAROLE (?:DU PROPHÈTE ﷺ|DE UMAR)[\s\S]*?«([\s\S]*?)»/);
 const excerpt=match?.[1].replace(/\s+/g,' ').trim()||'';
 const preview=excerpt.length>520?excerpt.slice(0,430).replace(/\s+\S*$/,'')+'…':excerpt;
 const speaker=number===12?'Umar ibn al-Khattâb':'Le Prophète ﷺ';
 return <section className="academy-hadith" aria-label="Atelier de compréhension du hadith"><h3>Explorer le hadith {number}</h3><div className="academy-hadith__tabs" role="tablist" aria-label="Étapes d’étude">{TABS.map((title,n)=><button role="tab" id={`hadith-tab-${number}-${n}`} aria-controls={`hadith-panel-${number}`} aria-selected={tab===n} tabIndex={tab===n?0:-1} ref={el=>{tabRefs.current[n]=el;}} key={title} onClick={()=>setTab(n)} onKeyDown={event=>{const next=event.key==='ArrowRight'?(n+1)%TABS.length:event.key==='ArrowLeft'?(n+TABS.length-1)%TABS.length:null;if(next!==null){event.preventDefault();setTab(next);tabRefs.current[next]?.focus();}}}>{n+1}. {title}</button>)}</div><div role="tabpanel" id={`hadith-panel-${number}`} aria-labelledby={`hadith-tab-${number}-${tab}`} tabIndex={0} className="academy-hadith__panel">{tab===0?<><small>Extrait du cours · page {source.chapter.start}</small><blockquote>{preview}</blockquote>{preview!==excerpt&&<details><summary>Lire le passage complet</summary><blockquote>{excerpt}</blockquote></details>}<p>Cette parole est attribuée à {speaker}. Le document complet garde le contexte et les explications.</p></>:tab===1?<><h4>La chaîne de lecture</h4><p><strong>{REPORTERS[number-1]}</strong> rapporte le récit étudié. {number===12?'La parole citée sur la Pierre noire est celle de Umar, qui explique le geste du Prophète.':'Le cours distingue le rapporteur de celui dont la parole est citée.'}</p><p>Repérer ces rôles évite de déplacer une attribution.</p></>:tab===2?<><h4>{TERMS[number-1][0]}</h4><p>{TERMS[number-1][1]}</p></>:tab===3?<><h4>L’enseignement principal</h4><p>{plan.concepts[1][1]}</p></>:<><h4>Une application concrète</h4><p>{plan.concepts[2][1]}</p></>}</div><div className="academy-hadith__check"><h4>Je vérifie l’attribution</h4><p>Qui prononce la parole extraite de ce chapitre ?</p>{['Le Prophète ﷺ','Umar ibn al-Khattâb'].map((option,n)=><button key={option} disabled={check!==null} onClick={()=>setCheck(n)}>{option}</button>)}{check!==null&&<p role="status">{check===(number===12?1:0)?'✓ Exact.':'Revois le rôle de celui qui rapporte et de celui qui parle.'} Ici, la parole citée est attribuée à {speaker}.</p>}<button className="academy-hadith__reset" onClick={()=>setCheck(null)}>Refaire la vérification</button></div><a href={`${source.doc.pdf}#page=${source.chapter.start}`} target="_blank" rel="noopener noreferrer">Voir le chapitre dans la source ↗</a></section>;
}
