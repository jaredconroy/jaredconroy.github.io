import assets from './design-assets.json';
import {sledsReleases,sledsAlbumCredits} from './the-sleds';
const base=import.meta.env.BASE_URL;
export type DesignArtwork={title:string;caption:string;src:string;small?:string;width:number;height:number;year?:string;dark?:boolean;background?:string;sleeve?:{id:string;side:'front'|'back'}};
function sledAlbum(title:string):DesignArtwork{
 const release=sledsReleases.find(item=>item.title===title);
 if(!release)throw new Error(`Missing Sleds release artwork: ${title}`);
 return {title:release.title,caption:`The Sleds · ${release.year}`,year:release.year,src:release.src,width:1000,height:1000};
}
function art(file:keyof typeof assets,title:string,caption:string,dark=false):DesignArtwork{
 const background=file.startsWith('boots&cats/')?'#4555a5':file.startsWith('slimthick/')?'#0f75bc':file.startsWith('CTT/')?'#262262':dark?'#222326':undefined;
 const a=assets[file];return {title,caption,src:`${base}media/design/${a.file}.webp`,small:`${base}media/design/${a.file}-small.webp`,width:a.width,height:a.height,dark,background};
}
export const designSections:{id:string;title:string;description:string;items:DesignArtwork[]}[]=[
 {id:'identities',title:'Logos & Identities',description:'',items:[
 art('LNI/LNI-stack.png','Late Night Idle','Stacked band wordmark.',true),
 art('LNI/LNI-wide.png','Late Night Idle · horizontal','Single-line wordmark.',true),
 art('slimthick/big-logo.png','Slim Thick Sports','Custom logo for a comedic sports blog.',true),
 art('six-pack-w-jack.png','Six Pack with Jack','Commissioned podcast identity.'),
 ]},
 {id:'digital',title:'UI / UX Design & Development',description:'',items:[
 art('boots&cats/logo.png','Boots & Cats','A boot, a cat, and a music note: an identity for a songwriting app.',true),
 art('boots&cats/process.png','Boots & Cats · process','Exploring and refining the app’s visual identity.'),
 art('CTT/logo.png','Consumer Think Tank','Front-end design and development for a consumer idea platform.'),
 art('CTT/ui_mockup.png','Consumer Think Tank · interface','UI concept developed with creator Pat Conroy and a back-end engineer. An archived project.'),
 ]},
 {id:'covers',title:'Album Covers',description:'Artwork for my own music and releases by friends.',items:[
 sledAlbum('Dirty Hearts & Restless Minds'),
 sledAlbum('Rock ’n’ Roll Romance'),
 {...art('covers/monkey.JPEG','To Infinity…','Late Night Idle · 2024'),year:'2024'},
 sledAlbum('Sixth Sense'),
 {...sledAlbum('You Need This More Than I Do'),sleeve:{id:'you-need-this',side:'front'}},
 {title:'You Need This More Than I Do',caption:'The Sleds · back cover and credits',year:'2021',src:sledsAlbumCredits,width:1000,height:1000,sleeve:{id:'you-need-this',side:'back'}},
 {...art('covers/EP.png','EP','The New Hopefuls · 2018'),year:'2018'},
 {...art('covers/slacker.JPEG','Slacker','Sarang Mittal, Varun Shah, and Nathan Sears · 2025'),year:'2025'},
 sledAlbum('Pretty Penny'),
 {...art('covers/awol.JPEG','Heaven Sent / AWOL','The Sleds · 2025'),year:'2025'},
 ]},
 {id:'posters',title:'Promotional Flyers',description:'',items:[
 art('posters/jungle2.JPEG','Oops! All Covers!','The Jungle · concert flyer.'),
 art('posters/news1.png','News Cafe · space','Concert poster with a UFO illustration.'),
 art('posters/news2.png','News Cafe · carousel','Concert poster with a carousel illustration.'),
 art('posters/tavern.JPG','Tavern on the Hill','Bad Habits and The Sleds · concert poster.'),
 art('posters/bridge.png','Live at the Bridge','Concert poster.'),
 art('posters/DHRM-release.JPEG','Dirty Hearts & Restless Minds','The Sleds · single release promotion.'),
 ]},
 {id:'film',title:'Movie Posters & Thumbnails',description:'',items:[
 art('Phatboy/brookline-poster.png','The Brookline Brothers: Dad & Stepdad (2018)','Short-film poster.'),
 art('Phatboy/brookline-thumbnail.png','The Brookline Brothers · thumbnail','Video thumbnail.'),
 art('Phatboy/vendetta-poster.png','Brookline Vendetta — Act One (2019)','Short-film poster.'),
 art('Phatboy/vendetta-thumbnail.png','Brookline Vendetta — Act 1 · thumbnail','Video thumbnail.'),
 art('Phatboy/vendetta2-poster.png','Brookline Vendetta — Act Two (2019)','Short-film poster.'),
 art('Phatboy/vendetta2-thumbnail.png','Brookline Vendetta — Act 2 · thumbnail','Video thumbnail.'),
 ]},
];
const chapterOrder=[
 {id:'identities',indexTitle:'Logos'},
 {id:'covers',indexTitle:'Albums'},
 {id:'digital',indexTitle:'UI / UX'},
 {id:'film',indexTitle:'Movies'},
 {id:'posters',indexTitle:'Flyers'},
] as const;
export const designChapters=chapterOrder.map(chapter=>({...chapter,title:designSections.find(section=>section.id===chapter.id)!.title}));
const logos=designSections[0].items,digital=designSections[1].items,film=designSections[4].items;
export const designIdentities=[
 {kind:'lni',name:'Late Night Idle',detail:'I transformed the band’s chosen font into custom lettering and a distinctive wordmark. The comparison shows the original type alongside the finished lettering.',background:'#222326',items:[logos[0],{title:'Late Night Idle · before & after',caption:'The band’s original font, reworked into custom typography and a wordmark.',src:`${base}media/design/lni-before-after.svg?layout=compact-v2`,width:3512.264,height:408.149,background:'#222326'} as DesignArtwork]},
 {kind:'ctt',name:'Consumer Think Tank',detail:'An identity for a platform built around consumer ideas.',background:'#262262',items:[digital[2]]},
 {kind:'six-pack',name:'Six Pack with Jack',detail:'Commissioned podcast identity.',background:'#efe4d5',items:[logos[3]]},
 {kind:'slim',name:'Slim Thick Sports',detail:'A custom logo and wordmark for a comedic sports blog.',background:'#0f75bc',items:[logos[2]]},
 {kind:'boots',name:'Boots & Cats',detail:'A boot, a cat, a music note. Logo explorations lead to an identity for a songwriting app.',background:'#4555a5',items:[digital[0]]},
];
// Homepage printshop composition: six fixed plates, varied in scale.
export const designPreview=[
 designIdentities[0].items[0],designIdentities[0].items[1],
 designIdentities[3].items[0],designSections.find(section=>section.id==='covers')!.items[0],
 designSections.find(section=>section.id==='posters')!.items[1],designIdentities[4].items[0],
];
export const designProcess=digital[1];
export const designInterface=digital[3];
export const designFilms=[
 {name:'Brookline Brothers',subtitle:'Dad & Stepdad',year:2018,color:'#133b62',poster:film[0],thumbnail:null,thumbnailFirst:false},
 {name:'Brookline Vendetta',subtitle:'Act One',year:2019,color:'#a9202b',poster:film[2],thumbnail:film[3],thumbnailFirst:false},
 {name:'Brookline Vendetta',subtitle:'Act Two',year:2019,color:'#0876ac',poster:film[4],thumbnail:film[5],thumbnailFirst:true},
];
