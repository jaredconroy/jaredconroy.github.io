import {useLayoutEffect,useRef} from 'preact/hooks';
import {compactRoleChain,justifyChainRows,chainFontSize,chainExitMs,CHAIN_SHRINK_MS,CHAIN_SLIDE_MS,CHAIN_STEP_MS,CHAIN_EXIT_STEP_MS,CHAIN_POP_MS} from './roleChainLayout';

/** Measures a wrapping sentence, while the original pair and ampersand animate in place. */
export function CompactRoleChain({pair,extra}:{pair:readonly [string,string];extra:readonly string[]}){
 const root=useRef<HTMLDivElement>(null),natural=useRef<HTMLDivElement>(null),layout=useRef<HTMLDivElement>(null);
 const chain=compactRoleChain(pair,extra),extraKey=extra.join('\0');
 useLayoutEffect(()=>{
  const element=root.current,reference=natural.current,flow=layout.current;
  const system=element?.closest<HTMLElement>('.role-system');
  const amp=system?.querySelector<HTMLElement>('.ampersand');
  if(!element||!reference||!flow||!system||!amp)return;
  let mounted=true;
  const set=(target:HTMLElement,name:string,value:string)=>{if(target.style.getPropertyValue(name)!==value)target.style.setProperty(name,value);};
  const arrange=()=>{
   if(!mounted||getComputedStyle(system).getPropertyValue('--descriptor-layout').trim()!=='inline'||!system.clientWidth)return;
   const labels=[...system.querySelectorAll<HTMLElement>('.role-pair>.role .role-label')];
   if(labels.length!==2)return;
   const context=document.createElement('canvas').getContext('2d');if(!context)return;
   const textStyle=getComputedStyle(labels[0]),ampStyle=getComputedStyle(amp);
   context.font=`600 100px ${textStyle.fontFamily}`;
   const textHeight=Math.max(...chain.tokens.filter(token=>token.kind==='role').map(token=>{const m=context.measureText(token.text);return m.actualBoundingBoxAscent+m.actualBoundingBoxDescent;}));
   context.font=`${ampStyle.fontWeight} 100px ${ampStyle.fontFamily}`;
   const mark=context.measureText('&'),ampHeight=mark.actualBoundingBoxAscent+mark.actualBoundingBoxDescent;
   const ampRatio=textHeight*1.5/ampHeight;
   set(element,'--chain-amp-ratio',String(ampRatio));
   set(element,'--chain-amp-opsz',String(Math.max(9,Math.min(144,parseFloat(ampStyle.fontSize)))));
   set(system,'--chain-close-delay',`${chainExitMs(chain.additions.length)}ms`);
   const width=parseFloat(getComputedStyle(system).width);
   let size=chainFontSize(width,reference.getBoundingClientRect().width);
   set(element,'--chain-type-size',`${size}px`);
   const slots=()=>[...flow.querySelectorAll<HTMLElement>('[data-chain-slot]')];
   const measure=()=>new Map(slots().map(slot=>[slot.dataset.chainSlot!,slot.getBoundingClientRect().width]));
   let widths=measure(),packed=justifyChainRows(chain.groups,widths,width,size*.25);
   while(size>18&&packed.rows.length>2){
    size=Math.max(18,size-1);set(element,'--chain-type-size',`${size}px`);
    widths=measure();packed=justifyChainRows(chain.groups,widths,width,size*.25);
   }
   set(system,'--extra-role-size',`${size}px`);
   labels.forEach(label=>set(label,'--role-shrink',String(size/parseFloat(getComputedStyle(label).fontSize))));
   const rowHeight=Math.max(...slots().map(slot=>slot.getBoundingClientRect().height));
   const center=system.querySelector<HTMLElement>('.role-pair')!.offsetHeight/2;
   const stride=rowHeight+size*.3;
   const moving=packed.positions.get('amp-0')!,last=packed.positions.get(chain.tokens.at(-1)!.id)!;
   set(system,'--chain-amp-x',`${moving.x+widths.get('amp-0')!/2}px`);
   set(system,'--chain-amp-scale',String(size*ampRatio/parseFloat(ampStyle.fontSize)));
   set(system,'--chain-last-y',`${last.row*stride}px`);
   for(const token of chain.additions){
    const position=packed.positions.get(token.id)!,slot=slots().find(slot=>slot.dataset.chainSlot===token.id)!;
    const target=element.querySelector<HTMLElement>(`[data-chain-token="${token.id}"]`)!;
    set(target,'--chain-x',`${position.x}px`);
    set(target,'--chain-y',`${center+position.row*stride-slot.getBoundingClientRect().height/2}px`);
   }
   if(import.meta.env.DEV){system.dataset.chainRows=String(packed.rows.length);system.dataset.chainFont=String(size);system.dataset.chainAmpRatio=String(ampRatio);}
  };
  arrange();
  const observer=new ResizeObserver(arrange);observer.observe(system);observer.observe(reference);observer.observe(flow);
  system.querySelectorAll('.role-pair>.role .role-label').forEach(label=>observer.observe(label));
  void document.fonts.ready.then(arrange);window.addEventListener('resize',arrange);
  return()=>{mounted=false;observer.disconnect();window.removeEventListener('resize',arrange);};
 },[pair[0],pair[1],extraKey]);
 const groups=()=>chain.groups.map((group,index)=><span class={`chain-group ${index===chain.groups.length-1?'chain-bookend':''}`} key={group[0].id}>{group.map(token=><span class={`chain-${token.kind}`} data-chain-slot={token.id} key={token.id}>{token.text}</span>)}</span>);
 return <div ref={root} class="compact-role-chain" style={{'--chain-enter-start':`${CHAIN_SHRINK_MS+CHAIN_SLIDE_MS}ms`,'--chain-step':`${CHAIN_STEP_MS}ms`,'--chain-exit-step':`${CHAIN_EXIT_STEP_MS}ms`,'--chain-exit-time':`${chainExitMs(chain.additions.length)}ms`,'--chain-pop':`${CHAIN_POP_MS}ms`}}>
  <div class="chain-measures" aria-hidden="true">
   <div ref={natural} class="chain-natural">{groups()}</div>
   <div ref={layout} class="chain-layout">{groups()}</div>
  </div>
  {chain.additions.map((token,index)=><span key={token.id} class={`chain-token chain-${token.kind}`} data-chain-token={token.id} aria-hidden={token.kind==='amp'?true:undefined} style={{'--chain-order':index,'--chain-exit-order':chain.additions.length-1-index}}>{token.text}</span>)}
 </div>;
}
