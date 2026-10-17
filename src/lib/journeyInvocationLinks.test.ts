import {it,expect} from 'vitest';
import {journeyInvocationLinks} from '../data/journeyInvocationLinks';
import {invocationByKey,quranReference} from './adhkarExperience';
import {getJourney} from './editorialJourneys';
it('each bridge targets an existing story and the exact Quran reference of its invocation',()=>{
 for(const link of journeyInvocationLinks){const d=invocationByKey.get(link.key);expect(d).toBeTruthy();expect(quranReference(d!)).toMatchObject({surah:link.surah,ayah:link.ayah});for(const id of link.journeys)expect(getJourney(...id.split(':') as [string,string])).toBeTruthy();}
});
