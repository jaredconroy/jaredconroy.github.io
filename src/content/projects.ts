import {AFROMAN_ORANGE,FOUL_BALLS_BASEBALL,FOUL_BALLS_INK,FOUL_BALLS_PURPLE,GRAPHIC_DESIGN_TEAL,ILLUSTRATION_MAROON,SLEDS_BLUE} from './palette';
export interface Project {
  id: string; title: string; indexTitle: string; category: string; subtitle?:string;
  roles: [string, string]; expandedRoles: string[]; description: string;
  theme: {background:string; text:string; accent:string; accentText?:string; playerBackground?:string};
  color: string; ink: string; media: 'cover' | 'band' | 'game' | 'design' | 'illustration';
}
export const baseTheme:Project['theme']={background:'#ffffff',text:'#173458',accent:ILLUSTRATION_MAROON,accentText:ILLUSTRATION_MAROON};
export const projects: Project[] = [
  {id:'foul-balls',theme:{background:FOUL_BALLS_BASEBALL,text:FOUL_BALLS_INK,accent:FOUL_BALLS_PURPLE,playerBackground:FOUL_BALLS_PURPLE},title:'Foul Balls',indexTitle:'Foul Balls',category:'An animated series',subtitle:'An original animated series',roles:['Screenwriter','Illustrator'],expandedRoles:['Creator','Character Designer','Creative Producer','Composer','Voice Actor','Animator'],description:'',color:FOUL_BALLS_PURPLE,ink:FOUL_BALLS_INK,media:'cover'},
  {id:'the-sleds',theme:{background:'#66534b',text:'#ffffff',accent:SLEDS_BLUE,playerBackground:SLEDS_BLUE},title:'The Sleds',indexTitle:'The Sleds',category:'Music & moving pictures',subtitle:"Rock ’n’ roll band outta Boston",roles:['Creative Director','Lead Singer'],expandedRoles:['Performing Artist','Music Video Director','Songwriter'],description:'On the microphone. Behind the vision.',color:SLEDS_BLUE,ink:'#19364d',media:'band'},
  {id:'afroman',theme:{background:'#25282c',text:'#f5f0e7',accent:AFROMAN_ORANGE,accentText:AFROMAN_ORANGE,playerBackground:'#000000'},title:'Afroman',indexTitle:'Afroman',category:'An independent browser game',subtitle:'An independent browser game',roles:['Software Developer','Game Designer'],expandedRoles:['Illustrator','Animator','Audio Engineer'],description:'Made in 2014. Recovered, reworked, and rebuilt for the browser in 2026.',color:AFROMAN_ORANGE,ink:'#f5f0e7',media:'game'},
  {id:'design',theme:{...baseTheme,text:baseTheme.text,accent:GRAPHIC_DESIGN_TEAL,accentText:GRAPHIC_DESIGN_TEAL,playerBackground:GRAPHIC_DESIGN_TEAL},title:'Graphic Design',indexTitle:'Graphic Design',category:'Identity & visual communication',roles:['Graphic Designer','Art Director'],expandedRoles:['Logo Designer','Brand Designer'],description:'Distinct identities. Ideas with a shape of their own.',color:'#eceae5',ink:baseTheme.text,media:'design'},
  {id:'illustration',theme:{...baseTheme,background:'#dcebf6',playerBackground:'#173458'},title:'Illustration',indexTitle:'Illustration',category:'Characters & other curiosities',roles:['Character Designer','Illustrator'],expandedRoles:['Cartoonist','Visual Storyteller'],description:'Personality, put on paper.',color:'#eee9e1',ink:'#173458',media:'illustration'},
];
export const projectRoute = (id: string) => `#/work/${id}`;
