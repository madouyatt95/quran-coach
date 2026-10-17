import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {RecitationDelay} from '../components/Mushaf/hooks/useRecitationPause';
import type { PaperTheme } from '../lib/interactiveMushaf/service';
export const DEFAULT_INTERACTIVE_READER_ZOOM=1.15;
export const useInteractiveReaderStore=create<{
    bookSpread:boolean;setBookSpread:(v:boolean)=>void;
    subtitleSize:13|16|18;setSubtitleSize:(size:13|16|18)=>void;
    showTranslation:boolean;setShowTranslation:(show:boolean)=>void;
    recitationDelay:RecitationDelay;setRecitationDelay:(delay:RecitationDelay)=>void;
    zoom:number; paper:PaperTheme; setZoom:(zoom:number)=>void; setPaper:(paper:PaperTheme)=>void;
}>()(persist(set=>({bookSpread:true,setBookSpread:bookSpread=>set({bookSpread}),subtitleSize:13,setSubtitleSize:subtitleSize=>set({subtitleSize}),showTranslation:false,setShowTranslation:showTranslation=>set({showTranslation}),recitationDelay:'duration',setRecitationDelay:recitationDelay=>set({recitationDelay}),zoom:DEFAULT_INTERACTIVE_READER_ZOOM,paper:'sepia',setZoom:zoom=>set({zoom:Number.isFinite(zoom)?Math.min(3,Math.max(1,zoom)):DEFAULT_INTERACTIVE_READER_ZOOM}),setPaper:paper=>set({paper})}),{
    name:'quran-coach-interactive-reader',
    version:2,
    migrate:(saved,version)=>{
        const p=saved as {zoom?:number;paper?:PaperTheme}|undefined;
        // Replace only the old 100% default; preserve zooms users explicitly increased.
        if(version<2&&p?.zoom===1)return {...p,zoom:DEFAULT_INTERACTIVE_READER_ZOOM};
        return saved;
    },
    merge:(saved,current)=>{const p=saved as {zoom?:number;paper?:PaperTheme;bookSpread?:boolean;showTranslation?:boolean;subtitleSize?:13|16|18;recitationDelay?:RecitationDelay}|undefined;return {...current,bookSpread:p?.bookSpread!==false,subtitleSize:p?.subtitleSize&&[13,16,18].includes(p.subtitleSize)?p.subtitleSize:13,showTranslation:p?.showTranslation===true,recitationDelay:p?.recitationDelay&&['duration',5,10,20,30].includes(p.recitationDelay)?p.recitationDelay:'duration',zoom:Number.isFinite(p?.zoom)?Math.min(3,Math.max(1,p!.zoom!)):DEFAULT_INTERACTIVE_READER_ZOOM,paper:p?.paper&&['light','sepia','dark'].includes(p.paper)?p.paper:'sepia'};},
}));
