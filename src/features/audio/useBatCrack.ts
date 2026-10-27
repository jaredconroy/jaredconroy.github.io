import {registerEffectAudioUnlock} from './effectAudioUnlock';
import {useEffect,useRef,useState} from 'preact/hooks';
import {useAudio} from './AudioProvider';
import {HoverSound,type HoverSoundState} from './HoverSound';

export function useBatCrack(active:boolean,enabled:boolean){
 const engine=useRef<HoverSound|null>(null),[state,setState]=useState<HoverSoundState>('idle');
 const {muted}=useAudio();
 useEffect(()=>{
  const sound=new HoverSound(`${import.meta.env.BASE_URL}media/foul-balls/bat-crack.mp3`,setState);
  engine.current=sound;
  const unregister=registerEffectAudioUnlock(()=>sound.unlock());
  return()=>{unregister();sound.dispose();engine.current=null;};
 },[]);
 useEffect(()=>engine.current?.setMuted(muted),[muted]);
 useEffect(()=>{
  const sound=engine.current;if(!sound)return;
  if(!enabled){sound.stop();return;}
  if(active)void sound.play();else sound.release();
  return()=>sound.release();
 },[active,enabled]);
 return muted?'muted':state;
}
