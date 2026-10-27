/** Font baselines and visible ink, independent of descenders and CSS transforms. */
export function textLineMetrics(element:HTMLElement,text=element.textContent||'Hg'){
 const style=getComputedStyle(element),size=parseFloat(style.fontSize);
 const context=document.createElement('canvas').getContext('2d')!;
 context.font=`${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
 const metrics=context.measureText(text),lineHeight=parseFloat(style.lineHeight)||size*1.08;
 const ascent=metrics.fontBoundingBoxAscent||size*.8,descent=metrics.fontBoundingBoxDescent||size*.2;
 return {baseline:(lineHeight-ascent-descent)/2+ascent,lineHeight,ascent:metrics.actualBoundingBoxAscent,descent:metrics.actualBoundingBoxDescent};
}
