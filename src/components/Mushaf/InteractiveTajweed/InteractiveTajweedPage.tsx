import {PupitreWorkspace} from '../../Pupitre/PupitreWorkspace';
import {PupitrePreferences} from '../../Pupitre/PupitrePreferences';
import {useLayoutPreferences} from '../../Pupitre/usePupitreLayout';
import {MushafDeskStudy} from './MushafDeskStudy';
import {usePupitreLayout} from '../../Pupitre/usePupitreLayout';
import {Pupitre,PupitreTop,PupitreBottom,PupitreOnly} from '../../Pupitre/Pupitre';
import { useVerseEntry } from './useVerseEntry';
import {BookRibbon} from './BookRibbon';
import {selectedWords,type WordRange} from './PassageSelection';
import {loadReaderAudioSession,type ReaderAudioSession,type AudioStopBoundary} from '../../../lib/readerAudioSession';
import {fetchVerseRecitation,wordRecitationStart} from '../../../lib/verseRecitation';
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Info, Menu, Palette, Pause, Play, RotateCcw, X, ZoomIn, ZoomOut, Maximize, Minimize, MoreHorizontal, SlidersHorizontal, BookOpen, Bookmark, Languages, ArrowLeft, Check, MessageSquare, MousePointerClick, PanelsTopLeft } from 'lucide-react';
import { useQuranStore } from '../../../stores/quranStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import { useFavoritesStore } from '../../../stores/favoritesStore';
import { useKhatmStore } from '../../../stores/khatmStore';
import { useLiveFollowStore } from '../../../stores/liveFollowStore';
import { useInteractiveReaderStore } from '../../../stores/interactiveReaderStore';
import { fetchSurahTranslation, fetchSurahs, fetchSurah, mushafReciter, MUSHAF_RECITERS } from '../../../lib/quranApi';
import { CHAPTERS, composePage, isInteractivePage, lineY, pageForVerse, type InteractivePage, type MushafWord } from '../../../lib/interactiveMushaf/model';
import { loadInteractivePage, loadPageFont, pageFontSamples, prepareNextPage, UNICODE_PAGE_FONT, type PageFont, type PaperTheme } from '../../../lib/interactiveMushaf/service';
import { fontPaletteName, unicodeWord } from '../../../lib/interactiveMushaf/fontResources';
import { useMushafAudio } from '../hooks/useMushafAudio';
import { useKhatmReading } from '../hooks/useKhatmReading';
import { useVersePress, type VerseSelection } from '../hooks/useVersePress';
import { liveWordIndex } from '../LiveFollowWords';
import { VerseActionBar } from '../VerseActionBar';
import { ReadingBookmarkControl } from '../ReadingBookmarkControl';
import { MushafShareModal } from '../MushafShareModal';
import { SideMenu } from '../../Navigation/SideMenu';
import { MushafSearchOverlay } from '../MushafSearchOverlay';
import { FindButton } from '../../Navigation/FindButton';
import { getJuzForPage } from '../../../data/juzData';
import type {WordRecitationStart} from '../../../lib/verseRecitation';
import { useImmersiveControls } from './useImmersiveControls';
import { TranslationRibbon } from './TranslationRibbon';
import type {RecitationDelay} from '../hooks/useRecitationPause';
import {useWordPlayback} from './useWordPlayback';
import { WordStudyCard } from './WordStudyCard';
import { revealPracticeWords } from './pagePractice';
import { useMushafStudyStore } from '../../../stores/mushafStudyStore';
import { useSRSStore } from '../../../stores/srsStore';
import { ReaderSettingsDialog } from '../ReaderSettingsDialog';
import { KhatmTracker, KhatmPageBadge } from '../../Khatm/KhatmTracker';
import { useCompanionRuntimeStore } from '../../../stores/companionStore';
import { useReaderCoachStore } from '../../../stores/readerCoachStore';
import { useInvisibleCoachStore } from '../../../stores/invisibleCoachStore';
import { prepareReaderCoachTask, readerCoachTarget } from '../../../lib/readerCoach';
import { pageLessons, matchesPageLesson } from '../../../lib/interactiveMushaf/pageLessons';
import { MushafCoachContent } from './MushafCoachContent';
import { FontDownloads } from './FontDownloads';
import { PageOrnaments } from './PageOrnaments';
import { usePageGestures } from './usePageGestures';
import { useBookPageTurn } from './useBookPageTurn';
import {bookTurnPages} from './bookTurnMotion';
import {readerPageScale,canShowBookSpread} from './readerPageScale';
import { useReadingBookmarkStore } from '../../../stores/readingBookmarkStore';
import type { Ayah, ViewMode } from '../../../types';
import {fallbackRuleColor} from './glyphStyle';
import {FacingPage} from './FacingPage';

