import {useLayoutEffect,useRef,useState} from 'preact/hooks';
import {IdentityHeading} from '../../components/IdentityHeading';
import {RoleDescriptor} from '../../components/RoleDescriptor';
import {projects} from '../../content/projects';
import {TAGLINE_MS,INTRO_SIGNATURE_DELAY_MS,INTRO_TAGLINE_DELAY_MS} from './timing';
import {IntroRoleReel} from './IntroRoleReel';

const GREETING_MS=INTRO_SIGNATURE_DELAY_MS;
const titles=[...new Set(projects.flatMap(p=>[...p.roles,...p.expandedRoles]))];
const FINAL_PAIR=projects[0].roles;


/** A non-interactive introduction, ending at the exact identity-column geometry. */
export function IntroSequence({destination,reduced,onComplete}:{destination:()=>HTMLElement|null;reduced:boolean;onComplete:()=>void}){
 const block=useRef<HTMLDivElement>(null),roleBlock=useRef<HTMLDivElement>(null);
 const complete=useRef(onComplete);complete.current=onComplete;
 const [tagline,setTagline]=useState(reduced);
 const [rolesVisible,setRolesVisible]=useState(false);
 const [reelRunning,setReelRunning]=useState(false);
 const [settled,setSettled]=useState(false);
 const sequence=useRef<()=>void>(()=>{});
 const shrink=useRef<()=>void>(()=>{});
 const timers=useRef<ReturnType<typeof setTimeout>[]>([]);
 const started=useRef(false);
 const later=(fn:()=>void,ms:number)=>timers.current.push(setTimeout(fn,ms));
 const afterWriting=()=>{
  if(started.current)return;
  started.current=true;
  if(reduced)setTagline(true);
  else later(()=>setTagline(true),INTRO_TAGLINE_DELAY_MS);
  later(()=>sequence.current(),reduced?150:INTRO_TAGLINE_DELAY_MS+TAGLINE_MS+200);
 };
 useLayoutEffect(()=>{
  const element=block.current,target=destination(),roles=roleBlock.current;
  const heading=target?.querySelector<HTMLElement>('.identity-heading');
  const targetRoles=target?.querySelector<HTMLElement>('.role-system');
  if(!element||!target||!heading||!targetRoles||!roles)return;
  let rect=target.getBoundingClientRect();
  const head=heading.getBoundingClientRect(),roleRect=targetRoles.getBoundingClientRect();
  const height=Math.max(head.bottom,roleRect.bottom)-rect.top;
  element.style.left=`${rect.left}px`;element.style.top=`${rect.top}px`;element.style.width=`${rect.width}px`;element.style.height=`${height}px`;
  const copyHeading=element.querySelector<HTMLElement>('.identity-heading')!;
  const syncGeometry=()=>{
   rect=target.getBoundingClientRect();
   element.style.left=`${rect.left}px`;element.style.top=`${rect.top}px`;element.style.width=`${rect.width}px`;
   const headBox=heading.getBoundingClientRect(),roleBox=targetRoles.getBoundingClientRect();
   const headingStyle=getComputedStyle(heading);
   for(const property of ['--role-size','--identity-layout','--identity-signature-width','--identity-signature-left','--identity-height','--identity-hello-top','--identity-tagline-top','--inline-text-top','--signature-comma-left','--signature-comma-top']){
    const value=headingStyle.getPropertyValue(property);if(value)copyHeading.style.setProperty(property,value);
   }
   copyHeading.style.width=`${headBox.width}px`;copyHeading.style.maxWidth='none';copyHeading.style.height=`${headBox.height}px`;copyHeading.style.marginLeft=`${headBox.left-rect.left}px`;copyHeading.style.top=`${headBox.top-rect.top}px`;
   roles.style.left=`${roleBox.left-rect.left}px`;roles.style.top=`${roleBox.top-rect.top}px`;roles.style.width=`${roleBox.width}px`;roles.style.height=`${roleBox.height}px`;
   roles.style.translate='none';
   const roleStyle=getComputedStyle(targetRoles);
   for(const property of ['--amp-size','--role-size','--role-zone','--label-row','--glyph-row','--role-clearance','--compact-role-height','--descriptor-layout']){
    const value=roleStyle.getPropertyValue(property);if(value)roles.style.setProperty(property,value);
   }
   return Math.max(headBox.bottom,roleBox.bottom)-rect.top;
  };
  syncGeometry();
  const centered=(contentHeight:number,fraction:number,contentWidth=rect.width,left=0,top=0)=>{
   const scale=Math.min((innerWidth-32)/contentWidth,innerHeight*fraction/contentHeight,3);
   return `translate(${(innerWidth-contentWidth*scale)/2-rect.left-left*scale}px,${(innerHeight-contentHeight*scale)/2-rect.top-top*scale}px) scale(${scale})`;
  };
  const large=centered(head.height,.76,head.width,head.left-rect.left,head.top-rect.top);
  let full=centered(height,.86);
  element.style.transform=reduced?'none':large;
  const syncTagline=()=>{
   const final=heading.querySelector<HTMLElement>('.identity-tagline')!;
   const copy=element.querySelector<HTMLElement>('.identity-tagline')!;
   const finalBox=final.getBoundingClientRect(),headBox=heading.getBoundingClientRect();
   copy.style.left=`${finalBox.left-headBox.left}px`;copy.style.right='auto';
   copy.style.top=`${finalBox.top-headBox.top}px`;copy.style.width=`${finalBox.width}px`;
   // The measured box already includes the tagline's optical translation.
   copy.style.transform='none';copy.style.translate='none';
  };
  syncTagline();
  const animations:Animation[]=[];
  const move=(from:string,to:string,duration:number,done?:()=>void)=>{
   const animation=element.animate([{transform:from},{transform:to}],{duration,easing:'cubic-bezier(.65,0,.25,1)',fill:'forwards'});
   animations.push(animation);if(done)animation.onfinish=done;
  };
  shrink.current=()=>{
   const finalHeight=syncGeometry();syncTagline();
   element.style.height=`${finalHeight}px`;
   full=centered(finalHeight,.86);
   move(full,'translate(0,0) scale(1)',1200,()=>complete.current());
  };
  sequence.current=()=>{
   if(reduced){setRolesVisible(true);setSettled(true);later(()=>complete.current(),200);return;}
   setRolesVisible(true);
   // Reframe the centered identity to make room for the title montage below it.
   move(large,full,600);
   later(()=>setReelRunning(true),600);
  };
  // The landing column positions its role section after measuring the J.
  // Read that final geometry after the parent's layout effect has run.
  const refreshGeometry=()=>{
   const finalHeight=syncGeometry();
   syncTagline();
   element.style.height=`${finalHeight}px`;
   full=centered(finalHeight,.86);
  };
  let layoutFrame=requestAnimationFrame(refreshGeometry);
  const queueGeometry=()=>{cancelAnimationFrame(layoutFrame);layoutFrame=requestAnimationFrame(refreshGeometry);};
  const sizes=new ResizeObserver(queueGeometry);sizes.observe(heading);sizes.observe(targetRoles);sizes.observe(target);
  const geometry=new MutationObserver(queueGeometry);geometry.observe(heading,{attributes:true,attributeFilter:['style']});geometry.observe(targetRoles,{attributes:true,attributeFilter:['style']});
  window.addEventListener('resize',queueGeometry);
  return()=>{cancelAnimationFrame(layoutFrame);sizes.disconnect();geometry.disconnect();window.removeEventListener('resize',queueGeometry);timers.current.forEach(clearTimeout);animations.forEach(animation=>animation.cancel());};
 },[reduced]);
 const reelSettled=()=>{setSettled(true);later(()=>shrink.current(),550);};
 return <div class="intro-sequence" aria-label="Introducing Jared">
  <span class="sr-only">Hi! I’m Jared, a multidisciplinary creative. Screenwriter and Illustrator.</span>
  <div ref={block} class="intro-composition" aria-hidden="true">
   <IdentityHeading intro reduced={reduced} taglineReady={tagline} signatureDelay={GREETING_MS} onWritten={afterWriting}/>
   <div ref={roleBlock} class={`role-system intro-role-system ${rolesVisible?'intro-roles-visible':''} ${settled?'intro-roles-settled':''}`}>
    <span class="ampersand">&</span>
    {rolesVisible&&reelRunning&&!settled&&<IntroRoleReel titles={titles} finalPair={FINAL_PAIR} onSettled={reelSettled}/>}
    {settled&&<div class="role-pair intro-reel-settled"><RoleDescriptor label={FINAL_PAIR[0]} position="one"/><RoleDescriptor label={FINAL_PAIR[1]} position="two"/></div>}
   </div>
  </div>
 </div>;
}
