import {useId,useLayoutEffect,useRef} from 'preact/hooks';
import artwork from '../../public/media/the-sleds/wordmark2.svg?raw';
import sledboy from '../../public/media/the-sleds/sledboy.svg?raw';

const viewBox=artwork.match(/viewBox="([^"]+)"/)![1];
const [svgX,svgY,svgWidth,svgHeight]=viewBox.split(/\s+/).map(Number);
const paths=artwork.replace(/^[\s\S]*?<svg[^>]*>/,'').replace(/<\/svg>[\s\S]*$/,'');
// Match the lower runner's slope, independently of the riders' formation.
const angle=Math.atan(107.43/194.84),dx=Math.cos(angle),dy=Math.sin(angle);

export function SledsWordmarkArrival({ready,reduced,onBusyChange}:{ready:boolean;reduced:boolean;onBusyChange:(busy:boolean)=>void}){
 const root=useRef<HTMLSpanElement>(null),wipe=useRef<SVGRectElement>(null),started=useRef(false);
 const clipId=useId();
 const paint=(front:number)=>wipe.current?.setAttribute('transform',`matrix(${dx} ${dy} ${-dy} ${dx} ${svgX+dx*front} ${svgY+dy*front})`);
 const revealAll=()=>paint(svgWidth*dx+svgHeight*dy+32);
 useLayoutEffect(()=>{if(reduced)revealAll();},[reduced]);
 useLayoutEffect(()=>{
  if(!ready||started.current||reduced)return;
  started.current=true;
  const element=root.current!,riders=[...element.querySelectorAll<HTMLElement>('.sleds-rider')];
  let cancelled=false,frame=0;
  const animations:Animation[]=[];
  const hideRiders=()=>riders.forEach(rider=>rider.style.visibility='hidden');
  const settle=()=>{cancelAnimationFrame(frame);revealAll();hideRiders();animations.forEach(animation=>animation.cancel());onBusyChange(false);};
  onBusyChange(true);
  void document.fonts.ready.then(()=>{
   if(cancelled)return;
   const bounds=element.getBoundingClientRect(),style=getComputedStyle(element);
   const width=parseFloat(style.width),height=parseFloat(style.height);
   if(!width||!height){settle();return;}
   const size=Math.max(24,Math.min(46,height*.92)),spacing=size*1.5,duration=1550;
   const scaleY=bounds.height/height||1;
   const panelBottom=((element.closest('.feature-details')?.getBoundingClientRect().bottom??bounds.bottom)-bounds.top)/scaleY;
   const bodyHeight=size*(399.36/335.5),centerX=width*.04+spacing*(dx+dy)/dy-24,centerY=height/2;
   const start=(-size*.5-18-centerX-spacing)/dx;
   const end=(panelBottom+size+bodyHeight*.86-centerY+spacing)/dy,travel=end-start;
   // The last rider finishes as a punctuation mark beside the fully revealed
   // wordmark, with its body centered on the title's vertical midpoint.
   const targetX=width+size*.42,targetY=(height-bodyHeight)/2;
   const stopX=targetX,stopY=targetY;
   const thirdOffset=spacing;
   const thirdStartX=centerX+thirdOffset+dx*start-size/2;
   const thirdStartY=centerY-thirdOffset+dy*start-bodyHeight*.86;
   const revealDuration=duration*Math.hypot(stopX-thirdStartX,stopY-thirdStartY)/travel;
   const arrivalLag=180,wordmarkLead=120,thirdDistance=Math.hypot(stopX-thirdStartX,stopY-thirdStartY);
   const extension=thirdDistance/revealDuration*arrivalLag;
   const delayedStartX=thirdStartX+(thirdStartX-stopX)/thirdDistance*extension;
   const delayedStartY=thirdStartY+(thirdStartY-stopY)/thirdDistance*extension;
   let otherRidersGone=false,lastRiderLanded=false;
   const finishIfReady=()=>{if(otherRidersGone&&lastRiderLanded)onBusyChange(false);};
   riders.forEach((rider,index)=>{
    const offset=(index-1)*spacing;
    const x=centerX+offset+dx*start-size/2,y=centerY-offset+dy*start-bodyHeight*.86;
    const travelTo=end-start;
    rider.style.width=`${size}px`;rider.style.visibility='visible';
    const motion=rider.animate(index===2?[
     {transform:`translate3d(${delayedStartX}px,${delayedStartY}px,0)`},
     {transform:`translate3d(${stopX}px,${stopY}px,0)`},
    ]:[
     {transform:`translate3d(${x}px,${y}px,0)`},
     {transform:`translate3d(${x+dx*travelTo}px,${y+dy*travelTo}px,0)`},
    ],{duration:index===2?revealDuration+arrivalLag:duration,easing:'linear',fill:'both'});
    animations.push(motion);
    if(index===0)motion.onfinish=()=>{riders[0].style.visibility='hidden';riders[1].style.visibility='hidden';otherRidersGone=true;finishIfReady();};
    if(index===2)motion.onfinish=()=>{lastRiderLanded=true;finishIfReady();};
   });
   const initialFront=centerX*dx+centerY*dy+start-spacing*(dx-dy)-size*.25;
   const startedAt=performance.now()+90+arrivalLag,units=svgWidth/width;
   const wipeDuration=Math.max(1,revealDuration-wordmarkLead);
   const revealTravel=Math.max(0,(svgWidth*dx+svgHeight*dy+32)/units-initialFront);
   paint(initialFront*units);
   // Move one permanent SVG clipping rectangle. Its geometry and paint layer
   // never change at completion, unlike morphing CSS polygons / clip removal.
   const tick=(now:number)=>{
    if(cancelled)return;
    const progress=Math.max(0,Math.min(1,(now-startedAt)/wipeDuration));
    paint((initialFront+revealTravel*progress)*units);
    if(progress<1)frame=requestAnimationFrame(tick);
   };
   frame=requestAnimationFrame(tick);
  });
  const resize=()=>{cancelled=true;settle();};
  window.addEventListener('resize',resize,{passive:true});
  return()=>{cancelled=true;settle();window.removeEventListener('resize',resize);};
 },[ready,reduced,onBusyChange]);
 return <span ref={root} class="sleds-wordmark-arrival" aria-hidden="true">
  <span class="sleds-wake sleds-wordmark" style={{aspectRatio:`${svgWidth}/${svgHeight}`}}>
   <svg viewBox={viewBox} aria-hidden="true">
    <defs><clipPath id={clipId} clipPathUnits="userSpaceOnUse"><rect ref={wipe} x="-8192" y="-8192" width="8192" height="16384" transform="translate(-16384 0)"/></clipPath></defs>
    <g clip-path={`url(#${clipId})`} dangerouslySetInnerHTML={{__html:paths}}/>
   </svg>
  </span>
  {!reduced&&[0,1,2].map(index=><span key={index} class="sleds-rider" dangerouslySetInnerHTML={{__html:sledboy}}/>)}
 </span>;
}
