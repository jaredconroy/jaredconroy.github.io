export type RGB=[number,number,number];
export function readHex(color:string):RGB{
 const short=color.slice(1),hex=short.length===3?[...short].map(value=>value+value).join(''):short;
 return [0,2,4].map(offset=>parseInt(hex.slice(offset,offset+2),16)) as RGB;
}
export const colorCSS=(color:RGB)=>`rgb(${color.map(value=>Math.round(value)).join(',')})`;
export function tweenColor(start:RGB,target:RGB,progress:number):RGB{
 const eased=1-Math.pow(1-Math.max(0,Math.min(1,progress)),3);
 return start.map((value,index)=>value+(target[index]-value)*eased) as RGB;
}
