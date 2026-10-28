import {useEffect,useLayoutEffect,useRef,useState} from 'preact/hooks';
import type {DesignArtwork} from '../content/design';
import {flyerBatch,flyerTilt,nextFlyerBatch,FLYER_STEP_MS,flyerBatchDuration} from '../features/projects/flyer-batches';
type Batch={start:number;id:number;direction:number};
export function FlierGallery({items,onSelect}:{items:DesignArtwork[];onSelect:(artwork:DesignArtwork)=>void}){
 const wall=useRef<HTMLDivElement>(null);
 const [count,setCount]=useState(3),[layers,setLayers]=useState<Batch[]>([{start:0,id:0,direction:1}]);
 const [placing,setPlacing]=useState(false);
 const cursor=useRef(0),serial=useRef(0),busy=useRef(false),queue=useRef<number[]>([]);
 const timer=useRef<ReturnType<typeof setTimeout>>();
 const countRef=useRef(count);countRef.current=count;
 useLayoutEffect(()=>{
  const element=wall.current!;
  const measure=()=>setCount(parseInt(getComputedStyle(element).getPropertyValue('--flier-count'))||3);
  const observer=new ResizeObserver(measure);observer.observe(element);measure();
  return()=>observer.disconnect();
 },[]);
 useEffect(()=>()=>{clearTimeout(timer.current);queue.current=[];},[]);
 const move=(direction:number)=>{
  if(!items.length)return;
  if(busy.current){queue.current.push(direction);return;}
  busy.current=true;
  cursor.current=nextFlyerBatch(cursor.current,direction,countRef.current,items.length);
  const batch={start:cursor.current,id:++serial.current,direction};
  setLayers(previous=>[...previous.slice(-2),batch]);setPlacing(true);
  timer.current=setTimeout(()=>{
   busy.current=false;setPlacing(false);
   const next=queue.current.shift();if(next!==undefined)move(next);
  },matchMedia('(prefers-reduced-motion: reduce)').matches?0:flyerBatchDuration(Math.min(countRef.current,items.length)));
 };
 const active=layers[layers.length-1];
 return <div class="flier-gallery" role="region" aria-label="Promotional flyers">
  <button class="flier-arrow" type="button" aria-label="Previous flyers" onClick={()=>move(-1)}><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5m7-7-7 7 7 7"/></svg></button>
  <div class="flier-wall" ref={wall} style={{'--flyer-step':`${FLYER_STEP_MS}ms`}} tabIndex={0} aria-label="Browse taped flyers with the left and right arrow keys" onKeyDown={event=>{
   if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();move(event.key==='ArrowRight'?1:-1);}
  }}>
   {layers.map(batch=><div key={batch.id} class={`flier-batch${placing&&batch.id===active.id?' is-new':''}`} aria-hidden={batch.id!==active.id?'true':undefined} inert={batch.id!==active.id} style={{'--batch-direction':batch.direction}}>
    {flyerBatch(batch.start,count,items.length).map((index,slot)=>{const item=items[index];return <figure class="flier-slot" key={slot}>
     <div class={`flier-paper tape-${(batch.id+slot)%2?'corners':'top'}`} style={{'--flyer-ratio':item.width/item.height,'--flyer-tilt':`${flyerTilt(batch.id,slot)}deg`,'--flyer-order':slot}}>
      <button class="design-art" tabIndex={batch.id!==active.id?-1:undefined} aria-label={`Enlarge ${item.title}`} onClick={()=>onSelect(item)}>
       <img src={item.src} srcSet={item.small?`${item.small} ${Math.min(760,item.width)}w, ${item.src} ${item.width}w`:undefined} sizes="(max-width:540px) 80vw, (max-width:1000px) 40vw, 28vw" width={item.width} height={item.height} loading="lazy" decoding="async" alt={`${item.title}. ${item.caption}`}/>
      </button>
      <span class="flyer-tape tape-left" aria-hidden="true"/><span class="flyer-tape tape-right" aria-hidden="true"/>
     </div>
    </figure>;})}
   </div>)}
  </div>
  <span class="sr-only" role="status">{flyerBatch(active.start,count,items.length).map(index=>items[index].title).join(', ')}</span>
  <button class="flier-arrow" type="button" aria-label="Next flyers" onClick={()=>move(1)}><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg></button>
 </div>;
}
