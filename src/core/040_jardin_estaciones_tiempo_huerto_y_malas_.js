// ---------- jardín: estaciones, tiempo, huerto y malas hierbas ----------
const SEASONS=DATA.reglas.estaciones;
function seasonOf(day){const m=dateOf(day??S.day).m;return m>=2&&m<=4?'pri':m>=5&&m<=7?'ver':m>=8&&m<=10?'oto':'inv';}
const WX=DATA.reglas.tiempo;
const WXP=DATA.reglas.tiempo_prob;
const TEMP={pri:[12,22],ver:[24,36],oto:[10,20],inv:[1,12]};
function rollWeather(){
  const s=seasonOf(),opts=WXP[s];let tot=opts.reduce((a,b)=>a+b[1],0),r=Math.random()*tot,k='sol';
  const prev=S.weather&&S.weather.k;if(prev&&Math.random()<0.4&&opts.some(o=>o[0]===prev))k=prev;else for(const [x,w] of opts){r-=w;if(r<=0){k=x;break;}}
  const [a,b]=TEMP[s];let t=Math.round(a+Math.random()*(b-a));if(k==='calor')t=Math.max(t,33);if(k==='nieve')t=Math.min(t,1);if(k==='lluvia'||k==='tormenta')t-=3;
  S.weather={k,t};S.snow=k==='nieve'?3:Math.max(0,(S.snow||0)-(t>6?1.5:0.5));
  if(k==='lluvia'||k==='tormenta')for(const i of findObjs((d,tt)=>tt==='huerto')){const cr=S.obj[i].crop;if(cr)cr.w=100;}
}
const lawnBase=()=>{const s=seasonOf();let c=SEASONS[s].lawn;if(S.weather&&S.weather.k==='calor')c=mixHex(c,'#c2b46a',.3);if(S.snow>0)c=mixHex(c,'#eef3f6',Math.min(.82,S.snow/3*.85));return c;};
let LAWN='#86c06c',WEEDSET=new Set();
// cultivos
const CROPS=DATA.objetos.cultivos;
const seedFor=()=>{const s=seasonOf();const ok=Object.keys(CROPS).filter(k=>CROPS[k].s.includes(s));return pickR(ok);};
function gardenDaily(){
  const s=seasonOf(),W=(S.weather||{}).k,dry={ver:34,pri:24,oto:20,inv:10}[s]+(W==='calor'?16:0),dead=[],rot=[];
  for(const i of findObjs((d,t)=>t==='huerto')){const o=S.obj[i],cr=o.crop;if(!cr||cr.dead)continue;
    if(cr.g>=1){cr.ripeDays=(cr.ripeDays||0)+1;if(cr.ripeDays>6){cr.dead=true;rot.push(CROPS[cr.k].n.toLowerCase());}continue;}
    const C=CROPS[cr.k];let r=1/C.d*(cr.w>25?1:cr.w>0?0.45:0)*(1-0.6*(cr.wd||0))*(C.s.includes(s)?1:0.35)*(1+0.06*lvl('jard'))*(W==='nieve'?0.25:1)*(isI('ecologista')?1.25:1);
    cr.g=Math.min(1,cr.g+r);if(cr.g>=1)cr.ripeDays=0;
    if(W!=='lluvia'&&W!=='tormenta')cr.w=Math.max(0,cr.w-dry);
    cr.wd=Math.min(1,(cr.wd||0)+(s==='pri'?0.12:0.07));
    if(cr.w<=0){cr.dry=(cr.dry||0)+1;if(cr.dry>=3){cr.dead=true;dead.push(CROPS[cr.k].n.toLowerCase());}}else cr.dry=0;}
  if(dead.length)tell(`Se han secado ${[...new Set(dead)].join(' y ')} del huerto. Nadie los regó a tiempo.`,'🥀');
  if(rot.length)tell(`Se han echado a perder ${[...new Set(rot)].join(' y ')} por no recogerlos a tiempo.`,'🥀');
  // malas hierbas
  S.weeds=(S.weeds||[]).filter(i=>S.floor[i]===0&&!S.obj[i]&&!S.wall[i]);
  const n={pri:3,ver:1,oto:2,inv:0}[s]+((W==='lluvia'||W==='tormenta')?1:0);
  for(let k=0;k<n&&S.weeds.length<26;k++){for(let t=0;t<20;t++){const x=1+(Math.random()*(N-2)|0),y=1+(Math.random()*(N-2)|0),i=idx(x,y);
    if(S.floor[i]!==0||S.obj[i]||S.wall[i]||roomId[i]>=0||S.weeds.includes(i))continue;S.weeds.push(i);break;}}
}
// Ana cuida un bancal: planta, riega, quita hierbas y cosecha
function gardenCare(i){
  const o=S.obj[i];if(!o)return;let cr=o.crop;const c=CH();
  if(cr&&cr.g>=1&&!cr.dead){const C=CROPS[cr.k];const y=Math.max(1,Math.round(C.y*(0.7+0.12*lvl('jard'))*TIERS[o.q??3].eff));S.pantry=(S.pantry||0)+y;tally('harvest',(S.today&&S.today.harvest||0)+y);
    gainSkill('jard',6);floatText(`+${y} ${C.e}`,i%N+.5,(i/N|0)+.5,30,'#2e8b57');burst('chip',i%N+.5,(i/N|0)+.5,12,10,.6,{vz:90,life:.9,col:C.col});popBubble(C.e);
    if(!S.story||!S.story.chap.cosecha)chapter('cosecha','Lo que da la tierra',`${c.name} recogió sus primeros ${C.n.toLowerCase()}. Sabían a algo que no se puede comprar.`);
    else if(Math.random()<0.5)tell(`${c.name} recogió ${y} raciones de ${C.n.toLowerCase()} del huerto.`,C.e);
    cr=o.crop=null;
    if((S.pantry||0)>12){const v=P_('vecina');const give=Math.min(S.pantry-8,6);S.pantry-=give;if(v){v.rel=Math.min(100,v.rel+12);tell(`Le sobraban verduras y le llevó unas cuantas a ${v.n}, ${v.r}. ${pickR(['Se lo agradeció con un bizcocho.','Acabaron charlando en el rellano.','Le prometió devolverle el táper lleno.'])}`,'🧺');}}}
  if(!cr||cr.dead){const k=seedFor();const cost=Math.round(4*PM());S.money-=cost;o.crop={k,g:0,w:100,wd:0};if(!S.sowed){S.sowed=1;tell(`Sembró ${CROPS[k].n.toLowerCase()} en el huerto. Ahora toca regar y esperar.`,'🌱');}
    floatText('🌱 '+CROPS[k].n,i%N+.5,(i/N|0)+.5,26,'#2e8b57');waterAround(i);return;}
  cr.w=100;cr.wd=0;cr.dry=0;
  waterAround(i);
}
// con la regadera en la mano, riega también los bancales de al lado
function waterAround(i){const x=i%N,y=i/N|0;for(const j of findObjs((d,t)=>t==='huerto')){if(j===i)continue;const a=j%N,b=j/N|0;if(Math.abs(a-x)>2||Math.abs(b-y)>2)continue;const c=S.obj[j].crop;if(c&&!c.dead&&c.g<1){c.w=100;c.wd=0;c.dry=0;}}}
const gardenNeedsCare=o=>{const cr=o.crop;return !cr||cr.dead||cr.g>=1||cr.w<40||(cr.wd||0)>0.45;};
function pullWeeds(i){const x=i%N,y=i/N|0;let n=0;S.weeds=(S.weeds||[]).filter(j=>{const a=j%N,b=j/N|0;if(Math.abs(a-x)<=1&&Math.abs(b-y)<=1){n++;return false;}return true;});
  if(n){gainSkill('jard',0.6*n);tally('weeds',(S.today&&S.today.weeds||0)+n);burst('chip',x+.5,y+.5,4,8,.5,{vz:70,life:.7,col:'#6a9c3a'});}}
