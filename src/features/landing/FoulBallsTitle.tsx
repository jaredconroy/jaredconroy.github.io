import {useId,useLayoutEffect,useRef,useState} from 'preact/hooks';
import {createPortal} from 'preact/compat';
import {textLineMetrics} from '../../components/textMetrics';
import {baseballMotion} from './baseballMotion';

function Baseball(){
 const id=useId();
 return <svg viewBox="0 0 100 100" aria-hidden="true"><defs><mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><circle cx="50" cy="50" r="48" fill="white"/><g fill="none" stroke="black" stroke-width="4" stroke-dasharray="6 5" stroke-linecap="round"><path d="M20 -4 C53 25 53 75 20 104"/><path d="M80 -4 C47 25 47 75 80 104"/></g></mask></defs><circle cx="50" cy="50" r="48" fill="white" mask={`url(#${id})`}/></svg>;
}
/** One measured flight across the tab baseline, then straight into the title. */
export function FoulBallsTitle({ready,reduced,onBusyChange}:{ready:boolean;reduced:boolean;onBusyChange:(busy:boolean)=>void}){
 const slot=useRef<HTMLSpanElement>(null),flight=useRef<HTMLSpanElement>(null),played=useRef(false);
 const [settled,setSettled]=useState(reduced);
 useLayoutEffect(()=>{
  const hole=slot.current!;
  const fit=()=>{
   const metrics=textLineMetrics(hole,'o');
   const size=metrics.ascent+metrics.descent;
   hole.style.setProperty('--baseball-size',`${size}px`);
   hole.style.setProperty('--baseball-top',`${metrics.baseline-metrics.ascent}px`);
   return {metrics,size};
  };
  fit();const observer=new ResizeObserver(fit);observer.observe(hole);
  void document.fonts.ready.then(fit);
  return()=>observer.disconnect();
 },[]);
 useLayoutEffect(()=>{
  if(!ready)return;
  if(reduced||played.current){setSettled(true);return;}
  onBusyChange(true);
  let first=0,second=0,startTimer:ReturnType<typeof setTimeout>|undefined,cancelled=false,animation:Animation|undefined,spin:Animation|undefined;
  const ball=flight.current!;
  const settle=()=>{
   if(cancelled)return;
   setSettled(true);ball.style.visibility='hidden';onBusyChange(false);
  };
  // Let raised tab/label geometry settle before measuring its baseline.
  first=requestAnimationFrame(()=>{second=requestAnimationFrame(()=>{startTimer=setTimeout(()=>{
   if(cancelled)return;
   const hole=slot.current!,rect=hole.getBoundingClientRect(),metrics=textLineMetrics(hole,'o');
   const size=metrics.ascent+metrics.descent;
   const nav=document.querySelector<HTMLElement>('.featured-project-nav button[aria-label="Foul Balls"] .project-nav-label .project-letter');
   const baseline=nav?nav.getBoundingClientRect().top+textLineMetrics(nav).baseline:rect.top-24;
   const x=rect.left+rect.width/2-size/2,y=rect.top+metrics.baseline-metrics.ascent;
   const motion=baseballMotion(innerWidth+size,x,Math.min(baseline-size,y-size),y,size);
   hole.style.setProperty('--baseball-rotation',`${motion.rotation}deg`);
   ball.style.width=`${size}px`;ball.style.height=`${size}px`;ball.style.visibility='visible';
   animation=ball.animate(motion.frames,{duration:1300,fill:'forwards'});
   spin=ball.firstElementChild!.animate([{transform:'rotate(0deg)',offset:0},{transform:`rotate(${motion.rotation}deg)`,offset:.72},{transform:`rotate(${motion.rotation}deg)`,offset:1}],{duration:1300,fill:'forwards'});
   played.current=true;
   animation.onfinish=settle;
  },160);});});
  const stopForGeometryChange=()=>{if(played.current){animation?.cancel();spin?.cancel();settle();}};
  window.addEventListener('resize',stopForGeometryChange);window.addEventListener('scroll',stopForGeometryChange,{passive:true});
  return()=>{cancelled=true;cancelAnimationFrame(first);cancelAnimationFrame(second);clearTimeout(startTimer);animation?.cancel();spin?.cancel();ball.style.visibility='hidden';onBusyChange(false);window.removeEventListener('resize',stopForGeometryChange);window.removeEventListener('scroll',stopForGeometryChange);};
 },[ready,reduced]);
 return <><span class="sr-only">Foul Balls</span><span aria-hidden="true">F<span ref={slot} class={`foul-title-o${settled?' is-settled':''}`}><span class="foul-title-hidden-o">o</span><span class="foul-title-baseball"><Baseball/></span></span>ul Balls</span>{createPortal(<span ref={flight} class="foul-baseball-flight" aria-hidden="true"><Baseball/></span>,document.body)}</>;
}
