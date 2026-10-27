import {test} from 'node:test';
import assert from 'node:assert/strict';
import {registerEffectAudioUnlock,unlockEffects} from '../src/features/audio/effectAudioUnlock.ts';

test('click/touch/keyboard and music Play unlock every effect without changing mute',()=>{
 const original=Object.getOwnPropertyDescriptor(globalThis,'document');
 const handlers=new Map<string,(event:{isTrusted:boolean})=>void>();
 Object.defineProperty(globalThis,'document',{configurable:true,value:{
  addEventListener(type:string,handler:(event:{isTrusted:boolean})=>void,capture:boolean){assert.equal(capture,true);handlers.set(type,handler);},
  removeEventListener(type:string){handlers.delete(type);}
 }});
 let first=0,second=0;
 const removeFirst=registerEffectAudioUnlock(()=>first++),removeSecond=registerEffectAudioUnlock(()=>second++);
 try{
  const baseline=[first,second];
  assert.equal(handlers.size,4);
  handlers.get('click')!({isTrusted:false});assert.deepEqual([first,second],baseline);
  for(const type of ['pointerdown','click','touchend','keydown'])handlers.get(type)!({isTrusted:true});
  assert.deepEqual([first,second],[baseline[0]+4,baseline[1]+4]);
  unlockEffects();assert.deepEqual([first,second],[baseline[0]+5,baseline[1]+5]);
  removeFirst();assert.equal(handlers.size,4);
  unlockEffects();assert.deepEqual([first,second],[baseline[0]+5,baseline[1]+6]);
 }finally{removeFirst();removeSecond();assert.equal(handlers.size,0);if(original)Object.defineProperty(globalThis,'document',original);else Reflect.deleteProperty(globalThis,'document');}
});
