import {projectTiming,tabTiming} from './timing';

export type TabPhase='pass'|'raise'|'hold'|'cleanup';
export type TabPass={index:number;start:number;peak:number;end:number};
export type TabTransition={from:number;to:number;phase:TabPhase;passes:TabPass[];raised:number[];handoffMs:number};
export type TabLevel='hidden'|'half'|'full';
export type TabStep={at:number;phase:TabPhase;raised:number[];commit?:boolean};

/** One clock for the entire wave. Each passing face falls the instant it peaks. */
export function tabTransitionPlan(from:number,to:number,reduced=false){
 const timing=tabTiming(reduced),content=projectTiming(reduced),direction=Math.sign(to-from),path:number[]=[];
 if(!direction)return {steps:[] as TabStep[],path,passes:[] as TabPass[],commitAt:0,contentSwapAt:0,contentEndAt:0,handoffMs:0,total:0};
 if(!reduced&&direction)for(let index=from+direction;index!==to;index+=direction)path.push(index);
 const passes=path.map((index,order)=>{
  const start=order*timing.passStagger;
  return {index,start,peak:start+timing.passUp,end:start+timing.passUp+timing.lower};
 });
 // Adjacent arrivals begin at zero, alongside the outgoing descent. Longer
 // sweeps visit the destination at the very next regular interval.
 const commitAt=path.length*timing.passStagger;
 const handoffMs=Math.max(commitAt+timing.rise,passes.at(-1)?.end??0);
 const events=new Map<number,{up:number[];down:number[];commit?:boolean;phase?:TabPhase}>();
 const event=(at:number)=>{let value=events.get(at);if(!value){value={up:[],down:[]};events.set(at,value);}return value;};
 event(0);
 passes.forEach(pass=>{event(pass.start).up.push(pass.index);event(pass.peak).down.push(pass.index);});
 event(commitAt).commit=true;
 event(handoffMs).phase='hold';event(handoffMs+timing.hold).phase='cleanup';
 const raised=new Set<number>(),steps:TabStep[]=[];let phase:TabPhase='pass';
 for(const [at,value] of [...events].sort((a,b)=>a[0]-b[0])){
  value.down.forEach(index=>raised.delete(index));value.up.forEach(index=>raised.add(index));
  if(value.commit)phase='raise';if(value.phase)phase=value.phase;
  steps.push({at,phase,raised:[...raised],...(value.commit?{commit:true}:{})});
 }
 return {steps,path,passes,commitAt,contentSwapAt:commitAt+content.out,contentEndAt:commitAt+content.out+content.in,handoffMs,total:Math.max(handoffMs+timing.hold+timing.cleanup,commitAt+content.out+content.in)};
}

/** Hover cannot override a running wave. Pointer-down always targets halfway. */
export function tabLevels(count:number,active:number,transition:TabTransition|null,lead:number|null,preview:number|null,pressed:number|null=null):TabLevel[]{
 const awake=preview!==null||lead!==null;
 const levels:TabLevel[]=transition&&transition.phase!=='cleanup'
  ?Array.from({length:count},(_,index)=>transition.raised.includes(index)||index===transition.to&&(transition.phase==='raise'||transition.phase==='hold')?'full':'half')
  :Array.from({length:count},(_,index)=>index===active?(awake?'full':'half'):index===preview?'full':awake?'half':'hidden');
 if(pressed!==null)levels[pressed]='half';
 return levels;
}
