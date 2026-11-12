// ---------- pensamientos en voz alta ----------
const thought={txt:null,until:0,next:performance.now()+9000};
function thoughtCandidates(){
  const nd=S.needs,c=[],o=oa(),h=S.t/60,W=(S.weather||{}).k;
  const add=(t,w=1)=>c.push([t,w]);
  if(nd.hambre<30)add(pickR(TXN.pensamientos.hambre),4);
  if(nd.energia<25)add(huecos(TXN.pensamientos.sueno,{o:o}),4);
  if(nd.higiene<30)add(TXN.pensamientos.ducha,3);
  if(nd.social<30)add(pickR([huecos(TXN.pensamientos.soledad[0],{o:o}),TXN.pensamientos.soledad[1]]),3);
  if(nd.diversion<30)add(TXN.pensamientos.aburrimiento,3);
  if(S.want)add(pickR([huecos(TXN.pensamientos.deseo[0],{que:S.want.name.toLowerCase()}),huecos(TXN.pensamientos.deseo[1],{que_cap:capF(S.want.name.toLowerCase())})]),1.5);
  if(S.job&&S.job.who==='ana')add(TXN.pensamientos.obra,1);
  if(S.money<reserveMoney())add(pickR(TXN.pensamientos.dinero_mal),2.5);
  else if(spare()>1500)add(TXN.pensamientos.dinero_bien,0.8);
  if(dayType(S.day+1)==='work'&&h>=20&&!S.jobless)add(TXN.pensamientos.madrugar,1.2);
  if(dayType(S.day)==='weekend'&&h<14)add(TXN.pensamientos.finde,1.2);
  if(Dm().soul&&!S.jobless&&TOX()>0.65)add(pickR(TXN.pensamientos.jefe),1.5);
  if(S.jobless)add(pickR(TXN.pensamientos.paro),2);
  if(W==='lluvia')add(T('naturaleza')||T('artista')?TXN.pensamientos.lluvia_gusta:TXN.pensamientos.lluvia_mal,1);
  if(W==='calor')add(TXN.pensamientos.calor,1.5);if(W==='nieve')add(TXN.pensamientos.nieve,2);if(W==='tormenta')add(TXN.pensamientos.tormenta,1);
  const hs=findObjs((d,t)=>t==='huerto').map(i=>S.obj[i].crop).filter(Boolean);
  if(hs.some(cr=>cr.g>=1&&!cr.dead))add(huecos(TXN.pensamientos.huerto_listo,{cultivo:capF(CROPS[hs.find(cr=>cr.g>=1).k].n.toLowerCase())}),2);
  if(hs.some(cr=>cr.w<25&&!cr.dead))add(TXN.pensamientos.huerto_regar,1.5);
  if((S.weeds||[]).length>=6)add(TXN.pensamientos.malas_hierbas,1);
  const m=P_('madre');if(m&&m.rel<45)add(TXN.pensamientos.llamar_madre,1.5);
  const f=P_('amiga');if(f&&f.rel<45)add(huecos(TXN.pensamientos.echo_amiga,{p:f.n}),1.2);
  if(T('artista'))add(TXN.pensamientos.artista,.6);if(T('naturaleza'))add(TXN.pensamientos.naturaleza,.6);
  if(T('ahorradora'))add(TXN.pensamientos.ahorradora,.5);if(T('derrochadora'))add(TXN.pensamientos.derrochadora,.6);
  if(T('perezosa'))add(TXN.pensamientos.perezosa,.6);if(T('trabajadora'))add(TXN.pensamientos.trabajadora,.6);
  const md=mood();if(md>72)add(pickR(TXN.pensamientos.animo_alto),1);if(md<32)add(pickR(TXN.pensamientos.animo_bajo),1.5);
  if(S.owned)add(TXN.pensamientos.casa,.3);
  ideoThoughts(add);
  return c;
}
function thinkTick(){
  const now=performance.now(),s=S.sim;if(now<thought.next||s.work>0||menu.classList.contains('open'))return;
  thought.next=now+16000+Math.random()*20000;if(bedUse(s.use)&&!s.use.nap)return;
  const c=thoughtCandidates();if(!c.length)return;let tot=c.reduce((a,b)=>a+b[1],0),r=Math.random()*tot,t=c[0][0];for(const [x,w] of c){r-=w;if(r<=0){t=x;break;}}
  thought.txt=L(t);thought.until=now+4800;S.lastLine={ic:'💭',txt:thought.txt};
}
function drawThought(bx,by){
  const k=Math.min(1,(thought.until-performance.now())/400,(performance.now()-(thought.until-4800))/250);if(k<=0)return;
  ctx.save();ctx.translate(bx,by);const zz=Math.min(1,1.3/cam.z);ctx.scale(zz,zz);bx=0;by=0;ctx.globalAlpha=Math.max(0,Math.min(1,k));ctx.font='800 10.5px Nunito, sans-serif';
  const words=thought.txt.split(' '),lines=[];let cur='';for(const w of words){const t=cur?cur+' '+w:w;if(ctx.measureText(t).width>120&&cur){lines.push(cur);cur=w;}else cur=t;}lines.push(cur);
  const wd=Math.max(...lines.map(l=>ctx.measureText(l).width))+16,ht=lines.length*13+10,x0=bx-wd/2+18,y0=by-ht-26;
  ctx.fillStyle='rgba(30,20,50,.12)';roundRect(x0+1,y0+2,wd,ht,11);ctx.fill();
  ctx.fillStyle='#fffdf8';roundRect(x0,y0,wd,ht,11);ctx.fill();circ(bx+6,by-20,3.6,'#fffdf8');circ(bx+2,by-13,2.2,'#fffdf8');
  ctx.fillStyle='#3b3247';ctx.textAlign='center';ctx.textBaseline='middle';lines.forEach((l,i)=>ctx.fillText(l,x0+wd/2,y0+11+i*13));
  ctx.restore();
}

