import {ExpressiveText} from '../../components/ExpressiveText';
import {afroman} from './afroman';
export function AfromanProject(){
 return <main id="main" class="afroman-page">
  <header class="afroman-heading">
   <div><span class="eyebrow">An independent browser game · 2014 / 2026</span><h1>Afroman</h1><p class="afroman-byline"><ExpressiveText text="Software Developer & Game Designer"/></p></div>
   <a class="afroman-play" href="#/play/afroman">PLAY AFROMAN <span aria-hidden="true">↗</span></a>
  </header>
  <a class="afroman-hero" href="#/play/afroman" aria-label="Play Afroman in your browser">
   <img src={afroman.titleImage} width="1050" height="640" alt="Afroman’s original title screen: a pixel-art drummer beneath spotlights and a blue neon logo"/>
   <span class="afroman-hero-caption"><span>Original artwork. A new life in the browser.</span><span aria-hidden="true">PLAY ↗</span></span>
  </a>
  <section class="afroman-story" aria-labelledby="afroman-story-title">
   <h2 id="afroman-story-title">An Old Project.<br/>A Second Act.</h2>
   <div><p>I created Afroman in college around 2014: a game that moves between platforming, rhythm, and a maze.</p><p>In 2026, I recovered the original project, got it running again, and brought it to the browser. The port keeps the original artwork and three-level structure while improving controls, sound, and gameplay timing.</p><p class="afroman-small">Built with C++ and Cocos2d-x. Ported to WebAssembly for play in the browser.</p></div>
  </section>
  <section class="afroman-levels" aria-labelledby="afroman-levels-title">
   <div class="afroman-section-heading"><h2 id="afroman-levels-title">Three Ways To Play.</h2><span class="eyebrow">One game, three disciplines</span></div>
   <div class="afroman-level-grid">{afroman.levels.map(level=><article key={level.number}><img src={level.image} width="320" height="80" loading="lazy" alt={`Original level ${level.number} selection artwork`}/><div><span class="eyebrow">Level {level.number}</span><h3><ExpressiveText text={level.title}/></h3><p>{level.description}</p></div></article>)}</div>
  </section>
  <section class="afroman-restoration" aria-labelledby="afroman-restoration-title">
   <h2 id="afroman-restoration-title">Recovered.<br/>Then Reworked.</h2>
   <div><p>The browser version is more than a change of platform. Rhythm notes follow the audio clock, countdowns use elapsed time, and the maze remembers your path. New sound cues bring the environments to life.</p><p>The original game remains its own archive. This version continues the experiment.</p><a class="afroman-play" href="#/play/afroman">PLAY AFROMAN <span aria-hidden="true">↗</span></a><p class="afroman-small">Free to play. Keyboard required. No installation.</p></div>
  </section>
 </main>;
}
