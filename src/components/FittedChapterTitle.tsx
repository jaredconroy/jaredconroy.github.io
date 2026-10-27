import {useLayoutEffect,useRef,useState} from 'preact/hooks';
import {ExpressiveText} from './ExpressiveText';

const versions:Record<string,readonly string[]>={
 identities:['Logos & Identities','Logo Design','Logos'],
 covers:['Album Covers','Albums'],
 digital:['UI / UX Design & Development','UI / UX'],
 film:['Movie Posters & Thumbnails','Movie Posters','Movies'],
 posters:['Promotional Flyers','Promo Flyers','Flyers'],
};

/** Choose complete words using the rendered lettering, including the custom U and ampersand. */
export function FittedChapterTitle({chapter,title}:{chapter:string;title:string}){
 const choices=versions[chapter]||[title];
 const box=useRef<HTMLSpanElement>(null);
 const [choice,setChoice]=useState(0);
 useLayoutEffect(()=>{
  const element=box.current;
  if(!element)return;
  let alive=true;
  const samples=[...element.querySelectorAll<HTMLElement>('.chapter-title-measure>span')];
  const fit=()=>{
   if(!alive)return;
   const available=element.getBoundingClientRect().width-2;
   const match=samples.findIndex(sample=>sample.getBoundingClientRect().width<=available);
   setChoice(match<0?samples.length-1:match);
  };
  const observer=new ResizeObserver(fit);
  observer.observe(element);samples.forEach(sample=>observer.observe(sample));
  fit();void document.fonts.ready.then(fit);
  return()=>{alive=false;observer.disconnect();};
 },[chapter,title]);
 const lettering=(text:string)=><ExpressiveText text={text} centered conventionalU={chapter==='digital'}/>;
 return <span ref={box} class="fitted-chapter-title">
  <span class="chapter-title-visible">{lettering(choices[Math.min(choice,choices.length-1)])}</span>
  <span class="chapter-title-measure" aria-hidden="true">{choices.map(text=><span key={text}>{lettering(text)}</span>)}</span>
 </span>;
}
