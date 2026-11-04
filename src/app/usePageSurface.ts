import {useLayoutEffect,useRef} from 'preact/hooks';
import {readHex,colorCSS,tweenColor,type RGB} from './colorTween';

/** One continuously painted document canvas, without a temporary animation layer. */
export function usePageSurface(surface:string,reduced:boolean,duration:number,headerVisible:boolean){
 const current=useRef<RGB|null>(null),header=useRef(headerVisible);header.current=headerVisible;
 const paint=(color:RGB)=>{
  current.current=color;const value=colorCSS(color);
  document.body.style.backgroundColor=value;
  document.body.style.setProperty('--painted-surface',value);
  if(!header.current)document.documentElement.style.backgroundColor=value;
 };
 useLayoutEffect(()=>{if(current.current)paint(current.current);},[surface,headerVisible]);
 useLayoutEffect(()=>{
  const target=readHex(surface);
  if(!current.current||reduced||current.current.every((value,index)=>Math.abs(value-target[index])<1e-6)){paint(target);return;}
  const start=current.current,startedAt=performance.now();let frame=0;
  const tick=(now:number)=>{
   const progress=Math.min(1,(now-startedAt)/duration);
   paint(tweenColor(start,target,progress));
   if(progress<1)frame=requestAnimationFrame(tick);
  };
  frame=requestAnimationFrame(tick);
  return()=>cancelAnimationFrame(frame);
 },[surface,reduced,duration]);
}
