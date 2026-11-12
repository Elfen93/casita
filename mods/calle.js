// =================== CALLE: los vecinos del censo van y vienen por las calles ===================
// Cada vecino tiene casa (hogar → edificio → puerta) y sitios por horas (trabajo, donde, centro de estudios, recoger). La agenda del día se saca de vecinosEn
// (la cadena entera, escuela y universidad incluidas) y entre un sitio y el siguiente recorre el camino real (cmRuta) saliendo por una puerta y entrando por la otra.
// Quien tiene un rato libre en casa hace vida de calle (pan, perro, banco, corrillo en la puerta del bar), siempre con los mismos vecinos y según la «red» del barrio.
// Los menores de 12 solo andan con una persona adulta de su casa. Nadie está a la vez en la calle y dentro de un sitio: vecinosEn descarta a quien anda.
// Los textos, en data/caminar.json (va_*, calle). Estado: ninguno (se recalcula cada día de juego a partir del censo).
const CLC=()=>(DATA.caminar&&DATA.caminar.calle)||{};
const CL={key:'',recs:[],byV:new Map(),span:new Map(),st:new Map(),vec:[],act:null,actK:'',lug:null,ms:0,rellK:-1};
const clVe=vecinosEn;                                     // la cadena de vecinosEn sin el filtro de la calle
const clHog=v=>{const H=(DATA.personas&&DATA.personas.hogares)||{};const g=H[v.hogar];return g&&g.edificio&&cdPuerta(g.edificio)?g.edificio:null;};
function clLugares(){if(CL.lug)return CL.lug;const s=new Set();
  for(const v of pbVec()){if(!v)continue;if(v.trabajo&&v.trabajo.lugar)s.add(v.trabajo.lugar);for(const d of v.donde||[])if(d&&d[0])s.add(d[0]);if(v.centro)s.add(v.centro);}
  if(typeof ESC_K!=='undefined')for(const k of ESC_K)s.add(k);s.delete('fuera');return CL.lug=[...s];}
// los tramos de cada vecino en el día (pasos de 5 min): [{pl, mo (motivo), a, b}]
function clStays(wd){const lug=clLugares(),N=288,cur=new Map();
  for(let s=0;s<N;s++){const h=s/12+.001;for(const pl of lug){let r;try{r=clVe(pl,h,wd);}catch(e){continue;}
      for(const q of r){const id=q.v.id;let a=cur.get(id);if(!a)cur.set(id,a=new Array(N).fill(null));if(!a[s])a[s]=[pl,q.motivo];}}}
  const out=new Map();for(const [id,a] of cur){const L=[];let i=0;while(i<N){if(!a[i]){i++;continue;}let j=i;while(j+1<N&&a[j+1]&&a[j+1][0]===a[i][0])j++;L.push({pl:a[i][0],mo:a[i][1],a:i/12,b:(j+1)/12});i=j+1;}out.set(id,L);}
  return out;}
const clRMin=(a,b)=>{const R=cmRuta(a,b);return R&&R.min>0?R.min/60:null;};
const clRed=bar=>{try{const t=DATA.barrios_vida.barrios[bar];return t&&typeof t.red==='number'?t.red:1;}catch(e){return 1;}};
// ---- trozos de movimiento: {vid, v, t0, t1 (fin de la marcha), te (fin del trozo), R (camino) | fix (quieto), k, txt, dest…}
function clMk(v,o){const r={vid:v.id,v,...o};CL.recs.push(r);let l=CL.byV.get(v.id);if(!l)CL.byV.set(v.id,l=[]);l.push(r);let s=CL.span.get(v.id);if(!s)CL.span.set(v.id,s=[]);s.push([r.t0,r.te]);CL.act=null;CL.actK='';return r;}
function clTrip(v,from,to,t0,o){const R=cmRuta(from,to);if(!R||!(R.min>0))return null;const m=R.min/60;
  const r=clMk(v,{t0,t1:t0+m,te:Math.max(t0+m,(o&&o.hasta)||0),R,from,to,m,...o});
  // los que andan juntos (mismo camino a la vez) van uno al lado del otro
  const g=CL.recs.filter(q=>q.R===R&&Math.abs(q.t0-t0)<.04);if(g.length>1){g.sort((a,b)=>a.vid<b.vid?-1:1);g.forEach((q,i)=>{q.off=[(i-(g.length-1)/2)*.7,(i%2)*.3];q.con=g.length-1;});}
  return r;}
