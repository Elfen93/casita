// =================== EL BARRIO ===================
// La parcela ocupa 0..N. Alrededor: acera, calzada, acera y manzanas.
const BR=14; // ancho del barrio a cada lado
const PLACES={
  biblioteca:{n:'Biblioteca municipal',e:'📚',r:[-2,-12,4,-6],h:30,c:'#b9c6d8',d:'Silencio, wifi gratis y temarios de oposiciones.',outs:['biblioteca']},
  ayto:{n:'Ayuntamiento',e:'🏛️',r:[6,-12,13,-5],h:46,c:'#e7dcc2',d:'Plenos, papeleo y la plaza donde acaban las manifestaciones.',outs:['militancia']},
  casaV:{n:'Casa de la vecina',e:'🏘️',r:[15,-10,18,-6],h:24,c:'#e8b7a0',roof:'#a5533e',d:'',outs:[]},
  casa2:{n:'Casa de los Ruiz',e:'🏠',r:[19,-10,22,-6],h:24,c:'#c9d8b6',roof:'#6b7f4a',d:'Una familia con tres críos y un perro que no calla.',outs:[]},
  sindicato:{n:'Local del sindicato',e:'✊',r:[26,-12,32,-6],h:30,c:'#e6c9c0',d:'Asambleas los jueves. Café malo, ideas buenas.',outs:['sindicato']},
  ateneo:{n:'Ateneo del barrio',e:'📢',r:[-12,-12,-6,-6],h:28,c:'#d8c3dc',d:'Charlas, asambleas, talleres y una biblioteca de libros prestados.',outs:['militancia']},
  super:{n:'Supermercado',e:'🛒',r:[-12,-2,-5,7],h:32,c:'#efe9dc',acc:'#e85d3f',d:'Donde trabaja medio barrio y compra el otro medio.',outs:[]},
  bar:{n:'Bar Manolo',e:'🍺',r:[-10,8,-5,11],h:26,c:'#d9a066',d:'Cañas, tapas y tertulias a gritos.',outs:['amigos']},
  tienda:{n:'Local comercial',e:'🏪',r:[-10,12,-5,14],h:24,c:'#c7d2d8',d:'Un local pequeño a pie de calle.',outs:[]},
  parroquia:{n:'Parroquia de San Roque',e:'⛪',r:[-12,16,-6,22],h:40,c:'#d6c4a2',d:'Misa a las once y vermú a las doce.',outs:['misa','voluntariado']},
  comisaria:{n:'Comisaría',e:'🚓',r:[-12,26,-6,32],h:30,c:'#9fb0c6',d:'Nadie entra por gusto.',outs:[]},
  torre:{n:'Torre de oficinas',e:'🏢',r:[-2,25,5,32],h:96,c:'#9fb4c8',glass:1,d:'Oficinas, coworking y afterworks en la azotea.',outs:['networking']},
  obra:{n:'Obra en construcción',e:'🏗️',r:[7,25,13,31],h:44,c:'#bdb6aa',obra:1,d:'Un bloque nuevo. «Viviendas de lujo», dice el cartel.',outs:[]},
  residencia:{n:'Residencia Los Olivos',e:'🩺',r:[15,25,22,31],h:34,c:'#f1e3d3',d:'Ochenta abuelos y pocas manos.',outs:[]},
  sala:{n:'Sala El Sótano',e:'🎸',r:[26,26,32,32],h:28,c:'#6d3a48',d:'Conciertos de jueves a sábado. Cerveza caliente, música en directo.',outs:['amigos']},
  parque:{n:'Parque del Río',e:'🌳',r:[25,-3,33,12],park:1,d:'Para correr, para manifestarse y para no hacer nada.',outs:['deporte','manifestacion']},
  comedor:{n:'Banco de alimentos',e:'🥫',r:[25,14,30,18],h:24,c:'#c9d6c3',d:'Cada semana, más gente en la cola.',outs:['voluntariado','comedor']},
  coop:{n:'Cooperativa La Colmena',e:'🤝',r:[25,19,31,23],h:26,c:'#e9d27a',d:'Taller y cooperativa de trabajo. Aquí se decide en asamblea.',outs:[]},
};
// adónde va Ana según lo que haga
function destOf(k){
  if(k==='work'){return {oficina:'torre',tech:'torre',super:'super',hosteleria:'bar',obra:'obra',cuidados:'residencia',funcion:'ayto',reparto:'_ride',arte:'sala',negocio:'tienda',coop:'coop'}[S.track]||'torre';}
  return {amigos:pickR(['bar','sala','parque']),eat:'bar',sindicato:'sindicato',militancia:isI('conservadora')?'parroquia':isI('liberal','libertaria')?'torre':isI('socialdemocrata')?'ayto':'ateneo',manifestacion:'ayto',voluntariado:isI('conservadora')?'parroquia':'comedor',deporte:'parque',networking:'torre',misa:'parroquia',biblioteca:'biblioteca',comedor:'comedor',piquete:destOf('work'),calabozo:'comisaria',walk:'parque'}[k]||'parque';
}
// el anillo de la calzada (centro a 2 casillas de la parcela)
const RING=[[-2,-2],[N+2,-2],[N+2,N+2],[-2,N+2]];
const RLEN=4*(N+4);
function ringPt(t){t=((t%RLEN)+RLEN)%RLEN;const L=N+4;const k=Math.floor(t/L),f=t-k*L;const a=RING[k],b=RING[(k+1)%4];return [a[0]+(b[0]-a[0])*f/L,a[1]+(b[1]-a[1])*f/L];}
function ringT(x,y){ // proyección de un punto sobre el anillo
  const L=N+4;const c=[[Math.max(-2,Math.min(N+2,x)),-2],[N+2,Math.max(-2,Math.min(N+2,y))],[Math.max(-2,Math.min(N+2,x)),N+2],[-2,Math.max(-2,Math.min(N+2,y))]];
  let best=0,bd=1e9;c.forEach(([px,py],k)=>{const d=Math.hypot(px-x,py-y);if(d<bd){bd=d;best=k;}});const [px,py]=c[best];
  return best===0?px+2:best===1?L+py+2:best===2?2*L+(N+2-px):3*L+(N+2-py);}
