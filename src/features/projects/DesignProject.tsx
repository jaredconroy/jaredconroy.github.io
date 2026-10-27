import {useEffect,useLayoutEffect,useRef,useState} from 'preact/hooks';
import {ChapterNavigation} from '../../components/ChapterNavigation';
import {FittedChapterTitle} from '../../components/FittedChapterTitle';
import {RecordGallery} from '../../components/RecordGallery';
import {ExpressiveText} from '../../components/ExpressiveText';
import {FlierGallery} from '../../components/FlierGallery';
import {designSections,designChapters,designIdentities,designProcess,designInterface,designFilms,type DesignArtwork} from '../../content/design';
const chapterLabels=designChapters.map(chapter=>chapter.indexTitle);
const chapterItems=Object.fromEntries(designSections.map(section=>[section.id,section.items]));
const chapterPalettes:Record<string,{surface:string;ink:string;accent:string}>={
 identities:{surface:'#ffffff',ink:'#173458',accent:'#008477'},
 digital:{surface:'#006b64',ink:'#fff7e9',accent:'#ffd19a'},
 covers:{surface:'#573b2b',ink:'#fff2df',accent:'#f0cd95'},
 posters:{surface:'#e7e1f0',ink:'#173458',accent:'#62528d'},
 film:{surface:'#173458',ink:'#fff7e9',accent:'#72cfbc'},
};
export function DesignProject({onSurfaceChange}:{onSurfaceChange?:(surface:string)=>void}){
 const [selected,setSelected]=useState<DesignArtwork|null>(null);
 const [currentSection,setCurrentSection]=useState('identities');
 const dialog=useRef<HTMLDialogElement>(null);
 const main=useRef<HTMLElement>(null);
 const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 useEffect(()=>{const query=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(query.matches);query.addEventListener('change',update);return()=>query.removeEventListener('change',update);},[]);
 useEffect(()=>{if(selected&&!dialog.current?.open)dialog.current?.showModal();},[selected]);
 useLayoutEffect(()=>{
  const page=main.current;
  if(!page)return;
  const viewport=page.parentElement!,masthead=page.querySelector<HTMLElement>('.design-masthead')!;
  const sections=[...page.querySelectorAll<HTMLElement>('.design-section')];
  let frame=0;
  // Choose from all chapters at one fixed viewport landmark. Intersection
  // callbacks contain only changed entries and can wrongly reselect a chapter.
  const update=()=>{
   const center=viewport.getBoundingClientRect().top+masthead.offsetHeight+(viewport.clientHeight-masthead.offsetHeight)/2;
   const chapter=sections.find(section=>{const box=section.getBoundingClientRect();return box.top<=center&&box.bottom>center;});
   if(chapter)setCurrentSection(chapter.id.replace('design-',''));
  };
  const measure=()=>{
   page.style.setProperty('--design-masthead-height',`${masthead.offsetHeight}px`);
   page.style.setProperty('--design-panel-height',`${Math.max(240,viewport.clientHeight-masthead.offsetHeight)}px`);
   update();
  };
  const onScroll=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update);};
  const observer=new ResizeObserver(measure);observer.observe(viewport);observer.observe(masthead);
  measure();viewport.addEventListener('scroll',onScroll,{passive:true});
  return()=>{cancelAnimationFrame(frame);observer.disconnect();viewport.removeEventListener('scroll',onScroll);};
 },[]);
 const image=(a:DesignArtwork,eager=false)=><img src={a.src} srcSet={a.small&&a!==designProcess&&a!==designInterface?`${a.small} ${Math.min(760,a.width)}w, ${a.src} ${a.width}w`:undefined} sizes={a===designInterface?'(max-width:800px) 88vw, 60vw':'(max-width:540px) 88vw, 46vw'} width={a.width} height={a.height} loading={eager?'eager':'lazy'} decoding="async" alt={`${a.title}. ${a.caption}`}/>;
 const artwork=(a:DesignArtwork,className='',eager=false)=><button class={`design-art ${className}`} onClick={()=>setSelected(a)} aria-label={`Enlarge ${a.title}`}>{image(a,eager)}</button>;
 const jump=(index:number)=>{
  const page=main.current,chapter=page?.querySelector<HTMLElement>(`#design-${designChapters[index].id}`),viewport=page?.parentElement;
  if(!page||!chapter||!viewport)return;
  const masthead=page.querySelector<HTMLElement>('.design-masthead')!;
  // Move only the chapter viewport, keeping the site header and document still.
  viewport.scrollTo({top:chapter.offsetTop-masthead.offsetHeight,behavior:reduced?'instant':'smooth'});
 };
 const palette=chapterPalettes[currentSection];
 useLayoutEffect(()=>{onSurfaceChange?.(palette.surface);},[palette.surface,onSurfaceChange]);
 const chapterIndex=designChapters.findIndex(chapter=>chapter.id===currentSection);
 const chapter=designChapters[chapterIndex]||designChapters[0];
 const panels={
  identities:<div class="identity-gallery">{designIdentities.map((group,i)=><article class={`identity-case identity-${group.kind}`} key={group.kind}>
   <div class="identity-board" style={{background:group.background}}>{artwork(group.items[0],'identity-primary',i<2)}{group.items[1]&&artwork(group.items[1],'identity-comparison')}
    <div class="identity-caption"><h3>{group.kind==='six-pack'?<>Six Pack <span class="identity-title-qualifier">with Jack</span></>:<ExpressiveText text={group.name} tight={group.kind==='boots'}/>}</h3><p>{group.detail}</p></div>
   </div>
  </article>)}</div>,
  covers:<RecordGallery items={chapterItems.covers} onSelect={setSelected} zoomOpen={selected!==null}/>,
  digital:<article class="design-interface">{artwork(designInterface,'interface-preview')}<div><span class="eyebrow">Consumer Think Tank</span><h3>Ideas, Made Visible.</h3><p>UI design for a platform where people could propose and vote on product ideas. Developed with creator Pat Conroy and a back-end engineer; an archived project.</p></div></article>,
  film:<div class="film-series">{designFilms.map(f=><article class="film-case" style={{'--film-color':f.color,'--film-media-ratio':f.poster.height/f.poster.width+(f.thumbnail?f.thumbnail.height/f.thumbnail.width:0)}} key={f.subtitle}>
   <header><span class="film-number" aria-hidden="true">•</span><h3><ExpressiveText text={f.name}/><small><ExpressiveText text={f.subtitle} tight={f.subtitle.startsWith('Dad &')}/><span class="film-year-separator"> • </span>{f.year}</small></h3></header>
   <div class={`film-pair${f.thumbnail?'':' film-poster-only'}`}>{f.thumbnailFirst&&f.thumbnail&&<div class="film-thumbnail">{artwork(f.thumbnail)}</div>}<div class="film-poster">{artwork(f.poster)}</div>{!f.thumbnailFirst&&f.thumbnail&&<div class="film-thumbnail">{artwork(f.thumbnail)}</div>}</div>
  </article>)}</div>,
  posters:<FlierGallery items={chapterItems.posters} onSelect={setSelected}/>,
 };
 return <main ref={main} id="main" class="project-page design-page" data-project="design" data-current-section={currentSection} style={{'--design-surface':palette.surface,'--design-ink':palette.ink,'--design-accent':palette.accent}}>
  <div class="design-backdrop" aria-hidden="true"/>
  <header class="project-masthead design-masthead">
   <div class="design-masthead-title">
    <div class="design-heading-trail"><h1>Graphic Design</h1><span class="design-chapter-separator" aria-hidden="true">›</span><h2 id="design-current-chapter" tabIndex={-1} aria-label={chapter.title} title={chapter.title}><FittedChapterTitle chapter={chapter.id} title={chapter.title}/></h2></div>
   </div>
   <ChapterNavigation labels={chapterLabels} active={chapterIndex} reduced={reduced} onSelect={jump}/>
  </header>
  {designChapters.map(item=><section key={item.id} id={`design-${item.id}`} class={`design-section${currentSection===item.id?' is-current':''}`} aria-labelledby={`design-heading-${item.id}`}>
   <h2 class="sr-only" id={`design-heading-${item.id}`}><ExpressiveText text={item.title}/></h2>
   {panels[item.id]}
  </section>)}
  <dialog ref={dialog} class="design-lightbox" aria-label={selected?.title||'Artwork preview'} onClose={()=>{
   const fromRecords=selected!==null&&chapterItems.covers.includes(selected);
   setSelected(null);
   if(fromRecords)document.getElementById('design-current-chapter')?.focus({preventScroll:true});
  }} onClick={e=>{if(e.target===e.currentTarget)e.currentTarget.close();}}>
   {selected&&<div class="design-lightbox-content"><button class="design-lightbox-close" onClick={()=>dialog.current?.close()} aria-label="Close artwork preview" autoFocus>Close ×</button><div class="design-lightbox-image" style={{background:selected.background||'#f1f3f2'}}><img src={selected.src} alt={selected.year||`${selected.title}. ${selected.caption}`}/></div><h2><ExpressiveText text={selected.title}/></h2><p>{selected.caption}</p></div>}
  </dialog>
 </main>;
}
