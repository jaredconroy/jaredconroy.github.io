import {useEffect,useRef,useState} from 'preact/hooks';
import {getJTransform,getSavedJTransform,markJSaved,previewJTransform,subscribeJTransform} from './store';
import {anchorJ,jLinear,originalTransform,transformJ,validTransform,type Bounds,type JTransform,type Point} from './transform';
import './editor.css';

type Geometry={bounds:Bounds;matrix:DOMMatrix;points:Point[];center:Point;rotate:Point;unit:number};
type Drag={kind:string;start:Point;transform:JTransform;geometry:Geometry;inverse:DOMMatrix};
const handles=[[-1,-1,'top left'],[0,-1,'top'],[1,-1,'top right'],[1,0,'right'],[1,1,'bottom right'],[0,1,'bottom'],[-1,1,'bottom left'],[-1,0,'left']] as const;
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
const equal=(a:JTransform,b:JTransform)=>JSON.stringify(a)===JSON.stringify(b);

export default function SignatureEditor({onEditingChange}:{onEditingChange:(editing:boolean)=>void}){
 const [open,setOpen]=useState(false),[value,setValue]=useState(getJTransform),[saved,setSaved]=useState(getSavedJTransform);
 const [geometry,setGeometry]=useState<Geometry|null>(null),[message,setMessage]=useState(''),[saving,setSaving]=useState(false),[historyVersion,setHistoryVersion]=useState(0);
 const current=useRef(value),drag=useRef<Drag|null>(null),undo=useRef<JTransform[]>([]),redo=useRef<JTransform[]>([]),frame=useRef(0);
 const update=(next:JTransform,record=true)=>{
  if(!validTransform(next))return;
  if(record&&!equal(next,current.current)){undo.current.push({...current.current});redo.current=[];setHistoryVersion(v=>v+1);}
  current.current=next;setValue(next);previewJTransform(next);setMessage('');
 };
 const measure=()=>{
  const art=document.querySelector<HTMLElement>('.landing .identity-heading .signature-art'),svg=art?.querySelector('svg'),ctm=svg?.getScreenCTM();
  if(!art?.dataset.jBounds||!ctm)return;
  const normalization=JSON.parse(art.dataset.signatureNormalization||'{"scale":1,"x":0,"y":0}');
  const matrix=ctm.translate(normalization.x,normalization.y).scale(normalization.scale);
  const bounds=JSON.parse(art.dataset.jBounds) as Bounds,t=current.current;
  const screen=(point:Point)=>{const p=transformJ(t,bounds,point);return new DOMPoint(p.x,p.y).matrixTransform(matrix);};
  const points=[{x:bounds.left,y:bounds.top},{x:bounds.right,y:bounds.top},{x:bounds.right,y:bounds.bottom},{x:bounds.left,y:bounds.bottom}].map(screen);
  const center=screen({x:(bounds.left+bounds.right)/2,y:(bounds.top+bounds.bottom)/2});
  const top={x:(points[0].x+points[1].x)/2,y:(points[0].y+points[1].y)/2},dx=top.x-center.x,dy=top.y-center.y,length=Math.hypot(dx,dy)||1;
  setGeometry({bounds,matrix,points,center,rotate:{x:top.x+dx/length*30,y:top.y+dy/length*30},unit:Math.hypot(matrix.a,matrix.b)});
 };
 useEffect(()=>{onEditingChange(open);return()=>onEditingChange(false);},[open,onEditingChange]);
 useEffect(()=>subscribeJTransform(()=>{current.current={...getJTransform()};setValue(current.current);}),[]);
 useEffect(()=>{
  if(!open)return;
  const schedule=()=>{cancelAnimationFrame(frame.current);frame.current=requestAnimationFrame(measure);};
  measure();window.addEventListener('resize',schedule);window.addEventListener('scroll',schedule,true);document.addEventListener('signature-geometry',schedule);
  return()=>{cancelAnimationFrame(frame.current);window.removeEventListener('resize',schedule);window.removeEventListener('scroll',schedule,true);document.removeEventListener('signature-geometry',schedule);};
 },[open]);
 useEffect(()=>{
  if(!open)return;
  const move=(event:PointerEvent)=>{
   const d=drag.current;if(!d)return;
   event.preventDefault();
   const p=new DOMPoint(event.clientX,event.clientY).matrixTransform(d.inverse),t=d.transform,b=d.geometry.bounds;
   if(d.kind==='move'){update({...t,x:clamp(t.x+p.x-d.start.x,-1000,1000),y:clamp(t.y+p.y-d.start.y,-1000,1000)},false);return;}
   if(d.kind==='rotate'){
    const center={x:(b.left+b.right)/2+t.x,y:(b.top+b.bottom)/2+t.y};
    const delta=(Math.atan2(p.y-center.y,p.x-center.x)-Math.atan2(d.start.y-center.y,d.start.x-center.x))*180/Math.PI;
    let rotation=t.rotation+delta;if(event.shiftKey)rotation=Math.round(rotation/15)*15;
    update({...t,rotation:clamp(rotation,-360,360)},false);return;
   }
   const [hx,hy]=handles[Number(d.kind)],cx=(b.left+b.right)/2,cy=(b.top+b.bottom)/2;
   const anchor={x:cx-hx*(b.right-b.left)/2,y:cy-hy*(b.bottom-b.top)/2};
   const pinned=transformJ(t,b,anchor),delta={x:p.x-pinned.x,y:p.y-pinned.y};
   // Invert rotation/skew first so the handles resize in the J's own axes.
   const basis={...t,scaleX:1,scaleY:1},a=jLinear(basis,{x:1,y:0}),c=jLinear(basis,{x:0,y:1}),det=a.x*c.y-a.y*c.x;
   if(Math.abs(det)<.05)return;
   const local={x:(c.y*delta.x-c.x*delta.y)/det,y:(a.x*delta.y-a.y*delta.x)/det};
   let sx=hx?clamp(local.x/(hx*(b.right-b.left)),.1,4):t.scaleX,sy=hy?clamp(local.y/(hy*(b.bottom-b.top)),.1,4):t.scaleY;
   if(event.shiftKey){const ratio=hx?sx/t.scaleX:sy/t.scaleY;sx=clamp(t.scaleX*ratio,.1,4);sy=clamp(t.scaleY*ratio,.1,4);}
   update(anchorJ(t,{...t,scaleX:sx,scaleY:sy},b,anchor),false);
  };
  const finish=()=>{if(drag.current&&!equal(drag.current.transform,current.current)){undo.current.push(drag.current.transform);redo.current=[];setHistoryVersion(v=>v+1);}drag.current=null;};
  window.addEventListener('pointermove',move,{passive:false});window.addEventListener('pointerup',finish);window.addEventListener('pointercancel',finish);
  return()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',finish);window.removeEventListener('pointercancel',finish);};
 },[open]);
 const begin=(kind:string,event:PointerEvent)=>{
  if(!geometry||event.button!==0)return;
  event.preventDefault();event.stopPropagation();
  (event.currentTarget as Element).setPointerCapture(event.pointerId);
  const inverse=geometry.matrix.inverse(),start=new DOMPoint(event.clientX,event.clientY).matrixTransform(inverse);
  drag.current={kind,start,transform:{...current.current},geometry,inverse};
 };
 const step=(event:KeyboardEvent)=>{
  if(!geometry||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
  event.preventDefault();const n=(event.shiftKey?10:1)/geometry.unit;
  update({...current.current,x:current.current.x+(event.key==='ArrowLeft'?-n:event.key==='ArrowRight'?n:0),y:current.current.y+(event.key==='ArrowUp'?-n:event.key==='ArrowDown'?n:0)});
 };
 const travelHistory=(direction:'undo'|'redo')=>{
  const from=direction==='undo'?undo.current:redo.current,to=direction==='undo'?redo.current:undo.current,next=from.pop();
  if(next){to.push({...current.current});update(next,false);setHistoryVersion(v=>v+1);}
 };
 const save=async()=>{
  setSaving(true);setMessage('');const next={...current.current};
  try{const response=await fetch('/__signature-transform',{method:'POST',headers:{'Content-Type':'application/json','X-Signature-Editor':'1'},body:JSON.stringify(next)});const result=await response.json();if(!response.ok)throw new Error(result.error||'Could not save');markJSaved(next);setSaved(next);setMessage('Placement saved to the project.');}
  catch(error){setMessage(error instanceof Error?error.message:'Could not save');}finally{setSaving(false);}
 };
 const field=(key:keyof JTransform,label:string,factor=1,min=-1000,max=1000,stepSize=.1)=><label>{label}<input type="number" aria-label={label} value={Math.round(value[key]*factor*100)/100} min={min} max={max} step={stepSize} onInput={event=>{if(event.currentTarget.value!=='')update({...current.current,[key]:Number(event.currentTarget.value)/factor});}}/></label>;
 const unit=geometry?.unit||1;
 return <>
  {!open&&<button class="signature-editor-launch" onClick={()=>setOpen(true)}>Adjust signature J</button>}
  {open&&<>
   {geometry&&<svg class="signature-transform-overlay" aria-hidden="true">
    <polygon points={geometry.points.map(p=>`${p.x},${p.y}`).join(' ')} class="signature-transform-box"/>
    <line x1={(geometry.points[0].x+geometry.points[1].x)/2} y1={(geometry.points[0].y+geometry.points[1].y)/2} x2={geometry.rotate.x} y2={geometry.rotate.y}/>
   </svg>}
   {geometry&&<button class="signature-transform-move" aria-label="Move J. Drag or use arrow keys; Shift for ten pixels." onPointerDown={e=>begin('move',e)} onKeyDown={step} style={{width:geometry.bounds.right-geometry.bounds.left,height:geometry.bounds.bottom-geometry.bounds.top,transform:`matrix(${(geometry.points[1].x-geometry.points[0].x)/(geometry.bounds.right-geometry.bounds.left)},${(geometry.points[1].y-geometry.points[0].y)/(geometry.bounds.right-geometry.bounds.left)},${(geometry.points[3].x-geometry.points[0].x)/(geometry.bounds.bottom-geometry.bounds.top)},${(geometry.points[3].y-geometry.points[0].y)/(geometry.bounds.bottom-geometry.bounds.top)},${geometry.points[0].x},${geometry.points[0].y})`}}/>}
   {geometry&&handles.map(([hx,hy,name],index)=>{const point=transformJ(value,geometry.bounds,{x:(geometry.bounds.left+geometry.bounds.right)/2+hx*(geometry.bounds.right-geometry.bounds.left)/2,y:(geometry.bounds.top+geometry.bounds.bottom)/2+hy*(geometry.bounds.bottom-geometry.bounds.top)/2});const screen=new DOMPoint(point.x,point.y).matrixTransform(geometry.matrix);return <button key={name} class="signature-transform-handle" aria-label={`Resize J from ${name}`} style={{left:screen.x,top:screen.y,cursor:hx&&hy?'nwse-resize':hx?'ew-resize':'ns-resize'}} onPointerDown={e=>begin(String(index),e)}/>;})}
   {geometry&&<button class="signature-transform-handle signature-rotate-handle" aria-label="Rotate J" style={{left:geometry.rotate.x,top:geometry.rotate.y}} onPointerDown={e=>begin('rotate',e)}>↻</button>}
   <section class="signature-editor-panel" role="region" aria-label="Signature J editor" data-autoplay-interaction="" data-history={historyVersion}>
    <div class="signature-editor-heading"><strong>Shape your J</strong><button aria-label="Close signature editor" onClick={()=>setOpen(false)}>×</button></div>
    <p>Drag to move. Pull a handle to resize. Use the round handle to rotate.</p>
    <p class="signature-editor-tip">Shift keeps proportions or snaps rotation. Arrow keys nudge 1px; Shift nudges 10px. Brush weight stays fixed.</p>
    <div class="signature-editor-fields">
     {field('x','Move X (px)',unit)}{field('y','Move Y (px)',unit)}
     {field('scaleX','Width (%)',100,10,400,1)}{field('scaleY','Height (%)',100,10,400,1)}
     {field('rotation','Rotation (°)',1,-360,360,1)}{field('skewX','Skew X (°)',1,-55,55,1)}{field('skewY','Skew Y (°)',1,-55,55,1)}
    </div>
    <div class="signature-editor-actions"><button disabled={!undo.current.length} onClick={()=>travelHistory('undo')}>Undo</button><button disabled={!redo.current.length} onClick={()=>travelHistory('redo')}>Redo</button><button onClick={()=>update({...saved})}>Revert</button><button onClick={()=>update({...originalTransform})}>Reset J</button></div>
    <button class="signature-editor-save" onClick={save} disabled={saving}>{saving?'Saving…':'Save placement'}</button>
    <p class="signature-editor-status" role="status">{message||(!equal(value,saved)?'Unsaved preview — save to keep this placement.':'Applies to every project and the intro animation.')}</p>
   </section>
  </>}
 </>;
}
