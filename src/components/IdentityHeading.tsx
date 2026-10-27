import {useLayoutEffect,useRef} from 'preact/hooks';
import {JaredSignature} from './JaredSignature';
import {signatureMeasurements} from './signatureMeasurements';
import {textLineMetrics} from './textMetrics';
import brush from '../content/signature-brush.json';
import {INTRO_WORD_MS,INTRO_WORD_STEP_MS,INTRO_GREETING_START_MS} from '../features/landing/timing';

/** Shared geometry prevents the intro-to-carousel handoff from moving words. */
export function IdentityHeading({intro=false,reduced=false,taglineReady=true,onWritten,signatureDelay=0}:{intro?:boolean;reduced?:boolean;taglineReady?:boolean;onWritten?:()=>void;signatureDelay?:number}){
 const root=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{
  // The intro is a visual copy of the measured homepage heading. Independent
  // measurement during its scale animation would change its handoff geometry.
  if(intro)return;
  const heading=root.current,hello=heading?.querySelector<HTMLElement>('.hello'),svg=heading?.querySelector('svg'),tagline=heading?.querySelector<HTMLElement>('.identity-tagline');
  if(!heading||!hello||!svg||!tagline)return;
  let mounted=true;
  const setPixel=(name:string,value:number)=>{
   const previous=parseFloat(heading.style.getPropertyValue(name));
   if(!Number.isFinite(previous)||Math.abs(previous-value)>.02)heading.style.setProperty(name,`${value}px`);
  };
  const positionInkText=()=>{
   if(getComputedStyle(heading).getPropertyValue('--identity-layout').trim()==='inline')return;
   const signature=signatureMeasurements.get(heading);if(!signature)return;
   const word=tagline.querySelector<HTMLElement>('strong')!;
   const type=textLineMetrics(word);
   const baseline=type.baseline+(tagline.offsetHeight-type.lineHeight)/2;
   const aredBaseline=parseFloat(heading.style.getPropertyValue('--signature-word-baseline'));
   const targetBaseline=(signature.jBottom+(Number.isFinite(aredBaseline)?aredBaseline:signature.jBottom))/2;
   setPixel('--identity-tagline-top',targetBaseline-baseline+4);
   setPixel('--identity-tagline-baseline-offset',baseline);
   // Balance the greeting's visible lower/right edges against the nearby J curve.
   const greeting=textLineMetrics(hello,'Hi! I’m'),right=hello.offsetWidth;
   const inkTop=greeting.baseline-greeting.ascent,inkBottom=greeting.baseline+greeting.descent;
   const clearance=parseFloat(getComputedStyle(hello).fontSize)*.16;
   let best={top:0,score:Infinity,right:0,bottom:0};
   for(let top=0;top<signature.jBottom-inkBottom;top+=.25){
    let rightGap=Infinity,bottomGap=Infinity;
    for(const [x,y] of signature.jPoints){
     if(y>=top+inkTop&&y<=top+inkBottom&&x>=0)rightGap=Math.min(rightGap,x-right-signature.radius);
     if(x>=0&&x<=right&&y>=top+inkTop)bottomGap=Math.min(bottomGap,y-top-inkBottom-signature.radius);
    }
    if(rightGap<clearance||bottomGap<clearance||!Number.isFinite(rightGap+bottomGap))continue;
    const score=Math.abs(rightGap-bottomGap);
    if(score<best.score)best={top,score,right:rightGap,bottom:bottomGap};
   }
   if(Number.isFinite(best.score)){
    setPixel('--identity-hello-top',best.top);
    if(import.meta.env.DEV)heading.dataset.greetingClearance=JSON.stringify(best);
   }
  };
  const align=()=>{
   if(!mounted||!heading.clientWidth)return;
   const width=heading.clientWidth;
   const inline=getComputedStyle(heading).getPropertyValue('--identity-layout').trim()==='inline';
   const signatureWidth=width*(inline?.23:.58);
   const [viewX,viewY,viewWidth,viewHeight]=brush.viewBox;
   // Optical landmarks in Jared's original vector, independent of viewport size.
   const greetingAnchor=132,aAnchor=211,jSpacingAxis=152.5;
   const helloMeasure=heading.querySelector<HTMLElement>('.identity-hello-measure')!;
   const taglineMeasure=heading.querySelector<HTMLElement>('.identity-tagline-measure')!;
   const textRatio=(helloMeasure.offsetWidth+taglineMeasure.offsetWidth)/100;
   const placeComma=(left:number,drawnWidth:number,topOffset:number,size:number)=>{
    const context=document.createElement('canvas').getContext('2d');if(!context)return;
    context.font=`400 ${size}px ${getComputedStyle(hello).fontFamily}`;
    const metrics=context.measureText(',');
    const baseline=(hello.offsetHeight-(metrics.fontBoundingBoxAscent||size*.8)-(metrics.fontBoundingBoxDescent||size*.2))/2+(metrics.fontBoundingBoxAscent||size*.8);
    heading.style.setProperty('--signature-comma-left',`${left+drawnWidth+size*.05}px`);
    heading.style.setProperty('--signature-comma-top',`${(276-viewY)*drawnWidth/viewWidth+topOffset-baseline}px`);
   };
   if(inline){
    const gap=width*.012;
    const commaRatio=heading.querySelector<HTMLElement>('.identity-comma-measure')!.offsetWidth/100;
    const size=(width-signatureWidth-gap*3)/(textRatio+commaRatio);
    heading.style.setProperty('--role-size',`${size}px`);heading.parentElement?.style.setProperty('--role-size',`${size}px`);
    heading.style.setProperty('--identity-signature-width',`${signatureWidth}px`);
    heading.style.setProperty('--identity-height',`${signatureWidth*viewHeight/viewWidth}px`);
    heading.style.setProperty('--identity-signature-left',`${hello.offsetWidth+gap}px`);
    placeComma(hello.offsetWidth+gap,signatureWidth,0,size);
    const context=document.createElement('canvas').getContext('2d');
    if(context){
     const style=getComputedStyle(hello);context.font=`${style.fontWeight} ${size}px ${style.fontFamily}`;
     const metrics=context.measureText('Hi! I’m');
     const ascent=metrics.fontBoundingBoxAscent||size*.8,descent=metrics.fontBoundingBoxDescent||size*.2;
     const baseline=(hello.offsetHeight-ascent-descent)/2+ascent;
     const fallback=(276-viewY)*signatureWidth/viewWidth;
     heading.style.setProperty('--inline-text-top',`calc(var(--signature-word-baseline,${fallback}px) - ${baseline}px)`);
     tagline.style.top='var(--inline-text-top)';tagline.style.transform='none';
     heading.querySelector<HTMLElement>('.identity-comma')!.style.top='var(--inline-text-top)';
    }
    return;
   }
   const betweenLandmarks=(aAnchor-greetingAnchor)*signatureWidth/viewWidth;
   heading.querySelector<HTMLElement>('.identity-comma')!.style.removeProperty('top');
   const size=(width-betweenLandmarks)/textRatio;
   heading.style.setProperty('--role-size',`${size}px`);
   heading.parentElement?.style.setProperty('--role-size',`${size}px`);
   heading.style.setProperty('--identity-signature-width',`${signatureWidth}px`);
   heading.style.setProperty('--identity-height',`${signatureWidth*viewHeight/viewWidth}px`);
   // Center the J's facing edges (~150 beside the greeting, ~155 beside the
   // tagline) between the two text blocks, keeping their horizontal gaps equal.
   const textMidpoint=(hello.offsetWidth+width-tagline.offsetWidth)/2;
   const previousLeft=textMidpoint-(jSpacingAxis-viewX)*signatureWidth/viewWidth;
   const left=previousLeft-7;
   heading.style.setProperty('--identity-signature-left',`${left}px`);
   const centerSignature=getComputedStyle(heading).getPropertyValue('--center-signature').trim()==='yes';
   const drawnWidth=centerSignature?width-2*previousLeft:signatureWidth;
   heading.style.setProperty('--identity-signature-width',`${drawnWidth}px`);
   heading.style.setProperty('--identity-height',`${drawnWidth*viewHeight/viewWidth}px`);
   placeComma(left,drawnWidth,-8,size);
   tagline.style.removeProperty('top');tagline.style.transform='none';
   positionInkText();
  };
  heading.addEventListener('signature-geometry',positionInkText);
  align();const observer=new ResizeObserver(align);observer.observe(heading);observer.observe(hello);observer.observe(svg);
  window.addEventListener('resize',align);
  void document.fonts.ready.then(align);
  return()=>{mounted=false;observer.disconnect();window.removeEventListener('resize',align);heading.removeEventListener('signature-geometry',positionInkText);};
 },[]);
 return <div ref={root} class={`identity-heading ${intro?'intro-identity':''}`} style={{'--intro-word-duration':`${INTRO_WORD_MS}ms`,'--intro-word-step':`${INTRO_WORD_STEP_MS}ms`,'--intro-greeting-start':`${INTRO_GREETING_START_MS}ms`}}>
  <span class="identity-measures" aria-hidden="true"><span class="identity-measure-line identity-hello-measure"><span class="greeting-hi-text">Hi</span><span class="greeting-bang">!</span> I’m</span><span class="identity-measure-line identity-tagline-measure">a <strong>multidisciplinary</strong></span><span class="identity-measure-line identity-comma-measure">,</span></span>
  <span class={`hello ${intro?'intro-greeting':''}`}><span class="identity-word greeting-hi"><span class="greeting-hi-text">Hi</span><span class="greeting-bang">!</span></span>{' '}<span class="identity-word greeting-im">I’m</span></span>
  <div class="signature-slot"><h1 class="signature signature-real" aria-label="Jared"><JaredSignature animate={intro&&!reduced} delay={signatureDelay} speed={1.75} onWritten={onWritten}/></h1><span class={`identity-comma ${intro&&!taglineReady?'intro-comma-hidden':''}`} aria-hidden="true">,</span></div>
  <p class={`identity-tagline ${intro?(taglineReady?'intro-tagline-ready':'intro-tagline-hidden'):''}`}><span class="identity-word tagline-a">a</span>{' '}<strong class="identity-word multidisciplinary">multidisciplinary</strong></p>
 </div>;
}
