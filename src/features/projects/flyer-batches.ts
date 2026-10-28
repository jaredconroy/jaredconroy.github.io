export function flyerBatch(start:number,count:number,total:number):number[]{
 return total>0?Array.from({length:Math.min(count,total)},(_,slot)=>((start+slot)%total+total)%total):[];
}
export function nextFlyerBatch(start:number,direction:number,count:number,total:number):number{
 return total>0?((start+direction*Math.min(count,total))%total+total)%total:0;
}
export function flyerTilt(batch:number,slot:number):number{
 const angles=[-2.4,1.8,-1.2,2.6,-1.8,1.1,-2.1,2.2];
 return angles[((batch*3+slot)%angles.length+angles.length)%angles.length];
}
