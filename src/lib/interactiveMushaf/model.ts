import verifiedLayout from './verified-layout.json';
import chapters from './chapters.json';
import type { Ayah } from '../../types';

export const EDITION = 'qpc-v4-1441h';
export type PageNumber = number;
export const CHAPTERS = chapters;
export interface LayoutLine { n:number; type:'ayah'|'surah'|'basmala'; center:boolean; surah?:number }
export interface PageManifest { sha256:string; lines:Record<string,string[]>; layout:LayoutLine[]; verseKeys:string[]; wordCount:number; endCount:number }
export const PAGE_MANIFEST = verifiedLayout as unknown as Record<number,PageManifest>;
export interface TajweedSegment { text:string; rule:string|null }
export interface MushafWord {
    key: string; verseKey: string; position: number; glyph: string; text: string;
    kind: 'word' | 'end'; line: number; audio: string | null;
    french: string | null; transliteration: string | null; rules: string[]; tajweedSegments:TajweedSegment[];
}
export interface InteractivePage { page: PageNumber; verses: Ayah[]; words: MushafWord[]; layout:LayoutLine[] }
interface ApiWord {
    position: number; code_v2: string; text_uthmani: string; text_uthmani_tajweed?: string;
    char_type_name: string; page_number: number; line_number: number; audio_url?: string;
    translation?: { text?: string; language_name?: string }; transliteration?: { text?: string };
}
export interface PageResponse {
    verses: Array<{ id: number; verse_key: string; verse_number: number; page_number: number; juz_number: number; hizb_number?:number; rub_el_hizb_number?:number; words: ApiWord[] }>;
    pagination: { next_page: number | null; total_records: number };
}
export function isInteractivePage(value:number):boolean { return Number.isInteger(value) && value>=1 && value<=604; }
export function pageUrl(page:PageNumber) {
    return `https://api.quran.com/api/v4/verses/by_page/${page}?words=true&word_fields=code_v2,text_uthmani,text_uthmani_tajweed&language=fr&mushaf=19&per_page=50`;
}
/**
 * Quran.com resolves word audio from the verse key and the displayed word position.
 * The API's `audio_url` can use a different internal index (for example, 2:13 word 13
 * returns index 14), which plays a neighboring word. Keep this derived path aligned
 * with the same word-location convention used by Quran.com.
 */
