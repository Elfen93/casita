// captura de una escena con el censo real: ?k=bar&h=14&wd=2&grid=1&q=1 (q=1 quita los avisos emergentes para ver la escena)
const Q0=new URLSearchParams(location.search);if(Q0.get('nocrowd'))crowd=()=>[];
setTimeout(()=>{try{window.__errs=window.__errs||[];const Q=new URLSearchParams(location.search);const k=Q.get('k')||'parque',h=+(Q.get('h')||18),wd=+(Q.get('wd')||2);
S=newState('normal');S.char={...randomChar(),g:'f'};S.ideo='marxista';initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=false;S.r3d='simple';
S.day=Math.max(S.day,1);while(dateOf(S.day).wd!==wd)S.day++;S.t=h*60;HP().gymGood=(k==='gymbueno');
const s=S.sim;s.work=60;s.awayTotal=150;s.dest=k;s.outingActive=Q.get('o')==='work'?null:(Q.get('o')||((PLACES[k]&&PLACES[k].outs)||[])[0]||null);s.exit=[9,19];awayKey=()=>k;enterScene();viewPlace=true;sceneKey=null;menu.classList.remove('open');
if(Q.get('grid')){const _d=drawScene;drawScene=function(){const sc=_d.apply(this,arguments);ctx.save();ctx.font='700 6px sans-serif';ctx.textAlign='center';for(let x=0;x<=sc.W;x++)for(let y=0;y<=sc.D;y++){const [a,b]=P(x,y);ctx.fillStyle='rgba(255,0,0,.9)';ctx.fillRect(a-1,b-1,2,2);ctx.fillStyle='#c00';ctx.fillText(x+','+y,a,b-2);}ctx.restore();return sc;};}
if(Q.get('q')){const st=document.createElement('style');st.textContent='.toast,#toast,.popup,.aviso,[class*=toast],[class*=objetivo],[id*=toast]{display:none!important}';document.head.appendChild(st);}
setTimeout(()=>{if(Q.get('dbg'))document.title='DBG '+JSON.stringify({n:RT.names.map(n=>[n.name,n.x|0,n.y|0]),l:RT.last.map(p=>[p.name,p.x0|0,p.y0|0,p.x1|0,p.y1|0]),A:RT.lastArea&&[RT.lastArea.top|0,RT.lastArea.bot|0,RT.lastArea.ui]});else document.title='OK '+k+' W'+W+' H'+H+' z'+cam.z.toFixed(2)+' '+window.__errs.length+' '+[...new Set(window.__errs.map(e=>e.slice(0,120)))].join('|');},1200);
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);
