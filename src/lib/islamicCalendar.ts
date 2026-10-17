export type HijriMethod = 'islamic-umalqura' | 'islamic-civil';
export interface HijriDate { year:number;month:number;day:number }
export const HIJRI_MONTHS=['','Muharram','Safar','Rabi al-Awwal','Rabi al-Thani','Jumada al-Ula','Jumada al-Thani','Rajab',"Sha’ban",'Ramadan','Shawwal',"Dhul-Qi’da",'Dhul-Hijjah'];
export const HIJRI_MONTHS_AR=['','محرّم','صفر','ربيع الأوّل','ربيع الثاني','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوّال','ذو القعدة','ذو الحجّة'];
const DAY=86400000;
const formats=new Map<HijriMethod,Intl.DateTimeFormat>();
export function civilKey(date=new Date(),zone=Intl.DateTimeFormat().resolvedOptions().timeZone):string {
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
 return ['year','month','day'].map(k=>parts.find(p=>p.type===k)?.value).join('-');
}
export function addDays(key:string,days:number):string {return new Date(Date.parse(`${key}T12:00:00Z`)+days*DAY).toISOString().slice(0,10);}
export function daysBetween(from:string,to:string):number {return Math.round((Date.parse(`${to}T12:00:00Z`)-Date.parse(`${from}T12:00:00Z`))/DAY);}
export function hijriForDate(key:string,method:HijriMethod='islamic-umalqura',offset=0):HijriDate {
 let formatter=formats.get(method);
 if(!formatter){formatter=new Intl.DateTimeFormat(`en-US-u-ca-${method}`,{timeZone:'UTC',day:'numeric',month:'numeric',year:'numeric'});formats.set(method,formatter);}
 const parts=formatter.formatToParts(new Date(`${addDays(key,offset)}T12:00:00Z`));
 const part=(type:string)=>Number(parts.find(p=>p.type===type)?.value);
 return {year:part('year'),month:part('month'),day:part('day')};
}
export function hijriLabel(key:string,method:HijriMethod,offset:number):string {const h=hijriForDate(key,method,offset);return `${h.day} ${HIJRI_MONTHS[h.month]} ${h.year} H`;}
/** Gregorian civil dates corresponding to the exact Intl calendar month; no average month lengths. */
export function hijriMonth(anchor:string,method:HijriMethod,offset:number):string[] {
 const h=hijriForDate(anchor,method,offset),start=addDays(anchor,1-h.day),days:string[]=[];
 for(let i=0;i<31;i++){const date=addDays(start,i),value=hijriForDate(date,method,offset);if(value.month!==h.month||value.year!==h.year)break;days.push(date);}
 return days;
}
export interface CalendarEvent {id:string;title:string;emoji:string;kind:'worship'|'festival'|'historical';description:string;source?:{label:string;url:string};action?:{label:string;url:string};}
const source=(ref:string)=>({label:ref.replace('muslim:','Muslim ').replace('bukhari:','Bukhari ').replace('nasai:','An-Nasa’i ').replace('tirmidhi:','At-Tirmidhi '),url:`https://sunnah.com/${ref}`});
const adhkar={label:'Ouvrir les invocations',url:'/adhkar'};
export function fastingBlocked(h:HijriDate):boolean {return h.month===10&&h.day===1||h.month===12&&h.day>=10&&h.day<=13;}
export function eventsOn(key:string,method:HijriMethod,offset:number):CalendarEvent[] {
 const h=hijriForDate(key,method,offset),events:CalendarEvent[]=[];
 const add=(id:string,title:string,emoji:string,kind:CalendarEvent['kind'],description:string,ref?:string,action?:CalendarEvent['action'])=>events.push({id,title,emoji,kind,description,source:ref?source(ref):undefined,action});
 if(h.month===1&&h.day===1)add('new-year','Début de l’année hégirienne','🌙','historical','Repère du calendrier. Aucun rite spécifique n’est proposé pour cette date.');
 if(h.month===1&&h.day===9)add('tasua','Tasu’a','🤍','worship','Le jeûne du 9 Muharram accompagne celui d’Achoura.','muslim:1134a');
 if(h.month===1&&h.day===10)add('ashura','Achoura','🤍','worship','Le jeûne d’Achoura est recommandé. Le hadith mentionne l’expiation de l’année précédente.','muslim:1162b',adhkar);
 if(h.month===3&&h.day===12)add('mawlid','Repère traditionnel du Mawlid','🕊️','historical','Le 12 Rabi al-Awwal est une date de commémoration répandue, pas une certitude historique. Le hadith sur le lundi évoque la naissance du Prophète ﷺ sans fixer ce jour du mois. Les avis sur la commémoration diffèrent.','muslim:1162b');
 if(h.month===7&&h.day===27){add('isra','Repère traditionnel d’Isra et Mi’raj','✨','historical','La date du 27 Rajab est traditionnellement retenue par certaines communautés. Le Coran évoque le voyage nocturne sans en fixer la date. Aucun rite spécifique n’est proposé ici.');events[events.length-1].source={label:'Coran 17:1',url:'https://quran.com/17/1'};}
 if(h.month===8&&h.day===15)add('shaban','Nuit du milieu de Sha’ban','🌕','historical','Les récits et les pratiques associés à cette nuit font l’objet d’avis différents. Ce repère n’ajoute pas de prière ou de jeûne spécifique au planning.');
 if(h.month===9&&h.day===1){add('ramadan','Début de Ramadan','🌙','worship','Début prévisionnel selon votre calendrier. Suivez l’annonce de votre communauté pour le début effectif du mois.',undefined,{label:'Préparer ma lecture',url:'/read'});events[events.length-1].source={label:'Coran 2:185',url:'https://quran.com/2/185'};}
 if(h.month===9&&h.day>=21)add('last-nights',`Ramadan · nuit ${h.day}`,'💎','worship','Recherchez Laylat al-Qadr pendant les dix dernières nuits, notamment les nuits impaires. Cette nuit commence au coucher du soleil de la veille de la date affichée ; le 27 n’est pas une date certaine.','bukhari:2020',adhkar);
 if(h.month===10&&h.day===1)add('fitr','Aïd al-Fitr','🎉','festival','Fête de la rupture du jeûne. On ne jeûne pas ce jour. La date dépend de l’annonce de votre communauté.','bukhari:1991',adhkar);
 if(h.month===10&&h.day===2)add('shawwal','Les six jours de Shawwal','🌿','worship','Après Ramadan, six jours de jeûne pendant Shawwal sont recommandés. Vous pouvez choisir vos jours dans le planning.','muslim:1164a');
 if(h.month===12&&h.day===1)add('dhul-hijjah','Les premiers jours de Dhul-Hijjah','🌱','worship','Une période pour multiplier les bonnes œuvres. Les dix premiers jours sont évoqués dans ce hadith.','bukhari:969',adhkar);
 if(h.month===12&&h.day===8)add('tarwiyah','Jour de Tarwiyah','🕋','historical','Repère du pèlerinage, le 8 Dhul-Hijjah. L’app ne lui attribue pas un jeûne spécifique distinct des bonnes œuvres des premiers jours.','bukhari:969');
 if(h.month===12&&h.day===9)add('arafah','Jour d’Arafat','🤲','worship','Jeûne recommandé pour les non-pèlerins. Le hadith mentionne l’expiation de l’année passée et de l’année à venir.','muslim:1162b',adhkar);
 if(h.month===12&&h.day===10)add('adha','Aïd al-Adha','🎊','festival','Fête du sacrifice. On ne jeûne pas ce jour.','bukhari:1991',adhkar);
 if(h.month===12&&h.day>=11&&h.day<=13)add('tashriq','Jours de Tashriq','🕋','festival','Jours de nourriture, de boisson et de rappel d’Allah. Le planning de jeûne volontaire est désactivé pour ces jours. Les cas particuliers du pèlerinage ne sont pas gérés ici.','muslim:1141a',adhkar);
 if(!fastingBlocked(h)&&h.month!==9){
  if(h.day>=13&&h.day<=15)add('white-day',`Jour blanc · ${h.day}`,'⚪','worship','Le jeûne des 13, 14 et 15 du mois lunaire est recommandé.','nasai:2420');
  const weekday=new Date(`${key}T12:00:00Z`).getUTCDay();
  if(weekday===1||weekday===4)add('weekly-fast',`Jeûne du ${weekday===1?'lundi':'jeudi'}`,'🌿','worship','Un repère pour celles et ceux qui souhaitent pratiquer le jeûne volontaire, selon leur situation.','tirmidhi:747');
 }
 return events;
}
export function upcomingCalendarEvents(today:string,method:HijriMethod,offset:number){
 return Array.from({length:91},(_,i)=>({date:addDays(today,i),daysUntil:i})).flatMap(d=>eventsOn(d.date,method,offset).filter(e=>e.id!=='weekly-fast').map(e=>({...e,...d}))).slice(0,10);
}
const escapeICS=(s:string)=>s.replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
export function calendarICS(date:string,title:string,description:string,reminder=false):string {
 const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
 // All-day event with a relative alarm five hours before its start (19:00 the previous day).
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Quran Coach//Calendrier//FR','CALSCALE:GREGORIAN','BEGIN:VEVENT',`UID:qc-${date}-${encodeURIComponent(title)}@quran-coach.fr`,`DTSTAMP:${stamp}`,`DTSTART;VALUE=DATE:${date.replaceAll('-','')}`,`DTEND;VALUE=DATE:${addDays(date,1).replaceAll('-','')}`,`SUMMARY:${escapeICS(title)}`,`DESCRIPTION:${escapeICS(description)}`];
 if(reminder)lines.push('BEGIN:VALARM','ACTION:DISPLAY','TRIGGER:-PT5H',`DESCRIPTION:${escapeICS(title)}`,'END:VALARM');
 lines.push('END:VEVENT','END:VCALENDAR');
 // Fold on Unicode code point boundaries, at most 75 UTF-8 bytes per physical line.
 return lines.map(line=>{let out='',width=0;for(const c of line){const n=new TextEncoder().encode(c).length;if(width+n>74){out+='\r\n ';width=1;}out+=c;width+=n;}return out;}).join('\r\n')+'\r\n';
}
