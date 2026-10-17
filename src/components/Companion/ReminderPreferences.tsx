import {REMINDER_GROUPS,reminderGroup} from '../../lib/reminderExperience';
import {useReminderExperienceStore} from '../../stores/reminderExperienceStore';
import {useSmartStore} from '../../stores/smartStore';
import {useCompanionStore} from '../../stores/companionStore';
export function ReminderPreferences({now}:{now:number}){
 const prefs=useReminderExperienceStore(),smart=useSmartStore(),companion=useCompanionStore();
 const legacy={weather:smart.weatherEnabled,kinship:smart.kinshipEnabled,friday:smart.alKahfEnabled,travel:smart.travelEnabled,night:smart.saharEnabled,calendar:smart.historyEnabled};
 return <details className="companion-settings reminder-preferences"><summary>Quels rappels souhaitez-vous retrouver ?</summary><p>Choisissez vos thèmes. Les réglages détaillés restent disponibles plus bas.</p>
 {REMINDER_GROUPS.map(([group,label])=><label className="companion-toggle" key={group}><span>{label}</span><input type="checkbox" role="switch" checked={prefs.groups[group]!==false&&(!(group in legacy)||legacy[group as keyof typeof legacy])} onChange={e=>{
  const enabled=e.target.checked;prefs.setGroup(group,enabled);
  if(enabled){
   // Explicit reactivation only: preserve unrelated categories and existing preferences.
   companion.muted.filter(topic=>reminderGroup(topic)===group).forEach(companion.unmute);
   Object.keys(prefs.cooldowns).filter(topic=>reminderGroup(topic)===group).forEach(topic=>prefs.setCooldown(topic,0));
   if(group==='invocations')smart.setFajrBoosterEnabled(true);
   if(group==='friday')smart.setAlKahfEnabled(true);
   if(group==='fasting')smart.setWhiteDaysEnabled(true);
   if(group==='kinship')smart.setKinshipEnabled(true);
   if(group==='weather')smart.setWeatherEnabled(true);
   if(group==='travel')smart.setTravelEnabled(true);
   if(group==='night')smart.setSaharEnabled(true);
   if(group==='calendar')smart.setHistoryEnabled(true);
  }
 }}/></label>)}
 {Object.entries(prefs.cooldowns).filter(([,until])=>until>now).map(([topic,until])=><button className="companion-secondary" key={topic} onClick={()=>prefs.setCooldown(topic,0)}>Reprendre {REMINDER_GROUPS.find(([id])=>id===reminderGroup(topic))?.[1]} · pause jusqu’au {new Date(until).toLocaleDateString('fr-FR')}</button>)}
 </details>;
}
