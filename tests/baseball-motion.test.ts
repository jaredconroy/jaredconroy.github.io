import {test} from 'node:test';
import assert from 'node:assert/strict';
import {baseballMotion} from '../src/features/landing/baseballMotion.ts';
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
