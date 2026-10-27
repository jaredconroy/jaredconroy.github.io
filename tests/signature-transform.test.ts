import {test} from 'node:test';
import assert from 'node:assert/strict';
import {anchorJ,originalTransform,transformJ,validTransform} from '../src/features/signature-editor/transform.ts';
const bounds={left:10,right:110,top:20,bottom:220};
const close=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-8,`${a} should match ${b}`);
test('the untouched editor transform preserves the current J exactly',()=>{
 const point={x:45,y:73};assert.deepEqual(transformJ(originalTransform,bounds,point),point);
});
test('rotation and independent scaling act about the J center',()=>{
 const point=transformJ({...originalTransform,rotation:90,scaleX:2,x:5,y:-3},bounds,{x:110,y:120});
 close(point.x,65);close(point.y,217);
});
test('resizing keeps the opposite handle pinned even with rotation and skew',()=>{
 const before={...originalTransform,rotation:27,skewX:12,x:8,y:9},anchor={x:bounds.left,y:bounds.bottom};
 const after=anchorJ(before,{...before,scaleX:1.7,scaleY:.6},bounds,anchor);
 const a=transformJ(before,bounds,anchor),b=transformJ(after,bounds,anchor);
 close(a.x,b.x);close(a.y,b.y);
});
test('saved transforms reject nonfinite, singular, or unbounded values',()=>{
 assert.ok(validTransform(originalTransform));
 for(const value of [null,{}, {...originalTransform,x:Infinity},{...originalTransform,scaleX:0},{...originalTransform,rotation:10000},{...originalTransform,skewX:45,skewY:45}])assert.equal(validTransform(value),false);
});
