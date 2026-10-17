import {vi,it,expect} from 'vitest';
const recording=vi.hoisted(()=>vi.fn());vi.mock('./recordedNarration',()=>({getRecordedNarration:recording}));vi.mock('./quranApi',()=>({getAudioUrl:(_r:string,id:number)=>`/audio/${id}.mp3`}));
import {editorialPackUrls} from './editorialOffline';import {getJourney} from './editorialJourneys';
it('includes every narration and Quran text/translation/audio, deduplicating shared files',async()=>{
 recording.mockResolvedValue({url:'/narration.mp3'});const urls=await editorialPackUrls(getJourney('prophet','adam')!);expect(urls.filter(u=>u==='/narration.mp3')).toHaveLength(1);expect(urls).toContain('/audio/narration/fr-v1/manifest.json');expect(urls.some(u=>u.endsWith('/quran-uthmani'))).toBe(true);expect(urls.some(u=>u.endsWith('/fr.hamidullah'))).toBe(true);expect(urls.some(u=>/^\/audio\/\d+.mp3$/.test(u))).toBe(true);
});
it('refuses to label a pack complete when a narration is missing',async()=>{recording.mockResolvedValue(null);await expect(editorialPackUrls(getJourney('prophet','adam')!)).rejects.toThrow('manque');});
