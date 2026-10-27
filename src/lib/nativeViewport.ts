export interface NativeRect {x:number;y:number;width:number;height:number}
export interface NativeViewport {width:number;height:number;divisions:NativeRect[];occlusions:NativeRect[]}
export interface NativeFold {layout:'desk'|'book';start:number;size:number}

/** UIKit points are converted to the current CSS viewport, never to screen size. */
export function nativeFold(viewport:NativeViewport|null,width:number,height:number):NativeFold|null {
 if(!viewport||width<=0||height<=0)return null;
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
 return {width:data.width,height:data.height,divisions:rects(data.divisions),occlusions:rects(data.occlusions)};
}
