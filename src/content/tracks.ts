export interface Track {id:string; title:string; artist:string; src:string; projectId:string; section?:string; color:string; category?:string; artwork?:string; artworkPosition?:string; year?:number}
const base = import.meta.env.BASE_URL;
// Curated tracks only; the provider maintains a stable shuffled queue.
export const tracks:Track[] = [
  {id:'pretty-penny',title:'Pretty Penny',artist:'The Sleds',src:`${base}audio/pretty-penny.mp3`,projectId:'the-sleds',section:'music',color:'#b6d3e9',category:'Single',artwork:`${base}media/the-sleds/pretty-penny.webp`,year:2024},
  {id:'dirty-hearts',title:'Dirty Hearts & Restless Minds',artist:'The Sleds',src:`${base}audio/dirty-hearts-restless-minds.mp3`,projectId:'the-sleds',section:'music',color:'#b6d3e9',category:'Single',artwork:`${base}media/the-sleds/dirty-hearts.webp`,year:2026},
  {id:'foul-balls-theme',title:'“Foul Balls” Theme Song',artist:'Jared Conroy',src:`${base}audio/foul-balls-theme.mp3`,projectId:'foul-balls',color:'#9B7EA9',category:'Theme song',artwork:`${base}media/foul-balls/poster.webp`,artworkPosition:'center 65.333%',year:2026},
];
