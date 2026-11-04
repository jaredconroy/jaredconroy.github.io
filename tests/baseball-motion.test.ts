import {test} from 'node:test';
import assert from 'node:assert/strict';
import {baseballMotion,baseballArrivalTiming} from '../src/features/landing/baseballMotion.ts';
test('baseball rolls right to left on one baseline then drops without horizontal drift',()=>{
 const {frames,rotation}=baseballMotion(1000,400,60,130,30);
 assert.deepEqual(frames.map(frame=>frame.transform),['translate3d(1000px,60px,0)','translate3d(400px,60px,0)','translate3d(400px,130px,0)']);
 assert.equal(frames[0].easing,'linear');
 assert.ok(rotation<0);
 assert.equal(frames[1].offset,.72);
});
test('rotation matches rolling distance and scales with the ball diameter',()=>{
 const roll=baseballMotion(100,0,0,100,20).rotation;
 assert.equal(baseballMotion(200,0,0,100,20).rotation,roll*2);
 assert.equal(baseballMotion(100,0,0,100,40).rotation,roll/2);
});

import {tabTransitionPlan} from '../src/features/landing/tabTransitions.ts';
import {timedNavigationLetterFrames,navigationSelection} from '../src/components/navigationLetterFrames.ts';
import {TAB_STROKE_MS} from '../src/features/landing/timing.ts';
test('baseball takes over when the bold wave reaches the neighboring Sleds tab',()=>{
 const labels=['Foul Balls','The Sleds','Afroman','Graphic Design','Illustration'];
 for(const from of [2,3,4]){
  const plan=tabTransitionPlan(from,0),arrival=baseballArrivalTiming(plan);
  const frames=timedNavigationLetterFrames(labels,navigationSelection(labels,from),from,0,TAB_STROKE_MS,TAB_STROKE_MS);
  assert.equal(arrival.triggerAt,frames.find(frame=>frame.waypoint===1)!.at);
  assert.ok(arrival.triggerAt+arrival.rollMs>plan.contentEndAt);
 }
 assert.equal(baseballArrivalTiming(tabTransitionPlan(1,0)).triggerAt,0);
});
