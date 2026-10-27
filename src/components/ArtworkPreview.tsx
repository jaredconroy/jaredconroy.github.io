import {designPreview} from '../content/design';
import {illustrationPreview} from '../content/illustrations';
import crops from '../content/preview-assets.json';

type PreviewArt={src:string;title:string;width:number;height:number;background?:string;dark?:boolean;alt?:string};
type Crop={src:string;width:number;height:number;background?:string};
const cropMap:Record<string,Crop>=crops;
const base=import.meta.env.BASE_URL;
function preview(art:PreviewArt){
 const crop=cropMap[art.src.slice(art.src.indexOf('media/')+6)];
 return {src:crop?`${base}${crop.src}`:art.src,width:crop?.width||art.width,height:crop?.height||art.height,background:art.background||(art.dark?'#222326':crop?.background||'#fff'),canvas:crop?.background||art.background||'#fff',title:art.alt||art.title};
}
function PreviewImage({art,duplicate=false,eager=false}:{art:PreviewArt;duplicate?:boolean;eager?:boolean}){
 const image=preview(art);
 return <img src={image.src} width={image.width} height={image.height} data-preview-portrait={image.height>image.width?'true':undefined} alt={duplicate?'':image.title} loading={eager?'eager':'lazy'} decoding="async"/>;
}
function DesignWall(){
 const columns=[designPreview.slice(0,3),designPreview.slice(3,6),designPreview.slice(6,9)];
 return <>{columns.map((items,column)=><div class={`preview-wall-column column-${column+1}`} key={column}>
  <div class="preview-wall-track">{[0,1].map(copy=><div class="preview-wall-set" key={copy} aria-hidden={copy===1?'true':undefined}>{items.map((art,index)=>{
   const image=preview(art);
   return <div class="preview-wall-art" key={art.src} style={{background:image.background,aspectRatio:`${image.width} / ${image.height}`}}><PreviewImage art={art} duplicate={copy===1} eager={copy===0&&index<2}/></div>;
  })}</div>)}</div>
 </div>)}</>;
}
function IllustrationPanels(){
 const pick=(id:string)=>illustrationPreview.find(art=>art.id===id);
 const panels=[
  [pick('illustration-boone'),pick('illustration-dog'),pick('foul-balls-poster')],
  [pick('illustration-golfer'),pick('illustration-angry'),pick('illustration-newhopes')],
  [pick('illustration-speech'),pick('illustration-newhopes'),pick('illustration-golfer')],
 ];
 return <>{panels.map((choices,index)=>{
  const items=choices.map(art=>art||illustrationPreview[index%illustrationPreview.length]).filter((art):art is NonNullable<typeof art>=>Boolean(art));
  if(!items.length)return null;
  const frames=[...items,items[0]];
  return <div class={`preview-illustration-panel panel-${index+1}`} key={index}><div class="preview-panel-track">{frames.map((art,frame)=>{
   const image=preview(art);
   return <div class="preview-panel-frame" key={`${art.src}-${frame}`} aria-hidden={frame===items.length?'true':undefined} style={{background:image.canvas}}><PreviewImage art={art} duplicate={frame===items.length} eager={frame<items.length}/></div>;
  })}</div></div>;
 })}</>;
}
export function ArtworkPreview({kind,paused=true}:{kind:'design'|'illustration';paused?:boolean}){
 return <div class={`placeholder-media artwork-motion-preview ${kind==='design'?'preview-design-wall':'preview-illustration-panels'}`} data-preview-paused={paused?'true':'false'} role="img" aria-label={kind==='design'?'A moving wall of nine logo, album cover, and poster designs.':'Large character drawings, sketches, and Foul Balls artwork in three changing panels.'}>
  {kind==='design'?<DesignWall/>:<IllustrationPanels/>}
 </div>;
}
