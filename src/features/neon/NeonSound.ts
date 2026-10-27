import {NEON_TURN_ON_MS,NEON_SMOOTH_SECONDS} from './envelope';

/** A separate effect bus: never seeks, pauses, or changes the music player's gain. */
export class NeonSound {
 private context:AudioContext|null=null;
 private loading:Promise<{plink:AudioBuffer;buzz:AudioBuffer}>|null=null;
 private voices=new Set<AudioBufferSourceNode>();
 private gates=new Set<GainNode>();
 private output:GainNode|null=null;
 private buzz:GainNode|null=null;
 private generation=0;
 private muted=false;
 private brightness=1;
 private lastGain=-1;
 constructor(private urls:{plink:string;buzz:string},private createContext=()=>new AudioContext({latencyHint:'interactive'})){}
 private getContext(){return this.context??=this.createContext();}
 // Called synchronously from trusted pointer/key input. Hover alone cannot
 // unlock sound in browsers that require a prior user gesture.
 unlock(){try{void this.getContext().resume().catch(()=>{});}catch{/* Visuals work without Web Audio. */}}
 private prepare(){
  if(!this.loading){
   const context=this.getContext();
   const load=async(url:string)=>{
    const response=await fetch(url);if(!response.ok)throw new Error('Neon sound unavailable');
    return context.decodeAudioData(await response.arrayBuffer());
   };
   this.loading=Promise.all([load(this.urls.plink),load(this.urls.buzz)]).then(([plink,buzz])=>({plink,buzz}));
   this.loading.catch(()=>{this.loading=null;});
  }
  return this.loading;
 }
 start(elapsed:()=>number,reduced=false){
  this.stop();this.unlock();const generation=this.generation;
  const run=async()=>{
   const buffers=await this.prepare(),context=this.getContext();
   if(generation!==this.generation)return false;
   if(generation!==this.generation||context.state!=='running')return false;
   const now=context.currentTime,ms=elapsed();
   const output=context.createGain();output.gain.value=this.muted?0:1;output.connect(context.destination);this.output=output;
   const source=(buffer:AudioBuffer,loop:boolean,target:AudioNode)=>{
    const voice=context.createBufferSource();voice.buffer=buffer;voice.loop=loop;voice.connect(target);this.voices.add(voice);
    voice.onended=()=>{voice.disconnect();this.voices.delete(voice);};return voice;
   };
   const origin=now-ms/1000;
   // Each startup flash has its own short buzz voice. Nothing loops under plink.
   if(!reduced)for(const startMs of [0,180]){
    const end=origin+(startMs+90)/1000;
    if(end<=now)continue;
    const when=Math.max(now,origin+startMs/1000);
    const gate=context.createGain();gate.gain.value=.5;gate.connect(output);this.gates.add(gate);
    const voice=source(buffers.buzz,true,gate);
    voice.onended=()=>{voice.disconnect();gate.disconnect();this.gates.delete(gate);this.voices.delete(voice);};
    voice.start(when);voice.stop(end);
   }
   // One shared gain carries both recordings, preserving the same level at
   // their sample-accurate boundary and following the exact visible brightness.
   this.buzz=context.createGain();this.buzz.gain.value=this.brightness;this.buzz.connect(output);
   const plinkAt=origin+(reduced?0:NEON_TURN_ON_MS/1000);
   const buzzAt=plinkAt+buffers.plink.duration;
   if(now<buzzAt){
    const when=Math.max(now,plinkAt),voice=source(buffers.plink,false,this.buzz);
    voice.start(when,Math.max(0,now-plinkAt));
   }
   const when=Math.max(now,buzzAt),voice=source(buffers.buzz,true,this.buzz);
   voice.start(when,Math.max(0,now-buzzAt)%buffers.buzz.duration);
   this.lastGain=this.brightness;
   return true;
  };
  return run().catch(()=>false);
 }
 /** The very same frame sample drives tube brightness and audible volume. */
 setBrightness(value:number){
  this.brightness=Math.max(0,Math.min(1,value));
  if(!this.buzz||!this.context||this.brightness===this.lastGain)return;
  this.lastGain=this.brightness;
  this.buzz.gain.setValueAtTime(this.brightness,this.context.currentTime);
 }
 setMuted(value:boolean){
  this.muted=value;
  if(this.output&&this.context)this.output.gain.setTargetAtTime(value?0:1,this.context.currentTime,NEON_SMOOTH_SECONDS);
 }
 stop(){
  this.generation++;
  for(const voice of this.voices){voice.onended=null;voice.stop();voice.disconnect();}
  this.voices.clear();for(const gate of this.gates)gate.disconnect();this.gates.clear();this.buzz?.disconnect();this.output?.disconnect();this.buzz=null;this.output=null;this.lastGain=-1;
 }
 dispose(){this.stop();if(this.context)void this.context.close().catch(()=>{});}
}
