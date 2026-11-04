import {TAB_STROKE_MS} from './timing';
export const BASEBALL_LANDING_MS=600;
export function baseballLetterFit(metrics:{ascent:number;descent:number;baseline:number;width?:number}){
 // Circle radius is 48 inside a 100-unit SVG: size the visible ink, not its box.
 const size=Math.max(metrics.ascent+metrics.descent,metrics.width||0)/.96;
 return {size,top:metrics.baseline+metrics.descent-size*.98,shift:-2};
}
export function baseballSpinFrames(rotation:number,rollFraction:number){
 return [{transform:`rotate(${-rotation}deg)`,offset:0},{transform:'rotate(0deg)',offset:rollFraction},{transform:'rotate(0deg)',offset:1}];
}
/** The roll ends directly over the letter: the fall has no horizontal travel. */
export function baseballMotion(startX:number,endX:number,baselineY:number,endY:number,size:number,rollFraction=.72){
 const rotation=-(startX-endX)/size*360/Math.PI;
 return {rotation,frames:[
  {transform:`translate3d(${startX}px,${baselineY}px,0)`,offset:0,easing:'linear'},
  {transform:`translate3d(${endX}px,${baselineY}px,0)`,offset:rollFraction,easing:'cubic-bezier(.45,0,1,1)'},
  {transform:`translate3d(${endX}px,${endY}px,0)`,offset:rollFraction+(1-rollFraction)*380/BASEBALL_LANDING_MS,easing:'cubic-bezier(.1,.7,.2,1)'},
  {transform:`translate3d(${endX}px,${endY-Math.min(size*.18,6)}px,0)`,offset:rollFraction+(1-rollFraction)*480/BASEBALL_LANDING_MS,easing:'cubic-bezier(.45,0,1,1)'},
  {transform:`translate3d(${endX}px,${endY}px,0)`,offset:1},
 ]};
}

/** Match the last normal bold-letter frame of the destination label. */
export function baseballArrivalTiming(plan:{commitAt:number;contentEndAt:number}){
 const triggerAt=plan.commitAt+Math.max(0,TAB_STROKE_MS-1000/60);
 return {triggerAt,rollMs:Math.max(620,plan.contentEndAt-triggerAt+40)};
}
