// =================== CRIANZA: un hijo crece, cuesta, enferma y te organiza la vida; conciliar es una palabra ===================
const KD=k=>{k.hap=k.hap??70;k.sick=k.sick||0;k.play=k.play||0;return k;};
const kidsAll=()=>(S.kids||[]).map(KD);
const anaWorksToday=()=>!S.jobless&&dayType(S.day)==='work'&&!onLeave()&&!(S.sick>0);
const partnerHome=()=>{const p=liveIn();return p&&(p.jobless||Math.random()<.35);};
const grandma=()=>{const m=P_('madre');return m&&m.rel>=45&&!m.dead&&(m.age||60)<78?m:null;};
function kidSickCare(k){const n=CH().name;const m=grandma();const p=liveIn();
  if(!anaWorksToday()){tell(`${k.n} tiene fiebre. ${n} se queda con ${k.g==='f'?'ella':'él'}: ${S.jobless?'al menos para eso sirve el paro':'hoy no tenía turno'}.`,'🤒');return;}
  if(p&&partnerHome()){tell(`${k.n} tiene fiebre. Se queda ${p.n}. Esta vez.`,'🤒');p.wear=Math.min(100,(p.wear||0)+2);return;}
  if(m&&Math.random()<.65){m.rel=Math.min(100,m.rel+2);tell(`${k.n} tiene fiebre y ${n} tiene turno. Su madre ha cogido el autobús a las siete para quedarse con ${k.g==='f'?'la niña':'el niño'}. Sin cobrar, como siempre. La conciliación en este país se llama abuela.`,'👩‍🦳');S.needs.social=Math.max(0,S.needs.social-3);return;}
  // Ana falta
  S.rep=Math.max(0,(S.rep??70)-4);bkAdd('Críos',-Math.round(salary()*.6));S.lastWorkDay=S.day;S.kidAbs=(S.kidAbs||0)+1;
  tell(`${k.n} tiene fiebre y no hay nadie. ${n} ha llamado al trabajo: «mi hij${k.g==='f'?'a':'o'} está mal». Silencio al otro lado. ${S.kidAbs>=3?'Es la tercera vez; '+(S.office?S.office.n:'la empresa')+' lo tiene apuntado.':'Un día sin cobrar.'}`,'🤒');
  if(S.kidAbs===3)chapter('concilia','Conciliar',`Tres faltas por ${k.n}. En la empresa ya hablan de «compromiso». ${n} no puede elegir entre el trabajo y ${k.g==='f'?'su hija':'su hijo'}; el sistema sí elige por ${oa()==='a'?'ella':'él'}: cada vez que ${k.n} enferma, ${n} se vuelve más despedible. Para quien tiene abuela cerca o dinero para una canguro, esto no existe.`);}
{const _dl=dailyEvents;dailyEvents=function(){const r=_dl.apply(this,arguments);try{const ks=kidsAll();if(!ks.length)return r;const n=CH().name;
  for(const k of ks){const a=kidAge(k);
    if(k.sick>0){k.sick--;if(k.sick===0)toast(`😌 ${k.n} ya está mejor`);}
    else if(a<=8&&Math.random()<(a<3?.045:.025)){k.sick=1+(Math.random()*3|0);kidSickCare(k);}
    else if(k.sick===0&&anaWorksToday()&&S.lastWorkDay!==S.day&&a<=8&&kidsAll().some(q=>q.sick>0)){/* ya cubierto arriba */}
    // felicidad: tiempo con Ana, no dinero
    const wk=dateOf(S.day).wd;k.hap=Math.max(0,Math.min(100,k.hap+(k.play>0?3:-1.2)+(S.jobless?.5:0)+(liveIn()?.5:0)-(typeof homeless==='function'&&homeless()?4:0)));k.play=0;
    if(k.hap<30&&a>=3&&Math.random()<.08)tell(pickR([`La tutora de ${k.n} ha pedido una reunión. «${k.g==='f'?'La':'El'} notamos distraíd${k.g==='f'?'a':'o'}». ${n} ha pedido permiso para ir. Se lo han dado sin sueldo.`,`${k.n} ha preguntado por qué ${n} nunca está. No había respuesta buena.`,`${k.n} se ha hecho pis en la cama otra vez. El pediatra habla de «ansiedad». Tiene ${a} años.`]),'🧒');
    if(k.hap>=80&&Math.random()<.04)tell(pickR([`${k.n} ha dibujado a ${n}. Con una sonrisa enorme y las manos muy grandes.`,`${k.n} se ha dormido en el sofá encima de ${n}. Nadie se ha movido en una hora.`]),'🧒');
    // cole: septiembre, libros y material (la pública es gratis; lo demás no)
    const d=dateOf(S.day);if(a>=3&&d.m===8&&d.dm===1){const c=hrs(a>=6?14:8);bkAdd('Críos',-c);tell(`Vuelta al cole de ${k.n}: libros, mochila, uniforme de deporte, la cuota «voluntaria» del AMPA. ${fmt(c)}. La educación es gratuita, dice la ley.`,'🎒');}
    if(a===3&&(S.day-k.born)%60===0)chapter('cole_'+k.n,'El cole',`${k.n} empieza el cole. Público, en el barrio: ${W_().mov>=50?'con AMPA que se mueve y comedor becado':'con 28 por clase y una profe de baja sin sustituir'}. A las cinco hay que recogerl${k.g==='f'?'a':'o'}, y ${n} sale a las ${TR().sh[1]}.`);}
  // recoger del cole: quién puede
  const esc=ks.filter(k=>kidAge(k)>=3&&kidAge(k)<12);if(esc.length&&anaWorksToday()&&TR().sh[1]>16.5&&!S.recoger&&dateOf(S.day).wd===1){askDilemma('cr_recoger',{k:esc[0].n});}
  if(S.recoger==='pagar'&&dateOf(S.day).wd===0){const c=hrs(9)*esc.length;bkAdd('Críos',-c);toast(`🎒 Comedor y extraescolares: ${fmt(c)}`);}
  if(S.recoger==='madre'&&Math.random()<.03){const m=grandma();if(m){m.rel=Math.max(0,m.rel-1);tell(`Su madre ha ido a recoger a ${esc[0]?esc[0].n:'los niños'} otra vez. Le duele la cadera. No lo dice.`,'👩‍🦳');}else{S.recoger=null;}}
  }catch(e){console.error(e);}return r;};}
