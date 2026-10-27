import {ExpressiveText} from '../../components/ExpressiveText';
import {useState} from 'preact/hooks';
import {ArtworkGallery} from '../../components/ArtworkGallery';
import {illustrations,standaloneIllustrations,foulBallsIllustrations} from '../../content/illustrations';

export function IllustrationProject(){
 const [collection,setCollection]=useState('all');
 const groups=[{id:'all',title:'All Work',items:illustrations},{id:'illustration',title:'Drawings & Characters',items:standaloneIllustrations},{id:'foul-balls',title:'Foul Balls',items:foulBallsIllustrations}];
 const selected=groups.find(group=>group.id===collection)!;
 return <main id="main" class="project-page illustration-page" data-project="illustration">
  <header class="project-masthead illustration-masthead"><div><h1>Illustration</h1><p class="illustration-byline"><ExpressiveText text="Character Designer & Illustrator"/></p></div><p class="illustration-intro">Character studies, sketches, and artwork from Foul Balls.</p></header>
  <nav class="illustration-collections" aria-label="Illustration Collections">{groups.filter(group=>group.items.length>0).map(group=><button key={group.id} type="button" aria-pressed={collection===group.id} onClick={()=>setCollection(group.id)}>{group.title}<span>{group.items.length}</span></button>)}</nav>
  {collection==='foul-balls'&&<p class="illustration-series-link"><a href="#/work/foul-balls">From the original animated series, Foul Balls ↗</a></p>}
  <ArtworkGallery items={selected.items}/>
 </main>;
}
