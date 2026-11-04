import {useId,useLayoutEffect,useRef} from 'preact/hooks';
import {createPortal} from 'preact/compat';
import {textLineMetrics} from '../../components/textMetrics';
import {baseballMotion,baseballLetterFit,baseballSpinFrames,BASEBALL_LANDING_MS} from './baseballMotion';

function Baseball(){
 const id=useId();
 return <svg viewBox="0 0 100 100" aria-hidden="true"><defs><mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><circle cx="50" cy="50" r="48" fill="white"/><g fill="none" stroke="black" stroke-width="6.5" stroke-dasharray="6 8" stroke-linecap="round"><path d="M8 -4 C29 25 29 75 8 104"/><path d="M92 -4 C71 25 71 75 92 104"/></g></mask></defs><circle cx="50" cy="50" r="48" fill="white" mask={`url(#${id})`}/></svg>;
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
   const title=hole.closest('h2');
   if(title){const offset=parseFloat(getComputedStyle(title).textUnderlineOffset)||0;title.style.setProperty('--foul-underline-top',`${metrics.baseline+offset}px`);}
  };
  fit();const observer=new ResizeObserver(fit);observer.observe(hole);
  void document.fonts.ready.then(fit);
  return()=>observer.disconnect();
 },[]);
 return <>{!probe&&<span class="sr-only">Foul Balls</span>}<span aria-hidden="true">F<span ref={slot} class={`foul-title-o${settled?' is-settled':''}`}><span class="foul-title-hidden-o">o</span>{!probe&&<span class="foul-title-baseball"><Baseball/></span>}</span>ul Balls</span></>;
}
export type BaseballRun={id:number;rollMs:number};
/** Runs after the final normal bold-letter frame of the selected label. */
export function FoulBallsArrival({run,enabled,reduced,awake,onBusyChange,onSettled}:{run:BaseballRun|null;enabled:boolean;reduced:boolean;awake:boolean;onBusyChange:(busy:boolean)=>void;onSettled:(value:boolean)=>void}){
 const flight=useRef<HTMLSpanElement>(null);
 const erasedLetters=useRef<Animation[]>([]),finished=useRef(false),sawIdle=useRef(false);
 useLayoutEffect(()=>{
  if(!run||!enabled)return;
  if(reduced){onSettled(true);return;}
  finished.current=false;sawIdle.current=false;
  onSettled(false);onBusyChange(true);
  let frame=0,cancelled=false,animation:Animation|undefined,spin:Animation|undefined;
  const erased:Animation[]=[];erasedLetters.current=erased;
  const ball=flight.current!;
  const settle=()=>{
   if(cancelled)return;
   erased.forEach(letter=>letter.finish());
   finished.current=true;onSettled(true);ball.style.visibility='hidden';onBusyChange(false);
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
   actualHole?.style.setProperty('--baseball-rotation','0deg');
   // The target title may mount after the roll starts; always settle upright.
   document.querySelector<HTMLElement>('.landing')?.style.setProperty('--baseball-rotation','0deg');
   ball.style.width=`${size}px`;ball.style.height=`${size}px`;ball.style.visibility='visible';
   animation=ball.animate(motion.frames,{duration:run.rollMs+BASEBALL_LANDING_MS,fill:'forwards'});
   spin=ball.firstElementChild!.animate(baseballSpinFrames(motion.rotation,rollFraction),{duration:run.rollMs+BASEBALL_LANDING_MS,fill:'forwards'});
   for(const letter of letters){
    const bounds=letter.getBoundingClientRect();
    const progress=Math.max(0,Math.min(.92,(startX+size/2-(bounds.left+bounds.right)/2)/(startX-x)));
    erased.push(letter.animate([{opacity:1},{opacity:0}],{duration:55,delay:progress*run.rollMs,fill:'forwards'}));
   }
   animation.onfinish=settle;
  });});
  const stopForGeometryChange=()=>{cancelAnimationFrame(frame);animation?.cancel();spin?.cancel();settle();cancelled=true;};
  window.addEventListener('resize',stopForGeometryChange);window.addEventListener('scroll',stopForGeometryChange,{passive:true});
  return()=>{cancelled=true;cancelAnimationFrame(frame);animation?.cancel();spin?.cancel();erased.forEach(letter=>letter.cancel());erasedLetters.current=[];finished.current=false;sawIdle.current=false;ball.style.visibility='hidden';onBusyChange(false);window.removeEventListener('resize',stopForGeometryChange);window.removeEventListener('scroll',stopForGeometryChange);};
 },[run,enabled,reduced]);
 useLayoutEffect(()=>{
  if(!finished.current)return;
  if(!awake){sawIdle.current=true;return;}
  if(sawIdle.current){erasedLetters.current.forEach(letter=>letter.cancel());erasedLetters.current=[];sawIdle.current=false;}
 },[awake]);
 return createPortal(<span ref={flight} class="foul-baseball-flight" aria-hidden="true"><Baseball/></span>,document.body);
}
