import {useEffect,useRef,useState} from 'preact/hooks';
import type {DesignArtwork} from '../content/design';
import {recordRows} from '../features/projects/record-sleeves';
import {insideRecordBounds,recordFolded} from '../features/projects/record-interaction';
import {ExpressiveText} from './ExpressiveText';
import {RecordSpine} from './RecordSpine';

export function RecordGallery({items,onSelect,zoomOpen=false}:{items:DesignArtwork[];onSelect:(artwork:DesignArtwork)=>void;zoomOpen?:boolean}){
 const [hovered,setHovered]=useState(false),[keyboardFocused,setKeyboardFocused]=useState(false);
 const wasZoomed=useRef(zoomOpen);
 const galleryRef=useRef<HTMLDivElement>(null);
 const hoveredPair=useRef<HTMLElement|null>(null);
 const markHoveredPair=(pair:HTMLElement|null)=>{
  if(hoveredPair.current===pair)return;
  hoveredPair.current?.removeAttribute('data-pointer-hovered');
  hoveredPair.current=pair;
  pair?.setAttribute('data-pointer-hovered','true');
 };
 const updatePointer=(x:number,y:number)=>{
  const gallery=galleryRef.current;
  if(!gallery)return;
  const bounds=gallery.getBoundingClientRect();
  const inside=insideRecordBounds(x,y,bounds);
  setHovered(inside);
  const pair=inside?[...gallery.querySelectorAll<HTMLElement>('.record-gatefold')].find(candidate=>{
   const window=candidate.closest('.record-track-window')!;
   return insideRecordBounds(x,y,candidate.getBoundingClientRect(),window.getBoundingClientRect());
  }):undefined;
  markHoveredPair(pair||null);
 };
 useEffect(()=>{
  const gallery=galleryRef.current;
  if(!gallery)return;
  const rows=[...gallery.querySelectorAll<HTMLElement>('.record-track-window')].map(root=>{
   const copies=[...root.querySelectorAll<HTMLElement>('.album-set')].map(set=>[...set.querySelectorAll<HTMLElement>('.record-gatefold')]);
   return {root,pairs:copies.flatMap((pairs,copy)=>pairs.map((pair,index)=>({
    pair,nextCopy:copy===0?copies[1]?.[index]:undefined,covers:pair.querySelectorAll<HTMLElement>(':scope > .album-tile')
   })))};
  });
  let frame=0,inView=true;
  const update=()=>{
   frame=0;
   if(!inView||document.hidden)return;
   const changes:{pair:HTMLElement;state:string}[]=[];
   for(const {root,pairs} of rows){
    const bounds=root.getBoundingClientRect();
    for(const {pair,covers,nextCopy} of pairs){
     const sleeve=pair.getBoundingClientRect();
     const back=covers[0],front=covers[1];
     if(!back||!front)continue;
     // Use the flat layout positions so the fold itself cannot move its triggers.
     const state=recordFolded({left:sleeve.left,right:sleeve.right,
      backMidpointOffset:back.offsetLeft+back.offsetWidth/2,
      frontMidpointOffset:front.offsetLeft+front.offsetWidth/2
     },bounds,nextCopy?.offsetWidth?nextCopy.getBoundingClientRect().left:undefined)?'true':'false';
     if(pair.getAttribute('data-folded')!==state)changes.push({pair,state});
    }
   }
   changes.forEach(({pair,state})=>pair.setAttribute('data-folded',state));
   frame=requestAnimationFrame(update);
  };
  const sync=()=>{
   cancelAnimationFrame(frame);
   frame=0;
   if(inView&&!document.hidden)frame=requestAnimationFrame(update);
  };
  const observer=typeof IntersectionObserver==='undefined'?null:new IntersectionObserver(entries=>{
   inView=entries.some(entry=>entry.isIntersecting);
   sync();
  });
  observer?.observe(gallery);
  document.addEventListener('visibilitychange',sync);
  sync();
  return()=>{
   cancelAnimationFrame(frame);
   observer?.disconnect();
   document.removeEventListener('visibilitychange',sync);
  };
 },[items]);
 useEffect(()=>{
  if(wasZoomed.current&&!zoomOpen){setHovered(false);setKeyboardFocused(false);markHoveredPair(null);}
  wasZoomed.current=zoomOpen;
 },[zoomOpen]);
 const rows=recordRows(items);
 const secondRowStart=rows[1]?.[0]?.artworks[0];
 const secondRowStartCoverIndex=secondRowStart?items.indexOf(secondRowStart):0;
 const topRowOffset=items.length?(72-72/items.length):0;
 const rowOffset=items.length?((((.5-secondRowStartCoverIndex/items.length)%1)+1)%1)*72:0;
 const browsing=hovered||keyboardFocused;
 const held=browsing||zoomOpen;
 const tile=(artwork:DesignArtwork,copy:number)=><button class="album-tile" type="button" tabIndex={copy===1?-1:undefined} onClick={()=>onSelect(artwork)} aria-label={`Enlarge ${artwork.title}. ${artwork.caption}`}>
  <img src={artwork.src} srcSet={artwork.small?`${artwork.small} ${Math.min(760,artwork.width)}w, ${artwork.src} ${artwork.width}w`:undefined} sizes="(max-width:540px) 55vw, 25vw" width={artwork.width} height={artwork.height} loading="lazy" decoding="async" alt={artwork.year||`${artwork.title}. ${artwork.caption}`}/>
  <span class="album-caption"><strong><ExpressiveText text={artwork.title}/></strong><span>{artwork.caption}</span></span>
 </button>;
 return <>
  <div ref={galleryRef} class="album-gallery record-gallery" aria-label="Browse record sleeves" data-browsing={browsing?'true':'false'} style={{'--record-play-state':held?'paused':'running','--row-1-delay':`${-topRowOffset}s`,'--row-2-delay':`${-rowOffset}s`}}
   onPointerEnter={event=>{if(event.pointerType==='mouse'&&!zoomOpen)updatePointer(event.clientX,event.clientY);}} onPointerMove={event=>{if(event.pointerType==='mouse'&&!zoomOpen)updatePointer(event.clientX,event.clientY);}} onPointerLeave={()=>{setHovered(false);markHoveredPair(null);}}
   onFocusCapture={event=>{if((event.target as HTMLElement).matches(':focus-visible'))setKeyboardFocused(true);}}
   onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setKeyboardFocused(false);}}>
   {rows.map((row,rowIndex)=><div key={rowIndex} class={`album-marquee record-crate album-row-${rowIndex+1}${held?' is-paused':''}`}>
    <div class="record-track-window">
    <div class="album-track">
     {[0,1].map(copy=><div key={copy} class="album-set" aria-hidden={copy===1?'true':undefined}>
      {row.map((record,index)=>record.artworks.length===2?<div key={record.id} class="album-pair record-gatefold" style={{'--record-layer':(2-copy)*row.length-index}} role="group" aria-label="Open record sleeve: back cover on the left, front cover on the right">
       {tile(record.artworks[0],copy)}<RecordSpine artist={record.artworks[1].caption.split(' · ')[0]} title={record.artworks[1].title}/>{tile(record.artworks[1],copy)}
      </div>:<div key={record.id} class="record-sleeve" style={{'--record-layer':(2-copy)*row.length-index}}><span class="vinyl-disc" aria-hidden="true"/>{tile(record.artworks[0],copy)}</div>)}
     </div>)}
    </div>
    </div>
   </div>)}
  </div>
 </>;
}
