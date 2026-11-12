// =================== UNIVERSIDAD: pública (Universidad Pública del Río) o privada (Campus Nébula) ===================
// Mismo título y mismas horas h: el dinero compra horario y trato, no saber. Los datos, en data/estudios.json → «privada».
const UNI_D=DATA.estudios.privada;
const UNI={force:null,pick:null};
const UNI_PUB='uni_publica',UNI_PRI='uni_privada';
const uniIs=k=>{const P=EDU_PROGS[k];return !!P&&P.place==='uni';};
const uniCur=()=>{const C=ED().cur;return C&&uniIs(C.k)?C:null;};
const uniCen=C=>C&&C.centro==='privada'?'privada':'publica';   // sin campo = pública (partidas antiguas)
const uniLug=cen=>cen==='privada'?UNI_PRI:UNI_PUB;
const uniCoste=(k,cen)=>{const P=EDU_PROGS[k];return Math.round(P.cost*(cen==='privada'?(UNI_D.mult[P.lv]||1):1)*PM());};
const uniSched=(k,cen)=>{const P=EDU_PROGS[k];return cen==='privada'?(UNI_D.sched[P.lv]||P.sched):P.sched;};
const uniDays=(k,cen)=>{const P=EDU_PROGS[k];return cen==='privada'?(UNI_D.days[P.lv]||P.days):P.days;};
// presta el horario (y el precio, si coste) de la privada al programa mientras corre fn
function uniCon(cen,k,fn,coste){const P=EDU_PROGS[k];if(!P||cen!=='privada'||!uniIs(k))return fn();const o={cost:P.cost,sched:P.sched,days:P.days};
  if(coste)P.cost=Math.round(P.cost*(UNI_D.mult[P.lv]||1));P.sched=uniSched(k,cen);P.days=uniDays(k,cen);
  try{return fn();}finally{P.cost=o.cost;P.sched=o.sched;P.days=o.days;}}
const uniSw=fn=>function(){const C=uniCur();return C&&uniCen(C)==='privada'?uniCon('privada',C.k,()=>fn.apply(this,arguments)):fn.apply(this,arguments);};
const uniExamen=()=>{const d=dateOf(S.day),e=UNI_D.examenes;return e.meses.includes(d.m)&&d.dm>=e.desde;};

// ---- matrícula: se paga con bkAdd y se guarda el centro ----
const _uniEC=eduCan;
function uniWhy(k,cen){return uniCon(cen,k,()=>_uniEC(k),true);}
{const _es=eduStart;eduStart=function(k){const P=EDU_PROGS[k];if(!P)return _es.apply(this,arguments);const uni=uniIs(k);const cen=uni?(UNI.pick==='privada'?'privada':'publica'):null;const m0=S.money;let ok;
  try{ok=uni?uniCon(cen,k,()=>_es(k),true):_es(k);}finally{UNI.pick=null;}
  if(ok){const gasto=m0-S.money;if(gasto>0){S.money=m0;bkAdd('Matrícula',-gasto);}   // el engine lo apuntó como «Otros»: se deshace y se paga con bkAdd
    if(uni&&ED().cur){ED().cur.centro=cen;const n=CH().name;const g=gasto>0?fmt(gasto):'nada';
      tell(cen==='privada'?`${n} ha pagado ${g} a Campus Nébula por lo mismo que la pública da por ${fmt(Math.round(P.cost*PM()))}. A cambio: clases por la tarde, veinte en el aula y un tutor que contesta correos. El título es el mismo.`
        :`${n} se ha matriculado en la Universidad Pública del Río: ${g}. Clases por la mañana, ochenta en el aula y cafetería a precio de barrio.`,'🎓');}}
  return ok;};}
// el horario de la privada manda mientras se cursa allí
eduInClassHours=uniSw(eduInClassHours);eduTryGo=uniSw(eduTryGo);eduClash=uniSw(eduClash);
{const _ob=outBack;outBack=function(kind){if(kind==='clase'){const C=uniCur();if(C){const cen=uniCen(C);const ex=UNI_D.centros[cen].energia||0;const hrs=uniSched(C.k,cen);const dh=hrs[1]-hrs[0];
    if(ex)S.needs.energia=Math.max(0,S.needs.energia-dh*ex);
    if(Math.random()<.12)tell(cen==='privada'?pickR([`Veinte en el aula y la profe sabe cómo se llama ${CH().name}. Eso también se paga.`,`Clase de tarde en Campus Nébula. Salir a las nueve y llegar a casa a cenar: para eso es la cuota.`])
      :pickR([`Ochenta en el aula, los últimos sin enchufe. ${CH().name} ha seguido la clase desde la quinta fila.`,`Cola en la cafetería de la pública: café a 1,20. Lo único que no ha subido.`]),'🎓');
    return uniCon(cen,C.k,()=>_ob.apply(this,arguments));}}return _ob.apply(this,arguments);};}
// destOf('clase') → el centro que toque; el resto de programas siguen donde iban
{const _d=destOf;destOf=function(k){if(k==='clase'){const C=uniCur();if(C)return uniLug(uniCen(C));}return _d.apply(this,arguments);};}
// el censo: quien estudia en la uni está en su centro en horas de clase
function uniClase(lugar,h,wd){const P=Object.values(EDU_PROGS).find(q=>q.place==='uni'&&q.lv==='grado');if(!P)return false;const pri=lugar===UNI_PRI;const s=pri?UNI_D.sched.grado:P.sched,d=pri?UNI_D.days.grado:P.days;return h>=s[0]&&h<s[1]&&d.includes(wd);}
{const _v=vecinosEn;vecinosEn=function(lugar,hora,dia){const r=_v.apply(this,arguments);
  if((lugar===UNI_PUB||lugar===UNI_PRI)&&uniClase(lugar,hora,dia))for(const v of pbVec())if(v&&v.estudia==='uni'&&(v.centro||UNI_PUB)===lugar&&!r.some(q=>q.v===v))r.push({v,motivo:'clase'});return r;};}

