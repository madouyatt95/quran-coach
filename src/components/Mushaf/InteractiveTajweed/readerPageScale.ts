export type ReaderFraming = 'text' | 'page';
// Keep the stored zoom scale compatible with existing preferences and backups.
export const READER_BASE_ZOOM = 1.15;
const PAPER_WIDTH = 600, PAPER_HEIGHT = 860, SPREAD_GAP = 4;

/** Enlarge the verified 468-unit text column without recomposing any lines.
 * In text framing only the outer decoration is cropped; vertical scrolling
 * preserves legibility on short screens and in the upper half of a desk.
 * Page framing fits the entire sheet (or spread) into the available viewport.
 */
export function readerPageScale(width:number,height:number,spread:boolean,_immersive:boolean,zoom:number,framing:ReaderFraming='text',page=3){
    const available=Math.max(1,width-(spread?SPREAD_GAP:0));
    const fullWidth=spread?PAPER_WIDTH*2:PAPER_WIDTH;
    // 8 units of safety either side of the text. Keep the central book gutter.
    const opening=page<=2;
    const textWidth=spread?(opening?1000:1084):(opening?400:484);
    const fit=framing==='page'
        ?Math.min(available/fullWidth,Math.max(1,height)/PAPER_HEIGHT)
        :available/textWidth;
    return Math.min(fit,1.6)*zoom/READER_BASE_ZOOM;
}

/** At least 318 CSS pixels of text per leaf, without a short landscape spread. */
export function canShowBookSpread(width:number,height:number){return width>=740&&height>=430;}
