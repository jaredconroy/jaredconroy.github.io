const base=import.meta.env.BASE_URL;
export const afroman={
 titleImage:`${base}media/afroman/title.jpg`,
 gameUrl:`${base}games/afroman/index.html`,
 levels:[
  {number:'01',title:'Find The Stage',image:`${base}media/afroman/level-1.png`,description:'A side-scrolling platformer: explore, climb, and make it to the concert before time runs out.'},
  {number:'02',title:'Keep The Beat',image:`${base}media/afroman/level-2.png`,description:'Play the drum kit in a rhythm challenge, with seven keys and timing tied to the music.'},
  {number:'03',title:'Find Your Way',image:`${base}media/afroman/level-3.png`,description:'Navigate a maze against the clock. The browser version leaves a trail so you can see where you’ve been.'}
 ]
};
