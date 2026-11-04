import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readHex,tweenColor,type RGB} from '../src/app/colorTween.ts';

test('palette colors support both short and full hex notation',()=>{
 assert.deepEqual(readHex('#abc'),[170,187,204]);
 assert.deepEqual(readHex('#91B2CB'),[145,178,203]);
});
test('an interrupted fade begins at the exact last painted color',()=>{
 const current=tweenColor(readHex('#ffffff'),readHex('#25282c'),.43);
 const destination=readHex('#91b2cb');
 assert.deepEqual(tweenColor(current,destination,0),current);
 assert.deepEqual(tweenColor(current,destination,1),destination);
});
test('light/dark palette fades approach their target without reversing or overshooting',()=>{
 for(const [from,to] of [['#ffffff','#25282c'],['#173458','#91b2cb'],['#91b2cb','#846393']]){
  const start=readHex(from),target=readHex(to);
  const distance=(color:RGB)=>color.reduce((sum,value,index)=>sum+Math.abs(value-target[index]),0);
  let previous=distance(start);
  for(let frame=0;frame<=120;frame++){
   const value=tweenColor(start,target,frame/120);
   assert.ok(distance(value)<=previous+1e-8);
   value.forEach((channel,index)=>assert.ok(channel>=Math.min(start[index],target[index])-1e-8&&channel<=Math.max(start[index],target[index])+1e-8));
   previous=distance(value);
  }
  assert.deepEqual(tweenColor(start,target,2),target);
 }
});
