import {useLayoutEffect,useRef} from 'preact/hooks';
import {NavigationLabel} from './NavigationLabel';
import {NAV_HANDOFF_MS,useNavigationLetters} from './useNavigationLetters';

export function ChapterNavigation({labels,active,reduced,onSelect}:{labels:readonly string[];active:number;reduced:boolean;onSelect:(index:number)=>void}){
 const nav=useRef<HTMLElement>(null);
 const letters=useNavigationLetters(labels,active,reduced);
 useLayoutEffect(()=>{
  const element=nav.current;
  if(!element)return;
  const buttons=[...element.querySelectorAll<HTMLButtonElement>('button')];
  const position=()=>{
   const selected=buttons[active],box=selected.getBoundingClientRect(),parent=element.getBoundingClientRect();
   element.style.setProperty('--indicator-x',`${box.left-parent.left+element.scrollLeft}px`);
   element.style.setProperty('--indicator-width',`${box.width}px`);
  };
  position();
  const selected=buttons[active];
  const left=selected.offsetLeft,right=left+selected.offsetWidth;
  if(left<element.scrollLeft||right>element.scrollLeft+element.clientWidth){
   element.scrollTo({left:Math.max(0,left-(element.clientWidth-selected.offsetWidth)/2),behavior:reduced?'instant':'smooth'});
  }
  const observer=new ResizeObserver(position);
  observer.observe(element);buttons.forEach(button=>observer.observe(button));
  return()=>observer.disconnect();
 },[active,reduced]);
 return <nav ref={nav} class="design-sections" aria-label="Graphic Design Chapters" style={{'--nav-handoff-duration':`${NAV_HANDOFF_MS}ms`}} onKeyDown={event=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  const buttons=[...event.currentTarget.querySelectorAll('button')];
  const current=buttons.indexOf(event.target as HTMLButtonElement);
  if(current<0)return;
  event.preventDefault();
  const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(current+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
  buttons[next].focus();onSelect(next);
 }}>
  <span class="chapter-nav-indicator" aria-hidden="true"/>
  {labels.map((label,index)=><button key={label} type="button" aria-label={label} aria-current={index===active?'location':undefined} onClick={()=>onSelect(index)}>
   <span class="chapter-nav-reserve" aria-hidden="true">{label}</span>
   <NavigationLabel label={label} letters={letters[index]}/>
  </button>)}
 </nav>;
}
