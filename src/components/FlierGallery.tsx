import {useEffect,useLayoutEffect,useRef,useState} from 'preact/hooks';
import type {JSX} from 'preact';
import type {DesignArtwork} from '../content/design';
import {flyerBatch,flyerTilt,nextFlyerBatch,FLYER_STEP_MS,FLYER_TAPE_START_MS,FLYER_TAPE_MS,flyerBatchDuration} from '../features/projects/flyer-batches';
type Batch={start:number;id:number;direction:number};
/** Joined paper bands let the lower edge curl without flipping a rigid card. */
function UnfurlArtwork({src}:{src:string}){
 const bands=24;
 const surface=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{
  const element=surface.current!,paper=element.parentElement!;
  const strips=[...element.querySelectorAll<HTMLElement>('.flyer-band')];
  const fit=(height:number)=>{
   element.style.setProperty('--flyer-paper-height',`${height}px`);
   strips.forEach((strip,index)=>{
    // Distribute subpixels across the strips instead of accumulating a rounded
    // percentage height 24 times. Both renderings end on the exact same edge.
    const top=Math.round(index*height/bands*64)/64;
    const bottom=index===bands-1?height:Math.round((index+1)*height/bands*64)/64;
    strip.style.setProperty('--band-size',`${bottom-top}px`);
    strip.style.setProperty('--band-offset',`${top}px`);
   });
  };
  fit(parseFloat(getComputedStyle(paper).height));
  const observer=new ResizeObserver(entries=>fit(entries[0].contentRect.height));
  observer.observe(paper);
  return()=>observer.disconnect();
 },[]);
 const band=(index:number):JSX.Element=><div class="flyer-band" data-last={index===bands-1?'true':undefined} style={{'--strip-index':index}}>
  <div class="flyer-band-ink"><img src={src} alt="" decoding="sync"/></div>
  {index<bands-1&&band(index+1)}
 </div>;
 return <div ref={surface} class="flyer-unfurl" aria-hidden="true" style={{'--flyer-band-count':bands,'--flyer-band-delay':`${238/(bands-1)}ms`,'--flyer-band-bend':`${35/(bands-1)}deg`}}>{band(0)}</div>;
}
export function FlierGallery({items,onSelect}:{items:DesignArtwork[];onSelect:(artwork:DesignArtwork)=>void}){
 const wall=useRef<HTMLDivElement>(null);
 const [count,setCount]=useState(3),[layers,setLayers]=useState<Batch[]>([{start:0,id:0,direction:1}]);
 const [placing,setPlacing]=useState(false),[locked,setLocked]=useState(false);
 const [readySources,setReadySources]=useState<Record<string,string>>({}),[loadError,setLoadError]=useState('');
 const alive=useRef(true),loads=useRef(new Map<string,Promise<string>>());
 const [revealed,setRevealed]=useState(3);
 const cursor=useRef(0),serial=useRef(0),busy=useRef(false);
 const timer=useRef<ReturnType<typeof setTimeout>>();
 const revealTimers=useRef(new Set<ReturnType<typeof setTimeout>>());
 const countRef=useRef(count);countRef.current=count;
 useLayoutEffect(()=>{
  const element=wall.current!;
  const measure=()=>setCount(parseInt(getComputedStyle(element).getPropertyValue('--flier-count'))||3);
  const observer=new ResizeObserver(measure);observer.observe(element);measure();
  return()=>observer.disconnect();
 },[]);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;clearTimeout(timer.current);revealTimers.current.forEach(clearTimeout);};},[]);
 const prepare=(item:DesignArtwork)=>{
  const key=`${item.src}|${innerWidth}|${devicePixelRatio}`;
  let load=loads.current.get(key);
  if(!load){
   load=(async()=>{
    const image=new Image();
    image.sizes='(max-width:540px) 80vw, (max-width:1000px) 40vw, 28vw';
    if(item.small)image.srcset=`${item.small} ${Math.min(760,item.width)}w, ${item.src} ${item.width}w`;
    image.src=item.src;
    await image.decode();
    return image.currentSrc||item.src;
   })();
   loads.current.set(key,load);
   void load.catch(()=>loads.current.delete(key));
  }
  return load;
 };
 const move=async(direction:number)=>{
  if(!items.length||busy.current)return;
  busy.current=true;setLocked(true);setLoadError('');
  const nextStart=nextFlyerBatch(cursor.current,direction,countRef.current,items.length);
  let sources:[string,string][];
  try{
   const decoded=new Map<string,string>();
   // Resizing during loading can expose another slot; decode that artwork too.
   for(;;){
    const pending=flyerBatch(nextStart,countRef.current,items.length).filter(index=>!decoded.has(items[index].src));
    if(!pending.length)break;
    const ready=await Promise.all(pending.map(async index=>[items[index].src,await prepare(items[index])] as [string,string]));
    ready.forEach(([src,url])=>decoded.set(src,url));
   }
   sources=[...decoded];
  }catch{
   if(alive.current){busy.current=false;setLocked(false);setLoadError('Could not load the next flyers. Please try again.');}
   return;
  }
  if(!alive.current)return;
  setReadySources(previous=>({...previous,...Object.fromEntries(sources)}));
  cursor.current=nextStart;
  const batch={start:cursor.current,id:++serial.current,direction};
  const batchCount=Math.min(countRef.current,items.length);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  setRevealed(reduced?batchCount:1);
  setLayers(previous=>[...previous.slice(-2),batch]);setPlacing(true);
  if(!reduced)for(let slot=1;slot<batchCount;slot++){
   const revealTimer=setTimeout(()=>{setRevealed(slot+1);revealTimers.current.delete(revealTimer);},slot*FLYER_STEP_MS);
   revealTimers.current.add(revealTimer);
  }
  timer.current=setTimeout(()=>{
   busy.current=false;setPlacing(false);setLocked(false);
  },reduced?0:flyerBatchDuration(batchCount));
 };
 const active=layers[layers.length-1];
 return <div class="flier-gallery" role="region" aria-label="Promotional flyers">
  <button class="flier-arrow" type="button" aria-label="Previous flyers" disabled={locked} onClick={()=>move(-1)}><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5m7-7-7 7 7 7"/></svg></button>
  <div class="flier-wall" ref={wall} style={{'--flyer-step':`${FLYER_STEP_MS}ms`,'--flyer-tape-start':`${FLYER_TAPE_START_MS}ms`,'--flyer-tape-duration':`${FLYER_TAPE_MS}ms`}} tabIndex={0} aria-label="Browse taped flyers with the left and right arrow keys" onKeyDown={event=>{
   if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();move(event.key==='ArrowRight'?1:-1);}
  }}>
   {layers.map(batch=><div key={batch.id} class={`flier-batch${placing&&batch.id===active.id?' is-new':''}`} aria-hidden={batch.id!==active.id?'true':undefined} inert={batch.id!==active.id} style={{'--batch-direction':batch.direction}}>
    {flyerBatch(batch.start,count,items.length).map((index,slot)=>{if(placing&&batch.id===active.id&&slot>=revealed)return null;const item=items[index],readySrc=readySources[item.src];return <figure class="flier-slot" key={slot}>
     <div class={`flier-paper${batch.id>0?' has-unfurl':''} tape-${(batch.id+slot)%2?'corners':'top'}`} style={{'--flyer-ratio':item.width/item.height,'--flyer-tilt':`${flyerTilt(batch.id,slot)}deg`,'--flyer-order':slot}}>
      <button class="design-art" tabIndex={batch.id!==active.id?-1:undefined} aria-label={`Enlarge ${item.title}`} onClick={()=>onSelect(item)}>
       <img src={readySrc||item.src} srcSet={!readySrc&&item.small?`${item.small} ${Math.min(760,item.width)}w, ${item.src} ${item.width}w`:undefined} sizes="(max-width:540px) 80vw, (max-width:1000px) 40vw, 28vw" width={item.width} height={item.height} loading={readySrc?'eager':'lazy'} decoding={readySrc?'sync':'async'} alt={`${item.title}. ${item.caption}`}/>
      </button>
      {batch.id>0&&<UnfurlArtwork src={readySrc||item.src}/>}
      <span class="flyer-tape tape-left" aria-hidden="true"/><span class="flyer-tape tape-right" aria-hidden="true"/>
     </div>
    </figure>;})}
   </div>)}
  </div>
  <span class="sr-only" role="status">{loadError||flyerBatch(active.start,count,items.length).map(index=>items[index].title).join(', ')}</span>
  <button class="flier-arrow" type="button" aria-label="Next flyers" disabled={locked} onClick={()=>move(1)}><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg></button>
 </div>;
}
