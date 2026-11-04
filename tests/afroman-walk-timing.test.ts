import {test} from 'node:test';
import assert from 'node:assert/strict';
import {afromanWalkTiming} from '../src/features/landing/afromanWalkTiming.ts';

test('the walk stops on the extended-arm frame at arrival across travel distances',()=>{
 const frames=[200,200,200,200,200,200],speed=1.6;
 for(const travelMs of [120,480,750,1125,1633.4,2500]){
  const timing=afromanWalkTiming(frames,speed,travelMs);
  const endTime=timing.delay+timing.iterations*timing.cycleMs;
  const endPhase=((travelMs-timing.delay)%timing.cycleMs+timing.cycleMs)%timing.cycleMs;
  assert.ok(Math.abs(endTime-travelMs)<1e-8,'gait and movement must finish together');
  assert.ok(Math.abs(endPhase-frames[0]/speed/2)<1e-8,'arrival must be inside the first pose, away from its frame boundaries');
 }
});

test('phase alignment respects unequal frame holds and a different landing pose',()=>{
 const frames=[80,160,240],speed=2,travelMs=913;
 const timing=afromanWalkTiming(frames,speed,travelMs,1);
 const phase=((travelMs-timing.delay)%timing.cycleMs+timing.cycleMs)%timing.cycleMs;
 assert.ok(Math.abs(phase-(80+160/2)/speed)<1e-8);
});