function doorOf(key){const p=PLACES[key];if(!p)return [N/2,N+3.5];const [x0,y0,x1,y1]=p.r;const cx=(x0+x1)/2,cy=(y0+y1)/2;
  if(x1<=-4)return [x1+.4,Math.max(-3,Math.min(N+3,cy))];if(x0>=N+4)return [x0-.4,Math.max(-3,Math.min(N+3,cy))];if(y1<=-4)return [Math.max(-3,Math.min(N+3,cx)),y1+.4];return [Math.max(-3,Math.min(N+3,cx)),y0-.4];}
function routeTo(from,key){
  const door=doorOf(key);const t0=ringT(from[0],from[1]),t1=ringT(door[0],door[1]);
  let d=t1-t0;if(d>RLEN/2)d-=RLEN;if(d<-RLEN/2)d+=RLEN;
  const pts=[from,ringPt(t0)];const steps=Math.max(1,Math.ceil(Math.abs(d)/2));for(let i=1;i<=steps;i++)pts.push(ringPt(t0+d*i/steps));pts.push(door);return pts;}
function alongRoute(pts,f){let tot=0;const seg=[];for(let i=1;i<pts.length;i++){const l=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);seg.push(l);tot+=l;}
  let d=Math.max(0,Math.min(1,f))*tot;for(let i=0;i<seg.length;i++){if(d<=seg[i]||i===seg.length-1){const k=seg[i]?Math.min(1,d/seg[i]):1;const a=pts[i],b=pts[i+1];return [a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,b[0]-a[0],b[1]-a[1]];}d-=seg[i];}return [...pts[pts.length-1],0,0];}