function clDwell(v,pl,t0,t1,k,o){const q=cmPuertaPts(pl);if(!q)return null;const grupo=pl+'|'+Math.round(t0*60),n=CL.recs.filter(r=>r.grupo===grupo).length,sit=o&&o.sit;
  return clMk(v,{t0,t1:t0,te:t1,fix:{b:cdBarrioDe(pl),x:q.side[0]+(n%2?1:-1)*Math.ceil(n/2)*(sit?1.9:.85),y:q.side[1]+(n%2?.55:0),dx:0,dy:-1},k,pl,grupo,idx:n,...o});}
const clOcup=(v,a,b)=>{for(const s of CL.st.get(v.id)||[])if(s.a<b&&s.b>a)return true;for(const r of CL.byV.get(v.id)||[])if(r.t0<b&&r.te>a)return true;return false;};
const clEsc=k=>typeof ESC_K!=='undefined'&&ESC_K.includes(k);
// un recado de calle de quien está en casa: sale a las a0 (pan: va, entra, vuelve; banco/corrillo: va, se queda, vuelve)
function clRecado(v,c,dest,a0,sd){const ho=clHog(v),m=dest===ho?0:(clRMin(ho,dest)||0);
  if(dest!==ho&&clRMin(ho,dest)==null)return false;
  if(c.dentro){const dn=(c.dentro[0]+pbH(sd+'n')*(c.dentro[1]-c.dentro[0]))/60;clTrip(v,ho,dest,a0,{k:'pan',txt:c.txt,dest,hasta:a0+m});clTrip(v,dest,ho,a0+m+dn,{k:'pan',txt:'va_pan_vuelta',dest:ho,pan:1,vuelta:1});return true;}
  if(c.quieto){const q=c.quieto,dur=(q[0]+pbH(sd+'d')*(q[1]-q[0]))/60,sa=a0+m;if(dest!==ho)clTrip(v,ho,dest,a0,{k:c.id,txt:c.txt,dest,hasta:sa});
    clDwell(v,dest,sa,sa+dur,c.id,{txt:dest===ho?'va_portal':c.txt,dest,sit:c.id==='banco'});if(dest!==ho)clTrip(v,dest,ho,sa+dur,{k:'casa',txt:'va_casa',dest:ho});return true;}
  return false;}
