import {useAudio} from '../features/audio/AudioProvider';
import {projectRoute,projects} from '../content/projects';
export function Icon({name}:{name:'play'|'pause'|'next'|'previous'|'volume'|'muted'}){
 const paths={play:<path d="m9 5 12 9-12 9z"/>,pause:<><path d="M8 5h4v18H8zM17 5h4v18h-4z"/></>,next:<><path d="m6 6 13 8L6 22z"/><path d="M20 6h3v16h-3z"/></>,previous:<><path d="m22 6-13 8 13 8z"/><path d="M5 6h3v16H5z"/></>,volume:<><path d="M3 11h5l6-5v16l-6-5H3z"/><path d="M18 9q6 5 0 10M21 5q10 9 0 18" fill="none" stroke="currentColor" stroke-width="1.5"/></>,muted:<><path d="M3 11h5l6-5v16l-6-5H3z"/><path d="m19 10 7 8m0-8-7 8" fill="none" stroke="currentColor" stroke-width="1.5"/></>};
 return <svg viewBox="0 0 28 28" aria-hidden="true" fill="currentColor">{paths[name]}</svg>;
}
const format=(n:number)=>`${Math.floor(n/60)}:${String(Math.floor(n%60)).padStart(2,'0')}`;
export function Player(){const p=useAudio();const project=projects.find(x=>x.id===p.track.projectId);const detail=p.track.projectId==='the-sleds'&&p.track.year?p.track.year:project?.indexTitle;return <footer data-autoplay-interaction="" class="player" aria-label="Music player"><div class="player-inner">
 <a class="track-link" href={`${projectRoute(p.track.projectId)}${p.track.section?`/${p.track.section}`:''}`}>
  <span class={`track-art ${p.track.artwork?'has-artwork':p.playing?'spinning':''}`} style={{'--art-color':p.track.color,'--art-position':p.track.artworkPosition||'center'}}>{p.track.artwork?<img src={p.track.artwork} alt="" width="52" height="52"/>:<span>j.</span>}</span>
  <span class="track-copy"><strong>{p.track.title}</strong><small>{p.track.artist} · {detail}</small></span>
 </a>
 <div class="transport">
  <div class="transport-buttons"><button class="icon-button" onClick={p.previous} aria-label="Previous track or restart"><Icon name="previous"/></button><button class="play-button" onClick={p.toggle} aria-label={p.playing?'Pause audio':'Play audio'}><Icon name={p.playing?'pause':'play'}/></button><button class="icon-button" onClick={p.next} aria-label="Next track"><Icon name="next"/></button></div>
  <div class="seek"><time>{format(p.time)}</time><input aria-label="Seek track" type="range" min="0" max={p.duration||1} step="0.1" value={p.time} disabled={!p.duration} onInput={e=>p.seek(Number(e.currentTarget.value))} style={{'--progress':`${p.duration?p.time/p.duration*100:0}%`}}/><time>{format(p.duration)}</time></div>
 </div>
 <div class="player-extra">{p.error&&<span class="player-error" role="status">{p.error}</span>}<button class="icon-button" onClick={p.toggleMute} aria-label={p.muted?'Unmute audio':'Mute audio'} aria-pressed={p.muted}><Icon name={p.muted?'muted':'volume'}/></button></div>
 </div></footer>;}