// gente del barrio
const WALKERS=Array.from({length:12},(_,k)=>{const r=hash(k*37+3),r2=hash(k*53+11);const g=r<.5?'f':'m';
  return {t:hash(k*17+1)*RLEN,sp:(0.5+r2*0.6)*(k%2?1:-1),off:k%2?-0.75:0.75,ch:{name:'',g,skin:SKINS[(k*3)%SKINS.length],hair:HAIRCOLS[(k*5)%7],style:g==='f'?['melena','coleta','corto','mono','rizos'][k%5]:['corto','rapado','calvo','rizos'][k%4],beard:g==='m'&&k%3===0?'corta':'no',glasses:k%4===0,build:['media','delgada','ancha'][k%3],shirt:SHIRTC[(k*7)%SHIRTC.length],pants:PANTSC[k%PANTSC.length],eyes:'#3b2a20'},ph:k};});
const CARS=Array.from({length:4},(_,k)=>({t:k*RLEN/4+hash(k)*8,sp:(k%2?1:-1)*(3+hash(k*9)*2),c:['#d9534f','#5bc0be','#f0ad4e','#3b3f46'][k]}));
// ---------- dibujo ----------
function vrect(r){const a=w2v(r[0],r[1]),b=w2v(r[2],r[3]);return [Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1])];}
function drawBarrioGround(night){
  const b0=-BR,b1=N+BR;
  prism(b0,b0,b1,b1,-30,-4,'#7d6a55');prism(b0,b0,b1,b1,-4,0,'#cfc7b6');
  topQuad(-4,-4,N+4,N+4,0.02,'#d8d2c4');topQuad(-3,-3,N+3,N+3,0.04,'#5d6168');topQuad(-1,-1,N+1,N+1,0.06,'#d8d2c4');
  // líneas de la calzada
  ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=1.4;ctx.setLineDash([7,9]);ctx.beginPath();const p=[[-2,-2],[N+2,-2],[N+2,N+2],[-2,N+2]].map(([x,y])=>{const [u,v]=w2v(x,y);return P(u,v,.08);});ctx.moveTo(...p[0]);for(let i=1;i<4;i++)ctx.lineTo(...p[i]);ctx.closePath();ctx.stroke();ctx.setLineDash([]);
  // paso de cebra frente a la casa
  for(let k=0;k<5;k++){const [u0,v0]=w2v(N/2-1.5+k*.7,N+1),[u1,v1]=w2v(N/2-1.1+k*.7,N+3);topQuad(Math.min(u0,u1),Math.min(v0,v1),Math.max(u0,u1),Math.max(v0,v1),.09,'rgba(255,255,255,.75)');}
  topQuad(0,0,N,N,0.1,shade(LAWN,.8));
  // parque
  const pk=vrect(PLACES.parque.r);topQuad(pk[0],pk[1],pk[2],pk[3],.1,shade(LAWN,.95));
}
function placeState(key){const w=W_(),cr=w.crisis,st={};
  st.closed=(w.gs===S.day||!!w.rev)&&!['parque','comisaria','ayto','comedor','ateneo','sindicato'].includes(key);
  st.forRent=key==='tienda'&&S.track!=='negocio'&&cr>55;
  st.queue=key==='comedor'?Math.min(9,Math.floor(cr/11)):0;
  st.picket=S.strike&&S.strike.on&&key===destOf('work');
  st.posters=w.mov>35||(S.day>w.elec-12&&S.day<w.elec);
  return st;}
