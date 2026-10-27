import {useLayoutEffect,useState} from 'preact/hooks';
import type {TabLevel,TabPass} from './tabTransitions';
import {TAB_PRESS_MS,tabTiming} from './timing';
import type {ComponentChildren} from 'preact';

export function FolderTab({id,index,color,level,pass,reduced,pressed,wave,children}:{id:string;index:number;color:string;level:TabLevel;pass?:TabPass;reduced:boolean;pressed:boolean;wave:boolean;children?:ComponentChildren}){
 const [returning,setReturning]=useState(false);
 useLayoutEffect(()=>{
  if(reduced){setReturning(false);return;}
  if(pressed){setReturning(true);return;}
  // Keep the release bounce as quick as the dip; a new wave keeps its own clock.
  const timer=setTimeout(()=>setReturning(false),TAB_PRESS_MS);
  return()=>clearTimeout(timer);
 },[pressed,reduced]);
 const clickMotion=pressed||returning&&!wave;
 const duration=reduced?0:clickMotion?TAB_PRESS_MS:tabTiming(false).rise;
 return <span class="folder-tab" data-project={id} data-tab-level={level} data-tab-passing={pass?'true':undefined} data-tab-click-motion={clickMotion?'true':undefined} style={{'--tab-index':index,'--tab-color':color,'--tab-motion-duration':`${duration}ms`}}>{children}</span>;
}
