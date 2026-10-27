import {registerEffectAudioUnlock} from '../audio/effectAudioUnlock';
import {useEffect,useRef} from 'preact/hooks';
import type {RefObject} from 'preact';
import {useAudio} from '../audio/AudioProvider';
import {NeonSound} from './NeonSound';
import {createNeonVisualSampler,neonAppearance} from './envelope';

const base=import.meta.env.BASE_URL;
export function useNeonSign(active:boolean,reduced:boolean,target?:RefObject<HTMLElement>){
 const ownRoot=useRef<HTMLElement>(null),root=target||ownRoot,sound=useRef<NeonSound|null>(null);
 const {muted}=useAudio();
 useEffect(()=>{
  const engine=new NeonSound({plink:`${base}media/afroman/audio/neon-plink.wav`,buzz:`${base}media/afroman/audio/neon-buzz.wav`});
  sound.current=engine;
  const unregister=registerEffectAudioUnlock(()=>engine.unlock());
  return()=>{unregister();engine.dispose();sound.current=null;};
 },[]);
 useEffect(()=>{sound.current?.setMuted(muted);if(root.current)root.current.dataset.neonMuted=String(muted);},[muted]);
 useEffect(()=>{
  const element=root.current,engine=sound.current;if(!element||!engine)return;
  element.dataset.neonActive=String(active);
  if(!active){engine.stop();element.dataset.neonAudio='off';element.dataset.neonPhase='idle';element.style.setProperty('--neon-color','rgb(140, 62, 11)');element.style.setProperty('--neon-flash','1');element.style.setProperty('--neon-glow','none');element.style.setProperty('--neon-strength','0');return;}
  const started=performance.now(),sampleAt=createNeonVisualSampler();let frame=0;
  const tick=(now:number)=>{
   const sample=sampleAt(now-started,reduced);
   const appearance=neonAppearance(sample.light,sample.phase);
   element.style.setProperty('--neon-color',appearance.color);
   element.style.setProperty('--neon-flash',String(appearance.opacity));
   element.style.setProperty('--neon-glow',appearance.glow===0?'none':[4,12,28].map(radius=>`drop-shadow(0 0 ${radius}px rgb(239 130 22 / ${appearance.glow}))`).join(' '));
   element.style.setProperty('--neon-strength',String(appearance.glow));
   element.dataset.neonPhase=sample.phase;
   engine.setBrightness(sample.light);
   if(!reduced)frame=requestAnimationFrame(tick);
  };
  let current=true;
  element.dataset.neonAudio='pending';
  tick(started);void engine.start(()=>performance.now()-started,reduced).then(running=>{if(current)element.dataset.neonAudio=running?'running':'unavailable';});
  return()=>{current=false;cancelAnimationFrame(frame);engine.stop();element.dataset.neonAudio='off';};
 },[active,reduced]);
 return root;
}
