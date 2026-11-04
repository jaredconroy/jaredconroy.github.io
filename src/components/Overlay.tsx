import {useEffect,useRef} from 'preact/hooks';
import {closePanel} from '../app/router';

const baseUrl = import.meta.env.BASE_URL;

export function Overlay({panel}:{panel:'about'|'contact'}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const previous=document.activeElement as HTMLElement|null;const el=ref.current!;el.showModal();const overflow=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{el.close();document.body.style.overflow=overflow;previous?.focus();};},[]);

 return <dialog class="overlay" ref={ref} aria-labelledby="panel-title" onCancel={e=>{e.preventDefault();closePanel();}} onClick={e=>{if(e.target===ref.current){const r=ref.current!.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closePanel();}}}>
  <div class="panel-top"><span class="eyebrow">Jared / {panel}</span><button class="close-panel" onClick={closePanel} aria-label={`Close ${panel}`}>×</button></div>
  {panel==='about'?<>
   <h2 id="panel-title">Many hats.<br/>One Jared.</h2>
   <div class="about-intro">
    <img class="about-portrait-image" src={`${baseUrl}media/about/headshot.jpg`} alt="Portrait of Jared Conroy" />
    <p>I’m Jared Conroy, a multidisciplinary creative working across writing, illustration, music, game design, and visual identity. The medium changes with the idea: a story might become a series, an image, a song, or something you can play.</p>
   </div>
   <section class="about-credits" aria-labelledby="credits-title">
    <h3 id="credits-title">Selected work</h3>
    <ul class="about-credit-list">
     <li><strong>Foul Balls</strong><span>Creator, screenwriter &amp; illustrator · original animated series</span></li>
     <li><strong>The Sleds</strong><span>Lead singer &amp; creative director · rock ’n’ roll band</span></li>
     <li><strong>Afroman</strong><span>Game designer &amp; developer · restored for the browser in 2026</span></li>
     <li><strong>Graphic design</strong><span>Identity, album artwork, and UI/UX design</span></li>
    </ul>
   </section>
   <a class="text-button" href="mailto:jaredmconroy@gmail.com">Get in touch ↗</a>
  </>:<>
   <h2 id="panel-title">Let’s make<br/>something.</h2>
   <p class="contact-intro">Have a project, a collaboration in mind, or just want to say hello? Email is the best place to reach me.</p>
   <nav class="contact-links" aria-label="Contact links">
    <a class="contact-link contact-email" href="mailto:jaredmconroy@gmail.com"><span>Email</span><strong>jaredmconroy@gmail.com</strong><span class="contact-arrow" aria-hidden="true">↗</span></a>
    <a class="contact-link" href="https://www.linkedin.com/in/jaredconroy/" target="_blank" rel="noreferrer"><span>LinkedIn</span><strong>Jared Conroy</strong><span class="contact-arrow" aria-hidden="true">↗</span></a>
    <a class="contact-link" href="https://www.instagram.com/jaredfromthesleds/" target="_blank" rel="noreferrer"><span>Instagram</span><strong>@jaredfromthesleds</strong><span class="contact-arrow" aria-hidden="true">↗</span></a>
   </nav>
  </>}
  <button class="text-button overlay-back" onClick={closePanel}>Back to exploring ↗</button>
 </dialog>;
}
