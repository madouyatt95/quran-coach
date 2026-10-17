import {ARABIC_LESSONS} from './data';
import {REVIEW_VARIANTS} from './reviewVariants';
/** A distinct authored example, not another tap on the explanation. */
export function applicationQuestion(lessonId:string){
 const lesson=ARABIC_LESSONS.find(l=>l.id===lessonId);
 if(!lesson||lesson.level===2)return null;
 return REVIEW_VARIANTS.find(v=>v.base===lesson.questions[0]?.id)?.question||null;
}