// ---- UI: elegir centro al matricularse ----
const uniDias=ds=>ds.length===5?'L–V':ds.length===4?'L–J':ds.map(d=>WDS[d]).join(' ');
function uniRows(html){const parts=html.split('<div class="outrow">');
  return parts.map((p,i)=>{if(!i)return p;const m=p.match(/data-edu="([^"]+)"/);if(!m||!uniIs(m[1]))return '<div class="outrow">'+p;const k=m[1],P=EDU_PROGS[k];
    const line=(cen,e,nom)=>{const why=uniWhy(k,cen);const s=uniSched(k,cen),c=uniCoste(k,cen);const g=UNI_D.centros[cen].grupo;
      return `<small>${e} <b>${nom}</b> · ${fmt(c)} · ${uniDias(uniDays(k,cen))} ${s[0]}–${s[1]} h · grupos de ${g}${why?' · <i>'+why+'</i>':''}</small>`;};
    const bt=(cen,t)=>`<button class="mini" data-uni="${k}|${cen}" ${uniWhy(k,cen)?'disabled style="opacity:.45"':''}>${t}</button>`;
    return `<div class="outrow" data-unirow="${k}"><span class="oe">${EDU_LV[P.lv].e}</span><span class="ot"><b>${P.n}</b><small>${eduHours(k)} h · ${P.d}</small>${line('publica','🏛️','Pública')}${line('privada','🏢','Nébula')}</span><span style="display:flex;flex-direction:column;gap:5px">${bt('publica','Pública')}${bt('privada','Nébula')}</span></div>`;}).join('');}
{const _eb=eduBlock;eduBlock=function(){const C=uniCur();let h=C&&uniCen(C)==='privada'?uniCon('privada',C.k,()=>_eb.apply(this,arguments)):_eb.apply(this,arguments);
  if(C)h=h.replace('<button class="btn grey" id="edudrop">',`<div class="sub" style="font-size:11.5px">${uniCen(C)==='privada'?'🏢 Campus Nébula · tardes, grupos de veinte.':'🏛️ Universidad Pública del Río · mañanas, aulas de ochenta.'}</div><button class="btn grey" id="edudrop">`);
  else h=uniRows(h);return h;};}
{const _bs=bindSociety;bindSociety=function(){_bs.apply(this,arguments);card.querySelectorAll('[data-uni]').forEach(b=>b.onclick=()=>{const [k,cen]=b.dataset.uni.split('|');UNI.pick=cen;let ok=false;try{ok=eduStart(k);}finally{UNI.pick=null;}if(ok)openMenu('trabajo');});};}

