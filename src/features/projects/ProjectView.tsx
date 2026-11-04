import {ExpressiveText} from '../../components/ExpressiveText';
import {DesignProject} from './DesignProject';
import {projects} from '../../content/projects';
import {FoulBallsDetails} from './FoulBallsDetails';
import {AfromanProject} from './AfromanProject';
import {SledsProject} from './SledsProject';
import {IllustrationProject} from './IllustrationProject';
import {ProjectRoles} from '../../components/ProjectRoles';
import {foulBalls} from '../../content/foul-balls';
export {GameView} from './GameView';
export function ProjectView({id,onSurfaceChange}:{id:string;onSurfaceChange?:(surface:string)=>void}){if(id==='design')return <DesignProject onSurfaceChange={onSurfaceChange}/>;if(id==='illustration')return <IllustrationProject/>;if(id==='afroman')return <AfromanProject/>;if(id==='the-sleds')return <SledsProject/>;const p=projects.find(p=>p.id===id);if(!p)return <Missing/>;return <main id="main" class={`project-page project-scroll-page ${id==='foul-balls'?'foul-balls-page':''}`} data-project={id}>
 <section class="project-snap-panel project-snap-intro foul-balls-intro"><figure class="foul-balls-poster"><img src={foulBalls.poster} width="1275" height="1650" alt={foulBalls.posterAlt}/></figure><div class="foul-balls-copy"><header class="foul-balls-masthead"><span class="eyebrow">{p.category}</span><h1><ExpressiveText text={p.title}/></h1><div class="project-role-wide"><ProjectRoles project={p}/></div></header><div class="foul-balls-logline"><span class="eyebrow">Series premise</span><p>{foulBalls.logline}</p><p class="muted">{foulBalls.artCredit}</p></div></div></section>
 {id==='foul-balls'?<FoulBallsDetails/>:<section class="project-snap-panel project-note"><p>{p.description}</p><p class="muted">Project view placeholder. The full story and original media come next.</p></section>}
 </main>;}
export function Missing(){return <main id="main" class="simple-page"><h1>A little off track.</h1><p>This project isn’t here yet.</p><a href="#/">Back to featured work ↗</a></main>;}
