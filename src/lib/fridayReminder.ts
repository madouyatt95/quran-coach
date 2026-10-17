import {fridayWeek,kahfProgress,type CompanionCard,type ReadingEvidence} from './companion';
import {timeLabel,type MosqueEvent} from './mosquePlanning';
export function fridayReminder(date:Date,evidence:ReadingEvidence[],events:MosqueEvent[]):CompanionCard|null {
 const dow=date.getDay(),now=+date;if(dow!==5&&!(dow===4&&date.getHours()>=18))return null;
 const friday=new Date(date);if(dow===4)friday.setDate(friday.getDate()+1);
 const end=new Date(friday);end.setHours(23,59,59,999);
 const p=kahfProgress(evidence,friday);
 const event=events.find(e=>e.key==='friday'&&e.target>now&&e.at<=+end);
 const departure=event&&event.depart!==null&&now>=event.depart-3600000&&event.plan.remind;
 const reachable=event&&event.plan.travel!==null&&now+event.plan.travel*60000<=event.target;
 const heading=departure&&!reachable?'Jumu’a · arrivée à l’heure compromise':departure?`Jumu’a · départ ${now>=event.depart!?'maintenant':`dans ${Math.ceil((event.depart!-now)/60000)} min`}`:dow===4?'Préparer mon vendredi':p.count===110?'Mon vendredi · Al-Kahf consultée':'Reprendre Al-Kahf';
 return {id:`friday:${fridayWeek(friday)}:${departure?'departure':dow===4?'prepare':'reading'}`,topic:'al-kahf',origin:'sentinel',emoji:departure?'🕌':'🏔️',title:heading,
 message:departure?`${event.plan.mosque.name} · ${event.khutba?'Khutba':'Jumu’a'} à ${timeLabel(event.target,event.plan.timezone)}.`: 'Choisissez votre moment et retrouvez votre passage dans Al-Kahf.',
 detail:departure?`${event.khutba?'Khutba':'Jumu’a'} ${timeLabel(event.target,event.plan.timezone)} · trajet ${event.plan.travel} min`: `${p.count} / 110 versets consultés${event?` · Jumu’a ${timeLabel(event.at,event.plan.timezone)}`:''}`,
 route:departure?'/prayers':`/read?surah=18&ayah=${p.next}`,action:departure?'Voir mon départ':p.count?`Reprendre au verset ${p.next}`:'Commencer Al-Kahf',
 reason:departure?`${event.published?'Horaire publié':'Horaire personnel'} · ${event.plan.source}. Trajet renseigné par vous. ${event.plan.timezone}.`:'Progression fondée sur les consultations du texte, sans déduire une lecture accomplie.',source:departure?event.plan.source:'Coran 18',sourceUrl:departure?event.plan.sourceUrl:'https://quran.com/18',kind:departure?'Conseil pédagogique':'Coran',priority:departure?99:82,minutes:5,progress:departure?undefined:p.percent,expiresAt:departure?event.target:+end};
}
