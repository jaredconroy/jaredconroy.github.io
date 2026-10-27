export function shuffledQueue(length:number, random:()=>number = Math.random):number[] {
  const result=Array.from({length},(_,i)=>i);
  for(let i=length-1;i>0;i--){const j=Math.floor(random()*(i+1)); [result[i],result[j]]=[result[j],result[i]];}
  return result;
}
export function previousAction(time:number):'restart'|'previous' {return time>3?'restart':'previous';}
