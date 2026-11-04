/** The roll ends directly over the letter: the fall has no horizontal travel. */
export function baseballMotion(startX:number,endX:number,baselineY:number,endY:number,size:number){
 const rotation=-(startX-endX)/size*360/Math.PI;
 return {rotation,frames:[
  {transform:`translate3d(${startX}px,${baselineY}px,0)`,offset:0,easing:'linear'},
  {transform:`translate3d(${endX}px,${baselineY}px,0)`,offset:.72,easing:'cubic-bezier(.45,0,1,1)'},
  {transform:`translate3d(${endX}px,${endY}px,0)`,offset:1},
 ]};
}