// tareas del jardín cuando no hay nada urgente
function gardenChore(){
  const h=S.t/60,W=(S.weather||{}).k;if(h<7.5||h>20.5||W==='tormenta'||W==='nieve')return false;
  const nd=S.needs;if(['hambre','vejiga','energia','higiene'].some(k=>nd[k]<40))return false;
  const hs=findObjs((d,t)=>t==='huerto').filter(i=>gardenNeedsCare(S.obj[i])&&!(W==='lluvia'&&S.obj[i].crop&&S.obj[i].crop.g<1&&!S.obj[i].crop.dead));
  if(hs.length){const r=pathToObj(hs);if(r){go({path:r.path,obj:r.obj},'diversion',false);S.sim.chore=true;return true;}}
  const wd=S.weeds||[];if(wd.length>=(T('naturaleza')||T('ordenada')?3:6)&&W!=='lluvia'&&Math.random()<0.6){const [sx,sy]=simCell();const set=new Set(wd);
    const p=bfs([sx,sy],(x,y)=>set.has(idx(x,y)));if(p){const s=S.sim;s.path=p;s.target=null;s.weedJ=p.length?idx(...p[p.length-1]):idx(sx,sy);if(!p.length)startWeed();return true;}}
  return false;
}
function startWeed(){const s=S.sim,i=s.weedJ;s.weedJ=null;if(i==null)return;s.use={type:'_weed',i,t:0,dur:14,goal:'diversion'};}
function gardenScore(){let v=0;const s=seasonOf();for(let i=0;i<N*N;i++){if(roomId[i]>=0)continue;const o=S.obj[i];if(!o)continue;
  v+={arbol:3,flores:s==='inv'?0.5:2,seto:1,huerto:2,fuente:4,bancoj:1.5,farola:1,planta:1,barbacoa:1}[o.t]||0;if(o.t==='huerto'&&o.crop&&!o.crop.dead)v+=1;}
  v-=(S.weeds||[]).length*0.8;return {v,stars:Math.max(0,Math.min(5,Math.floor(v/6)))};}