Object.assign(DLG,{cr_recoger:{t:()=>DT.cr_recoger.t,x:d=>huecos(DT.cr_recoger.x,{k:d.k,h:TR().sh[1]}),
  o:()=>{const m=grandma();const p=liveIn();const O=DT.cr_recoger.o;return [{t:O[0].t,s:O[0].s,f:()=>{S.recoger='reduccion';S.payMul=(S.payMul||1)*.75;S.rep=Math.max(0,(S.rep??70)-5);tell(huecos(O[0].tell,{}),'🎒');}},
    {t:O[1].t,s:huecos(O[1].s,{h:hrs(9)}),f:()=>{S.recoger='pagar';tell(huecos(O[1].tell,{c:fmt(hrs(9))}),'🎒');}},
    ...(m?[{t:O[2].t,s:huecos(O[2].s,{}),f:()=>{S.recoger='madre';m.rel=Math.min(100,m.rel+3);tell(O[2].tell,'👩‍🦳');}}]:[]),
    ...(p?[{t:huecos(O[3].t,{p:p.n}),s:O[3].s,f:()=>{S.recoger='pareja';p.wear=Math.min(100,(p.wear||0)+8);p.wearWhy=DT.cr_recoger.why;tell(huecos(O[3].tell,{p:p.n,ella:DT.cr_recoger.ella[p.n.endsWith('a')?0:1]}),'🎒');}}]:[])];},
  auto:()=>{const m=grandma();return m?2:S.money>hrs(100)?1:0;}}});
