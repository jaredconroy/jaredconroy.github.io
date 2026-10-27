import {useLayoutEffect,useRef} from 'preact/hooks';
import {RoleDescriptor} from '../../components/RoleDescriptor';

/** Two masked vertical tracks decelerate together into the canonical pair. */
export function IntroRoleReel({titles,finalPair,onSettled}:{titles:string[];finalPair:[string,string];onSettled:()=>void}){
 const root=useRef<HTMLDivElement>(null),done=useRef(onSettled);done.current=onSettled;
 const count=titles.length+6;
 useLayoutEffect(()=>{
  const tracks=root.current?.querySelectorAll<HTMLElement>('.intro-reel-track');
  if(!tracks)return;
  let alive=true;
  const animations=[...tracks].map(track=>track.animate([
   {transform:'translateY(0)'},
   {transform:'translateY(calc(-100% + var(--label-row)))'}
  ],{duration:2200,easing:'cubic-bezier(.12,.78,.2,1)',fill:'forwards'}));
  void Promise.all(animations.map(animation=>animation.finished)).then(()=>{if(alive)done.current();}).catch(()=>{});
  return()=>{alive=false;animations.forEach(animation=>animation.cancel());};
 },[]);
 return <div ref={root} class="role-pair intro-reel-pair">
  {(['one','two'] as const).map((position,side)=><div class={`intro-reel-slot intro-reel-${position}`}>
   <div class="intro-reel-viewport"><div class="intro-reel-track">
    {[...Array.from({length:count},(_,i)=>titles[(i+side*7)%titles.length]),finalPair[side]].map((title,i)=><div class="intro-reel-row" key={i}><RoleDescriptor label={title} position={position}/></div>)}
   </div></div>
  </div>)}
 </div>;
}
