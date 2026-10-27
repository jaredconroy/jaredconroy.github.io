import {test} from 'node:test';
import assert from 'node:assert/strict';
import {tabLevels,tabTransitionPlan,type TabTransition,type TabStep} from '../src/features/landing/tabTransitions.ts';
import {projectTiming,tabTiming} from '../src/features/landing/timing.ts';

const state=(from:number,to:number,step:TabStep):TabTransition=>({from,to,phase:step.phase,raised:step.raised,passes:[],handoffMs:0});
test('the final second reveals all inactive tabs halfway without lowering the active tab',()=>{
 assert.deepEqual(tabLevels(5,0,null,1,null),['full','half','half','half','half']);
 assert.deepEqual(tabLevels(5,4,null,0,null),['half','half','half','half','full']);
});
test('every adjacent arrival starts at zero alongside the outgoing descent in either direction',()=>{
 for(const [from,to] of [[0,1],[1,0],[2,3],[4,3]]){
  const plan=tabTransitionPlan(from,to),first=plan.steps[0];
  assert.equal(plan.commitAt,0);assert.equal(first.at,0);assert.equal(first.commit,true);
  const levels=tabLevels(5,to,state(from,to,first),null,null);
  assert.equal(levels[from],'half');assert.equal(levels[to],'full');
  assert.equal(plan.handoffMs,tabTiming(false).rise);
 }
});
test('passing faces and destination arrive at the same fixed interval with equal stroke durations',()=>{
 const timing=tabTiming(false);assert.equal(timing.lower,timing.rise);assert.equal(timing.passUp,timing.rise);
 for(const [from,to,path] of [[0,4,[1,2,3]],[4,0,[3,2,1]],[3,0,[2,1]]] as const){
  const plan=tabTransitionPlan(from,to);
  assert.deepEqual(plan.path,path);
  const arrivals=[...plan.passes.map(pass=>pass.start),plan.commitAt];
  assert.equal(arrivals[0],0);assert.equal(timing.passStagger,timing.passUp);
  arrivals.slice(1).forEach((at,i)=>assert.equal(at-arrivals[i],timing.passStagger));
  plan.passes.forEach(pass=>{
   assert.equal(pass.peak-pass.start,timing.rise);assert.equal(pass.end-pass.peak,timing.lower);
   const rising=plan.steps.find(step=>step.at===pass.start)!;
   const falling=plan.steps.find(step=>step.at===pass.peak)!;
   assert.ok(rising.raised.includes(pass.index));assert.ok(!falling.raised.includes(pass.index));
   const lastBeforePeak=plan.steps.filter(step=>step.at<pass.peak).at(-1)!;
   assert.ok(lastBeforePeak.raised.includes(pass.index));
  });
  assert.equal(plan.commitAt,plan.passes.at(-1)!.peak);
  assert.equal(plan.steps.filter(step=>step.commit).length,1);
  assert.equal(plan.steps.find(step=>step.commit)!.at,plan.commitAt);
  assert.equal(plan.handoffMs,Math.max(plan.commitAt+timing.rise,plan.passes.at(-1)!.end));
 }
});
test('hover never re-raises a passing face after its peak',()=>{
 const plan=tabTransitionPlan(0,4),pass=plan.passes[0],step=plan.steps.find(step=>step.at===pass.peak)!;
 const transition=state(0,4,step);
 assert.equal(tabLevels(5,0,transition,null,pass.index)[pass.index],'half');
 assert.deepEqual(tabLevels(5,0,transition,null,pass.index),tabLevels(5,0,transition,null,null));
});
test('the final-second autoplay wrap starts immediately and follows the visible index',()=>{
 const plan=tabTransitionPlan(4,0);
 assert.deepEqual(plan.path,[3,2,1]);assert.equal(plan.steps[0].at,0);
 assert.equal(plan.passes[0].start,0);assert.ok(plan.steps[0].raised.includes(3));
 assert.equal(tabLevels(5,4,state(4,0,plan.steps[0]),null,null)[4],'half');
});
test('all passing faces are halfway during the 500ms fan hold',()=>{
 const plan=tabTransitionPlan(0,4),hold=plan.steps.find(step=>step.phase==='hold')!,cleanup=plan.steps.find(step=>step.phase==='cleanup')!;
 assert.deepEqual(hold.raised,[]);assert.equal(cleanup.at-hold.at,500);
 assert.deepEqual(tabLevels(5,4,state(0,4,hold),null,null),['half','half','half','half','full']);
});
test('cleanup hides the fan unless pointer or keyboard preview owns the index',()=>{
 const transition:TabTransition={from:0,to:3,phase:'cleanup',raised:[],passes:[],handoffMs:0};
 assert.deepEqual(tabLevels(5,3,transition,null,null),['hidden','hidden','hidden','half','hidden']);
 assert.deepEqual(tabLevels(5,3,transition,null,1),['half','full','half','full','half']);
});
test('pointer-down targets halfway immediately and release restores the current tab without navigation',()=>{
 assert.deepEqual(tabLevels(5,0,null,null,0,0),['half','half','half','half','half']);
 assert.deepEqual(tabLevels(5,0,null,null,0,null),['full','half','half','half','half']);
 assert.deepEqual(tabLevels(5,0,null,null,3,3),['full','half','half','half','half']);
 assert.deepEqual(tabLevels(5,0,null,null,3,null),['full','half','half','full','half']);
 const same=tabTransitionPlan(0,0);assert.deepEqual(same.steps,[]);assert.equal(same.total,0);
});
test('a direct press also targets halfway during a running wave',()=>{
 const plan=tabTransitionPlan(0,4),transition=state(0,4,plan.steps[0]);
 assert.equal(tabLevels(5,0,transition,null,null,1)[1],'half');
 assert.equal(tabLevels(5,0,transition,null,null,null)[1],'full');
});
test('reduced motion omits the path and commits without waiting',()=>{
 for(const [from,to] of [[4,0],[0,1]]){
  const plan=tabTransitionPlan(from,to,true);
  assert.deepEqual(plan.path,[]);assert.equal(plan.commitAt,0);assert.equal(plan.total,0);
 }
});

test('every destination uses a separate complete descriptor exit before swapping and growing',()=>{
 for(const [from,to] of [[0,1],[1,0],[0,4],[4,0]]){
  const plan=tabTransitionPlan(from,to),timing=projectTiming(false);
  assert.equal(plan.contentSwapAt-plan.commitAt,timing.out);
  assert.equal(plan.contentEndAt-plan.contentSwapAt,timing.in);
  assert.ok(plan.contentSwapAt>plan.commitAt);assert.ok(plan.contentEndAt<=plan.total);
 }
});

test('idle index rests halfway and wakes the active face with the whole fan',()=>{
 assert.deepEqual(tabLevels(5,2,null,null,null),['hidden','hidden','half','hidden','hidden']);
 assert.deepEqual(tabLevels(5,2,null,null,4),['half','half','full','half','full']);
 assert.deepEqual(tabLevels(5,2,null,3,null),['half','half','full','half','half']);
 assert.deepEqual(tabLevels(5,2,null,null,null),['hidden','hidden','half','hidden','hidden']);
});
