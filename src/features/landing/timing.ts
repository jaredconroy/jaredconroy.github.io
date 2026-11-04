export const CYCLE_MS=8_000;
export const TAB_STROKE_MS=140;
export const TAB_PRESS_MS=80;
export function projectTiming(reduced:boolean){return reduced?{out:0,in:0}:{out:280,in:280};}
export function tabTiming(reduced:boolean){return reduced?{lower:0,rise:0,hold:0,cleanup:0,passUp:0,passStagger:0}:{lower:TAB_STROKE_MS,rise:TAB_STROKE_MS,hold:500,cleanup:TAB_STROKE_MS,passUp:TAB_STROKE_MS,passStagger:TAB_STROKE_MS};}
export const INTRO_TRANSITION_MS=1200;
export const SIGNATURE_MS=5100;
export const INTRO_WORD_MS=360;
export const INTRO_WORD_STEP_MS=460; // 100ms of clear space after each word finishes.
export const INTRO_GREETING_START_MS=160;
export const INTRO_SIGNATURE_DELAY_MS=INTRO_GREETING_START_MS+INTRO_WORD_STEP_MS+INTRO_WORD_MS+160;
export const INTRO_TAGLINE_DELAY_MS=160;
export const TAGLINE_MS=INTRO_WORD_STEP_MS+INTRO_WORD_MS;
export const INTRO_HOLD_MS=SIGNATURE_MS+TAGLINE_MS+1000;
export const INTRO_REEL_MS=3_200;
export const INTRO_REFRAME_MS=600;
export const INTRO_SETTLE_MS=550;
export const INTRO_SHRINK_MS=1_200;
export const INTRO_DURATION_MS=INTRO_SIGNATURE_DELAY_MS+SIGNATURE_MS/1.75+INTRO_TAGLINE_DELAY_MS+TAGLINE_MS+200+INTRO_REFRAME_MS+INTRO_REEL_MS+INTRO_SETTLE_MS+INTRO_SHRINK_MS;
export function stepClock(elapsed:number,delta:number,paused:boolean,transitioning=false):number {
  return paused||transitioning?elapsed:Math.min(CYCLE_MS,elapsed+delta);
}
