import {test} from 'node:test';
import assert from 'node:assert/strict';
import {baseballMotion,baseballArrivalTiming,baseballLetterFit,baseballSpinFrames} from '../src/features/landing/baseballMotion.ts';
test('baseball rolls right to left on one baseline then drops without horizontal drift',()=>{
 const {frames,rotation}=baseballMotion(1000,400,60,130,30);
 assert.equal(frames[0].transform,'translate3d(1000px,60px,0)');
 assert.equal(frames[1].transform,'translate3d(400px,60px,0)');
 assert.equal(frames[2].transform,'translate3d(400px,130px,0)');
 assert.equal(frames[3].transform,'translate3d(400px,124.6px,0)');
 assert.equal(frames[4].transform,frames[2].transform);
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
test('baseball starts on the final normal bold-letter frame of Foul Balls',()=>{
 const labels=['Foul Balls','The Sleds','Afroman','Graphic Design','Illustration'];
 for(const from of [1,2,3,4]){
  const plan=tabTransitionPlan(from,0),arrival=baseballArrivalTiming(plan);
  const frames=timedNavigationLetterFrames(labels,navigationSelection(labels,from),from,0,TAB_STROKE_MS,TAB_STROKE_MS);
  assert.equal(arrival.triggerAt,frames.filter(frame=>frame.waypoint===0).at(-1)!.at);
  assert.ok(arrival.triggerAt+arrival.rollMs>plan.contentEndAt);
 }
 assert.ok(baseballArrivalTiming(tabTransitionPlan(1,0)).triggerAt>0);
 assert.ok(baseballArrivalTiming(tabTransitionPlan(4,0)).triggerAt>baseballArrivalTiming(tabTransitionPlan(1,0)).triggerAt);
});

test('visible circle matches the full a ink footprint, preserves its baseline, and includes the 1px left nudge',()=>{
 const metrics={ascent:20,descent:1,baseline:30,width:24},fit=baseballLetterFit(metrics);
 assert.equal(fit.size*.96,metrics.width);
 assert.equal(fit.top+fit.size*.98,metrics.baseline+metrics.descent);
 assert.equal(fit.shift,-1);
});
test('rolling seams finish vertical and remain vertical through the bounce',()=>{
 const rotation=baseballMotion(500,100,0,100,25).rotation;
 const spin=baseballSpinFrames(rotation,.6);
 assert.equal(spin[0].transform,`rotate(${-rotation}deg)`);
 assert.equal(spin[1].transform,'rotate(0deg)');
 assert.equal(spin[2].transform,'rotate(0deg)');
});
