import {useLayoutEffect,useRef,useState} from 'preact/hooks';

/** Measure the rendered phrase against its half of the ampersand layout. */
export function RoleDescriptor({label,position}:{label:string;position:'one'|'two'}){
 const box=useRef<HTMLSpanElement>(null);
 const measureText=useRef<HTMLSpanElement>(null);
 const [wrapped,setWrapped]=useState(false);
 const [fit,setFit]=useState(1);
 useLayoutEffect(()=>{
  const element=box.current, text=measureText.current;
  if(!element||!text)return;
  let mounted=true;
  const measure=()=>{
   if(!mounted||element.clientWidth<=0)return;
   const available=element.clientWidth;
   if(getComputedStyle(element).getPropertyValue('--descriptor-layout').trim()==='inline'){
    setWrapped(false);
    const pair=element.closest('.role-pair');
    const candidates=pair?[...pair.querySelectorAll<HTMLElement>(':scope > .role')]:[];
    const siblings=candidates.length?candidates:[element];
    setFit(Math.min(1,...siblings.map(role=>role.clientWidth/(role.querySelector<HTMLElement>('.role-measure')?.offsetWidth||1))));
    return;
   }
   const shouldWrap=label.includes(' ')&&(label.split(' ').some(word=>word.length>=4)||text.offsetWidth>available+.5);
   setWrapped(shouldWrap);
   // Measure each unbroken line at the canonical size, so a long word cannot
   // spill into the ampersand corridor at any viewport width.
   const lines=shouldWrap?label.split(' '):[label];
   const canvas=document.createElement('canvas');
   const context=canvas.getContext('2d');
   if(context){
    const style=getComputedStyle(text);
    context.font=`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const spacing=parseFloat(style.letterSpacing)||0;
    const widest=Math.max(...lines.map(line=>context.measureText(line).width+Math.max(0,line.length-1)*spacing));
    setFit(Math.min(1,available/widest));
   }
  };
  measure();
  const observer=new ResizeObserver(measure);
  observer.observe(element);observer.observe(text);
  element.closest('.role-pair')?.querySelectorAll(':scope > .role .role-measure').forEach(label=>observer.observe(label));
  void document.fonts.ready.then(measure);
  return()=>{mounted=false;observer.disconnect();};
 },[label]);
 const words=label.split(' ');
 return <span ref={box} class={`role role-${position}`} data-wrapped={wrapped?'true':'false'} aria-hidden="true">
  <span class="role-measure-clip"><span ref={measureText} class="role-measure">{label}</span></span>
  <span class="role-label" style={{fontSize:`${fit}em`}}>{wrapped?<><span>{words.slice(0,-1).join(' ')}</span><span>{words.at(-1)}</span></>:label}</span>
 </span>;
}
