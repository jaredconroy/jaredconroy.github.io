import {ExpressiveText} from '../../components/ExpressiveText';
import {foulBalls} from '../../content/foul-balls';
import {useAudio} from '../audio/AudioProvider';
import {ArtworkGallery} from '../../components/ArtworkGallery';
export function FoulBallsDetails(){const audio=useAudio();return <>
 {foulBalls.artworks.some(item=>item.id!=='foul-balls-poster')&&<section class="project-snap-panel foul-balls-artworks"><h2><ExpressiveText text="Character Art & Illustrations"/></h2><ArtworkGallery items={foulBalls.artworks.filter(item=>item.id!=='foul-balls-poster')}/></section>}
 <section class="project-snap-panel foul-balls-music" aria-label="Foul Balls theme song"><div><span class="eyebrow">Original music</span><h2>The Theme Song</h2><p>{foulBalls.musicCredit}</p><button class="see-more" onClick={()=>audio.playTrack('foul-balls-theme')}>Play “Foul Balls” Theme Song <span aria-hidden="true">↗</span></button></div></section>
 </>;}