// la agenda entera del día
function clArmar(wd){const t0=performance.now();CL.recs=[];CL.byV=new Map();CL.span=new Map();CL.st=clStays(wd);CL.rellK=-1;
  const st=CL.st,recs=CL.recs,byV=CL.byV,H=v=>clHog(v),vec=pbVec().filter(v=>v&&clHog(v));CL.vec=vec;
  const colMin=((CLC().salida_cole_min)||6)/60;
  for(const v of vec){const ho=H(v),L=(st.get(v.id)||[]).filter(s=>cdPuerta(s.pl));
    let at=ho,free=-1;
    const salir=(from,to,t,o)=>{ // desde un centro de estudios se queda un rato en la acera (el corrillo de la salida)
      if(clEsc(from)){clDwell(v,from,t,t+colMin,'cole',{txt:'va_cole',dest:from});return clTrip(v,from,to,t+colMin,o);}return clTrip(v,from,to,t,o);};
    for(const s of L){if(s.a<=.01&&at===ho){at=s.pl;free=s.b;continue;}const mo=s.mo==='trabajo'?'trabajo':s.mo==='clase'?'clase':s.mo==='recoger'?'recoger':'lugar',tx='va_'+mo;
      if(at===ho){clTrip(v,ho,s.pl,s.a-(clRMin(ho,s.pl)||0),{k:mo,txt:tx,dest:s.pl,hasta:s.a});}
      else{const mh=clRMin(at,ho),mn=clRMin(ho,s.pl),mm=clRMin(at,s.pl),gap=s.a-free;
        if(mh!=null&&mn!=null&&gap>=mh+mn+.17+(clEsc(at)?colMin:0)){salir(at,ho,free,{k:'casa',txt:'va_casa',dest:ho});clTrip(v,ho,s.pl,s.a-mn,{k:mo,txt:tx,dest:s.pl,hasta:s.a});}
        else if(mm!=null)salir(at,s.pl,free,{k:mo,txt:tx,dest:s.pl,hasta:s.a});}
      at=s.pl;free=s.b;}
    if(at!==ho&&free>=0)salir(at,ho,free,{k:'casa',txt:'va_casa',dest:ho});}
  // ---- los menores de 12 solo van con una persona adulta de su casa
  const quitar=r=>{recs.splice(recs.indexOf(r),1);const l=byV.get(r.vid);l.splice(l.indexOf(r),1);};
  for(const k of vec){if(!(typeof k.edad==='number'&&k.edad<12))continue;
    for(const r of (byV.get(k.id)||[]).slice()){if(!r.R)continue;
      const ads=vec.filter(a=>a.hogar===k.hogar&&a!==k&&pbAdult(a)),ho=H(k);
      if(ads.some(a=>(byV.get(a.id)||[]).some(q=>q.R===r.R&&Math.abs(q.t0-r.t0)<.04)))continue;
      const vuelta=r.to===ho,m=r.m;let ok=null;
      for(const a of ads){if(vuelta?!clOcup(a,r.t0-m,r.te):!clOcup(a,r.t0,r.te+m))continue;ok=a;break;}
      if(!ok){quitar(r);for(const d of (byV.get(k.id)||[]).slice())if(d.fix&&d.k==='cole'&&Math.abs(d.te-r.t0)<1e-6)quitar(d);continue;}
      if(vuelta){const o=clTrip(ok,ho,r.from,r.t0-m,{k:'recoger',txt:'va_recoger',dest:r.from,hasta:r.t0});if(o)clTrip(ok,r.from,ho,r.t0,{k:'casa',txt:'va_casa',dest:ho});}
      else{clMk(ok,{t0:r.t0,t1:r.t1,te:r.te,R:r.R,from:r.from,to:r.to,m,k:r.k,txt:r.txt,dest:r.dest});clTrip(ok,r.to,ho,r.te,{k:'casa',txt:'va_casa',dest:ho});}}}
  CL.span=new Map();for(const r of recs){let l=CL.span.get(r.vid);if(!l)CL.span.set(r.vid,l=[]);l.push([r.t0,r.te]);}
  for(const r of recs)if(r.R){const g=recs.filter(q=>q.R===r.R&&Math.abs(q.t0-r.t0)<.04);if(g.length>1){g.sort((a,b)=>a.vid<b.vid?-1:1);const i=g.indexOf(r);r.off=[(i-(g.length-1)/2)*.7,(i%2)*.3];r.con=g.length-1;}}
  // ---- vida de calle del día: quien está en casa con un rato libre
  const gaps=v=>{const ho=H(v),tr=(byV.get(v.id)||[]).filter(r=>r.R).sort((a,b)=>a.t0-b.t0),L=st.get(v.id)||[],g=[];let casa=!(L.length&&L[0].a<=.01),desde=0;
    for(const r of tr){if(r.from===ho){if(casa)g.push([desde,r.t0]);casa=false;}if(r.to===ho){casa=true;desde=r.te;}}if(casa)g.push([desde,24]);return g;};
  const cfg=CLC(),rec=cfg.recados||[],dia=S.day;
  for(const v of vec){if(typeof v.edad==='number'&&v.edad<16)continue;const ho=H(v),hb=cdBarrioDe(ho),red=clRed(hb),gs=gaps(v);
    for(const c of rec){if(typeof v.edad==='number'&&(v.edad<c.edad[0]||v.edad>c.edad[1]))continue;
      c.franjas.forEach((f,i)=>{const sd=c.id+'|'+v.id+'|'+dia+'|'+i;if(pbH(sd+'p')>=Math.min(.95,c.p*red))return;
        const libre=(a,b)=>gs.some(g=>g[0]<=a&&g[1]>=b)&&!clOcup(v,a,b);
        if(c.paseo){const L=c.paseo,d=L[0]+pbH(sd+'d')*(L[1]-L[0]),q=cdPuerta(ho),cl=cmCalle(hb,q.p,true)||cmCalle(hb,q.p,false);if(!cl)return;const hor=cdHor(cl),ax=hor?0:1,lo=cl.a[ax],hi=cl.b[ax],x=q.p[ax],sg=(hi-x>=x-lo)?1:-1;
          const e=Math.max(lo+1,Math.min(hi-1,x+sg*d)),pt=hor?[hb,Math.round(e*10)/10,cl.a[1]]:[hb,cl.a[0],Math.round(e*10)/10],R1=cmRuta(ho,pt),R2=cmRuta(pt,ho);if(!R1||!R2||R1.min<2)return;
          const m1=R1.min/60,m2=R2.min/60,quieto=(3+pbH(sd+'q')*3)/60,a0=f[0]+pbH(sd+'t')*Math.max(0,f[1]-f[0]-m1-m2-quieto),a1=a0+m1+quieto+m2;if(!libre(a0,a1))return;
          clTrip(v,ho,pt,a0,{k:'perro',txt:c.txt,dest:ho,perro:1});const q2=R1.legs[R1.legs.length-1].pts.slice(-1)[0];clMk(v,{t0:a0+m1,t1:a0+m1,te:a0+m1+quieto,fix:{b:hb,x:q2[0],y:q2[1],dx:1,dy:0},k:'perro',txt:c.txt,dest:ho,perro:1,grupo:'p'+v.id});clTrip(v,pt,ho,a0+m1+quieto,{k:'perro',txt:c.txt,dest:ho,perro:1});return;}
        const ds=(c.destinos||[]).map(d=>d==='@casa'?ho:d).filter(d=>cdPuerta(d)&&cdBarrioDe(d)===hb&&!['casaV','casa2'].includes(d));if(!ds.length)return;
        const dest=ds[Math.floor(pbH(sd+'x')*ds.length)%ds.length],m=dest===ho?0:clRMin(ho,dest);if(m==null)return;
        const dur=c.dentro?(c.dentro[1]/60):(c.quieto[0]+pbH(sd+'d')*(c.quieto[1]-c.quieto[0]))/60,ab=Math.round((f[0]+pbH(sd+'s')*Math.max(0,f[1]-f[0]-dur))*12)/12,a0=ab-m;
        if(a0<0||!libre(a0,ab+dur+m))return;const r1=bmAhora(dest,dia,ab);if(r1&&!r1.on&&dest!==ho)return;
        clRecado(v,c,dest,a0,sd);});}}
  CL.act=null;CL.actK='';CL.ms=performance.now()-t0;}
