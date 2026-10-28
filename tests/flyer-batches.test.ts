import test from 'node:test';
import assert from 'node:assert/strict';
import {flyerBatch,flyerTilt,nextFlyerBatch} from '../src/features/projects/flyer-batches';
test('arrows replace a full responsive batch and loop in either direction',()=>{
 for(const count of [1,2,3]){
  const next=nextFlyerBatch(0,1,count,6);
  assert.deepEqual(flyerBatch(next,count,6),Array.from({length:count},(_,i)=>count+i));
  assert.equal(nextFlyerBatch(next,-1,count,6),0);
  assert.deepEqual(flyerBatch(nextFlyerBatch(0,-1,count,6),count,6),Array.from({length:count},(_,i)=>6-count+i));
 }
});
test('partial last batches wrap without blanks or repeating an artwork in a batch',()=>{
 assert.deepEqual(flyerBatch(4,3,5),[4,0,1]);
 assert.deepEqual(flyerBatch(0,3,1),[0]);
 assert.deepEqual(flyerBatch(0,3,0),[]);
});
test('newly pasted layers use different restrained angles at every slot',()=>{
 for(let batch=1;batch<10;batch++)for(let slot=0;slot<3;slot++){
  assert.notEqual(flyerTilt(batch,slot),flyerTilt(batch-1,slot));
  assert.ok(Math.abs(flyerTilt(batch,slot))<=2.6);
 }
});
