export type JTransform={x:number;y:number;scaleX:number;scaleY:number;rotation:number;skewX:number;skewY:number};
export type Point={x:number;y:number};
export type Bounds={left:number;right:number;top:number;bottom:number};
export const originalTransform:JTransform={x:0,y:0,scaleX:1,scaleY:1,rotation:0,skewX:0,skewY:0};
export function validTransform(value:unknown):value is JTransform{
 if(!value||typeof value!=='object')return false;
 const v=value as JTransform;
 return Object.keys(originalTransform).every(key=>typeof v[key as keyof JTransform]==='number'&&Number.isFinite(v[key as keyof JTransform]))&&Math.abs(v.x)<=1000&&Math.abs(v.y)<=1000&&v.scaleX>=.1&&v.scaleX<=4&&v.scaleY>=.1&&v.scaleY<=4&&Math.abs(v.rotation)<=360&&Math.abs(v.skewX)<=60&&Math.abs(v.skewY)<=60&&Math.abs(1-Math.tan(v.skewX*Math.PI/180)*Math.tan(v.skewY*Math.PI/180))>=.05;
}
export function jLinear(t:JTransform,p:Point):Point{
 const radians=Math.PI/180,c=Math.cos(t.rotation*radians),s=Math.sin(t.rotation*radians);
 const x=p.x*t.scaleX+Math.tan(t.skewX*radians)*p.y*t.scaleY;
 const y=Math.tan(t.skewY*radians)*p.x*t.scaleX+p.y*t.scaleY;
 return {x:c*x-s*y,y:s*x+c*y};
}
export function transformJ(t:JTransform,b:Bounds,p:Point):Point{
 const cx=(b.left+b.right)/2,cy=(b.top+b.bottom)/2;
 const q=jLinear(t,{x:p.x-cx,y:p.y-cy});
 return {x:cx+t.x+q.x,y:cy+t.y+q.y};
}
/** Preserve the opposite handle while changing scale about the shared center. */
export function anchorJ(before:JTransform,after:JTransform,b:Bounds,anchor:Point):JTransform{
 const previous=transformJ(before,b,anchor),next=transformJ(after,b,anchor);
 return {...after,x:after.x+previous.x-next.x,y:after.y+previous.y-next.y};
}
