export type ChainToken={id:string;text:string;kind:'role'|'amp';primary?:'first'|'last'};

/** Keep one separator between every role; the original two remain the bookends. */
export function compactRoleChain(pair:readonly [string,string],extra:readonly string[]){
 const roles=[pair[0],...[...new Set(extra)].filter(role=>!pair.includes(role)),pair[1]];
 const tokens:ChainToken[]=roles.flatMap((text,index)=>[
  {id:`role-${index}`,text,kind:'role' as const,...(index===0?{primary:'first' as const}:index===roles.length-1?{primary:'last' as const}:{})},
  ...(index<roles.length-1?[{id:`amp-${index}`,text:'&',kind:'amp' as const}]:[])
 ]);
 // A wrapped row starts with its separator, never a stranded role.
 const groups=[tokens.slice(0,1),...roles.slice(1).map((_,index)=>tokens.slice(index*2+1,index*2+3))];
 return {tokens,groups,additions:tokens.filter(token=>!token.primary&&token.id!=='amp-0')};
}

export const CHAIN_SHRINK_MS=200;
export const CHAIN_SLIDE_MS=220;
export const CHAIN_STEP_MS=85;
export const CHAIN_EXIT_STEP_MS=35;
export const CHAIN_POP_MS=180;
export const chainExitMs=(count:number)=>Math.max(0,count-1)*CHAIN_EXIT_STEP_MS+160;

/** Prefer a single readable line; longer lists get two lines at 18–22px. */
export function chainFontSize(width:number,naturalWidthAt100:number){
 const oneLine=width/naturalWidthAt100*100*.985; // Leave room for font hinting/subpixel rounding.
 return oneLine>=18?Math.min(22,oneLine):width<680?18:22;
}

/** Greedy phrase wrapping, then equal gutters between every visible token. */
export function justifyChainRows(groups:readonly (readonly ChainToken[])[],widths:ReadonlyMap<string,number>,width:number,minGap:number){
 const rows:ChainToken[][]=[];
 let row:ChainToken[]=[],used=0;
 for(const group of groups){
  const groupWidth=group.reduce((sum,token)=>sum+(widths.get(token.id)||0),0)+minGap*(group.length-1);
  if(row.length&&used+minGap+groupWidth>width+.01){rows.push(row);row=[];used=0;}
  used+=(row.length?minGap:0)+groupWidth;row.push(...group);
 }
 if(row.length)rows.push(row);
 const positions=new Map<string,{x:number;row:number}>();
 rows.forEach((tokens,rowIndex)=>{
  const ink=tokens.reduce((sum,token)=>sum+(widths.get(token.id)||0),0);
  const gap=tokens.length>1?(width-ink)/(tokens.length-1):0;
  let x=0;
  tokens.forEach(token=>{positions.set(token.id,{x,row:rowIndex});x+=(widths.get(token.id)||0)+gap;});
 });
 return {rows,positions};
}
