import strokes from '../../content/signature-strokes.json';
import brush from '../../content/signature-brush.json';
import layout from '../../content/signature-layout.json';
import {transformJ,type Bounds,type JTransform} from './transform';

const sourceBounds=strokes.map(stroke=>stroke.points.reduce((b,[x,y])=>({left:Math.min(b.left,x),right:Math.max(b.right,x),top:Math.min(b.top,y),bottom:Math.max(b.bottom,y)}),{left:Infinity,right:-Infinity,top:Infinity,bottom:-Infinity}));
export const signatureJBounds:Bounds=layout.j;
export const signatureNibAngle=brush.angle*Math.PI/180;
export const signatureHalfWidth=Math.hypot(brush.major*Math.cos(signatureNibAngle),brush.minor*Math.sin(signatureNibAngle));
export const signatureHalfHeight=Math.hypot(brush.major*Math.sin(signatureNibAngle),brush.minor*Math.cos(signatureNibAngle));

/** The approved desktop geometry is the single source for every viewport. */
export function signaturePoint(index:number,x:number,y:number,transform:JTransform):[number,number]{
 const source=sourceBounds[index];
 if(index===0){
  const b=signatureJBounds,p=transformJ(transform,b,{x:b.left+(x-source.left)*(b.right-b.left)/(source.right-source.left),y:b.top+(y-source.top)*(b.bottom-b.top)/(source.bottom-source.top)});
  return [p.x,p.y];
 }
 return [source.left+(x-source.left)*layout.aredScale,source.top+(y-source.top)*layout.aredScale];
}
export function signatureGeometry(transform:JTransform){
 const points=strokes.map((stroke,index)=>stroke.points.map(([x,y])=>signaturePoint(index,x,y,transform)));
 const all=points.flat();
 const ink={left:Math.min(...all.map(p=>p[0]))-signatureHalfWidth,right:Math.max(...all.map(p=>p[0]))+signatureHalfWidth,top:Math.min(...all.map(p=>p[1]))-signatureHalfHeight,bottom:Math.max(...all.map(p=>p[1]))+signatureHalfHeight};
 const jBottom=Math.max(...points[0].map(p=>p[1]))+signatureHalfHeight;
 const aredBottom=Math.max(...points[1].map(p=>p[1]))+signatureHalfHeight;
 const wordBaseline=sourceBounds[1].top+(276-sourceBounds[1].top)*layout.aredScale;
 return {points,ink,jBottom,aredBottom,wordBaseline};
}
export function fitSignature(ink:Bounds,width:number,left:number,top:number){
 const scale=width/(ink.right-ink.left);
 return {scale,x:left-ink.left*scale,y:top-ink.top*scale};
}

/** Enlarge ink around a source landmark without moving that landmark on screen. */
export function scaleSignatureAt(fit:{scale:number;x:number;y:number},factor:number,[x,y]:[number,number]){
 return {scale:fit.scale*factor,x:fit.x+x*fit.scale*(1-factor),y:fit.y+y*fit.scale*(1-factor)};
}
