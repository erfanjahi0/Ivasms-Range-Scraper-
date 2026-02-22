/* ============================================================
   LIVE RANGE SCRAPER — Website JS
   ============================================================ */
'use strict';

/* ─── CURSOR ──────────────────────────────────────────────── */
const dot  = document.getElementById('cur-dot');
const ring = document.getElementById('cur-ring');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove', e=>{ mx=e.clientX; my=e.clientY; });
(function lerpCur(){
  dot.style.transform  = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
  rx += (mx-rx)*.13; ry += (my-ry)*.13;
  ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
  requestAnimationFrame(lerpCur);
})();
document.querySelectorAll('a,button').forEach(el=>{
  el.addEventListener('mouseenter',()=>document.body.classList.add('hover-cur'));
  el.addEventListener('mouseleave',()=>document.body.classList.remove('hover-cur'));
});

/* ─── CANVAS PARTICLES ────────────────────────────────────── */
(function(){
  const c = document.getElementById('bg-canvas');
  if(!c) return;
  const ctx = c.getContext('2d');
  let W,H,pts=[];
  function resize(){ W=c.width=innerWidth; H=c.height=innerHeight; }
  resize(); addEventListener('resize',()=>{resize();init();});
  function init(){
    const n = Math.min(Math.floor(W/12),80);
    pts = Array.from({length:n},()=>({
      x:Math.random()*W, y:Math.random()*H,
      vx:(Math.random()-.5)*.22, vy:(Math.random()-.5)*.22,
      r:Math.random()*.9+.2,
    }));
  }
  init();
  function frame(){
    ctx.clearRect(0,0,W,H);
    pts.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0)p.x=W; if(p.x>W)p.x=0;
      if(p.y<0)p.y=H; if(p.y>H)p.y=0;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle='rgba(255,107,26,.35)'; ctx.fill();
    });
    for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){
      const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y;
      const d=Math.sqrt(dx*dx+dy*dy);
      if(d<110){ ctx.strokeStyle=`rgba(255,107,26,${(1-d/110)*.05})`; ctx.lineWidth=.6;
        ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y); ctx.stroke(); }
    }
    requestAnimationFrame(frame);
  }
  frame();
})();

/* ─── STICKY NAV ─────────────────────────────────────────── */
const nav = document.getElementById('nav');
addEventListener('scroll',()=>nav.classList.toggle('stuck',scrollY>60),{passive:true});

/* ─── SCROLL REVEAL ──────────────────────────────────────── */
const reveals = document.querySelectorAll('.reveal');
new IntersectionObserver(es=>{
  es.forEach(e=>{
    if(e.isIntersecting){
      const d = e.target.dataset.d||0;
      setTimeout(()=>e.target.classList.add('in'), d*1000);
    }
  });
},{threshold:.12,rootMargin:'0px 0px -50px 0px'}).observe
  ? (()=>{ reveals.forEach(el=>{
      const obs = new IntersectionObserver(es=>{
        es.forEach(e=>{ if(e.isIntersecting){ setTimeout(()=>e.target.classList.add('in'),(e.target.dataset.d||0)*1000); obs.unobserve(e.target); } });
      },{threshold:.12,rootMargin:'0px 0px -50px 0px'});
      obs.observe(el);
    }); })()
  : reveals.forEach(el=>el.classList.add('in'));

/* ─── COUNTER ANIMATION ──────────────────────────────────── */
document.querySelectorAll('[data-count]').forEach(el=>{
  new IntersectionObserver(es=>{
    es.forEach(e=>{
      if(!e.isIntersecting) return;
      const target=parseFloat(el.dataset.count);
      const suffix=el.dataset.s||'';
      const dec=parseInt(el.dataset.dec||0);
      let start; const dur=1600;
      function step(ts){
        if(!start) start=ts;
        const p=Math.min((ts-start)/dur,1);
        const ease=1-Math.pow(2,-10*p);
        el.textContent=(target*ease).toFixed(dec)+suffix;
        if(p<1) requestAnimationFrame(step);
        else el.textContent=target.toFixed(dec)+suffix;
      }
      requestAnimationFrame(step);
    });
  },{threshold:.5}).observe(el);
});

/* ─── LIVE MESSAGES TICKER (mockup inside hero) ──────────── */
(function(){
  const msgs = [
    { phone:'+1 (347) 555-0182', from:'Twilio / US', body:'Your verification code is 847291. Expires in 10 min.', t:'just now' },
    { phone:'+44 7700 900345', from:'AWS SNS / UK', body:'OTP: 662931 — Do not share.', t:'2s ago' },
    { phone:'+91 98765 43210', from:'Firebase / IN', body:'Welcome to IndiaPay! Code: 112233', t:'5s ago' },
    { phone:'+49 151 1234 5678', from:'Vonage / DE', body:'Your order #8821 has shipped.', t:'9s ago' },
    { phone:'+33 6 12 34 56 78', from:'OVH / FR', body:'Nouveau message de votre banque.', t:'14s ago' },
    { phone:'+55 11 9 9876 5432', from:'Sinch / BR', body:'Código de verificação: 334455', t:'20s ago' },
  ];
  const feed = document.getElementById('ext-feed');
  if(!feed) return;

  let idx = 0;
  function buildMsgs(){
    feed.innerHTML='';
    const slice = msgs.slice(idx, idx+3);
    slice.forEach((m,i)=>{
      const el=document.createElement('div');
      el.className='emsg'; el.style.opacity='0'; el.style.transform='translateY(-6px)';
      el.style.transition=`opacity .35s ${i*.07}s, transform .35s ${i*.07}s`;
      el.innerHTML=`
        <div class="emsg-top"><span class="emsg-phone">${m.phone}</span><span class="emsg-time">${m.t}</span></div>
        <div class="emsg-from">📡 ${m.from}</div>
        <div class="emsg-body">${m.body}</div>
        ${i===0?'<div class="emsg-new">NEW</div>':''}
      `;
      feed.appendChild(el);
      requestAnimationFrame(()=>{ el.style.opacity='1'; el.style.transform='translateY(0)'; });
    });
    document.getElementById('ext-count') && (document.getElementById('ext-count').textContent = (1200+idx*3).toLocaleString());
  }
  buildMsgs();
  setInterval(()=>{ idx=(idx+1)%msgs.length; buildMsgs(); }, 2600);
})();

