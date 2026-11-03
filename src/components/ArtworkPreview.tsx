import {designPreview} from '../content/design';
import {illustrationPreview} from '../content/illustrations';
function DesignWall(){
 const columns=[[0,5],[2,6],[1,3,4]];
 const heightUnits=Math.max(...columns.map(column=>column.reduce((sum,index)=>sum+designPreview[index].height/designPreview[index].width,0)));
 return <div class="preview-printshop-layout" style={{'--collage-height-units':heightUnits}}>{columns.map((column,index)=><div class="preview-printshop-column" key={index}>{column.map(index=>{
  const art=designPreview[index];
  return <div class={`preview-plate plate-${index+1}`} key={art.src} style={{aspectRatio:`${art.width} / ${art.height}`}}>
   <img src={art.src} srcSet={art.small?`${art.small} ${Math.min(760,art.width)}w, ${art.src} ${art.width}w`:undefined} sizes="(max-width:1000px) 30vw, 20vw" width={art.width} height={art.height} alt={art.title} loading="lazy" decoding="async"/>
  </div>;
 })}</div>)}</div>;
}
function SketchbookSpread(){
 const picks=['illustration-dog','illustration-golfer','illustration-speech'];
 return <>{picks.map((id,index)=>{
  const art=illustrationPreview.find(item=>item.id===id);
  if(!art)return null;
  // Preserve the original page framing from the shortlisted sketchbook demo.
  return <div class={`preview-sketch sketch-${index+1}`} key={id}><img src={art.small||art.src} width={art.width} height={art.height} alt={art.alt||art.title} loading="lazy" decoding="async"/></div>;
 })}</>;
}
export function ArtworkPreview({kind}:{kind:'design'|'illustration';paused?:boolean}){
 return <div class={`placeholder-media artwork-preview ${kind==='design'?'preview-printshop':'preview-sketchbook'}`} role="img" aria-label={kind==='design'?'A still collage of Consumer Think Tank, Late Night Idle, and Six Pack logos, a Brookline Vendetta Act One thumbnail and Jungle poster, and two Sleds album covers.':'An open sketchbook with a large character drawing on the left and two expressive sketches on the right.'}>
  {kind==='design'?<DesignWall/>:<SketchbookSpread/>}
 </div>;
}
