const media=new URL('../../media/',location.href);
const design=(file,title,background)=>({src:`design/${file}`,title,background});
const d={lni:design('lni-lni-stack-small.webp','Late Night Idle','#222326'),comparison:design('lni-before-after.svg','Late Night Idle — Custom Lettering','#222326'),slim:design('slimthick-big-logo-small.webp','Slim Thick Sports','#0f75bc'),boots:design('boots-cats-logo-small.webp','Boots & Cats','#4555a5'),ctt:design('ctt-logo-small.webp','Consumer Think Tank','#262262'),album:{src:'the-sleds/dirty-hearts.webp',title:'Dirty Hearts & Restless Minds',background:'#173458'},flier:design('posters-news1-small.webp','News Cafe Show Flier','#173458')};
const all=await fetch(new URL('illustration/gallery.json',media)).then(response=>response.json());
const art=name=>{const a=all.find(item=>item.id===name);return {...a,src:a.small||a.src};};
const a={boone:art('illustration-boone'),dog:art('illustration-dog'),golfer:art('illustration-golfer'),angry:art('illustration-angry'),speech:art('illustration-speech'),newhopes:art('illustration-newhopes'),poster:art('foul-balls-poster')};
const groups={design:[
 {id:'print-wall',title:'Printshop Wall',recommended:true,description:'An asymmetric, edge-to-edge wall of logos, lettering, album art, and posters. Six pieces, varied scale, branded color blocks.',items:[d.lni,d.comparison,d.slim,d.album,d.flier,d.boots]},
 {id:'proofs',title:'Overlapping Proofs',description:'A pile of physical design proofs. Tilted, overlapping pieces create depth and make the frame feel like a working art director’s desk.',items:[d.lni,d.slim,d.album,d.ctt,d.flier,d.boots]},
 {id:'drawer',title:'Specimen Drawer',description:'Six compact plates arranged in offset columns. A slow alternating drift on hover adds movement while keeping several identities visible.',items:[d.lni,d.album,d.ctt,d.boots,d.flier,d.slim]}
],illustration:[
 {id:'sketchbook',title:'Sketchbook Spread',recommended:true,description:'A large character on one page, two expressive sketches on the other. A subtle center fold ties the preview to the handmade signature.',items:[a.dog,a.golfer,a.speech]},
 {id:'cast',title:'Character Cast',description:'A playful, overlapping lineup. Two tall characters anchor the frame, with close-ups at the edge to show a range of expressions.',items:[a.boone,a.dog,a.golfer,a.angry]},
 {id:'comic',title:'Comic Panels',description:'A bold, tightly packed comic-page composition. Four studies sit beside the complete Foul Balls poster, with maroon gutters holding it together.',items:[a.angry,a.speech,a.golfer,a.newhopes,a.poster]}
]};
let shortlist={};try{shortlist=JSON.parse(localStorage.getItem('portfolio-preview-shortlist')||'{}');}catch{}
for(const [project,options] of Object.entries(groups)){
 const container=document.getElementById(`${project}-options`);
 for(const option of options){
  const card=document.createElement('article');card.className='option';
  const frame=document.createElement('div');frame.className=`frame ${option.id}`;
  for(const artwork of option.items){const tile=document.createElement('div');tile.className='tile';tile.style.background=artwork.background;const img=document.createElement('img');img.src=new URL(artwork.src.replace(/^media\//,''),media);img.alt=artwork.alt||artwork.title;img.loading='lazy';tile.append(img);frame.append(tile);}
  const heading=document.createElement('h3');heading.textContent=option.title;
  if(option.recommended){const tag=document.createElement('span');tag.className='recommended';tag.textContent='MY PICK';heading.append(tag);}
  const description=document.createElement('p');description.textContent=option.description;
  const button=document.createElement('button');button.type='button';button.dataset.option=option.id;button.setAttribute('aria-pressed',String(shortlist[project]===option.id));button.textContent=shortlist[project]===option.id?'Shortlisted ✓':'Shortlist';
  button.addEventListener('click',()=>{shortlist[project]=option.id;localStorage.setItem('portfolio-preview-shortlist',JSON.stringify(shortlist));for(const other of container.querySelectorAll('button')){const chosen=other.dataset.option===option.id;other.setAttribute('aria-pressed',String(chosen));other.textContent=chosen?'Shortlisted ✓':'Shortlist';}});
  card.append(frame,heading,description,button);container.append(card);
 }
}
