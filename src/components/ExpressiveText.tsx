import ampersand from '../content/afroman-ampersand.json';

/** Keep expressive ampersands in editorial headings, outside navigation labels. */
export function ExpressiveText({text,tight=false,centered=false,conventionalU=false}:{text:string;tight?:boolean;centered?:boolean;conventionalU?:boolean}){
 const copy=tight?text.replace(/\s*&\s*/g,'&'):text;
 return <>{copy.split(/(&|U)/).map((part,index)=>part==='&'?<span class={`expressive-ampersand${tight?' is-tight':''}${centered?' is-centered':''}`} key={index}>{tight||centered?<><span class="sr-only"> &amp; </span><svg viewBox="49.07 137.22 1759.59 1633.98" aria-hidden="true"><path d={ampersand.path}/></svg></>:<>&amp;</>}</span>:part==='U'&&conventionalU?<span class="expressive-conventional-u" key={index}>{part}</span>:part)}</>;
}