function clAgenda(){const k=S.day+'|'+cmHome();if(CL.key!==k){CL.key=k;try{clArmar(dateOf(S.day).wd);}catch(e){console.error('agenda',e);CL.recs=[];CL.byV=new Map();CL.span=new Map();CL.st=new Map();}}return CL;}
// ---- relleno según se mira: si en el encuadre hay menos gente de la que toca a esta hora, quien está libre en casa baja a lo suyo por las calles que se ven
const clMeta=h=>{for(const [a,b,n] of (CLC().objetivo||[]))if(h>=a&&h<b)return n;return 0;};
function clRelleno(bar,h){const C=clAgenda(),k=Math.floor(S.t)+'|'+bar;if(C.rellK===k)return;C.rellK=k;const meta=clMeta(h);if(!meta)return;
  const near=(x,y)=>{const [u,v]=cmW2V(x,y),[px,py]=P(u,v),sx=cam.x+px*cam.z,sy=cam.y+py*cam.z;return sx>-30&&sx<W+30&&sy>-90&&sy<H+50;};let cerca=0;
  for(const a of clActivos(bar,h))if(near(a.p.x,a.p.y))cerca++;
  for(const r of C.recs)if(r.t0>h&&r.t0<h+.03&&r.R&&r.R.legs[0].b===bar&&near(r.R.legs[0].pts[0][0],r.R.legs[0].pts[0][1]))cerca++;
  for(let rep=0;rep<2&&cerca<meta;rep++){const dia=S.day,rec=(CLC().recados||[]).filter(c=>c.id!=='perro');let best=null;
  for(const v of C.vec){if(typeof v.edad==='number'&&v.edad<16)continue;const ho=clHog(v);if(cdBarrioDe(ho)!==bar)continue;
    if(clOcup(v,h-.003,h+.02))continue;const pr=(C.byV.get(v.id)||[]).filter(r=>r.te<=h).sort((a,b)=>b.te-a.te)[0];if(pr&&pr.to!==ho)continue;
    for(const c of rec){if(typeof v.edad==='number'&&(v.edad<c.edad[0]||v.edad>c.edad[1]))continue;
      for(const d0 of c.destinos||[]){const dest=d0==='@casa'?ho:d0;if(!cdPuerta(dest)||cdBarrioDe(dest)!==bar||['casaV','casa2'].includes(dest))continue;
        const ab=bmAhora(dest,dia,h);if(ab&&!ab.on&&dest!==ho)continue;const R=dest===ho?null:cmRuta(ho,dest);if(dest!==ho&&(!R||R.legs[0].b!==bar))continue;
        if(clOcup(v,h-.003,h+((R?R.min*2:0)+(c.dentro?c.dentro[1]:c.quieto[0]))/60))continue;
        let sc=0;if(R){const pts=R.legs[0].pts;let n=0,t=0;for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],l=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let d=0;d<l;d+=3){const f=d/l;t++;if(near(a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f))n++;}}sc=t?n/t*.6:0;}
        const q=cmPuertaPts(dest);if(c.quieto&&q&&near(q.side[0],q.side[1]))sc+=1;
        if(sc<.25)continue;sc+=pbH('rl'+v.id+dest+c.id+Math.floor(S.t))*.3;if(!best||sc>best.sc)best={sc,v,c,dest};}}}
  if(!best){ // nadie con un recado que pase por aquí: quien esté libre sale a dar una vuelta hasta un punto de la calle que se ve
    const [fu,fv]=screenToView(W/2,H*.46),[fx,fy]=v2w(fu,fv),sn=cmSnap(bar,fx+CMF[0],fy+CMF[1]);let bp=null;
    if(sn){const pt=[bar,Math.round(sn.p[0]*10)/10,Math.round(sn.p[1]*10)/10];
      for(const v of C.vec){if(typeof v.edad==='number'&&v.edad<16)continue;const ho=clHog(v);if(cdBarrioDe(ho)!==bar||clOcup(v,h-.003,h+.02))continue;
        const pr=(C.byV.get(v.id)||[]).filter(r=>r.te<=h).sort((a,b)=>b.te-a.te)[0];if(pr&&pr.to!==ho)continue;
        const R=cmRuta(ho,pt);if(!R||R.min<1||R.min>14||clOcup(v,h-.003,h+(R.min*2+8)/60))continue;const sc=pbH('pv'+v.id+Math.floor(S.t))-R.min/40;if(!bp||sc>bp.sc)bp={sc,v,pt,R};}}
    if(!bp)break;const v=bp.v,ho=clHog(v),R2=cmRuta(bp.pt,ho),m1=bp.R.min/60,q=(4+pbH('pq'+v.id+Math.floor(S.t))*5)/60,perro=pbH('pp'+v.id)<.5,a0=h+.004,tx=perro?'va_perro':'va_paseo';
    clTrip(v,ho,bp.pt,a0,{k:'paseo',txt:tx,dest:ho,perro:perro?1:0});const q2=bp.R.legs[bp.R.legs.length-1].pts.slice(-1)[0];
    clMk(v,{t0:a0+m1,t1:a0+m1,te:a0+m1+q,fix:{b:bar,x:q2[0],y:q2[1],dx:1,dy:0},k:'paseo',txt:tx,dest:ho,perro:perro?1:0,grupo:'p'+v.id});clTrip(v,bp.pt,ho,a0+m1+q,{k:'paseo',txt:tx,dest:ho,perro:perro?1:0});cerca++;continue;}
  clRecado(best.v,best.c,best.dest,h+.004,'rl|'+best.v.id+'|'+dia+'|'+Math.floor(S.t)+'|'+rep);cerca++;}}