Object.assign(DLG_CD,{cr_recoger:200});
// ---- el cole: por la mañana no están ----
{const _ur=updateResidents;updateResidents=function(gm){try{const h=S.t/60;const wk=dateOf(S.day).wd;for(const r of S.res||[]){if(r.kind!=='kid')continue;const k=(S.kids||[])[r.kid];if(!k)continue;const a=kidAge(k);const school=a>=3&&wk>=1&&wk<=5&&!k.sick&&!festivo(S.day);
      if(school&&h>=9&&h<(S.recoger==='pagar'?18.5:17)&&!r.away){r.away={until:S.day*1440+(S.recoger==='pagar'?18.5:17)*60,back:[r.x,r.y]};}
      if(r.away&&S.day*1440+S.t>=r.away.until){r.x=r.away.back[0];r.y=r.away.back[1];r.away=null;}}}catch(e){}return _ur.apply(this,arguments);};}
// ---- tocar al crío: jugar, cuento, deberes, bañar ----
function kidAtScreen(sx,sy){for(const r of S.res||[]){if(r.kind!=='kid'||r.away)continue;const [u,v]=w2v(r.x,r.y);const [bx,by]=P(u,v,0);const px=cam.x+bx*cam.z,py=cam.y+by*cam.z;if(Math.abs(sx-px)<18*cam.z&&sy-py<10*cam.z&&sy-py>-50*cam.z)return r;}return null;}
function openKidMenu(r){const k=KD((S.kids||[])[r.kid]);const a=kidAge(k);if(!objMenuEl)openObjMenu(0);const n=CH().name;
  const acts=[['jugar','🧸','Jugar un rato',30],['cuento','📖','Leer un cuento',20],...(a>=6?[['deberes','✏️','Ayudar con los deberes',35]]:[]),...(a<6?[['banar','🛁','Bañarl'+(k.g==='f'?'a':'o'),20]]:[]),['hablar','💬','Preguntarle qué tal',8]];
  let h=`<div class="omt">🧒 ${k.n} · ${a<1?'bebé':a+' años'} · ${k.hap>=70?'content'+(k.g==='f'?'a':'o'):k.hap>=40?'normal':'apagad'+(k.g==='f'?'a':'o')}${k.sick?' · 🤒 con fiebre':''}</div>`;
  for(const [kk,e,t,m] of acts)h+=`<button class="oma" data-ka="${kk}"><span>${e}</span><span class="omn"><b>${t}</b><small>${m} min</small></span></button>`;
  objMenuEl.innerHTML=h;objMenuEl.classList.add('on');objMenuEl.style.transform='';const W=objMenuEl.offsetWidth||230,H=objMenuEl.offsetHeight||200;let [x,y]=lastPtr;x=Math.max(8,Math.min(innerWidth-W-8,x-W/2));y=y+14+H>innerHeight-130?Math.max(60,y-H-14):y+14;objMenuEl.style.left=x+'px';objMenuEl.style.top=y+'px';
  objMenuEl.querySelectorAll('[data-ka]').forEach(b=>b.onclick=()=>{closeObjMenu();const kk=b.dataset.ka;const m=acts.find(z=>z[0]===kk)[3];S.kidAct={r:r.kid,k:kk,m,t:0};
    const cx=Math.floor(r.x),cy=Math.floor(r.y);const [sx,sy]=simCell();const path=bfs([sx,sy],(x,y)=>Math.abs(x-cx)+Math.abs(y-cy)<=1&&walkable(x,y));if(path&&path.length){S.sim.path=path;S.sim.target=null;S.sim.use=null;S.sim.cmd=true;}});}
{const _up=update;update=function(gm){const r=_up.apply(this,arguments);try{const A=S.kidAct;if(A){const rr=(S.res||[]).find(x=>x.kind==='kid'&&x.kid===A.r);const k=rr&&KD((S.kids||[])[A.r]);if(!rr||!k||rr.away){S.kidAct=null;return r;}const s=S.sim;if(s.path&&s.path.length)return r;
    if(Math.hypot(rr.x-s.x,rr.y-s.y)>2.2){S.kidAct=null;return r;}
    A.t+=gm;S.needs.social=Math.min(100,S.needs.social+.5*gm);S.needs.diversion=Math.min(100,S.needs.diversion+(A.k==='jugar'?.6:A.k==='deberes'?-.1:.25)*gm);S.needs.energia=Math.max(0,S.needs.energia-.08*gm);
    if(typeof anaOn==='function'){}
    if(A.t>=A.m){S.kidAct=null;k.play++;k.hap=Math.min(100,k.hap+(A.k==='jugar'?8:A.k==='cuento'?6:A.k==='deberes'?5:A.k==='banar'?4:3));floatText({jugar:'🧸',cuento:'📖',deberes:'✏️',banar:'🛁',hablar:'💬'}[A.k]+' '+k.n,s.x,s.y,46,'#7d3aa8');
      if(Math.random()<.25)tell({jugar:pickR([`${CH().name} y ${k.n} han jugado a ${pickR(['las cocinitas','los piratas','construir una cabaña con el sofá','el escondite en 40 metros cuadrados'])}. Media hora que no se parece a nada del resto del día.`,`${k.n} ha ganado. ${k.n} siempre gana.`]),cuento:`Cuento. ${k.n} se ha dormido antes del final. ${CH().name} ha terminado de leerlo igual.`,deberes:`Deberes de ${k.n}: ${pickR(['divisiones con decimales','un dibujo del sistema solar','una redacción sobre «mi familia»'])}. ${CH().name} ha tenido que mirar en el móvil.`,banar:`Baño de ${k.n}. Agua por todas partes. Risas.`,hablar:`«¿Qué tal el cole?» «Bien». «¿Y los amigos?» «Bien». ${k.n} ha contado algo a los diez minutos, sin que se lo preguntaran.`}[A.k],'🧒');}}}catch(e){}return r;};}
{const _lt=liveTap;liveTap=function(x,y){try{if(!viewPlace&&!(S.sim.work>0)){const r=kidAtScreen(lastPtr[0],lastPtr[1]);if(r){openKidMenu(r);sfx('tap');return;}}}catch(e){console.error(e);}return _lt.apply(this,arguments);};}
// Gente: cómo están
{const _gt=genteTab;genteTab=function(...a){let h=_gt.apply(this,a);try{for(const k of kidsAll()){const ag=kidAge(k);h=h.replace(`<span>${ag<1?'bebé':ag+' años'}</span>`,`<span>${ag<1?'bebé':ag+' años'} · ${k.hap>=70?'😊':k.hap>=40?'😐':'😟'} ${Math.round(k.hap)}${k.sick?' · 🤒':''}${ag>=3?' · cole':''}</span>`);}}catch(e){}return h;};}
// la IA también juega con los críos (cuando puede)
{const _au=autonomy;autonomy=function(){try{const s=S.sim;const h=S.t/60;if(S.autoHome&&!S.kidAct&&!s.use&&!(s.path&&s.path.length)&&!(s.work>0)&&h>=17&&h<21.5&&Math.random()<.05&&S.needs.energia>25){const r=(S.res||[]).find(x=>x.kind==='kid'&&!x.away);if(r){const k=KD((S.kids||[])[r.kid]);const a=kidAge(k);const kk=k.hap<50?'jugar':pickR(['jugar','cuento',a>=6?'deberes':'banar','hablar']);const m={jugar:30,cuento:20,deberes:35,banar:20,hablar:8}[kk];S.kidAct={r:r.kid,k:kk,m,t:0};const cx=Math.floor(r.x),cy=Math.floor(r.y);const [sx,sy]=simCell();const path=bfs([sx,sy],(x,y)=>Math.abs(x-cx)+Math.abs(y-cy)<=1&&walkable(x,y));if(path){S.sim.path=path;S.sim.target=null;S.sim.cmd=true;return;}S.kidAct=null;}}}catch(e){}return _au.apply(this,arguments);};}
