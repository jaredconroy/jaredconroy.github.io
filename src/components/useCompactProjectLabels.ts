import {useEffect,useState} from 'preact/hooks';

/** Keep the full project name until the navigation enters its narrow layout. */
export function useCompactProjectLabels(){
 const [compact,setCompact]=useState(()=>matchMedia('(max-width:679px)').matches);
 useEffect(()=>{
  const query=matchMedia('(max-width:679px)');
  const update=()=>setCompact(query.matches);
  query.addEventListener('change',update);
  return()=>query.removeEventListener('change',update);
 },[]);
 return compact;
}
