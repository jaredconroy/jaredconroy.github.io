import manifest from './illustration-assets.json';
export type IllustrationArtwork={
 id:string;collection:string;title:string;alt:string;caption:string;
 src:string;small:string;width:number;height:number;background:string;transparent:boolean;
};
const base=import.meta.env.BASE_URL;
export const illustrations:IllustrationArtwork[]=manifest.map(item=>({...item,src:`${base}${item.src}`,small:`${base}${item.small}`}));
export const standaloneIllustrations=illustrations.filter(item=>item.collection==='illustration');
export const foulBallsIllustrations=illustrations.filter(item=>item.collection==='foul-balls');
const previewOrder=['illustration-boone','illustration-dog','illustration-golfer','illustration-angry','foul-balls-poster','illustration-newhopes','illustration-speech'];
export const illustrationPreview=[...previewOrder.map(id=>illustrations.find(item=>item.id===id)).filter((item):item is IllustrationArtwork=>Boolean(item)),...illustrations.filter(item=>!previewOrder.includes(item.id))];
