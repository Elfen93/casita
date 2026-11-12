setTimeout(()=>{try{window.__errs=window.__errs||[];const ce=console.error;console.error=(...a)=>{window.__errs.push(a.map(x=>x&&x.stack?x.stack.slice(0,200):String(x)).join(' ').slice(0,300));};
S=newState('normal');S.char={...randomChar(),g:'f'};S.ideo='marxista';initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=false;S.r3d='simple';
const ks=['obra','super','bar','torre','residencia','biblioteca','parque','sindicato','ateneo','comedor','coop','sala','parroquia','comisaria','ayto','tienda','gym','gymbueno'];let n=0,fig=0;
for(const k of ks)for(const h of [9,14,20]){S.t=h*60;HP().gymGood=(k==='gymbueno');const s=S.sim;s.work=60;s.awayTotal=150;s.dest=k;s.outingActive=((PLACES[k]&&PLACES[k].outs)||[])[0]||null;s.exit=[9,19];awayKey=()=>k;enterScene();viewPlace=true;sceneKey=null;render();n++;}
enterScene();document.title='OK '+window.__errs.length+' '+n+' '+[...new Set(window.__errs.map(e=>e.slice(0,120)))].join(' | ');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);

// sitio de la gente en las 18 escenas, todas sus variantes y varias horas: nadie sobre un mueble, una pared u otra figura, ni cortado por el borde del suelo; cada trabajador en un puesto
setTimeout(()=>{try{window.__errs=window.__errs||[];
 S=newState('normal');S.char={...randomChar(),g:'f'};S.ideo='marxista';initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=false;S.r3d='simple';
 const ks=['obra','super','bar','torre','residencia','biblioteca','parque','sindicato','ateneo','comedor','coop','sala','parroquia','comisaria','ayto','tienda','gym','gymbueno'];
 const rec=[],fig=[];const _pr=prism,_pg=prismG,_cy=cyl,_sp=sPerson;let on=false;
 prism=function(x0,y0,x1,y1,z0,z1){if(on)rec.push([x0,y0,x1,y1,z0,z1]);return _pr.apply(this,arguments);};
 prismG=function(x0,y0,x1,y1,z0,z1){if(on)rec.push([x0,y0,x1,y1,z0,z1]);return _pg.apply(this,arguments);};
 cyl=function(cx,cy,r,z0,z1){if(on)rec.push([cx-r,cy-r,cx+r,cy+r,z0,z1]);return _cy.apply(this,arguments);};
 sPerson=function(x,y,ch,o){if(on)fig.push([x,y]);return _sp.apply(this,arguments);};
 const bad=[];let esc=0,figs=0,trab=0,sinPuesto=[];const cnt={};
 for(const k of ks){const vars=[...(k==='comedor'?[]:[null]),...(((PLACES[k]&&PLACES[k].outs)||[]))];
  for(const oa of vars)for(const h of [9,14,18,20])for(const tt of [0,9,23,47])for(const wd of [h===9?1:h===14?2:h===18?3:4]){
   S.day=Math.max(S.day,1);while(dateOf(S.day).wd!==wd)S.day++;S.t=h*60;HP().gymGood=(k==='gymbueno');
   const s=S.sim;s.work=60;s.awayTotal=150;s.dest=k;s.outingActive=oa;s.exit=[9,19];awayKey=()=>k;enterScene();viewPlace=true;sceneKey=null;
   const sc=buildScene(k,tt,0);const pob=sc.pob||[];rec.length=0;fig.length=0;on=true;try{drawScene(k,tt,0);}finally{on=false;}esc++;figs+=pob.length;cnt[k]=Math.min(cnt[k]??99,pob.length);
   const tag=`${k}/${oa||'work'}/${h}/tt${tt}`,W=sc.W,D=sc.D;
   const fixed=fig.filter(f=>!pob.some(q=>Math.abs(q.x-f[0])<1e-6&&Math.abs(q.y-f[1])<1e-6));fixed.push([sc.ana.x,sc.ana.y]);
   const bl=rec.filter(r=>r[5]>=6&&r[4]<40&&r[2]-r[0]<W-1&&r[3]-r[1]<D-1&&r[3]>0&&r[2]>0);
   pob.forEach((q,i)=>{const nm=q.v?q.v.n:'figurante';
    if(q.x<.3||q.y<.3||q.x>W-.3||q.y>D-.3)bad.push(`${tag} ${nm} cortado por el borde del suelo (${q.x.toFixed(1)},${q.y.toFixed(1)})`);
    if(!q.up)for(const r of bl)if(q.x>r[0]-.12&&q.x<r[2]+.12&&q.y>r[1]-.12&&q.y<r[3]+.12){bad.push(`${tag} ${nm} sobre un mueble o pared (${q.x.toFixed(1)},${q.y.toFixed(1)})`);break;}
    for(const f of fixed)if(Math.hypot(f[0]-q.x,f[1]-q.y)<.5){bad.push(`${tag} ${nm} sobre otra figura (${q.x.toFixed(1)},${q.y.toFixed(1)})`);break;}
    for(let j=i+1;j<pob.length;j++)if(Math.hypot(pob[j].x-q.x,pob[j].y-q.y)<.45)bad.push(`${tag} ${nm} sobre ${pob[j].v?pob[j].v.n:'figurante'}`);
    if(q.trab){trab++;if(!q.post&&(oa===null||k==='bar'))sinPuesto.push(k+'/'+(oa||'work')+'/'+h+':'+nm);}});}}
 prism=_pr;prismG=_pg;cyl=_cy;sPerson=_sp;
 const sp=[...new Set(sinPuesto)];
 document.title=(bad.length||sp.length||__errs.length?'ERR ':'OK ')+document.title.replace(/^(OK|ERR) /,'')+' sitio '+JSON.stringify({esc,media:Math.round(figs/esc*10)/10,trab,nbad:bad.length,bad:[...new Set(bad)].slice(0,30),sinPuesto:sp.slice(0,40),min:Object.entries(cnt).filter(e=>e[1]<4).map(e=>e.join(':'))});
}catch(err){document.title='ERR sitio '+err.message+' '+err.stack.slice(0,300)}},700);
