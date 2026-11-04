import {designPreview} from '../content/design';
import {illustrationPreview} from '../content/illustrations';
function DesignWall(){
 const tile=(art:typeof designPreview[number],index:number)=><div class={`preview-plate plate-${index+1}${art.width===art.height?' preview-square-tile':''}`} key={art.src} style={art.background?{background:art.background}:{}}>
  <img src={art.src} srcSet={art.small?`${art.small} ${Math.min(760,art.width)}w, ${art.src} ${art.width}w`:undefined} sizes={index<2?'(max-width:1000px) 45vw, 30vw':'(max-width:1000px) 30vw, 20vw'} width={art.width} height={art.height} alt={art.title} loading="lazy" decoding="async"/>
 </div>;
 return <div class="preview-printshop-layout"><div class="preview-printshop-wide-row">{designPreview.slice(0,2).map(tile)}</div><div class="preview-printshop-square-row">{designPreview.slice(2).map((art,index)=>tile(art,index+2))}</div></div>;
}
function SketchbookSpread(){
 const picks=['illustration-boone','illustration-golfer','illustration-angry'];
 return <>{picks.map((id,index)=>{
  const art=illustrationPreview.find(item=>item.id===id);
  if(!art)return null;
  // Preserve the original page framing from the shortlisted sketchbook demo.
  return <div class={`preview-sketch sketch-${index+1}`} key={id}><img src={art.small||art.src} width={art.width} height={art.height} alt={art.alt||art.title} loading="lazy" decoding="async"/></div>;
 })}</>;
}
export function ArtworkPreview({kind}:{kind:'design'|'illustration';paused?:boolean}){
 return <div class={`placeholder-media artwork-preview ${kind==='design'?'preview-printshop':'preview-sketchbook'}`} role="img" aria-label={kind==='design'?'A collage of the Consumer Think Tank logo and Late Night Idle stacked logo above square Dirty Hearts, Six Pack, and Slim Thick Sports artwork.':'An open sketchbook with a large character drawing on the left and two expressive sketches on the right.'}>
  {kind==='design'?<DesignWall/>:<SketchbookSpread/>}
 </div>;
}
