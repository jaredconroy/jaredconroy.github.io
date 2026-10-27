import {ExpressiveText} from '../../components/ExpressiveText';
import {useEffect,useState} from 'preact/hooks';
import {SledsWordmark} from '../../components/SledsWordmark';
import {sleds,sledsReleases,sledsAlbumCredits} from '../../content/the-sleds';
import {useAudio} from '../audio/AudioProvider';
import {useRoute} from '../../app/router';
export function SledsProject(){
 const audio=useAudio(),route=useRoute();
 const section=route.kind==='project'?route.section:undefined;
 useEffect(()=>{
  const id=section==='music-videos'?'sleds-videos':section==='music'?'sleds-music':null;
  if(!id)return;
  document.getElementById(id)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  document.getElementById(`${id}-title`)?.focus({preventScroll:true});
 },[section]);
 const [media,setMedia]=useState<string|null>(null);
 const start=(id:string)=>{audio.pause();setMedia(id);};
 // Starting the persistent soundtrack closes the page player, so the two
 // sources never compete. Only one external embed is mounted at a time.
 useEffect(()=>{if(audio.playing)setMedia(null);},[audio.playing]);
 return <main id="main" class="sleds-page">
  <header class="sleds-heading"><div><span class="eyebrow"><ExpressiveText text="Music & Moving Pictures"/></span><h1 class="sleds-project-wordmark"><span class="sr-only">The Sleds</span><SledsWordmark/></h1></div><div class="project-intro-aside"><p><strong><ExpressiveText text="Creative Director & Lead Singer"/></strong></p><p>On the microphone. Behind the vision. Rock ’n’ roll outta Boston.</p></div></header>
  <nav class="sleds-section-links" aria-label="The Sleds sections"><a href="#/work/the-sleds/music-videos">Music Videos ↘</a><a href="#/work/the-sleds/music">Listen ↘</a><a href={sleds.linktree} target="_blank" rel="noreferrer">More from The Sleds ↗</a></nav>
  <figure class="sleds-band"><img src={sleds.photo} srcSet={`${sleds.photoSmall} 960w, ${sleds.photo} 1600w`} sizes="(max-width:700px) 88vw, 92vw" width="1600" height="1157" alt={sleds.photoAlt}/><figcaption><span>{sleds.caption}</span><span>Left to right: {sleds.members.join(' · ')}</span></figcaption></figure>
  <section class="sleds-videos" id="sleds-videos" aria-labelledby="sleds-videos-title"><div class="sleds-section-heading"><h2 id="sleds-videos-title" tabIndex={-1}>Music Videos</h2><span class="eyebrow">Sound, meet picture.</span></div>
   <div class="sleds-video-grid">{sleds.videos.map((video,index)=><article key={video.id}><div class="sleds-video-frame">{media===video.id?<iframe title={`${video.title} — The Sleds official music video`} src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&playsinline=1&rel=0`} allow="autoplay; encrypted-media; fullscreen; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/>:<button class="sleds-video-poster" onClick={()=>start(video.id)} aria-label={`Watch ${video.title}`}><img src={video.thumbnail} alt="" loading="lazy" width="1280" height="720"/><span class="sleds-video-play" aria-hidden="true">▶</span><span class="sleds-video-watch">Watch video</span></button>}</div><div class="sleds-video-caption"><div><span class="eyebrow">0{index+1} / Music video</span><h3><ExpressiveText text={video.title}/></h3></div><div class="sleds-video-actions">{media===video.id&&<button onClick={()=>setMedia(null)}>Close video</button>}<a href={video.url} target="_blank" rel="noreferrer">YouTube ↗</a></div></div></article>)}</div>
  </section>
  <section id="sleds-music" class="sleds-releases" aria-labelledby="sleds-music-title"><div class="sleds-section-heading"><h2 id="sleds-music-title" tabIndex={-1}><ExpressiveText text="Records & Artwork"/></h2><span class="eyebrow">Music, image, and the work between.</span></div>
   <div class="sleds-release-grid">{sledsReleases.map(release=><article key={release.image}><img src={release.src} alt={release.year} loading="lazy" width="1000" height="1000"/><span class="eyebrow">{release.year}</span><h3><ExpressiveText text={release.title}/></h3><p>{release.credit}</p>{release.track&&<button class="sleds-track-play" onClick={()=>{setMedia(null);audio.playTrack(release.track!);}}>Play {release.title} ↗</button>}</article>)}</div>
   <details class="sleds-album-credits"><summary><ExpressiveText text="Debut album · full songwriting & production credits"/></summary><img src={sledsAlbumCredits} alt="2021" loading="lazy" width="1000" height="1000"/></details>
  </section>
  <section id="sleds-streaming" class="sleds-music" aria-labelledby="sleds-streaming-title"><div><span class="eyebrow">The soundtrack</span><h2 id="sleds-streaming-title" tabIndex={-1}>Give Us A Listen.</h2><p>The Sleds’ releases, straight from Spotify.</p><a href={sleds.spotify} target="_blank" rel="noreferrer">Open Spotify ↗</a></div><div class="sleds-spotify">{media==='spotify'?<><iframe title="The Sleds on Spotify" src={sleds.spotifyEmbed} width="100%" height="352" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" allowFullScreen/><button class="sleds-close-player" onClick={()=>setMedia(null)}>Close Spotify player</button></>:<button class="sleds-listen" onClick={()=>start('spotify')}><span class="eyebrow">The Sleds / Spotify</span><strong>Find your next<br/>favorite song.</strong><span>Listen to The Sleds <span aria-hidden="true">↗</span></span></button>}</div></section>
 </main>;
}
