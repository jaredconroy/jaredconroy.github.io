import {useLayoutEffect,useRef,useState} from 'preact/hooks';
import spineLogo from '../../public/media/the-sleds/hover-ampersand3.svg?raw';

type PrintedLabel={src:string;ratio:number};

/** Crop actual ink rather than font line boxes or SVG artboard padding. */
function trimInk(canvas:HTMLCanvasElement){
 const context=canvas.getContext('2d',{willReadFrequently:true});
 if(!context)return null;
 const pixels=context.getImageData(0,0,canvas.width,canvas.height).data;
 let left=canvas.width,top=canvas.height,right=-1,bottom=-1;
 for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++)if(pixels[(y*canvas.width+x)*4+3]){
  left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
 }
 if(right<left||bottom<top)return null;
 const cropped=document.createElement('canvas');cropped.width=right-left+1;cropped.height=bottom-top+1;
 cropped.getContext('2d')?.drawImage(canvas,left,top,cropped.width,cropped.height,0,0,cropped.width,cropped.height);
 return cropped;
}

/** Printed artwork keeps text and logo centered together and non-selectable. */
export function RecordSpine({artist,title}:{artist:string;title:string}){
 const image=useRef<HTMLImageElement>(null);
 const [label,setLabel]=useState<PrintedLabel|null>(null);
 useLayoutEffect(()=>{
  let disposed=false,revision=0;
  const print=async()=>{
   if(disposed||!image.current)return;
   const current=++revision;
   const style=getComputedStyle(image.current),family=style.fontFamily,color=style.color;
   const text=(value:string,weight:number)=>{
    const canvas=document.createElement('canvas'),context=canvas.getContext('2d');
    if(!context)return null;
    const font=`${weight} 100px ${family}`;
    context.font=font;
    const bounds=context.measureText(value.toUpperCase());
    canvas.width=Math.ceil(bounds.actualBoundingBoxLeft+bounds.actualBoundingBoxRight)+8;
    canvas.height=Math.ceil(bounds.actualBoundingBoxAscent+bounds.actualBoundingBoxDescent)+8;
    context.font=font;context.fillStyle=color;
    context.fillText(value.toUpperCase(),bounds.actualBoundingBoxLeft+4,bounds.actualBoundingBoxAscent+4);
    return trimInk(canvas);
   };
   const artistInk=text(artist,700),titleInk=text(title,400);
   if(!artistInk||!titleInk)return;
   const logo=new Image();
   logo.src=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(spineLogo.replace(/#07a89d/gi,color))}`;
   try{await logo.decode();}catch{return;}
   if(disposed||current!==revision)return;
   const logoCanvas=document.createElement('canvas');logoCanvas.width=400;logoCanvas.height=400;
   logoCanvas.getContext('2d')?.drawImage(logo,0,0,400,400);
   const logoInk=trimInk(logoCanvas);
   if(!logoInk)return;
   const height=Math.max(artistInk.height,titleInk.height),gap=height*.9;
   // Condense the lettering, preserving the logo's original proportions.
   const parts=[artistInk,logoInk,titleInk].map((ink,index)=>({
    ink,width:ink.width/ink.height*height*(index===1?1.25:.72),height:height*(index===1?1.25:1)
   }));
   const canvas=document.createElement('canvas');
   canvas.width=Math.ceil(parts.reduce((sum,part)=>sum+part.width,0)+gap*2);canvas.height=Math.ceil(height*1.25);
   const context=canvas.getContext('2d');if(!context)return;
   let x=0;
   for(const part of parts){context.drawImage(part.ink,x,(canvas.height-part.height)/2,part.width,part.height);x+=part.width+gap;}
   setLabel({src:canvas.toDataURL('image/png'),ratio:canvas.width/canvas.height});
  };
  void print();void document.fonts.ready.then(print);
  document.fonts.addEventListener('loadingdone',print);
  return()=>{disposed=true;document.fonts.removeEventListener('loadingdone',print);};
 },[artist,title]);
 return <span class="record-spine" aria-hidden="true">
  <img ref={image} class="record-spine-label" src={label?.src} alt="" draggable={false} style={{'--spine-label-ratio':label?.ratio||1,visibility:label?'visible':'hidden'}}/>
 </span>;
}
