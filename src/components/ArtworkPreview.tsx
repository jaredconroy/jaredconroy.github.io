import {designPreview} from '../content/design';
import {illustrationPreview} from '../content/illustrations';
import crops from '../content/preview-assets.json';

type PreviewArt={src:string;title:string;width:number;height:number;background?:string;dark?:boolean;alt?:string};
type Crop={src:string;width:number;height:number;background?:string};
const cropMap:Record<string,Crop>=crops;
const base=import.meta.env.BASE_URL;
function preview(art:PreviewArt){
 const crop=cropMap[art.src.slice(art.src.indexOf('media/')+6)];
 return {src:crop?`${base}${crop.src}`:art.src,width:crop?.width||art.width,height:crop?.height||art.height,background:art.background||(art.dark?'#222326':crop?.background||'#fff'),title:art.alt||art.title};
}
function DesignWall(){
 return <>{designPreview.map((art,index)=>{
  const image=preview(art);
  return <div class={`preview-plate plate-${index+1}`} key={art.src} style={{background:image.background}}><img src={image.src} width={image.width} height={image.height} alt={image.title} loading="lazy" decoding="async"/></div>;
 })}</>;
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
 return <div class={`placeholder-media artwork-preview ${kind==='design'?'preview-printshop':'preview-sketchbook'}`} role="img" aria-label={kind==='design'?'A printshop wall of six logo, lettering, album cover, and poster designs.':'An open sketchbook with a large character drawing on the left and two expressive sketches on the right.'}>
  {kind==='design'?<DesignWall/>:<SketchbookSpread/>}
 </div>;
}
