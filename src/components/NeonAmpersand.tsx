import {useLayoutEffect,useRef} from 'preact/hooks';
import shape from '../content/afroman-ampersand.json';

const contours=shape.path.match(/M[^M]+/g)||[];
/** Outline-only hover layer; the shared text glyph supplies the solid fill. */
export function NeonAmpersand({active}:{active:boolean}){
 const outline=useRef<SVGSVGElement>(null);
 useLayoutEffect(()=>{
  const svg=outline.current;if(!svg)return;
  // Keep the complete tube at 2.4px independently of SVG layout scale.
  const size=()=>{
   const matrix=svg.getScreenCTM();if(!matrix)return;
   const scale=Math.sqrt(Math.abs(matrix.a*matrix.d-matrix.b*matrix.c));
   const weight=parseFloat(getComputedStyle(svg).getPropertyValue('--neon-tube-width'))||2.4;
   if(scale)svg.style.setProperty('--neon-stroke',String(weight/scale));
  };
  size();const observer=new ResizeObserver(size);observer.observe(svg);
  return()=>observer.disconnect();
 },[]);
 return <span class="afroman-neon" data-neon-active={active?'true':undefined}>
  <span class="neon-foreground"><svg ref={outline} viewBox={shape.viewBox} aria-hidden="true">{contours.map(path=><path class="neon-core" d={path}/>)}</svg></span>
 </span>;
}
