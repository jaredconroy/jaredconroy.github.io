import {useId,useLayoutEffect,useRef} from 'preact/hooks';
import {createPortal} from 'preact/compat';
import {textLineMetrics} from '../../components/textMetrics';
import {baseballMotion} from './baseballMotion';

function Baseball(){
 const id=useId();
 return <svg viewBox="0 0 100 100" aria-hidden="true"><defs><mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><circle cx="50" cy="50" r="48" fill="white"/><g fill="none" stroke="black" stroke-width="6.5" stroke-dasharray="6 5" stroke-linecap="round"><path d="M10 -4 C35 25 35 75 10 104"/><path d="M90 -4 C65 25 65 75 90 104"/></g></mask></defs><circle cx="50" cy="50" r="48" fill="white" mask={`url(#${id})`}/></svg>;
}
export function FoulBallsTitle({settled,probe=false}:{settled:boolean;probe?:boolean}){
 const slot=useRef<HTMLSpanElement>(null);
 useLayoutEffect(()=>{
  const hole=slot.current!;
  const fit=()=>{
   const metrics=textLineMetrics(hole,'o');
   hole.style.setProperty('--baseball-size',`${metrics.ascent+metrics.descent}px`);
   hole.style.setProperty('--baseball-top',`${metrics.baseline-metrics.ascent}px`);
  };
  fit();const observer=new ResizeObserver(fit);observer.observe(hole);
  void document.fonts.ready.then(fit);
  return()=>observer.disconnect();
 },[]);
 return <>{!probe&&<span class="sr-only">Foul Balls</span>}<span aria-hidden="true">F<span ref={slot} class={`foul-title-o${settled?' is-settled':''}`}><span class="foul-title-hidden-o">o</span>{!probe&&<span class="foul-title-baseball"><Baseball/></span>}</span>ul Balls</span></>;
}
export type BaseballRun={id:number;rollMs:number};
/** Starts with the neighboring label's handoff, before the incoming title swaps. */
export function FoulBallsArrival({run,enabled,reduced,onBusyChange,onSettled}:{run:BaseballRun|null;enabled:boolean;reduced:boolean;onBusyChange:(busy:boolean)=>void;onSettled:(value:boolean)=>void}){
 const flight=useRef<HTMLSpanElement>(null);
 useLayoutEffect(()=>{
  if(!run||!enabled)return;
  if(reduced){onSettled(true);return;}
  onSettled(false);onBusyChange(true);
  let frame=0,cancelled=false,animation:Animation|undefined,spin:Animation|undefined;
  const erased:Animation[]=[];
  const ball=flight.current!;
  const settle=()=>{
   if(cancelled)return;
   erased.forEach(letter=>letter.finish());
   onSettled(true);ball.style.visibility='hidden';onBusyChange(false);
  };
  frame=requestAnimationFrame(()=>{void document.fonts.ready.then(()=>{
   if(cancelled)return;
   const hole=document.querySelector<HTMLElement>('.foul-title-probe .foul-title-o');
   const tab=document.querySelector<HTMLElement>('.featured-project-nav button[aria-label="Foul Balls"]');
   if(!hole||!tab){settle();return;}
   const rect=hole.getBoundingClientRect(),metrics=textLineMetrics(hole,'o'),size=metrics.ascent+metrics.descent;
   const letters=[...tab.querySelectorAll<HTMLElement>('.project-nav-label .project-letter')];
   const nav=letters[0];
   const labelShift=nav?parseFloat(getComputedStyle(nav.parentElement!).translate.split(' ').at(-1)||'0')||0:0;
   const baseline=nav?nav.getBoundingClientRect().top+textLineMetrics(nav).baseline-labelShift:rect.top-24;
   const x=rect.left+rect.width/2-size/2,y=rect.top+metrics.baseline-metrics.ascent;
   const startX=Math.max(x+size,tab.getBoundingClientRect().right-size);
   const rollFraction=run.rollMs/(run.rollMs+380);
   const motion=baseballMotion(startX,x,Math.min(baseline-size,y-size),y,size,rollFraction);
   const actualHole=document.querySelector<HTMLElement>('#featured-title .foul-title-o');
   actualHole?.style.setProperty('--baseball-rotation',`${motion.rotation}deg`);
   // The target title may mount after the roll starts; retain its final angle.
   document.querySelector<HTMLElement>('.landing')?.style.setProperty('--baseball-rotation',`${motion.rotation}deg`);
   ball.style.width=`${size}px`;ball.style.height=`${size}px`;ball.style.visibility='visible';
   animation=ball.animate(motion.frames,{duration:run.rollMs+380,fill:'forwards'});
   spin=ball.firstElementChild!.animate([{transform:'rotate(0deg)',offset:0},{transform:`rotate(${motion.rotation}deg)`,offset:rollFraction},{transform:`rotate(${motion.rotation}deg)`,offset:1}],{duration:run.rollMs+380,fill:'forwards'});
   for(const letter of letters){
    const bounds=letter.getBoundingClientRect();
    const progress=Math.max(0,Math.min(.92,(startX+size/2-(bounds.left+bounds.right)/2)/(startX-x)));
    erased.push(letter.animate([{opacity:1},{opacity:0}],{duration:55,delay:progress*run.rollMs,fill:'forwards'}));
   }
   animation.onfinish=settle;
  });});
  const stopForGeometryChange=()=>{cancelAnimationFrame(frame);animation?.cancel();spin?.cancel();settle();cancelled=true;};
  window.addEventListener('resize',stopForGeometryChange);window.addEventListener('scroll',stopForGeometryChange,{passive:true});
  return()=>{cancelled=true;cancelAnimationFrame(frame);animation?.cancel();spin?.cancel();erased.forEach(letter=>letter.cancel());ball.style.visibility='hidden';onBusyChange(false);window.removeEventListener('resize',stopForGeometryChange);window.removeEventListener('scroll',stopForGeometryChange);};
 },[run,enabled,reduced]);
 return createPortal(<span ref={flight} class="foul-baseball-flight" aria-hidden="true"><Baseball/></span>,document.body);
}
