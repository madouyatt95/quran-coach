/** Search normalization only. Original religious text is never modified for display. */
export function normalizeSearch(text:string):string {
 return text.normalize('NFD').replace(/[\u0300-\u036f\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').toLocaleLowerCase('fr').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
}
export function rankSearch(query:string,title:string,text:string):number {
 const q=normalizeSearch(query),t=normalizeSearch(title),body=normalizeSearch(text);
 if(q.length<2)return 0;
 const words=q.split(/\s+/).filter(w=>!['le','la','les','de','des','du','un','une','et','a'].includes(w));
 if(!words.length)return 0;
 if(t===q)return 120;if(t.includes(q))return 100;if(body.includes(q))return 70;
 return words.every(w=>`${t} ${body}`.includes(w))?40:0;
}
export function searchExcerpt(text:string,query:string,max=420):string {
 if(text.length<=max)return text;
 // Select an original paragraph; normalized offsets must never slice accented/Arabic text.
 const paragraphs=text.split(/\n+|(?<=[.!?])\s+/),best=paragraphs.find(p=>rankSearch(query,'',p)>0)||paragraphs[0]||text;
 return best.length>max?best.slice(0,max).replace(/\s+\S*$/,'')+'…':best;
}
