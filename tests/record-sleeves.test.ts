import test from 'node:test';
import assert from 'node:assert/strict';
import {recordRows} from '../src/features/projects/record-sleeves';
import type {DesignArtwork} from '../src/content/design';

const artwork=(title:string,sleeve?:DesignArtwork['sleeve']):DesignArtwork=>({title,src:`${title}.webp`,caption:'',width:1000,height:1000,sleeve});

test('a sleeve always keeps its back left of its front, even when separated in source order',()=>{
 const front=artwork('Front',{id:'album',side:'front'}),back=artwork('Back',{id:'album',side:'back'});
 const source=[front,artwork('Single'),artwork('EP'),back];
 const rows=recordRows(source),records=rows.flat();
 assert.deepEqual(records[0].artworks,[back,front]);
 assert.equal(rows.filter(row=>row.some(record=>record.id==='album')).length,2);
 assert.equal(source[0],front);
});

test('both rows loop through every artwork once, with staggered starts and intact sleeves',()=>{
 const singles=Array.from({length:7},(_,i)=>artwork(`Single ${i}`));
 const front=artwork('Front',{id:'album',side:'front'}),back=artwork('Back',{id:'album',side:'back'});
 const source=[...singles.slice(0,4),front,back,...singles.slice(4)];
 const rows=recordRows(source);
 assert.deepEqual(rows.map(row=>row.flatMap(record=>record.artworks).length),[9,9]);
 assert.equal(rows[0][0].artworks[0],singles[0]);
 assert.deepEqual(rows[1][0].artworks,[back,front]);
 assert.equal(new Set(rows.flat().flatMap(record=>record.artworks)).size,source.length);
 for(const row of rows)assert.equal(new Set(row.flatMap(record=>record.artworks)).size,source.length);
 const offset=rows[0].findIndex(record=>record.id===rows[1][0].id);
 assert.deepEqual(rows[1],[...rows[0].slice(offset),...rows[0].slice(0,offset)]);
});

test('an unpaired future sleeve stays visible until its other side is added',()=>{
 const front=artwork('Front',{id:'future',side:'front'});
 assert.deepEqual(recordRows([front]),[[{id:'future',artworks:[front]}]]);
 assert.deepEqual(recordRows([]),[]);
});
