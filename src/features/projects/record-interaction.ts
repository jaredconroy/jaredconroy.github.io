type Bounds={left:number;right:number;top:number;bottom:number};

/** The fold must not change the area that can activate its own hover. */
export function insideRecordBounds(x:number,y:number,...bounds:Bounds[]):boolean{
 return bounds.every(box=>x>=box.left&&x<box.right&&y>=box.top&&y<box.bottom);
}

type SleevePosition={left:number;right:number;backMidpointOffset:number;frontMidpointOffset:number};
/** Prepare an offscreen original for its duplicate's position before the loop
 * swaps them, so an already-folded visible sleeve is never replaced by a flat one. */
export function recordFolded(sleeve:SleevePosition,opening:Pick<Bounds,'left'|'right'>,nextCopyLeft?:number):boolean{
 const left=sleeve.right<=opening.left&&nextCopyLeft!==undefined?nextCopyLeft:sleeve.left;
 return left+sleeve.backMidpointOffset>opening.left&&left+sleeve.frontMidpointOffset<opening.right;
}
/** Let a fold take the same time as half a cover passing the cabinet edge. */
export function recordFoldDuration(coverWidth:number,loopDistance:number,loopDurationMs:number):number{
 if(coverWidth<=0||loopDistance<=0||loopDurationMs<=0)return 3000;
 return loopDurationMs*coverWidth*.5/loopDistance;
}
