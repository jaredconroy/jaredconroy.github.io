import {useLayoutEffect,useRef} from 'preact/hooks';
import logo from '../../public/media/the-sleds/ampersand-logo.svg?raw';

/** Two faces share a fixed footprint; only the faces rotate on expansion. */
export function SledsAmpersand(){
 const root=useRef<HTMLSpanElement>(null);
 useLayoutEffect(()=>{
  const element=root.current,front=element?.querySelector<HTMLElement>('.sleds-amp-front'),svg=element?.querySelector('svg');
  if(!element||!front||!svg)return;
  const bounds=svg.getBBox();
  svg.setAttribute('viewBox',`${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`);
  let mounted=true;
  const align=()=>{
   if(!mounted)return;
   const style=getComputedStyle(front),size=parseFloat(style.fontSize);
   const context=document.createElement('canvas').getContext('2d');
   if(!context)return;
   context.font=`${style.fontWeight} ${size}px ${style.fontFamily}`;
   const ink=context.measureText('&');
   const ascent=ink.fontBoundingBoxAscent||size*.8,descent=ink.fontBoundingBoxDescent||size*.2;
   const baseline=(front.offsetHeight-ascent-descent)/2+ascent;
   const width=ink.actualBoundingBoxLeft+ink.actualBoundingBoxRight;
   const height=width*bounds.height/bounds.width;
   const centerX=(ink.actualBoundingBoxRight-ink.actualBoundingBoxLeft)/2;
   const centerY=baseline+(ink.actualBoundingBoxDescent-ink.actualBoundingBoxAscent)/2;
   element.style.setProperty('--sleds-logo-left',`${centerX}px`);
   element.style.setProperty('--sleds-logo-top',`${centerY-height/2}px`);
   element.style.setProperty('--sleds-logo-height',`${height}px`);
   element.style.setProperty('--sleds-logo-width',`${width}px`);
  };
  align();const observer=new ResizeObserver(align);observer.observe(front);
  void document.fonts.ready.then(align);
  return()=>{mounted=false;observer.disconnect();};
 },[]);
 return <span ref={root} class="sleds-amp-flip">
  <span class="ampersand-glyph sleds-amp-front">&</span>
  <span class="sleds-amp-back" dangerouslySetInnerHTML={{__html:logo}}/>
 </span>;
}