function drawBuilding(key,tt,night){
  const p=PLACES[key];const [u0,v0,u1,v1]=vrect(p.r);const st=placeState(key);const cu=(u0+u1)/2,cv=(v0+v1)/2;
  if(p.park){
    for(let k=0;k<9;k++){const x=u0+.8+hash(k*7+2)*(u1-u0-1.6),y=v0+.8+hash(k*13+5)*(v1-v0-1.6);const se=seasonOf();const [px,py]=P(x,y);
      capsule(px,py,px,py-16,3,'#6b4a2e');if(se!=='inv')for(const [dx,dy,r] of [[0,-24,11],[-6,-20,8],[6,-19,8]])circ(px+dx,py+dy,r,{pri:'#5cae4c',ver:'#4a9a43',oto:'#d98b2e'}[se]);else capsule(px,py-16,px-5,py-24,1.5,'#6b4a2e');}
    cyl(cu,cv,.9,0,5,'#c9c3b8','#7cc8f0');
    return;}
  const h=p.h;let col=p.c;
  if(p.obra){for(const [a,b] of [[u0,v0],[u1,v0],[u0,v1],[u1,v1],[cu,v1],[u1,cv]])prism(a-.15,b-.15,a+.15,b+.15,0,h,'#9a948a');for(let z=12;z<=h;z+=14)prism(u0,v0,u1,v1,z-1.5,z,'#b3ada2');
    const [cx,cy]=P(u0+.5,v0+.5,h+40);const [bx,by]=P(u0+.5,v0+.5,0);capsule(bx,by,cx,cy,3,'#f0ad4e');capsule(cx,cy,cx+70,cy+4,2.5,'#f0ad4e');capsule(cx+60,cy+4,cx+60,cy+30+Math.sin(tt)*4,1,'#555');
    if(dayType(S.day)==='work'&&S.t/60>7&&S.t/60<15&&!st.closed)emoji('👷',...P(cu,v1+.2,8),12);return;}
  prismG(u0,v0,u1,v1,0,h,col);
  // ventanas
  const lit=(k)=>night>0.3&&hash(k+key.length*31+Math.floor(S.day/3))>0.35;
  for(let z=8;z<h-5;z+=13){
    for(let u=u0+.25;u<u1-.3;u+=1){const k=Math.round(u*7+z);poly([P(u,v1,z),P(u+.5,v1,z),P(u+.5,v1,z+7),P(u,v1,z+7)],p.glass?`rgba(${lit(k)?'255,226,140,.9':'40,60,90,.45'})`:lit(k)?'#ffe08a':'rgba(60,70,95,.55)');}
    for(let v=v0+.25;v<v1-.3;v+=1){const k=Math.round(v*11+z);poly([P(u1,v,z),P(u1,v+.5,z),P(u1,v+.5,z+7),P(u1,v,z+7)],p.glass?`rgba(${lit(k)?'255,226,140,.9':'40,60,90,.35'})`:lit(k)?'#ffe08a':'rgba(60,70,95,.45)');}}
  if(p.acc)poly([P(u0,v1,h-8),P(u1,v1,h-8),P(u1,v1,h-3),P(u0,v1,h-3)],p.acc);
  if(p.roof){const [a,b]=[P(u0,v0,h),P(u1,v1,h)];poly([P(u0,v1,h),P(u1,v1,h),P(cu,cv,h+14)],shade(p.roof,.9));poly([P(u1,v0,h),P(u1,v1,h),P(cu,cv,h+14)],shade(p.roof,.75));}
  if(key==='parroquia'){prismG(u0,v0,u0+1.4,v0+1.4,h,h+30,shade(col,1.05));emoji('🔔',...P(u0+.7,v0+.7,h+24),11);}
  if(key==='ayto'){const [fx,fy]=P(cu,cv,h);capsule(fx,fy,fx,fy-30,1.4,'#555');const era=W_().era;const fc=era==='consejos'?'#d1242f':era==='comunas'?null:'#e9c46a';
    if(fc){ctx.fillStyle=fc;ctx.beginPath();ctx.moveTo(fx,fy-30);ctx.quadraticCurveTo(fx+9,fy-30+Math.sin(tt*3)*2,fx+18,fy-28);ctx.lineTo(fx+18,fy-19);ctx.quadraticCurveTo(fx+9,fy-21+Math.sin(tt*3)*2,fx,fy-21);ctx.fill();}
    else{ctx.fillStyle='#d1242f';ctx.beginPath();ctx.moveTo(fx,fy-30);ctx.lineTo(fx+18,fy-30);ctx.lineTo(fx,fy-21);ctx.fill();ctx.fillStyle='#111';ctx.beginPath();ctx.moveTo(fx+18,fy-30);ctx.lineTo(fx+18,fy-21);ctx.lineTo(fx,fy-21);ctx.fill();}}
  // persianas, carteles y pancartas
  if(st.closed||st.forRent){poly([P(u0+.2,v1,0),P(u1-.2,v1,0),P(u1-.2,v1,12),P(u0+.2,v1,12)],'#8a8f98');for(let z=2;z<12;z+=2){const a=P(u0+.2,v1,z),b=P(u1-.2,v1,z);capsule(a[0],a[1],b[0],b[1],.6,'#6f747c');}
    const [lx,ly]=P(cu,v1,7);label(st.forRent?'SE ALQUILA':'HUELGA',lx,ly,st.forRent?'#fffdf8':'#d1242f',st.forRent?'#c0392b':'#fff',8);}
  if(st.posters){for(let k=0;k<3;k++){const u=u0+.5+k*.9;if(u>u1-.5)break;poly([P(u,v1,3),P(u+.5,v1,3),P(u+.5,v1,9),P(u,v1,9)],['#d1242f','#7a6fd0','#2f8a5a','#e9c46a'][(k+key.length)%4]);}}
  if(W_().mov>60&&['ateneo','sindicato','super','residencia','obra','comedor'].includes(key)){const a=P(u0+.2,v1,h-14),b=P(u1-.2,v1,h-14);capsule(a[0],a[1],b[0],b[1],6,'#fffdf8');const [lx,ly]=P(cu,v1,h-14);ctx.fillStyle='#d1242f';ctx.font='900 7px Nunito';ctx.textAlign='center';ctx.fillText(pickSlogan(key),lx,ly+2);}
}
function pickSlogan(k){const s=['¡NI UN DESAHUCIO MÁS!','SALARIOS DIGNOS','LA SANIDAD NO SE VENDE','TU PRISA, MI PRECARIEDAD','VIVIENDA PARA VIVIR'];return s[(k.length+(W_().era?2:0))%s.length];}
function drawPlaceLabel(key,night){const p=PLACES[key];const [u0,v0,u1,v1]=vrect(p.r);const [x,y]=P((u0+u1)/2,(v0+v1)/2,(p.h||4)+(key==='parroquia'?34:key==='obra'?50:10));
  if(cam.z<0.5)return;ctx.globalAlpha=0.92;label(`${p.e} ${key==='tienda'&&S.track==='negocio'?'Tu tienda':key==='casaV'&&P_('vecina')?'Casa de '+P_('vecina').n:p.n}`,x,y,night>0.5?'rgba(40,30,60,.85)':'rgba(255,253,248,.92)',night>0.5?'#fff':'#3b3247',9);ctx.globalAlpha=1;}
