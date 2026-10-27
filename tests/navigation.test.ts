import {test} from 'node:test';
import assert from 'node:assert/strict';
import {navigationLetterFrames,navigationSelection,timedNavigationLetterFrames} from '../src/components/navigationLetterFrames.ts';
import {tabTransitionPlan} from '../src/features/landing/tabTransitions.ts';
import {tabTiming} from '../src/features/landing/timing.ts';

const labels=['Foul Balls','The Sleds','Afroman','Graphic Design','Illustration'];
test('a long handoff fully visits every intervening name, in either direction',()=>{
 for(const [from,to] of [[0,4],[4,0]]){
  const frames=navigationLetterFrames(labels,navigationSelection(labels,from),from,to);
  const visited=frames.filter(frame=>JSON.stringify(frame.letters)===JSON.stringify(navigationSelection(labels,frame.waypoint))).map(frame=>frame.waypoint);
  assert.deepEqual(visited,from<to?[1,2,3,4]:[3,2,1,0]);
  assert.deepEqual(frames.at(-1)?.letters,navigationSelection(labels,to));
 }
});
test('reverse travel hands off rightmost letters first, including last-to-first',()=>{
 const first=navigationLetterFrames(labels,navigationSelection(labels,4),4,0)[0];
 assert.equal(first.letters[3].at(-1),true);
 assert.equal(first.letters[3][0],false);
 assert.equal(first.letters[4].at(-1),false);
 assert.equal(first.letters[4][0],true);
});
test('retargeting a partial wave settles cleanly without leaving stray bold letters',()=>{
 const outward=navigationLetterFrames(labels,navigationSelection(labels,0),0,4);
 const partial=outward.find(frame=>frame.waypoint===2)!;
 for(const destination of [0,2,4]){
  const redirected=navigationLetterFrames(labels,partial.letters,partial.waypoint,destination);
  assert.deepEqual(redirected.at(-1)?.letters,navigationSelection(labels,destination));
 }
 assert.equal(navigationLetterFrames(labels,navigationSelection(labels,0),0,0).length,0);
});
test('project letters start with each rising tab and reach bold before its peak',()=>{
 const timing=tabTiming(false);
 for(const [from,to] of [[0,1],[1,0],[0,4],[4,0]]){
  const plan=tabTransitionPlan(from,to),frames=timedNavigationLetterFrames(labels,navigationSelection(labels,from),from,to,timing.rise,timing.passStagger);
  const visits=[...plan.passes.map(pass=>({index:pass.index,start:pass.start})),{index:to,start:plan.commitAt}];
  visits.forEach(({index,start})=>{
   const leg=frames.filter(frame=>frame.waypoint===index);
   assert.equal(leg[0].at,start);
   assert.ok(leg.at(-1)!.at<start+timing.rise);
   assert.ok(leg.at(-1)!.at>=start+timing.rise-17);
   assert.deepEqual(leg.at(-1)!.letters,navigationSelection(labels,index));
  });
  assert.deepEqual(frames.at(-1)!.letters,navigationSelection(labels,to));
 }
});
