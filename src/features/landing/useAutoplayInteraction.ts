import {useEffect,useState} from 'preact/hooks';

const interactive='a,button,input,select,textarea,summary,[role="button"],[data-autoplay-interaction]';
const isInteractive=(target:EventTarget|null)=>target instanceof Element&&!!target.closest(interactive);
const pausesOnHover=(target:EventTarget|null)=>isInteractive(target)&&!(target as Element).closest('.player');

/** Pointer focus must not leave the carousel paused after the mouse moves away. */
export function useAutoplayInteraction(){
 const [hovered,setHovered]=useState(false),[pressed,setPressed]=useState(false),[keyboardFocus,setKeyboardFocus]=useState(false);
 useEffect(()=>{
  let frame=0,pointerModality=false;
  const focus=()=>setKeyboardFocus(!pointerModality&&isInteractive(document.activeElement)&&!!document.activeElement?.matches(':focus-visible'));
  const scheduleFocus=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(focus);};
  const over=(event:PointerEvent)=>{if(event.pointerType==='touch')return;pointerModality=true;setKeyboardFocus(false);setHovered(pausesOnHover(event.target));};
  const out=(event:PointerEvent)=>{if(event.pointerType==='touch')return;setHovered(pausesOnHover(event.relatedTarget));};
  const down=(event:PointerEvent)=>{pointerModality=true;setKeyboardFocus(false);setPressed(isInteractive(event.target));};
  const up=()=>setPressed(false);
  const key=()=>{pointerModality=false;scheduleFocus();};
  document.addEventListener('pointerover',over);document.addEventListener('pointerout',out);
  document.addEventListener('pointerdown',down);window.addEventListener('pointerup',up);window.addEventListener('pointercancel',up);window.addEventListener('blur',up);
  document.addEventListener('focusin',scheduleFocus);document.addEventListener('focusout',scheduleFocus);document.addEventListener('keydown',key);
  return()=>{
   cancelAnimationFrame(frame);
   document.removeEventListener('pointerover',over);document.removeEventListener('pointerout',out);
   document.removeEventListener('pointerdown',down);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',up);window.removeEventListener('blur',up);
   document.removeEventListener('focusin',scheduleFocus);document.removeEventListener('focusout',scheduleFocus);document.removeEventListener('keydown',key);
  };
 },[]);
 return hovered||pressed||keyboardFocus;
}
