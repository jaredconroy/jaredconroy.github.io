export const navigationSelection=(labels:readonly string[],active:number)=>labels.map((label,i)=>Array.from(label).map(()=>i===active));

/** Each adjacent name receives the bold letters before handing them onward. */
export function navigationLetterFrames(labels:readonly string[],start:boolean[][],from:number,to:number){
 const direction=to<from?-1:1;
 const path=from===to?[to]:Array.from({length:Math.abs(to-from)},(_,i)=>from+direction*(i+1));
 const orders=labels.map(label=>{
  const chars=Array.from(label),length=chars.filter(char=>char!==' ').length;
  let index=0;
  return chars.map(char=>char===' '?-1:direction<0?length-1-index++:index++);
 });
 const frames:{letters:boolean[][];waypoint:number}[]=[];
 let origin=start;
 for(const waypoint of path){
  const target=navigationSelection(labels,waypoint);
  const steps=Math.max(0,...orders.flatMap((row,i)=>row.filter((order,j)=>order>=0&&origin[i][j]!==target[i][j]).map(order=>order+1)));
  for(let step=1;step<=steps;step++){
   frames.push({waypoint,letters:origin.map((row,i)=>row.map((was,j)=>orders[i][j]<step?target[i][j]:was))});
  }
  origin=target;
 }
 return frames;
}

/** Each name reaches bold before its tab peaks; the next handoff starts on descent. */
export function timedNavigationLetterFrames(labels:readonly string[],start:boolean[][],from:number,to:number,stroke:number,interval:number){
 const direction=Math.sign(to-from);
 if(!direction)return [];
 const result:{at:number;letters:boolean[][];waypoint:number}[]=[];
 let origin=start,previous=from;
 for(let waypoint=from+direction,leg=0;direction>0?waypoint<=to:waypoint>=to;waypoint+=direction,leg++){
  const frames=navigationLetterFrames(labels,origin,previous,waypoint);
  const span=Math.max(0,stroke-1000/60);
  frames.forEach((frame,i)=>result.push({...frame,at:leg*interval+(frames.length>1?span*i/(frames.length-1):0)}));
  origin=navigationSelection(labels,waypoint);previous=waypoint;
 }
 return result;
}