import {NoteEditor,NotesNotebook} from './ReaderNotes';
import {useReaderNotesStore,type ReaderNote} from '../../../stores/readerNotesStore';
import './InteractiveTajweedPage.css';
import { RULES } from '../../../lib/interactiveMushaf/ruleLabels';
// Published QCF V4 light palette; no inference from letter shapes.
const LEGEND=[['#a5a5a5','Idgham'],['#ce9e00','Madd · 2 temps'],['#ff7b00','Madd · 2, 4 ou 6 temps'],['#f40000','Madd · 4 ou 5 temps'],['#b50000','Madd · 6 temps'],['#09b000','Ikhfa / nasalisation'],['#2fadff','Qalqalah'],['#3f48e6','Tafkhim']];
function Sheet({title,children,onClose,className=''}:{title:string;children:React.ReactNode;onClose:()=>void;className?:string}) {
    const ref=useRef<HTMLDialogElement>(null);
    useEffect(()=>{ref.current?.showModal();},[]);
    return createPortal(<dialog ref={ref} className={`iq-sheet ${className}`} aria-label={title} onCancel={onClose} onClose={onClose} onClick={e=>{if(e.target===ref.current)onClose();}}>
        <div className="iq-sheet-content"><header><h2>{title}</h2><button aria-label="Fermer" onClick={onClose}><X size={20}/></button></header>{children}</div>
    </dialog>,document.body);
}
type LoadedPage={data:InteractivePage;font:PageFont;basmala:{font:PageFont;glyphs:string;text:string}|null;paper:PaperTheme};
const EMPTY_AYAHS:Ayah[]=[];
export function InteractiveTajweedPage({onVoiceHost}:{onVoiceHost?:(element:HTMLDivElement|null)=>void}) {
    const navigate=useNavigate(),location=useLocation();
    const pupitre=usePupitreLayout(location.pathname==='/read','reader');const split=pupitre.layout!=='plain';
    const {viewMode,setViewMode,selectedReciter,setReciter}=useSettingsStore();
    const {currentPage:page,currentSurah,currentAyah,surahs,setSurahs}=useQuranStore();
    const {zoom,paper,setZoom,setPaper,showTranslation,setShowTranslation,subtitleSize,setSubtitleSize,recitationDelay,setRecitationDelay,bookSpread,setBookSpread}=useInteractiveReaderStore();
    const live=useLiveFollowStore();
    const lastPageUnread=useKhatmStore(s=>s.isActive&&!s.completedAt&&!s.validatedPages.includes(604));
    const [recitationMode,setRecitationMode]=useState(false);
    const consoleTab=useLayoutPreferences(s=>s.preferences.reader?.tab||'listen');
    const [direction,setDirection]=useState(1);
    const coachInbox=useReaderCoachStore();
    const coachEnabled=useInvisibleCoachStore(s=>s.enabled);
    const [practiceVerse,setPracticeVerse]=useState<string|null>(null);
    const [lessonExercise,setLessonExercise]=useState<string|null>(null);
    const [lessonFeedback,setLessonFeedback]=useState('');
    const [lessonFound,setLessonFound]=useState<string[]>([]);
    const consumedCoachEntry=useRef('');
    const [practice,setPractice]=useState(false),[revealMode,setRevealMode]=useState<'word'|'line'>('word');
    const [revealed,setRevealed]=useState<Set<string>>(new Set());
    const [practiceAdded,setPracticeAdded]=useState(false);
    const reviewWords=useMushafStudyStore(s=>s.words);
    const khatmActive=useKhatmStore(s=>s.isActive&&!s.completedAt);
    const [rangeBusy,setRangeBusy]=useState(false),[rangeError,setRangeError]=useState('');
    const rangeRequest=useRef(0);
    const pendingReview=useRef<{page:number;key:string}|null>(null);

    const [bundle,setBundle]=useState<LoadedPage|null>(null);
    const [failure,setFailure]=useState<{page:number;paper:PaperTheme;message:string}|null>(null),[retry,setRetry]=useState(0);
    const [translation,setTranslation]=useState<{page:number;values:Map<number,string>}>({page:0,values:new Map()});
    const [selection,setSelection]=useState<VerseSelection|null>(null),[word,setWord]=useState<MushafWord|null>(null);
    const [selectingPassage,setSelectingPassage]=useState(false),[passageStart,setPassageStart]=useState<{key:string;page:number}|null>(null);
    const [heldWord,setHeldWord]=useState<MushafWord|null>(null);
    const [share,setShare]=useState<Ayah|null>(null),[details,setDetails]=useState<Ayah|null>(null);
    useEffect(()=>{if(split&&(word||details))useLayoutPreferences.getState().update('reader',{tab:'understand'});},[split,word?.key,details?.number]);
    const [panel,setPanel]=useState<'legend'|'about'|'settings'|'tools'|'audio'|'notes'|'range'|'page'|'review'|'coach'|'selection-details'|'layout'|null>(null);
    const [menu,setMenu]=useState(false),[search,setSearch]=useState(false),[immersive,setImmersive]=useState(false);
    const immersiveControls=useImmersiveControls(immersive,!!word||!!selection||!!panel||!!details||live.active||selectingPassage);
    const wakeOnly=useRef(false);
    const [jumpPage,setJumpPage]=useState(page);
    const [range,setRange]=useState({surah:1,start:1,end:1,repetitions:3});
    const [shownPage,setShownPage]=useState(page);
    if(shownPage!==page){setShownPage(page);setLessonExercise(null);setLessonFound([]);setPracticeVerse(null);setWord(null);setSelection(null);setDetails(null);setShare(null);setPanel(null);setPractice(false);setPracticeAdded(false);setRevealed(new Set());}
    const [chosenRange,setChosenRange]=useState<WordRange|null>(null);
    const [selectionPages,setSelectionPages]=useState<InteractivePage[]>([]),[selectionLoading,setSelectionLoading]=useState(false);
    const selectionLoadRequest=useRef(0);
    const [rangeAudioBusy,setRangeAudioBusy]=useState(false),[selectionError,setSelectionError]=useState('');
    const rangeAudioRequest=useRef(0);
    const [savedAudio,setSavedAudio]=useState(loadReaderAudioSession);
    const [undoAudio,setUndoAudio]=useState<ReaderAudioSession|null>(null);
    const pendingResume=useRef<ReaderAudioSession|null>(null);
    const [stopBoundary,setStopBoundary]=useState<AudioStopBoundary>('none');
    useEffect(()=>{if(!undoAudio)return;const t=setTimeout(()=>setUndoAudio(null),10000);return()=>clearTimeout(t);},[undoAudio]);
    useEffect(()=>{rangeAudioRequest.current++;setRangeAudioBusy(false);setSelectionError('');return()=>{rangeAudioRequest.current++;};},[page]);
    const [annotation,setAnnotation]=useState<Ayah|null>(null);
    const notes=useReaderNotesStore(s=>s.notes);
    const pendingFacing=useRef<{page:number;word:MushafWord;action:'play'|'options';selection?:VerseSelection}|null>(null);
    const [size,setSize]=useState({width:600,height:860});
    const spread=!split&&bookSpread&&canShowBookSpread(size.width,size.height)&&!practice&&!lessonExercise;
    const facingPage=page%2===1?page+1:page-1;
    const viewport=useRef<HTMLDivElement>(null);
    const favorites=useFavoritesStore();
    const bookmark=useReadingBookmarkStore(s=>s.bookmark);
    const [bookmarkSaved,setBookmarkSaved]=useState(false);
    const [returnPoint,setReturnPoint]=useState<{page:number;surah:number;ayah:number;scroll:number}|null>(null);
    const restoreScroll=useRef<{page:number;top:number}|null>(null);
    const [audioOrigin,setAudioOrigin]=useState<string|null>(null);
    const turnRequest=useRef(0),turnPreparing=useRef(false);
    const [turnError,setTurnError]=useState('');
    useEffect(()=>{if(!bookmarkSaved)return;const timer=setTimeout(()=>setBookmarkSaved(false),2400);return()=>clearTimeout(timer);},[bookmarkSaved]);
    useEffect(()=>{if(!returnPoint)return;const timer=setTimeout(()=>setReturnPoint(null),90000);return()=>clearTimeout(timer);},[returnPoint]);
    useEffect(()=>{if(surahs.length===0)void fetchSurahs().then(setSurahs).catch(()=>{});},[surahs.length,setSurahs]);
    const data=bundle?.data.page===page&&bundle.paper===paper?bundle.data:null;
    const font=data?bundle!.font:UNICODE_PAGE_FONT;
    const ayahs=bundle?.data.page===page?bundle.data.verses:EMPTY_AYAHS;
    const selectionPageData=useMemo(()=>{
        const pages=new Map(selectionPages.map(item=>[item.page,item]));
        if(data&&!pages.has(data.page))pages.set(data.page,data);
        return [...pages.values()].sort((a,b)=>a.page-b.page);
    },[selectionPages,data]);
    const selectionWords=useMemo(()=>chosenRange?selectedWords(selectionPageData.flatMap(item=>item.words),chosenRange):[],[chosenRange,selectionPageData]);
    const selectionVerses=useMemo(()=>{
        const verses=new Map<number,Ayah>();
        for(const item of selectionPageData)for(const verse of item.verses)verses.set(verse.number,verse);
        return [...verses.values()].sort((a,b)=>a.number-b.number);
    },[selectionPageData]);
    const selectedStartVerse=selectionWords.length?selectionVerses.find(v=>`${v.surah}:${v.numberInSurah}`===selectionWords[0].verseKey):undefined;
    const selectedEndWord=selectionWords.at(-1);
    const selectedEndVerse=selectedEndWord?selectionVerses.find(v=>`${v.surah}:${v.numberInSurah}`===selectedEndWord.verseKey):undefined;
    const selectionSameSurah=!!selectedStartVerse&&!!selectedEndVerse&&selectedStartVerse.surah===selectedEndVerse.surah;
    const error=failure?.page===page&&failure.paper===paper?failure.message:'';
    const audioNext=useCallback(()=>{
        const q=useQuranStore.getState();
        if(q.currentPage<604)q.setCurrentPage(q.currentPage+1); // Audio navigation is not evidence of silent reading.
    },[]);
    const onPassageAyah=useCallback((verse:Ayah)=>{
        const q=useQuranStore.getState();
        if(q.currentPage!==verse.page)q.setCurrentPage(verse.page);
        useQuranStore.setState({currentSurah:verse.surah,currentAyah:verse.numberInSurah});
    },[]);
    const audio=useMushafAudio({rememberSession:true,selectedReciter,pageAyahs:ayahs,currentPage:page,nextPage:audioNext,nextSurah:audioNext,pageMode:true,onPassageAyah,recitationMode,recitationDelay});
    const stopAudio=audio.stopAudio,hasRecitationPause=!!audio.recitationPause;
    const closeSelection=useCallback(()=>setSelection(null),[]);
    const press=useVersePress(setSelection,page);
    const positions=useMemo(()=>{
        if(!data||!font.family)return [];
        const ctx=document.createElement('canvas').getContext('2d');if(!ctx)return [];
        ctx.direction='rtl';
        const displayGlyph=font.mode==='unicode'?unicodeWord:(word:MushafWord)=>word.glyph;
        return composePage(data,(glyph,fontSize)=>{ctx.font=`${fontSize}px ${font.family}`;return ctx.measureText(glyph).width;},displayGlyph);
    },[data,font]);
    const ready=!!data&&positions.length>0;

    const bookTurn=useBookPageTurn(viewport,page,ready);
    useEffect(()=>{bookTurn.clear();},[pupitre.layout,bookTurn.clear]);
    useEffect(()=>{
        if(data&&pendingReview.current?.page===page){const key=pendingReview.current.key;pendingReview.current=null;setWord(data.words.find(w=>w.key===key)||null);}
    },[data,page]);
    useKhatmReading({page,ready:ready&&!word&&!audio.audioPlaying&&!practice&&!lessonExercise&&!audio.recitationPause,surah:currentSurah,ayah:currentAyah});
    const turn=async(delta:number,velocity?:number)=>{
        const next=spread?(Math.floor((page-1)/2)*2+1)+delta*2:page+delta;if(!isInteractivePage(next)||!ready||(bookTurn.turning&&!bookTurn.dragging)||turnPreparing.current)return;
        const request=++turnRequest.current;turnPreparing.current=true;setTurnError('');
        wordPlayback.cancel();audio.stopAudio();setWord(null);setSelection(null);setDirection(delta);
        try {
            // Prepare the next page before exposing it under the turning sheet.
            const loaded=await loadInteractivePage(next);
            await Promise.race([loadPageFont(next,paper,pageFontSamples(loaded.words)).catch(()=>null),new Promise(resolve=>setTimeout(resolve,1600))]);
            if(request!==turnRequest.current||useQuranStore.getState().currentPage!==page){bookTurn.clear();return;}
            if(!bookTurn.begin(next,delta))return;
            if(velocity!==undefined)bookTurn.release(velocity);
            useQuranStore.getState().setCurrentPage(next,{reading:!practice});
        }catch{bookTurn.cancel();if(request===turnRequest.current)setTurnError('Cette page n’a pas pu être chargée. Réessayez.');}
        finally{if(request===turnRequest.current)turnPreparing.current=false;}
    };
    const rememberJump=(target:number)=>{
        if(target===page)return;
        wordPlayback.cancel();audio.stopAudio();bookTurn.clear();turnRequest.current++;turnPreparing.current=false;
        setReturnPoint(previous=>previous??{page,surah:currentSurah,ayah:currentAyah,scroll:viewport.current?.scrollTop||0});
    };
    const returnToReading=()=>{
        if(!returnPoint)return;const point=returnPoint;audio.stopAudio();bookTurn.clear();setReturnPoint(null);
        restoreScroll.current={page:point.page,top:point.scroll};
        useQuranStore.getState().goToAyah(point.surah,point.ayah,point.page,{silent:true});
    };
    const pageMarked=bookmark?.page===page&&bookmark.view==='tajweed-interactive';
    const savePageBookmark=(ribbonLength:number)=>{
        if(pageMarked&&bookmark){useReadingBookmarkStore.getState().save({...bookmark,ribbonLength});return;}
        const verse=ayahs.find(a=>a.surah===currentSurah&&a.numberInSurah===currentAyah)||ayahs[0];
        if(!verse)return;
        useReadingBookmarkStore.getState().save({page,surah:verse.surah,ayah:verse.numberInSurah,view:'tajweed-interactive',precision:'verse',ribbonLength});
        setBookmarkSaved(true);
    };
    const {anchoredZoom,offset,handlers}=usePageGestures(viewport,zoom,setZoom,turn,{
        preview:(delta,progress,tilt)=>{const target=spread?(Math.floor((page-1)/2)*2+1)+delta*2:page+delta;if(ready&&isInteractivePage(target)&&!turnPreparing.current)bookTurn.scrub(target,delta,progress,tilt);},
        end:(delta,commit,velocity)=>{bookTurn.release(velocity);if(commit)void turn(delta);else bookTurn.cancel();}
    });
    const scale=split?Math.min(Math.max(1,size.width-24)/600,1.25)*zoom:readerPageScale(size.width,size.height,spread,immersive,zoom);
    const versoPages=[...new Set([bookTurnPages(page,1,spread).back,bookTurnPages(page,-1,spread).back,bookTurn.backPage].filter((p):p is number=>p!==null&&isInteractivePage(p)))];
    const verseFor=(value:MushafWord)=>ayahs.find(a=>`${a.surah}:${a.numberInSurah}`===value.verseKey)!;
    const selectVerse=(verse:Ayah)=>useQuranStore.setState({currentSurah:verse.surah,currentAyah:verse.numberInSurah});
    const playVerse=(verse:Ayah,repetitions=1)=>{setWord(null);setAudioOrigin(`${verse.surah}:${verse.numberInSurah}`);audio.startPassage(verse.numberInSurah,verse.numberInSurah,repetitions,verse.surah);};
    const continueFrom=(verse:Ayah,start?:WordRecitationStart)=>{
        const index=ayahs.findIndex(value=>value.number===verse.number);if(index<0)return;
        const previous=audio.snapshot();if(previous)setUndoAudio(previous);
        setWord(null);setSelection(null);setDetails(null);setRecitationMode(false);setPractice(false);setLessonExercise(null);
        setSavedAudio(null);setAudioOrigin(`${verse.surah}:${verse.numberInSurah}`);selectVerse(verse);applyStopBoundary(stopBoundary,verse);void audio.startContinuousAt(index,start);
    };
    const wordPlayback=useWordPlayback(page,selectedReciter,live.active,(value,start)=>{const verse=verseFor(value);if(verse)continueFrom(verse,start);});
    const stopPlayback=()=>{wordPlayback.cancel();rangeAudioRequest.current++;setRangeAudioBusy(false);audio.stopAudio();setSavedAudio(loadReaderAudioSession());};
    const holdWord=(value:MushafWord,selected:VerseSelection)=>{wordPlayback.cancel();selectionLoadRequest.current++;setSelectionLoading(false);setSelectingPassage(false);setPassageStart(null);setChosenRange(null);setSelectionPages([]);setHeldWord(value);if(value.kind==='word'){selectVerse(selected.ayah);setWord(value);setSelection(null);}else{setWord(null);setSelection(selected);}};
    useEffect(()=>{
        const pending=pendingFacing.current;if(!ready||pending?.page!==page)return;
        pendingFacing.current=null;
        const value=data?.words.find(w=>w.key===pending.word.key);if(!value)return;
        if(pending.action==='options'&&pending.selection)holdWord(value,pending.selection);
        else void wordPlayback.play(value);
    }); // Actions consume the newly loaded page, never the previous page's verse list.
    const openWord=(value:MushafWord)=>{selectVerse(verseFor(value));setWord(value);};
    const selectAdjacentWord=(delta:number)=>{
        if(!word||!data)return;const list=data.words.filter(w=>w.kind==='word'),index=list.findIndex(w=>w.key===word.key);
        if(list[index+delta])openWord(list[index+delta]);
    };
    useEffect(()=>{
        if(!isInteractivePage(page))return;
        let cancelled=false;
        const load=async()=>{
            const loaded=await loadInteractivePage(page);
            let opening:InteractivePage|null=null;
            if(loaded.layout.some(l=>l.type==='basmala')){
                opening=page===1?loaded:await loadInteractivePage(1);
            }
            if(cancelled)return;
            const openingWords=opening?.words.filter(w=>w.verseKey==='1:1'&&w.kind==='word')||[];
            const basmala:LoadedPage['basmala']=opening?{font:UNICODE_PAGE_FONT,glyphs:openingWords.map(w=>w.glyph).join(''),text:openingWords.map(w=>w.text).join(' ')}:null;
            // Put readable Arabic on screen first. Color fonts are upgraded only after the
            // browser proves it can actually paint their glyphs.
            setBundle({data:loaded,font:UNICODE_PAGE_FONT,basmala,paper});setFailure(null);
            const current=useQuranStore.getState();
            const selected=loaded.verses.find(v=>v.surah===current.currentSurah&&v.numberInSurah===current.currentAyah)||loaded.verses[0];
            useQuranStore.setState({pageAyahs:loaded.verses,currentSurah:selected.surah,currentAyah:selected.numberInSurah});
            const pageFont=loadPageFont(page,paper,pageFontSamples(loaded.words)).catch(()=>UNICODE_PAGE_FONT);
            const openingFont=opening?(page===1?pageFont:loadPageFont(1,paper,pageFontSamples(opening.words)).catch(()=>UNICODE_PAGE_FONT)):Promise.resolve(null);
            void Promise.all([pageFont,openingFont]).then(([font,firstFont])=>{
                if(cancelled)return;
                setBundle(previous=>previous?.data.page===page&&previous.paper===paper?{
                    ...previous,font,
                    basmala:previous.basmala&&firstFont?{...previous.basmala,font:firstFont}:previous.basmala
                }:previous);
            });
            prepareNextPage(page+1,paper);prepareNextPage(page-1,paper);
        };
        void load().catch(()=>{if(!cancelled)setFailure({page,paper,message:'La page n’a pas pu être chargée. Vérifiez votre connexion puis réessayez.'});});
        void loadInteractivePage(page).then(async loaded=>{
            const values=await Promise.all([...new Set(loaded.verses.map(v=>v.surah))].map(surah=>fetchSurahTranslation(surah,'fr')));
            if(!cancelled)setTranslation({page,values:new Map(values.flatMap(v=>[...v]))});
        }).catch(()=>{});
        return()=>{cancelled=true;};
    },[page,paper,retry]);
    useEffect(()=>{
        const busy=!!word||practice||!!lessonExercise||!!selection||!!panel||menu||search;
        useCompanionRuntimeStore.getState().setBusy('interactive-reader-study',busy);
        return()=>useCompanionRuntimeStore.getState().setBusy('interactive-reader-study',false);
    },[word,practice,lessonExercise,selection,panel,menu,search]);
    useEffect(()=>{
        if(location.pathname!=='/read'||!ready||!data||live.active||consumedCoachEntry.current===location.key)return;
        const target=readerCoachTarget(new URLSearchParams(location.search));
        if(!target)return;
        const verse=data.verses.find(v=>v.surah===target.surah&&v.numberInSurah===target.ayah);
        if(!verse)return;
        consumedCoachEntry.current=location.key;
        stopAudio();setWord(null);setSelection(null);setPanel(null);setImmersive(false);setPractice(false);setLessonExercise(null);
        selectVerse(verse);
        if(target.task==='practice'){setPracticeVerse(`${target.surah}:${target.ayah}`);setPractice(true);setRevealed(new Set());setPracticeAdded(false);}
        if(target.task==='repeat'){setRange({surah:target.surah,start:target.ayah,end:target.ayah,repetitions:3});setPanel('range');}
        if(target.task==='understand')setDetails(verse);
        const raf=requestAnimationFrame(()=>viewport.current?.querySelector(`[data-verse-key="${target.surah}:${target.ayah}"]`)?.scrollIntoView({block:'center',inline:'center',behavior:'smooth'}));
        return()=>cancelAnimationFrame(raf);
    },[location.key,location.pathname,location.search,ready,data,live.active,stopAudio]);
    useEffect(()=>{
        const el=viewport.current;if(!el)return;
        const measure=()=>{const css=getComputedStyle(el);setSize({
            width:Math.max(240,el.clientWidth-parseFloat(css.paddingLeft)-parseFloat(css.paddingRight)),
            height:Math.max(180,el.clientHeight-parseFloat(css.paddingTop)-parseFloat(css.paddingBottom))
        });};
        const observer=new ResizeObserver(measure);measure();
        observer.observe(el);return()=>observer.disconnect();
    },[immersive]);
    useEffect(()=>{
        document.body.classList.toggle('iq-immersive-active',immersive&&location.pathname==='/read');
        return()=>document.body.classList.remove('iq-immersive-active');
    },[immersive,location.pathname]);
    useEffect(()=>{
        if(immersive&&audio.audioActive)setShowTranslation(true);
    },[immersive,audio.audioActive,setShowTranslation]);
    useEffect(()=>{
        const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){setWord(null);setImmersive(false);}};
        window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape);
    },[]);
    useEffect(()=>()=>{rangeRequest.current++;},[]);
    useEffect(()=>{rangeRequest.current++;setRangeBusy(false);setRangeError('');},[panel,page]);
    useEffect(()=>{if(location.pathname!=='/read'){setWord(null);bookTurn.clear();turnRequest.current++;turnPreparing.current=false;}},[location.pathname,bookTurn.clear]);
    useEffect(()=>()=>{turnRequest.current++;},[]);
    useEffect(()=>{
        if(!word)return;
        const raf=requestAnimationFrame(()=>{
            const root=viewport.current,el=root?.querySelector<HTMLElement>(`[data-word-key="${word.key}"]`);if(!root||!el)return;
            const r=root.getBoundingClientRect(),w=el.getBoundingClientRect();
            const card=root.parentElement?.querySelector<HTMLElement>('.iq-word-card');
            const visibleBottom=Math.min(r.bottom,(card?.getBoundingClientRect().top??r.bottom)-12);
            root.scrollBy({top:(w.top+w.bottom)/2-(r.top+visibleBottom)/2,behavior:'smooth'});
        });return()=>cancelAnimationFrame(raf);
    },[word]);
    useEffect(()=>{
        const el=viewport.current;if(el){el.scrollTop=ready&&restoreScroll.current?.page===page?restoreScroll.current.top:0;el.scrollLeft=Math.max(0,(el.scrollWidth-el.clientWidth)/2);if(ready)restoreScroll.current=null;}
    },[page,ready]);
    const studyParams=new URLSearchParams(location.search);
    const requestedPosition=Number(studyParams.get('studyWord'));
    const studyPosition=Number(studyParams.get('surah'))===currentSurah&&Number(studyParams.get('ayah'))===currentAyah&&Number.isInteger(requestedPosition)&&requestedPosition>0?requestedPosition:0;
    const entryVerse = useVerseEntry(viewport, ayahs, ready, location.pathname === '/read' && !live.active, studyPosition);
    const previousWidth=useRef(size.width);
    useEffect(()=>{
        if(previousWidth.current===size.width&&!immersive)return;
        previousWidth.current=size.width;
        const el=viewport.current;if(el)el.scrollLeft=Math.max(0,(el.scrollWidth-el.clientWidth)/2);
    },[size.width,immersive]);
    // Preserve the exact selected verse independently of a manually placed bookmark.
    useEffect(()=>{
        if(!ready||live.active||audio.audioPlaying||practice||word||hasRecitationPause)return;
        const timer=setTimeout(()=>{if(!document.hidden&&location.pathname==='/read')useQuranStore.getState().updateProgress();},15000);
        return()=>clearTimeout(timer);
    },[ready,page,currentSurah,currentAyah,live.active,audio.audioPlaying,location.pathname,practice,word,hasRecitationPause]);
    const trackedWord=useMemo(()=>{
        if(!data)return null;
        if(live.position){
            const p=live.position,words=data.words.filter(w=>w.verseKey===`${p.surah}:${p.ayah}`&&w.kind==='word');
            const index=liveWordIndex(words.map(w=>w.text),p.words,p.surah,p.ayah,p.wordIndex);
            return index===null?null:words[index]?.key||null;
        }
        if(audio.audioPlaying&&audio.activeWordIndex>=0){
            const verse=ayahs.find(v=>v.number===audio.currentPlayingAyah);if(!verse)return null;
            const key=`${verse.surah}:${verse.numberInSurah}`,timings=audio.verseWordsMap.get(key);
            const words=data.words.filter(w=>w.verseKey===key&&w.kind==='word');
            // Never highlight a guessed word when source tokenization/timestamps disagree.
            if(!timings||!timings.words.some(w=>w.timestampTo>w.timestampFrom))return null;
            const index=liveWordIndex(words.map(w=>w.text),timings.words.map(w=>w.text),verse.surah,verse.numberInSurah,audio.activeWordIndex);
            return index===null?null:words[index]?.key||null;
        }
        return null;
    },[data,live.position,audio.audioPlaying,audio.activeWordIndex,audio.currentPlayingAyah,audio.verseWordsMap,ayahs]);
    useEffect(()=>{
        if(!trackedWord||zoom===1)return;
        const root=viewport.current,el=root?.querySelector<HTMLElement>(`[data-word-key="${trackedWord}"]`);if(!root||!el)return;
        const r=root.getBoundingClientRect(),w=el.getBoundingClientRect();
        if(w.top<r.top+25||w.bottom>r.bottom-25||w.left<r.left||w.right>r.right)el.scrollIntoView({block:'center',inline:'center',behavior:'smooth'});
    },[trackedWord,zoom]);
    const adoptFacing=(value:MushafWord,action:'play'|'options',selection?:VerseSelection)=>{stopPlayback();bookTurn.clear();pendingFacing.current={page:facingPage,word:value,action,selection};const [surah,ayah]=value.verseKey.split(':').map(Number);useQuranStore.getState().goToAyah(surah,ayah,facingPage,{silent:true});};
    const noteVerse=(n:ReaderNote):Ayah=>({number:CHAPTERS[n.surah-1].offset+n.ayah,numberInSurah:n.ayah,surah:n.surah,page:n.page,text:'',juz:getJuzForPage(n.page)?.number||1,hizbQuarter:1});
    const pageNotes=Object.values(notes).filter(n=>n.page===page);
    const noteLines=[...new Set(pageNotes.map(n=>data?.words.find(w=>w.verseKey===`${n.surah}:${n.ayah}`)?.line).filter((n):n is number=>!!n))];
    const title=CHAPTERS[(ayahs[0]?.surah||currentSurah)-1];
    const rangeAyahs=Array.from({length:CHAPTERS[range.surah-1].count},(_,i)=>i+1);
    const applyStopBoundary=(boundary:AudioStopBoundary,verse?:Ayah)=>{
        setStopBoundary(boundary);
        const v=verse||ayahs.find(a=>a.number===audio.currentPlayingAyah)||ayahs.find(a=>a.surah===currentSurah&&a.numberInSurah===currentAyah)||ayahs[0];
        audio.setStopAt(!v||boundary==='none'?null:boundary==='verse'?v.number:boundary==='page'?ayahs.at(-1)!.number:CHAPTERS[v.surah-1].offset+CHAPTERS[v.surah-1].count);
    };
    const resumeAudio=(saved:ReaderAudioSession)=>{
        stopPlayback();setUndoAudio(null);setWord(null);setSelection(null);setPanel(null);setRecitationMode(false);
        pendingResume.current=saved;setSavedAudio(null);setReciter(saved.reciter);
        setStopBoundary(saved.stopAt===null?'none':saved.stopAt===CHAPTERS[saved.verse.surah-1].offset+CHAPTERS[saved.verse.surah-1].count?'surah':saved.stopAt===saved.verse.number?'verse':'page');
        useQuranStore.getState().goToAyah(saved.verse.surah,saved.verse.numberInSurah,saved.verse.page,{silent:true});
    };
    useEffect(()=>{const saved=pendingResume.current;if(!saved||!ready||page!==saved.verse.page||selectedReciter!==saved.reciter)return;
        pendingResume.current=null;setAudioOrigin(`${saved.verse.surah}:${saved.verse.numberInSurah}`);void audio.restoreSession(saved);
    });
    const playSelection=async(repetitions:number,wholeVerses=false)=>{
        if(!chosenRange||selectionLoading)return;
        const first=selectionWords[0],last=selectionWords.at(-1);if(!first||!last)return;
        const firstVerse=selectionVerses.find(v=>`${v.surah}:${v.numberInSurah}`===first.verseKey),lastVerse=selectionVerses.find(v=>`${v.surah}:${v.numberInSurah}`===last.verseKey);
        if(!firstVerse||!lastVerse)return;
        wordPlayback.cancel();
        const request=++rangeAudioRequest.current;setRangeAudioBusy(true);setSelectionError('');
        let timeout:ReturnType<typeof setTimeout>|undefined;
        try{
            const verses=selectionVerses.filter(v=>v.number>=firstVerse.number&&v.number<=lastVerse.number);
            if(firstVerse.surah!==lastVerse.surah)throw new Error('L’écoute d’un passage doit rester dans une même sourate.');
            if(wholeVerses){if(!audio.startPassageFromAyahs(verses,repetitions))throw new Error('Impossible de préparer ces versets.');return;}
            const id=mushafReciter(selectedReciter).quranComId;
            const [a,b]=await Promise.race([Promise.all([fetchVerseRecitation(first.verseKey,id),first.verseKey===last.verseKey?Promise.resolve(null):fetchVerseRecitation(last.verseKey,id)]),new Promise<never>((_,reject)=>{timeout=setTimeout(()=>reject(new Error('Les repères audio sont indisponibles. Réessayez ou écoutez les versets entiers.')),8000);})]);
            if(request!==rangeAudioRequest.current)return;
            const endSource=first.verseKey===last.verseKey?a:b;
            const begin=wordRecitationStart(a,first.position),end=wordRecitationStart(endSource,last.position),endTime=endSource?.timings.words.find(w=>w.position===last.position)?.timestampTo;
            if(!begin||!end||!endTime)throw new Error('Ce récitateur ne dispose pas des repères nécessaires pour ce découpage. Choisissez une autre voix ou les versets entiers.');
            setSavedAudio(null);setStopBoundary('none');
            if(!audio.startPassageFromAyahs(verses,repetitions,{start:begin,end,endTime:endTime/1000}))throw new Error('Sélectionnez un passage dans une même sourate.');
        }catch(error){if(request===rangeAudioRequest.current)setSelectionError(error instanceof Error?error.message:'Écoute indisponible.');}
        finally{if(timeout)clearTimeout(timeout);if(request===rangeAudioRequest.current)setRangeAudioBusy(false);}
    };
    const startRange=async()=>{
        const request=++rangeRequest.current;setRangeBusy(true);setRangeError('');
        try{
            const loaded=await fetchSurah(range.surah);
            if(request!==rangeRequest.current)return;
            const verses=loaded.ayahs.filter(a=>a.numberInSurah>=range.start&&a.numberInSurah<=range.end).map(a=>({...a,page:pageForVerse(a.surah,a.numberInSurah)||a.page}));
            if(verses.length!==range.end-range.start+1||!audio.startPassageFromAyahs(verses,range.repetitions))throw new Error('range');
            setPanel(null);
        }catch{if(request===rangeRequest.current)setRangeError('Impossible de préparer ce passage. Vérifiez la connexion puis réessayez.');}
        finally{if(request===rangeRequest.current)setRangeBusy(false);}
    };
    const startPractice=()=>{audio.stopAudio();setWord(null);setSelection(null);setPanel(null);setPracticeVerse(null);setLessonExercise(null);setPractice(true);setRevealed(new Set());setPracticeAdded(false);};
    const revealWord=(value:MushafWord)=>setRevealed(old=>revealPracticeWords(data?.words||[],value,revealMode,old));
    const togglePassageSelection=()=>{
        if(selectingPassage){setSelectingPassage(false);setPassageStart(null);setChosenRange(null);setSelectionPages([]);setSelectionError('');selectionLoadRequest.current++;setSelectionLoading(false);return;}
        stopPlayback();setWord(null);setSelection(null);setPanel(null);setChosenRange(null);setPassageStart(null);setSelectionPages([]);setSelectionError('');setSelectingPassage(true);
    };
    const selectPassageWord=async(value:MushafWord)=>{
        if(value.kind!=='word'||!data)return;
        if(!passageStart){setPassageStart({key:value.key,page});setChosenRange({start:value.key,end:value.key,startPage:page,endPage:page});setSelectionPages([data]);setSelectionError('');return;}
        const start=passageStart,firstPage=Math.min(start.page,page),lastPage=Math.max(start.page,page);
        if(lastPage-firstPage+1>12){setSelectionError('Un passage peut couvrir jusqu’à 12 pages. Choisissez une fin plus proche.');return;}
        const request=++selectionLoadRequest.current;setSelectionLoading(true);setSelectionError('');
        setChosenRange({start:start.key,end:value.key,startPage:start.page,endPage:page});
        try{
            const cached=new Map(selectionPages.map(item=>[item.page,item]));if(data)cached.set(data.page,data);
            const loaded=await Promise.all(Array.from({length:lastPage-firstPage+1},(_,index)=>firstPage+index).map(async target=>cached.get(target)||loadInteractivePage(target)));
            if(request===selectionLoadRequest.current){setSelectionPages(loaded);setPassageStart(null);}
        }catch{
            if(request===selectionLoadRequest.current){setSelectionError('Impossible de charger toutes les pages du passage. Réessayez en sélectionnant son début puis sa fin.');setPassageStart(start);}
        }finally{if(request===selectionLoadRequest.current)setSelectionLoading(false);}
    };
    const clearPassageSelection=()=>{setSelectingPassage(false);setPassageStart(null);setChosenRange(null);setSelectionPages([]);selectionLoadRequest.current++;setSelectionLoading(false);rangeAudioRequest.current++;setRangeAudioBusy(false);setSelectionError('');};
    const tapWord=(value:MushafWord)=>{if(selectingPassage){if(!selectionLoading)void selectPassageWord(value);return;}if(lessonExercise){if(matchesPageLesson(value,lessonExercise)){setLessonFound(old=>[...new Set([...old,value.key])]);setLessonFeedback('Bien repéré : ce mot contient un segment de cette règle.');}else setLessonFeedback('Cette règle n’est pas balisée sur ce mot. Essayez un autre mot.');return;}if(practice&&value.kind==='word'&&(!practiceVerse||practiceVerse===value.verseKey)&&!revealed.has(value.key))revealWord(value);else if(chosenRange){if(value.kind==='word')setChosenRange({...chosenRange,end:value.key,endPage:page});}else {setWord(null);setSelection(null);void wordPlayback.play(value);}};
    const reviewPage=()=>{ayahs.filter(v=>!practiceVerse||`${v.surah}:${v.numberInSurah}`===practiceVerse).forEach(v=>useSRSStore.getState().addCard(v.surah,v.numberInSurah));setPracticeAdded(true);};
    const openRange=()=>{setRange({surah:currentSurah,start:currentAyah,end:currentAyah,repetitions:3});setPanel('range');};
    const resumeCoachReturn=()=>{
        const point=coachInbox.returnPoint;if(!point)return;
        audio.stopAudio();setPractice(false);setLessonExercise(null);setWord(null);setDetails(null);setPanel(null);coachInbox.clearReturn();
        navigate('/read',{replace:true});useQuranStore.getState().goToAyah(point.surah,point.ayah,point.page,{silent:true});setViewMode(point.view);
    };
    const focusedVerse=word?word.verseKey.split(':').map(Number):selection?[selection.ayah.surah,selection.ayah.numberInSurah]:audio.audioActive?[audio.currentSurahRef.current,audio.currentAyahRef.current]:[currentSurah,currentAyah];
    const translationVerse=audio.audioActive?[audio.currentSurahRef.current,audio.currentAyahRef.current]:live.active&&live.passage?[live.passage.surah,live.passage.ayah]:focusedVerse;
    const togglePlayback=()=>{if(audio.audioActive)audio.toggleAudio();};
    const audioPauseLabel=wordPlayback.preparing?'Préparation de l’écoute':audio.recitationPause?(audio.recitationPause.paused?'Reprendre le temps de récitation':'Suspendre le temps de récitation'):audio.audioPlaying?'Mettre en pause':audio.audioActive?'Reprendre la lecture':'Touchez un mot pour écouter';
    const audioIsRunning=audio.audioPlaying||!!audio.recitationPause&&!audio.recitationPause.paused;
    const translationMap=translation.page===page?translation.values:new Map<number,string>();
    const audioBehavior=audio.passage?`${audio.passageComplete?'Terminé · ':''}${audio.passage.repetitions>1?`Répétition ${audio.passage.iteration}/${audio.passage.repetitions}`:chosenRange?'Passage sélectionné':audio.passage.startAyah===audio.passage.endAyah?'Verset seul':'Passage'} · ${audio.passage.surah}:${audio.passage.startAyah}${audio.passage.endAyah!==audio.passage.startAyah?`–${audio.passage.endAyah}`:''}`:`${recitationMode?'Écoute, puis récite':'Lecture continue'}${audioOrigin?` depuis ${audioOrigin}`:''}`;
    const palette=paper==='dark'?1:paper==='sepia'?2:0;
    const paletteFamilies=[bundle?.font,bundle?.basmala?.font].filter((f):f is PageFont=>!!f&&f.mode==='colrv1').map(f=>f.family);
    return <Pupitre title="Mushaf" documentKey={`reader:${page}`} toolbar={false} layoutState={pupitre} enabled={location.pathname==='/read'} onPointerDownCapture={event=>{wakeOnly.current=!split&&immersiveControls.hidden;immersiveControls.wake();if(wakeOnly.current)event.stopPropagation();}} onPointerUpCapture={event=>{if(wakeOnly.current)event.stopPropagation();}} onClickCapture={event=>{if(wakeOnly.current){wakeOnly.current=false;event.preventDefault();event.stopPropagation();}}} onKeyDownCapture={immersiveControls.wake} className={`iq-reader  iq-paper-${paper} ${immersive?'iq-immersive':''} ${bookTurn.turning?'iq-is-turning':''}`} style={{'--iq-edge-inset':`${spread?0:Math.max(0,(600*scale-size.width)/2)}px`,'--iq-entry':`${-direction*24}px`,'--iq-drag':`${offset}px`} as CSSProperties}>
        <style>{[...new Set(paletteFamilies)].map(f=>`@font-palette-values --palette-${f} {font-family:'${f}';base-palette:${palette};}`).join('\n')}</style>
        <PupitreTop aria-label="Page du Mushaf"><header className="iq-toolbar mih-header" inert={immersive&&!split}>
            <div className="mih-header-left">
                <button className="mih-header__icon-btn" aria-label="Menu" onClick={()=>setMenu(true)}><Menu size={20}/></button>
                <button className="mih-header__info" aria-label="Choisir une sourate ou un verset" onClick={()=>setSearch(true)}>
                    <span className="mih-header__surah-name">{title?.latin}</span>
                    <span className="mih-header__page-num">{spread?`Pages ${Math.floor((page-1)/2)*2+1}–${Math.floor((page-1)/2)*2+2}`:`Page ${page}`} · Juz {getJuzForPage(page)?.number||1}</span>
                </button>
            </div>
            <div className="mih-header-right iq-header-actions">
                <button className="mih-toolbar__btn" aria-label="Choisir la disposition" title="Disposition de lecture" aria-haspopup="dialog" onClick={()=>setPanel('layout')}><PanelsTopLeft size={20}/></button>
                <FindButton className="reader-find-button"/>
                {(!immersive||split)&&<div className="reader-voice-host" ref={onVoiceHost}/>}
                <button className={`mih-toolbar__btn ${panel==='settings'?'active':''}`} aria-label="Plus de commandes" aria-haspopup="dialog" aria-expanded={panel==='settings'} onClick={()=>setPanel('settings')}><MoreHorizontal size={21}/></button>
            </div>
        </header>
        {audio.recitationPause&&<section className="iq-recitation-turn" aria-label="À vous de réciter"><div><strong>{audio.recitationPause.paused?'Récitation en pause':'À vous de réciter'}</strong><span>Verset {audio.currentSurahRef.current}:{audio.currentAyahRef.current} · <span className="iq-recite-seconds">{Math.ceil(audio.recitationPause.remaining)} s</span></span></div><progress max={audio.recitationPause.total} value={audio.recitationPause.remaining} aria-label="Temps pour réciter"/><div className="iq-recite-actions"><button onClick={audio.repeatCurrentAyah}><RotateCcw size={15}/>Encore une fois</button><button aria-label={audioPauseLabel} onClick={audio.toggleAudio}>{audio.recitationPause.paused?<Play size={15}/>:<Pause size={15}/>}</button><button onClick={audio.finishRecitation}>Suivant<ChevronRight size={15}/></button><button aria-label="Arrêter la séance" onClick={stopPlayback}><X size={15}/></button></div></section>}
        {lessonExercise&&<section className="iq-lesson-exercise" aria-label="Repérage Tajwid"><div><strong>{pageLessons(data?.words||[]).find(l=>l.id===lessonExercise)?.name}</strong><span>Touchez un mot qui contient cette règle · {lessonFound.length} repéré{lessonFound.length>1?'s':''}</span></div><button onClick={()=>{const example=data?.words.find(w=>matchesPageLesson(w,lessonExercise)&&!lessonFound.includes(w.key));if(example){setLessonFound(old=>[...old,example.key]);setLessonFeedback('Exemple montré : observez le segment dans sa fiche.');openWord(example);}}}>Voir un exemple</button><button aria-label="Terminer le repérage Tajwid" onClick={()=>{setLessonExercise(null);setLessonFound([]);setWord(null);}}><X size={18}/></button>{lessonFeedback&&<p role="status">{lessonFeedback}</p>}</section>}
        {practice&&<div className="iq-practice-bar" role="region" aria-label="Entraînement sur la page"><strong>{practiceVerse?`Verset ${practiceVerse}`:'Me tester'}</strong><button aria-pressed={revealMode==='word'} onClick={()=>setRevealMode('word')}>Mot</button><button aria-pressed={revealMode==='line'} onClick={()=>setRevealMode('line')}>Ligne</button><button onClick={()=>{setRevealed(new Set());setWord(null);}}>Masquer</button><button onClick={reviewPage} disabled={practiceAdded}>{practiceAdded?'Ajouté aux révisions':'Garder à réviser'}</button><button aria-label="Quitter l’entraînement" onClick={()=>{setPractice(false);setWord(null);}}><X size={16}/></button><span className="iq-practice-help">Touchez pour révéler · retouchez pour écouter</span></div>}
        <div ref={viewport} className={`iq-viewport ${spread?'iq-spread-viewport':''}`} inert={bookTurn.turning&&!bookTurn.dragging} {...handlers} onClick={e=>{if(split||practice||lessonExercise||chosenRange)return;if(e.target===e.currentTarget||(e.target as HTMLElement).closest('.iq-paper')&&!(e.target as HTMLElement).closest('.iq-word,button'))setImmersive(v=>!v);}}>
            {error?<section className="iq-empty" role="alert"><p>{error}</p><button onClick={()=>{setFailure(null);setRetry(v=>v+1);}}>Réessayer</button><button onClick={()=>setViewMode('mushaf')}>Ouvrir le lecteur texte</button></section>:!ready?<div className="iq-loading" role="status"><div className="iq-loading-page"/>Préparation de la page…</div>:<div className={`iq-book-spread ${spread?'is-open':''}`}><div key={page} data-active-sheet="true" className="iq-scaled-page" style={{width:600*scale,height:860*scale,order:spread?(page%2===1?1:0):0}}>
                <article className={`iq-paper ${page<3?'iq-paper-opening':''}`} aria-label={`Mushaf Tajwid interactif, page ${page}`} style={{transform:`scale(${scale})`}}>
                    <PageOrnaments opening={page<3}/>
                    <BookRibbon key={page} marked={pageMarked} length={bookmark?.ribbonLength} scale={scale} onSave={savePageBookmark} onRemove={()=>{useReadingBookmarkStore.getState().remove();setBookmarkSaved(false);}}/>
                    <div className="iq-paper-meta"><span>الجزء {(ayahs[0]?.juz||1).toLocaleString('ar-EG')}</span><span>{title?.name}</span></div>
                    {data!.layout.filter(l=>l.type==='surah').map(l=><h1 key={l.n} className={page<3?'iq-surah-title':'iq-surah-line'} style={page>=3?{top:lineY(page,l.n)}:undefined} lang="ar" dir="rtl">{CHAPTERS[(l.surah||1)-1]?.name}</h1>)}
                    {data!.layout.filter(l=>l.type==='basmala').map(l=>{const font=bundle!.basmala!.font,unicode=font.mode==='unicode';return <div key={l.n} className={`iq-basmala ${unicode?'iq-basmala-unicode':''}`} role="img" aria-label="Basmala" style={{top:lineY(page,l.n),fontFamily:font.family,fontSize:page<3?43:32}}>{unicode?bundle!.basmala!.text:bundle!.basmala!.glyphs}</div>;})}
                    <div className="iq-words" dir="rtl" lang="ar">
                        {positions.map(({word:value,x,y,width:advance,fontSize})=>{
                            const verse=verseFor(value),isSelected=word?.key===value.key;
                            const masked=practice&&(!practiceVerse||value.verseKey===practiceVerse)&&value.kind==='word'&&!revealed.has(value.key);
                            const highlighted=live.active?live.passage?.surah===verse.surah&&live.passage?.ayah===verse.numberInSurah:(audio.audioPlaying||audio.recitationPause)?audio.currentPlayingAyah===verse.number:currentSurah===verse.surah&&currentAyah===verse.numberInSurah;
                            return <span key={value.key} {...press(verse,selected=>holdWord(value,selected))} role="button" tabIndex={0} data-word-key={value.key} data-line={value.line} data-verse-key={value.verseKey} aria-current={highlighted&&entryVerse===value.verseKey?true:undefined} data-live-word={trackedWord===value.key||undefined}
                                aria-label={masked?`Révéler ${revealMode==='line'?'la ligne '+value.line:'le mot '+value.position} · ${value.verseKey}`:value.kind==='end'?`Écouter depuis le verset ${value.verseKey}`:`${value.text} · ${value.verseKey} · mot ${value.position}`} aria-pressed={isSelected}
                                className={`iq-word ${entryVerse===value.verseKey&&studyPosition===value.position?'iq-word-academy':''} ${chosenRange&&!passageStart&&selectionWords.some(w=>w.key===value.key)?'iq-word-range':''} ${selectingPassage&&passageStart?.key===value.key&&passageStart.page===page?'iq-word-range-pending':''} ${lessonFound.includes(value.key)?'iq-word-lesson':''} ${font.mode==='unicode'?'iq-word-unicode':''} ${highlighted?'iq-word-verse':''} ${highlighted&&entryVerse===value.verseKey&&!audio.audioActive?'iq-word-entry':''} ${isSelected?'iq-word-selected':''} ${trackedWord===value.key?'iq-word-tracked':''} ${value.kind==='end'?'iq-word-end':''} ${masked?'iq-word-masked':''}`}
                                style={{left:x,top:y,width:advance,fontSize,fontFamily:font.family,fontPalette:font.mode==='colrv1'?fontPaletteName(font.family,paper):undefined}}
                                onClick={()=>tapWord(value)}
                                onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();tapWord(value);}else if(e.key==='ContextMenu'||e.shiftKey&&e.key==='F10'){e.preventDefault();const r=e.currentTarget.getBoundingClientRect();holdWord(value,{ayah:verse,x:r.left,y:r.top});}}}>
                                <span aria-hidden="true">{font.mode==='unicode'?(value.kind==='end'?unicodeWord(value):value.tajweedSegments.map((segment,index)=><span key={`${value.key}-${index}`} style={fallbackRuleColor(segment.rule,paper)?{color:fallbackRuleColor(segment.rule,paper)}:undefined}>{segment.text}</span>)):value.glyph}</span>
                            </span>;
                        })}
                    </div>
                    <span className="iq-page-number">{page.toLocaleString('ar-EG')}</span><span className="iq-paper-edition">مصحف التجويد · حفص عن عاصم</span>
                </article>

                <div className="iq-margin-notes">{noteLines.map(line=>{const matching=pageNotes.filter(n=>data?.words.find(w=>w.verseKey===`${n.surah}:${n.ayah}`)?.line===line);return <button key={line} aria-label={`${matching.length} annotation${matching.length>1?'s':''} · ligne ${line}`} style={{top:lineY(page,line)*scale}} onDoubleClick={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();if(matching.length===1)setAnnotation(noteVerse(matching[0]));else setPanel('notes');}}><MessageSquare size={15}/>{matching.length>1&&<small>{matching.length}</small>}</button>;})}</div>
            </div>{spread&&<div style={{order:page%2===1?0:1}} className="iq-facing-slot"><FacingPage page={facingPage} paper={paper} scale={scale} onNote={n=>setAnnotation(noteVerse(n))} onWord={w=>adoptFacing(w,'play')} onVerse={(sel,w)=>adoptFacing(w,'options',sel)}/></div>}<div className="iq-page-corners"><button data-book-corner="1" className="iq-corner-next" aria-label="Tourner le coin vers la page suivante" disabled={spread?page>=603:page>=604} onClick={e=>{e.stopPropagation();void turn(1);}}/><button data-book-corner="-1" className="iq-corner-previous" aria-label="Tourner le coin vers la page précédente" disabled={spread?page<=2:page<=1} onClick={e=>{e.stopPropagation();void turn(-1);}}/></div></div>}
            {bookTurn.preview&&<div className="iq-turn-underlay" style={{left:bookTurn.preview.left,top:bookTurn.preview.top}}><FacingPage page={bookTurn.preview.page} paper={paper} scale={scale} decorative/></div>}
        </div>
        </PupitreTop><PupitreBottom aria-label="Commandes et étude du passage">
        <PupitreWorkspace activity="reader" tab={consoleTab} primary={<><section className="pupitre-console" aria-label="Console du Mushaf"><div className="pupitre-console-title"><div><strong>{title?.name || 'Mushaf'}</strong><small>Verset {focusedVerse.join(':')} · Page {page} / 604</small></div><button className="iq-page-jump" aria-label="Choisir une page" onClick={()=>{setJumpPage(page);setPanel('page');}}>{page}<small>/604</small></button></div><div className="pupitre-transport"><button aria-label="Page précédente du pupitre" disabled={(spread?page<=2:page<=1)||!ready||bookTurn.turning} onClick={()=>void turn(-1)}><ChevronLeft size={26}/><span>Page précédente</span></button><button className="pupitre-play" disabled={!ready||wordPlayback.preparing||live.active||bookTurn.turning} aria-label={audio.audioActive?audioPauseLabel:'Écouter depuis le verset sélectionné'} onClick={()=>{if(audio.audioActive)togglePlayback();else if(word)void wordPlayback.play(word);else{const v=selection?.ayah||ayahs.find(a=>a.surah===currentSurah&&a.numberInSurah===currentAyah)||ayahs[0];if(v)continueFrom(v);}}}>{audioIsRunning?<Pause/>:<Play/>}<span>{audioIsRunning?'Pause':audio.audioActive?'Reprendre':'Écouter ici'}</span></button><button aria-label="Page suivante du pupitre" disabled={(spread?page>=603:page>=604)||!ready||bookTurn.turning} onClick={()=>void turn(1)}><ChevronRight size={26}/><span>Page suivante</span></button></div><div className="pupitre-timeline"><progress max={604} value={page} aria-label="Position dans le Mushaf"/><div><span>Page {page}</span><span>604</span></div></div>{audio.audioActive&&<button onClick={stopPlayback}>Arrêter l’écoute</button>}</section></>} defaultPins={['word','range','bookmark']} actions={[
            {id:'word',label:'Sens et prononciation',icon:<Languages size={16}/>,disabled:!ready,onClick:()=>{const target=word||data?.words.find(w=>w.kind==='word'&&w.verseKey===focusedVerse.join(':'));if(target)openWord(target);}},
            {id:'range',label:'Répéter',icon:<RotateCcw size={16}/>,onClick:openRange},
            {id:'bookmark',label:'Signet',content:<ReadingBookmarkControl view="tajweed-interactive" page={page} ayahs={ayahs}/>},
            {id:'passage',label:'Passage',icon:<MousePointerClick size={16}/>,disabled:!ready||live.active,pressed:selectingPassage,onClick:togglePassageSelection},
            {id:'translation',label:'Traduction',icon:<Languages size={16}/>,pressed:showTranslation,onClick:()=>setShowTranslation(!showTranslation)},
        ]} listen={<>        {(selectingPassage||chosenRange)&&data&&<section className="iq-passage-selection" aria-label="Sélection de passage">
            <header><strong>{selectionLoading?'Chargement du passage…':passageStart?`Choisir le mot de fin · début p. ${passageStart.page}`:chosenRange?`${selectionWords.length} mots sélectionnés${chosenRange.startPage!==chosenRange.endPage?` · p. ${Math.min(chosenRange.startPage||page,chosenRange.endPage||page)}–${Math.max(chosenRange.startPage||page,chosenRange.endPage||page)}`:''}`:'Sélectionner un passage'}</strong><button aria-label="Annuler la sélection" onClick={clearPassageSelection}>×</button></header>
            <p>{passageStart?`Touchez le dernier mot, même après avoir tourné la page. Une sélection peut couvrir jusqu’à 12 pages.`:chosenRange?'Touchez un mot pour commencer une nouvelle sélection.':'Touchez le premier mot pour commencer.'}</p>
            {selectionError&&<p role="alert">{selectionError}</p>}
            {selectionLoading&&<p role="status">Chargement des pages du passage…</p>}
            {chosenRange&&!passageStart&&!selectionLoading&&selectionWords.length>0&&<>
                {!selectionSameSurah&&<p>Pour écouter ou mémoriser une plage, sélectionnez des mots dans une même sourate.</p>}
                <div><button disabled={rangeAudioBusy||!selectionSameSurah} onClick={()=>void playSelection(1)}>Écouter</button><button disabled={rangeAudioBusy||!selectionSameSurah} onClick={()=>void playSelection(3)}>Répéter ×3</button><button disabled={!selectionSameSurah} onClick={()=>{if(selectedStartVerse&&selectedEndVerse)navigate(`/hifdh?surah=${selectedStartVerse.surah}&ayah=${selectedStartVerse.numberInSurah}&end=${selectedEndVerse.numberInSurah}`);}}>Mémoriser les versets</button><button onClick={()=>setPanel('selection-details')}>Comprendre</button></div>
                {selectionError&&<button disabled={rangeAudioBusy} onClick={()=>void playSelection(1,true)}>Écouter les versets entiers</button>}
            </>}
            {rangeAudioBusy&&<p role="status">Préparation du passage…</p>}
        </section>}
        {undoAudio&&<div className="iq-session-notice" role="status"><span>Nouvel emplacement d’écoute</span><button onClick={()=>resumeAudio(undoAudio)}>Annuler le départ</button><button aria-label="Fermer l’annulation" onClick={()=>setUndoAudio(null)}>×</button></div>}
        {!audio.audioActive&&!wordPlayback.preparing&&savedAudio&&<div className="iq-session-notice"><button onClick={()=>resumeAudio(savedAudio)}>Reprendre l’écoute · {savedAudio.verse.surah}:{savedAudio.verse.numberInSurah} · {Math.floor(savedAudio.offset/60)}:{String(Math.floor(savedAudio.offset%60)).padStart(2,'0')}</button></div>}
        {bookmarkSaved&&<div className="iq-bookmark-confirmation" role="status"><Check size={16}/>Reprendre ici · page {page}</div>}
        {returnPoint&&returnPoint.page!==page&&<div className="iq-reading-return"><button onClick={returnToReading}><ArrowLeft size={15}/>Revenir à ma lecture · p. {returnPoint.page}</button><button aria-label="Fermer le retour à ma lecture" onClick={()=>setReturnPoint(null)}><X size={15}/></button></div>}
        {(!immersive||split)&&showTranslation&&<TranslationRibbon surah={translationVerse[0]} ayah={translationVerse[1]} expanded={showTranslation} onExpanded={setShowTranslation} audioRef={audio.audioRef} audioActive={audio.audioActive} fontSize={subtitleSize} onPauseForReading={audio.pauseForReading}/>}
        <footer className="iq-controls" inert={immersive&&!split}>
            {audio.audioActive&&<button className="iq-audio-behavior" onClick={()=>setPanel('audio')} aria-label={`Mode d’écoute : ${audioBehavior}. Modifier`}><span className={audioIsRunning?'is-playing':''}/>{audioBehavior}<MoreHorizontal size={14}/></button>}
            <div className="iq-transport">
                <button className="iq-page-jump" aria-label={`Aller à une page, page actuelle ${page} sur 604`} onClick={()=>{setJumpPage(page);setPanel('page');}}>{page}<small>/604</small></button>
                <div className="iq-transport-main"><button aria-label="Page précédente" disabled={(spread?page<=2:page<=1)||!ready||bookTurn.turning} onClick={()=>void turn(-1)}><ChevronLeft size={21}/></button>
                {(audio.audioActive||wordPlayback.preparing)&&<><button className="iq-play-primary" aria-label={audioPauseLabel} disabled={wordPlayback.preparing||live.active||bookTurn.turning} onClick={togglePlayback}>{audioIsRunning?<Pause size={21} fill="currentColor"/>:<Play size={21} fill="currentColor"/>}</button><button aria-label="Arrêter l’écoute" onClick={stopPlayback}><X size={18}/></button></>}
                <button aria-label="Page suivante" disabled={(spread?page>=603:page>=604)||!ready||bookTurn.turning} onClick={()=>void turn(1)}><ChevronRight size={21}/></button></div>
                <div className="iq-transport-options"><button aria-label={showTranslation?'Masquer les sous-titres':'Afficher la traduction'} title="Traduction" aria-pressed={showTranslation} onClick={()=>setShowTranslation(!showTranslation)}><Languages size={18}/></button><button aria-label="Sélectionner un passage" title="Sélectionner un passage" aria-pressed={selectingPassage} disabled={(!ready||live.active||practice||!!lessonExercise)&&!selectingPassage} onClick={togglePassageSelection}><MousePointerClick size={18}/></button><button aria-label="Outils de lecture" onClick={()=>setPanel('tools')}><SlidersHorizontal size={18}/></button><button aria-label="Lecture immersive" onClick={()=>setImmersive(true)}><Maximize size={18}/></button></div>
            </div>
            {turnError&&<p role="alert">{turnError}</p>}
            {page===604&&ready&&lastPageUnread&&<button className="iq-finish" onClick={()=>useKhatmStore.getState().togglePage(604)}>Marquer la dernière page lue</button>}
            {wordPlayback.preparing&&<p role="status">Préparation de l’écoute…</p>}{wordPlayback.notice&&<p role="status">{wordPlayback.notice}</p>}
            {audio.audioError&&<p role="alert">{audio.audioError}</p>}
        </footer>
        {immersive&&wordPlayback.notice&&<p className="iq-tap-help" role="status">{wordPlayback.notice}</p>}
        {immersive&&!split&&<div className={`iq-immersive-dock ${immersiveControls.hidden?'iq-dock-hidden':''}`}><TranslationRibbon surah={translationVerse[0]} ayah={translationVerse[1]} expanded={showTranslation} onExpanded={setShowTranslation} audioRef={audio.audioRef} audioActive={audio.audioActive} fontSize={subtitleSize} onPauseForReading={audio.pauseForReading}/><div className="iq-floating" inert={immersiveControls.hidden}><div ref={onVoiceHost}/><button className="mih-toolbar__btn" aria-label="Choisir la disposition" title="Disposition de lecture" aria-haspopup="dialog" onClick={()=>setPanel('layout')}><PanelsTopLeft size={20}/></button><button aria-label="Afficher les commandes" onClick={()=>setImmersive(false)}><Minimize size={18}/><span>{page} / 604</span></button><button aria-label="Sélectionner un passage" title="Sélectionner un passage" aria-pressed={selectingPassage} disabled={(!ready||live.active||practice||!!lessonExercise)&&!selectingPassage} onClick={togglePassageSelection}><MousePointerClick size={18}/></button>{(audio.audioActive||wordPlayback.preparing)?<><button aria-label={audioPauseLabel} disabled={wordPlayback.preparing||live.active} onClick={togglePlayback}>{audioIsRunning?<Pause size={18}/>:<Play size={18}/>}</button><button aria-label="Arrêter l’écoute" onClick={stopPlayback}><X size={18}/></button></>:null}</div></div>}
</>} settings={<PupitreOnly><div className="pupitre-console-options"><label>Récitateur<select aria-label="Récitateur du pupitre" value={selectedReciter} onChange={e=>setReciter(e.target.value)}>{MUSHAF_RECITERS.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></label><label>Vitesse<select aria-label="Vitesse du pupitre" value={audio.playbackSpeed} onChange={e=>audio.setPlaybackSpeed(Number(e.target.value))}>{[.75,1,1.25,1.5].map(n=><option key={n} value={n}>{n} ×</option>)}</select></label><button aria-pressed={showTranslation} onClick={()=>setShowTranslation(!showTranslation)}><Languages size={18}/> Traduction</button><button aria-pressed={selectingPassage} disabled={(!ready||live.active||practice||!!lessonExercise)&&!selectingPassage} onClick={togglePassageSelection}><MousePointerClick size={18}/> Passage</button><button onClick={()=>setPanel('audio')}>Fin de lecture</button><button onClick={()=>setPanel('tools')}><SlidersHorizontal size={18}/> Réglages</button></div><div className="pupitre-study-actions"><button onClick={openRange}>Répéter un passage</button><button onClick={()=>anchoredZoom(Math.min(3,zoom+.1))}>Agrandir</button><button disabled={zoom<=1} onClick={()=>anchoredZoom(Math.max(1,zoom-.1))}>Réduire</button><ReadingBookmarkControl view="tajweed-interactive" page={page} ayahs={ayahs}/></div></PupitreOnly>} understand={<PupitreOnly><MushafDeskStudy snapshot={(()=>{const verse=details||selection?.ayah||ayahs.find(v=>v.surah===currentSurah&&v.numberInSurah===currentAyah)||ayahs[0];return verse?{verse,translation:translationMap.get(verse.number)||'',word,font,paper,page}:null;})()} onListen={playVerse} renderWord={(snapshot,locked,dismiss)=>snapshot.word&&<WordStudyCard embedded word={snapshot.word} font={snapshot.font} paper={snapshot.paper} page={snapshot.page} rules={RULES} selectedReciter={selectedReciter} previous={!locked&&snapshot.page===page&&data?.words.find(w=>w.kind==='word')?.key!==snapshot.word.key} next={!locked&&snapshot.page===page&&data?.words.filter(w=>w.kind==='word').at(-1)?.key!==snapshot.word.key} onAdjacent={selectAdjacentWord} onClose={()=>{dismiss();setWord(null);}} onTranslation={()=>setDetails(snapshot.verse)} onBeforePlay={stopPlayback} onContinue={snapshot.page===page?start=>continueFrom(snapshot.verse,start):undefined}/>}/></PupitreOnly>}/>
        {selection&&<VerseActionBar key={`${selection.ayah.number}:${heldWord?.key}`} selection={selection} view="tajweed-interactive" onClose={closeSelection} onWord={heldWord?.kind==='word'?()=>{openWord(heldWord);}:undefined}  onPlay={()=>playVerse(selection.ayah)} onContinue={()=>heldWord?void wordPlayback.play(heldWord):continueFrom(selection.ayah)} onMore={()=>setShare(selection.ayah)} onUnderstand={()=>setDetails(selection.ayah)} onAnnotate={()=>setAnnotation(selection.ayah)} onFavorite={()=>favorites.toggleFavorite(selection.ayah)} favorite={favorites.isFavorite(selection.ayah.number)}/>}
        {word&&!split&&<WordStudyCard onOptions={()=>{const v=verseFor(word);setHeldWord(word);setSelection({ayah:v,x:window.innerWidth/2,y:window.innerHeight*.4});setWord(null);}} selectedReciter={selectedReciter} onContinue={start=>continueFrom(verseFor(word),start)} word={word} font={font} paper={paper} page={page} rules={RULES} previous={data?.words.find(w=>w.kind==='word')?.key!==word.key} next={data?.words.filter(w=>w.kind==='word').at(-1)?.key!==word.key} onAdjacent={selectAdjacentWord} onClose={()=>setWord(null)} onTranslation={()=>{setDetails(verseFor(word));setWord(null);}} onBeforePlay={stopPlayback}/>}
        {details&&!split&&<Sheet title={`Verset ${details.surah}:${details.numberInSurah}`} onClose={()=>setDetails(null)}>
            <p className="iq-verse-arabic" dir="rtl" lang="ar">{details.text}</p><p>{translationMap.get(details.number)||'La traduction n’a pas pu être chargée. Réessayez avec une connexion.'}</p><small>Traduction : Muhammad Hamidullah</small>
            <div className="iq-detail-actions"><Link to={`/fahm?surah=${details.surah}&ayah=${details.numberInSurah}`} state={{readerReturn:{to:`/read?surah=${details.surah}&ayah=${details.numberInSurah}&page=${page}`,label:"Retour au Mushaf"}}}>Approfondir avec Fahm</Link><button onClick={()=>playVerse(details)}><Play size={18}/>Écouter</button><button onClick={()=>{setRange({surah:details.surah,start:details.numberInSurah,end:details.numberInSurah,repetitions:3});setDetails(null);setPanel('range');}}><RotateCcw size={18}/>Répéter un passage</button><Link to={`/tafsir?surah=${details.surah}&ayah=${details.numberInSurah}`}>Consulter le Tafsir</Link><button onClick={()=>{setShare(details);setDetails(null);}}>Partager</button><button onClick={()=>{selectVerse(details);setDetails(null);}}>Reprendre ici</button><button onClick={()=>navigate(`/hifdh?surah=${details.surah}&ayah=${details.numberInSurah}`)}>Mémoriser</button></div>
        </Sheet>}
        {share&&<MushafShareModal ayah={share} surahs={CHAPTERS.map(c=>({number:c.id,englishName:c.latin}))} translationMap={translationMap} transliterationMap={new Map()} showTranslation showTransliteration={false} onClose={()=>setShare(null)}/>}
        {panel==='layout'&&<Sheet title="Disposition de lecture" onClose={()=>setPanel(null)}><PupitrePreferences state={pupitre}/><button className="iq-primary" onClick={()=>setPanel(null)}>Terminé</button></Sheet>}
        {panel==='page'&&<Sheet title="Aller à une page" onClose={()=>setPanel(null)}><form onSubmit={e=>{e.preventDefault();if(isInteractivePage(jumpPage)){rememberJump(jumpPage);audio.stopAudio();useQuranStore.getState().goToPage(jumpPage,{silent:true});setPanel(null);}}}><label className="iq-setting-label">Page du Mushaf<input aria-label="Numéro de page" type="number" inputMode="numeric" min="1" max="604" value={jumpPage} onChange={e=>setJumpPage(Number(e.target.value))}/></label><button className="iq-primary" type="submit" disabled={!isInteractivePage(jumpPage)}>Ouvrir la page</button></form></Sheet>}
        {panel==='selection-details'&&chosenRange&&<Sheet title="Comprendre le passage" onClose={()=>setPanel(null)}>{[...new Set(selectionWords.map(w=>w.verseKey))].map(key=>{const verse=selectionVerses.find(v=>`${v.surah}:${v.numberInSurah}`===key);return verse?<section key={key}><h3>Verset {key}</h3><p className="iq-verse-arabic" lang="ar" dir="rtl">{verse.text}</p><p>{translationMap.get(verse.number)||'Traduction indisponible hors ligne.'}</p><Link to={`/tafsir?surah=${verse.surah}&ayah=${verse.numberInSurah}`}>Consulter le Tafsir</Link></section>:null;})}<small>Traduction des versets complets · Muhammad Hamidullah</small></Sheet>}
        {panel==='audio'&&<Sheet title="Mode d’écoute" className="iq-tools-sheet" onClose={()=>setPanel(null)}><p>{audioBehavior}</p><label className="iq-setting-label">Arrêter l’écoute<select aria-label="Arrêter l’écoute à la fin" value={stopBoundary} onChange={e=>applyStopBoundary(e.target.value as AudioStopBoundary)}><option value="none">Sans limite</option><option value="verse">À la fin du verset</option><option value="page">À la fin de la page</option><option value="surah">À la fin de la sourate</option></select></label><div className="iq-audio-choices"><button onClick={()=>{const verse=ayahs.find(v=>v.number===audio.currentPlayingAyah)||ayahs.find(v=>v.surah===currentSurah&&v.numberInSurah===currentAyah)||ayahs[0];if(verse){continueFrom(verse);setPanel(null);}}}><Play size={18}/>Continuer depuis ce verset</button><button onClick={()=>{const verse=ayahs.find(v=>v.number===audio.currentPlayingAyah)||ayahs[0];if(verse){playVerse(verse);setPanel(null);}}}><BookOpen size={18}/>Écouter ce verset seul</button><button onClick={()=>{const verse=ayahs.find(v=>v.number===audio.currentPlayingAyah)||ayahs[0];if(verse)setRange({surah:verse.surah,start:verse.numberInSurah,end:verse.numberInSurah,repetitions:3});setPanel('range');}}><RotateCcw size={18}/>Répéter un passage</button><button onClick={()=>{stopPlayback();setPanel(null);}}>Arrêter l’écoute</button></div></Sheet>}
        {annotation&&<Sheet title="Annotation personnelle" onClose={()=>setAnnotation(null)}><NoteEditor key={`${annotation.surah}:${annotation.numberInSurah}`} verse={annotation} onDone={()=>setAnnotation(null)}/></Sheet>}
        {panel==='notes'&&<Sheet title="Mes notes de lecture" onClose={()=>setPanel(null)}><NotesNotebook onOpen={n=>{setPanel(null);setAnnotation(noteVerse(n));}} onGo={n=>{rememberJump(n.page);setPanel(null);useQuranStore.getState().goToAyah(n.surah,n.ayah,n.page,{silent:true});}}/></Sheet>}
        {panel==='tools'&&<Sheet title="Outils de lecture" className="iq-tools-sheet" onClose={()=>setPanel(null)}>
            <section aria-label="Affichage"><h3>Affichage</h3><div className="iq-control-row iq-tools-zoom"><button aria-pressed={zoom===1} onClick={()=>anchoredZoom(1)}>Page entière</button><button aria-pressed={zoom===1.2} onClick={()=>anchoredZoom(1.2)}>Confort</button><button aria-label="Réduire le zoom" disabled={zoom<=1} onClick={()=>anchoredZoom(zoom-.1)}><ZoomOut size={18}/></button><button aria-label="Agrandir" disabled={zoom>=3} onClick={()=>anchoredZoom(zoom+.1)}><ZoomIn size={18}/><span>{Math.round(zoom*100)} %</span></button></div></section>
            <section aria-label="Écoute"><h3>Écoute</h3><div className="iq-tools-selects"><label className="iq-setting-label">Récitateur<select aria-label="Récitateur" value={MUSHAF_RECITERS.some(r=>r.id===selectedReciter)?selectedReciter:MUSHAF_RECITERS[0].id} onChange={e=>setReciter(e.target.value)}>{MUSHAF_RECITERS.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></label><label className="iq-setting-label">Vitesse<select aria-label="Vitesse d’écoute" value={audio.playbackSpeed} onChange={e=>audio.setPlaybackSpeed(Number(e.target.value))}>{[.75,1,1.25,1.5].map(n=><option key={n} value={n}>{n} ×</option>)}</select></label></div>
                <div className="iq-recite-settings"><button aria-pressed={recitationMode} disabled={live.active} onClick={()=>{audio.stopAudio();setRecitationMode(v=>!v);}}>Écoute, puis récite {recitationMode?'· activé':''}</button>{recitationMode&&<><label className="iq-setting-label">Temps pour réciter<select aria-label="Temps pour réciter" value={recitationDelay} onChange={e=>setRecitationDelay((e.target.value==='duration'?'duration':Number(e.target.value)) as RecitationDelay)}><option value="duration">Durée du verset</option>{[5,10,20,30].map(n=><option key={n} value={n}>{n} secondes</option>)}</select></label><p>Écoute un verset, puis récite pendant la pause.</p></>}</div>
                {audio.audioActive&&<p role="status" className="iq-tools-status">{audio.passageComplete?'Passage terminé':audio.recitationPause?'À vous de réciter':audio.audioPlaying?'En écoute':'En pause'} · {audio.currentSurahRef.current}:{audio.currentAyahRef.current}{audio.passage&&` · répétition ${audio.passage.iteration}/${audio.passage.repetitions}`}</p>}
            </section>
            <section aria-label="Étude"><h3>Étude</h3><div className="iq-detail-actions"><button onClick={()=>setPanel('notes')}><MessageSquare size={17}/>Mes notes ({Object.keys(notes).length})</button><button aria-pressed={bookSpread} onClick={()=>setBookSpread(!bookSpread)}><BookOpen size={17}/>Double page · {bookSpread?'automatique':'désactivée'}</button><button aria-haspopup="dialog" disabled={live.active||audio.audioPlaying||!!audio.recitationPause} onClick={()=>{setWord(null);setSelection(null);setPanel('coach');}}>🧠 Mon coach{coachEnabled&&coachInbox.suggestions.length>0?` · ${coachInbox.suggestions.length}`:''}</button><button onClick={openRange}><RotateCcw size={16}/>Répéter un passage</button><button disabled={!ready||live.active} onClick={startPractice}><BookOpen size={16}/>Me tester</button><button onClick={()=>setPanel('review')}><Bookmark size={16}/>À revoir ({Object.keys(reviewWords).length})</button>{audio.audioActive&&<button onClick={stopPlayback}>Arrêter l’écoute</button>}{coachInbox.returnPoint&&<button onClick={resumeCoachReturn}>↩ Reprendre ma lecture</button>}</div></section>
        </Sheet>}
        {panel==='range'&&<Sheet title="Répéter un passage" onClose={()=>setPanel(null)}><p>{recitationMode?'Écoute, puis récite : une pause après chaque verset.':'Choisissez les versets, même s’ils se trouvent sur plusieurs pages.'}</p><label className="iq-setting-label">Sourate<select aria-label="Sourate du passage" value={range.surah} disabled={rangeBusy} onChange={e=>setRange(r=>({...r,surah:Number(e.target.value),start:1,end:1}))}>{CHAPTERS.map(c=><option key={c.id} value={c.id}>{c.id}. {c.latin}</option>)}</select></label><div className="iq-range-fields"><label>Du verset<select aria-label="Premier verset" disabled={rangeBusy} value={range.start} onChange={e=>setRange(r=>({...r,start:Number(e.target.value),end:Math.max(r.end,Number(e.target.value))}))}>{rangeAyahs.map(v=><option key={v} value={v}>{v}</option>)}</select></label><label>Au verset<select aria-label="Dernier verset" disabled={rangeBusy} value={range.end} onChange={e=>setRange(r=>({...r,end:Number(e.target.value)}))}>{rangeAyahs.filter(v=>v>=range.start).map(v=><option key={v} value={v}>{v}</option>)}</select></label><label>Répétitions<select aria-label="Nombre de répétitions" disabled={rangeBusy} value={range.repetitions} onChange={e=>setRange(r=>({...r,repetitions:Number(e.target.value)}))}>{[1,2,3,5,10,20].map(n=><option key={n}>{n}</option>)}</select></label></div><button className="iq-primary" disabled={rangeBusy||live.active} onClick={()=>void startRange()}><Play size={18}/>{rangeBusy?'Préparation…':'Commencer'}</button>{rangeError&&<p role="alert" className="iq-range-error">{rangeError}</p>}</Sheet>}
        {panel==='review'&&<Sheet title="Mes mots à revoir" onClose={()=>setPanel(null)}>{Object.keys(reviewWords).length===0?<p>Faites un appui long sur un mot, ouvrez sa fiche puis « À revoir » pour le retrouver ici. Son verset sera aussi ajouté à vos révisions.</p>:<><div className="iq-review-list">{Object.values(reviewWords).sort((a,b)=>b.addedAt-a.addedAt).map(w=><div className="iq-review-item" key={w.key}><button onClick={()=>{audio.stopAudio();setPractice(false);setWord(null);pendingReview.current={page:w.page,key:w.key};if(data?.page===w.page){pendingReview.current=null;setWord(data.words.find(v=>v.key===w.key)||null);}useQuranStore.getState().goToAyah(...w.verseKey.split(':').map(Number) as [number,number],w.page,{silent:true});setPanel(null);}}><span lang="ar" dir="rtl">{w.text}</span><small>{w.verseKey} · p. {w.page}</small></button><button aria-label={`Retirer le mot ${w.key}`} onClick={()=>useMushafStudyStore.getState().toggle(w)}><X size={16}/></button></div>)}</div><Link to="/hifdh">Ouvrir la mémorisation</Link></>}</Sheet>}
        {panel==='coach'&&<Sheet title="Mon coach" onClose={()=>setPanel(null)}><MushafCoachContent data={data} surah={currentSurah} ayah={currentAyah} onClose={()=>setPanel(null)} onTask={(task,surah,ayah)=>{audio.stopAudio();setPanel(null);navigate(prepareReaderCoachTask(task,surah,ayah));}} onWord={value=>{setPanel(null);openWord(value);}} onExercise={rule=>{audio.stopAudio();setPractice(false);setWord(null);setPanel(null);setLessonExercise(rule);setLessonFeedback('');setLessonFound([]);}}/></Sheet>}
        {panel==='settings'&&<ReaderSettingsDialog edition="MUSHAF TAJWID INTERACTIF" title="Options du lecteur" onClose={()=>setPanel(null)}>
            <section aria-label="Accès"><h3>Accès</h3>
                <label className="iq-setting-label">Mode de lecture<select aria-label="Mode de lecture" value={viewMode} onChange={e=>{audio.stopAudio();setViewMode(e.target.value as ViewMode);}}><option value="tajweed-interactive">Mushaf Tajwid interactif</option><option value="mushaf">Texte interactif</option></select></label>
                <div className="iq-settings-bookmark"><span>Signet de lecture</span><ReadingBookmarkControl view="tajweed-interactive" page={page} ayahs={ayahs}/></div>
            </section>
            <section aria-label="Présentation"><h3>Votre lecture</h3>
                <label className="text-settings-switch"><span>Traduction<small>Le sens du verset en français</small></span><input type="checkbox" checked={showTranslation} onChange={e=>setShowTranslation(e.target.checked)}/></label>
                <div className="text-settings-choices" role="group" aria-label="Taille des sous-titres">{([13,16,18] as const).map(value=><button key={value} aria-pressed={subtitleSize===value} onClick={()=>setSubtitleSize(value)}>{value===13?'Normal':value===16?'Grand':'Très grand'}</button>)}</div>
            </section>
            <section aria-label="Présentation de la page"><h3>Couleur du papier</h3><div className="text-settings-choices" role="group" aria-label="Couleur du papier">{(['light','sepia','dark'] as const).map(t=><button key={t} aria-pressed={paper===t} onClick={()=>setPaper(t)}>{t==='light'?'Clair':t==='sepia'?'Ivoire':'Nuit'}</button>)}</div>
            </section>
            <section aria-label="Suivi de lecture"><h3>Suivi de lecture</h3><div className="iq-settings-khatm"><KhatmTracker dailyPreview/><span>Page {page} {khatmActive?'· toucher ✓ pour corriger le suivi':'· activer un Khatm pour suivre les pages'}</span>{khatmActive&&<KhatmPageBadge currentPage={page} pageOnly disabled={!ready}/>}</div></section>
            <details><summary>Tajwid et édition</summary><div className="iq-detail-actions"><button onClick={()=>setPanel('legend')}><Palette size={18}/>Couleurs Tajwid</button><button onClick={()=>setPanel('about')}><Info size={18}/>Cette édition</button></div></details>
            <details className="iq-settings-extra"><summary>Polices hors ligne</summary><FontDownloads/></details>
        </ReaderSettingsDialog>}
        {panel==='legend'&&<Sheet title="Les couleurs du Tajwid" onClose={()=>setPanel(null)}><p>{font.mode==='unicode'?'Cet appareil n’a pas validé le rendu de la police QCF couleur. Le texte arabe reste visible et les règles disponibles sont colorées.':'Les couleurs sont intégrées aux lettres de la calligraphie QCF.'}</p><ul className="iq-legend">{LEGEND.map(([color,label])=><li key={label}><i style={{background:color}}/>{label}</li>)}</ul><p>La coloration de cette édition diffère de celle de Dâr al-Ma‘rifa.</p></Sheet>}
        {panel==='about'&&<Sheet title="À propos de cette édition" onClose={()=>setPanel(null)}><p>Calligraphie QCF V4 · récitation Hafs · composition KFGQPC 1441 H · 604 pages.</p><p>Les coupures de lignes, couleurs et ornements diffèrent du Mushaf Dâr al-Ma‘rifa de QuranFlash. Les décors sont une création de Quran Coach.</p><p>La police QCF couleur est utilisée lorsque le navigateur la peint correctement. Sinon, le lecteur garde un texte arabe Uthmani interactif avec les règles Tajwid disponibles.</p><p>Quran fonts provided by Quran Foundation. Mots : Quran.com. Composition : QUL. Polices : King Fahd Quran Printing Complex. Français mot à mot : QUL, ressource 95 (Tarteel).</p><p>Les polices peuvent être téléchargées dans les options du lecteur. Le texte des pages et les audios nécessitent encore une connexion.</p><a href="https://api-docs.quran.com/docs/tutorials/fonts/font-rendering/" target="_blank" rel="noreferrer">Sources et conditions d’utilisation</a></Sheet>}
        <div className="iq-verso-resources" inert aria-hidden="true">{versoPages.map(p=><div key={p} data-book-verso={p}><FacingPage page={p} paper={paper} scale={scale} decorative/></div>)}</div>
        <SideMenu isOpen={menu} onClose={()=>setMenu(false)}/>{search&&<MushafSearchOverlay surahs={surahs} currentPage={page}
            goToSurah={(surah,options)=>{const target=pageForVerse(surah,1);if(target)rememberJump(target);if(target)useQuranStore.getState().goToAyah(surah,1,target,options);else useQuranStore.getState().goToSurah(surah,options);}}
            goToPage={(target,options)=>{rememberJump(target);useQuranStore.getState().goToPage(target,options);}}
            goToAyah={(surah,ayah,_sourcePage,options)=>{const target=pageForVerse(surah,ayah);if(target)rememberJump(target);if(target)useQuranStore.getState().goToAyah(surah,ayah,target,options);}}
            onClose={()=>setSearch(false)}/>}
    </PupitreBottom></Pupitre>;
}
