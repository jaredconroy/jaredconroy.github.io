/** Shared rendered geometry; kept separate from the hot-reloaded SVG component. */
export const signatureMeasurements=new WeakMap<HTMLElement,{jPoints:[number,number][];jBottom:number;radius:number}>();