function drawPerson(u,v,ch,dirx,diry,walk,ph){
  const [x,y]=P(u,v);const old=anaRT.phase;anaRT.phase=ph;const right=(dirx-diry)>=0,front=(dirx+diry)>=0;
  ctx.save();drawAna(x,y,{ch,shirt:ch.shirt,mood:60,front,right,pose:walk?'walk':'stand',noShadow:false});ctx.restore();anaRT.phase=old;}
// Ana fuera de casa: viaje, destino y pin
function anaAbroad(tt){
  const s=S.sim;if(!(s.work>0)||!s.dest)return null;const tot=s.awayTotal||s.work,el=tot-s.work,tr=Math.min(20,tot/3);
  if(s.dest==='_ride'){const t=ringT(...(s.exit||[N/2,N]))+el*0.9*(s.rideDir||1);const [x,y]=ringPt(t);return {x,y,dx:s.rideDir||1,dy:0,walk:true,ride:true};}
  const from=s.exit?[s.exit[0]+.5,s.exit[1]+.5]:[N/2,N];const route=s.route||(s.route=routeTo(from,s.dest));
  if(el<tr){const [x,y,dx,dy]=alongRoute(route,el/tr);return {x,y,dx,dy,walk:true};}
  if(s.work<tr){const [x,y,dx,dy]=alongRoute(route,s.work/tr);return {x,y,dx:-dx,dy:-dy,walk:true};}
  return {inside:s.dest};
}
function drawPin(key,tt){const p=PLACES[key];if(!p)return;const [u0,v0,u1,v1]=vrect(p.r);const [x,y]=P((u0+u1)/2,(v0+v1)/2,(p.h||6)+(key==='parroquia'?34:key==='obra'?50:10)+22+Math.sin(tt*3)*2);
  ctx.save();ctx.fillStyle='#fffdf8';ctx.beginPath();ctx.arc(x,y,13,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(x-5,y+11);ctx.lineTo(x,y+19);ctx.lineTo(x+5,y+11);ctx.fill();
  ctx.beginPath();ctx.arc(x,y,11,0,Math.PI*2);ctx.clip();const hp=document.getElementById('hudpor');if(hp)ctx.drawImage(hp,x-11,y-11,22,22);ctx.restore();
  ctx.strokeStyle='#ff8a5b';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,12,0,Math.PI*2);ctx.stroke();}
