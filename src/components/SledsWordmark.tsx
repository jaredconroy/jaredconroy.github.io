import {useLayoutEffect,useRef} from 'preact/hooks';
import artwork from '../../public/media/the-sleds/wordmark2.svg?raw';

export function SledsWordmark(){
 const root=useRef<HTMLSpanElement>(null);
 useLayoutEffect(()=>{
  const svg=root.current?.querySelector('svg');if(!svg)return;
  const box=svg.getBBox();
  svg.setAttribute('viewBox',`${box.x} ${box.y} ${box.width} ${box.height}`);
 },[]);
 return <span ref={root} class="sleds-wordmark" aria-hidden="true" dangerouslySetInnerHTML={{__html:artwork}}/>;
}
