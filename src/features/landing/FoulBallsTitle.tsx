import {useId,useLayoutEffect,useRef} from 'preact/hooks';
import {createPortal} from 'preact/compat';
import {textLineMetrics} from '../../components/textMetrics';
import {ILLUSTRATION_MAROON} from '../../content/palette';
import {baseballMotion,baseballLetterFit,baseballSpinFrames,BASEBALL_LANDING_MS,BASEBALL_REST_ANGLE} from './baseballMotion';

function Baseball(){
 const id=useId();
 return <svg viewBox="0 0 100 100" aria-hidden="true"><defs><clipPath id={id}><circle cx="50" cy="50" r="48"/></clipPath></defs><circle cx="50" cy="50" r="48" fill="white"/><g fill="none" stroke={ILLUSTRATION_MAROON} stroke-width="8.75" stroke-dasharray="4.5 10.5" stroke-linecap="round" clip-path={`url(#${id})`}><path d="M12 -4 C36 25 36 75 12 104"/><path d="M88 -4 C64 25 64 75 88 104"/></g></svg>;
}
export function FoulBallsTitle({settled,probe=false}:{settled:boolean;probe?:boolean}){
 const slot=useRef<HTMLSpanElement>(null);
 useLayoutEffect(()=>{
  const hole=slot.current!;
  const fit=()=>{
   const metrics=textLineMetrics(hole,'a');
   const geometry=baseballLetterFit(metrics);
   hole.style.setProperty('--baseball-size',`${geometry.size}px`);
   hole.style.setProperty('--baseball-top',`${geometry.top}px`);
   hole.style.setProperty('--baseball-shift',`${geometry.shift}px`);
   hole.style.setProperty('--baseball-rotation',`${BASEBALL_REST_ANGLE}deg`);
   const title=hole.closest('h2');
   if(title){const offset=parseFloat(getComputedStyle(title).textUnderlineOffset)||0;title.style.setProperty('--foul-underline-top',`${metrics.baseline+offset}px`);}
  };
  fit();const observer=new ResizeObserver(fit);observer.observe(hole);
  void document.fonts.ready.then(fit);
  return()=>observer.disconnect();
 },[]);
 return <>{!probe&&<span class="sr-only">Foul Balls</span>}<span aria-hidden="true">F<span ref={slot} class={`foul-title-o${settled?' is-settled':''}`}><span class="foul-title-hidden-o">o</span>{!probe&&<span class="foul-title-baseball"><Baseball/></span>}</span><span class="foul-title-tail">ul Balls</span></span></>;
}
export type BaseballRun={id:number;rollMs:number;wipeLabel?:boolean};
/** Runs after the final normal bold-letter frame of the selected label. */
export function FoulBallsArrival({run,enabled,reduced,onBusyChange,onSettled,onLabelRestore}:{run:BaseballRun|null;enabled:boolean;reduced:boolean;onBusyChange:(busy:boolean)=>void;onSettled:(value:boolean)=>void;onLabelRestore:(value:boolean)=>void}){
 const flight=useRef<HTMLSpanElement>(null);
 useLayoutEffect(()=>{
  if(!run||!enabled)return;
  if(reduced){onSettled(true);onLabelRestore(true);return;}
  onSettled(false);onLabelRestore(false);onBusyChange(true);
  let frame=0,cancelled=false,animation:Animation|undefined,spin:Animation|undefined,restoreTimer=0,labelsRestored=false;
  const erased:{letter:HTMLElement;animation:Animation}[]=[],fades:Animation[]=[];
  const ball=flight.current!;
  const restoreLabel=()=>{
   if(labelsRestored)return;labelsRestored=true;
   const label=erased[0]?.letter.closest<HTMLElement>('.project-nav-label')||document.querySelector<HTMLElement>('.featured-project-nav button[aria-label="Foul Balls"] .project-nav-label');
   erased.forEach(({letter,animation:erase})=>{
    erase.cancel();
    letter.style.removeProperty('opacity');
   });
   if(label){
    const fade=label.animate([{opacity:0},{opacity:1}],{duration:180,easing:'ease-out',fill:'forwards'});
    fade.onfinish=()=>fade.cancel();fades.push(fade);
   }
   erased.length=0;
   onLabelRestore(true);
  };
  const settle=()=>{
   if(cancelled)return;
   onSettled(true);ball.style.visibility='hidden';onBusyChange(false);
   const indexStillEngaged=!!document.querySelector('.featured-project-nav:hover,.featured-project-nav button:focus-visible');
   if(indexStillEngaged)restoreLabel();
   else restoreTimer=window.setTimeout(restoreLabel,300);
  };
  frame=requestAnimationFrame(()=>{void document.fonts.ready.then(()=>{
   if(cancelled)return;
   const hole=document.querySelector<HTMLElement>('.foul-title-probe .foul-title-o');
   const tab=document.querySelector<HTMLElement>('.featured-project-nav button[aria-label="Foul Balls"]');
   if(!hole||!tab){settle();return;}
   const rect=hole.getBoundingClientRect(),metrics=textLineMetrics(hole,'a'),fit=baseballLetterFit(metrics),size=fit.size;
   const letters=[...tab.querySelectorAll<HTMLElement>('.project-nav-label .project-letter')];
   const nav=letters[0];
   const labelShift=nav?parseFloat(getComputedStyle(nav.parentElement!).translate.split(' ').at(-1)||'0')||0:0;
   const baseline=nav?nav.getBoundingClientRect().top+textLineMetrics(nav).baseline-labelShift:rect.top-24;
   const x=rect.left+rect.width/2+fit.shift-size/2,y=rect.top+fit.top;
   const startX=Math.max(x+size,tab.getBoundingClientRect().right-size);
   const rollFraction=run.rollMs/(run.rollMs+BASEBALL_LANDING_MS);
   const motion=baseballMotion(startX,x,Math.min(baseline-size,y-size),y,size,rollFraction);
   const actualHole=document.querySelector<HTMLElement>('#featured-title .foul-title-o');
   actualHole?.style.setProperty('--baseball-rotation',`${BASEBALL_REST_ANGLE}deg`);
   // The target title may mount after the roll starts; preserve the same resting tilt.
   document.querySelector<HTMLElement>('.landing')?.style.setProperty('--baseball-rotation',`${BASEBALL_REST_ANGLE}deg`);
   ball.style.width=`${size}px`;ball.style.height=`${size}px`;ball.style.visibility='visible';
   animation=ball.animate(motion.frames,{duration:run.rollMs+BASEBALL_LANDING_MS,fill:'forwards'});
   spin=ball.firstElementChild!.animate(baseballSpinFrames(motion.rotation,rollFraction),{duration:run.rollMs+BASEBALL_LANDING_MS,fill:'forwards'});
   for(const letter of run.wipeLabel===false?[]:letters){
    const bounds=letter.getBoundingClientRect();
    const progress=Math.max(0,Math.min(.92,(startX+size/2-(bounds.left+bounds.right)/2)/(startX-x)));
    erased.push({letter,animation:letter.animate([{opacity:1},{opacity:0}],{duration:55,delay:progress*run.rollMs,fill:'forwards'})});
   }
   // Keep the letters erased through the bounce; restore them only once the
   // moving ball is hidden and the tab area is free to return to idle.
   animation.onfinish=settle;
  });});
  const stopForGeometryChange=()=>{cancelAnimationFrame(frame);animation?.cancel();spin?.cancel();settle();cancelled=true;};
  window.addEventListener('resize',stopForGeometryChange);window.addEventListener('scroll',stopForGeometryChange,{passive:true});
  return()=>{cancelled=true;cancelAnimationFrame(frame);window.clearTimeout(restoreTimer);animation?.cancel();spin?.cancel();erased.forEach(({letter,animation})=>{animation.cancel();letter.style.removeProperty('opacity');});fades.forEach(fade=>fade.cancel());ball.style.visibility='hidden';onBusyChange(false);window.removeEventListener('resize',stopForGeometryChange);window.removeEventListener('scroll',stopForGeometryChange);};
 },[run,enabled,reduced,onBusyChange,onSettled,onLabelRestore]);
 return createPortal(<span ref={flight} class="foul-baseball-flight" aria-hidden="true"><Baseball/></span>,document.body);
}
