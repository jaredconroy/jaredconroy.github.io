import {useLayoutEffect,useRef,useState} from 'preact/hooks';
import {navigationLetterFrames,navigationSelection,timedNavigationLetterFrames} from './navigationLetterFrames';

export const NAV_HANDOFF_MS=750;

/** A single bounded clock carries the bold handoff through every name en route. */
export function useNavigationLetters(labels:readonly string[],active:number,reduced:boolean,duration=NAV_HANDOFF_MS,timing?:{stroke:number;interval:number}){
 const [letters,setLetters]=useState(()=>navigationSelection(labels,active));
 const current=useRef(letters),waypoint=useRef(active);
 const stroke=timing?.stroke,interval=timing?.interval;
 const matchesLabels=(value:boolean[][])=>value.length===labels.length&&labels.every((label,i)=>value[i]?.length===Array.from(label).length);
 useLayoutEffect(()=>{
  const commit=(next:boolean[][],position:number)=>{current.current=next;waypoint.current=position;setLetters(next);};
  // Content edits can retain the old hook state during local live reload.
  if(!matchesLabels(current.current)){commit(navigationSelection(labels,active),active);return;}
  const frames=reduced?[]:stroke!==undefined&&interval!==undefined
   ?timedNavigationLetterFrames(labels,current.current,waypoint.current,active,stroke,interval)
   :navigationLetterFrames(labels,current.current,waypoint.current,active).map((frame,index,all)=>({...frame,at:duration*(index+1)/all.length}));
  if(!frames.length){commit(navigationSelection(labels,active),active);return;}
  // Interrupted selections resume from the actual wave, not its old destination.
  const timers=frames.map(frame=>{
   return setTimeout(()=>commit(frame.letters,frame.waypoint),frame.at);
  });
  return()=>timers.forEach(clearTimeout);
 },[active,reduced,labels,duration,stroke,interval]);
 return matchesLabels(letters)?letters:navigationSelection(labels,active);
}
