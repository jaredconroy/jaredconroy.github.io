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
  const finish=()=>{element.dataset.revealed='true';wordmark.style.clipPath='none';riders.forEach(rider=>rider.style.visibility='hidden');animations.forEach(animation=>animation.cancel());onBusyChange(false);};
  onBusyChange(true);
  void document.fonts.ready.then(()=>{
   if(cancelled)return;
   const bounds=element.getBoundingClientRect(),{width,height}=bounds;
   if(!width||!height){finish();return;}
   const size=Math.max(24,Math.min(46,height*.92));
   const extent=width*dx+height*dy;
   const cross=width*dy+height*dx;
   const duration=1350,stagger=125;
   const panelBottom=(element.closest('.feature-details')?.getBoundingClientRect().bottom??bounds.bottom)-bounds.top;
   const bodyHeight=size*(399.36/335.5);
   // All riders share one velocity; extend even the highest lane below the panel.
   const highestStart=height/2-dx*cross*.28+(-size*1.5-width/2-dy*cross*.28)*slope-bodyHeight*.86;
   const travelX=Math.max(width+size*4,(panelBottom+size-highestStart)/slope);
   riders.forEach((rider,index)=>{
    const lane=(index-1)*cross*.28;
    const centerX=width*.42-dy*lane,centerY=height/2+dx*lane;
    const startX=-size*2-width*.08;
    const startY=centerY+(startX+size/2-centerX)*slope-size*(399.36/335.5)*.86;
    rider.style.width=`${size}px`;rider.style.visibility='visible';
    const animation=rider.animate([
     {transform:`translate3d(${startX}px,${startY}px,0)`},
     {transform:`translate3d(${startX+travelX}px,${startY+slope*travelX}px,0)`},
    ],{duration,delay:index*stagger,easing:'linear',fill:'both'});
    animations.push(animation);
   });
   const frames=Array.from({length:49},(_,index)=>{
    const progress=index/48;
    return {clipPath:wake(width,height,-size*2+(extent+size*4)*progress),offset:progress};
   });
   const reveal=wordmark.animate(frames,{duration,delay:stagger,easing:'linear',fill:'forwards'});
   animations.push(reveal);
   reveal.onfinish=()=>{element.dataset.revealed='true';};
   animations[2].onfinish=finish;
  });
  const resize=()=>{animations.forEach(animation=>animation.cancel());finish();};
  window.addEventListener('resize',resize,{passive:true});
  return()=>{cancelled=true;animations.forEach(animation=>animation.cancel());window.removeEventListener('resize',resize);finish();};
 },[ready,reduced,onBusyChange]);
 return <span ref={root} aria-hidden="true" class={`sleds-wordmark-arrival${reduced?' is-reduced':''}`}>
  <span class="sleds-wake"><SledsWordmark/></span>
  {!reduced&&[0,1,2].map(index=><span key={index} class="sleds-rider" dangerouslySetInnerHTML={{__html:sledboy}}/>)}
 </span>;
}
