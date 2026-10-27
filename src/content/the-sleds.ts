const base=import.meta.env.BASE_URL;
export const sleds={
 photo:`${base}media/the-sleds/band-1600.webp`,
 photoSmall:`${base}media/the-sleds/band-960.webp`,
 photoAlt:'The Sleds seated together at Midway Cafe: Brandon Sullivan, Jared Conroy, Andrew Garrels, Chris Nicastro, and Andrew Ryan, from left to right.',
 caption:'Before the set · Midway Cafe, Jamaica Plain, Massachusetts · January 17, 2026',
 members:['Brandon Sullivan','Jared Conroy','Andrew Garrels','Chris Nicastro','Andrew Ryan'],
 linktree:'https://linktr.ee/thesleds',
 spotify:'https://open.spotify.com/artist/6cyzOU0fYEM1cQ6ZhwvHKJ',
 spotifyEmbed:'https://open.spotify.com/embed/artist/6cyzOU0fYEM1cQ6ZhwvHKJ?utm_source=generator&theme=0',
 videos:[
  {id:'uri_mHWI2tE',title:'Pretty Penny',url:'https://www.youtube.com/watch?v=uri_mHWI2tE',thumbnail:'https://i.ytimg.com/vi/uri_mHWI2tE/maxresdefault.jpg'},
  {id:'ksj1gUPax30',title:'Stuck',url:'https://www.youtube.com/watch?v=ksj1gUPax30',thumbnail:'https://i.ytimg.com/vi/ksj1gUPax30/maxresdefault.jpg'},
 ],
};

/** Release artwork and credits supplied by Jared; source masters stay local. */
export const sledsReleases=[
 {title:'Dirty Hearts & Restless Minds',image:'dirty-hearts',year:'2026',track:'dirty-hearts',credit:'Drums, backing vocals, additional second-verse lyrics, production decisions, and MIDI saxophone composition and articulation. Single artwork designed in September 2025.'},
 {title:'Pretty Penny',image:'pretty-penny',year:'2024',track:'pretty-penny',credit:'Lead and backing vocals, acoustic guitar, bridge writing, and production. Music-video concept, on-set and editing collaboration with director Peirc3, and performance as the singer and the robber.'},
 {title:'You Need This More Than I Do',image:'you-need-this-more',year:'2021',credit:'Our debut album, released July 16, 2021. Cover designed by Jared Conroy in June 2021; back cover designed in July 2021.'},
 {title:'Sixth Sense',image:'sixth-sense',year:'2021',credit:'Single artwork designed and illustrated by Jared Conroy, January 2021.'},
 {title:"Rock ’n’ Roll Romance",image:'rock-n-roll-romance',year:'2023',credit:'Single artwork designed by Jared Conroy, June 2023.'},
].map(release=>({...release,src:`${base}media/the-sleds/${release.image}.webp`}));
export const sledsAlbumCredits=`${base}media/the-sleds/album-credits.webp`;
