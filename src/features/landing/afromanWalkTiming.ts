/** Choose a starting phase so travel ends halfway through the landing pose. */
export function afromanWalkTiming(frameMs:readonly number[],speed:number,travelMs:number,landingFrame=0){
 const cycleMs=frameMs.reduce((sum,ms)=>sum+ms,0)/speed;
 const landingPhase=(frameMs.slice(0,landingFrame).reduce((sum,ms)=>sum+ms,0)+frameMs[landingFrame]/2)/speed;
 const startPhase=((landingPhase-travelMs)%cycleMs+cycleMs)%cycleMs;
 return {cycleMs,delay:-startPhase,iterations:(travelMs+startPhase)/cycleMs};
}
