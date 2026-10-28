import test from 'node:test';
import assert from 'node:assert/strict';
import {flyerBatch,flyerTilt,nextFlyerBatch,FLYER_STEP_MS,FLYER_UNFURL_MS,FLYER_COMPLETE_MS,FLYER_TAPE_START_MS,FLYER_TAPE_MS,flyerBatchDuration} from '../src/features/projects/flyer-batches';
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
test('newly pasted layers alternate between the same two angles',()=>{
 for(let batch=1;batch<10;batch++)for(let slot=0;slot<3;slot++){
  assert.notEqual(flyerTilt(batch,slot),flyerTilt(batch-1,slot));
  assert.ok(Math.abs(flyerTilt(batch,slot))<=2.6);
 }
});

test('each poster finishes being taped before the next starts, and the queue waits for the last',()=>{
 assert.ok(FLYER_STEP_MS>FLYER_UNFURL_MS);
 assert.ok(FLYER_STEP_MS>FLYER_TAPE_START_MS+FLYER_TAPE_MS);
 for(const count of [1,2,3])assert.ok(flyerBatchDuration(count)>(count-1)*FLYER_STEP_MS+FLYER_COMPLETE_MS);
 assert.equal(new Set(Array.from({length:20},(_,i)=>flyerTilt(i,0))).size,2);
});
