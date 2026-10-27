import {useLayoutEffect,useRef} from 'preact/hooks';
import type {DesignArtwork} from '../content/design';

export function FlierGallery({items,onSelect}:{items:DesignArtwork[];onSelect:(artwork:DesignArtwork)=>void}){
 const track=useRef<HTMLDivElement>(null);
 const stops=useRef<number[]>([]);
 useLayoutEffect(()=>{
  const element=track.current!;
  let settle:ReturnType<typeof setTimeout>;
  const measure=()=>{
   const first=element.firstElementChild as HTMLElement|null;
   if(!first)return;
   const relative=stops.current.length?stops.current.reduce((nearest,stop,index)=>Math.abs(stop-element.scrollLeft)<Math.abs(stops.current[nearest]-element.scrollLeft)?index:nearest,0)%items.length:0;
   const origin=first.getBoundingClientRect().left;
   stops.current=[...element.children].map(slide=>slide.getBoundingClientRect().left-origin);
   element.scrollTo({left:stops.current[items.length+relative],behavior:'instant'});
  };
  const normalize=()=>{
   const length=stops.current[items.length];
   if(!length)return;
   // Identical neighboring strips let the reset happen without a visible rewind.
   if(element.scrollLeft<length-.5)element.scrollTo({left:element.scrollLeft+length,behavior:'instant'});
   else if(element.scrollLeft>=length*2-.5)element.scrollTo({left:element.scrollLeft-length,behavior:'instant'});
  };
  const onScroll=()=>{clearTimeout(settle);settle=setTimeout(normalize,150);};
  const observer=new ResizeObserver(measure);observer.observe(element);
  element.addEventListener('scroll',onScroll,{passive:true});
  measure();
  return()=>{clearTimeout(settle);observer.disconnect();element.removeEventListener('scroll',onScroll);};
 },[items]);
 const move=(direction:number)=>{
  const element=track.current!;
  const next=direction>0?stops.current.find(stop=>stop>element.scrollLeft+2):[...stops.current].reverse().find(stop=>stop<element.scrollLeft-2);
  if(next!==undefined)element.scrollTo({left:next,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 };
 return <div class="flier-gallery" role="region" aria-label="Promotional flyers">
  <button class="flier-arrow" type="button" aria-label="Previous flyers" onClick={()=>move(-1)}><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5m7-7-7 7 7 7"/></svg></button>
  <div class="flier-track" ref={track} tabIndex={0} aria-label="Scroll through flyers" onKeyDown={event=>{
   if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();move(event.key==='ArrowRight'?1:-1);}
  }}>
   {[0,1,2].flatMap(copy=>items.map(item=><figure class="flier-slide" key={`${copy}-${item.src}`} aria-hidden={copy!==1?'true':undefined}>
    <button class="design-art" tabIndex={copy!==1?-1:undefined} aria-label={`Enlarge ${item.title}`} onClick={()=>onSelect(item)}>
     <img src={item.src} srcSet={item.small?`${item.small} ${Math.min(760,item.width)}w, ${item.src} ${item.width}w`:undefined} sizes="(max-width:540px) 88vw, (max-width:1000px) 44vw, 30vw" width={item.width} height={item.height} loading="lazy" decoding="async" alt={`${item.title}. ${item.caption}`}/>
    </button>
   </figure>))}
  </div>
  <button class="flier-arrow" type="button" aria-label="Next flyers" onClick={()=>move(1)}><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg></button>
 </div>;
}
