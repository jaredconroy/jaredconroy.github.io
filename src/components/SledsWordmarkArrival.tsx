import {useLayoutEffect,useRef} from 'preact/hooks';
import {SledsWordmark} from './SledsWordmark';
import sledboy from '../../public/media/the-sleds/sledboy.svg?raw';

// The lower runner in sledboy.svg slopes 107.43 units over 194.84 units.
const slope=107.43/194.84;
const angle=Math.atan(slope),dx=Math.cos(angle),dy=Math.sin(angle);
/** A half-plane clips the title directly behind the descending riders. */
function wake(width:number,height:number,front:number){
 const corners=[[0,0],[width,0],[width,height],[0,height]];
 const points:number[][]=[];
 for(let i=0;i<corners.length;i++){
  const a=corners[i],b=corners[(i+1)%corners.length];
  const pa=a[0]*dx+a[1]*dy,pb=b[0]*dx+b[1]*dy;
  if(pa<=front)points.push(a);
  if((pa<=front)!==(pb<=front)){
   const t=(front-pa)/(pb-pa);points.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);
  }
 }
 // Keep keyframes compatible polygons, including the fully hidden state.
 while(points.length<6)points.push(points.at(-1)||[0,0]);
 return `polygon(${points.map(([x,y])=>`${x}px ${y}px`).join(',')})`;
}
export function SledsWordmarkArrival({ready,reduced,onBusyChange}:{ready:boolean;reduced:boolean;onBusyChange:(busy:boolean)=>void}){
 const root=useRef<HTMLSpanElement>(null),started=useRef(false);
 useLayoutEffect(()=>{
  if(!ready||started.current||reduced)return;
  started.current=true;
  const element=root.current!,wordmark=element.querySelector<HTMLElement>('.sleds-wake')!;
  const riders=[...element.querySelectorAll<HTMLElement>('.sleds-rider')];
  let cancelled=false;
  const animations:Animation[]=[];
  const hideRiders=()=>{riders.forEach(rider=>rider.style.visibility='hidden');onBusyChange(false);};
  const settle=()=>{wordmark.style.clipPath='polygon(0% 0%,100% 0%,100% 100%,0% 100%,0% 100%,0% 100%)';animations.forEach(animation=>animation.cancel());hideRiders();};
  onBusyChange(true);
  void document.fonts.ready.then(()=>{
   if(cancelled)return;
   const bounds=element.getBoundingClientRect(),style=getComputedStyle(element);
   // Layout dimensions stay stable while the parent is still zooming into place.
   const width=parseFloat(style.width),height=parseFloat(style.height);
   if(!width||!height){settle();return;}
   const size=Math.max(24,Math.min(46,height*.92));
   const spacing=size*1.1;
   const duration=1350;
   const scaleY=bounds.height/height||1;
   const panelBottom=((element.closest('.feature-details')?.getBoundingClientRect().bottom??bounds.bottom)-bounds.top)/scaleY;
   const bodyHeight=size*(399.36/335.5),centerX=width*.08+spacing*(dx+dy)/dy,centerY=height/2;
   // One longitudinal coordinate drives every rider and the reveal plane.
   const start=(-size*1.5-width*.08-centerX-spacing)/dx;
   const end=(panelBottom+size+bodyHeight*.86-centerY+spacing)/dy;
   const travel=end-start;
   riders.forEach((rider,index)=>{
    // Opposite x/y offsets form an ascending 45-degree line while travelling downhill.
    const offset=(index-1)*spacing;
    const startX=centerX+offset+dx*start-size/2;
    const startY=centerY-offset+dy*start-bodyHeight*.86;
    rider.style.width=`${size}px`;rider.style.visibility='visible';
    const animation=rider.animate([
     {transform:`translate3d(${startX}px,${startY}px,0)`},
     {transform:`translate3d(${startX+dx*travel}px,${startY+dy*travel}px,0)`},
    ],{duration,easing:'linear',fill:'both'});
    animations.push(animation);
   });
   const initialFront=centerX*dx+centerY*dy+start-spacing*(dx-dy)-size*.25;
   const frames=Array.from({length:49},(_,index)=>{
    const progress=index/48;
    return {clipPath:wake(width,height,initialFront+travel*progress),offset:progress};
   });
   const reveal=wordmark.animate(frames,{duration,delay:90,easing:'linear',fill:'forwards'});
   animations.push(reveal);
   // Retain the completed clipping layer: removing it causes a compositor flash.
   animations[0].onfinish=()=>{riders.forEach(rider=>rider.style.visibility='hidden');};
   reveal.onfinish=()=>onBusyChange(false);
  });
  const resize=settle;
  window.addEventListener('resize',resize,{passive:true});
  return()=>{cancelled=true;animations.forEach(animation=>animation.cancel());window.removeEventListener('resize',resize);settle();};
 },[ready,reduced,onBusyChange]);
 return <span ref={root} aria-hidden="true" class={`sleds-wordmark-arrival${reduced?' is-reduced':''}`}>
  <span class="sleds-wake"><SledsWordmark/></span>
  {!reduced&&[0,1,2].map(index=><span key={index} class="sleds-rider" dangerouslySetInnerHTML={{__html:sledboy}}/>)}
 </span>;
}
