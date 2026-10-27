import {ExpressiveText} from '../../components/ExpressiveText';
import {DesignProject} from './DesignProject';
import {projects} from '../../content/projects';
import {PlaceholderMedia} from '../../components/PlaceholderMedia';
import {FoulBallsDetails} from './FoulBallsDetails';
import {AfromanProject} from './AfromanProject';
import {SledsProject} from './SledsProject';
import {IllustrationProject} from './IllustrationProject';
export {GameView} from './GameView';
export function ProjectView({id,onSurfaceChange}:{id:string;onSurfaceChange?:(surface:string)=>void}){if(id==='design')return <DesignProject onSurfaceChange={onSurfaceChange}/>;if(id==='illustration')return <IllustrationProject/>;if(id==='afroman')return <AfromanProject/>;if(id==='the-sleds')return <SledsProject/>;const p=projects.find(p=>p.id===id);if(!p)return <Missing/>;return <main id="main" class="project-page" data-project={id}><header class="project-masthead"><div><span class="eyebrow">{p.category}</span><h1><ExpressiveText text={p.title}/></h1></div><div><p class="project-roles"><ExpressiveText text={p.roles.join(' & ')}/></p><p>{p.description}</p></div></header><PlaceholderMedia project={p}/><div class="project-note"><>{id==='foul-balls'?<FoulBallsDetails/>:<><p>{p.description}</p><p class="muted">Project view placeholder. The full story and original media come next.</p></>}</></div></main>;}
export function Missing(){return <main id="main" class="simple-page"><h1>A little off track.</h1><p>This project isn’t here yet.</p><a href="#/">Back to featured work ↗</a></main>;}
