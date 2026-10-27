import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const root=new URL('../public/games/afroman/',import.meta.url);
test('the imported game payload matches its recorded build snapshot',()=>{
 const manifest=JSON.parse(readFileSync(new URL('build.json',root),'utf8'));
 for(const [name,entry] of Object.entries(manifest.files) as [string,{sha256:string;bytes:number}][]){
  const bytes=readFileSync(new URL(name,root));
  assert.equal(bytes.length,entry.bytes,name);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.sha256,name);
 }
 assert.deepEqual([...readFileSync(new URL('afroman.wasm',root)).subarray(0,4)],[0,97,115,109]);
 const html=readFileSync(new URL('index.html',root),'utf8');
 assert.ok(html.includes(`afroman.js?v=${manifest.source_build}`));
 assert.ok(!html.includes('__AFROMAN_BUILD_ID__'));
});
test('the game wrapper remains static-hostable and waits for a user gesture',()=>{
 const html=readFileSync(new URL('index.html',root),'utf8');
 assert.ok(html.includes('noInitialRun:true'));
 assert.ok(html.includes("playButton.addEventListener('click'"));
 assert.ok(html.includes("event.origin!==location.origin||event.source!==parent"));
 const references=[...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match=>match[1]).filter(Boolean);
 assert.ok(references.every(path=>!path.startsWith('/')&&!path.includes('://')));
});