// dibujo de la hierba mala y del tiempo
function drawWeed(vx,vy,i){const [a,b]=P(vx+.35+hash(i)*.3,vy+.35+hash(i*7)*.3);const sw=Math.sin(performance.now()/700+i)*0.8;
  for(let k=0;k<4;k++){const ang=-1.9+k*0.45;capsule(a,b,a+Math.cos(ang)*5+sw,b+Math.sin(ang)*6,1.4,k%2?'#5f8f2e':'#78a83a');}
  if(seasonOf()==='pri'&&hash(i*3)>.4)circ(a+sw,b-6,1.7,'#ffd23f');}
const WXDROPS=Array.from({length:140},(_,k)=>[hash(k*13+5),hash(k*29+11),0.6+hash(k*7)*0.8]);
function drawWeather(tt){
  const W=S.weather&&S.weather.k;if(!W||sceneIndoor)return;ctx.save();ctx.setTransform(1,0,0,1,0,0);const w=cv.width,h=cv.height;
  if(W==='lluvia'||W==='tormenta'){ctx.fillStyle=`rgba(50,60,85,${W==='tormenta'?.2:.12})`;ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='rgba(200,215,240,.45)';ctx.lineWidth=DPR;ctx.beginPath();const n=W==='tormenta'?140:90;
    for(let k=0;k<n;k++){const [a,b,s]=WXDROPS[k];const x=((a*w+tt*60*s*DPR)%w),y=((b*h+tt*900*s*DPR)%h);ctx.moveTo(x,y);ctx.lineTo(x-3*DPR,y+14*DPR*s);}ctx.stroke();
    if(W==='tormenta'){const f=(tt%9);if(f<0.12||(f>0.25&&f<0.3)){ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(0,0,w,h);}}}
  else if(W==='nieve'){ctx.fillStyle='rgba(230,236,245,.12)';ctx.fillRect(0,0,w,h);ctx.fillStyle='rgba(255,255,255,.9)';
    for(let k=0;k<110;k++){const [a,b,s]=WXDROPS[k];const x=((a*w+Math.sin(tt*s+k)*20*DPR)%w+w)%w,y=((b*h+tt*55*s*DPR)%h);ctx.beginPath();ctx.arc(x,y,1.6*s*DPR,0,Math.PI*2);ctx.fill();}}
  else if(W==='calor'&&nightFactor()<.5){ctx.fillStyle='rgba(255,190,90,.07)';ctx.fillRect(0,0,w,h);}
  else if(W==='nubes'){ctx.fillStyle='rgba(90,100,120,.07)';ctx.fillRect(0,0,w,h);}
  ctx.restore();
}
// objetos de jardín
function drawGardenObj(o,i,tt){
  switch(o.t){
  case 'huerto':{
    lp(.06,.06,.94,.94,0,7,'#8a6038');lp(.12,.12,.88,.88,7,7.6,'#5b3d22');
    const cr=o.crop;if(cr&&cr.w>60)ltop(.12,.12,.88,.88,7.7,'rgba(40,25,10,.25)');
    for(let k=0;k<3;k++){const b=.25+k*.25;ctx.strokeStyle='rgba(40,25,12,.35)';ctx.lineWidth=1.2;ctx.beginPath();const [a1,b1]=LP(.16,b,7.8),[a2,b2]=LP(.84,b,7.8);ctx.moveTo(a1,b1);ctx.lineTo(a2,b2);ctx.stroke();}
    if(cr){const C=CROPS[cr.k],g=cr.dead?0.6:Math.min(1,cr.g);
      for(let r=0;r<3;r++)for(let q=0;q<3;q++){const [px,py]=LP(.24+q*.26,.25+r*.25,7.5);const sw=Math.sin(tt*2+r+q+i)*0.6;
        const hgt=2+g*9,lc=cr.dead?'#8a7a4a':cr.w<25?'#9aa84a':'#4f9a3a';
        capsule(px,py,px+sw,py-hgt,1.4,lc);ctx.fillStyle=lc;ctx.beginPath();ctx.ellipse(px-2+sw,py-hgt*.6,2.4*g+.8,1.1,-.5,0,Math.PI*2);ctx.ellipse(px+2+sw,py-hgt*.75,2.4*g+.8,1.1,.5,0,Math.PI*2);ctx.fill();
        if(cr.k==='lechuga'&&g>.3)circ(px+sw,py-hgt*.5,2+g*2.6,cr.dead?'#a59a5a':'#8fd16a');
        if(g>=1&&!cr.dead&&cr.k!=='lechuga')circ(px+sw+1.5,py-hgt*.55,cr.k==='calabaza'?3.4:2,C.col);}
      if(cr.g>=1&&!cr.dead){const [x,y]=LP(.5,.5,24);emoji(C.e,x,y+Math.sin(tt*3)*1.5,12);}
      if(cr.w<25&&!cr.dead){const [x,y]=LP(.5,.5,22);emoji('💧',x,y+Math.sin(tt*3)*1.5,10);}}
    break;}
  case 'bancoj':{
    lp(.12,.2,.2,.8,0,9,'#3b3f46');lp(.8,.2,.88,.8,0,9,'#3b3f46');
    for(let k=0;k<3;k++)lp(.1,.22+k*.2,.9,.36+k*.2,9,11,shade('#a0754c',1-k*.05));
    lp(.1,.16,.9,.22,11,22,'#8a6238');lp(.1,.16,.9,.22,15,17,'#a0754c');
    break;}
  case 'barbacoa':{
    lcyl(.5,.5,.06,0,14,'#2f3338');lcyl(.5,.5,.32,14,22,'#2f3338','#1f2226');
    const on=S.sim.use&&S.sim.use.i===i;if(on){const [x,y]=LP(.5,.5,23);for(let k=0;k<3;k++)circ(x-5+k*5,y+Math.sin(tt*9+k)*.6,1.8,`rgba(255,${120+k*30},60,.9)`);}
    ctx.strokeStyle='#8a8f98';ctx.lineWidth=.8;ctx.beginPath();for(let k=-2;k<=2;k++){const [a,b]=LP(.25,.5+k*.08,22.5),[c2,d2]=LP(.75,.5+k*.08,22.5);ctx.moveTo(a,b);ctx.lineTo(c2,d2);}ctx.stroke();
    break;}
  case 'fuente':{
    lcyl(.5,.5,.44,0,9,'#c9c3b8','#d9d3c8');lcyl(.5,.5,.36,8.5,9,'#4fb3e8','#7cc8f0');lcyl(.5,.5,.08,9,26,'#c9c3b8');lcyl(.5,.5,.2,26,29,'#c9c3b8','#7cc8f0');
    const [x,y]=LP(.5,.5,30);ctx.strokeStyle='rgba(200,235,255,.8)';ctx.lineWidth=1.2;for(let k=0;k<4;k++){const a=k/4*Math.PI*2+tt;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+Math.cos(a)*7,y-6,x+Math.cos(a)*11,y+12+Math.sin(a)*3);ctx.stroke();}
    break;}
  default:return false;}
  return true;
}


// =================== SOCIEDAD: profesiones, ideologías, actividades, sindicato y mundo ===================