// =================== ESCENAS ===================
function uQ(ax,c0,c1,f,z0,z1,col){if(ax==='x')poly([P(c0,f,z0),P(c1,f,z0),P(c1,f,z1),P(c0,f,z1)],col);else poly([P(f,c0,z0),P(f,c1,z0),P(f,c1,z1),P(f,c0,z1)],col);}
function uT(ax,c,f,z,txt,col,sz){const [a,b]=ax==='x'?P(c,f,z):P(f,c,z);ctx.save();ctx.translate(a,b);ctx.transform(1,ax==='x'?.5:-.5,0,1,0,0);ctx.fillStyle=col;ctx.font=`900 ${sz*2.1}px Nunito, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(txt,0,0);ctx.restore();}
const upp=(t,a,b)=>{const u=((t%2)+2)%2;return [a+(b-a)*(u<1?u:2-u),u<1];};
function uGrid(W,D,col){ctx.strokeStyle=col;ctx.lineWidth=1;ctx.beginPath();for(let k=1;k<W;k++){ctx.moveTo(...P(k,0));ctx.lineTo(...P(k,D));}for(let k=1;k<D;k++){ctx.moveTo(...P(0,k));ctx.lineTo(...P(W,k));}ctx.stroke();}
function uRoom(W,D,WH,floor,wall,wall2,grid){prism(0,0,W,D,-22,0,'#8e8576');topQuad(0,0,W,D,0,floor);uGrid(W,D,grid);sBox(0,-.15,W,0,0,WH,wall);sBox(-.15,-.15,0,D,0,WH,wall2);}
function uMini(x,y,z,i,o){o=o||{};const [a,b]=P(x,y,z);const sk=SV_SKIN[Math.floor(svH(i*3+2)*5)],ha=SV_HAIR[Math.floor(svH(i*5+3)*5)],sh=o.shirt||SV_SHIRT[Math.floor(svH(i*11+4)*SV_SHIRT.length)];const f=svH(i*7+1)<.5;
  capsule(a,b-3,a-7,b+3,5.5,'#46506a');                                        // muslos hacia delante
  ctx.fillStyle=sh;ctx.beginPath();ctx.moveTo(a-6,b-2);ctx.lineTo(a-5,b-17);ctx.quadraticCurveTo(a,b-21,a+5,b-17);ctx.lineTo(a+6,b-2);ctx.closePath();ctx.fill();
  if(f&&svH(i*13+5)<.7){ctx.fillStyle=ha;ctx.fillRect(a-5.2,b-29,10.4,11);}
  circ(a,b-25,4.5,sk);ctx.fillStyle=ha;ctx.beginPath();ctx.arc(a,b-26,4.8,Math.PI*1.02,Math.PI*1.98);ctx.fill();
  if(o.paper){ctx.fillStyle='#fffdf6';ctx.beginPath();ctx.moveTo(a-3,b-6);ctx.lineTo(a+4,b-9);ctx.lineTo(a+8,b-6);ctx.lineTo(a+1,b-3);ctx.closePath();ctx.fill();}
  else if(o.lap){ctx.fillStyle='#4a5260';ctx.beginPath();ctx.moveTo(a-4,b-8);ctx.lineTo(a+4,b-12);ctx.lineTo(a+8,b-8);ctx.lineTo(a,b-4);ctx.closePath();ctx.fill();}
  else if(o.phone){ctx.fillStyle='#2b2533';ctx.fillRect(a+2,b-13,3,5);}}
function uVar(key){if(UNI.force)return UNI.force;const s=S.sim,h=S.t/60;const cl=s.outingActive==='clase'&&s.work>0&&(s.dest===key);
  if(!cl)return (h<7||h>=22||dateOf(S.day).wd===6)?'cerrada':'exterior';
  const fr=svFrac();if(fr<.7)return 'aula';if(key===UNI_PUB&&fr<.85)return 'pasillo';return 'exterior';}
function uCen(key,h,wd){try{return vecinosEn(key,h,wd).filter(q=>q.motivo==='clase').map(q=>q.v);}catch(e){return [];}}
function uCenFig(v,x,y,o){sPerson(x,y,pbLook(v),{pose:'stand',...o,name:o&&o.noname?null:v.n});}
function uRain(tt,night){const w=(S.weather||{}).k;if(w!=='lluvia'&&w!=='tormenta')return;ctx.strokeStyle='rgba(60,80,110,.45)';ctx.lineWidth=1;ctx.beginPath();for(let k=0;k<46;k++){const x=svH(k+3)*W_RAIN,y=((svH(k+9)*300+tt*70)%300);const [a,b]=P(x,svH(k+20)*9);ctx.moveTo(a,b-y);ctx.lineTo(a-2,b-y+8);}ctx.stroke();}
const W_RAIN=12;
function uNightAfter(night,closed){return()=>{if(night>.3){ctx.fillStyle='rgba(20,30,70,'+(closed?.32:.2)*Math.min(1,night+.2)+')';ctx.fillRect(-2000,-2000,4000,4000);}};}

// ---- aula grande en gradas de la pública (ochenta personas; en exámenes, un asiento sí y otro no) ----
function uAulaPub(E){const {tt,night}=E;const it=[],add=(x,y,f,d)=>it.push({d:d??x+y,f});const W=10.5,D=10,WH=66;const h=S.t/60,wd=dateOf(S.day).wd;const ex=uniExamen();
  const C=uniCur();const subj=C?EDU_PROGS[C.k].n:'Clase';const NR=7,NC=12;const tz=i=>4+(6-i)*4.5,ty=i=>.5+i*.85,sx=j=>1.6+j*.74;
  const cen=uCen(UNI_PUB,h,wd);const slots=[[6,2],[2,8],[5,10]];const AN=[4,6];
  const drawBase=()=>{uRoom(W,D,WH,'#b79c74','#ece3cf','#e3d9c3','rgba(90,60,20,.10)');
    uQ('x',0,W,0,0,10,'#a8885f');uQ('y',0,D,0,0,10,'#9c7d55');
    // ventanal alto en la pared de la izquierda y letrero
    uQ('y',.6,4.6,0,44,62,'#8a6a48');uQ('y',.75,4.45,0,46,60,svSky(night));for(let k=1;k<3;k++)uQ('y',.6+k*1.33-.04,.6+k*1.33+.04,0,46,60,'#8a6a48');
    uT('y',7.35,0,60.5,'ANFITEATRO B · AFORO 90','#5a4e3a',2.4);
    // pizarra
    uQ('y',5.0,9.7,0,18,55,'#6b4a2e');uQ('y',5.15,9.55,0,19.5,53.5,'#2f4a3a');
    uT('y',7.35,0,47.5,subj.length>26?subj.slice(0,25)+'…':subj,'#f1efe6',2.7);
    if(ex){uT('y',7.35,0,39.5,'EXAMEN FINAL','#f5d76e',3.6);uT('y',7.35,0,32.5,'Móviles apagados','#e9e6da',2.4);uT('y',7.35,0,26.5,'Silencio, por favor','#e9e6da',2.4);}
    else{uT('y',7.35,0,40,'Tema '+(1+(S.day%9)),'#e9e6da',3);uT('y',7.35,0,33.5,'Entrega: jueves','#e9e6da',2.4);uT('y',7.35,0,27,'Aula llena: bajad a las gradas','#f5d76e',1.9);}
    // gradas
    for(let i=0;i<NR;i++)sBox(1.3,ty(i),W-.2,ty(i)+.85,0,tz(i),i%2?'#bfae92':'#c9b99c');
    for(let i=0;i<NR;i++)for(const [a,b] of [[1.3,W-.2]]){ctx.strokeStyle='rgba(60,40,10,.12)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(...P(a,ty(i)+.85,tz(i)));ctx.lineTo(...P(b,ty(i)+.85,tz(i)));ctx.stroke();}
    // escalera de la derecha
    for(let s=0;s<NR;s++)sBox(W-.9,ty(s)+.05,W-.2,ty(s)+.8,tz(s),tz(s)+.4,'#8e7a5a');};
  // mesa de la profe y la profe
  add(7.4,8.9,()=>{sBox(5.8,8.4,9.2,9.4,0,17,'#8a6a48');sTop(5.8,8.4,9.2,9.4,17.5,'#a78560');sBox(6.5,8.6,7.7,9.1,17.5,18.5,'#4a5260');sBox(6.5,8.6,7.7,8.75,18.5,26,'#5a6270');sBox(8.2,8.6,8.7,9.0,17.5,20,'#fffdf6');});
  const pw=ex?upp(tt*.07,2.2,5.2):[3.3,true];
  add(pw[0],7.9,()=>sPerson(pw[0],7.9,{...svChar(900,'adult'),style:'media',hair:'#5a3c2a'},{pose:ex?'walk':'stand',ph:tt*6,act:ex?null:(tt*.25%2<1?'talk':null),front:false,right:ex?pw[1]:false,shirt:'#7a5fa0'}));
  if(ex){add(1.4,7.1,()=>sPerson(1.4,7.1,svChar(901,'adult'),{pose:'stand',front:false,right:true,shirt:'#3a5a8a'}));add(9.2,7.6,()=>sPerson(9.2,7.6,svChar(902,'adult'),{pose:'stand',front:true,right:false,shirt:'#5a3a4a'}));}
  // público: casi todo es figura corta de grada; la gente del censo y la protagonista, completas
  let n=ex?0:0;
  for(let i=0;i<NR;i++)for(let j=0;j<NC;j++){const x=sx(j),y=ty(i)+.5,z=tz(i);const k=i*NC+j;
    if(i===AN[0]&&j===AN[1])continue;if(slots.slice(0,cen.length).some(s=>s[0]===i&&s[1]===j))continue;
    if(ex?!(i%2===0&&j%2===0&&svH(k*7+3)>.1):svH(k*13+S.day%5)<.07)continue;n++;
    add(x,y,()=>uMini(x,y,z,k+S.day%3*500,{paper:ex,lap:!ex&&svH(k+50)<.25,phone:!ex&&svH(k+80)<.18}),x+y+.01);}
  cen.slice(0,slots.length).forEach((v,q)=>{const [i,j]=slots[q];const x=sx(j),y=ty(i)+.5,z=tz(i);add(x,y,()=>{ctx.save();ctx.translate(0,-z);uCenFig(v,x,y,{pose:'sit',front:true,right:false,act:ex?null:(q?null:'phone')});ctx.restore();},x+y+.02);});
  const ana={x:sx(AN[1]),y:ty(AN[0])+.5,z:tz(AN[0]),pose:'sit',front:true,right:false,act:ex?null:((tt*.7)%3<1?'phone':null)};
  const after=()=>{if(night>.3){ctx.fillStyle='rgba(255,236,190,.07)';const [a,b]=P(5,5,0);ctx.fillRect(a-300,b-240,600,480);}};
  return {W,D,floor:'#b79c74',wall:'#ece3cf',out:false,tile:false,drawBase,decor:()=>{},items:it,ana,after};}

// ---- pasillo de la pública: carteles de asamblea y de pisos, cafetería barata ----
function uPasillo(E){const {tt,night}=E;const it=[],add=(x,y,f,d)=>it.push({d:d??x+y,f});const W=13,D=6.5,WH=66;const h=S.t/60,wd=dateOf(S.day).wd;const cen=uCen(UNI_PUB,h,wd);
  const drawBase=()=>{uRoom(W,D,WH,'#d3cbb9','#ece4d2','#e2d9c4','rgba(80,70,50,.12)');uQ('x',0,W,0,0,10,'#7d9bb0');uQ('y',0,D,0,0,10,'#7390a5');
    // puerta del aula
    uQ('x',.7,2.1,0,0,46,'#6b4a2e');uQ('x',.85,1.95,0,22,40,'#9bb8c4');uT('x',1.4,0,43,'AULA 2','#f1efe6',2.8);
    // tablón
    uQ('x',2.2,7.8,0,22,62,'#8a6a48');uQ('x',2.32,7.68,0,23.5,60.5,'#c79a63');
    uQ('x',2.5,4.1,0,28,58,'#fff3b8');uT('x',3.3,0,54,'ASAMBLEA','#c0262d',3.0);uT('x',3.3,0,47.5,'jueves 14:00','#3b3247',1.9);uT('x',3.3,0,42.5,'contra la','#3b3247',1.9);uT('x',3.3,0,37.5,'subida','#3b3247',1.9);uT('x',3.3,0,32.5,'de tasas','#3b3247',1.9);
    uQ('x',4.3,5.9,0,30,58,'#cfe8ff');uT('x',5.1,0,54,'PISO','#2a5a8a',3.2);uT('x',5.1,0,48,'COMPARTIDO','#2a5a8a',2.1);uT('x',5.1,0,42,'habitación','#3b3247',1.9);uT('x',5.1,0,36.5,'290 €/mes','#3b3247',2.1);
    uQ('x',6.1,7.6,0,32,58,'#ffd6e0');uT('x',6.85,0,54,'SE BUSCA','#a8325a',2.4);uT('x',6.85,0,48.5,'PISO','#a8325a',3.2);uT('x',6.85,0,42.5,'3 estudiantes','#3b3247',1.8);uT('x',6.85,0,37.5,'sin fianza','#3b3247',1.9);
    for(let k=0;k<7;k++){const x0=2.5+k*.72,z0=24+(k%3)*.8;uQ('x',x0,x0+.5,0,z0,z0+3.5,['#fff','#f7e08a','#d5f5c8','#f6c1c1'][k%4]);}
    // cafetería
    uQ('x',8.1,12.4,0,0,62,'#7a6040');uQ('x',8.3,12.2,0,20,48,'#2a2320');uQ('x',8.2,12.3,0,50,62,'#f0d98a');uT('x',10.25,0,56,'CAFETERÍA','#5a3a22',3.4);
    uQ('x',8.35,10.6,0,26,47,'#2f4a3a');uT('x',9.5,0,43,'Café 1,20','#f1efe6',1.9);uT('x',9.5,0,36.5,'Bocata 2,50','#f1efe6',1.9);uT('x',9.5,0,30,'Menú 6,50','#f5d76e',1.9);
    // taquillas
    for(let k=0;k<5;k++){uQ('y',.7+k*.62,.7+k*.62+.56,0,0,38,['#3f8a8f','#5a7cb0','#3f8a8f','#c9863a','#5a7cb0'][k]);}
    uQ('y',4.2,6.2,0,26,50,'#bfe3f7');for(let k=0;k<2;k++)uQ('y',4.2+k*1-.03,4.2+k*1+.03,0,26,50,'#8a8576');};
  add(10.3,1.0,()=>{sBox(8.1,.4,12.4,1.2,0,24,'#8a6a48');sTop(8.1,.4,12.4,1.2,24.5,'#b08a5a');sBox(8.5,.6,9.1,1.0,24.5,31,'#cfd4d8');sBox(11.2,.6,11.9,1.0,24.5,27,'#fffdf6');},10.3+1.2+.2);
  add(9.8,.45,()=>svP(9.8,.35,60,'adult',{pose:'stand',front:true,right:false,shirt:'#ffffff',act:(tt*.3%2<1)?'talk':null}),9.8+.45);
  // cola de la cafetería
  [[10.6,1.9],[10.6,2.6]].forEach(([x,y],q)=>add(x,y,()=>svP(x,y,61+q,'adult',{pose:'stand',front:false,right:true,act:q?'phone':null})));
  // banco central con tres sentadas
  add(3.8,5.0,()=>{for(const x of [2.5,4.4]){sBox(x,5.35,x+.12,5.85,0,9,'#4a4a50');}sBox(2.4,5.3,5.2,5.9,9,10.5,'#8a6a48');sBox(2.4,5.85,5.2,5.97,10.5,22,'#8a6a48');});
  [[2.9,0],[3.8,1],[4.7,2]].forEach(([x,q])=>add(x,5.55,()=>svP(x,5.55,70+q,'adult',{pose:'sit',front:false,right:q%2===0,act:q===1?'phone':null}),x+5.6+.2));
  // charla y lectora del tablón
  const ph=(tt*.8)%3;add(7.4,3.2,()=>{svP(7.4,3.2,74,'adult',{pose:'stand',front:true,right:true,act:ph<1.5?'talk':null});svP(8.2,3.2,75,'adult',{pose:'stand',front:true,right:false,act:ph<1.5?null:'talk'});});
  add(7.9,1.6,()=>svP(7.9,1.6,76,'adult',{pose:'stand',front:false,right:true}));
  const w1=upp(tt*.06,1.2,6.2);add(w1[0],4.2,()=>svP(w1[0],4.2,77,'adult',{pose:'walk',ph:tt*6,front:true,right:w1[1]}));
  const w2=upp(tt*.05+.8,2.0,11.5);add(w2[0],3.9,()=>svP(w2[0],3.9,78,'adult',{pose:'walk',ph:tt*6+1,front:false,right:w2[1],act:null}));
  cen.slice(0,2).forEach((v,q)=>{const x=1.8+q*.9,y=2.0;add(x,y,()=>uCenFig(v,x,y,{front:true,right:q===0,act:q?'phone':'talk'}));});
  add(12.1,5.6,()=>{cyl(12.1,5.8,.25,0,10,'#b5543c','#c27458');const [a,b]=P(12.1,5.8,10);for(let k=0;k<6;k++){ctx.fillStyle=['#3f8a3a','#58ac4e'][k%2];ctx.beginPath();ctx.ellipse(a+Math.cos(k*1.3)*6,b-10-Math.abs(Math.sin(k))*6,5,2.8,k,0,7);ctx.fill();}});
  const ana={x:10.6,y:3.3,pose:'stand',front:false,right:true,act:null,prop:'☕'};
  return {W,D,floor:'#d3cbb9',wall:'#ece4d2',out:false,tile:false,drawBase,decor:()=>{},items:it,ana,after:uNightAfter(night*.5,false)};}

// ---- aula de veinte de Nébula: pantalla, portátiles; en exámenes, mesas separadas y silencio ----
function uAulaPri(E){const {tt,night}=E;const it=[],add=(x,y,f,d)=>it.push({d:d??x+y,f});const W=9,D=8.4,WH=66;const h=S.t/60,wd=dateOf(S.day).wd;const ex=uniExamen();
  const C=uniCur();const subj=C?EDU_PROGS[C.k].n:'Clase';const cen=uCen(UNI_PRI,h,wd);
  const desks=[];if(ex){for(let r=0;r<3;r++)for(let c=0;c<4;c++)desks.push([1.1+c*2.0,2.5+r*1.9]);}else{for(let r=0;r<4;r++)for(let c=0;c<5;c++)desks.push([1.1+c*1.55,2.4+r*1.45]);}
  const AN=ex?5:12;
  const drawBase=()=>{uRoom(W,D,WH,'#d8d4cb','#f4f6f7','#e9edef','rgba(60,80,90,.10)');uQ('x',0,W,0,0,8,'#2a8f9a');uQ('y',0,D,0,0,8,'#26838d');
    uQ('x',1.4,7.6,0,22,58,'#2b3036');uQ('x',1.55,7.45,0,23.5,56.5,'#f4f7fb');
    uT('x',4.5,0,51.5,subj.length>30?subj.slice(0,29)+'…':subj,'#1f6f7a',2.2);
    if(ex){uT('x',4.5,0,42.5,'EXAMEN','#c0262d',4.2);uT('x',4.5,0,34,'Móviles fuera · silencio','#3b3247',2.1);uT('x',4.5,0,28.5,'Quedan '+(25+(S.day*7)%30)+' min','#3b3247',2.1);}
    else{uT('x',4.5,0,44,'Tema '+(1+(S.day%9)),'#3b3247',3.2);uT('x',4.5,0,37.5,'· Caso práctico en grupos','#3b3247',2);uT('x',4.5,0,32.5,'· Tutoría: martes 12:00','#3b3247',2);uT('x',4.5,0,27.5,'20 plazas, una cada una','#2a8f9a',1.9);}
    uQ('y',1.0,5.2,0,24,56,'#6b7a88');uQ('y',1.15,5.05,0,25.5,54.5,svSky(night));for(let k=1;k<3;k++)uQ('y',1.15+k*1.3-.04,1.15+k*1.3+.04,0,25.5,54.5,'#6b7a88');
    uQ('y',5.5,6.9,0,22,42,'#fff');uT('y',6.2,0,37,'CAMPUS','#2a8f9a',2.2);uT('y',6.2,0,31,'NÉBULA','#2a8f9a',2.4);};
  // mesa y profe
  add(8.0,1.7,()=>{sBox(7.4,1.0,8.9,2.0,0,18,'#c9ccd1');sTop(7.4,1.0,8.9,2.0,18.5,'#e9ecef');sBox(7.8,1.3,8.4,1.8,18.5,19.5,'#4a5260');sBox(7.8,1.3,8.4,1.4,19.5,26,'#5a6270');});
  const pp=ex?upp(tt*.06,1.7,7.0):null;
  if(ex)add(2.55,pp[0],()=>sPerson(2.55,pp[0],svChar(910,'adult'),{pose:'walk',ph:tt*6,front:pp[1],right:false,shirt:'#2a8f9a'}),2.55+pp[0]);
  else{const tp=(tt*.25)%2;add(6.6,1.5,()=>sPerson(6.6,1.5,{...svChar(910,'adult'),style:'coleta'},{pose:'stand',act:tp<1?'talk':null,front:true,right:true,shirt:'#2a8f9a'}));}
  desks.forEach(([x,y],k)=>{
    const occ=k===AN||(ex?k!==AN&&svH(k*5+1)>.08:svH(k*9+S.day%4)>.15);const cv=k===3?cen[0]:k===8?cen[1]:null;
    add(x+.5,y+.6,()=>{sBox(x,y,x+1.2,y+.6,0,16,'#a9b0b8');sTop(x-.05,y-.05,x+1.25,y+.65,16.5,'#e5e8ea');
      if(occ||cv){svChair(x+.6,y+.95,'#2a8f9a');if(ex){sTop(x+.3,y+.1,x+.9,y+.5,17,'#fffdf6');}else{sBox(x+.2,y+.08,x+.8,y+.42,16.6,17.3,'#3a4048');sBox(x+.2,y+.4,x+.8,y+.45,17.3,23,'#4a5260');sBox(x+.24,y+.41,x+.76,y+.44,18,22,'#9ad0e8');}
        if(k!==AN){if(cv)uCenFig(cv,x+.6,y+.95,{pose:'sit',front:false,right:k%2===0,noname:false});else svP(x+.6,y+.95,k*3+S.day%5,'adult',{pose:'sit',front:false,right:k%2===0,act:!ex&&k%6===4?'phone':null});}}
      else if(!ex){sBox(x+.2,y+.08,x+.8,y+.42,16.6,17.3,'#3a4048');}});});
  const [ax,ay]=desks[AN];const ana={x:ax+.6,y:ay+.95,pose:'sit',front:false,right:true,act:ex?null:((tt*.7)%3<1?'phone':null)};
  const after=()=>{if(night>.3){ctx.fillStyle='rgba(255,250,230,.06)';const [a,b]=P(4,4,0);ctx.fillRect(a-260,b-200,520,400);}};
  return {W,D,floor:'#d8d4cb',wall:'#f4f6f7',out:false,tile:false,drawBase,decor:()=>{},items:it,ana,after};}

// ---- exteriores: plaza de la pública y campus con césped de Nébula; de noche y en domingo, cerrados ----
function uTree(x,y,s,night){const [a,b]=P(x,y);ctx.fillStyle='rgba(20,40,20,.16)';ctx.beginPath();ctx.ellipse(a,b,16*s,7*s,0,0,7);ctx.fill();capsule(a,b,a,b-24*s,4.5*s,'#6b4a2e');for(const [dx,dy,r,c] of [[0,-34,13,'#4f9e45'],[-9,-28,10,'#3a7f36'],[9,-28,10,'#5daa4e'],[0,-42,9,'#6dbd5a']])circ(a+dx*s,b+dy*s,r*s,c);}
function uExtPub(E,closed){const {tt,night}=E;const it=[],add=(x,y,f,d)=>it.push({d:d??x+y,f});const W=13,D=10;const h=S.t/60,wd=dateOf(S.day).wd;const cen=closed?[]:uCen(UNI_PUB,h,wd);const lit=night>.4&&!closed;
  const drawBase=()=>{prism(0,0,W,D,-22,0,'#7b7466');topQuad(0,0,W,D,0,'#c9c2b2');uGrid(W,D,'rgba(80,70,50,.10)');
    topQuad(0,6.0,1.6,D,.1,'#8fb572');topQuad(W-1.6,8.0,W,D,.1,'#8fb572');
    // fachada
    sBox(.4,0,12.6,2.0,0,60,'#d9c8a6');sBox(.4,1.9,12.6,2.0,0,6,'#a8885f');sBox(.4,1.9,12.6,2.0,56,60,'#8a3b22');
    for(const x0 of [.9,2.7,8.9,10.7])for(const z0 of (x0<5?[36]:[12,36])){uQ('x',x0,x0+1.3,2.0,z0,z0+14,'#6b5a48');uQ('x',x0+.1,x0+1.2,2.0,z0+1,z0+13,lit?'#ffe9a8':svSky(night));}
    uT('x',7.6,2.0,52,'UNIVERSIDAD PÚBLICA DEL RÍO','#fff6e0',3.5);
    // pancarta
    uQ('x',.9,4.5,2.0,10,28,'#fffdf6');uT('x',2.7,2.0,22.5,'NO A LA SUBIDA','#c0262d',2.3);uT('x',2.7,2.0,15,'DE TASAS','#c0262d',3);
    // entrada, columnas y escalones
    uQ('x',5.4,7.6,2.0,0,32,closed?'#6b6f78':'#232b33');if(!closed)uQ('x',5.5,6.5,2.0,2,30,'#33414d');if(closed){for(let z=2;z<30;z+=3.2)uQ('x',5.45,7.55,2.02,z,z+2.2,'#8a8f98');uT('x',6.5,2.03,36,'CERRADO','#c0262d',3.6);}
    sBox(4.9,2.0,5.2,2.4,0,36,'#c9b890');sBox(7.8,2.0,8.1,2.4,0,36,'#c9b890');sBox(4.8,1.9,8.2,2.5,36,38,'#8a6a4a');
    sBox(4.6,2.0,8.4,2.6,0,6,'#9d927c');sBox(4.6,2.6,8.4,3.2,0,4,'#a99e88');sBox(4.6,3.2,8.4,3.8,0,2,'#b6ab96');};
  // bicicletas
  add(2.0,4.6,()=>{for(let k=0;k<4;k++){const x=.9+k*.6,y=4.5;const [a,b]=P(x,y);ctx.strokeStyle='#2a2a30';ctx.lineWidth=1.2;for(const dx of [-6,6]){ctx.beginPath();ctx.ellipse(a+dx,b-5,5,5.5,0,0,7);ctx.stroke();}capsule(a-6,b-5,a,b-13,1.2,['#c0262d','#3a86ff','#2e8b57','#e9c46a'][k]);capsule(a,b-13,a+6,b-5,1.2,['#c0262d','#3a86ff','#2e8b57','#e9c46a'][k]);capsule(a-6,b-5,a+6,b-5,1.2,'#444');}sBox(.7,4.9,3.4,5.0,0,5,'#6b6f78');},5.0);
  add(10.9,5.5,()=>{sBox(9.4,5.4,12.4,5.55,0,44,'#efe3b8');sBox(9.4,5.4,12.4,5.9,44,47,'#b5432a');for(let k=0;k<5;k++)poly([P(9.4+k*.6,5.9,44),P(10+k*.6,5.9,44),P(10+k*.6,6.0,40),P(9.4+k*.6,6.0,40)],k%2?'#fff':'#b5432a');
    uQ('x',9.55,12.25,5.56,22,41,'#3b3247');uT('x',10.9,5.58,35,'CAFETERÍA','#f0d98a',2.2);uT('x',10.9,5.58,28.5,'café 1,20 €','#fff',1.7);},10.9+5.5);
  add(11.0,7.0,()=>{sBox(9.4,6.7,12.4,7.2,0,12,'#8a6a48');sBox(9.4,6.7,12.4,7.2,12,13,'#b08a5a');sBox(9.8,6.8,10.4,7.0,13,15,'#cfd4d8');},12.4+7.2+.3);
  if(!closed){add(10.7,6.1,()=>svP(10.7,6.1,40,'adult',{pose:'stand',front:true,right:false,shirt:'#ffffff'}),10.7+6.2);
    // escalones: gente sentada
    [[5.2,2.3,6],[6.1,2.3,6],[7.2,2.9,4],[5.6,3.5,2]].forEach(([x,y,z],q)=>add(x,y+.1,()=>{ctx.save();ctx.translate(0,-z);svP(x,y,41+q,'adult',{pose:'sit',front:true,right:q%2===0,act:q===1?'phone':null});ctx.restore();},x+y+.15));
    // grupos y paseo
    const ph=(tt*.8)%3;
    add(2.6,7.1,()=>{svP(2.6,7.1,45,'adult',{pose:'stand',front:true,right:true,act:ph<1.5?'talk':null});svP(3.4,7.1,46,'adult',{pose:'stand',front:true,right:false,act:ph<1.5?null:'talk'});svP(3.0,7.8,47,'adult',{pose:'stand',front:true,right:false,act:'phone'});});
    add(6.6,8.1,()=>{svP(6.6,8.1,48,'adult',{pose:'stand',front:true,right:true,act:ph<1.5?null:'talk'});svP(7.4,8.1,49,'adult',{pose:'stand',front:true,right:false,act:ph<1.5?'talk':null});});
    const w1=upp(tt*.05,1.5,11.5);add(w1[0],5.4,()=>svP(w1[0],5.4,50,'adult',{pose:'walk',ph:tt*6,front:true,right:w1[1]}));
    const w2=upp(tt*.04+.7,3.0,10);add(w2[0],4.4,()=>svP(w2[0],4.4,51,'adult',{pose:'walk',ph:tt*6+1,front:false,right:w2[1]}));
    add(9.8,7.9,()=>{svP(9.8,7.9,52,'adult',{pose:'stand',front:true,right:false,prop:'☕'});svP(10.6,8.2,53,'adult',{pose:'stand',front:true,right:false,act:'phone'});});
    add(1.8,8.2,()=>svP(1.8,8.2,54,'adult',{pose:'stand',front:true,right:true,act:'phone'}));
    cen.slice(0,2).forEach((v,q)=>{const x=4.2+q*.9,y=6.3;add(x,y,()=>uCenFig(v,x,y,{front:true,right:q===0,act:q?'phone':'talk'}));});}
  add(.9,8.9,()=>uTree(.9,8.9,1.1,night),.9+8.9+.5);add(12.1,3.4,()=>uTree(12.1,3.4,1.0,night),12.1+3.4+.5);
  if(closed){add(6.5,8.6,()=>{for(const x of [.6,3.2,6.5,9.8,12.4])sBox(x-.12,8.5,x+.12,8.7,0,30,'#4a4f58');for(let k=0;k<10;k++){const x0=.6+k*1.18;sBox(x0+.3,8.58,x0+1.0,8.62,0,24,'#6b6f78');}sBox(.6,8.5,12.4,8.7,24,26,'#4a4f58');sBox(5.7,8.45,7.3,8.75,12,22,'#fffdf6');},8.8+6.5);
    add(6.5,8.8,()=>{uT('x',6.5,8.78,17,'CERRADO','#c0262d',2.9);},6.5+8.8+.1);}
  const ana=closed?{x:8.7,y:9.4,pose:'stand',front:false,right:true,act:null}:{x:8.6,y:6.2,pose:'stand',front:true,right:true,act:null,prop:'☕'};
  const after=()=>{uRain(tt,night);uNightAfter(night,closed)();};
  return {W,D,floor:'#c9c2b2',wall:'#d9c8a6',out:true,tile:false,drawBase,decor:()=>{},items:it,ana,after};}
function uExtPri(E,closed){const {tt,night}=E;const it=[],add=(x,y,f,d)=>it.push({d:d??x+y,f});const W=11,D=9;const h=S.t/60,wd=dateOf(S.day).wd;const cen=closed?[]:uCen(UNI_PRI,h,wd);const lit=night>.4&&!closed;
  const drawBase=()=>{prism(0,0,W,D,-22,0,'#7d8a80');topQuad(0,0,W,D,0,'#dfe3e1');topQuad(.5,3.8,W-.5,D-.3,.1,'#7cc26a');ctx.strokeStyle='rgba(40,90,40,.18)';ctx.lineWidth=1;ctx.beginPath();for(let k=0;k<12;k++){ctx.moveTo(...P(.7+k*.85,3.9));ctx.lineTo(...P(.7+k*.85,D-.4));}ctx.stroke();
    // camino al portal
    topQuad(4.4,2.6,6.6,3.8,.15,'#e6e0d2');topQuad(4.6,3.8,6.4,D,.15,'#e6e0d2');
    // edificio de cristal y paneles
    sBox(.4,0,10.6,2.4,0,54,'#f2f4f5');sBox(.4,2.3,10.6,2.4,0,5,'#2a8f9a');
    for(let k=0;k<4;k++){const x0=.8+k*2.4;if(k===2)continue;uQ('x',x0,x0+1.9,2.4,10,41,'#3a4a52');uQ('x',x0+.1,x0+1.8,2.4,11,40,lit?'#ffe9a8':'#8fc9d6');uQ('x',x0+.1,x0+1.8,2.4,25,26,'#3a4a52');}
    uQ('x',4.9,6.1,2.4,0,34,closed?'#6b7480':'#3a4a52');if(!closed){uQ('x',5.0,6.0,2.4,1,33,'#8fc9d6');uQ('x',5.45,5.55,2.4,1,33,'#3a4a52');}else{for(let z=2;z<32;z+=3.2)uQ('x',5.0,6.0,2.42,z,z+2.2,'#9aa3ae');}
    sBox(4.5,2.4,6.5,3.0,34,37,'#2a8f9a');
    uQ('x',.4,10.6,2.4,43,54,'#2a8f9a');uT('x',5.5,2.4,48.5,'CAMPUS NÉBULA','#ffffff',3.6);
};
  // cartel de «financia tu matrícula»
  add(2.4,3.2,()=>{sBox(1.5,3.1,3.3,3.25,0,3,'#3a4048');sBox(1.6,3.15,3.2,3.2,3,56,'#2a8f9a');uQ('x',1.65,3.15,3.21,6,53,'#2a8f9a');uQ('x',1.7,3.1,3.21,9,50,'#ffffff');
    uT('x',2.4,3.22,47,'FINANCIA TU','#2a8f9a',2.2);uT('x',2.4,3.22,40.5,'MATRÍCULA','#2a8f9a',2.5);uT('x',2.4,3.22,32.5,'hasta 60 cuotas','#3b3247',1.8);uT('x',2.4,3.22,26.5,'desde 189 €/mes','#c0262d',1.9);uT('x',2.4,3.22,19.5,'Nébula Crédito','#2a8f9a',1.7);},2.4+3.2+.6);
  // cafetería de franquicia
  add(9.4,5.0,()=>{sBox(8.2,3.8,10.7,5.8,0,26,'#f6f1e4');sBox(8.2,3.8,10.7,5.8,26,29,'#2e6e5a');uQ('x',8.5,10.4,5.8,3,24,'#a8d8df');uQ('x',8.7,10.2,5.8,8,20,'#cfe9ec');uT('x',9.45,5.82,33,'TAZÓN & CO.','#f6f1e4',2.6);uT('x',9.45,5.82,15,'flat white 3,90 €','#2e6e5a',1.8);
    for(let k=0;k<5;k++)poly([P(8.2+k*.5,5.8,26),P(8.7+k*.5,5.8,26),P(8.7+k*.5,6.2,22),P(8.2+k*.5,6.2,22)],k%2?'#f6f1e4':'#2e6e5a');},9.4+5.9);
  const mesa=(x,y)=>{cyl(x,y,.45,10,11,'#d9d2c2','#f0ece2');cyl(x,y,.07,0,10,'#6b6f78','#6b6f78');};
  const silla=(x,y)=>{sBox(x-.18,y-.18,x+.18,y+.18,8,10,'#2e6e5a');sBox(x-.14,y-.14,x-.08,y-.08,0,8,'#6b6f78');sBox(x+.1,y+.1,x+.16,y+.16,0,8,'#6b6f78');};
  // terraza
  if(!closed){[[8.8,7.2],[10.2,7.9]].forEach(([x,y],q)=>{add(x,y,()=>{mesa(x,y);},x+y);add(x-.8,y,()=>{silla(x-.8,y);svP(x-.8,y+.02,80+q*2,'adult',{pose:'sit',front:true,right:true,act:q?'phone':null});},x-.8+y+.1);add(x+.8,y,()=>{silla(x+.8,y);svP(x+.8,y+.02,81+q*2,'adult',{pose:'sit',front:true,right:false});},x+.8+y+.1);});}
  else[[8.8,7.2],[10.2,7.9]].forEach(([x,y])=>add(x,y,()=>mesa(x,y),x+y));
  // bancos
  const banco=(x,y)=>{sBox(x,y,x+.1,y+.5,0,7,'#6b6f78');sBox(x+1.5,y,x+1.6,y+.5,0,7,'#6b6f78');sBox(x-.05,y,x+1.65,y+.55,7,9,'#b88a54');sBox(x-.05,y+.45,x+1.65,y+.55,9,18,'#b88a54');};
  add(1.6,5.8,()=>banco(1.0,5.6),1.0+6.1);add(5.0,6.9,()=>banco(4.2,7.4),4.2+7.5);
  if(!closed){
    add(1.5,5.7,()=>svP(1.5,5.7,90,'adult',{pose:'sit',front:true,right:true,act:'phone'}),1.5+5.8+.2);add(2.2,5.7,()=>svP(2.2,5.7,91,'adult',{pose:'sit',front:true,right:false}),2.2+5.8+.2);
    add(4.9,7.7,()=>svP(4.9,7.7,92,'adult',{pose:'sit',front:true,right:false,act:'phone'}),4.9+7.8+.2);
    const ph=(tt*.8)%3;
    add(6.9,5.2,()=>{svP(6.9,5.2,93,'adult',{pose:'stand',front:true,right:true,act:ph<1.5?'talk':null});svP(7.7,5.2,94,'adult',{pose:'stand',front:true,right:false,act:ph<1.5?null:'talk'});});
    add(3.1,4.6,()=>{svP(3.1,4.6,95,'adult',{pose:'stand',front:true,right:true,prop:'☕'});svP(3.9,4.6,96,'adult',{pose:'stand',front:true,right:false,act:'phone'});});
    const w1=upp(tt*.05,.8,10);add(w1[0],6.4,()=>svP(w1[0],6.4,97,'adult',{pose:'walk',ph:tt*6,front:true,right:w1[1]}));
    cen.slice(0,2).forEach((v,q)=>{const x=5.6+q*.9,y=5.0;add(x,y,()=>uCenFig(v,x,y,{front:true,right:q===0,act:q?'phone':'talk'}));});}
  add(.8,8.3,()=>uTree(.8,8.3,1.0,night),.8+8.3+.5);add(10.2,2.9,()=>uTree(10.2,2.9,.9,night),10.2+2.9+.5);
  if(closed){add(5.5,8.3,()=>{for(const x of [.6,3.0,5.5,8.0,10.4])sBox(x-.1,8.3,x+.1,8.5,0,28,'#4a4f58');sBox(.6,8.3,10.4,8.5,22,24,'#4a4f58');for(let k=0;k<9;k++)sBox(.8+k*1.07,8.36,1.5+k*1.07,8.4,0,22,'#8a919a');sBox(4.9,8.25,6.1,8.55,10,19,'#fffdf6');},8.7+5.5);add(5.5,8.7,()=>uT('x',5.5,8.58,14.5,'CERRADO','#c0262d',2.5),5.5+8.8);}
  const ana=closed?{x:7.6,y:8.9,pose:'stand',front:false,right:true,act:null}:{x:6.0,y:6.2,pose:'stand',front:true,right:true,act:null};
  const after=()=>{uRain(tt,night);uNightAfter(night,closed)();};
  return {W,D,floor:'#dfe3e1',wall:'#f2f4f5',out:true,tile:false,drawBase,decor:()=>{},items:it,ana,after};}

for(const key of [UNI_PUB,UNI_PRI]){SCENES[key]=function(E){const v=uVar(key),pub=key===UNI_PUB;
  if(v==='aula')return pub?uAulaPub(E):uAulaPri(E);
  if(v==='pasillo'&&pub)return uPasillo(E);
  const closed=v==='cerrada';return pub?uExtPub(E,closed):uExtPri(E,closed);};}