// ¿anda ahora por la calle? (para no tenerle también dentro de un sitio)
{vecinosEn=function(lugar,hora,wd){const out=clVe.apply(this,arguments);try{if(wd!==dateOf(S.day).wd||!out.length)return out;const C=clAgenda();
    return out.filter(q=>{const l=C.span.get(q.v.id);if(!l)return true;for(const s of l)if(hora>=s[0]&&hora<s[1])return false;return true;});}catch(e){console.error(e);return out;}};}
// dónde está un trozo a una hora: {b,x,y,dx,dy,walk,leg} o null si no se ve (dentro de un sitio, en el metro)
function clPosRec(r,h){if(r.fix)return {b:r.fix.b,x:r.fix.x,y:r.fix.y,dx:r.fix.dx,dy:r.fix.dy,walk:false,fix:true};
  const f=r.t1>r.t0?Math.max(0,Math.min(1,(h-r.t0)/(r.t1-r.t0))):1,{i,lf}=cmEnRuta(r.R,f),l=r.R.legs[i];if(!l||l.k==='viaje')return null;
  if(l.k==='pie'){const p=cmAlong(l.pts,lf);return {b:l.b,x:p.x,y:p.y,dx:p.dx,dy:p.dy,walk:f<1&&f>0&&l.pts.length>1,leg:l};}
  return {b:l.b,x:l.p[0],y:l.p[1],dx:0,dy:-1,walk:false,leg:l};}
