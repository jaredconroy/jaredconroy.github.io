import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compactRoleChain,justifyChainRows,chainFontSize} from '../src/features/landing/roleChainLayout.ts';

test('the compact chain keeps its original bookends and exactly one ampersand between roles',()=>{
 for(const extra of [[],['Creator'],['Creator','Animator','Composer','Voice Actor','Character Designer','Creative Producer']]){
  const chain=compactRoleChain(['Screenwriter','Illustrator'],extra);
  assert.deepEqual(chain.tokens.filter(token=>token.kind==='role').map(token=>token.text),['Screenwriter',...extra,'Illustrator']);
  assert.equal(chain.tokens.filter(token=>token.kind==='amp').length,extra.length+1);
  assert.equal(chain.tokens[0].primary,'first');assert.equal(chain.tokens.at(-1)!.primary,'last');
  chain.tokens.forEach((token,index)=>assert.equal(token.kind,index%2?'amp':'role'));
  assert.deepEqual(chain.groups.flat(),chain.tokens);
  assert.ok(!chain.additions.some(token=>token.primary||token.id==='amp-0'));
  assert.equal(chain.additions.length,extra.length*2);
 }
});
test('wrapping keeps the final separator beside the final original descriptor',()=>{
 const chain=compactRoleChain(['Creative Director','Lead Singer'],['Songwriter','Performing Artist']);
 assert.deepEqual(chain.groups.at(-1)!.map(token=>token.text),['&','Lead Singer']);
 assert.deepEqual(chain.additions.map(token=>token.text),['Songwriter','&','Performing Artist','&']);
});
test('duplicate additions and original descriptors cannot repeat in the expanded chain',()=>{
 const chain=compactRoleChain(['Illustrator','Character Designer'],['Illustrator','Cartoonist','Cartoonist','Character Designer']);
 assert.deepEqual(chain.tokens.map(token=>token.text),['Illustrator','&','Cartoonist','&','Character Designer']);
});
test('compact type stays readable instead of squeezing long chains into a tiny single line',()=>{
 for(const width of [585,778,1080])for(const natural of [2000,4000,6500]){
  const size=chainFontSize(width,natural);
  assert.ok(size>=18&&size<=22);
  if(width/natural*100>=18)assert.ok(size*natural/100<=width+.001);
 }
});

test('every justified row has equal gutters and wraps before an ampersand',()=>{
 const chain=compactRoleChain(['Screenwriter','Illustrator'],['Creator','Character Designer','Creative Producer','Composer','Voice Actor','Animator']);
 const widths=new Map(chain.tokens.map(token=>[token.id,token.kind==='amp'?22:token.text.length*10]));
 for(const width of [550,680,900]){
  const {rows,positions}=justifyChainRows(chain.groups,widths,width,8);
  assert.ok(rows.length>1);
  rows.forEach((row,index)=>{
   if(index)assert.equal(row[0].kind,'amp');
   assert.equal(row.at(-1)!.kind,'role');
   assert.equal(positions.get(row[0].id)!.x,0);
   const last=row.at(-1)!;
   assert.ok(Math.abs(positions.get(last.id)!.x+widths.get(last.id)!-width)<.001);
   const gaps=row.slice(1).map((token,i)=>positions.get(token.id)!.x-positions.get(row[i].id)!.x-widths.get(row[i].id)!);
   assert.ok(gaps.every(gap=>Math.abs(gap-gaps[0])<.001));
  });
 }
});
