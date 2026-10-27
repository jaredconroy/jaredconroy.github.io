/** Accessible names stay on the button/link; visual letters are presentation only. */
export function NavigationLabel({label,letters}:{label:string;letters:boolean[]}){
 const chars=Array.from(label);
 const text=(letter:string)=>letter;
 return <>
  <span class="project-nav-measures" aria-hidden="true">{['regular','bold'].map(weight=><span class={`project-nav-sizer project-nav-sizer-${weight}`} key={weight}>{chars.map((letter,j)=><span class={letter===' '?'project-letter-space':''} key={j}>{text(letter)}</span>)}</span>)}</span>
  <span class="project-nav-label" aria-hidden="true">{chars.map((letter,j)=><span key={j} class={letter===' '?'project-letter-space':`project-letter ${letters[j]?'is-bold':''}`}>{text(letter)}</span>)}</span>
 </>;
}
