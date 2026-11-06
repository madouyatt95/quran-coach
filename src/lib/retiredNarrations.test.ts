import {it,expect} from 'vitest';
import {readFileSync,readdirSync} from 'node:fs';
import retired from '../data/retiredSiwis.json';
import {books,canonicalBookForSource} from './bookLibrary';
import {migrateNarrationFavorites,retiredNarrationHref} from './retiredNarrations';
import {migrateMoralLibrary} from './moralEditionMigration';
const id=Object.keys(retired)[0],target=retired[id as keyof typeof retired];
it('all removed narrations lead to an actual book and chapter',()=>{for(const r of Object.values(retired)){expect(books.find(b=>b.id===r.bookId)?.chapters.some(c=>c.id===r.chapterId)).toBe(true);}});
it('preserves favorites without transferring incompatible audio offsets',()=>{expect(migrateNarrationFavorites([id,`audio:${id}`,`book:${target.bookId}`,'other'])).toEqual([`book:${target.bookId}`,'other']);const state={favorites:[id],positions:{[id]:{seconds:150,updatedAt:100}}};expect(migrateMoralLibrary(state).positions).toEqual(state.positions);expect(retiredNarrationHref(id)).toContain(`/books/${target.bookId}?chapter=`);});
it('has removed every retired asset and manifest entry while preserving remaining narrations',()=>{
 const manifest=JSON.parse(readFileSync('public/audio/narration/fr-v1/manifest.json','utf8')).entries;
 const library=JSON.parse(readFileSync('public/audio/library.json','utf8')) as {id:string;url:string}[];
 const files=readdirSync('public/audio/narration/fr-v1');
 expect(library).toHaveLength(596);expect(Object.keys(manifest)).toHaveLength(596);
 for(const key of Object.keys(retired)){expect(manifest[key]).toBeUndefined();expect(library.some(i=>i.id===key)).toBe(false);expect(files.some(f=>f===`${key}.mp3`||f.startsWith(`${key}-`))).toBe(false);}
 for(const item of library){expect(manifest[item.id]?.url).toBe(item.url);expect(readFileSync(`public${item.url}`).byteLength).toBeGreaterThan(0);}
});
it('connects formerly unlinked stories to their precise rewritten chapter',()=>{expect(canonicalBookForSource('/journeys/story/table-servie')).toMatchObject({book:{id:'une-parole-entendue'},chapter:'table'});expect(canonicalBookForSource('/stories?story=messagers-cite')).toMatchObject({book:{id:'voix-epreuve'},chapter:'ville'});expect(canonicalBookForSource('/journeys/story/fath-makkah')).toMatchObject({book:{id:'prophete-retour-mecque'},chapter:'retour'});});
