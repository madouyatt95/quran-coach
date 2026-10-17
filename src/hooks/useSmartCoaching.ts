import { useEffect, useMemo, useState } from 'react';
import { activeMosque, useMosqueStore } from '../stores/mosqueStore';
import {useReminderExperienceStore} from '../stores/reminderExperienceStore';
import {reminderGroup} from '../lib/reminderExperience';
import {useDailyAdhkarStore} from '../stores/dailyAdhkarStore';
import {useAdhkarExperienceStore} from '../stores/adhkarExperienceStore';
import {useMosqueDirectoryStore} from '../stores/mosqueDirectoryStore';
import {mosqueScheduleEvents,scheduleSlug} from '../lib/mosqueScheduleEvents';
import {personalPlan} from '../lib/mosqueTimetables';
import {fridayReminder} from '../lib/fridayReminder';
import { useMosquePlansStore } from '../stores/mosquePlansStore';
import { upcomingEvents, timeLabel } from '../lib/mosquePlanning';
import { useSmartStore } from '../stores/smartStore';
import { usePrayerStore } from '../stores/prayerStore';
import { useStatsStore } from '../stores/statsStore';
import { useCompanionStore } from '../stores/companionStore';
import { useInvisibleCoachStore } from '../stores/invisibleCoachStore';
import { useSRSStore } from '../stores/srsStore';
import { useHifdhJourneyStore } from '../stores/hifdhJourneyStore';
import { useQuizStore } from '../stores/quizStore';
import { useReadingBookmarkStore } from '../stores/readingBookmarkStore';
import { useKhatmStore } from '../stores/khatmStore';
import { useLearningStore } from '../stores/learningStore';
import { getHijriDate } from '../lib/dateUtils';
import { getCurrentWeather, type WeatherCondition } from '../lib/weatherService';
import { computeDay, PRAYER_NAMES_FR, SALAT_KEYS } from '../lib/prayerEngine';
import { localDay } from '../lib/learning';
import { fridayWeek, kahfProgress, lastThirdStart, visibleCards, type CompanionCard } from '../lib/companion';
import { HIJRI_HISTORY_EVENTS, QURAN_VOCABULARY } from '../data/companionContent';

