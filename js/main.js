/* Decorative hanging flowers — generated entirely with CSS */
function makeGarland(id, count=15){
  const root=document.getElementById(id);
  if(!root)return;
  for(let i=0;i<count;i++){
    const s=document.createElement('div');
    s.className='strand';
    s.style.left=(i/(count-1)*100)+'%';
    s.style.height=(45+Math.random()*90)+'px';
    const f=document.createElement('div');
    f.className='flower';
    const l1=document.createElement('div'); l1.className='leaf l';
    const l2=document.createElement('div'); l2.className='leaf r';
    f.append(l1,l2); s.appendChild(f); root.appendChild(s);
  }
}


/* Image-based envelope opening experience */
const intro=document.getElementById('intro');
const envelope=document.getElementById('envelope');
const envelopeWrap=document.getElementById('envelopeWrap');
const waxSeal=document.getElementById('waxSeal');
const sceneCaption=document.getElementById('sceneCaption');
const letterCard=document.getElementById('letterCard');
const letterSlot=document.getElementById('letterSlot');

document.body.style.overflow='hidden';
let opened=false;
let finishTimer=null;

function tinyChime(){
  try{
    const ctx=new (window.AudioContext||window.webkitAudioContext)();
    const o=ctx.createOscillator(), g=ctx.createGain();
    o.type='sine';
    o.frequency.setValueAtTime(520,ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(760,ctx.currentTime+.18);
    g.gain.setValueAtTime(.0001,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(.045,ctx.currentTime+.025);
    g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.38);
    o.connect(g).connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime+.4);
  }catch(e){}
}

function finishOpening(){
  if(!opened)return;
  intro.classList.add('hide');
  document.body.style.overflow='auto';
  window.scrollTo({top:0,behavior:'smooth'});
  startTour();
}

function openEnvelope(){
  if(opened)return;
  opened=true;
  envelope.classList.add('opened');
  envelopeWrap.classList.add('opened');
  waxSeal.blur();
  sceneCaption.innerHTML='<span class="instruction-dot"></span> Pull the card up';
  tinyChime();
  setTimeout(restCard,320);
}

waxSeal.addEventListener('click',openEnvelope);
letterSlot.addEventListener('click',e=>{ if(!opened) openEnvelope(); });

/* ---- Pull the invitation card out of the envelope ---- */
let dragging=false, startY=0, curY=0, pullDone=false;

function envH(){ return envelope.getBoundingClientRect().height||420; }
function restPx(){ return 0; }   /* card rests inside the pocket, below the fold line */
function slotTravel(){ return envH()*0.80; }
function restCard(){
  curY=restPx();
  letterCard.style.transition='transform .8s cubic-bezier(.22,.61,.36,1)';
  letterCard.style.transform='translate(-50%,'+curY+'px)';
  letterCard.style.setProperty('--pull','0');
}
function setPull(px){
  curY=Math.max(-slotTravel()*1.05,Math.min(restPx(),restPx()+px));
  letterCard.style.transition='none';
  letterCard.style.transform='translate(-50%,'+curY+'px)';
  const p=Math.min(1,Math.abs(curY-restPx())/(slotTravel()*0.5));
  letterCard.style.setProperty('--pull',p.toFixed(3));
}
function releasePull(){
  letterCard.style.transition='transform .55s cubic-bezier(.22,.61,.36,1)';
  if(Math.abs(curY-restPx())>slotTravel()*0.34){
    completePull();
  }else{
    restCard();
  }
}
function completePull(){
  if(pullDone)return;
  pullDone=true;
  letterCard.style.transition='transform .75s cubic-bezier(.22,.61,.36,1)';
  letterCard.style.transform='translate(-50%,'+(-slotTravel()*1.05)+'px)';
  letterCard.style.setProperty('--pull','1');
  setTimeout(finishOpening,650);
}

