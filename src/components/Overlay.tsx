import {useEffect,useRef} from 'preact/hooks';
import {closePanel} from '../app/router';
export function Overlay({panel}:{panel:'about'|'contact'}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const previous=document.activeElement as HTMLElement|null;const el=ref.current!;el.showModal();const overflow=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{el.close();document.body.style.overflow=overflow;previous?.focus();};},[]);
 return <dialog class="overlay" ref={ref} aria-labelledby="panel-title" onCancel={e=>{e.preventDefault();closePanel();}} onClick={e=>{if(e.target===ref.current){const r=ref.current!.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closePanel();}}}>
 <div class="panel-top"><span class="eyebrow">Jared / {panel}</span><button class="close-panel" onClick={closePanel} aria-label={`Close ${panel}`}>×</button></div>
 <h2 id="panel-title">{panel==='about'?'Many hats.\nOne Jared.':'Let’s make\nsomething.'}</h2>
 {panel==='about'?<><p>I’m Jared, a multidisciplinary creative working across stories, music, games, design, and illustration.</p><div class="about-portrait">Portrait placeholder</div><p class="muted">Bio, selected credits, and résumé will live here once the final content is ready.</p></>:<><p>A place for new ideas, collaborations, and a good hello.</p><p class="muted">Contact details will be added here. No form or external service is connected in this first version.</p></>}
 <button class="text-button" onClick={closePanel}>Back to exploring ↗</button>
 </dialog>;
}
