export type ReadingLayout = 'plain' | 'desk' | 'book';
export type LayoutChoice = 'auto' | ReadingLayout;
export type PupitreActivity = 'reader'|'book'|'catalogue'|'memorization'|'quiz'|'course'|'arabic';
export interface Posture { folded:boolean; vertical:boolean; horizontal:boolean; width:number; height:number; nativeFold?:import('../../lib/nativeViewport').NativeFold|null }
/** Width alone must never be interpreted as a physical fold. */
export function resolveLayout(choice:LayoutChoice,device:Posture):ReadingLayout {
 const canBook=device.horizontal||device.width>=700;
 if(choice==='plain')return 'plain';
 if(choice==='desk')return 'desk';
 if(choice==='book')return canBook?'book':'plain';
 if(device.vertical)return 'desk';
 if(device.horizontal)return 'book';
 return 'plain';
}
