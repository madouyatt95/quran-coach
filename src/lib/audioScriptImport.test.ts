import {describe,expect,it} from 'vitest';
import {parseAudioScriptImport} from './audioScriptImport';
const script={title:'Récit',category:'story',text:'Une narration française.',original_text:'Une narration française.',source_url:'https://quran.com/1',reference:'1:1',rights:'Texte original',approved_by:'forged'};
describe('import de manuscrits',()=>{
 it('requires explicit server approval even when an imported file claims approval',()=>{expect(parseAudioScriptImport(JSON.stringify([script]))[0].approved_by).toBeNull();});
 it('rejects Arabic, missing sources and duplicate text entries before any write',()=>{for(const value of [[{...script,text:'نص'}],[{...script,reference:''}],[script,script]])expect(()=>parseAudioScriptImport(JSON.stringify(value))).toThrow();});
 it('bounds both file size and script count',()=>{expect(()=>parseAudioScriptImport(' '.repeat(1000001))).toThrow();expect(()=>parseAudioScriptImport(JSON.stringify(Array.from({length:101},()=>script)))).toThrow();});
});