/* ─── TERMINAL TYPEWRITER ────────────────────────────────── */
(function(){
  const el = document.getElementById('term-type');
  if(!el) return;
  const lines=[
    '> extension loaded ✓',
    '> navigating to ivasms.com/portal/live...',
    '> ● recording started',
    '> 🎯 target detected: /portal/live/test_sms',
    '> 📨 captured: +1 (347) 555-0182 | "OTP: 847291"',
    '> 📨 captured: +44 7700 900345 | "Code: 662931"',
    '> 📨 captured: +49 151 1234 5678 | "Order shipped"',
    '> total: 3 messages · storage: 0.02 MB',
    '> ■ recording stopped',
    '> export: sms-data-2024-01-15.json ✓',
    '_',
  ];
  let li=0,ci=0,out='';
  function tick(){
    if(li>=lines.length){ el.innerHTML=out+'<span class="tcur"></span>'; return; }
    if(ci<lines[li].length){
      out+=lines[li][ci++];
      el.innerHTML=formatLine(out)+'<span class="tcur"></span>';
      setTimeout(tick, ci===1&&li>0?350:Math.random()*24+16);
    } else {
      out+='\n'; li++; ci=0;
      el.innerHTML=formatLine(out)+'<span class="tcur"></span>';
      setTimeout(tick,li<lines.length?220:0);
    }
  }
  function formatLine(s){
    return s
      .replace(/●/g,'<span class="tok">●</span>')
      .replace(/■/g,'<span style="color:var(--red)">■</span>')
      .replace(/✓/g,'<span class="tok">✓</span>')
      .replace(/(📨)/g,'<span class="tw">$1</span>')
      .replace(/(🎯)/g,'<span class="td">$1</span>')
      .replace(/"([^"]+)"/g,'"<span class="tok">$1</span>"')
      .replace(/\+[\d\s\(\)-]+(?=\s\|)/g,m=>`<span class="td">${m}</span>`)
      .replace(/(> )/g,'<span class="tp">&gt; </span>')
      .replace(/\n/g,'<br>');
  }
  // Start when hero terminal is in view
  const obs=new IntersectionObserver(es=>{es.forEach(e=>{ if(e.isIntersecting){tick();obs.disconnect();} });},{threshold:.4});
  const termEl = document.querySelector('.how-terminal');
  if(termEl) obs.observe(termEl); else tick();
})();

/* ─── SMOOTH SCROLL ──────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const t=document.querySelector(a.getAttribute('href'));
    if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth',block:'start'});}
  });
});

/* ─── RIPPLE ──────────────────────────────────────────────── */
document.querySelectorAll('.btn-dl,.nav-dl').forEach(btn=>{
  btn.addEventListener('click',function(e){
    const r=this.getBoundingClientRect();
    const rip=document.createElement('span');
    const sz=Math.max(r.width,r.height)*2;
    rip.style.cssText=`position:absolute;border-radius:50%;pointer-events:none;width:${sz}px;height:${sz}px;left:${e.clientX-r.left-sz/2}px;top:${e.clientY-r.top-sz/2}px;background:rgba(0,0,0,.2);transform:scale(0);animation:ripA .55s ease-out forwards;`;
    this.style.overflow='hidden'; this.appendChild(rip);
    setTimeout(()=>rip.remove(),600);
  });
});
const rStyle=document.createElement('style');
rStyle.textContent='@keyframes ripA{to{transform:scale(1);opacity:0;}}';
document.head.appendChild(rStyle);

/* ─── STAGGER GRIDS ───────────────────────────────────────── */
document.querySelectorAll('.stagger').forEach(grid=>{
  const kids=[...grid.children];
  kids.forEach(k=>{ k.style.opacity='0'; k.style.transform='translateY(26px)'; k.style.transition='opacity .6s var(--ease-expo),transform .6s var(--ease-expo)'; });
  const obs=new IntersectionObserver(es=>{
    es.forEach(e=>{ if(e.isIntersecting){ kids.forEach((k,i)=>setTimeout(()=>{k.style.opacity='1';k.style.transform='';},i*70)); obs.unobserve(grid); } });
  },{threshold:.1});
  obs.observe(grid);
});
