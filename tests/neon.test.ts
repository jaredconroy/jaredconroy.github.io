import {test} from 'node:test';
import assert from 'node:assert/strict';
import {neonEnvelope,neonAppearance,neonLoopLight,createNeonVisualSampler,NEON_LEVELS,NEON_FRAME_MS,NEON_BLINK_MS,NEON_FLICKER_LEVEL,NEON_TURN_ON_MS,NEON_IGNITION_FRAME_MS} from '../src/features/neon/envelope.ts';
import {NeonSound} from '../src/features/neon/NeonSound.ts';

test('neon shows one half-bright frame, one full frame, then immediately fades at any refresh rate',()=>{
 for(const frameMs of [1000/144,1000/60,1000/30,80]){
  const sampleAt=createNeonVisualSampler();
  assert.equal(sampleAt(NEON_TURN_ON_MS-1).phase,'pause');
  const first=sampleAt(NEON_TURN_ON_MS),second=sampleAt(NEON_TURN_ON_MS+frameMs),third=sampleAt(NEON_TURN_ON_MS+frameMs*2);
  assert.equal(first.light,.5);assert.equal(first.phase,'ignite');
  assert.equal(second.light,1);assert.equal(second.phase,'ignite');
  assert.ok(third.light<1);assert.equal(third.phase,'loop');
  assert.ok(neonAppearance(third.light,third.phase).glow<1);
 }
 assert.equal(neonEnvelope(NEON_TURN_ON_MS).light,.5);
 assert.equal(neonEnvelope(NEON_TURN_ON_MS+NEON_IGNITION_FRAME_MS+1).light,1);
});
test('the game-derived brightness loop has no bright plateau',()=>{
 assert.deepEqual(NEON_LEVELS.map((_,i)=>neonLoopLight(i*NEON_FRAME_MS)),[1,.85,.7,.55,.4,.25,.25,.4,.55,.7,.85]);
 assert.ok(neonLoopLight(1)<1);assert.ok(neonLoopLight(16)<neonLoopLight(1));
 assert.equal(neonLoopLight(1540),1);assert.ok(neonLoopLight(1541)<1);

});
test('reduced motion keeps a steady sign with no flicker or brightness cycle',()=>{
 for(const time of [0,90,180,270,500,1000,2500])assert.deepEqual(neonEnvelope(time,true),{phase:'steady',light:1});
});

