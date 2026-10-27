import {test} from 'node:test';
import assert from 'node:assert/strict';
import {HoverSound} from '../src/features/audio/HoverSound.ts';

function fakeContext(state='running'){
 const sources:{onended:(()=>void)|null;started:boolean;stopped:boolean;disconnected:boolean;start:()=>void;stop:()=>void;connect:()=>void;disconnect:()=>void;buffer:unknown}[]=[];
 const ramps:number[][]=[];
 const context={state,currentTime:10,destination:{},closed:false,resumes:0,
  resume:async()=>{context.resumes++;context.state='running';},close:async()=>{context.closed=true;},decodeAudioData:async()=>({duration:3.45}),
  createGain:()=>({gain:{value:1,setTargetAtTime:(...values:number[])=>ramps.push(values)},connect(){},disconnect(){}}),
  createBufferSource:()=>{const voice={onended:null as (()=>void)|null,started:false,stopped:false,disconnected:false,buffer:null as unknown,start(){this.started=true;},stop(){this.stopped=true;},connect(){},disconnect(){this.disconnected=true;}};sources.push(voice);return voice;}
 };
 return {context,sources,ramps,create:()=>context as unknown as AudioContext};
}
test('the bat hit loads lazily, rings out after exit, caches its buffer and obeys mute',async t=>{
 let requests=0;t.mock.method(globalThis,'fetch',async()=>{requests++;return new Response(new ArrayBuffer(4));});
 const fake=fakeContext(),states:string[]=[],sound=new HoverSound('bat.m4a',state=>states.push(state),.65,fake.create);
 assert.equal(requests,0);assert.equal(await sound.play(),true);assert.equal(requests,1);
 assert.equal(fake.sources[0].started,true);sound.release();assert.equal(fake.sources[0].stopped,false);
 sound.setMuted(true);assert.deepEqual(fake.ramps.at(-1),[0,10,.02]);
 sound.setMuted(false);assert.deepEqual(fake.ramps.at(-1),[.65,10,.02]);
 fake.sources[0].onended!();assert.equal(states.at(-1),'idle');
 assert.equal(await sound.play(),true);assert.equal(requests,1);assert.equal(fake.sources.length,2);
 sound.stop();assert.equal(fake.sources[1].stopped,true);
 sound.setMuted(true);assert.equal(await sound.play(),false);assert.equal(fake.sources.length,2);
 sound.dispose();assert.equal(fake.context.closed,true);
});
test('leaving before decode cannot trigger a delayed crack; a later entry reuses the load',async t=>{
 let release!:()=>void;const pending=new Promise<void>(resolve=>{release=resolve;});
 t.mock.method(globalThis,'fetch',async()=>{await pending;return new Response(new ArrayBuffer(4));});
 const fake=fakeContext(),sound=new HoverSound('bat.m4a',()=>{},.65,fake.create);
 const first=sound.play();sound.release();release();
 assert.equal(await first,false);assert.equal(fake.sources.length,0);
 assert.equal(await sound.play(),true);sound.stop();assert.ok(fake.sources.every(source=>source.stopped));sound.dispose();
});
test('a suspended browser never stores a hit to play later when unlocked',async t=>{
 t.mock.method(globalThis,'fetch',async()=>new Response(new ArrayBuffer(4)));
 const fake=fakeContext('suspended');let allowed=false;
 t.mock.method(fake.context,'resume',async()=>{if(allowed)fake.context.state='running';});
 const states:string[]=[],sound=new HoverSound('bat.m4a',state=>states.push(state),.65,fake.create);
 assert.equal(await sound.play(),false);assert.equal(fake.sources.length,0);assert.equal(states.at(-1),'unavailable');
 allowed=true;sound.unlock();await Promise.resolve();assert.equal(fake.sources.length,0);
 assert.equal(await sound.play(),true);sound.dispose();
});
