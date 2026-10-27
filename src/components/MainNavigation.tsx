import {useLayoutEffect,useRef} from 'preact/hooks';
import {openPanel} from '../app/router';
import {NavigationLabel} from './NavigationLabel';
import {NAV_HANDOFF_MS,useNavigationLetters} from './useNavigationLetters';

const labels=['About','Contact','Featured Work'];
export function MainNavigation({active,reduced}:{active:'about'|'contact'|'work';reduced:boolean}){
 const index=active==='about'?0:active==='contact'?1:2;
 const letters=useNavigationLetters(labels,index,reduced);
 const nav=useRef<HTMLElement>(null);
 useLayoutEffect(()=>{
  const element=nav.current;
  if(!element)return;
  const links=[...element.querySelectorAll<HTMLElement>('.main-nav-link')];
  const position=()=>{
   const selected=links[index],box=selected.getBoundingClientRect(),parent=element.getBoundingClientRect();
   element.style.setProperty('--indicator-x',`${box.left-parent.left}px`);
   element.style.setProperty('--indicator-width',`${box.width}px`);
   const header=element.closest<HTMLElement>('.header-primary');
   const wordmark=header?.querySelector<HTMLElement>('.wordmark');
   if(header&&wordmark){
    const leadingWidth=wordmark.getBoundingClientRect().width+links[0].getBoundingClientRect().width+links[1].getBoundingClientRect().width;
    header.style.setProperty('--header-leading-width',`${leadingWidth}px`);
    header.style.setProperty('--work-link-width',`${links[2].getBoundingClientRect().width}px`);
   }
  };
  position();
  const observer=new ResizeObserver(position);
  observer.observe(element);links.forEach(link=>observer.observe(link));
  const wordmark=element.closest('.header-primary')?.querySelector('.wordmark');
  if(wordmark)observer.observe(wordmark);
  return()=>observer.disconnect();
 },[index]);
 const content=(i:number)=><><span class="main-nav-reserve" aria-hidden="true">{labels[i]}</span><NavigationLabel label={labels[i]} letters={letters[i]}/></>;
 return <nav ref={nav} class="main-nav" aria-label="Main navigation" style={{'--nav-handoff-duration':`${NAV_HANDOFF_MS}ms`}}>
  <span class="main-nav-rule-clip" aria-hidden="true"><span class="main-nav-indicator"/></span>
  <div class="personal-nav">
   <button class="main-nav-link" onClick={()=>openPanel('about')} aria-label="About" aria-current={index===0?'page':undefined}>{content(0)}</button>
   <button class="main-nav-link" onClick={()=>openPanel('contact')} aria-label="Contact" aria-current={index===1?'page':undefined}>{content(1)}</button>
  </div>
  <a class="main-nav-link featured-work-link" href="#/" aria-label="Featured Work" aria-current={index===2?'page':undefined}>{content(2)}</a>
 </nav>;
}
