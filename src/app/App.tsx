import {useEffect,useLayoutEffect,useRef,useState} from 'preact/hooks';
import {lazy,Suspense} from 'preact/compat';
import {AudioProvider} from '../features/audio/AudioProvider';
import {Player} from '../components/Player';
import {Landing} from '../features/landing/Landing';
import {Overlay} from '../components/Overlay';
import {ProjectView,GameView,Missing} from '../features/projects/ProjectView';
import {parseRoute,useRoute} from './router';
import {MainNavigation} from '../components/MainNavigation';
import {baseTheme,projects} from '../content/projects';
import {TAB_STROKE_MS} from '../features/landing/timing';
const SignatureEditor=import.meta.env.DEV&&new URLSearchParams(location.search).get('signature-editor')==='1'?lazy(()=>import('../features/signature-editor/SignatureEditor')):null;
const projectHeaderPalettes:Record<string,{surface:string;ink:string;highlight:string}>={
 'foul-balls':{surface:'#241c32',ink:'#ffffff',highlight:'#846393'},
 'the-sleds':{surface:'#19364d',ink:'#ffffff',highlight:'#b6d3e9'},
 'design':{surface:'#173458',ink:'#ffffff',highlight:'#008477'},
 'illustration':{surface:'#edf5fb',ink:'#173458',highlight:'#88281d'},
 'afroman':{surface:'#000000',ink:'#ffffff',highlight:'#ef8216'},
};
function Shell(){
 const route=useRoute();
 const isOverlay=route.kind==='overlay';
 const visibleRoute=isOverlay?parseRoute(route.background):route;
 const [introDone,setIntroDone]=useState(false);
 const [landingTheme,setLandingTheme]=useState<string|null>(null);
 const [chapterSurface,setChapterSurface]=useState('#ffffff');
 const [projectNavigationTarget,setProjectNavigationTarget]=useState<HTMLDivElement|null>(null);
 const [signatureEditing,setSignatureEditing]=useState(false);
 const [returnHeaderPalette,setReturnHeaderPalette]=useState<{surface:string;ink:string;highlight:string}|null>(null);
 const [returnHeaderLeaving,setReturnHeaderLeaving]=useState(false);
 const [reduced,setReduced]=useState(matchMedia('(prefers-reduced-motion: reduce)').matches);
 const root=useRef<HTMLDivElement>(null),spot=useRef<HTMLDivElement>(null),headerElement=useRef<HTMLElement>(null),headerCollapse=useRef(0);
 useEffect(()=>{const mq=matchMedia('(prefers-reduced-motion: reduce)');const fn=()=>setReduced(mq.matches);mq.addEventListener('change',fn);return()=>mq.removeEventListener('change',fn);},[]);
 useEffect(()=>{const container=root.current;if(!container||reduced||!matchMedia('(hover: hover) and (pointer: fine)').matches)return;let frame=0;const move=(e:PointerEvent)=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{if(spot.current)spot.current.style.transform=`translate3d(${e.clientX-125}px,${e.clientY-125}px,0)`;});};window.addEventListener('pointermove',move,{passive:true});return()=>{cancelAnimationFrame(frame);window.removeEventListener('pointermove',move);};},[reduced]);
 const path=visibleRoute.kind;
 const viewKey=path+(visibleRoute.kind==='project'?visibleRoute.id:'');
 const smartHeader=!isOverlay&&(path==='project'||path==='game');
 useEffect(()=>{
  const header=headerElement.current;
  if(!header)return;
  headerCollapse.current=0;
  header.style.setProperty('--header-collapse','0px');
  if(!smartHeader)return;
  let previousY=window.scrollY;
  const onScroll=()=>{
   const y=window.scrollY,delta=y-previousY;
   previousY=y;
   const safeTop=root.current?parseFloat(getComputedStyle(root.current).paddingTop)||0:0;
   const maxCollapse=header.offsetHeight+safeTop;
   headerCollapse.current=y<=0?0:Math.max(0,Math.min(maxCollapse,headerCollapse.current+delta));
   header.style.setProperty('--header-collapse',`${headerCollapse.current}px`);
  };
  window.addEventListener('scroll',onScroll,{passive:true});
  return()=>window.removeEventListener('scroll',onScroll);
 },[smartHeader,viewKey]);
 const previousPath=useRef(viewKey);
 useEffect(()=>{if(viewKey!==previousPath.current&&!isOverlay){window.scrollTo(0,0);requestAnimationFrame(()=>{const main=document.getElementById('main');main?.setAttribute('tabindex','-1');main?.focus({preventScroll:true});});}previousPath.current=viewKey;},[viewKey,isOverlay]);
 useEffect(()=>{document.querySelector('main')?.setAttribute('tabindex','-1');document.title=route.kind==='overlay'?`${route.panel==='about'?'About':'Contact'} — Jared`:route.kind==='project'?`${projects.find(p=>p.id===route.id)?.title||'Project'} — Jared`:route.kind==='game'?'Play Afroman — Jared':'Jared — Multidisciplinary Creative';},[route]);
 const themeProject=visibleRoute.kind==='project'?projects.find(p=>p.id===visibleRoute.id):visibleRoute.kind==='game'?projects.find(p=>p.id==='afroman'):projects.find(p=>p.id===landingTheme);
 const lastProjectId=useRef<string|null>(null);
 if(visibleRoute.kind==='project')lastProjectId.current=visibleRoute.id;
 else if(visibleRoute.kind==='game')lastProjectId.current='afroman';
 const theme=themeProject?.theme||baseTheme;
 const headerPalette=themeProject?projectHeaderPalettes[themeProject.id]:undefined;
 const lastDedicatedPalette=useRef<{surface:string;ink:string;highlight:string}>({surface:'#173458',ink:'#ffffff',highlight:'#ffffff'});
 const wasDedicated=useRef(smartHeader);
 useEffect(()=>{
  if(smartHeader){
   if(headerPalette)lastDedicatedPalette.current=headerPalette;
   setReturnHeaderPalette(null);setReturnHeaderLeaving(false);
  }else if(path==='home'&&wasDedicated.current){
   setReturnHeaderPalette(lastDedicatedPalette.current);setReturnHeaderLeaving(false);
  }
  wasDedicated.current=smartHeader;
 },[smartHeader,path,headerPalette?.surface,headerPalette?.ink,headerPalette?.highlight]);
 const returnHeaderVisible=path==='home'&&(returnHeaderPalette!==null||wasDedicated.current);
 const activeHeaderPalette=returnHeaderVisible?(returnHeaderPalette||lastDedicatedPalette.current):headerPalette;
 const pageSurface=visibleRoute.kind==='project'&&visibleRoute.id==='design'?chapterSurface:theme.background;
 const browserSurface=smartHeader||returnHeaderVisible?activeHeaderPalette?.surface||pageSurface:pageSurface;
 useLayoutEffect(()=>{
  // Safari/Chrome can show the document canvas and theme tint outside the app,
  // including the top safe area and overscroll. Keep those surfaces in theme.
  document.documentElement.style.setProperty('--browser-surface',browserSurface);
  document.documentElement.style.setProperty('--page-surface',pageSurface);
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content',browserSurface);
 },[browserSurface,pageSurface]);
 const pageIndex=visibleRoute.kind==='project'?projects.findIndex(p=>p.id===visibleRoute.id):-1;
 const previousProject=projects[(pageIndex+projects.length-1)%projects.length],nextProject=projects[(pageIndex+1)%projects.length];
 const revealHeader=()=>{headerCollapse.current=0;headerElement.current?.style.setProperty('--header-collapse','0px');};
 return <div class={`app-shell ${path==='home'?'shell-home':''} ${smartHeader?'shell-project-route':''} ${returnHeaderVisible?'header-returning':''} ${returnHeaderLeaving?'header-returning-out':''} ${!introDone&&path==='home'?'intro-running':''}`} data-project-theme={themeProject?.id} ref={root} style={{'--surface':theme.background,'--chapter-surface':chapterSurface,'--ink':theme.text,'--accent':theme.accent,'--accent-text':theme.accentText||theme.accent,'--player-surface':theme.playerBackground||theme.text,'--header-surface':activeHeaderPalette?.surface||theme.background,'--header-ink':activeHeaderPalette?.ink||theme.text,'--header-highlight':activeHeaderPalette?.highlight||theme.accent,'--tab-motion-duration':`${reduced?0:TAB_STROKE_MS}ms`}}>
 <div class="cursor-reveal" ref={spot} aria-hidden="true"/>
 <a class="skip-link" href="#main" onClick={e=>{e.preventDefault();document.getElementById('main')?.focus();}}>Skip to content</a>
 <header key={smartHeader?viewKey:'home'} ref={headerElement} class={`header ${smartHeader?'project-route-header':''} ${returnHeaderVisible?'return-route-header':''} ${!introDone&&path==='home'?'intro-hidden':''}`} inert={!introDone&&path==='home'} onFocusCapture={revealHeader} onAnimationEnd={event=>{if(event.animationName==='header-band-up'){setReturnHeaderPalette(null);setReturnHeaderLeaving(false);}}}>
  <div class="header-primary"><a class="wordmark" href="#/" aria-label="Jared Conroy home">jared conroy</a><MainNavigation active={route.kind==='overlay'?route.panel:'work'} reduced={reduced}/></div>
  <div class="featured-nav-slot" ref={setProjectNavigationTarget} hidden={path!=='home'}/>
  {pageIndex>=0&&<nav class="project-context-nav" aria-label="Browse projects"><a href={`#/work/${previousProject.id}`}>← {previousProject.indexTitle}</a><span>{String(pageIndex+1).padStart(2,'0')} / {String(projects.length).padStart(2,'0')}</span><a href={`#/work/${nextProject.id}`}>{nextProject.indexTitle} →</a></nav>}
 </header>
 {smartHeader&&<div class="header-spacer" aria-hidden="true"/>}
 <div class="view-container">
 <div hidden={path!=='home'}><Landing navigationTarget={projectNavigationTarget} visible={path==='home'} returnProjectId={path==='home'?lastProjectId.current:null} overlayOpen={isOverlay||signatureEditing} reduced={reduced} onIntroDone={()=>setIntroDone(true)} onThemeChange={setLandingTheme} onIndexAwakeChange={awake=>{if(awake&&returnHeaderVisible){if(reduced){setReturnHeaderPalette(null);setReturnHeaderLeaving(false);}else setReturnHeaderLeaving(true);}}}/></div>
 {path==='project'&&visibleRoute.kind==='project'&&<ProjectView id={visibleRoute.id} onSurfaceChange={setChapterSurface}/>}
 {path==='game'&&<GameView/>}
 {(path==='missing'||path==='overlay')&&<Missing/>}
 </div>
 <Player/>
 {SignatureEditor&&introDone&&path==='home'&&!isOverlay&&<Suspense fallback={null}><SignatureEditor onEditingChange={setSignatureEditing}/></Suspense>}
 {route.kind==='overlay'&&<Overlay key={route.panel} panel={route.panel}/>}
 </div>;
}
export function App(){return <AudioProvider><Shell/></AudioProvider>;}
