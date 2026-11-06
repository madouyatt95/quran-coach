import registry from '../data/retiredSiwis.json';
const retired:Record<string,{bookId:string;chapterId:string}>=registry;
/** Editorial replacements, not identical recordings: old time offsets must never migrate. */
export function retiredNarrationDestination(id:string){return retired[id.replace(/^audio:/,'')]||null;}
export function retiredNarrationHref(id:string){const target=retiredNarrationDestination(id);return target?`/books/${target.bookId}?chapter=${encodeURIComponent(target.chapterId)}`:null;}
export function migrateNarrationFavorites(favorites:string[]){return [...new Set(favorites.map(id=>{const replacement=retiredNarrationDestination(id);return replacement?`book:${replacement.bookId}`:id;}))];}
