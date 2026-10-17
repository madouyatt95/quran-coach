import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import type { AcademyLevel, AcademyModule } from '../data/types';
import { useAcademyStore } from '../../stores/academyStore';
import { chapterTeaching } from '../data/courseExplanations';
import './AcademyCourse.css';

export function CourseSyllabus({level,onBack,onOpen}:{level:AcademyLevel;onBack:()=>void;onOpen:(course:AcademyModule)=>void}) {
 const progress=useAcademyStore(state=>state.progress);
 const done=level.modules.filter(course=>progress[course.id]?.completed).length;
 const resume=level.modules.filter(course=>progress[course.id]?.lastVisitedAt&&!progress[course.id]?.completed).sort((a,b)=>(progress[b.id]?.lastVisitedAt||0)-(progress[a.id]?.lastVisitedAt||0))[0];
 return <div className="academy-hub academy-course-shell"><nav className="academy-course-nav"><button onClick={onBack}><ArrowLeft size={17}/> Académie</button><span>{done}/{level.modules.length} chapitres validés</span></nav><header className="academy-course-cover"><span className="academy-course-eyebrow">COURS COMPLET · MASJID SABIRIN</span><h1>{level.title}</h1><p>{level.id==='sabirin-tawhid'?'Un enseignement suivi pour comprendre la croyance, ses sources et les fondements du Tawhîd. Chaque chapitre prépare le suivant.':'Vingt textes étudiés avec leur contexte, leurs explications et leurs enseignements pour la vie quotidienne.'}</p><small>Lis à ton rythme. Les exercices viennent après les explications et ta position de lecture est conservée.</small></header>{resume&&<button className="academy-course-resume" onClick={()=>onOpen(resume)}>Reprendre : {resume.title} <ArrowRight size={18}/></button>}<div className="academy-course-program"><h2>Le programme du cours</h2><ol>{level.modules.map((course,index)=><li key={course.id}><button onClick={()=>onOpen(course)}><span className="academy-course-program-number">{progress[course.id]?.completed?<Check size={20}/>:String(index+1).padStart(2,'0')}</span><span><strong>{course.title}</strong><p>{chapterTeaching(course.id)?.introduction}</p><small>{progress[course.id]?.completed?'Chapitre validé · Relire':progress[course.id]?.lastVisitedAt?'Lecture commencée · Reprendre':'Lire le chapitre'}</small></span><ArrowRight size={18}/></button></li>)}</ol></div></div>;
}
