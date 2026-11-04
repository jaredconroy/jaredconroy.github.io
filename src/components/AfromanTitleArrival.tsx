import {useLayoutEffect,useRef} from 'preact/hooks';
import walk from '../content/afroman-walk.json';

const PREVIEW_SPEED=1.6;

/** The game's own frames and cadence, with movement scaled to the displayed sprite. */
export function AfromanTitleArrival({ready,reduced,onBusyChange}:{ready:boolean;reduced:boolean;onBusyChange:(busy:boolean)=>void}){
 const root=useRef<HTMLSpanElement>(null),started=useRef(false);
 useLayoutEffect(()=>{
  if(!ready||started.current||reduced)return;
  started.current=true;
  const element=root.current!,ink=element.querySelector<HTMLElement>('.afroman-title-ink')!,lane=element.querySelector<HTMLElement>('.afroman-walk-lane')!,actor=element.querySelector<HTMLElement>('.afroman-title-walker')!;
  const animations:Animation[]=[];
  let cancelled=false;
  const hide=()=>{actor.style.visibility='hidden';onBusyChange(false);};
  const settle=()=>{ink.style.clipPath='inset(0)';animations.forEach(animation=>animation.cancel());hide();};
  onBusyChange(true);
  void Promise.all([document.fonts.ready,new Promise<void>(resolve=>{
   const image=new Image();image.onload=()=>resolve();image.onerror=()=>resolve();image.src=`${import.meta.env.BASE_URL}media/afroman/walk-sprites.png`;
  })]).then(()=>{
   if(cancelled)return;
   const panel=element.closest<HTMLElement>('.feature-details')!;
   const width=parseFloat(getComputedStyle(element).width),lineHeight=parseFloat(getComputedStyle(element).height);
   if(!width||!lineHeight){settle();return;}
   const panelHeight=panel.clientHeight;
   let top=0,node:HTMLElement|null=element;
   while(node&&node!==panel){top+=node.offsetTop;node=node.offsetParent as HTMLElement|null;}
   const padding=12,height=Math.min(60,panelHeight-12),scale=height/walk.frames[0].height;
   const spriteWidth=walk.frames[0].width*scale;
   lane.style.left=`-${padding}px`;lane.style.width=`${width+padding*2}px`;
   lane.style.top=`${-top}px`;lane.style.height=`${panelHeight}px`;
   actor.style.width=`${spriteWidth}px`;actor.style.height=`${height}px`;
   actor.style.top=`${panelHeight-height-6}px`;
   actor.style.backgroundSize=`${walk.sheetWidth*scale}px ${walk.sheetHeight*scale}px`;
   actor.style.visibility='visible';
   const cycleMs=walk.frames.reduce((sum,frame)=>sum+frame.ms,0)/PREVIEW_SPEED;
   const frames=walk.frames.map((frame,index)=>({backgroundPosition:`${-frame.x*scale}px ${-frame.y*scale}px`,offset:index/walk.frames.length,easing:'steps(1,end)'}));
   frames.push({...frames[0],offset:1});
   const cycle=actor.animate(frames,{duration:cycleMs,iterations:Infinity});
   // Accelerate the original 8px/update at 60Hz and its cadence together.
   const from=-spriteWidth,to=width+padding*2,distance=to-from;
   const duration=distance/(walk.gamePixelsPerSecond*scale*PREVIEW_SPEED)*1000;
   const movement=actor.animate([{transform:`translate3d(${from}px,0,0)`},{transform:`translate3d(${to}px,0,0)`}],{duration,easing:'linear',fill:'both'});
   const reveal=ink.animate(Array.from({length:49},(_,index)=>{
    const progress=index/48,x=from+distance*progress-padding+spriteWidth*.12;
    return {clipPath:`inset(0 ${Math.max(0,Math.min(width,width-x))}px 0 0)`,offset:progress};
   }),{duration,easing:'linear',fill:'forwards'});
   animations.push(cycle,movement,reveal);
   // Retain the final reveal layer so completion cannot flash the hidden title.
   movement.onfinish=()=>{hide();cycle.cancel();};
  });
  window.addEventListener('resize',settle,{passive:true});
  return()=>{cancelled=true;settle();window.removeEventListener('resize',settle);};
 },[ready,reduced,onBusyChange]);
 return <><span class="sr-only">Afroman</span><span ref={root} class={`afroman-title-arrival${reduced?' is-reduced':''}`} aria-hidden="true">
  <span class="afroman-title-ink">Afroman</span>
  {!reduced&&<span class="afroman-walk-lane"><span class="afroman-title-walker"/></span>}
 </span></>;
}
