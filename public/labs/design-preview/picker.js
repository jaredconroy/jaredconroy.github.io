const wideMedia = [
  {id:'ctt-interface',label:'Consumer Think Tank · interface',src:'/media/design/ctt-ui-mockup.webp',bg:'#262262'},
  {id:'lni-wide',label:'Late Night Idle · wordmark',src:'/media/design/preview-lni-wide.svg',bg:'#000000'},
  {id:'slimthick-wide',label:'Slim Thick Sports · logo + wordmark',src:'/media/design/slimthick-logo-wordmark.webp',bg:'#0f75bc'},
  {id:'vendetta-thumb',label:'Brookline Vendetta · Act One thumbnail',src:'/media/design/phatboy-vendetta-thumbnail.webp',bg:'#a9202b'},
  {id:'vendetta2-thumb',label:'Brookline Vendetta · Act Two thumbnail',src:'/media/design/phatboy-vendetta2-thumbnail.webp',bg:'#0876ac'},
  {id:'brookline-thumb',label:'Brookline Brothers · thumbnail',src:'/media/design/phatboy-brookline-thumbnail.webp',bg:'#173458'},
  {id:'boots-process',label:'Boots & Cats · design process',src:'/media/design/boots-cats-process.webp',bg:'#4555a5'},
];
const square = [
  {id:'ctt-logo',label:'Consumer Think Tank · logo',src:'/media/design/ctt-logo.webp',bg:'#262262'},
  {id:'lni-stack',label:'Late Night Idle · stacked logo',src:'/media/design/lni-lni-stack.webp',bg:'#222326'},
  {id:'six-pack',label:'Six Pack with Jack · logo',src:'/media/design/six-pack-w-jack.webp',bg:'#efe4d5'},
  {id:'slimthick-logo',label:'Slim Thick Sports · square logo',src:'/media/design/slimthick-sts-new.webp',bg:'#0f75bc'},
  {id:'boots-logo',label:'Boots & Cats · logo',src:'/media/design/boots-cats-logo.webp',bg:'#4555a5'},
  {id:'ctt-icon',label:'Consumer Think Tank · app icon',src:'/media/design/ctt-favicon.webp',bg:'#262262'},
  {id:'sixth-sense',label:'Sixth Sense · album cover',src:'/media/the-sleds/sixth-sense.webp',bg:'#17291c'},
  {id:'dirty-hearts',label:'Dirty Hearts & Restless Minds · cover',src:'/media/the-sleds/dirty-hearts.webp',bg:'#213045'},
  {id:'pretty-penny',label:'Pretty Penny · cover',src:'/media/the-sleds/pretty-penny.webp',bg:'#243148'},
  {id:'rock-romance',label:'Rock ’n’ Roll Romance · cover',src:'/media/the-sleds/rock-n-roll-romance.webp',bg:'#ede3d6'},
  {id:'you-need-this',label:'You Need This More Than I Do · cover',src:'/media/the-sleds/you-need-this-more.webp',bg:'#e9e3db'},
  {id:'ep-cover',label:'EP · cover',src:'/media/design/covers-ep.webp',bg:'#e8e7e1'},
  {id:'act-one-poster',label:'Brookline Vendetta · Act One poster',src:'/media/design/phatboy-vendetta-poster.webp',bg:'#a9202b'},
  {id:'act-two-poster',label:'Brookline Vendetta · Act Two poster',src:'/media/design/phatboy-vendetta2-poster.webp',bg:'#0876ac'},
];
const wide=[...wideMedia,...square];
const slots=[
  {id:'wide-1',label:'Top square 1',pool:wide,initial:'ctt-logo'},
  {id:'wide-2',label:'Top square 2',pool:wide,initial:'lni-stack'},
  {id:'square-1',label:'Bottom square 1',pool:square,initial:'dirty-hearts'},
  {id:'square-2',label:'Square 2',pool:square,initial:'six-pack'},
  {id:'square-3',label:'Bottom square 3',pool:square,initial:'slimthick-logo'},
];
const storageKey='jared-design-preview-picker-v1';
const status=document.querySelector('#status');
let saved={};
try{saved=JSON.parse(localStorage.getItem(storageKey)||'{}')}catch{saved={}}
const selections=Object.fromEntries(slots.map(slot=>[slot.id,slot.pool.some(item=>item.id===saved[slot.id])?saved[slot.id]:slot.initial]));
const selectors=document.querySelector('#selectors');
function draw(){
  selectors.replaceChildren();
  for(const slot of slots){
    const selected=slot.pool.find(item=>item.id===selections[slot.id]);
    const figure=document.querySelector(`[data-slot="${slot.id}"]`);
    figure.style.background=selected.bg;
    figure.classList.toggle('selected-square',slot.id.startsWith('wide-')&&square.some(item=>item.id===selected.id));
    const image=figure.querySelector('img');image.src=selected.src;image.alt=selected.label;
    const wrapper=document.createElement('div');wrapper.className='choice';
    const label=document.createElement('label');label.htmlFor=`pick-${slot.id}`;label.textContent=slot.label;
    const select=document.createElement('select');select.id=`pick-${slot.id}`;select.setAttribute('aria-label',`${slot.label} artwork`);
    for(const option of slot.pool){const node=document.createElement('option');node.value=option.id;node.textContent=option.label;node.selected=option.id===selections[slot.id];select.append(node)}
    select.addEventListener('change',()=>{selections[slot.id]=select.value;localStorage.setItem(storageKey,JSON.stringify(selections));draw();status.textContent='Saved. Change another slot or copy your choices when you’re ready.'});
    wrapper.append(label,select);selectors.append(wrapper);
  }
}
document.querySelector('#reset').addEventListener('click',()=>{
  for(const slot of slots)selections[slot.id]=slot.initial;
  localStorage.removeItem(storageKey);draw();status.textContent='Restored the starter arrangement.';
});
document.querySelector('#copy').addEventListener('click',async()=>{
  const result=Object.fromEntries(slots.map(slot=>[slot.id,slot.pool.find(item=>item.id===selections[slot.id]).label]));
  try{await navigator.clipboard.writeText(JSON.stringify(result,null,2));status.textContent='Choices copied. Paste them into our chat.'}
  catch{status.textContent=JSON.stringify(result)}
});
draw();
