export interface Project {
  id: string; title: string; indexTitle: string; category: string; subtitle?:string;
  roles: [string, string]; expandedRoles: string[]; description: string;
  theme: {background:string; text:string; accent:string; accentText?:string; playerBackground?:string};
  color: string; ink: string; media: 'cover' | 'band' | 'game' | 'design' | 'illustration';
}
export const baseTheme:Project['theme']={background:'#ffffff',text:'#173458',accent:'#88281d',accentText:'#88281d'};
export const projects: Project[] = [
  {id:'foul-balls',theme:{background:'#f7f0e7',text:'#30243d',accent:'#846393',playerBackground:'#846393'},title:'Foul Balls',indexTitle:'Foul Balls',category:'An animated series',subtitle:'An original animated series',roles:['Screenwriter','Illustrator'],expandedRoles:['Creator','Character Designer','Creative Producer','Composer','Voice Actor','Animator'],description:'A world of characters. A whole different ball game.',color:'#9B7EA9',ink:'#30243d',media:'cover'},
  {id:'the-sleds',theme:{background:'#66534b',text:'#ffffff',accent:'#b6d3e9',playerBackground:'#b6d3e9'},title:'The Sleds',indexTitle:'The Sleds',category:'Music & moving pictures',subtitle:"Rock ’n’ roll band outta Boston",roles:['Creative Director','Lead Singer'],expandedRoles:['Performing Artist','Music Video Director','Songwriter'],description:'On the microphone. Behind the vision.',color:'#b6d3e9',ink:'#19364d',media:'band'},
  {id:'afroman',theme:{background:'#25282c',text:'#f5f0e7',accent:'#ef8216',accentText:'#ef8216',playerBackground:'#000000'},title:'Afroman',indexTitle:'Afroman',category:'An independent browser game',subtitle:'An independent browser game',roles:['Software Developer','Game Designer'],expandedRoles:['Illustrator','Animator','Audio Engineer'],description:'Made in 2014. Recovered, reworked, and rebuilt for the browser in 2026.',color:'#ef8216',ink:'#f5f0e7',media:'game'},
  {id:'design',theme:{...baseTheme,text:baseTheme.text,accent:'#008477',accentText:'#008477',playerBackground:'#008477'},title:'Graphic Design',indexTitle:'Graphic Design',category:'Identity & visual communication',roles:['Graphic Designer','Art Director'],expandedRoles:['Logo Designer','Brand Designer'],description:'Distinct identities. Ideas with a shape of their own.',color:'#eceae5',ink:baseTheme.text,media:'design'},
  {id:'illustration',theme:{...baseTheme,background:'#edf5fb',playerBackground:'#173458'},title:'Illustration',indexTitle:'Illustration',category:'Characters & other curiosities',roles:['Character Designer','Illustrator'],expandedRoles:['Cartoonist','Visual Storyteller'],description:'Personality, put on paper.',color:'#eee9e1',ink:'#173458',media:'illustration'},
];
export const projectRoute = (id: string) => `#/work/${id}`;
