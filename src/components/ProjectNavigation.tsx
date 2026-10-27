import {useEffect,useLayoutEffect,useRef} from 'preact/hooks';
import {projects} from '../content/projects';
import {NAV_HANDOFF_MS,useNavigationLetters} from './useNavigationLetters';
import {NavigationLabel} from './NavigationLabel';
import {tabTiming} from '../features/landing/timing';

const labels=projects.map(project=>project.indexTitle);

export function ProjectNavigation({active,reduced,onSelect,onPreview,onPress,selectionTarget=active,handoffMs=NAV_HANDOFF_MS,labelsAwake=true}:{active:number;reduced:boolean;onSelect:(index:number)=>void;onPreview:(index:number|null)=>void;onPress:(index:number|null)=>void;selectionTarget?:number;handoffMs?:number;labelsAwake?:boolean}){
 const nav=useRef<HTMLElement>(null);
 const releaseFrame=useRef(0);
 const motion=tabTiming(reduced);
 const boldLetters=useNavigationLetters(labels,selectionTarget,reduced,handoffMs,{stroke:motion.rise,interval:motion.passStagger});
 useEffect(()=>{
  const cancel=()=>{cancelAnimationFrame(releaseFrame.current);onPress(null);};
  // Let a normal click commit first; an outside release just undoes the dip.
  const release=()=>{cancelAnimationFrame(releaseFrame.current);releaseFrame.current=requestAnimationFrame(cancel);};
  window.addEventListener('pointerup',release);window.addEventListener('pointercancel',cancel);window.addEventListener('blur',cancel);
  return()=>{cancel();window.removeEventListener('pointerup',release);window.removeEventListener('pointercancel',cancel);window.removeEventListener('blur',cancel);};
 },[onPress]);
 useLayoutEffect(()=>{
  const element=nav.current;
  if(!element)return;
  const buttons=[...element.querySelectorAll('button')];
  const panel=document.querySelector<HTMLElement>('.landing .feature-details');
  const stack=document.querySelector<HTMLElement>('.landing .folder-stack');
  const position=()=>{
   const feature=panel?.closest<HTMLElement>('.feature');
   const rule=document.querySelector<HTMLElement>('.main-nav-indicator');
   if(feature&&rule&&matchMedia('(min-width:1001px) and (min-height:701px)').matches){
    const header=element.closest('.header');
    const shift=header?new DOMMatrixReadOnly(getComputedStyle(header).transform).m42:0;
    const delta=rule.getBoundingClientRect().top-shift-feature.getBoundingClientRect().top;
    if(Math.abs(delta)>.05)feature.style.marginTop=`${(parseFloat(getComputedStyle(feature).marginTop)||0)+delta}px`;
   }else if(feature)feature.style.removeProperty('margin-top');
   const selected=buttons[active].getBoundingClientRect(),parent=element.getBoundingClientRect();
   const width=selected.width,left=selected.left-parent.left;
   element.style.setProperty('--indicator-x',`${left}px`);
   element.style.setProperty('--indicator-width',`${width}px`);
   const indicator=element.querySelector<HTMLElement>('.project-nav-indicator');
   if(panel&&indicator){
    const radius=parseFloat(getComputedStyle(panel).borderTopLeftRadius)||0;
    // Extend behind the title's rounded corners so outer selections join flush.
    const surface=stack?.getBoundingClientRect()||panel.getBoundingClientRect(),tab=indicator.getBoundingClientRect();
    // The header slides down after the intro; measure its final resting plane.
    const header=element.closest('.header');
    const headerShift=header?new DOMMatrixReadOnly(getComputedStyle(header).transform).m42:0;
    element.style.setProperty('--index-hover-extension',`${Math.max(0,surface.top-selected.bottom+headerShift)}px`);
    const label=buttons[active].querySelector<HTMLElement>('.project-nav-label')!;
    const labelOffset=parseFloat(getComputedStyle(element).getPropertyValue('--main-nav-offset'))||0;
    const labelTop=selected.top-headerShift+(selected.height-label.offsetHeight)/2+(header?0:labelOffset);
    // Raised faces use the former resting height; resting faces sit just 4px lower.
    const desiredHeight=Math.max(24,surface.top-labelTop+7);
    const fullHeight=header?Math.min(desiredHeight,Math.max(0,surface.top-2)):desiredHeight;
    const tabTop=surface.top-fullHeight;
    element.style.setProperty('--label-visible-height',`${Math.max(0,surface.top-selected.top+headerShift)}px`);
    const height=surface.top+radius+2-tabTop;
    element.style.setProperty('--indicator-height',`${Math.max(4,height)}px`);
    // All five tab faces share the stationary cover's coordinates.
    stack?.style.setProperty('--tab-hidden-offset',`${surface.top-tabTop}px`);
    stack?.style.setProperty('--folder-tab-top',`${tabTop-surface.top}px`);
    stack?.style.setProperty('--folder-tab-height',`${Math.max(4,height)}px`);
   }
  };
  position();
  const observer=new ResizeObserver(position);
  observer.observe(element);buttons.forEach(button=>{observer.observe(button);observer.observe(button.querySelector('.project-nav-reserve')!);});
  if(panel)observer.observe(panel);
  if(stack)observer.observe(stack);
  window.addEventListener('resize',position);
  return()=>{observer.disconnect();window.removeEventListener('resize',position);};
 },[active,reduced]);
 return <nav ref={nav} data-autoplay-interaction="" data-labels-awake={labelsAwake?'true':'false'} data-reduced-motion={reduced?'true':undefined} class="featured-project-nav" aria-label="Featured projects" style={{'--nav-handoff-duration':`${handoffMs}ms`,'--tab-count':projects.length}} onMouseLeave={()=>onPreview(null)} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node|null))onPreview(null);}} onKeyDown={e=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
  e.preventDefault();
  const buttons=[...e.currentTarget.querySelectorAll('button')];
  const current=buttons.indexOf(e.target as HTMLButtonElement);
  const next=e.key==='Home'?0:e.key==='End'?projects.length-1:(current+(e.key==='ArrowRight'?1:-1)+projects.length)%projects.length;
  buttons[next]?.focus();onSelect(next);
 }}>
  <span class="project-nav-indicator" aria-hidden="true"/>
  {projects.map((project,i)=><button key={project.id} onMouseEnter={()=>{if(matchMedia('(hover:hover)').matches)onPreview(i);}} onFocus={e=>{if(e.currentTarget.matches(':focus-visible'))onPreview(i);}} onPointerDown={e=>{if(e.isPrimary&&e.button===0){cancelAnimationFrame(releaseFrame.current);onPress(i);}}} onClick={()=>{cancelAnimationFrame(releaseFrame.current);onPress(null);if(i!==active)onSelect(i);}} class={i===active?'active':''} aria-current={i===active?'true':undefined} aria-label={project.indexTitle}>
   {/* Reserve the widest weight so letter handoffs never resize the tabs. */}
   <span class="project-nav-reserve" aria-hidden="true">{project.indexTitle}</span>
   <span class="project-label-clip"><NavigationLabel label={project.indexTitle} letters={boldLetters[i]}/></span>
  </button>)}
 </nav>;
}
