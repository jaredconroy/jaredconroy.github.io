import {designPreview} from '../content/design';
import {illustrationPreview} from '../content/illustrations';
function DesignWall(){
 const columns=[[0,4,6],[2,3],[7,5,1]];
 const heightUnits=columns[1].reduce((sum,index)=>sum+designPreview[index].height/designPreview[index].width,0);
 return <div class="preview-printshop-layout" style={{'--collage-middle-units':heightUnits}}>{columns.map((column,index)=><div class="preview-printshop-column" key={index}>{column.map(index=>{
  const art=designPreview[index];
  return <div class={`preview-plate plate-${index+1}${index>=6?' preview-corner':''}`} key={art.src} style={index>=6?{background:art.background}:{aspectRatio:`${art.width} / ${art.height}`}} >
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
 return <div class={`placeholder-media artwork-preview ${kind==='design'?'preview-printshop':'preview-sketchbook'}`} role="img" aria-label={kind==='design'?'A still collage of Consumer Think Tank, Six Pack, Slim Thick Sports, and Late Night Idle logos, a Brookline Vendetta Act One thumbnail and Jungle poster, and two Sleds album covers.':'An open sketchbook with a large character drawing on the left and two expressive sketches on the right.'}>
  {kind==='design'?<DesignWall/>:<SketchbookSpread/>}
 </div>;
}
