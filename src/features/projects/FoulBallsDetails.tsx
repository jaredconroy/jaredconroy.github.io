import {ExpressiveText} from '../../components/ExpressiveText';
import {foulBalls} from '../../content/foul-balls';
import {useAudio} from '../audio/AudioProvider';
import {ArtworkGallery} from '../../components/ArtworkGallery';
export function FoulBallsDetails(){const audio=useAudio();return <>
 <p>{foulBalls.logline}</p>
 <p class="muted">{foulBalls.artCredit}</p>
 {foulBalls.artworks.some(item=>item.id!=='foul-balls-poster')&&<section class="foul-balls-artworks"><h2><ExpressiveText text="Character Art & Illustrations"/></h2><ArtworkGallery items={foulBalls.artworks.filter(item=>item.id!=='foul-balls-poster')}/></section>}
 <section class="foul-balls-music" aria-label="Foul Balls theme song"><h2>The Theme Song</h2><p>{foulBalls.musicCredit}</p><button class="see-more" onClick={()=>audio.playTrack('foul-balls-theme')}>Play “Foul Balls” Theme Song <span aria-hidden="true">↗</span></button></section>
 </>;}
