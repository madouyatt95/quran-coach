/** Fit the verified 468-unit text column with a safety gutter in immersion.
 * Outer decorative margins may pan offscreen; words retain their aspect ratio.
 */
export function readerPageScale(width:number,height:number,spread:boolean,immersive:boolean,zoom:number){
    if(spread)return Math.min((width-(immersive?4:32))/1200,height/860,immersive?1.6:1.25);
    if(immersive)return Math.min(width/484,height/860,1.6)*zoom/1.15;
    return Math.min(width/600,height/860,1.25)*zoom;
}
