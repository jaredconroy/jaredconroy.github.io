import {useEffect,useLayoutEffect,useRef,useState} from 'preact/hooks';
import {createPortal} from 'preact/compat';
import {NeonAmpersand} from '../../components/NeonAmpersand';
import {SledsWordmark} from '../../components/SledsWordmark';
import {SledsAmpersand} from '../../components/SledsAmpersand';
import {projects,projectRoute} from '../../content/projects';
import {PlaceholderMedia} from '../../components/PlaceholderMedia';
import {RoleDescriptor} from '../../components/RoleDescriptor';
import {textLineMetrics} from '../../components/textMetrics';
import {IdentityHeading} from '../../components/IdentityHeading';
import {CYCLE_MS,stepClock,projectTiming,INTRO_TRANSITION_MS} from './timing';
import {tabLevels,tabTransitionPlan,type TabTransition} from './tabTransitions';
import {useAutoplayInteraction} from './useAutoplayInteraction';
import {IntroSequence} from './IntroSequence';
import {ProjectNavigation} from '../../components/ProjectNavigation';
import {FolderTab} from './FolderTab';
import {useBatCrack} from '../audio/useBatCrack';
import {useNeonSign} from '../neon/useNeonSign';
import {CompactRoleChain} from './CompactRoleChain';
export function Landing({overlayOpen,reduced,onIntroDone,visible,onThemeChange,navigationTarget,returnProjectId,onIndexAwakeChange}:{overlayOpen:boolean;reduced:boolean;onIntroDone:()=>void;visible:boolean;onThemeChange:(id:string|null)=>void;navigationTarget:HTMLElement|null;returnProjectId:string|null;onIndexAwakeChange:(awake:boolean)=>void}){
 const [desktop,setDesktop]=useState(()=>matchMedia('(min-width:1001px) and (min-height:701px)').matches);
 useEffect(()=>{const query=matchMedia('(min-width:1001px) and (min-height:701px)');const update=()=>setDesktop(query.matches);query.addEventListener('change',update);return()=>query.removeEventListener('change',update);},[]);
 const [intro,setIntro]=useState(()=>visible);
 const [active,setActive]=useState(0),[stage,setStage]=useState<'idle'|'out'|'in'>('idle');
 const [displayed,setDisplayed]=useState(0);
 const [flipped,setFlipped]=useState(false);
 const [ampEntering,setAmpEntering]=useState(false);
 const [introTransition,setIntroTransition]=useState(false);
 const [tabTransition,setTabTransition]=useState<TabTransition|null>(null);
 const [previewIndex,setPreviewIndex]=useState<number|null>(null);
 const [pressedTab,setPressedTab]=useState<number|null>(null);
 const motion=projectTiming(reduced);
 useEffect(()=>setPreviewIndex(null),[desktop]);
 const introAnimating=useRef(false);
 const introRef=useRef(intro);
 const identityRef=useRef<HTMLElement>(null);
 useLayoutEffect(()=>{
  if(!visible)return;
  const identity=identityRef.current;
  const svg=identity?.querySelector('svg');
  const roles=identity?.querySelector<HTMLElement>('.role-system');
  const heading=identity?.querySelector<HTMLElement>('.identity-heading');
  if(!identity||!svg||!roles||!heading)return;
  const position=()=>{
   if(!identity.getClientRects().length||!identity.getBoundingClientRect().width)return;
   const arrangement=getComputedStyle(identity).getPropertyValue('--identity-arrangement').trim();
   if(['row','inline'].includes(arrangement)){
    roles.style.removeProperty('margin-top');roles.style.removeProperty('--role-zone');roles.style.removeProperty('--role-footer');
    const toggle=roles.querySelector<HTMLElement>('.roles-toggle');toggle?.style.removeProperty('top');toggle?.style.removeProperty('bottom');
    if(arrangement==='inline'){
     const tagline=heading.querySelector<HTMLElement>('.identity-tagline')!,amp=roles.querySelector<HTMLElement>('.ampersand')!;
     const type=textLineMetrics(tagline.querySelector<HTMLElement>('strong')!,'p');
     const pBottom=tagline.getBoundingClientRect().top+type.baseline+(tagline.offsetHeight-type.lineHeight)/2+type.descent;
     const ink=textLineMetrics(amp,'&'),center=parseFloat(getComputedStyle(amp).top);
     const oldOffset=parseFloat(roles.style.getPropertyValue('--compact-role-offset'))||0;
     // Use the idle ink top, so hover growth never moves the entire row.
     const flowTop=roles.getBoundingClientRect().top-oldOffset;
     const inkTop=flowTop+center-amp.offsetHeight/2+ink.baseline-ink.ascent;
     const offset=pBottom-inkTop;
     if(Math.abs(oldOffset-offset)>.02)roles.style.setProperty('--compact-role-offset',`${offset}px`);
     if(import.meta.env.DEV){roles.dataset.compactPBottom=String(pBottom);roles.dataset.compactAmpTop=String(inkTop+offset);}
    }else roles.style.removeProperty('--compact-role-offset');
    return;
   }
   roles.style.removeProperty('--compact-role-offset');
   if(!svg.getBoundingClientRect().width)return;
   const tagline=heading.querySelector<HTMLElement>('.identity-tagline')!;
   const taglineType=textLineMetrics(tagline.querySelector<HTMLElement>('strong')!);
   const taglineBaseline=taglineType.baseline+(tagline.offsetHeight-taglineType.lineHeight)/2;
   const labels=[...roles.querySelectorAll<HTMLElement>('.role-pair>.role')];
   const topRole=labels.find(label=>getComputedStyle(label).gridRowStart==='1');
   const bottomRole=labels.find(label=>getComputedStyle(label).gridRowStart==='3');
   const topLabel=topRole?.querySelector<HTMLElement>('.role-label');
   if(!topLabel)return;
   const topLine=(topLabel.firstElementChild as HTMLElement)||topLabel;
   // Fixed cap/descender metrics: “Graphic” must not move the role frame
   // simply because its first line contains a p and other titles do not.
   const canonicalType=textLineMetrics(topLine,'Hg');
   const visibleTop=canonicalType;
   const lineGap=Math.max(0,canonicalType.lineHeight-canonicalType.descent-canonicalType.ascent);
   const thinJBottom=parseFloat(heading.style.getPropertyValue('--signature-neon-j-bottom'));
   const roleAnchor=Math.max(tagline.getBoundingClientRect().top+taglineBaseline,heading.getBoundingClientRect().top+(Number.isFinite(thinJBottom)?thinJBottom:0));
   const visual=identity.closest('.landing')?.querySelector<HTMLElement>('.feature-visual');
   const stack=identity.closest('.landing')?.querySelector<HTMLElement>('.folder-stack');
   const progress=stack?.querySelector<HTMLElement>('.progress-track');
   const visualBottom=stack?stack.getBoundingClientRect().bottom-(progress?.offsetHeight||0):visual?.getBoundingClientRect().bottom;
   const bottomLabel=bottomRole?.querySelector<HTMLElement>('.role-label');
   const bottomLine=(bottomLabel?.lastElementChild as HTMLElement)||bottomLabel;
   const bottomType=bottomLine?textLineMetrics(bottomLine):null;
   const tail=bottomType?bottomType.lineHeight-bottomType.baseline:0;
   // Restore the signature-anchored frame; lower only its desktop top edge.
   // The zone below is recalculated from the fixed image baseline.
   const top=roleAnchor+taglineType.descent+lineGap-(visibleTop.baseline-visibleTop.ascent)+(innerWidth>1000?65:0);
   const current=parseFloat(getComputedStyle(roles).marginTop)||0;
   const margin=current+top-roles.getBoundingClientRect().top;
   if(Math.abs(margin-current)>.05)roles.style.marginTop=`${margin}px`;
   if(innerWidth>1000&&visual){
    const zone=Math.max(0,visualBottom!+tail-roles.getBoundingClientRect().top);
    if(Math.abs(zone-(parseFloat(roles.style.getPropertyValue('--role-zone'))||0))>.05)roles.style.setProperty('--role-zone',`${zone}px`);
    if(import.meta.env.DEV){roles.dataset.lineGap=String(lineGap);roles.dataset.bottomBaselineTail=String(tail);}
    const toggle=roles.querySelector<HTMLElement>('.roles-toggle'),label=roles.querySelector<HTMLElement>('.hats-label');
    const timer=identity.closest('.landing')?.querySelector('.timer-copy>span');
    if(toggle&&label&&timer){
     const innerBottom=label.getBoundingClientRect().bottom-toggle.getBoundingClientRect().top;
     toggle.style.top=`${timer.getBoundingClientRect().bottom-roles.getBoundingClientRect().top-innerBottom}px`;toggle.style.bottom='auto';
     roles.style.setProperty('--role-footer',`${timer.getBoundingClientRect().bottom-visualBottom!+16}px`);
    }
   }else {
    roles.style.removeProperty('--role-zone');roles.style.removeProperty('--role-footer');
    const toggle=roles.querySelector<HTMLElement>('.roles-toggle');toggle?.style.removeProperty('top');toggle?.style.removeProperty('bottom');
   }

  };
  position();
  const observer=new ResizeObserver(position);observer.observe(heading);observer.observe(svg);
  const amp=roles.querySelector('.ampersand');if(amp)observer.observe(amp);
  roles.querySelectorAll('.role-label').forEach(label=>observer.observe(label));
  const visual=identity.closest('.landing')?.querySelector('.feature-visual');
  if(visual)observer.observe(visual);
  const geometry=new MutationObserver(position);geometry.observe(heading,{attributes:true,attributeFilter:['style']});
  geometry.observe(roles,{attributes:true,attributeFilter:['class']});
  const feature=identity.closest('.landing')?.querySelector('.feature');
  if(feature)geometry.observe(feature,{attributes:true,attributeFilter:['style']});
  // Route changes restore the shared grid and navigation measurements after
  // this effect. Reconcile once that final frame is in place.
  let frame=requestAnimationFrame(()=>{position();frame=requestAnimationFrame(position);});
  window.addEventListener('resize',position);
  void document.fonts.ready.then(position);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();geometry.disconnect();window.removeEventListener('resize',position);};
 },[visible,desktop]);
 const [expanded,setExpanded]=useState(false),[hoverRoles,setHoverRoles]=useState(false),[hidden,setHidden]=useState(document.hidden);
 const [elapsed,setElapsed]=useState(0),[userPaused,setUserPaused]=useState(false);
 const interacting=useAutoplayInteraction();
 const indexRef=useRef(0),targetRef=useRef(0),manualRequest=useRef(false),transitionRef=useRef(false),timers=useRef(new Set<ReturnType<typeof setTimeout>>()),resumeCountdownOnSettle=useRef(false),lastReturnProject=useRef<string|null>(null);
 const schedule=(run:()=>void,delay:number)=>{const id=setTimeout(()=>{timers.current.delete(id);run();},delay);timers.current.add(id);};
 const finishIntro=()=>{
  if(!introRef.current)return;
  onThemeChange(projects[indexRef.current].id);
  introRef.current=false;setIntro(false);
  introAnimating.current=true;
  setIntroTransition(true);setStage('in');setAmpEntering(false);onIntroDone();
  schedule(()=>{introAnimating.current=false;setStage('idle');setAmpEntering(false);setIntroTransition(false);if(targetRef.current!==indexRef.current)activate(targetRef.current,manualRequest.current);},INTRO_TRANSITION_MS/2);
 };
 useEffect(()=>{if(!intro)onIntroDone();},[]);
 useEffect(()=>{
  let windowAway=false;
  const update=()=>setHidden(document.hidden||windowAway);
  const blur=()=>{windowAway=true;update();};
  const focus=()=>{windowAway=false;update();};
  document.addEventListener('visibilitychange',update);window.addEventListener('blur',blur);window.addEventListener('focus',focus);
  return()=>{document.removeEventListener('visibilitychange',update);window.removeEventListener('blur',blur);window.removeEventListener('focus',focus);};
 },[]);
 useEffect(()=>{
  // A live module refresh cancels owned timers but preserves refs and state.
  // Recover that interrupted handoff instead of leaving the clock held forever.
  if(transitionRef.current||introAnimating.current){
   transitionRef.current=false;introAnimating.current=false;setTabTransition(null);setStage('idle');setIntroTransition(false);setDisplayed(indexRef.current);onThemeChange(projects[indexRef.current].id);
   if(targetRef.current!==indexRef.current)activate(targetRef.current,manualRequest.current);
  }
  return()=>{timers.current.forEach(clearTimeout);timers.current.clear();};
 },[]);
 const activate=(next:number,manual=false)=>{
  if(introRef.current||indexRef.current===next)return;
  targetRef.current=next;
  manualRequest.current=manual;
  setElapsed(0);
  // Keep only the latest requested destination, but finish the current sequence.
  if(introAnimating.current||transitionRef.current)return;
  const previous=indexRef.current;
  setExpanded(false);setHoverRoles(false);
  if(reduced){indexRef.current=next;onThemeChange(projects[next].id);setActive(next);setDisplayed(next);setFlipped(v=>!v);setStage('idle');setElapsed(resumeCountdownOnSettle.current?CYCLE_MS-2000:0);resumeCountdownOnSettle.current=false;return;}
  transitionRef.current=true;
  const plan=tabTransitionPlan(previous,next);
  const apply=(step:typeof plan.steps[number])=>{
   setTabTransition({from:previous,to:next,phase:step.phase,passes:plan.passes,raised:step.raised,handoffMs:plan.handoffMs});
   if(step.commit){indexRef.current=next;setActive(next);setStage('out');setElapsed(0);}
  };
  apply(plan.steps[0]);
  plan.steps.slice(1).forEach(step=>schedule(()=>apply(step),step.at));
  schedule(()=>{onThemeChange(projects[next].id);setDisplayed(next);setFlipped(v=>!v);setStage('in');},plan.contentSwapAt);
  schedule(()=>setStage('idle'),plan.contentEndAt);
  schedule(()=>{
   transitionRef.current=false;setTabTransition(null);setStage('idle');
   if(targetRef.current!==indexRef.current)activate(targetRef.current,manualRequest.current);
   else if(resumeCountdownOnSettle.current){setElapsed(CYCLE_MS-2000);resumeCountdownOnSettle.current=false;}
  },plan.total);
 };
 useEffect(()=>{
  if(!visible){lastReturnProject.current=null;return;}
  if(!returnProjectId||lastReturnProject.current===returnProjectId)return;
  const destination=projects.findIndex(project=>project.id===returnProjectId);
  if(destination<0)return;
  lastReturnProject.current=returnProjectId;
  setUserPaused(false);
  if(indexRef.current===destination){
   onThemeChange(projects[destination].id);
   resumeCountdownOnSettle.current=true;
   setActive(destination);setDisplayed(destination);setElapsed(CYCLE_MS-2000);
   requestAnimationFrame(()=>{resumeCountdownOnSettle.current=false;});
  }else{
   resumeCountdownOnSettle.current=true;
   activate(destination,false);
  }
 },[visible,returnProjectId]);
 const paused=!visible||hidden||overlayOpen||interacting||userPaused;
 const state=useRef({intro,paused,reduced,transitioning:!!tabTransition||stage!=='idle'});state.current={intro,paused,reduced,transitioning:!!tabTransition||stage!=='idle'};
 useEffect(()=>{let last=performance.now();const timer=setInterval(()=>{const now=performance.now(),delta=Math.min(now-last,250);last=now;const s=state.current;
  if(s.intro)return;
  if(!s.reduced)setElapsed(value=>stepClock(value,delta,s.paused,s.transitioning));
 },50);return()=>clearInterval(timer);},[]);
 useEffect(()=>{if(elapsed>=CYCLE_MS&&!resumeCountdownOnSettle.current)activate((indexRef.current+1)%projects.length);},[elapsed]);
 const p=projects[displayed];
 const roleOpen=expanded||hoverRoles;
 const neonActive=p.id==='afroman'&&roleOpen&&visible&&!hidden&&!overlayOpen&&!intro;
 useNeonSign(neonActive,reduced,identityRef);
 const batAudio=useBatCrack(roleOpen,p.id==='foul-balls'&&visible&&!hidden&&!overlayOpen&&!intro);
 const candidates=p.expandedRoles.filter(role=>!p.roles.includes(role)).sort((a,b)=>b.length-a.length);
 const extraRoles=[...candidates.slice(0,2),...candidates.slice(2).sort((a,b)=>a.length-b.length)].slice(0,6);
 useLayoutEffect(()=>{
  if(!roleOpen)return;
  const system=identityRef.current?.querySelector<HTMLElement>('.role-system');
  if(!system)return;
  const labels=[...system.querySelectorAll<HTMLElement>('.role-label')];
  const arrange=()=>{
  const compactRoles=getComputedStyle(system).getPropertyValue('--descriptor-layout').trim()==='inline';
  if(compactRoles)return; // The horizontal sentence measures its own complete chain.
  const size=Math.min(...labels.map(label=>parseFloat(getComputedStyle(label).fontSize)))*.65;
  system.style.setProperty('--extra-role-size',`${size}px`);
  labels.forEach(label=>{
   const ratio=size/parseFloat(getComputedStyle(label).fontSize);
   label.style.setProperty('--role-shrink',String(ratio));
  });
  system.style.setProperty('--expanded-top-edge','0px');
  system.style.setProperty('--expanded-bottom-edge',`${system.querySelector<HTMLElement>('.role-pair')!.offsetHeight}px`);
  };
  arrange();
  const observer=new ResizeObserver(arrange);
  labels.forEach(label=>observer.observe(label.parentElement!));
  return()=>observer.disconnect();
 },[roleOpen,p.id]);
 const lead=!intro&&!introTransition&&!tabTransition&&!reduced&&elapsed>=CYCLE_MS-1000?(active+1)%projects.length:null;
 const levels=tabLevels(projects.length,active,tabTransition,lead,previewIndex,pressedTab);
 const phase=tabTransition?.phase||'idle';
 const indexAwake=previewIndex!==null||lead!==null||(!!tabTransition&&phase!=='cleanup')||pressedTab!==null;
 useLayoutEffect(()=>{onIndexAwakeChange(indexAwake);},[indexAwake]);
 // Update navigation labels before the tab faces in the same render; neither animation waits for the other.
 const projectNavigation=<ProjectNavigation active={active} reduced={reduced} labelsAwake={indexAwake} selectionTarget={tabTransition?.to??active} handoffMs={tabTransition?.handoffMs} onPreview={setPreviewIndex} onPress={setPressedTab} onSelect={i=>activate(i,true)}/>;
 return <main id={visible?"main":"landing-main"} tabindex={-1} data-reduced-motion={reduced?'true':undefined} class={`landing ${intro?'is-intro':''} ${introTransition?'intro-handoff':''}`} style={{'--intro-half':`${INTRO_TRANSITION_MS/2}ms`,'--folder-out-duration':`${motion.out}ms`,'--folder-in-duration':`${motion.in}ms`}}>
 <section ref={identityRef} class="identity" aria-label="Jared, multidisciplinary creative">
  <IdentityHeading/>
  <div inert={intro} data-autoplay-interaction="" data-bat-audio={p.id==='foul-balls'?batAudio:undefined} class={`role-system ${roleOpen?'expanded':''} ${ampEntering?'amp-entering':''} ${flipped?'roles-flipped':''}`} onMouseEnter={()=>{if(matchMedia('(hover:hover)').matches)setHoverRoles(true);}} onMouseLeave={()=>setHoverRoles(false)} onKeyDown={e=>{if(e.key==='Escape'){setExpanded(false);setHoverRoles(false);e.stopPropagation();}}}>
   <span class="ampersand" aria-hidden="true">{p.id==='the-sleds'?<SledsAmpersand/>:<span class="ampersand-glyph">&</span>}<NeonAmpersand active={neonActive}/></span>
   <div class={`role-pair transition-${stage}`} aria-live="polite"><span class="sr-only">{p.roles[0]} and {p.roles[1]}</span><RoleDescriptor label={p.roles[0]} position="one"/><RoleDescriptor label={p.roles[1]} position="two"/></div>
   <button class="roles-toggle" aria-expanded={roleOpen} aria-controls="more-roles" onClick={()=>{if(roleOpen){setExpanded(false);setHoverRoles(false);}else setExpanded(true);}}><span class="hats-label">{roleOpen?'− a few more hats':'+ a few more hats'}</span><span class="sr-only"> for {p.title}</span></button>
   <div class="more-roles" id="more-roles" aria-hidden={!roleOpen} inert={!roleOpen}>
    {extraRoles.map((role,i)=><span class={`extra-role extra-${['corner-one','corner-two','top','bottom','left','right'][i]}`} key={role} style={{'--reveal-order':i}}>{role.split(' ').map(word=><span>{word}</span>)}</span>)}
    <CompactRoleChain pair={p.roles} extra={extraRoles}/>
   </div>
  </div>

 </section>
 <section inert={intro} data-autoplay-interaction="" class="feature" aria-label="Featured project">
 {desktop&&navigationTarget?createPortal(projectNavigation,navigationTarget):<div class="feature-project-index">{projectNavigation}</div>}
 <div class="folder-stack" data-index-idle={!indexAwake?'true':undefined} data-tab-phase={phase} data-pressed-project={pressedTab===null?undefined:projects[pressedTab].id} data-lead-project={lead===null?undefined:projects[lead].id}>
 <div class={`folder-cover ${introTransition?'project-content transition-in':''}`} style={{'--folder-color':p.theme.accent,'--tab-count':projects.length}}>
 <div class="folder-tabs" aria-hidden="true">{projects.map((project,index)=><FolderTab key={project.id} id={project.id} index={index} color={project.theme.accent} level={levels[index]} pass={tabTransition?.phase!=='cleanup'?tabTransition?.passes.find(pass=>pass.index===index):undefined} reduced={reduced} pressed={pressedTab===index} wave={!!tabTransition}/>)}</div>
 <a class="feature-caption feature-details" href={projectRoute(p.id)} aria-labelledby="featured-title">
  <div class={`feature-title project-content transition-${stage}`}><h2 id="featured-title" class={p.id==='the-sleds'?'sleds-feature-wordmark':undefined}>{p.id==='the-sleds'?<><span class="sr-only">The Sleds</span><SledsWordmark/></>:p.title}</h2></div>
  {p.subtitle&&<p class={`project-subtitle project-content transition-${stage}`}>{p.subtitle}</p>}
 </a>
 <div class="feature-visual">
  <a class={`media-link ${introTransition?'':`project-content transition-${stage}`}`} href={projectRoute(p.id)} aria-label={`See more of ${p.title}`}><PlaceholderMedia project={p} motionPaused={paused||intro||introTransition||!!tabTransition||stage!=='idle'||reduced}/><span class="media-open" aria-hidden="true">↗</span></a>
 </div>
 <div class="progress-track" role="progressbar" aria-label="Time until next project" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(elapsed/CYCLE_MS*100)}><span style={{transform:`scaleX(${elapsed/CYCLE_MS})`}}/></div>
 </div></div>
 <div class="carousel-status"><div class="timer-copy"><span>{intro?'Meet Jared':reduced?'Manual selection':userPaused?'Paused':tabTransition?'Switching project':paused?'On pause':'Next in '+Math.ceil((CYCLE_MS-elapsed)/1000)+'s'}</span><button onClick={()=>setUserPaused(value=>!value)} aria-label={userPaused?'Play project auto-advance':'Pause project auto-advance'} aria-pressed={userPaused} disabled={reduced}>{userPaused?'▶':'Ⅱ'}</button></div></div>
 </section>
 {intro&&<IntroSequence destination={()=>identityRef.current} reduced={reduced} onComplete={finishIntro}/>}
 </main>;
}
