export type ReadingLayout = 'plain' | 'desk' | 'book';
export type LayoutChoice = 'auto' | ReadingLayout;
export interface Posture { folded:boolean; vertical:boolean; horizontal:boolean; width:number; height:number }
/** Width alone must never be interpreted as a physical fold. */
export function resolveLayout(choice:LayoutChoice,device:Posture):ReadingLayout {
 if(choice==='plain')return 'plain';
 if(choice==='desk')return 'desk';
 if(choice==='book')return device.width>=700?'book':'plain';
 if(device.vertical)return 'desk';
 if(device.horizontal&&device.width>=700)return 'book';
 return 'plain';
}