export function quranWordAudioUrl(verseKey:string,position:number):string|null {
    const match=/^(\d{1,3}):(\d{1,3})$/.exec(verseKey);
    if(!match||!Number.isInteger(position)||position<1||position>999)return null;
    const [surah,ayah]=match.slice(1).map(Number);
    if(surah<1||surah>114||ayah<1||ayah>999)return null;
    return `https://audio.qurancdn.com/wbw/${String(surah).padStart(3,'0')}_${String(ayah).padStart(3,'0')}_${String(position).padStart(3,'0')}.mp3`;
}
function decodeTajweedEntities(text:string) {
    return text.replace(/&#x([0-9a-f]+);/gi,(_,hex:string)=>String.fromCodePoint(parseInt(hex,16)))
        .replace(/&#(\d+);/g,(_,decimal:string)=>String.fromCodePoint(Number(decimal)))
        .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'");
}
/** Parse Quran.com/QF Tajweed tags into safe text segments; never inject remote HTML. */
export function parseTajweedSegments(markup:string|undefined, fallback:string):TajweedSegment[] {
    if(!markup)return [{text:fallback,rule:null}];
    const html=markup.replace(/<span\s+class=['"]?end['"]?[^>]*>[^<]*<\/span>/gi,'');
    const tag=/<(tajweed|rule)\b[^>]*\bclass=['"]?([a-z_]+)['"]?[^>]*>([\s\S]*?)<\/\1>/gi;
    const segments:TajweedSegment[]=[];let cursor=0,match:RegExpExecArray|null;
    const append=(raw:string,rule:string|null)=>{
        const text=decodeTajweedEntities(raw.replace(/<[^>]*>/g,''));
        if(!text)return;
        const previous=segments.at(-1);
        if(previous&&previous.rule===rule)previous.text+=text;else segments.push({text,rule});
    };
    while((match=tag.exec(html))!==null){append(html.slice(cursor,match.index),null);append(match[3],match[2].toLowerCase());cursor=tag.lastIndex;}
    append(html.slice(cursor),null);
    return segments.length?segments:[{text:fallback,rule:null}];
}
export function canonicalPage(data:PageResponse) {
    return JSON.stringify(data.verses.map(v=>[v.verse_key,v.words.map(w=>[w.position,w.code_v2,w.text_uthmani,w.line_number,w.char_type_name])]));
}
/** Fail closed. API glyphs stay intact; independently audited QUL lines place them. */
export function decodePage(page:PageNumber,data:PageResponse):InteractivePage {
    const fail=():never=>{throw new Error('Les données de cette page ne correspondent pas à cette édition.');};
    const expected=PAGE_MANIFEST[page];
    if(!isInteractivePage(page)||!expected||!data?.pagination||data.pagination.next_page!==null||!Array.isArray(data.verses)||data.pagination.total_records!==data.verses.length||data.verses.length!==expected.verseKeys.length)fail();
    const lineByKey=new Map(Object.entries(expected.lines).flatMap(([n,keys])=>keys.map(k=>[k,Number(n)] as const)));
    const words:MushafWord[]=[],verses:Ayah[]=[];
    let previousLine=0,previousGlyph=0xfc40;
    for(const [vi,verse] of data.verses.entries()) {
        const [surah,ayah]=verse.verse_key.split(':').map(Number), chapter=chapters[surah-1];
        if(!chapter||verse.verse_key!==expected.verseKeys[vi]||verse.verse_number!==ayah||ayah<1||ayah>chapter.count||verse.id!==chapter.offset+ayah||!Array.isArray(verse.words)||!verse.words.length||verse.juz_number<1||verse.juz_number>30)fail();
        for(const [i,w] of verse.words.entries()) {
            if(w.position!==i+1||!w.text_uthmani||w.char_type_name!==(i===verse.words.length-1?'end':'word'))fail();
            if(w.page_number!==page)continue;
            const key=`${verse.verse_key}:${w.position}`,line=lineByKey.get(key)||0;
            const codes=[...(w.code_v2||'')].filter(g=>g.trim()).map(g=>g.codePointAt(0)!);
            if(!line||line<previousLine||!codes.length||codes.some((cp,index)=>cp!==previousGlyph+index+1))fail();
            previousLine=line;previousGlyph=codes.at(-1)!;
            const tr=w.translation;
            const tajweedSegments=parseTajweedSegments(w.text_uthmani_tajweed,w.text_uthmani);
            words.push({key,verseKey:verse.verse_key,position:w.position,glyph:w.code_v2,text:w.text_uthmani,kind:w.char_type_name as 'word'|'end',line,
                audio:w.char_type_name==='word'?quranWordAudioUrl(verse.verse_key,w.position):null,
                french:tr&&['french','fr','français'].includes(tr.language_name?.toLowerCase()||'')?tr.text||null:null,
                transliteration:w.transliteration?.text||null,
                rules:[...new Set(tajweedSegments.flatMap(s=>s.rule?[s.rule]:[]))],tajweedSegments});
        }
        verses.push({number:verse.id,numberInSurah:ayah,surah,page,juz:verse.juz_number,hizbQuarter:verse.rub_el_hizb_number||1,text:verse.words.filter(w=>w.char_type_name==='word').map(w=>w.text_uthmani).join(' ')});
    }
    for(const [line,keys]of Object.entries(expected.lines)) {
        const actual=words.filter(w=>w.line===Number(line)).map(w=>w.key);
        if(actual.length!==keys.length||actual.some((key,i)=>key!==keys[i]))fail();
    }
    if(words.length!==expected.wordCount+expected.endCount)fail();
    return {page,verses,words,layout:expected.layout};
}
export function lineY(page:number,line:number) { return page<3 ? 226+(line-2)*58 : 102+(line-1)*42; }
export interface PositionedWord { word:MushafWord; x:number; y:number; width:number; fontSize:number }
/** Uniform glyph scaling and explicit line coordinates, never reflow Quran text. */
export function composePage(page:InteractivePage,measure:(glyph:string,size:number)=>number,displayGlyph:(word:MushafWord)=>string=word=>word.glyph):PositionedWord[] {
    const opening=page.page<3,left=opening?108:66,available=opening?384:468;
    const groups=[...new Set(page.words.map(w=>w.line))].map(line=>page.words.filter(w=>w.line===line));
    const size=Math.min(opening?46:36,...groups.map(g=>(available-(g.length-1)*(opening?4:2))/g.reduce((sum,w)=>sum+measure(displayGlyph(w),1),0)));
    if(!Number.isFinite(size)||size<12)throw new Error('La police de cette page ne peut pas être affichée.');
    return groups.flatMap(group=>{
        const widths=group.map(w=>measure(displayGlyph(w),size)),total=widths.reduce((a,b)=>a+b,0);
        const centered=opening||page.layout.find(l=>l.n===group[0].line)?.center||group.length===1;
        const gap=centered?4:Math.max(0,(available-total)/(group.length-1));
        let right=left+available-(centered?(available-total-gap*(group.length-1))/2:0);
        return group.map((word,i)=>{const p={word,x:right-widths[i],y:lineY(page.page,word.line),width:widths[i],fontSize:size};right-=widths[i]+gap;return p;});
    });
}

export function pageForVerse(surah:number,ayah:number):number|null {
    const key=`${surah}:${ayah}`;
    for(const [page,item]of Object.entries(PAGE_MANIFEST))if(item.verseKeys.includes(key))return Number(page);
    return null;
}
