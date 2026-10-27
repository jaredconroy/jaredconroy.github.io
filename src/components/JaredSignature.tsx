import {memo} from 'preact/compat';
import {useLayoutEffect,useRef} from 'preact/hooks';
import artwork from '../../public/media/jared-signature.svg?raw';
import strokes from '../content/signature-strokes.json';
import brush from '../content/signature-brush.json';
import layout from '../content/signature-layout.json';
import {getJTransform,getSavedJTransform,subscribeJTransform} from '../features/signature-editor/store';
import {fitSignature,scaleSignatureAt,signatureGeometry,signaturePoint,signatureJBounds,signatureNibAngle} from '../features/signature-editor/geometry';
import {signatureMeasurements} from './signatureMeasurements';

const markup={__html:artwork};
const nibAngle=signatureNibAngle,co=Math.cos(nibAngle),si=Math.sin(nibAngle);
const layoutHalfHeight=Math.hypot(brush.layoutMajor*si,brush.layoutMinor*co);
export const SIGNATURE_J_TOP=signatureJBounds.top-layoutHalfHeight;
export const SIGNATURE_J_BOTTOM=signatureJBounds.bottom+layoutHalfHeight;
const ns='http://www.w3.org/2000/svg';

// The vector and monotonic two-stroke animation share centerlines and a fixed nib.
export const JaredSignature=memo(function JaredSignature({animate,delay=0,speed=1,onWritten}:{animate:boolean;delay?:number;speed?:number;onWritten?:()=>void}){
 const root=useRef<HTMLSpanElement>(null),canvas=useRef<HTMLCanvasElement>(null);
 const written=useRef(onWritten);written.current=onWritten;
 useLayoutEffect(()=>{
  const element=root.current,surface=canvas.current,svg=element?.querySelector('svg');
  const heading=element?.closest<HTMLElement>('.identity-heading');
  if(!element||!svg||!heading)return;
  const paths=[...svg.querySelectorAll('path')].slice(0,2);
  // Filter outside the SVG so halo radii stay in screen pixels, like the ampersand.
  const neonSurface=document.createElement('span');neonSurface.classList.add('signature-neon');
  const neon=document.createElementNS(ns,'svg');
  neon.setAttribute('viewBox',svg.getAttribute('viewBox')!);
  neon.setAttribute('preserveAspectRatio',svg.getAttribute('preserveAspectRatio')||'xMinYMin meet');
  const neonPaths=paths.map(()=>{const path=document.createElementNS(ns,'path');path.classList.add('signature-neon-line');neon.append(path);return path;});
  const tube=document.createElement('span');tube.classList.add('signature-neon-tube');tube.append(neon);
  const boost=document.createElement('span');boost.classList.add('signature-neon-boost');
  const boostSvg=neon.cloneNode(true) as SVGSVGElement;boost.append(boostSvg);
  const boostPaths=[...boostSvg.querySelectorAll('path')];
  neonSurface.append(boost,tube);element.querySelector('.signature-vector')!.append(neonSurface);
  const context=surface?.getContext('2d'),counts=strokes.map(()=>0),ink=getComputedStyle(element).color;
  let frame=0,stopped=false,normalization={scale:1,x:0,y:0},nibMajor=brush.major,nibMinor=brush.minor,aredShift=0;
  const point=(index:number,x:number,y:number)=>{const p=signaturePoint(index,x,y,getJTransform());return [p[0]*normalization.scale+normalization.x+(index===1?aredShift:0),p[1]*normalization.scale+normalization.y];};
  const paint=(stroke:number,from:number,to:number)=>{
   if(!context)return;
   context.beginPath();
   for(let i=from;i<to;i++){
    const [x,y]=point(stroke,...strokes[stroke].points[i] as [number,number]);
    context.moveTo(x+nibMajor*co,y+nibMajor*si);
    context.ellipse(x,y,nibMajor,nibMinor,nibAngle,0,2*Math.PI);
   }
   context.fillStyle=ink;context.fill();
  };
  const resize=()=>{
   const style=getComputedStyle(svg),width=parseFloat(style.width),height=parseFloat(style.height);
   if(!width||!height)return;
   const [vx,vy,vw,vh]=brush.viewBox,unit=Math.min(width/vw,height/vh);
   const box=svg.getBoundingClientRect(),column=heading.getBoundingClientRect(),screenScale=box.width/width;
   const inline=getComputedStyle(heading).getPropertyValue('--identity-layout').trim()==='inline';
   const saved=signatureGeometry(getSavedJTransform()),current=signatureGeometry(getJTransform());
   const columnCenter=vx+((column.left+column.right)/2-box.left)/screenScale/unit;
   const targetWidth=inline?vw:column.width*(1+layout.columnOverhang*2)/screenScale/unit;
   const fit=fitSignature(saved.ink,targetWidth,inline?vx:columnCenter-targetWidth/2,vy);
   // Compact greetings keep their baseline, punctuation and original flow box.
   const compactScale=1.1,compactAredShift=3/unit;
   normalization=inline?scaleSignatureAt(fit,compactScale,[saved.ink.right+compactAredShift/fit.scale,saved.wordBaseline]):fit;
   const brushScale=inline?1.5:1;
   nibMajor=brush.major*normalization.scale*brushScale;nibMinor=brush.minor*normalization.scale*brushScale;
   const tubeRadius=(parseFloat(getComputedStyle(element).getPropertyValue('--neon-tube-width'))||2.4)/2;
   const neonRight=vx+(column.right-box.left-tubeRadius*screenScale)/screenScale/unit;
   // Translate only ared. Calibrate against the thin tube without stretching the J.
   const aredRight=Math.max(...current.points[1].map(p=>p[0]))*normalization.scale+normalization.x;
   aredShift=inline?compactAredShift*compactScale:neonRight-aredRight+3/unit;
   const jPoints=current.points[0].map(([x,y])=>[
    (box.left-column.left)/screenScale+(x*normalization.scale+normalization.x-vx)*unit,
    (box.top-column.top)/screenScale+(y*normalization.scale+normalization.y-vy)*unit
   ] as [number,number]);
   const thinJBottom=Math.max(...jPoints.map(p=>p[1]))+tubeRadius;
   signatureMeasurements.set(heading,{jPoints,jBottom:thinJBottom,radius:tubeRadius});
   const xs=current.points.flatMap((points,index)=>points.map(p=>p[0]*normalization.scale+normalization.x+(index===1?aredShift:0)));
   const halfWidth=Math.hypot(nibMajor*co,nibMinor*si),halfHeight=Math.hypot(nibMajor*si,nibMinor*co);
   const ys=current.points.flatMap(points=>points.map(p=>p[1]*normalization.scale+normalization.y));
   const ink={left:Math.min(...xs)-halfWidth,right:Math.max(...xs)+halfWidth,top:Math.min(...ys)-halfHeight,bottom:Math.max(...ys)+halfHeight};
   if(import.meta.env.DEV){element.dataset.jBounds=JSON.stringify(signatureJBounds);element.dataset.signatureNormalization=JSON.stringify(normalization);element.dataset.signatureInk=JSON.stringify(ink);}
   const relativeY=(y:number)=>(box.top-column.top)/screenScale+(y*normalization.scale+normalization.y-vy)*unit;
   const flowBottom=(box.top-column.top)/screenScale+(current.ink.bottom*fit.scale+fit.y-vy)*unit;
   for(const [name,value] of Object.entries({'--signature-ared-bottom':relativeY(current.aredBottom),'--signature-j-bottom':relativeY(current.jBottom),'--signature-neon-j-bottom':thinJBottom,'--signature-ink-bottom':relativeY(current.ink.bottom),'--signature-flow-bottom':flowBottom,'--signature-word-baseline':relativeY(current.wordBaseline)})){
    const previous=parseFloat(heading.style.getPropertyValue(name));
    if(!Number.isFinite(previous)||Math.abs(previous-value)>.01)heading.style.setProperty(name,`${value}px`);
   }
   paths.forEach((path,index)=>{
    let line='',neonLine='';
    strokes[index].points.forEach(([px,py],i)=>{
     const [x,y]=point(index,px,py),command=i?'L':'M';
     line+=`${command}${((co*x+si*y)/nibMajor).toFixed(3)},${((-si*x+co*y)/nibMinor).toFixed(3)}`;
     neonLine+=`${command}${x.toFixed(3)},${y.toFixed(3)}`;
    });
    path.setAttribute('d',line);
    path.setAttribute('transform',`matrix(${nibMajor*co} ${nibMajor*si} ${-nibMinor*si} ${nibMinor*co} 0 0)`);
    path.style.fill='none';path.style.stroke='currentColor';path.style.strokeWidth='2';
    path.style.strokeLinecap='round';path.style.strokeLinejoin='round';path.style.vectorEffect='none';
    neonPaths[index].setAttribute('d',neonLine);
    boostPaths[index].setAttribute('d',neonLine);
   });
   element.dispatchEvent(new CustomEvent('signature-geometry',{bubbles:true}));
   if(!surface||!context)return;
   const left=Math.min(vx,ink.left),top=Math.min(vy,ink.top);
   const bottom=Math.max(vy+vh,ink.bottom),right=Math.max(vx+vw,ink.right);
   const canvasWidth=(right-left)*unit,canvasHeight=(bottom-top)*unit;
   const ratio=devicePixelRatio*Math.max(1,screenScale);
   surface.style.width=`${canvasWidth}px`;surface.style.height=`${canvasHeight}px`;
   surface.style.left=`${(left-vx)*unit}px`;surface.style.top=`${(top-vy)*unit}px`;
   surface.width=Math.ceil(canvasWidth*ratio);surface.height=Math.ceil(canvasHeight*ratio);
   context.setTransform(ratio*unit,0,0,ratio*unit,-ratio*left*unit,-ratio*top*unit);
   counts.forEach((count,index)=>paint(index,0,count));
  };
  resize();const observer=new ResizeObserver(resize);observer.observe(svg);observer.observe(heading);
  // Greeting metrics can move the SVG without changing its dimensions.
  let layoutFrame=0;
  const geometryObserver=new MutationObserver(()=>{cancelAnimationFrame(layoutFrame);layoutFrame=requestAnimationFrame(resize);});
  geometryObserver.observe(heading,{attributes:true,attributeFilter:['style']});
  const unsubscribe=subscribeJTransform(resize);
  const cleanup=()=>{stopped=true;cancelAnimationFrame(frame);cancelAnimationFrame(layoutFrame);observer.disconnect();geometryObserver.disconnect();unsubscribe();neonSurface.remove();};
  if(!animate){written.current?.();return cleanup;}
  const start=performance.now()+delay;
  const tick=(now:number)=>{
   if(stopped)return;
   let finished=true;
   strokes.forEach((stroke,index)=>{
    const progress=Math.max(0,Math.min(1,((now-start)*speed-stroke.start)/stroke.duration));
    const count=progress===0?0:Math.ceil(progress*stroke.points.length);
    if(count>counts[index]){paint(index,counts[index],count);counts[index]=count;}
    if(progress<1)finished=false;
   });
   if(finished)written.current?.();else frame=requestAnimationFrame(tick);
  };
  frame=requestAnimationFrame(tick);return cleanup;
 },[animate,delay,speed]);
 return <span ref={root} class="signature-art" aria-hidden="true" data-drawing={animate?'true':'false'}>
  <span class="signature-vector" dangerouslySetInnerHTML={markup}/>
  {animate&&<canvas ref={canvas} class="signature-canvas"/>}
 </span>;
});
