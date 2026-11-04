import {useLayoutEffect,useRef} from 'preact/hooks';
import {readHex,colorCSS,tweenColor,type RGB} from './colorTween';

/** Paint a shared color directly, retaining the exact last color on interruption. */
export function usePaintedColor(element:{readonly current:HTMLElement|null},property:string,target:string,reduced:boolean,duration:number,onPaint?:(color:string)=>void){
 const current=useRef<RGB|null>(null),callback=useRef(onPaint);callback.current=onPaint;
 useLayoutEffect(()=>{
  const paint=(color:RGB)=>{current.current=color;const value=colorCSS(color);element.current?.style.setProperty(property,value);callback.current?.(value);};
  const next=readHex(target);
  if(!current.current||reduced||current.current.every((value,index)=>Math.abs(value-next[index])<1e-6)){paint(next);return;}
  const start=current.current,started=performance.now();let frame=0;
  const tick=(now:number)=>{
   const progress=Math.min(1,(now-started)/duration);
   paint(tweenColor(start,next,progress));
   if(progress<1)frame=requestAnimationFrame(tick);
  };
  frame=requestAnimationFrame(tick);
  return()=>cancelAnimationFrame(frame);
 },[target,reduced,duration,property]);
}
