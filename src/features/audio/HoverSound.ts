export type HoverSoundState='idle'|'pending'|'playing'|'unavailable';

/** A lazy one-shot effect, independent of the persistent music transport. */
export class HoverSound {
 private context:AudioContext|null=null;
 private loading:Promise<AudioBuffer>|null=null;
 private voice:AudioBufferSourceNode|null=null;
 private gain:GainNode|null=null;
 private muted=false;
 private generation=0;
 private state:HoverSoundState='idle';
 constructor(private url:string,private onState:(state:HoverSoundState)=>void,private volume=.65,private createContext=()=>new AudioContext({latencyHint:'interactive'})){}
 private report(state:HoverSoundState){this.state=state;this.onState(state);}
 private getContext(){return this.context??=this.createContext();}
 unlock(){try{void this.getContext().resume().catch(()=>{});}catch{/* Hover audio is optional. */}}
 private prepare(){
  if(!this.loading){
   const context=this.getContext();
   this.loading=fetch(this.url).then(response=>{if(!response.ok)throw new Error('Effect unavailable');return response.arrayBuffer();}).then(bytes=>context.decodeAudioData(bytes));
   this.loading.catch(()=>{this.loading=null;});
  }
  return this.loading;
 }
 async play(){
  this.stop();if(this.muted)return false;
  this.unlock();
  const generation=this.generation;this.report('pending');
  try{
   const buffer=await this.prepare(),context=this.getContext();
   if(generation!==this.generation)return false;
   // A suspended context needs a trusted click/key first. Never queue a late hit.
   if(context.state!=='running'){this.report('unavailable');return false;}
   const gain=context.createGain();gain.gain.value=this.muted?0:this.volume;gain.connect(context.destination);
   const voice=context.createBufferSource();voice.buffer=buffer;voice.connect(gain);
   this.voice=voice;this.gain=gain;
   voice.onended=()=>{voice.disconnect();gain.disconnect();if(this.voice===voice){this.voice=null;this.gain=null;this.report('idle');}};
   voice.start();this.report('playing');return true;
  }catch{if(generation===this.generation)this.report('unavailable');return false;}
 }
 /** Leaving hover cancels an undecoded hit, but lets a played hit ring out. */
 release(){this.generation++;if(this.state==='pending')this.report('idle');}
 setMuted(value:boolean){
  this.muted=value;if(value)this.release();
  if(this.gain&&this.context)this.gain.gain.setTargetAtTime(value?0:this.volume,this.context.currentTime,.02);
 }
 stop(){
  this.generation++;
  if(this.voice){this.voice.onended=null;this.voice.stop();this.voice.disconnect();this.voice=null;}
  this.gain?.disconnect();this.gain=null;this.report('idle');
 }
 dispose(){this.stop();if(this.context)void this.context.close().catch(()=>{});}
}