// los que se ven ahora en un barrio: [{r, p}] (la lista se recalcula cada minuto de juego; las posiciones, en cada fotograma)
function clActivos(bar,h){const C=clAgenda(),k=Math.floor(h*60)+'|'+bar;if(C.actK!==k){C.actK=k;C.act=C.recs.filter(r=>h>=r.t0&&h<r.te);}
  const out=[];for(const r of C.act){const p=clPosRec(r,h);if(!p||p.b!==bar)continue;out.push({r,p});}return out;}
// compatibilidad: quienes andan por el barrio a una hora (lo que usaba el viejo cmPlanGente)
cmPlanGente=function(bar,h,wd){const out=[];for(const {r,p} of clActivos(bar,h)){if(!r.R)continue;out.push({v:r.v,R:r.R,f:r.t1>r.t0?(h-r.t0)/(r.t1-r.t0):1,t:r.k==='trabajo',rec:r,p});}return out;};
// ---- dibujo de una figura de calle
function clItems(a,tt,vis){const r=a.r,p=a.p,h=S.t/60;const [pp,qq]=[p.x+(r.off?r.off[0]:0),p.y+(r.off?r.off[1]:0)];if(!vis(pp,qq))return [];const [u,v]=cmW2V(pp,qq),out=[];
  const sit=r.sit&&p.fix,ph=tt*8+r.v.id.length,talk=r.k==='corrillo'||r.k==='cole';
  if(sit)out.push({d:u+v-.2,f:()=>{prism(u-.9,v-.45,u+.9,v+.05,0,5,'#8a6440');prism(u-.9,v-.55,u+.9,v-.4,5,13,'#9a7450');}});
  const dir=p.walk?[p.dx,p.dy]:[r.perro&&p.fix?-1:p.dx,p.dy];
  out.push({d:u+v,f:()=>{const c=cmCuerpo(0,0,dir[0],dir[1]),[px,py]=P(u,v),e=r.v.edad,sc=typeof pbEscala==='function'?pbEscala(e):1;
    ctx.save();if(sc!==1){ctx.translate(px,py);ctx.scale(sc,sc);ctx.translate(-px,-py);}
    const act=talk&&!(typeof e==='number'&&e<6)?(((tt*.9+r.v.id.length)%3<1.5)===(r.idx%2===0)?'talk':null):null;
    sPerson(u,v,cmChOf(r.v),{pose:sit?'sit':p.walk?'walk':'stand',front:sit?true:c.front,right:c.right,ph:p.walk?ph:0,act,name:r.v.n,rot:{hogar:r.v.hogar,trab:false}});
    if(r.perro)emoji('🐕',px+(c.right?-14:14),py-3,13);if(r.pan&&r.vuelta)emoji('🥖',px+(c.right?7:-7),py-22,9);
    ctx.restore();}});
  return out;}
// la ficha: adónde va (si anda por la calle)
function clAhora(vid,h){const C=clAgenda();h=h==null?S.t/60:h;for(const r of C.byV.get(vid)||[])if(h>=r.t0&&h<r.te){const p=clPosRec(r,h);return {r,p,visible:!!p};}return null;}
function clFichaTxt(v){const a=clAhora(v.id);if(!a)return '';const r=a.r,dest=r.dest&&r.dest!==clHog(r.v)?bmName(r.dest):'';let t='';
  if(a.p&&a.p.leg&&a.p.leg.k==='espera')t=cmT('va_espera',{linea:a.p.leg.linea||''});
  else if(!a.p)t=r.R&&r.R.legs.some(l=>l.k==='viaje'&&l.linea)?cmT('va_viaje',{linea:(r.R.legs.find(l=>l.k==='viaje'&&l.linea)||{}).linea}):cmT(r.txt||'va_lugar',{lugar:dest});
  else t=cmT(r.txt||'va_lugar',{lugar:dest});
  if(r.con&&r.R){const o=(CL.byV.size?[...CL.recs].find(q=>q!==r&&q.R===r.R&&Math.abs(q.t0-r.t0)<.04):null);if(o)t+=' · '+cmT('va_con',{quien:o.v.n});}
  return t;}
{const _vf=vcFicha;vcFicha=function(v){const h=_vf.apply(this,arguments);try{const t=v&&clFichaTxt(v);if(!t)return h;const i=h.indexOf('</div></div>');if(i<0)return h;return h.slice(0,i)+`<div class="vfs vfva">${vcEsc(t)}</div>`+h.slice(i);}catch(e){console.error(e);return h;}};}
