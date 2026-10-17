import { localDay } from './learning';
export type CompanionPace = 'discreet' | 'balanced' | 'guided';
export type Need = 'peace' | 'gratitude' | 'patience' | 'understanding' | 'return';
export interface CompanionCard {
    id: string; topic: string; origin: 'coach' | 'sentinel'; emoji: string; title: string;
    message: string; reason: string; minutes: number; route: string; action: string;
    kind: 'Conseil pédagogique' | 'Coran' | 'Hadith' | 'Invocation';
    source?: string; sourceUrl?: string; referencePending?: boolean;
    detail?: string; originId?:string; keptAt?:number;
    arabic?: string; priority: number; startsAt?: number; expiresAt?: number; progress?: number;
}
export interface ReadingEvidence { day: string; surah: number; ayah: number; page: number; at: number; }
export const PACE: Record<CompanionPace, { label: string; max: number; interval: number; description: string }> = {
    discreet: { label: 'Discret', max: 1, interval: 30, description: 'Un conseil au maximum par session' },
    balanced: { label: 'Équilibré', max: 3, interval: 10, description: 'Jusqu’à trois conseils, espacés' },
    guided: { label: 'Accompagné', max: 5, interval: 5, description: 'Jusqu’à cinq conseils, aux pauses' },
};
export const NEEDS: Record<Need, { label: string; emoji: string; verse: [number,number]; dua: [number,number]; reflection: string; task: string }> = {
    peace: {label:'Apaisement',emoji:'🌿',verse:[13,28],dua:[20,25],reflection:'Prends un instant pour lire le sens du verset et ce qu’il évoque pour toi.',task:'Accorde-toi deux minutes de lecture calme, à ton rythme.'},
    gratitude: {label:'Gratitude',emoji:'🌸',verse:[14,7],dua:[27,19],reflection:'Quel bienfait souhaites-tu reconnaître aujourd’hui ?',task:'Choisis une petite action de gratitude envers une personne.'},
    patience: {label:'Patience',emoji:'🌱',verse:[2,153],dua:[2,250],reflection:'Quelle prochaine étape peux-tu aborder avec patience ?',task:'Choisis un geste réalisable aujourd’hui, même modeste.'},
    understanding: {label:'Compréhension',emoji:'📖',verse:[38,29],dua:[20,114],reflection:'Relève une idée du passage, puis ouvre son explication.',task:'Reformule avec tes mots une idée que tu as comprise.'},
    return: {label:'Reprise',emoji:'🕊️',verse:[39,53],dua:[3,8],reflection:'Un retour peut commencer par quelques versets, sans rattrapage imposé.',task:'Reprends ton signet pendant deux minutes, si tu le souhaites.'},
};
export function fridayWeek(now = new Date()): string {
    const d = new Date(now); d.setDate(d.getDate() - ((d.getDay()+2)%7)); return localDay(d);
}
export function kahfProgress(evidence: ReadingEvidence[], now = new Date()) {
    const from = fridayWeek(now), to=localDay(now);
    const verses = new Set(evidence.filter(e=>e.day>=from && e.day<=to && e.surah===18 && e.ayah>0 && e.ayah<=110).map(e=>e.ayah));
    let next=1; while(verses.has(next) && next<=110)next++;
    return {count:verses.size, next:Math.min(110,next), percent:Math.round(verses.size/110*100)};
}
export function lastThirdStart(sunset: Date, dawn: Date): number | null {
    const a=+sunset,b=+dawn,duration=b-a;
    return Number.isFinite(duration) && duration>0 && duration<24*3600000 ? b-duration/3 : null;
}
/** Visible consultation only; never interprets a jump or background time as reading. */
export class CompanionReadingClock {
    private visit: {key:string; jump:number; since:number; credited:boolean} | null=null;
    observe(key:string,jump:number,active:boolean,now:number,minimum=4000):boolean {
        if(!active){this.visit=null;return false;}
        if(!this.visit || this.visit.key!==key || this.visit.jump!==jump){this.visit={key,jump,since:now,credited:false};return false;}
        if(!this.visit.credited && now-this.visit.since>=minimum){this.visit.credited=true;return true;}
        return false;
    }
}
export function visibleCards(cards:CompanionCard[], done:Record<string,number>, later:Record<string,number>, muted:string[], now=Date.now()) {
    return cards.filter(c=>!done[c.id] && !(later[c.id]>now) && !muted.includes(c.topic) && (!c.expiresAt || c.expiresAt>now)).sort((a,b)=>b.priority-a.priority || a.id.localeCompare(b.id));
}
