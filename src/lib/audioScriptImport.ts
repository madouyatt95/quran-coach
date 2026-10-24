import {AUDIO_CATEGORIES,assertFrenchScript,type AudioScript} from './audioProduction';

export function parseAudioScriptImport(json:string):AudioScript[]{
 if(json.length>1000000)throw new Error('Le fichier dépasse 1 Mo.');
 const data:unknown=JSON.parse(json);
 if(!Array.isArray(data)||data.length<1||data.length>100)throw new Error('Le fichier doit contenir entre 1 et 100 scripts.');
 const seen=new Set<string>();
 return data.map((item:unknown)=>{
  if(!item||typeof item!=='object')throw new Error('Script invalide.');
  const value=item as Record<string,unknown>;
  for(const [key,max] of [['title',180],['original_text',20000],['source_url',1000],['reference',2000],['rights',3000]] as const){
   if(typeof value[key]!=='string'||!value[key].trim()||value[key].length>max)throw new Error(`Champ ${key} absent ou trop long.`);
  }
  if(typeof value.category!=='string'||!Object.hasOwn(AUDIO_CATEGORIES,value.category))throw new Error('Catégorie invalide.');
  if(typeof value.text!=='string')throw new Error('Texte français absent.');
  assertFrenchScript(value.text);
  const url=value.source_url as string;
  if(!/^https:\/\//.test(url)&&!/^\/(?!\/)/.test(url))throw new Error('Lien source invalide.');
  const identity=JSON.stringify([value.title,value.text,value.reference]);
  if(seen.has(identity))throw new Error('Deux scripts identiques figurent dans le fichier.');
  seen.add(identity);
  return {id:'',title:value.title as string,category:value.category as AudioScript['category'],text:value.text,original_text:value.original_text as string,source_url:url,reference:value.reference as string,rights:value.rights as string,approved_by:null};
 });
}
