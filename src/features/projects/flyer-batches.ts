export function flyerBatch(start:number,count:number,total:number):number[]{
 return total>0?Array.from({length:Math.min(count,total)},(_,slot)=>((start+slot)%total+total)%total):[];
}
export function nextFlyerBatch(start:number,direction:number,count:number,total:number):number{
 return total>0?((start+direction*Math.min(count,total))%total+total)%total:0;
}
export function flyerTilt(batch:number,slot:number):number{
 return (batch+slot)%2===0?-2.1:2.1;
}
export const FLYER_UNFURL_MS=720;
export const FLYER_STEP_MS=780;
export function flyerBatchDuration(count:number):number{
 return Math.max(0,count-1)*FLYER_STEP_MS+FLYER_UNFURL_MS+40;
}