export function useSmartCoaching() {
    const mosque=useMosqueStore(activeMosque);
    const reminders=useReminderExperienceStore(),directory=useMosqueDirectoryStore();
    const daily=useDailyAdhkarStore(),adhkar=useAdhkarExperienceStore();
    const [invocationTools,setInvocationTools]=useState<typeof import('../lib/invocationReminder')|null>(null);
    useEffect(()=>{let alive=true;void import('../lib/invocationReminder').then(module=>{if(alive)setInvocationTools(module);}).catch(()=>{});return()=>{alive=false;};},[]);
    const mosquePlans=useMosquePlansStore(s=>s.plans);
    const smart=useSmartStore(), prayer=usePrayerStore(), stats=useStatsStore();
    const companion=useCompanionStore(), coach=useInvisibleCoachStore();
    const srs=useSRSStore(s=>s.cards), attempts=useHifdhJourneyStore(s=>s.attempts), quiz=useQuizStore(s=>s.gameHistory);
    const bookmark=useReadingBookmarkStore(s=>s.bookmark), khatm=useKhatmStore(), records=useLearningStore(s=>s.records);
    const [now,setNow]=useState(()=>Date.now()),[weather,setWeather]=useState<WeatherCondition|null>(null);
    useEffect(()=>{const update=()=>setNow(Date.now());const timer=setInterval(update,30000);document.addEventListener('visibilitychange',update);return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',update);};},[]);
    useEffect(()=>{
        let alive=true;setWeather(null);
        if(!smart.globalEnabled || !smart.weatherEnabled || prayer.lat===null || prayer.lng===null)return;
        const load=()=>{if(!document.hidden)void getCurrentWeather(prayer.lat!,prayer.lng!).then(w=>{if(alive)setWeather(w);});};
        load();const timer=setInterval(load,15*60000);return()=>{alive=false;clearInterval(timer);};
    },[smart.globalEnabled,smart.weatherEnabled,prayer.lat,prayer.lng]);
    const allCards=useMemo(()=>{
        const date=new Date(now),day=localDay(date),week=fridayWeek(date),hour=date.getHours(),dow=date.getDay();
        const cards:CompanionCard[]=[];
        const add=(c:CompanionCard)=>cards.push(c);
        const base={kind:'Conseil pédagogique' as const,minutes:2,priority:30};
        const readRoute='/read';
        const trigger=(key:string)=>coach.enabledTriggers[key]!==false;
        if(coach.enabled){
            const latest=new Map<string,typeof attempts[number]>();
            for(const a of [...attempts].sort((a,b)=>b.at.localeCompare(a.at)))if(a.scope!=='phrase' && a.outcome!=='uncertain' && !latest.has(`${a.surah}:${a.ayah}`))latest.set(`${a.surah}:${a.ayah}`,a);
            const weak=[...latest.values()].filter(a=>['review','assisted','self-corrected'].includes(a.outcome) && !(records[`${a.surah}:${a.ayah}`]?.recall==='independent' && records[`${a.surah}:${a.ayah}`].lastPracticed>a.at));
            const due=Object.values(srs).filter(c=>c.nextReviewDate<=day).sort((a,b)=>a.nextReviewDate.localeCompare(b.nextReviewDate));
            const candidates=[...weak,...due];
            const target=candidates.find(a=>!companion.done[`review:${day}:${a.surah}:${a.ayah}`] && !(companion.later[`review:${day}:${a.surah}:${a.ayah}`]>now));
            if(target)add({...base,id:`review:${day}:${target.surah}:${target.ayah}`,topic:'review',origin:'coach',emoji:'🧠',title:weak.length?'Un passage à consolider':'Votre prochaine révision',message:`Sourate ${target.surah}, verset ${target.ayah}. Une courte séance pour entretenir ce passage.`,reason:weak.length?'Votre dernier essai était accompagné ou à consolider.':`${due.length} verset(s) arrivé(s) à échéance.`,route:`/hifdh?surah=${target.surah}&ayah=${target.ayah}`,action:'Réviser ce passage',priority:85,minutes:3});
            if(khatm.isActive && !khatm.completedAt)add({...base,id:`khatm:${day}`,topic:'khatm',origin:'coach',emoji:'📖',title:'Reprendre votre Khatm',message:`${khatm.validatedPages.length} / 604 pages validées. Retrouvez votre parcours et votre objectif du jour.`,reason:'Votre Khatm est en cours.',route:'/read',action:'Reprendre mon Khatm',priority:65,progress:khatm.getOverallProgress().pct,minutes:5});
            const monthPages=new Set(companion.evidence.filter(e=>e.at>=now-30*86400000).map(e=>e.page)).size;
            const milestone=[100,50,10].find(n=>monthPages>=n);
            if(trigger('milestone') && milestone)add({...base,id:`milestone:${day.slice(0,7)}:${milestone}`,topic:'milestone',origin:'coach',emoji:'🌟',title:`${milestone} pages différentes consultées`,message:'Un repère dans vos consultations des trente derniers jours. Continuez à votre rythme.',reason:'Pages distinctes observées à l’écran, sans estimation de mémorisation.',route:'/read',action:'Poursuivre ma lecture',priority:70});
            const last=stats.lastReadDate?new Date(`${stats.lastReadDate}T12:00:00`).getTime():now;
            if(trigger('comeback') && now-last>=3*86400000)add({...base,id:`return:${day}`,topic:'comeback',origin:'coach',emoji:'🌱',title:'Reprendre en douceur',message:'Quelques versets suffisent pour retrouver votre rythme. Aucun rattrapage imposé.',reason:'Votre dernière lecture enregistrée remonte à plusieurs jours.',route:readRoute,action:'Reprendre ma lecture',priority:80});
            const game=quiz[0];
            if(trigger('quiz_weak') && game && game.total>0 && game.correct/game.total<.6 && now-Date.parse(game.date)<7*86400000)add({...base,id:`quiz:${game.date}`,topic:'quiz_weak',origin:'coach',emoji:'📚',title:'Revoir les questions difficiles',message:`${game.correct} réponse(s) correcte(s) sur ${game.total}. Révisez les questions conservées après vos quiz.`,reason:'Votre dernier quiz comporte des réponses à revoir.',route:'/quiz?companion=revision',action:'Réviser mes erreurs',priority:60,minutes:3});
            if(!cards.length)add({...base,id:`read:${day}`,topic:'reading',origin:'coach',emoji:'📖',title:'Un moment avec le Coran',message:bookmark?`Reprenez votre signet : sourate ${bookmark.surah}, verset ${bookmark.ayah}.`:'Une courte lecture, à votre rythme.',reason:bookmark?'Votre signet enregistré.':'Une suggestion pour commencer.',route:readRoute,action:'Ouvrir ma lecture',priority:35});
        }
        if(smart.globalEnabled){
            const hijri=getHijriDate(date);
            let today:null|ReturnType<typeof computeDay>=null,previous:null|ReturnType<typeof computeDay>=null;
            if(prayer.lat!==null && prayer.lng!==null){
                const yesterday=new Date(date);yesterday.setDate(date.getDate()-1);
                today=computeDay(date,prayer.lat,prayer.lng,prayer.settings);
                previous=computeDay(yesterday,prayer.lat,prayer.lng,prayer.settings);
            }
            const sentinel=(id:string,emoji:string,title:string,message:string,route:string,action:string,extra:Partial<CompanionCard>={})=>add({...base,id:`${id}:${day}`,topic:id,origin:'sentinel',emoji,title,message,reason:'Selon le moment de votre journée.',route,action,...(['fasting','fasting-prepare','white-days','history'].includes(id)?{expiresAt:+new Date(date.getFullYear(),date.getMonth(),date.getDate()+1)}:{}),...extra});
            const mosquePlan=mosque?mosquePlans[mosque.id]:undefined;
            const departures=mosquePlan?.remind?upcomingEvents([mosquePlan],now).filter(e=>e.depart!==null&&e.target>now):[];
            for(const event of departures){const isLate=event.depart!<=now,canStillReach=now+event.plan.travel!*60000<=event.target,title=!isLate?`Départ conseillé à ${timeLabel(event.depart!,event.plan.timezone)}`:canStillReach?'Départ maintenant · marge réduite':'Trop juste pour arriver à l’heure';sentinel('mosque-departure','🚶',title,`${event.plan.mosque.name} · ${event.label}. ${event.khutba?'Khutba':'Iqama'} à ${timeLabel(event.target,event.plan.timezone)}. Trajet estimé : ${event.plan.travel} min.`, '/prayers','Voir mon départ',{id:`mosque-departure:${event.id}:${event.target}`,priority:98,startsAt:event.depart!,expiresAt:event.target,reason:`Rappel dans l’app, fondé sur votre saisie : ${event.plan.source}. ${event.plan.timezone}.`,detail:`${event.khutba?'Khutba':'Iqama'} ${timeLabel(event.target,event.plan.timezone)} · trajet ${event.plan.travel} min`,source:event.plan.source,sourceUrl:event.plan.sourceUrl||undefined});}
            if(today){
                for(const key of SALAT_KEYS){if(departures.some(e=>e.key===key||(key==='dhuhr'&&e.key==='friday')))continue;const at=+new Date(today.times[key]);if(now<at){sentinel(`prayer-${key}`,'🕌',`${PRAYER_NAMES_FR[key]} dans ${Math.ceil((at-now)/60000)} min`,mosque ? `Préparer votre visite à ${mosque.name} et retrouver les invocations en chemin. Vérifiez son iqama sur son lien d’horaires.` : 'Un instant pour préparer votre départ et retrouver les invocations de la mosquée.','/adhkar?cat=hisn_chap_12','Ouvrir les invocations',{priority:95,startsAt:at-20*60000,expiresAt:at,reason:mosque ? 'Rappel basé sur les horaires calculés de votre ville, pas sur l’iqama de votre mosquée.' : 'Horaires calculés pour votre ville.'});}}
                const tomorrow=new Date(date);tomorrow.setDate(tomorrow.getDate()+1);
                const nextDay=computeDay(tomorrow,prayer.lat!,prayer.lng!,prayer.settings);
                const dawn=+new Date(today.times.fajr),sunrise=+new Date(today.times.sunrise);
                if(smart.fajrBoosterEnabled && now>=sunrise+90*60000)sentinel('morning','🌅','Votre moment du matin','Retrouvez les invocations du matin et leur compteur.','/adhkar?cat=morning','Ouvrir les invocations',{id:`morning:${localDay(tomorrow)}`,startsAt:+new Date(nextDay.times.fajr),expiresAt:+new Date(nextDay.times.sunrise)+90*60000,priority:75,minutes:5});
                if(smart.saharEnabled && now>=dawn){const start=lastThirdStart(new Date(today.times.maghrib),new Date(nextDay.times.fajr));if(start!==null)sentinel('sahar','🌌','Dernier tiers de la nuit','Un temps pour invoquer et demander pardon, si vous êtes éveillé.','/passage?surah=51&ayah=18','Lire et comprendre',{id:`sahar:${localDay(tomorrow)}`,startsAt:start,expiresAt:+new Date(nextDay.times.fajr),kind:'Coran',source:'Coran 51:18',sourceUrl:'https://quran.com/51/18',priority:90});}
                if(smart.fajrBoosterEnabled)sentinel('morning','🌅','Votre moment du matin','Retrouvez les invocations du matin et leur compteur.','/adhkar?cat=morning','Ouvrir les invocations',{startsAt:dawn,expiresAt:sunrise+90*60000,priority:75,minutes:5});
                sentinel('evening','🌇','Votre moment du soir','Retrouvez les invocations du soir et leur compteur.','/adhkar?cat=evening','Ouvrir les invocations',{startsAt:+new Date(today.times.asr),expiresAt:+new Date(today.times.isha)+3600000,priority:74,minutes:5});
                if(smart.saharEnabled && previous){const start=lastThirdStart(new Date(previous.times.maghrib),new Date(today.times.fajr));if(start!==null)sentinel('sahar','🌌','Dernier tiers de la nuit','Un temps pour invoquer et demander pardon, si vous êtes éveillé.','/passage?surah=51&ayah=18','Lire et comprendre',{startsAt:start,expiresAt:dawn,kind:'Coran',source:'Coran 51:18',sourceUrl:'https://quran.com/51/18',priority:90});}
                if(hour>=18 && dow===4)sentinel('kahf-prepare','🏔️','Préparer votre vendredi','Vous pouvez prévoir votre moment de lecture d’Al-Kahf.','/read?surah=18&ayah=1','Ouvrir Al-Kahf',{priority:50});
            } else sentinel('location','📍','Adapter les rappels à votre ville','Choisissez votre ville pour les moments du matin, du soir et de la nuit.','/prayers','Choisir ma ville',{priority:20,reason:'Aucune position n’est configurée.'});
            if(smart.alKahfEnabled && dow===5){const p=kahfProgress(companion.evidence,date);add({...base,id:`kahf:${week}`,topic:'al-kahf',origin:'sentinel',emoji:'🏔️',title:p.count===110?'Al-Kahf : parcours consulté':'Votre lecture d’Al-Kahf',message:`${p.count} / 110 versets couverts par vos consultations cette semaine.`,reason:'Estimation de consultation à l’écran, dans les trois mushafs. Vous pouvez aussi déclarer votre lecture accomplie.',route:`/read?surah=18&ayah=${p.next}`,action:p.count===110?'Relire Al-Kahf':`Reprendre au verset ${p.next}`,priority:p.count===110?20:82,progress:p.percent,minutes:5});}
            if(smart.whiteDaysEnabled && [12,13,14,15].includes(hijri.day))sentinel('white-days','🌕',hijri.day===12?'Préparer les jours blancs':'Les jours blancs','Repère du calendrier calculé : vérifiez la date suivie par votre communauté.','/hadiths?cat=jeune','Consulter les références',{priority:58,reason:'Calendrier hégirien calculé (Umm al-Qura).',kind:'Hadith',source:'An-Nasa’i 2420',sourceUrl:'https://sunnah.com/nasai:2420'});
            if([0,3].includes(dow) && hour>=18)sentinel('fasting-prepare','🌙','Préparer le jeûne de demain','Si vous souhaitez jeûner lundi ou jeudi, préparez ce moment dès la veille.','/hadiths?cat=jeune','Consulter les références',{kind:'Hadith',source:'An-Nasa’i 2361',sourceUrl:'https://sunnah.com/nasai:2361',priority:55});
            if([1,4].includes(dow))sentinel('fasting','🌙','Lundi et jeudi','Retrouvez les textes sur le jeûne de ces journées.','/hadiths?cat=jeune','Consulter les références',{kind:'Hadith',source:'An-Nasa’i 2361',sourceUrl:'https://sunnah.com/nasai:2361'});
            if(smart.kinshipEnabled && dow===5)sentinel('kinship','📞','Un lien à entretenir','Vous pouvez prendre des nouvelles d’un proche aujourd’hui.','/passage?surah=4&ayah=1','Lire le passage',{kind:'Coran',source:'Coran 4:1',sourceUrl:'https://quran.com/4/1'});
            if(dow===5)sentinel('salawat','🤲','Salutations sur le Prophète ﷺ','Retrouvez le passage et son explication.','/passage?surah=33&ayah=56','Lire et comprendre',{kind:'Coran',source:'Coran 33:56',sourceUrl:'https://quran.com/33/56'});
            if(smart.historyEnabled){const event=HIJRI_HISTORY_EVENTS[`${hijri.day}-${hijri.month}`];if(event)sentinel('history','📜',event.title,event.text,'/prayers','Voir le calendrier',{reason:'Repère du calendrier calculé.',source:hijri.month===9 && hijri.day===27?'Bukhari 2020':'Repère historique — référence à confirmer',sourceUrl:hijri.month===9 && hijri.day===27?'https://sunnah.com/bukhari:2020':undefined,referencePending:!(hijri.month===9 && hijri.day===27)});}
            if(smart.travelEnabled && companion.travel)sentinel('travel','🧳','Votre voyage','Les invocations du voyage sont à portée de main.','/adhkar?mega=travel','Ouvrir les invocations',{reason:'Vous avez activé le mode voyage.',priority:60});
            if(hour>=22)sentinel('night','🌙','Un moment avant le repos','Vous pouvez poursuivre votre lecture avec Al-Mulk.','/read?surah=67&ayah=1','Lire Al-Mulk',{reason:'Suggestion de lecture du soir.'});
            const word=QURAN_VOCABULARY[Math.floor(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())/86400000)%QURAN_VOCABULARY.length];
            sentinel('vocab','✍️','Une notion à explorer',`${word.word} : ${word.meaning}`,`/passage?surah=${word.surah}&ayah=${word.ayah}`,'Explorer le passage',{reason:'Notion associée au passage ; la forme arabe peut varier.',source:`Coran ${word.surah}:${word.ayah}`,sourceUrl:`https://quran.com/${word.surah}/${word.ayah}`,arabic:word.ar,priority:10});
            if(smart.weatherEnabled && weather && weather.event!=='none'){
                const map={rain:['🌧️','Quand la pluie tombe','64'],thunderstorm:['⚡','Quand le tonnerre gronde','62'],wind:['🌬️','Par vent fort','61']} as const;
                const [emoji,title,chapter]=map[weather.event];
                sentinel('weather',emoji,title,weather.event==='rain'?'Retrouvez l’invocation pour une pluie bénéfique.':'Retrouvez les invocations et leurs références.',`/adhkar?cat=hisn_chap_${chapter}`,'Ouvrir l’invocation',{kind:'Invocation',reason:`Météo estimée pour ${prayer.cityName || 'votre ville configurée'}.`,source:weather.event==='rain'?'Bukhari 1032':'Hisnul Muslim — référence détaillée dans l’invocation',sourceUrl:weather.event==='rain'?'https://sunnah.com/bukhari:1032':undefined,arabic:weather.event==='rain'?'اللَّهُمَّ صَيِّبًا نَافِعًا':undefined,priority:88,expiresAt:now+3600000});
            }
        }
        const slug=mosque?scheduleSlug(mosque,directory.links,directory.automatic):undefined;
        const events=mosque?mosqueScheduleEvents(mosque,mosquePlans,slug?directory.published[slug]:undefined,now).map(event=>({...event,plan:{...event.plan,remind:personalPlan(mosque,mosquePlans)?.remind??true}})):[];
        const friday=smart.globalEnabled&&smart.alKahfEnabled?fridayReminder(date,companion.evidence,reminders.groups.mosque===false?[]:events):null;
        const result=cards.filter(c=>!friday||(!['al-kahf','kahf-prepare'].includes(c.topic)&&!(friday.route==='/prayers'&&c.topic==='mosque-departure'&&c.id.includes(':friday'))));
        if(friday)result.push(friday);
        return result.map(c=>{
            if(c.origin!=='sentinel')return c;
            const data=invocationTools&&['morning','evening'].includes(c.topic)?invocationTools.invocationReminder(c.topic,daily,adhkar,c.startsAt&&c.startsAt>now?c.startsAt:now):null;
            if(data&&c.startsAt&&c.startsAt>now)data.detail=c.topic==='morning'?'Séance du matin':'Séance du soir';
            return {...c,...data};
        });
    },[now,smart,prayer,mosque,mosquePlans,directory,reminders.groups.mosque,invocationTools,daily,adhkar,stats,coach.enabled,coach.enabledTriggers,srs,attempts,quiz,bookmark,khatm,records,companion.evidence,companion.done,companion.later,companion.travel,weather]);
    const legacyTopicEnabled=(topic:string)=>({weather:smart.weatherEnabled,kinship:smart.kinshipEnabled,'al-kahf':smart.alKahfEnabled,'kahf-prepare':smart.alKahfEnabled,morning:smart.fajrBoosterEnabled,sahar:smart.saharEnabled,travel:smart.travelEnabled,history:smart.historyEnabled,'white-days':smart.whiteDaysEnabled}[topic]!==false);
    const kept=smart.globalEnabled?reminders.moments.filter(m=>legacyTopicEnabled(m.card.topic)&&!companion.done[m.id]&&m.at+86400000>now&&(!m.card.expiresAt||m.card.expiresAt>now)):[];
    const scheduled=kept.map(m=>({...m.card,title:allCards.find(c=>c.id===m.originId)?.title||m.card.title,id:m.id,originId:m.originId,keptAt:m.at,startsAt:m.at,expiresAt:Math.min(m.card.expiresAt||Infinity,m.at+86400000),priority:Math.max(80,m.card.priority),detail:`Prévu le ${new Date(m.at).toLocaleString('fr-FR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}`}));
    const candidates=[...allCards.filter(c=>!kept.some(m=>m.originId===c.id||(m.at<=now&&m.card.topic===c.topic))&&!reminders.moments.some(m=>m.originId===c.id&&companion.done[m.id])),...scheduled].filter(c=>c.origin!=='sentinel'||(reminders.groups[reminderGroup(c.topic)]!==false&&!(reminders.cooldowns[c.topic]>now)));
    const available=visibleCards(candidates,companion.done,companion.later,companion.muted,now);
    return {cards:available.filter(c=>!c.startsAt || c.startsAt<=now),upcoming:available.filter(c=>c.startsAt && c.startsAt>now).sort((a,b)=>a.startsAt!-b.startsAt!),completed:[...new Map([...allCards,...companion.completedCards].filter(c=>companion.done[c.id] && companion.done[c.id]>=now-7*86400000).map(c=>[c.id,c])).values()].sort((a,b)=>companion.done[b.id]-companion.done[a.id]),loading:false,now};
}
