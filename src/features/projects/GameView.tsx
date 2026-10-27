import {ExpressiveText} from '../../components/ExpressiveText';
import {useEffect,useRef,useState} from 'preact/hooks';
import {afroman} from './afroman';
import {useAudio} from '../audio/AudioProvider';
export function GameView(){
 const stage=useRef<HTMLDivElement>(null);
 const [fullscreenError,setFullscreenError]=useState('');
 const [muted,setMuted]=useState(false);
 const {muted:siteMuted}=useAudio();
 const effectiveMuted=muted||siteMuted;
 useEffect(()=>{stage.current?.querySelector('iframe')?.contentWindow?.postMessage({type:'afroman-mute',value:effectiveMuted},location.origin);},[effectiveMuted]);
 const fullscreen=async()=>{try{await stage.current?.requestFullscreen();}catch{setFullscreenError('Fullscreen is unavailable in this browser. You can still play below.');}};
 return <main id="main" class="afroman-game-page">
  <a class="back-link" href="#/work/afroman">← The Afroman story</a>
  <div class="afroman-game-heading"><div><span class="eyebrow">The browser edition</span><h1>Afroman</h1></div><div class="afroman-game-actions"><button class="afroman-text-button" aria-pressed={effectiveMuted} onClick={()=>setMuted(value=>!value)}>{effectiveMuted?'Unmute game sound':'Mute game sound'}</button><button class="afroman-text-button" onClick={fullscreen}>Fullscreen ↗</button></div></div>
  <p class="afroman-game-intro">Press Play, then Enter at the title. Choose a level to begin.</p>
  <div class="afroman-game-stage" ref={stage}><iframe src={afroman.gameUrl} title="Afroman browser game" allow="autoplay; fullscreen" allowFullScreen onLoad={event=>event.currentTarget.contentWindow?.postMessage({type:'afroman-mute',value:effectiveMuted},location.origin)}/><button class="afroman-exit-fullscreen" onClick={()=>void document.exitFullscreen()}>Exit fullscreen ↙</button></div>
  {fullscreenError&&<p role="status">{fullscreenError}</p>}
  <div class="afroman-game-help"><div><strong><ExpressiveText text="Move & Jump"/></strong><p>Arrow keys or WASD</p></div><div><strong>Drum kit</strong><p>Space · F · J · R · T · Y · U</p></div><div><strong>Pause</strong><p>Use the game’s pause button</p></div></div>
  <p class="afroman-small">Keyboard required. Click the game to focus controls; Tab moves focus back out. Game sound has its own mute control. Your music player stays below.</p>
  <details class="afroman-calibration"><summary>Rhythm timing adjustment</summary><p>If the drum notes consistently feel early or late, adjust their timing. Positive values make notes arrive later. Your setting is saved in this browser.</p><label>Note timing <input type="range" min="-1000" max="1000" step="10" defaultValue={readOffset()} onInput={event=>{const value=Number(event.currentTarget.value);event.currentTarget.nextElementSibling!.textContent=`${value} ms`;try{localStorage.setItem('afroman-note-offset-ms',String(value));}catch{}stage.current?.querySelector('iframe')?.contentWindow?.postMessage({type:'afroman-offset',value},location.origin);}}/><output>{readOffset()} ms</output></label></details>
 </main>;
}
function readOffset(){try{return Math.max(-1000,Math.min(1000,Number(localStorage.getItem('afroman-note-offset-ms'))||0));}catch{return 0;}}
