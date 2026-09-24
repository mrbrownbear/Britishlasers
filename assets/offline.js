(() => {
  const q=(s,c=document)=>c.querySelector(s), qa=(s,c=document)=>[...c.querySelectorAll(s)];

  qa('.bl6_item').forEach(item=>{
    const btn=q('.bl6_link_drop',item);
    if(!btn) return;
    btn.setAttribute('aria-expanded','false');
    btn.addEventListener('click',e=>{
      e.preventDefault();
      const was=item.classList.contains('is-open');
      qa('.bl6_item.is-open').forEach(x=>{x.classList.remove('is-open'); const b=q('.bl6_link_drop',x); if(b)b.setAttribute('aria-expanded','false')});
      if(!was){item.classList.add('is-open');btn.setAttribute('aria-expanded','true')}
    });
  });
  document.addEventListener('click',e=>{
    if(!e.target.closest('.bl6_item')) qa('.bl6_item.is-open').forEach(x=>x.classList.remove('is-open'));
  });

  const drawer=q('#bl6-mobile-drawer');
  const burger=q('.bl6_burger');
  const close=q('.bl6_drawer_close');
  const setDrawer=open=>{
    if(!drawer) return;
    drawer.classList.toggle('is-open',open);
    drawer.setAttribute('aria-hidden',open?'false':'true');
    document.body.style.overflow=open?'hidden':'';
  };
  if(burger) burger.addEventListener('click',()=>setDrawer(true));
  if(close) close.addEventListener('click',()=>setDrawer(false));
  qa('#bl6-mobile-drawer a').forEach(a=>a.addEventListener('click',()=>setDrawer(false)));

  qa('.bil-machine-panel').forEach(panel=>{
    const open=q('.bil-machine-panel-summary .bl-cta',panel);
    const closeBtn=q('.bil-machine-panel-close',panel);
    if(open) open.addEventListener('click',e=>{e.preventDefault();panel.classList.add('is-expanded');panel.scrollIntoView({behavior:'smooth',block:'start'})});
    if(closeBtn) closeBtn.addEventListener('click',e=>{e.preventDefault();panel.classList.remove('is-expanded');panel.scrollIntoView({behavior:'smooth',block:'start'})});
  });

  qa('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
    const id=a.getAttribute('href'); if(!id || id==='#') return;
    const target=q(id); if(!target) return;
    e.preventDefault(); target.scrollIntoView({behavior:'smooth',block:'start'});
  }));

  qa('img').forEach(img=>{
    img.addEventListener('error',()=>{ if(!img.dataset.fallback){img.dataset.fallback='1';img.src='assets/fallback.svg'} });
  });

  const top=q('#back-to-top,.back-to-top');
  if(top) top.addEventListener('click',e=>{e.preventDefault();window.scrollTo({top:0,behavior:'smooth'})});
})();
