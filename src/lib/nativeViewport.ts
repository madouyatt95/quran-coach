export interface NativeRect {x:number;y:number;width:number;height:number}
export interface NativeViewport {width:number;height:number;divisions:NativeRect[];occlusions:NativeRect[];statusBar?:NativeRect}
export interface NativeFold {layout:'desk'|'book';start:number;size:number}

/** UIKit points are converted to the current CSS viewport, never to screen size. */
export function nativeFold(viewport:NativeViewport|null,width:number,height:number):NativeFold|null {
 if(!viewport||width<=0||height<=0)return null;
 // During rotation UIKit can report its previous bounds before the CSS resize.
 // Do not stretch a vertical hinge into the new landscape viewport.
 const sourceRatio=viewport.width/viewport.height,targetRatio=width/height;
 if((sourceRatio<1)!==(targetRatio<1)&&Math.abs(Math.log(sourceRatio/targetRatio))>.2)return null;
 for(const frame of viewport.divisions){
  const x=Math.max(0,frame.x),y=Math.max(0,frame.y);
  const right=Math.min(viewport.width,frame.x+frame.width),bottom=Math.min(viewport.height,frame.y+frame.height);
  if(right-x>=viewport.width*.8&&y>0&&bottom<viewport.height&&bottom-y<viewport.height*.4)
   return {layout:'desk',start:y/viewport.height*height,size:Math.max(0,bottom-y)/viewport.height*height};
  if(bottom-y>=viewport.height*.8&&x>0&&right<viewport.width&&right-x<viewport.width*.4)
   return {layout:'book',start:x/viewport.width*width,size:Math.max(0,right-x)/viewport.width*width};
 }
 return null;
}

export function parseNativeViewport(value:unknown):NativeViewport|null {
 if(!value||typeof value!=='object')return null;
 const data=value as Record<string,unknown>;
 if(typeof data.width!=='number'||typeof data.height!=='number'||!Number.isFinite(data.width)||!Number.isFinite(data.height)||data.width<=0||data.height<=0)return null;
 const rects=(items:unknown):NativeRect[]=>Array.isArray(items)?items.filter((r):r is NativeRect=>!!r&&typeof r==='object'&&['x','y','width','height'].every(key=>typeof r[key]==='number'&&Number.isFinite(r[key]))&&r.width>=0&&r.height>=0):[];
 const statusBar=rects([data.statusBar])[0];
 return {width:data.width,height:data.height,divisions:rects(data.divisions),occlusions:rects(data.occlusions),...(statusBar?{statusBar}:{})};
}

/** A corner/side status bar needs horizontal clearance for header controls, not
 * a full-width empty row. Keep ordinary full-width iPhone safe areas intact. */
export function nativeHeaderClearance(viewport:NativeViewport|null){
 if(!viewport)return null;
 // On Duo statusBarFrame may only describe a thin full-width strip. UIKit's
 // occlusion regions include the actual status/camera footprint and margins.
 const bars=[...viewport.occlusions,...(viewport.statusBar?[viewport.statusBar]:[])];
 let left=0,right=0;
 for(const bar of bars){
  if(bar.width<=0||bar.height<=0||bar.width>=viewport.width*.45||bar.height>viewport.height*.4||bar.y>4)continue;
  if(bar.x<=4)left=Math.max(left,bar.x+bar.width);
  if(bar.x+bar.width>=viewport.width-4)right=Math.max(right,viewport.width-bar.x);
 }
 return left||right?{left:Math.max(0,left),right:Math.max(0,right)}:null;
}
