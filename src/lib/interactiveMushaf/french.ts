/** QUL resource 95. The supplied wording is preserved; see docs/audits/interactive-tajwid.md. */
export const FRENCH_SOURCE = 'https://qul.tarteel.ai/resources/translation/95';
const files=import.meta.glob<{default:Record<string,string>}>('./french/*.json');
const pending=new Map<number,Promise<Record<string,string>>>();
export function loadFrenchWords(surah:number):Promise<Record<string,string>> {
    if(!Number.isInteger(surah)||surah<1||surah>114)return Promise.reject(new Error('Sourate invalide.'));
    const cached=pending.get(surah);if(cached)return cached;
    const request=files[`./french/${surah}.json`]().then(module=>module.default).catch(error=>{pending.delete(surah);throw error;});
    pending.set(surah,request);return request;
}