letterCard.addEventListener('pointerdown',e=>{
  if(!opened)return;
  dragging=true; startY=e.clientY;
  letterCard.setPointerCapture(e.pointerId);
});
letterCard.addEventListener('pointermove',e=>{
  if(!dragging)return;
  e.preventDefault();
  setPull(e.clientY-startY);
});
['pointerup','pointercancel'].forEach(t=>letterCard.addEventListener(t,e=>{
  if(!dragging)return;
  dragging=false;
  if(Math.abs(e.clientY-startY)<6){ completePull(); return; }
  releasePull();
}));
letterCard.addEventListener('keydown',e=>{
  if(e.key==='Enter'||e.key===' '){ e.preventDefault(); if(opened) completePull(); }
});


/* ---- Card = live miniature of page 1 (same page, rendered small) ---- */
(function(){
  if(document.documentElement.classList.contains('card-embed'))return;
  const VW=960, VH=400;                       /* virtual screen the miniature is rendered at */
  const holder=document.getElementById('cardFrame');
  const card=document.getElementById('letterCard');
  if(!holder||!card)return;
  const u=new URL(location.href); u.search='?card=1'; u.hash='';
  const ifr=document.createElement('iframe');
  ifr.src=u.toString(); ifr.title=''; ifr.tabIndex=-1; ifr.setAttribute('aria-hidden','true');
  ifr.style.width=VW+'px'; ifr.style.height=VH+'px';
  function fit(){ ifr.style.setProperty('--s',(card.clientWidth/VW).toFixed(5)); }
  /* Mount the miniature only after the main page has loaded, so the envelope
     screen gets all the bandwidth first. It is hidden until the envelope opens. */
  let mounted=false;
  function mount(){
    if(mounted)return; mounted=true;
    holder.appendChild(ifr); fit();
  }
  addEventListener('resize',fit); addEventListener('load',fit);
  if(window.ResizeObserver) new ResizeObserver(fit).observe(card);
  function later(){ (window.requestIdleCallback||function(f){setTimeout(f,300)})(mount,{timeout:1500}); }
  if(document.readyState==='complete') later(); else addEventListener('load',later);
  /* safety: guest opens the envelope before idle fires */
  if(waxSeal) waxSeal.addEventListener('click',mount);
  if(letterSlot) letterSlot.addEventListener('click',mount);
})();

/* Scroll reveals */
const observer=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')})
},{threshold:.14});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

/* Countdown: 1 November 2026, 10:00 AM IST */
const target=new Date('2026-11-01T10:00:00+05:30').getTime();
function tick(){
  let d=target-Date.now();
  if(d<0)d=0;
  const days=Math.floor(d/86400000); d%=86400000;
  const hours=Math.floor(d/3600000); d%=3600000;
  const mins=Math.floor(d/60000); d%=60000;
  const secs=Math.floor(d/1000);
  document.getElementById('days').textContent=String(days).padStart(2,'0');
  document.getElementById('hours').textContent=String(hours).padStart(2,'0');
  document.getElementById('mins').textContent=String(mins).padStart(2,'0');
  document.getElementById('secs').textContent=String(secs).padStart(2,'0');
}
tick(); setInterval(tick,1000);