function fakeContext(){
 const gains:any[]=[],sources:any[]=[];
 const context={currentTime:10,state:'running',destination:{},closed:false,
  resume:async()=>{},close:async()=>{context.closed=true;},decodeAudioData:async()=>({duration:1}),
  createGain(){const gain={value:1,ramps:[] as number[][],values:[] as number[][],linear:[] as number[][],
   setTargetAtTime(...args:number[]){this.ramps.push(args);},setValueAtTime(...args:number[]){this.values.push(args);},linearRampToValueAtTime(...args:number[]){this.linear.push(args);}};
   const node={gain,disconnected:false,connect(){},disconnect(){this.disconnected=true;}};gains.push(node);return node;},
  createBufferSource(){const source={buffer:null as unknown,loop:false,onended:null as (()=>void)|null,started:null as number|null,offset:0,stopAt:null as number|null,stopped:false,disconnected:false,target:null as unknown,connect(target:unknown){this.target=target;},disconnect(){this.disconnected=true;},start(time:number,offset=0){this.started=time;this.offset=offset;},stop(time?:number){if(time!==undefined)this.stopAt=time;else this.stopped=true;}};sources.push(source);return source;}
 };
 return {context:context as unknown as AudioContext,gains,sources,clock:context,closed:()=>context.closed};
}
test('plink hands directly to buzz through one brightness gain, without an extra fade from silence',async t=>{
 t.mock.method(globalThis,'fetch',async()=>new Response(new ArrayBuffer(4)));
 const fake=fakeContext(),sound=new NeonSound({plink:'plink.wav',buzz:'buzz.wav'},()=>fake.context);
 sound.setBrightness(.5);assert.equal(await sound.start(()=>0),true);
 const [flash1,flash2,plink,buzz]=fake.sources;
 assert.deepEqual([flash1.started,flash1.stopAt],[10,10.09]);
 assert.deepEqual([flash2.started,flash2.stopAt],[10.18,10.27]);
 assert.equal(fake.gains[1].gain.value,.5);assert.equal(fake.gains[2].gain.value,.5);
 assert.equal(plink.started,10+NEON_TURN_ON_MS/1000);
 assert.equal(buzz.started,plink.started+1);assert.equal(buzz.loop,true);
 const gain=fake.gains[3].gain;
 assert.equal(plink.target,buzz.target);assert.equal(plink.target,fake.gains[3]);
 assert.equal(gain.value,.5);assert.equal(gain.values.length,0);assert.equal(gain.linear.length,0);
 for(const brightness of [1,.85,.4,.25,.7,1]){
  sound.setBrightness(brightness);
  assert.deepEqual(gain.values.at(-1),[brightness,fake.clock.currentTime]);
 }
 assert.equal(gain.ramps.length,0); // No smoothing or second clock can lag the light.
 sound.setMuted(true);assert.deepEqual(fake.gains[0].gain.ramps.at(-1),[0,fake.clock.currentTime,.025]);
 sound.stop();assert.ok(fake.sources.every(source=>source.stopped&&source.disconnected));
 assert.ok(fake.gains.every(gain=>gain.disconnected));sound.dispose();assert.equal(fake.closed(),true);
});
test('late decode preserves sequence timing and skips expired flashes instead of replaying them',async t=>{
 t.mock.method(globalThis,'fetch',async()=>new Response(new ArrayBuffer(4)));
 const fake=fakeContext(),sound=new NeonSound({plink:'plink.wav',buzz:'buzz.wav'},()=>fake.context);
 assert.equal(await sound.start(()=>NEON_TURN_ON_MS+200),true);
 const [plink,buzz]=fake.sources;
 assert.equal(fake.sources.length,2);assert.ok(Math.abs(plink.offset-.2)<.00001);
 assert.ok(Math.abs(buzz.started-10.8)<.00001);sound.dispose();
});
test('leaving during decode cannot start a late buzz or plink',async t=>{
 let release!:()=>void;const pending=new Promise<void>(resolve=>{release=resolve;});
 t.mock.method(globalThis,'fetch',async()=>{await pending;return new Response(new ArrayBuffer(4));});
 const fake=fakeContext(),sound=new NeonSound({plink:'plink.wav',buzz:'buzz.wav'},()=>fake.context);
 const started=sound.start(()=>100);sound.stop();release();
 assert.equal(await started,false);assert.equal(fake.sources.length,0);sound.dispose();
});
test('the lit tube stays opaque while color and halo span dark orange, page orange and yellow',()=>{
 assert.deepEqual(neonAppearance(.25,'loop'),{opacity:1,color:'rgb(140, 62, 11)',glow:0});
 assert.deepEqual(neonAppearance(.625,'loop'),{opacity:1,color:'rgb(239, 130, 22)',glow:.5});
 assert.deepEqual(neonAppearance(1,'loop'),{opacity:1,color:'rgb(245, 213, 4)',glow:1});
 assert.ok(NEON_LEVELS.every(level=>neonAppearance(level,'loop').opacity===1));
 assert.equal(neonAppearance(0,'blink').opacity,1);
 assert.equal(neonAppearance(0,'ignite').opacity,1);
});
test('the second flicker is followed by a silent dark beat before sustained ignition',()=>{
 for(const time of [NEON_BLINK_MS,450,NEON_TURN_ON_MS-1]){
  assert.deepEqual(neonEnvelope(time),{phase:'pause',light:0});
  assert.equal(neonAppearance(0,'pause').opacity,1);
 }
 assert.equal(neonEnvelope(NEON_TURN_ON_MS).phase,'ignite');
});

test('startup flickers are dimmer and less glowy than sustained ignition',()=>{
 const blink=neonEnvelope(0);const appearance=neonAppearance(blink.light,blink.phase);
 assert.equal(appearance.opacity,1);
 assert.deepEqual(neonAppearance(0,'blink'),{opacity:1,color:'rgb(140, 62, 11)',glow:0});
 assert.ok(appearance.glow>0&&appearance.glow<.5);
 assert.notEqual(appearance.color,neonAppearance(1,'steady').color);
 assert.equal(NEON_TURN_ON_MS-NEON_BLINK_MS,400);
});

test('the same actual render-frame brightness drives sound at every refresh rate',async t=>{
 t.mock.method(globalThis,'fetch',async()=>new Response(new ArrayBuffer(4)));
 for(const frameMs of [1000/144,1000/60,1000/30]){
  const fake=fakeContext(),sound=new NeonSound({plink:'plink.wav',buzz:'buzz.wav'},()=>fake.context);
  await sound.start(()=>NEON_TURN_ON_MS);
  const sample=createNeonVisualSampler(),gain=fake.gains[1].gain;
  for(let elapsed=NEON_TURN_ON_MS;elapsed<NEON_TURN_ON_MS+2000;elapsed+=frameMs){
   const light=sample(elapsed).light;sound.setBrightness(light);
   const audible=gain.values.at(-1)?.[0]??gain.value;
   assert.equal(audible,light);
  }
  sound.dispose();
 }
});