// lista de cosas del barrio con su profundidad, para dibujarlas en orden
function barrioItems(tt,night){
  const items=[];const dk=(u,v)=>u+v;
  for(const k in PLACES){const [u0,v0,u1,v1]=vrect(PLACES[k].r);items.push({d:dk(u1,v1)-0.5,f:()=>drawBuilding(k,tt,night),lab:()=>drawPlaceLabel(k,night)});}
  const h=S.t/60,crowd=night>0.7?0.35:1;
  WALKERS.forEach((w,k)=>{if(k/WALKERS.length>crowd)return;const t=w.t+tt*w.sp;const [x,y]=ringPt(t);const nx=x+(Math.abs(y+2)<.01||Math.abs(y-N-2)<.01?0:Math.sign(x-N/2))*(1.6+w.off*0)+0,ny=y;
    // acera exterior: desplaza 1,6 hacia fuera del anillo
    const ox=x<=-1.99?-1.55:x>=N+1.99?1.55:0,oy=y<=-1.99?-1.55:y>=N+1.99?1.55:0;const [px,py]=[x+ox,y+oy];const a=ringPt(t+0.1);const [u,v]=w2v(px,py);const [au,av]=w2v(a[0],a[1]);const [bu,bv]=w2v(x,y);
    items.push({d:u+v,f:()=>drawPerson(u,v,w.ch,(au-bu)*Math.sign(w.sp),(av-bv)*Math.sign(w.sp),true,tt*6*Math.abs(w.sp)+w.ph)});});
  CARS.forEach(c=>{const t=c.t+tt*c.sp;const [x,y]=ringPt(t);const off=c.sp>0?-.45:.45;const ox=Math.abs(y+2)<.01?0:Math.abs(y-N-2)<.01?0:0;const a=ringPt(t+Math.sign(c.sp)*.3);const dx=a[0]-x,dy=a[1]-y;const px=x+(dy?off*Math.sign(dy):0),py=y+(dx?-off*Math.sign(dx):0);const [u,v]=w2v(px,py);
    items.push({d:u+v,f:()=>drawCar(u,v,c.c,w2v(px+dx,py+dy),night)});});
  // cola del comedor y piquetes
  const st=placeState('comedor');if(st.queue){const dr=doorOf('comedor');for(let k=0;k<st.queue;k++){const [u,v]=w2v(dr[0]-1.2-k*0.55,dr[1]-1.5+k*0.15);const w=WALKERS[k%WALKERS.length];items.push({d:u+v,f:()=>drawPerson(u,v,w.ch,-1,0,false,k)});}}
  const wk=destOf('work');if(S.strike&&S.strike.on&&PLACES[wk]){const dr=doorOf(wk);for(let k=0;k<5;k++){const [u,v]=w2v(dr[0]+(k-2)*.6,dr[1]+(dr[1]<0?.6:-.6)*(k%2+1)*0+0.2);const w=WALKERS[(k+3)%WALKERS.length];items.push({d:u+v,f:()=>{drawPerson(u,v,w.ch,0,1,false,k);const [x,y]=P(u,v,52);emoji('🪧',x,y,13);}});}}
  // manifestación
  const m=W_().manif;if(m&&m.day===S.day&&h>=10&&h<=14){const dr=doorOf('ayto');for(let k=0;k<16;k++){const [u,v]=w2v(dr[0]-3+(k%8)*.8,dr[1]+1.5+Math.floor(k/8)*.9);const w=WALKERS[k%WALKERS.length];items.push({d:u+v,f:()=>{drawPerson(u,v,w.ch,0,1,true,tt*3+k);if(k%3===0){const [x,y]=P(u,v,54);emoji(k%2?'📣':'🚩',x,y,12);}}});}}
  if(W_().era==='represion'||(m&&m.day===S.day&&W_().gov==='conservador')){const [u,v]=w2v(-2,N/2);items.push({d:u+v,f:()=>{drawCar(u,v,'#2b3a5a',w2v(-2,N/2+1),night);const [x,y]=P(u,v,30);emoji('🚨',x,y,10);}});}
  // la vecina en su puerta
  if(h>9&&h<13&&dayType(S.day)!=='work'&&P_('vecina')){const dr=doorOf('casaV');const [u,v]=w2v(dr[0],dr[1]+.6);items.push({d:u+v,f:()=>drawPerson(u,v,{...WALKERS[2].ch,hair:'#bdbdbd',style:'mono',g:'f',beard:'no'},0,1,false,1)});}
  // Ana por la calle
  const ab=anaAbroad(tt);
  if(ab&&!ab.inside){const [u,v]=w2v(ab.x,ab.y);const [du,dv]=w2v(ab.x+ab.dx,ab.y+ab.dy);items.push({d:u+v,f:()=>{const [x,y]=P(u,v);const old=anaRT.phase;anaRT.phase=tt*9;drawAna(x,y,{...anaOpts(),pose:'walk',front:(du-u)+(dv-v)>=0,right:(du-u)-(dv-v)>=0});anaRT.phase=old;if(ab.ride)emoji('🛵',x+6,y-2,16);
      ctx.save();ctx.globalAlpha=.9;label(CH().name,x,y-62,'#ff8a5b','#fff',9);ctx.restore();}});}
  return {items,ab};
}
function drawCar(u,v,col,ahead,night){const du=ahead[0]-u,dv=ahead[1]-v;const along=Math.abs(du)>Math.abs(dv);const [a,b]=along?[.7,.38]:[.38,.7];
  prism(u-a,v-b,u+a,v+b,2,9,col);prism(u-a*.6,v-b*.6,u+a*.6,v+b*.6,9,14,shade(col,1.1));
  poly([P(u-a*.6,v+b*.6,9.5),P(u+a*.6,v+b*.6,9.5),P(u+a*.6,v+b*.6,13.5),P(u-a*.6,v+b*.6,13.5)],'rgba(180,220,255,.7)');
  if(night>0.4){const [x,y]=P(u+Math.sign(du)*a,v+Math.sign(dv)*b,5);const g=ctx.createRadialGradient(x,y,1,x,y,18);g.addColorStop(0,'rgba(255,240,180,.7)');g.addColorStop(1,'rgba(255,240,180,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,18,0,Math.PI*2);ctx.fill();}}
function drawStreetLights(night){
  for(let k=0;k<RLEN;k+=6){const [x,y]=ringPt(k);const ox=x<=-1.99?-1.7:x>=N+1.99?1.7:0,oy=y<=-1.99?-1.7:y>=N+1.99?1.7:0;const [u,v]=w2v(x+ox,y+oy);const [bx,by]=P(u,v);const [tx,ty]=P(u,v,38);
    capsule(bx,by,tx,ty,1.6,'#3b3f46');circ(tx,ty,3,night>0.3?'#ffe08a':'#c9c3b8');
    if(night>0.3){const g=ctx.createRadialGradient(bx,by,2,bx,by,34);g.addColorStop(0,`rgba(255,220,140,${.28*night})`);g.addColorStop(1,'rgba(255,220,140,0)');ctx.fillStyle=g;ctx.save();ctx.scale(1,.5);ctx.beginPath();ctx.arc(bx,by*2,34,0,Math.PI*2);ctx.fill();ctx.restore();}}
}
// tocar un edificio del barrio
function placeAt(x,y){for(const k in PLACES){const [x0,y0,x1,y1]=PLACES[k].r;if(x>=x0-0.5&&x<x1+0.5&&y>=y0-0.5&&y<y1+0.5)return k;}return null;}
function barrioTap(x,y){const k=placeAt(x,y);if(!k)return;openPlace(k);}
function openPlace(k){
  const p=PLACES[k],st=placeState(k),s=S.sim;
  const nm=k==='tienda'&&S.track==='negocio'?'Tu tienda':k==='casaV'&&P_('vecina')?'Casa de '+P_('vecina').n:p.n;
  let h=`<h2>${p.e} ${nm}</h2><div class="sub">${k==='casaV'&&P_('vecina')?`Aquí vive ${P_('vecina').n}. Relación: ${relLabel(P_('vecina').rel)}.`:p.d}</div>`;
  const here=s.work>0&&s.dest===k;if(here)h+=`<div class="quote">📍 Ana está aquí ahora mismo.</div>`;
  if(destOf('work')===k&&!S.jobless)h+=`<div class="kv"><span>💼 Aquí trabaja Ana</span><span>${CAREER[S.career].t}</span></div>`;
  if(st.closed)h+=`<div class="kv"><span>🪧 Hoy</span><span>cerrado por huelga</span></div>`;
  if(st.forRent)h+=`<div class="kv"><span>🏚️ Estado</span><span>cerrado: se alquila</span></div>`;
  if(st.queue)h+=`<div class="kv"><span>🧍 Cola</span><span>${st.queue*6+Math.round(W_().crisis/3)} personas hoy</span></div>`;
  if(k==='tienda'&&S.track!=='negocio'&&!entryMissing('negocio').length)h+=`<button class="btn" id="plbiz">🏪 Abrir aquí mi negocio (${fmt(bizCapital())})</button>`;
  for(const o of p.outs){if(!OUT[o])continue;if(o==='comedor')continue;const why=outAvail(o);h+=`<div class="outrow"><span class="oe">${OUT[o].e}</span><span class="ot"><b>${outName(o)}</b><small>${OUT[o].why}${outCost(o)?' · '+fmt(outCost(o)):''}</small></span><button class="mini" data-out="${o}" ${why?'disabled style="opacity:.45"':''}>${why||'Ir ahora'}</button></div>`;}
  const trk=Object.keys(TRACKS).find(t=>destOf('work')!==k&&({torre:['oficina','tech'],super:['super'],bar:['hosteleria'],obra:['obra'],residencia:['cuidados'],ayto:['funcion'],sala:['arte'],coop:['coop']}[k]||[]).includes(t));
  if(trk&&(S.jobless||S.track!==trk)){const m=entryMissing(trk);h+=`<div class="outrow"><span class="oe">${TRACKS[trk].e}</span><span class="ot"><b>Pedir trabajo aquí</b><small>${TRACKS[trk].levels[0].t} · ${m.length?'falta: '+m.join(', '):fmt(Math.round(TRACKS[trk].levels[0].pay*Dm().pay))+'/turno'}</small></span><button class="mini" data-seek="${trk}" ${m.length?'disabled style="opacity:.45"':''}>Buscar</button></div>`;}
  h+=`<button class="btn grey" id="plclose">Cerrar</button>`;
  card.innerHTML=h;menu.classList.add('open');card.scrollTop=0;
  card.querySelectorAll('[data-out]').forEach(b=>b.onclick=()=>{const o=b.dataset.out;if(outAvail(o))return;menu.classList.remove('open');doOut(o);});
  card.querySelectorAll('[data-seek]').forEach(b=>b.onclick=()=>{const t=b.dataset.seek;if(entryMissing(t).length)return;S.seek=t;if(TRACKS[t].self||TRACKS[t].opos||t==='coop')seekTick();else toast(`🔎 Ana busca trabajo de ${TRACKS[t].n.toLowerCase()}`);openPlace(k);});
  const bz=card.querySelector('#plbiz');if(bz)bz.onclick=()=>{S.seek='negocio';seekTick();menu.classList.remove('open');};
  card.querySelector('#plclose').onclick=()=>menu.classList.remove('open');
}
