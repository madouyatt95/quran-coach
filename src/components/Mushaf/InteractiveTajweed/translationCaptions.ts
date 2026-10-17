/** Preserve source words; favour punctuation and avoid trailing linking words. */
export function translationCaptions(text:string,width:number,measure:(text:string)=>number):string[] {
    const words=text.trim().split(/\s+/u).filter(Boolean),captions:string[]=[];
    const wrap=(tokens:string[])=>{
        const lines:string[]=[];let line='';
        for(const word of tokens){const next=line?`${line} ${word}`:word;if(line&&measure(next)>Math.max(1,width)){lines.push(line);line=word;}else line=next;}
        if(line)lines.push(line);return lines;
    };
    const linking=/^(?:à|de|du|des|le|la|les|un|une|et|ou|qui|que|quand|dans|pour|par|avec|sans|leur|leurs|ce|ces|ne)$/iu;
    for(let start=0;start<words.length;){
        let end=start+1;
        while(end<words.length&&end-start<14&&wrap(words.slice(start,end+1)).length<=2)end++;
        if(end<words.length){
            let boundary=0;
            for(let i=start;i<end;i++)if(/[.!?;:,][»”"')\]]*$/u.test(words[i])&&i-start+1>=Math.max(3,(end-start)*.35))boundary=i+1;
            if(boundary)end=boundary;
            else while(end>start+2&&linking.test(words[end-1]))end--;
        }
        captions.push(wrap(words.slice(start,end)).join('\n'));start=end;
    }
    return captions;
}
/** Reading pace over verse duration; no claim of Arabic/French word alignment. */
export function captionIndex(captions:string[],progress:number):number {
    if(!captions.length)return 0;
    const total=captions.reduce((sum,caption)=>sum+caption.length,0);
    const target=Math.max(0,Math.min(1,Number.isFinite(progress)?progress:0))*total;
    let end=0;
    for(let index=0;index<captions.length;index++){end+=captions[index].length;if(target<end)return index;}
    return captions.length-1;
}
