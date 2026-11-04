import {useState} from 'preact/hooks';
import {ArtworkGallery} from '../../components/ArtworkGallery';
import {illustrations,standaloneIllustrations,foulBallsIllustrations} from '../../content/illustrations';
import {projects} from '../../content/projects';
import {ProjectRoles} from '../../components/ProjectRoles';

export function IllustrationProject(){
 const [collection,setCollection]=useState('all');
 const groups=[{id:'all',title:'All Work',items:illustrations},{id:'illustration',title:'Drawings & Characters',items:standaloneIllustrations},{id:'foul-balls',title:'Foul Balls',items:foulBallsIllustrations}];
 const selected=groups.find(group=>group.id===collection)!;
 return <main id="main" class="project-page illustration-page" data-project="illustration">
  <header class="project-masthead illustration-masthead"><div><h1>Illustration</h1></div><div class="project-role-wide"><ProjectRoles project={projects.find(item=>item.id==='illustration')!}/></div></header>
  <nav class="illustration-collections" aria-label="Illustration Collections">{groups.filter(group=>group.items.length>0).map(group=><button key={group.id} type="button" aria-pressed={collection===group.id} onClick={()=>setCollection(group.id)}>{group.title}<span>{group.items.length}</span></button>)}</nav>
  <div class="illustration-gallery-panel">
  {collection==='foul-balls'&&<p class="illustration-series-link"><a href="#/work/foul-balls">From the original animated series, Foul Balls ↗</a></p>}
  <ArtworkGallery items={selected.items}/>
  </div>
 </main>;
}
