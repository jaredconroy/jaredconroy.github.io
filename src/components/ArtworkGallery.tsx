import {ExpressiveText} from './ExpressiveText';
import {useEffect,useId,useRef,useState} from 'preact/hooks';
import type {IllustrationArtwork} from '../content/illustrations';

export function IllustrationImage({artwork:a,eager=false}:{artwork:IllustrationArtwork;eager?:boolean}){
 const exportWidth=(limit:number)=>Math.round(a.width*Math.min(1,limit/Math.max(a.width,a.height)));
 return <img src={a.src} srcSet={a.small!==a.src?`${a.small} ${exportWidth(760)}w, ${a.src} ${exportWidth(2200)}w`:undefined} sizes="(max-width:540px) 88vw, (max-width:900px) 44vw, 30vw" width={a.width} height={a.height} loading={eager?'eager':'lazy'} decoding="async" alt={a.alt}/>;
}
export function ArtworkGallery({items}:{items:IllustrationArtwork[]}){
 const [selectedId,setSelectedId]=useState<string|null>(null);
 const dialog=useRef<HTMLDialogElement>(null),headingId=useId();
 const index=items.findIndex(item=>item.id===selectedId),selected=items[index];
 const close=()=>dialog.current?.close();
 const move=(direction:number)=>setSelectedId(items[(index+direction+items.length)%items.length].id);
 useEffect(()=>{
  if(selected&&!dialog.current?.open)dialog.current?.showModal();
  if(!selected&&dialog.current?.open)dialog.current.close();
 },[selected]);
 return <>
  <div class="artwork-gallery">{items.map((item,i)=><figure class={`artwork-tile artwork-${item.width>item.height?'landscape':'portrait'}`} key={item.id}>
   <button class="artwork-image" style={{background:item.background}} onClick={()=>setSelectedId(item.id)} aria-label={`Enlarge ${item.title}`}>
    <IllustrationImage artwork={item} eager={i<2}/><span class="artwork-enlarge" aria-hidden="true">↗</span>
   </button>
   <figcaption><h3><ExpressiveText text={item.title}/></h3><span>{item.collection==='foul-balls'?'Foul Balls':'Illustration'}</span></figcaption>
  </figure>)}</div>
  <dialog ref={dialog} class="artwork-lightbox" aria-labelledby={headingId} onClose={()=>setSelectedId(null)} onClick={event=>{if(event.target===event.currentTarget)close();}} onKeyDown={event=>{
   if(!selected||!['ArrowLeft','ArrowRight'].includes(event.key))return;
   event.preventDefault();move(event.key==='ArrowRight'?1:-1);
  }}>
   {selected&&<div class="artwork-lightbox-content">
    <div class="artwork-lightbox-toolbar"><div class="artwork-lightbox-steps"><button onClick={()=>move(-1)} aria-label="Previous artwork">←</button><span>{index+1} / {items.length}</span><button onClick={()=>move(1)} aria-label="Next artwork">→</button></div><button onClick={close} autoFocus aria-label="Close artwork preview">Close ×</button></div>
    <div class="artwork-lightbox-image" style={{background:selected.background}}><img src={selected.src} width={selected.width} height={selected.height} alt={selected.alt}/></div>
    <footer><div><h2 id={headingId}><ExpressiveText text={selected.title}/></h2><p>{selected.caption}</p></div>{selected.collection==='foul-balls'&&<a href="#/work/foul-balls">Explore Foul Balls ↗</a>}</footer>
   </div>}
  </dialog>
 </>;
}
