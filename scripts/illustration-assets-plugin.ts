import {execFileSync} from 'node:child_process';
import {existsSync,readdirSync} from 'node:fs';
import {resolve,relative} from 'node:path';
import type {Plugin} from 'vite';

/** Local authoring convenience; published builds use the checked-in exports. */
export function illustrationAssetsPlugin():Plugin{
 let root='';
 const image=/\.(png|jpe?g|webp|avif|svg)$/i;
 const hasMasters=(folder:string):boolean=>existsSync(folder)&&readdirSync(folder,{withFileTypes:true}).some(entry=>entry.isDirectory()?hasMasters(resolve(folder,entry.name)):image.test(entry.name));
 const refresh=()=>{
  if(!['illustration','foul-balls'].some(name=>hasMasters(resolve(root,'assets-source',name))))return;
  execFileSync(process.env.PORTFOLIO_PYTHON||'python3',[resolve(root,'scripts/import-illustrations.py')],{cwd:root,stdio:'pipe'});
 };
 return {name:'portfolio-illustration-assets',
  configResolved(config){root=config.root;},
  buildStart(){refresh();},
  configureServer(server){
   const folders=['illustration','foul-balls'].map(name=>resolve(root,'assets-source',name));
   const details=resolve(root,'src/content/illustration-details.json');
   server.watcher.add([...folders,details]);
   let timer:ReturnType<typeof setTimeout>|undefined;
   const changed=(file:string)=>{
    const name=relative(root,file).replaceAll('\\','/');
    if(file!==details&&!( /^assets-source\/(illustration|foul-balls)\//.test(name)&&image.test(name)))return;
    clearTimeout(timer);timer=setTimeout(()=>{try{refresh();}catch(error){server.config.logger.error(`Illustration import failed: ${error instanceof Error?error.message:String(error)}`);}},250);
   };
   server.watcher.on('add',changed).on('change',changed).on('unlink',changed);
   server.httpServer?.once('close',()=>{clearTimeout(timer);server.watcher.off('add',changed).off('change',changed).off('unlink',changed);});
  }
 };
}
