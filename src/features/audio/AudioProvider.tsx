import {unlockEffects} from './effectAudioUnlock';
import {createContext, type ComponentChildren} from 'preact';
import {useContext,useEffect,useRef,useState} from 'preact/hooks';
import {tracks} from '../../content/tracks';
import {previousAction,shuffledQueue} from './queue';
function useAudioController(){
  const audio=useRef<HTMLAudioElement>(null);
  const [queue]=useState(()=>shuffledQueue(tracks.length));
  const [position,setPosition]=useState(0);
  const [playing,setPlaying]=useState(false),[muted,setMuted]=useState(false);
  const [time,setTime]=useState(0),[duration,setDuration]=useState(0),[error,setError]=useState('');
  const shouldPlay=useRef(false);
  const track=tracks[queue[position]];
  const play=()=>{unlockEffects();const el=audio.current;if(!el)return;shouldPlay.current=true;setError('');void el.play().catch(()=>{shouldPlay.current=false;setPlaying(false);setError('Audio could not play. Try again.');});};
  const change=(direction:number)=>{setTime(0);setError('');if(queue.length===1){if(audio.current)audio.current.currentTime=0;return;}setDuration(0);setPosition(p=>(p+direction+queue.length)%queue.length);};
  useEffect(()=>{const el=audio.current;if(!el)return;el.load();if(shouldPlay.current)play();},[track.id]);
  return {audio,track,playing,muted,time,duration,error,
    pause:()=>{shouldPlay.current=false;audio.current?.pause();},
    playTrack:(id:string)=>{const target=queue.findIndex(index=>tracks[index].id===id);if(target<0)return;if(target===position){play();return;}shouldPlay.current=true;setTime(0);setDuration(0);setError('');setPosition(target);},
    toggle:()=>{if(playing){shouldPlay.current=false;audio.current?.pause();}else play();},
    next:()=>change(1),previous:()=>{if(previousAction(audio.current?.currentTime||0)==='restart'){if(audio.current)audio.current.currentTime=0;setTime(0);}else change(-1);},
    seek:(value:number)=>{if(audio.current&&Number.isFinite(duration)){audio.current.currentTime=value;setTime(value);}},
    toggleMute:()=>{
      // The shared mute control is also a pause action while the music is live.
      // When the player is already stopped, it silences the site's effect audio.
      if(playing){shouldPlay.current=false;audio.current?.pause();setMuted(true);}
      else setMuted(v=>!v);
    },
    element:<audio ref={audio} src={track.src} preload="metadata" muted={muted} onTimeUpdate={()=>setTime(audio.current?.currentTime||0)} onDurationChange={()=>setDuration(Number.isFinite(audio.current?.duration)?audio.current!.duration:0)} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>{if(queue.length===1){if(audio.current)audio.current.currentTime=0;play();}else change(1);}} onError={()=>{setPlaying(false);setError('Audio unavailable.');}}/>
  };
}
type Controller=ReturnType<typeof useAudioController>;
const AudioContext=createContext<Controller|null>(null);
export function AudioProvider({children}:{children:ComponentChildren}){const state=useAudioController();return <AudioContext.Provider value={state}>{state.element}{children}</AudioContext.Provider>;}
export function useAudio(){const state=useContext(AudioContext);if(!state)throw new Error('AudioProvider missing');return state;}
