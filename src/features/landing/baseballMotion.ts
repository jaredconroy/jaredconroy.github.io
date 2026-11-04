export const BASEBALL_LANDING_MS=600;
export function baseballLetterFit(metrics:{ascent:number;descent:number;baseline:number}){
 const size=(metrics.ascent+metrics.descent)*1.18;
 return {size,top:metrics.baseline+metrics.descent-size,shift:size*.035};
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

/** Start as the final neighboring tab receives the bold wave. */
export function baseballArrivalTiming(plan:{passes:readonly {start:number}[];contentEndAt:number}){
 const triggerAt=plan.passes.at(-1)?.start??0;
 return {triggerAt,rollMs:Math.max(620,plan.contentEndAt-triggerAt+40)};
}
