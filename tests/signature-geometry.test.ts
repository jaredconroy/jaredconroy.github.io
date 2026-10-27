import {test} from 'node:test';
import assert from 'node:assert/strict';
import saved from '../src/content/signature-transform.json' with {type:'json'};
import {fitSignature,scaleSignatureAt,signatureGeometry,signatureJBounds} from '../src/features/signature-editor/geometry.ts';

test('the shared signature retains the approved desktop J base and letter proportions',()=>{
 assert.equal(signatureJBounds.right,190.53404041349893);
 assert.equal(signatureJBounds.bottom,394.5636);
 const geometry=signatureGeometry(saved);
 const aredWidth=Math.max(...geometry.points[1].map(p=>p[0]))-Math.min(...geometry.points[1].map(p=>p[0]));
 assert.ok(Math.abs(aredWidth-331.88183359636795)<.002);
});
test('compact enlargement preserves the ared baseline and punctuation edge at every fit width',()=>{
 const {ink,wordBaseline}=signatureGeometry(saved);
 for(const width of [156,180,230,248]){
  const fit=fitSignature(ink,width,15,8),larger=scaleSignatureAt(fit,1.1,[ink.right,wordBaseline]);
  assert.ok(Math.abs((ink.right-ink.left)*larger.scale-width*1.1)<1e-8);
  assert.ok(Math.abs(wordBaseline*larger.scale+larger.y-(wordBaseline*fit.scale+fit.y))<1e-8);
  assert.ok(Math.abs(ink.right*larger.scale+larger.x-(ink.right*fit.scale+fit.x))<1e-8);
  assert.ok(ink.top*larger.scale+larger.y<ink.top*fit.scale+fit.y);
  assert.ok(ink.bottom*larger.scale+larger.y>ink.bottom*fit.scale+fit.y);
 }
});
test('responsive fitting uniformly scales the full signature and nib without changing the J/ared relationship',()=>{
 const {ink,points}=signatureGeometry(saved),referenceJ=points[0][100],referenceAred=points[1][100];
 for(const width of [156,272,396,478]){
  const fit=fitSignature(ink,width,15,8);
  assert.ok(Math.abs(ink.left*fit.scale+fit.x-15)<1e-8);
  assert.ok(Math.abs(ink.right*fit.scale+fit.x-(15+width))<1e-8);
  const dx=(referenceAred[0]-referenceJ[0])*fit.scale,dy=(referenceAred[1]-referenceJ[1])*fit.scale;
  assert.ok(Math.abs(dx/dy-(referenceAred[0]-referenceJ[0])/(referenceAred[1]-referenceJ[1]))<1e-8);
  assert.ok(Math.abs(((ink.bottom-ink.top)*fit.scale)/width-(ink.bottom-ink.top)/(ink.right-ink.left))<1e-8);
 }
});
