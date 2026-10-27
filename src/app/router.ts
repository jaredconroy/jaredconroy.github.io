import {useEffect,useState} from 'preact/hooks';
export type Route = {kind:'home'} | {kind:'project';id:string;section?:string} | {kind:'game'} | {kind:'overlay';panel:'about'|'contact';background:string} | {kind:'missing'};
export function parseRoute(hash=location.hash):Route {
  const path=hash.replace(/^#/, '')||'/';
  if(path==='/')return {kind:'home'};
  if(path==='/play/afroman')return {kind:'game'};
  if(path==='/about'||path==='/contact')return {kind:'overlay',panel:path.slice(1) as 'about'|'contact',background:history.state?.background||'#/'};
  const match=path.match(/^\/work\/([a-z0-9-]+)(?:\/([a-z0-9-]+))?$/);
  return match?{kind:'project',id:match[1],section:match[2]}:{kind:'missing'};
}
export function useRoute(){const [route,setRoute]=useState(()=>parseRoute());useEffect(()=>{const update=()=>setRoute(parseRoute());addEventListener('hashchange',update);addEventListener('popstate',update);return()=>{removeEventListener('hashchange',update);removeEventListener('popstate',update);};},[]);return route;}
export function openPanel(panel:'about'|'contact'){
  history.pushState({background:location.hash||'#/',portfolioOverlay:true},'',`#/${panel}`);
  dispatchEvent(new PopStateEvent('popstate'));
}
export function closePanel(){if(history.state?.portfolioOverlay)history.back();else location.hash='/';}
