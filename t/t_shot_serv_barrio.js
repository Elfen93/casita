setTimeout(()=>{try{
 S=newState('normal');S.char={...DEFCHAR};S.ideo='marxista';startTrack('super',true);initPeople();newToday();S.weather={k:'sol',t:20};S.t=11*60;S.day=8;rot=0;
 menu.classList.remove('open');
 const c=document.createElement('canvas');c.width=1200;c.height=800;c.style.cssText='position:fixed;left:0;top:0;width:1200px;height:800px;z-index:99;background:#9fc5e8';document.body.appendChild(c);
 const old=ctx;ctx=c.getContext('2d');ctx.setTransform(1,0,0,1,0,0);ctx.translate(600,260);ctx.scale(.34,.34);
 drawBarrioGround(0);const its=barrioItems(3,0).items;its.sort((a,b)=>a.d-b.d);for(const i of its)i.f();for(const i of its)if(i.lab)i.lab();
 ctx=old;
 // comprobación de solapes entre lugares y con las calles (anillo -4..N+4)
 const ks=Object.keys(PLACES),bad=[];for(const a of ks){const A=PLACES[a].r;if(a==='parque'||!A)continue;if(A[2]>-4&&A[0]<N+4&&A[3]>-4&&A[1]<N+4&&!(a==='casaV'&&0))bad.push(a+' calle');for(const b of ks){if(b<=a)continue;const B=PLACES[b].r;if(A[0]<B[2]&&A[2]>B[0]&&A[1]<B[3]&&A[3]>B[1])bad.push(a+' x '+b);}}
 setTimeout(()=>{document.title='OK '+window.__errs.length+' '+(window.__errs[0]||'')+' solapes:'+JSON.stringify(bad);},300);
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,500)}},300);
