/** All effect contexts unlock together on the first browser-recognized gesture. */
const engines=new Set<()=>void>();
const events=['pointerdown','click','touchend','keydown'] as const;
export function unlockEffects(){for(const unlock of engines)unlock();}
const gesture=(event:Event)=>{if(event.isTrusted)unlockEffects();};
export function registerEffectAudioUnlock(unlock:()=>void){
 if(!engines.size)for(const event of events)document.addEventListener(event,gesture,true);
 engines.add(unlock);
 // A very early click can precede effects mounting during the intro.
 if(typeof navigator!=='undefined'&&navigator.userActivation?.hasBeenActive)unlock();
 return()=>{
  engines.delete(unlock);
  if(!engines.size)for(const event of events)document.removeEventListener(event,gesture,true);
 };
}
