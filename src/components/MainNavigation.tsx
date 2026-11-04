import {useLayoutEffect,useRef} from 'preact/hooks';
import {openPanel} from '../app/router';
import {NavigationLabel} from './NavigationLabel';
import {NAV_HANDOFF_MS,useNavigationLetters} from './useNavigationLetters';
import {projects} from '../content/projects';
import {textLineMetrics} from './textMetrics';
import {useCompactProjectLabels} from './useCompactProjectLabels';

const fullLabels=['About','Contact','Featured Work',...projects.map(project=>project.indexTitle)];
const compactLabels=fullLabels.map(label=>label==='Graphic Design'?'Design':label);
export function MainNavigation({active,reduced,activeProject}:{active:'about'|'contact'|'work';reduced:boolean;activeProject?:number}){
 const labels=useCompactProjectLabels()?compactLabels:fullLabels;
 const index=activeProject!==undefined?3+activeProject:active==='about'?0:active==='contact'?1:2;
 const letters=useNavigationLetters(labels,index,reduced);
 const nav=useRef<HTMLElement>(null);
 useLayoutEffect(()=>{
  const element=nav.current;
  if(!element)return;
  const links=[...element.querySelectorAll<HTMLElement>('.main-nav-link')];
  const projectLinks=element.querySelector<HTMLElement>('.project-topbar-links');
  if(projectLinks&&activeProject!==undefined&&projectLinks.scrollWidth>projectLinks.clientWidth){
   const selected=links[index];
   if(selected){const max=projectLinks.scrollWidth-projectLinks.clientWidth;projectLinks.scrollLeft=Math.max(0,Math.min(max,selected.offsetLeft-(projectLinks.clientWidth-selected.offsetWidth)/2));}
  }
  const position=()=>{
   const selected=links[index];if(!selected)return;
   const box=selected.getBoundingClientRect(),parent=element.getBoundingClientRect();
   element.style.setProperty('--indicator-x',`${box.left-parent.left}px`);
   element.style.setProperty('--indicator-width',`${box.width}px`);
   const indicator=element.querySelector<HTMLElement>('.main-nav-indicator');
   const height=indicator?.getBoundingClientRect().height||4;
   const label=selected.querySelector<HTMLElement>('.project-nav-label');
   const topbar=element.closest<HTMLElement>('.header');
   if(label&&topbar){
    const baseline=label.getBoundingClientRect().top+textLineMetrics(label).baseline;
    const center=(baseline+topbar.getBoundingClientRect().bottom)/2;
    element.style.setProperty('--indicator-y',`${center-parent.top-height/2}px`);
   }
   const header=element.closest<HTMLElement>('.header-primary');
   const wordmark=header?.querySelector<HTMLElement>('.wordmark');
   if(header&&wordmark){
    const leadingWidth=wordmark.getBoundingClientRect().width+links[0].getBoundingClientRect().width+links[1].getBoundingClientRect().width;
    header.style.setProperty('--header-leading-width',`${leadingWidth}px`);
    header.style.setProperty('--work-link-width',`${links[2].getBoundingClientRect().width}px`);
    const gap=parseFloat(getComputedStyle(header).columnGap||getComputedStyle(header).gap)||18;
    header.style.setProperty('--brand-leading-offset',`${wordmark.getBoundingClientRect().width+gap}px`);
   }
  };
  position();
  const observer=new ResizeObserver(position);
  observer.observe(element);links.forEach(link=>observer.observe(link));
  const topbar=element.closest('.header');if(topbar)observer.observe(topbar);
  const wordmark=element.closest('.header-primary')?.querySelector('.wordmark');
  if(wordmark)observer.observe(wordmark);
  return()=>observer.disconnect();
 },[index,activeProject,labels]);
 const content=(i:number)=><><span class="main-nav-reserve" aria-hidden="true">{labels[i]}</span><NavigationLabel label={labels[i]} letters={letters[i]}/></>;
 const isSiteActive=(i:number)=>activeProject===undefined&&index===i;
 const siteLinks=<>
   <div class="personal-nav">
    <button class="main-nav-link" onClick={()=>openPanel('about')} aria-label="About" aria-current={isSiteActive(0)?'page':undefined}>{content(0)}</button>
    <button class="main-nav-link" onClick={()=>openPanel('contact')} aria-label="Contact" aria-current={isSiteActive(1)?'page':undefined}>{content(1)}</button>
   </div>
   <a class="main-nav-link featured-work-link" href="#/" aria-label="Featured Work" aria-current={isSiteActive(2)?'page':undefined}>{content(2)}</a>
  </>;
 return <nav ref={nav} class="main-nav" data-project-index={activeProject!==undefined?'true':undefined} aria-label="Main navigation" style={{'--nav-handoff-duration':`${NAV_HANDOFF_MS}ms`}}>
  <span class="main-nav-rule-clip" aria-hidden="true"><span class="main-nav-indicator"/></span>
  {activeProject===undefined?siteLinks:<div class="main-nav-primary">{siteLinks}</div>}
  {activeProject!==undefined&&<div class="project-topbar-links" aria-label="Projects">{projects.map((project,i)=><a class="main-nav-link project-topbar-link" href={`#/work/${project.id}`} aria-label={project.indexTitle} aria-current={activeProject===i?'page':undefined} key={project.id}>{content(i+3)}</a>)}</div>}
 </nav>;
}
