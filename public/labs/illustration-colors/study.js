const C={navy:'#173458',maroon:'#7D2020',blue:'#DCEBF6',peach:'#DF9B6D',coral:'#F87575',white:'#FFFFFF'};
const preset=(id,name,note,changes={})=>({id,name,note,page:C.blue,text:C.navy,bar:C.white,nav:C.navy,logo:C.maroon,accent:C.maroon,caption:C.white,player:C.navy,playerInk:C.blue,...changes});
const palettes=[
 preset('current','Current palette','The starting point'),
 preset('peach-header','Peach topbar','Warm header, cool page',{bar:C.peach}),
 preset('coral-header','Coral topbar','A brighter first impression',{bar:C.coral}),
 preset('peach-accent','Peach accents','A softer signature and title panel',{bar:C.peach,accent:C.peach,caption:C.navy}),
 preset('coral-accent','Coral accents','A playful signature and title panel',{bar:C.coral,accent:C.coral,caption:C.navy}),
 preset('peach-page','Peach paper','Peach page, pale blue header',{page:C.peach,bar:C.blue}),
 preset('coral-page','Coral paper','Coral page, pale blue header',{page:C.coral,bar:C.blue}),
 preset('navy-peach','Navy + peach','A quiet dark canvas with warm accents',{page:C.navy,text:C.blue,bar:C.peach,accent:C.peach,caption:C.navy,player:C.blue,playerInk:C.navy}),
 preset('navy-coral','Navy + coral','A dark canvas with brighter accents',{page:C.navy,text:C.blue,bar:C.coral,accent:C.coral,caption:C.navy,player:C.blue,playerInk:C.navy}),
 preset('maroon-peach','Maroon + peach','The robe color becomes the canvas',{page:C.maroon,text:C.blue,bar:C.blue,accent:C.peach,caption:C.navy}),
 preset('blue-all-five','All five / blue','Blue page, peach header, coral player',{bar:C.peach,player:C.coral,playerInk:C.navy}),
 preset('peach-all-five','All five / peach','Peach page, blue header, coral player',{page:C.peach,bar:C.blue,player:C.coral,playerInk:C.navy}),
];
const key='portfolio-illustration-palette-shortlist';
let shortlist=new Set();try{shortlist=new Set(JSON.parse(localStorage.getItem(key)||'[]'));}catch{}
let selected=0,onlyShortlist=false;
const options=document.querySelector('#options'),frame=document.querySelector('#page-preview');
const number=i=>String(i+1).padStart(2,'0');
const assignments=p=>[['Page',p.page],['Topbar',p.bar],['Accent',p.accent],['Player',p.player]].map(([label,color])=>`<span class="assignment"><i style="background:${color}" aria-hidden="true"></i>${label} ${color}</span>`).join('');
function persist(){try{localStorage.setItem(key,JSON.stringify([...shortlist]));}catch{}}
function sync(){
 document.querySelector('#shortlist-count').textContent=shortlist.size;
 document.querySelector('#shortlist-filter').setAttribute('aria-pressed',String(onlyShortlist));
 let visible=0;
 palettes.forEach((p,i)=>{const card=options.children[i];card.hidden=onlyShortlist&&!shortlist.has(p.id);if(!card.hidden)visible++;card.dataset.selected=String(i===selected);const button=card.querySelector('.shortlist');button.setAttribute('aria-pressed',String(shortlist.has(p.id)));button.textContent=shortlist.has(p.id)?'Shortlisted ✓':'Shortlist';});
 document.querySelector('#empty').hidden=visible>0;
 document.querySelector('#count').textContent=`${visible} combination${visible===1?'':'s'}`;
 const active=shortlist.has(palettes[selected].id),button=document.querySelector('#preview-shortlist');button.setAttribute('aria-pressed',String(active));button.textContent=active?'Shortlisted ✓':'Shortlist';
}
function toggleShortlist(index){const id=palettes[index].id;shortlist.has(id)?shortlist.delete(id):shortlist.add(id);persist();sync();}
function applyPreview(){
 const doc=frame.contentDocument;if(!doc?.querySelector('.app-shell'))return false;
 const p=palettes[selected];let style=doc.getElementById('illustration-palette-study');
 if(!style){style=doc.createElement('style');style.id='illustration-palette-study';doc.head.append(style);}
 style.textContent=`html,body{background:${p.page}!important}.app-shell{--surface:${p.page}!important;--ink:${p.text}!important;--accent:${p.accent}!important;--accent-text:${p.accent}!important;--header-surface:${p.bar}!important;--painted-header-surface:${p.bar}!important;--header-ink:${p.nav}!important;--header-highlight:${p.logo}!important;--painted-nav-surface:${p.logo}!important;--player-surface:${p.player}!important;--painted-player-surface:${p.player}!important}.app-shell .header .wordmark{color:${p.logo}!important}.app-shell .header{color:${p.nav}!important}.app-shell .main-nav-indicator{background:${p.logo}!important}.app-shell .player,.app-shell .player .track-copy small,.app-shell .player .seek time{color:${p.playerInk}!important}.app-shell .player{--muted:${p.playerInk}!important}.app-shell .player .seek input::-webkit-slider-runnable-track{background:linear-gradient(to right,${p.playerInk} var(--progress),${p.playerInk}55 var(--progress))!important}.app-shell .player .seek input::-webkit-slider-thumb{background:${p.playerInk}!important}`;
 return true;
}
function choose(index,scroll=true){selected=index;const p=palettes[index];document.querySelector('#preview-title').textContent=`${number(index)} · ${p.name}`;document.querySelector('#preview-swatches').innerHTML=assignments(p);sync();applyPreview();if(scroll)document.querySelector('#full-preview').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}
Object.entries(C).filter(([name])=>name!=='white').forEach(([name,color])=>{const item=document.createElement('span');item.className='key-item';item.innerHTML=`<i style="background:${color}" aria-hidden="true"></i><span>${name[0].toUpperCase()+name.slice(1)} <small>${color}</small></span>`;document.querySelector('.palette-key').append(item);});
palettes.forEach((p,i)=>{
 const card=document.createElement('article');card.className='option';card.setAttribute('aria-label',`${number(i)} ${p.name}`);
 const style=Object.entries({page:p.page,text:p.text,bar:p.bar,nav:p.nav,logo:p.logo,accent:p.accent,caption:p.caption,player:p.player,'player-ink':p.playerInk}).map(([key,value])=>`--${key}:${value}`).join(';');
 card.innerHTML=`<div class="option-info"><div><h2>${number(i)} · ${p.name}</h2><p>${p.note}</p></div><div class="option-actions"><button type="button" class="shortlist" aria-pressed="false" aria-label="Shortlist ${p.name}">Shortlist</button><button type="button" class="try" aria-label="Preview ${p.name}">Preview ↘</button></div></div><div class="sample" style="${style}"><div class="sample-bar"><span class="sample-name">jared conroy</span><div class="sample-nav"><span>About</span><span>Contact</span><span class="active">Illustration</span></div></div><div class="sample-content"><div class="sample-identity"><span class="sample-hello"><b>Hi!</b> I’m</span><span class="sample-signature" role="img" aria-label="Jared's signature"></span><span class="sample-tagline">a <b>multidisciplinary</b></span><div class="sample-roles"><span class="sample-role-one">Character<br>Designer</span><span class="sample-amp" aria-hidden="true">&amp;</span><span class="sample-role-two">Illustrator</span></div></div><div class="sample-feature"><div class="sample-caption"><span>Illustration</span></div><div class="sample-art"><img src="../../media/illustration/preview-boone.webp" alt="Boone in a maroon robe"><img src="../../media/illustration/preview-golfer.webp" alt="A golfer character"></div><div class="sample-timer"></div></div></div><div class="sample-player"><div class="sample-track"><img src="../../media/the-sleds/pretty-penny.webp" alt=""><span><strong>Pretty Penny</strong><small>The Sleds · 2024</small></span></div><div class="sample-transport" aria-hidden="true">‹ <span class="sample-play">▶</span> ›</div><div class="sample-line" aria-hidden="true"></div></div></div><div class="assignments">${assignments(p)}</div>`;
 card.querySelector('.shortlist').onclick=()=>toggleShortlist(i);card.querySelector('.try').onclick=()=>choose(i);options.append(card);
});
document.querySelector('#shortlist-filter').onclick=()=>{onlyShortlist=!onlyShortlist;sync();};
document.querySelector('#preview-shortlist').onclick=()=>toggleShortlist(selected);
frame.addEventListener('load',()=>{if(applyPreview())return;const observer=new MutationObserver(()=>{if(applyPreview())observer.disconnect();});observer.observe(frame.contentDocument.body,{childList:true,subtree:true});});
choose(0,false);
