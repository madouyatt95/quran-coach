import type {ReaderFraming} from '../components/Mushaf/InteractiveTajweed/readerPageScale';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {RecitationDelay} from '../components/Mushaf/hooks/useRecitationPause';
import type { PaperTheme } from '../lib/interactiveMushaf/service';
export const DEFAULT_INTERACTIVE_READER_ZOOM=1.15;
export type ReaderComfortProfile='single'|'spread'|'desk';
export type ReaderComfort={zoom:number;framing:ReaderFraming};
const cleanComfort=(value:Partial<ReaderComfort>|undefined):ReaderComfort=>({zoom:Number.isFinite(value?.zoom)?Math.min(3,Math.max(1,value!.zoom!)):DEFAULT_INTERACTIVE_READER_ZOOM,framing:value?.framing==='page'?'page':'text'});
export const useInteractiveReaderStore=create<{
    comfortProfile:ReaderComfortProfile;comfort:Partial<Record<ReaderComfortProfile,ReaderComfort>>;activateComfort:(profile:ReaderComfortProfile)=>void;
    keepScreenAwake:boolean;setKeepScreenAwake:(enabled:boolean)=>void;
    framing:ReaderFraming;setFraming:(framing:ReaderFraming)=>void;
    bookSpread:boolean;setBookSpread:(v:boolean)=>void;
    subtitleSize:13|16|18;setSubtitleSize:(size:13|16|18)=>void;
    showTranslation:boolean;setShowTranslation:(show:boolean)=>void;
    recitationDelay:RecitationDelay;setRecitationDelay:(delay:RecitationDelay)=>void;
    zoom:number; paper:PaperTheme; setZoom:(zoom:number)=>void; setPaper:(paper:PaperTheme)=>void;
}>()(persist(set=>({comfortProfile:'single',comfort:{},activateComfort:comfortProfile=>set(state=>state.comfortProfile===comfortProfile?state:{comfortProfile,...cleanComfort(state.comfort[comfortProfile])}),keepScreenAwake:false,setKeepScreenAwake:keepScreenAwake=>set({keepScreenAwake}),framing:'text',setFraming:framing=>set(state=>({framing,zoom:DEFAULT_INTERACTIVE_READER_ZOOM,comfort:{...state.comfort,[state.comfortProfile]:{framing,zoom:DEFAULT_INTERACTIVE_READER_ZOOM}}})),bookSpread:true,setBookSpread:bookSpread=>set({bookSpread}),subtitleSize:13,setSubtitleSize:subtitleSize=>set({subtitleSize}),showTranslation:false,setShowTranslation:showTranslation=>set({showTranslation}),recitationDelay:'duration',setRecitationDelay:recitationDelay=>set({recitationDelay}),zoom:DEFAULT_INTERACTIVE_READER_ZOOM,paper:'sepia',setZoom:zoom=>set(state=>{const value=cleanComfort({zoom,framing:state.framing});return {...value,comfort:{...state.comfort,[state.comfortProfile]:value}};}),setPaper:paper=>set({paper})}),{
    name:'quran-coach-interactive-reader',
    version:2,
    migrate:(saved,version)=>{
        const p=saved as {zoom?:number;paper?:PaperTheme}|undefined;
        // Replace only the old 100% default; preserve zooms users explicitly increased.
        if(version<2&&p?.zoom===1)return {...p,zoom:DEFAULT_INTERACTIVE_READER_ZOOM};
        return saved;
    },
    merge:(saved,current)=>{const p=saved as {comfort?:Partial<Record<ReaderComfortProfile,ReaderComfort>>;keepScreenAwake?:boolean;framing?:ReaderFraming;zoom?:number;paper?:PaperTheme;bookSpread?:boolean;showTranslation?:boolean;subtitleSize?:13|16|18;recitationDelay?:RecitationDelay}|undefined;const comfort=Object.fromEntries((['single','spread','desk'] as const).filter(key=>p?.comfort?.[key]).map(key=>[key,cleanComfort(p!.comfort![key])])) as Partial<Record<ReaderComfortProfile,ReaderComfort>>;if(!comfort.single)comfort.single=cleanComfort(p);return {...current,comfortProfile:'single',comfort,keepScreenAwake:p?.keepScreenAwake===true,bookSpread:p?.bookSpread!==false,subtitleSize:p?.subtitleSize&&[13,16,18].includes(p.subtitleSize)?p.subtitleSize:13,showTranslation:p?.showTranslation===true,recitationDelay:p?.recitationDelay&&['duration',5,10,20,30].includes(p.recitationDelay)?p.recitationDelay:'duration',paper:p?.paper&&['light','sepia','dark'].includes(p.paper)?p.paper:'sepia',...comfort.single};},
}));
