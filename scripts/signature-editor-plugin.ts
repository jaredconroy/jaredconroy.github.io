import type {Plugin} from 'vite';
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {validTransform} from '../src/features/signature-editor/transform';

/** Local authoring endpoint, never present in the static production site. */
export function signatureEditorPlugin():Plugin{return {
 name:'local-signature-editor',apply:'serve',
 handleHotUpdate(context){
  if(context.file!==resolve(context.server.config.root,'src/content/signature-transform.json'))return;
  // Keep the live editor and soundtrack intact after Save; a reload reads the file.
  context.modules.forEach(module=>context.server.moduleGraph.invalidateModule(module));
  return [];
 },
 configureServer(server){server.middlewares.use('/__signature-transform',async(req,res)=>{
  res.setHeader('Content-Type','application/json');
  if(req.method!=='POST'){res.statusCode=405;res.end(JSON.stringify({error:'POST required'}));return;}
  try{
   const origin=req.headers.origin;
   if(!origin||new URL(origin).host!==req.headers.host||req.headers['x-signature-editor']!=='1'||!req.headers['content-type']?.startsWith('application/json')){res.statusCode=403;res.end(JSON.stringify({error:'Use the local signature editor'}));return;}
   let body='';for await(const chunk of req){body+=chunk;if(body.length>2048)throw new Error('Settings are too large');}
   const value=JSON.parse(body);if(!validTransform(value))throw new Error('Invalid transform values');
   await writeFile(resolve(server.config.root,'src/content/signature-transform.json'),JSON.stringify(value,null,2)+'\n');
   res.end(JSON.stringify({saved:true}));
  }catch(error){res.statusCode=400;res.end(JSON.stringify({error:error instanceof Error?error.message:'Could not save'}));}
 });}
};}
