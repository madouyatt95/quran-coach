import {useLocation} from 'react-router-dom';
import {usePersonalJourneyStore} from '../stores/personalJourneyStore';
export function CourseSaveAction(){
 const location=useLocation(),saved=usePersonalJourneyStore(s=>s.savedCourses),toggle=usePersonalJourneyStore(s=>s.toggleCourse),id=new URLSearchParams(location.search).get('module');
 if(location.pathname!=='/academy'||!id||!/^[a-z0-9-]+$/.test(id))return null;
 return <div className="session-return"><button aria-pressed={!!saved[id]} onClick={()=>toggle(id)}>{saved[id]?'♥ Cours dans ma bibliothèque':'♡ Garder ce cours dans ma bibliothèque'}</button></div>;
}
