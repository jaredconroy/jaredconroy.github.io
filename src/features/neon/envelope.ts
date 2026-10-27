// Afroman-web/Classes/StartScreen.cpp: measured title frames, 140ms each.
export const NEON_LEVELS=[1,.85,.70,.55,.40,.25,.25,.40,.55,.70,.85] as const;
export const NEON_FRAME_MS=140;
export const NEON_SMOOTH_SECONDS=.025; // Same effectGain smoothing as proj.web/audio.js.
export const NEON_BLINK_MS=360;
export const NEON_PAUSE_MS=400;
export const NEON_FLICKER_LEVEL=.45;
export const NEON_TURN_ON_MS=NEON_BLINK_MS+NEON_PAUSE_MS;
export const NEON_IGNITION_FRAME_MS=1000/60;
export type NeonPhase='blink'|'pause'|'ignite'|'loop'|'steady';
/** Continuous game-derived brightness, with no plateau at the bright peak. */
export function neonLoopLight(elapsed:number){
 const position=Math.max(0,elapsed)/NEON_FRAME_MS,index=Math.floor(position)%NEON_LEVELS.length,p=position-Math.floor(position);
 return NEON_LEVELS[index]+(NEON_LEVELS[(index+1)%NEON_LEVELS.length]-NEON_LEVELS[index])*p;
}
export function neonEnvelope(elapsed:number,reduced=false):{phase:NeonPhase;light:number}{
 if(reduced)return {phase:'steady',light:1};
 const time=Math.max(0,elapsed);
 if(time<NEON_BLINK_MS)return {phase:'blink',light:Math.floor(time/90)%2===0?NEON_FLICKER_LEVEL:0};
 if(time<NEON_TURN_ON_MS)return {phase:'pause',light:0};
 const lit=time-NEON_TURN_ON_MS;
 if(lit<NEON_IGNITION_FRAME_MS)return {phase:'ignite',light:.5};
 if(lit<NEON_IGNITION_FRAME_MS*2)return {phase:'ignite',light:1};
 return {phase:'loop',light:neonLoopLight(lit-NEON_IGNITION_FRAME_MS)};
}
/** Use actual render frames for the two-frame ignition, independent of refresh rate. */
export function createNeonVisualSampler(){
 let ignitionFrame=0,fullAt=0;
 return (elapsed:number,reduced=false)=>{
  const sample=neonEnvelope(elapsed,reduced);
  if(!reduced&&elapsed>=NEON_TURN_ON_MS){
   if(ignitionFrame===0){sample.phase='ignite';sample.light=.5;ignitionFrame=1;}
   else if(ignitionFrame===1){sample.phase='ignite';sample.light=1;fullAt=elapsed;ignitionFrame=2;}
   else{sample.phase='loop';sample.light=neonLoopLight(elapsed-fullAt);}
  }
  return sample;
 };
}

const DARK_ORANGE=[140,62,11] as const,THEME_ORANGE=[239,130,22] as const,BRIGHT_YELLOW=[245,213,4] as const;
/** The lit tube stays opaque. Its color and halo carry the brightness cycle. */
export function neonAppearance(level:number,phase:NeonPhase){
 let strength=phase==='loop'?(level-.25)/.75:level;
 strength=Math.max(0,Math.min(1,strength));
 if(strength<.015)strength=0;
 const from=strength<=.5?DARK_ORANGE:THEME_ORANGE,to=strength<=.5?THEME_ORANGE:BRIGHT_YELLOW;
 const mix=strength<=.5?strength*2:(strength-.5)*2;
 const color=`rgb(${from.map((channel,i)=>Math.round(channel+(to[i]-channel)*mix)).join(', ')})`;
 return {opacity:1,color,glow:strength};
}
