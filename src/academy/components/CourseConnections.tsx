import {ArrowLeft,ArrowUpRight,ChevronDown,Waypoints} from 'lucide-react';
import {Link,useLocation} from 'react-router-dom';
import {useAcademyStore} from '../../stores/academyStore';
import {courseConnections,courseDestinationTitle,courseHref,courseReturnFrom} from '../data/courseConnections';
import './CourseConnections.css';

export function CourseReturnLink({id}:{id:string}){
 const location=useLocation(),origin=courseReturnFrom(location.state);
 if(!origin||origin.moduleId===id)return null;
 return <Link className="course-connection-return" to={courseHref(origin.moduleId,origin.section)} state={{courseReturn:null}}><ArrowLeft size={17} aria-hidden="true"/><span>Retrouver mon cours : <strong>{origin.title}</strong></span></Link>;
}

export function CourseConnections({id,index}:{id:string;index?:number}){
 const location=useLocation();
 const savedSection=useAcademyStore(state=>state.progress[id]?.lastSectionIdx??0);
 const links=courseConnections(id,index);
 if(!links.length)return null;
 const origin=courseReturnFrom(location.state)||courseReturnFrom({courseReturn:{moduleId:id,section:index??savedSection}})||{moduleId:id,title:courseDestinationTitle(id),section:0};
 return <details className="course-connections">
  <summary><Waypoints size={19} aria-hidden="true"/><span>Faire le lien avec d’autres cours<small>Trois pistes pour approfondir {index===undefined?'ce chapitre':'cette notion'}</small></span><ChevronDown size={17} aria-hidden="true"/></summary>
  <div className="course-connections-body"><p>Explore une explication liée à ce chapitre. Tu pourras ensuite retrouver ton cours à l’endroit où tu l’as quitté.</p><ul>{links.map(link=><li key={`${link.to}:${link.section}`}><Link to={courseHref(link.to,link.section)} state={{courseReturn:origin}}><div><span className="course-connections-subject">{link.to.startsWith('sabirin-tawhid-')?'AQIDAH':'HADITH'} · CHAPITRE {link.to.split('-').at(-1)}</span><strong>{link.title}</strong><span>{link.reason}</span><small>{courseDestinationTitle(link.to)}</small></div><ArrowUpRight size={18} aria-hidden="true"/></Link></li>)}</ul><CourseReturnLink id={id}/></div>
 </details>;
}