/* Calendar file */
document.getElementById('calendarBtn').addEventListener('click',()=>{
  const ics=[
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Ravi Haripritha//Engagement//EN',
    'BEGIN:VEVENT','UID:ravi-haripritha-engagement-2026@example.com',
    'DTSTAMP:20260905T000000Z','DTSTART:20261101T043000Z','DTEND:20261101T073000Z',
    'SUMMARY:Engagement — Ravi Adhithya & Haripritha',
    'LOCATION:Preethika Mahal, 200 Feet Radial Road, Old Pallavaram, Chennai 600117',
    'DESCRIPTION:Engagement celebration of Ravi Adhithya and Dr. Haripritha M.',
    'END:VEVENT','END:VCALENDAR'
  ].join('\r\n');
  const blob=new Blob([ics],{type:'text/calendar'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download='Ravi-Haripritha-Engagement.ics';
  a.click(); URL.revokeObjectURL(url);
});

/* Native share where supported */
document.getElementById('shareBtn').addEventListener('click',async()=>{
  const link=new URL(window.location.href); link.hash=''; link.search=''; const shareUrl=link.toString();
  const data={
    title:'Ravi Adhithya & Haripritha — Engagement',
    text:'You are invited to celebrate our engagement on 1 November 2026 at Preethika Mahal, Chennai.',
    url:shareUrl
  };
  if(navigator.share){
    try{await navigator.share(data);return}catch(e){}
  }
  try{
    await navigator.clipboard.writeText(shareUrl);
    alert('Invitation link copied:\n'+shareUrl);
  }catch(e){
    prompt('Copy the invitation link:',shareUrl);
  }
});

/* =========================================================
   Auto scroll tour + golden rod/rings progress indicator.
   After the envelope opens, the page glides through each section
   (5s each) once. The rings descend the rod in sync. Any manual
   interaction cancels the tour and hands control back; the rod
   then tracks the guest's own scroll position.
   ========================================================= */
const scrollRod=document.getElementById('scrollRod');
const scrollRodRings=document.getElementById('scrollRodRings');
const tourSections=Array.from(document.querySelectorAll('main > section'));
let tourActive=false;
let tourTimer=null;
let tourStep=0;

function setRodProgress(p){
  if(scrollRodRings) scrollRodRings.style.setProperty('--rod-progress',Math.max(0,Math.min(1,p)).toFixed(4));
}

/* progress the rings from the current scroll position (manual mode) */
function syncRodToScroll(){
  const max=document.documentElement.scrollHeight-window.innerHeight;
  setRodProgress(max>0 ? window.scrollY/max : 0);
}

function endTour(){
  if(!tourActive)return;
  tourActive=false;
  clearTimeout(tourTimer);
  window.removeEventListener('wheel',cancelTour);
  window.removeEventListener('touchmove',cancelTour);
  window.removeEventListener('keydown',cancelTour);
  /* hand scroll tracking back to the guest */
  window.addEventListener('scroll',syncRodToScroll,{passive:true});
  syncRodToScroll();
}

function cancelTour(){ endTour(); }

function tourNext(){
  if(!tourActive)return;
  if(tourStep>=tourSections.length){
    endTour();
    return;
  }
  const section=tourSections[tourStep];
  section.scrollIntoView({behavior:'smooth'});
  setRodProgress(tourSections.length>1 ? tourStep/(tourSections.length-1) : 1);
  tourStep++;
  tourTimer=setTimeout(tourNext,5000);   /* 5s per section */
}

function startTour(){
  if(tourActive || !tourSections.length) return;
  tourActive=true;
  tourStep=0;
  if(scrollRod) scrollRod.classList.add('show');
  /* cancel the moment the guest takes over */
  window.addEventListener('wheel',cancelTour,{passive:true});
  window.addEventListener('touchmove',cancelTour,{passive:true});
  window.addEventListener('keydown',cancelTour);
  /* let the intro finish hiding, then begin */
  tourTimer=setTimeout(tourNext,900);
}


/* Envelope screen background toggle — switch between the floral
   frame and a plain background. */
const bgToggle=document.getElementById('bgToggle');
if(bgToggle && intro){
  bgToggle.addEventListener('click',e=>{
    e.stopPropagation();
    const plain=intro.classList.toggle('plain-bg');
    bgToggle.setAttribute('aria-pressed',String(plain));
    bgToggle.setAttribute('aria-label',plain?'Switch to the floral background':'Switch to a plain background');
    const icon=bgToggle.querySelector('.bg-toggle-icon');
    const label=bgToggle.querySelector('.bg-toggle-label');
    if(label) label.textContent=plain?'Floral':'Plain';
    if(icon) icon.innerHTML=plain?'&#127800;':'&#10052;';
  });
}

/* Start with the page behind the invitation locked */
document.body.style.overflow='hidden';
