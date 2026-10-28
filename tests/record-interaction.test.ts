import test from 'node:test';
import assert from 'node:assert/strict';
import {insideRecordBounds,recordFolded,recordFoldDuration} from '../src/features/projects/record-interaction';

const sleeve={left:50,right:450,top:100,bottom:300};
const opening={left:100,right:900,top:90,bottom:310};

test('the portion of a sleeve behind the cabinet edge cannot activate unfolding',()=>{
 assert.equal(insideRecordBounds(99,200,sleeve,opening),false);
 assert.equal(insideRecordBounds(100,200,sleeve,opening),true);
});

test('a folded corner protruding below the flat sleeve cannot activate its own hover',()=>{
 assert.equal(insideRecordBounds(200,305,sleeve,opening),false);
 assert.equal(insideRecordBounds(200,299,sleeve,opening),true);
});

test('the bottom-row loop swaps matching folded sleeves without starting a new fold',()=>{
 const opening={left:0,right:1000},offsets={backMidpointOffset:100,frontMidpointOffset:312};
 const hiddenOriginal={left:-2998,right:-2586,...offsets};
 const before=recordFolded(hiddenOriginal,opening,2);
 const after=recordFolded({left:0,right:412,...offsets},opening,3000);
 assert.equal(before,true);
 assert.equal(after,before);
 // The actual half-back-cover exit still unfolds normally a little later.
 assert.equal(recordFolded({left:-101,right:311,...offsets},opening,2899),false);
});

test('preparing a hidden duplicate does not change the front-cover entry trigger',()=>{
 const opening={left:0,right:1000},offsets={backMidpointOffset:100,frontMidpointOffset:312};
 assert.equal(recordFolded({left:700,right:1112,...offsets},opening),false);
 assert.equal(recordFolded({left:687,right:1099,...offsets},opening),true);
});


test('fold speed follows half a cover of shelf travel, independent of responsive scale',()=>{
 assert.equal(recordFoldDuration(240,2520,72000),72000*120/2520);
 assert.equal(recordFoldDuration(120,1260,72000),recordFoldDuration(240,2520,72000));
 assert.equal(recordFoldDuration(240,2520,36000),recordFoldDuration(240,2520,72000)/2);
 assert.equal(recordFoldDuration(240,2520,0),3000);
});

test('a tenth-cover lead starts both entry and exit before the old midpoint triggers',()=>{
 const opening={left:0,right:1000},offsets={backMidpointOffset:100,frontMidpointOffset:312};
 const entering={left:700,right:1112,...offsets};
 assert.equal(recordFolded(entering,opening),false);
 assert.equal(recordFolded({...entering,triggerLead:20},opening),true);
 const exiting={left:-90,right:322,...offsets};
 assert.equal(recordFolded(exiting,opening),true);
 assert.equal(recordFolded({...exiting,triggerLead:20},opening),false);
 // The slow fold now finishes with a tenth of a cover of clearance to spare.
 const finishLeft=opening.right-(offsets.frontMidpointOffset-20)-100;
 assert.equal(finishLeft+412-opening.right,20);
});
