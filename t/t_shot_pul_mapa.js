// mapa de ocupación de cada escena (sin la gente añadida): '#' mueble o pared a pie de suelo, 'P' figura fija, '.' libre; resolución 0,5 casillas
crowd=()=>[];window.__errs=[];const _ce=console.error;console.error=(...a)=>{window.__errs.push(a.map(x=>x&&x.stack?x.stack.slice(0,300):String(x)).join(' ').slice(0,400));};
setTimeout(()=>{try{window.__errs=window.__errs||[];const Q=new URLSearchParams(location.search);const ks=(Q.get('k')||'bar').split(',');const h=+(Q.get('h')||14),wd=+(Q.get('wd')||2);
S=newState('normal');S.char={...randomChar(),g:'f'};S.ideo='marxista';initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=false;S.r3d='simple';
S.day=Math.max(S.day,1);while(dateOf(S.day).wd!==wd)S.day++;S.t=h*60;
const rec=[],pp=[];const _pr=prism,_pg=prismG,_cy=cyl,_sp=sPerson;
prism=function(x0,y0,x1,y1,z0,z1){rec.push([x0,y0,x1,y1,z0,z1]);return _pr.apply(this,arguments);};
prismG=function(x0,y0,x1,y1,z0,z1){rec.push([x0,y0,x1,y1,z0,z1]);return _pg.apply(this,arguments);};
cyl=function(cx,cy,r,z0,z1){rec.push([cx-r,cy-r,cx+r,cy+r,z0,z1]);return _cy.apply(this,arguments);};
sPerson=function(x,y,ch,o){pp.push([x,y]);return _sp.apply(this,arguments);};
let out='';const HS=(Q.get('hs')||'9,14,20').split(',').map(Number),WDS=(Q.get('wds')||'2,6').split(',').map(Number),TTS=[0,5,11,19];
for(const k of ks){const R=.5;let sc0=null;const blk={},pers={};let nruns=0;
 const outs=[null,...(((PLACES[k]&&PLACES[k].outs)||[]))];for(const oa of outs)for(const hh of HS)for(const ww of WDS){S.day=Math.max(S.day,1);while(dateOf(S.day).wd!==ww)S.day++;S.t=hh*60;
  for(const tt of TTS){rec.length=0;pp.length=0;const s=S.sim;s.work=60;s.awayTotal=150;s.dest=k;s.outingActive=oa;s.exit=[9,19];awayKey=()=>k;enterScene();viewPlace=true;sceneKey=null;HP().gymGood=(k==='gymbueno');
   drawScene(k,tt,0);const sc=buildScene(k,tt,0);sc0=sc;rec.length=0;pp.length=0;drawScene(k,tt,0);
   const nx=Math.ceil(sc.W/R),ny=Math.ceil(sc.D/R);
   for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const cx=(i+.5)*R,cy=(j+.5)*R,id=i+','+j;
    for(const r of rec){if(r[5]>=6&&r[4]<40&&r[2]-r[0]<sc.W-1&&cx>=r[0]&&cx<=r[2]&&cy>=r[1]&&cy<=r[3]){blk[id]=1;break;}}
    for(const q of pp)if(Math.abs(q[0]-cx)<.3&&Math.abs(q[1]-cy)<.3)pers[id]=(pers[id]||0)+1;}nruns++;}}
 const sc=sc0,nx=Math.ceil(sc.W/R),ny=Math.ceil(sc.D/R);out+=`|== ${k} W${sc.W} D${sc.D} out${sc.out?1:0} ana ${sc.ana.x},${sc.ana.y}|`;
 for(let j=0;j<ny;j++){let row=(j*R).toFixed(1).padStart(4)+' ';for(let i=0;i<nx;i++){const id=i+','+j;row+=blk[id]?'#':pers[id]?String(Math.min(9,Math.ceil(pers[id]/nruns*9))):'.';}out+=row+'|';}
 let hdr='     ';for(let i=0;i<nx;i++)hdr+=(i%2?' ':String(Math.floor(i*R)%10));out+=hdr+'|';}
document.title='OK '+window.__errs.length+' '+[...new Set(window.__errs)].slice(0,2).join(' ## ')+out;
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);
