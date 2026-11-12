// =================== CRIANZA: un hijo crece, cuesta, enferma y te organiza la vida; conciliar es una palabra ===================
const {crianza:TX_crianza}=DATA.textos_mods_ag;
const KD=k=>{k.hap=k.hap??70;k.sick=k.sick||0;k.play=k.play||0;return k;};
const kidsAll=()=>(S.kids||[]).map(KD);
const anaWorksToday=()=>!S.jobless&&dayType(S.day)==='work'&&!onLeave()&&!(S.sick>0);
const partnerHome=()=>{const p=liveIn();return p&&(p.jobless||Math.random()<.35);};
const grandma=()=>{const m=P_('madre');return m&&m.rel>=45&&!m.dead&&(m.age||60)<78?m:null;};
function kdg(k){return k.g==='f'?0:1;}
function kidSickCare(k){const n=CH().name;const m=grandma();const p=liveIn();
  if(!anaWorksToday()){tell(huecos(TX_crianza.fiebre_casa,{k:k.n,ella:TX_crianza.g.ella[kdg(k)],motivo:S.jobless?TX_crianza.fiebre_motivo_paro:TX_crianza.fiebre_motivo_turno}),'🤒');return;}
  if(p&&partnerHome()){tell(huecos(TX_crianza.fiebre_pareja,{k:k.n,p:p.n}),'🤒');p.wear=Math.min(100,(p.wear||0)+2);return;}
  if(m&&Math.random()<.65){m.rel=Math.min(100,m.rel+2);tell(huecos(TX_crianza.fiebre_abuela,{k:k.n,nino:TX_crianza.g.la_nina[kdg(k)]}),'👩‍🦳');S.needs.social=Math.max(0,S.needs.social-3);return;}
  // Ana falta
  S.rep=Math.max(0,(S.rep??70)-4);bkAdd('Críos',-Math.round(salary()*.6));S.lastWorkDay=S.day;S.kidAbs=(S.kidAbs||0)+1;
  tell(huecos(TX_crianza.fiebre_nadie,{k:k.n,ao:TX_crianza.g.ao[kdg(k)],fin:S.kidAbs>=3?huecos(TX_crianza.fiebre_nadie_tercera,{empresa:S.office?S.office.n:TX_crianza.la_empresa}):TX_crianza.fiebre_nadie_una}),'🤒');
  if(S.kidAbs===3)chapter('concilia',TX_crianza.concilia_titulo,huecos(TX_crianza.concilia_texto,{k:k.n,suhijo:TX_crianza.g.su_hijo[kdg(k)],pron:TX_crianza.g.ella[oa()==='a'?0:1]}));}
{const _dl=dailyEvents;dailyEvents=function(){const r=_dl.apply(this,arguments);try{const ks=kidsAll();if(!ks.length)return r;const n=CH().name;
  for(const k of ks){const a=kidAge(k);
    if(k.sick>0){k.sick--;if(k.sick===0)toast(huecos(TX_crianza.mejor,{k:k.n}));}
    else if(a<=8&&Math.random()<(a<3?.045:.025)){k.sick=1+(Math.random()*3|0);kidSickCare(k);}
    else if(k.sick===0&&anaWorksToday()&&S.lastWorkDay!==S.day&&a<=8&&kidsAll().some(q=>q.sick>0)){/* ya cubierto arriba */}
    // felicidad: tiempo con Ana, no dinero
    const wk=dateOf(S.day).wd;k.hap=Math.max(0,Math.min(100,k.hap+(k.play>0?3:-1.2)+(S.jobless?.5:0)+(liveIn()?.5:0)-(typeof homeless==='function'&&homeless()?4:0)));k.play=0;
    if(k.hap<30&&a>=3&&Math.random()<.08)tell(huecos(pickR(TX_crianza.triste),{k:k.n,el:TX_crianza.g.el[kdg(k)],ao:TX_crianza.g.ao[kdg(k)],edad:a}),'🧒');
    if(k.hap>=80&&Math.random()<.04)tell(huecos(pickR(TX_crianza.contento),{k:k.n}),'🧒');
    // cole: septiembre, libros y material (la pública es gratis; lo demás no; la concertada, además, uniforme y cuota)
    const d=dateOf(S.day);if(d.m===8&&d.dm===1)k.pagado=0;
    if(a>=3&&d.m===8&&d.dm===1){const con=esCentroDe(k)==='concertado';const c=hrs(a>=6?14:8)+(con?hrs(a>=6?18:12):0);bkAdd('Críos',-c);k.pagado=(k.pagado||0)+c;tell(con?huecos(DATA.sucesos.centros.sept_concertado,{k:k.n,c:fmt(c)}):huecos(TX_crianza.vuelta_cole,{k:k.n,c:fmt(c)}),'🎒');}
    // a los tres años y al pasar a secundaria (12) se elige centro; el dilema vuelve cada día hasta que se responde (los que ya iban a la pública siguen ahí)
    if(a===3&&(S.day-k.born)%60===0&&!k.centro)k.pend='cole3';
    if(a===12&&(S.day-k.born)%60===0)k.pend='cole12';
    if(k.pend&&a>=3)askDilemma(k.pend==='cambio'?'cr_cole_cambio':'cr_cole',{i:(S.kids||[]).indexOf(k),e:k.pend});}
  // recoger del cole: quién puede
  const esc=ks.filter(k=>kidAge(k)>=3&&kidAge(k)<12);const larga=esc.length>0&&esc.every(k=>esCentroDe(k)==='concertado');/* la concertada acoge hasta las cinco y media: concilia salvo turnos largos */if(esc.length&&anaWorksToday()&&TR().sh[1]>(larga?17.5:16.5)&&!S.recoger&&dateOf(S.day).wd===1){askDilemma('cr_recoger',{k:esc[0].n});}
  if(S.recoger==='pagar'&&dateOf(S.day).wd===0){const c=esc.reduce((t,k)=>t+(esCentroDe(k)==='concertado'?hrs(5):hrs(9)),0);bkAdd('Críos',-c);toast(huecos(TX_crianza.comedor,{c:fmt(c)}));}
  if(S.recoger==='madre'&&Math.random()<.03){const m=grandma();if(m){m.rel=Math.max(0,m.rel-1);tell(huecos(TX_crianza.madre_recoge,{k:esc[0]?esc[0].n:TX_crianza.madre_recoge_ninos}),'👩‍🦳');}else{S.recoger=null;}}
  }catch(e){console.error(e);}return r;};}
Object.assign(DLG,{cr_recoger:{t:()=>DT.cr_recoger.t,x:d=>huecos(DT.cr_recoger.x,{k:d.k,h:TR().sh[1]}),
  o:()=>{const m=grandma();const p=liveIn();const O=DT.cr_recoger.o;const kz=kidsAll().filter(k=>kidAge(k)>=3&&kidAge(k)<12);const hl=kz.length>0&&kz.every(k=>esCentroDe(k)==='concertado');return [{t:O[0].t,s:O[0].s,f:()=>{S.recoger='reduccion';S.payMul=(S.payMul||1)*.75;S.rep=Math.max(0,(S.rep??70)-5);tell(huecos(O[0].tell,{}),'🎒');}},
    {t:O[1].t,s:huecos(O[1].s,{h:hrs(hl?5:9)}),f:()=>{S.recoger='pagar';tell(huecos(O[1].tell,{c:fmt(hrs(hl?5:9))}),'🎒');}},
    ...(m?[{t:O[2].t,s:huecos(O[2].s,{}),f:()=>{S.recoger='madre';m.rel=Math.min(100,m.rel+3);tell(O[2].tell,'👩‍🦳');}}]:[]),
    ...(p?[{t:huecos(O[3].t,{p:p.n}),s:O[3].s,f:()=>{S.recoger='pareja';p.wear=Math.min(100,(p.wear||0)+8);p.wearWhy=DT.cr_recoger.why;tell(huecos(O[3].tell,{p:p.n,ella:DT.cr_recoger.ella[p.n.endsWith('a')?0:1]}),'🎒');}}]:[])];},
  auto:()=>{const m=grandma();return m?2:S.money>hrs(100)?1:0;}}});
Object.assign(DLG_CD,{cr_recoger:200});
// ---- el cole: por la mañana no están ----
{const _ur=updateResidents;updateResidents=function(gm){try{const h=S.t/60;const wk=dateOf(S.day).wd;for(const r of S.res||[]){if(r.kind!=='kid')continue;const k=(S.kids||[])[r.kid];if(!k)continue;const a=kidAge(k);const school=a>=3&&wk<5&&!k.sick&&!festivo(S.day)&&k.huelga!==S.day;
      if(school&&h>=9&&h<(S.recoger==='pagar'?18.5:17)&&!r.away){r.away={until:S.day*1440+(S.recoger==='pagar'?18.5:17)*60,back:[r.x,r.y]};}
      if(r.away&&S.day*1440+S.t>=r.away.until){r.x=r.away.back[0];r.y=r.away.back[1];r.away=null;}}}catch(e){}return _ur.apply(this,arguments);};}
// ---- tocar al crío: jugar, cuento, deberes, bañar ----
function kidAtScreen(sx,sy){for(const r of S.res||[]){if(r.kind!=='kid'||r.away)continue;const [u,v]=w2v(r.x,r.y);const [bx,by]=P(u,v,0);const px=cam.x+bx*cam.z,py=cam.y+by*cam.z;if(Math.abs(sx-px)<18*cam.z&&sy-py<10*cam.z&&sy-py>-50*cam.z)return r;}return null;}
function openKidMenu(r){const k=KD((S.kids||[])[r.kid]);const a=kidAge(k);if(!objMenuEl)openObjMenu(0);const n=CH().name;
  const AC=TX_crianza.acciones;const acts=[['jugar',AC.jugar.e,AC.jugar.n,AC.jugar.m],['cuento',AC.cuento.e,AC.cuento.n,AC.cuento.m],...(a>=6?[['deberes',AC.deberes.e,AC.deberes.n,AC.deberes.m]]:[]),...(a<6?[['banar',AC.banar.e,huecos(AC.banar.n,{ao:TX_crianza.g.ao[kdg(k)]}),AC.banar.m]]:[]),['hablar',AC.hablar.e,AC.hablar.n,AC.hablar.m]];
  const ao=TX_crianza.g.ao[kdg(k)];let h=`<div class="omt">🧒 ${k.n} · ${a<1?TX_crianza.bebe:huecos(TX_crianza.anios,{a})} · ${huecos(k.hap>=70?TX_crianza.estado.bien:k.hap>=40?TX_crianza.estado.normal:TX_crianza.estado.mal,{ao})}${k.sick?TX_crianza.con_fiebre:''}</div>`;
  for(const [kk,e,t,m] of acts)h+=`<button class="oma" data-ka="${kk}"><span>${e}</span><span class="omn"><b>${t}</b><small>${huecos(TX_crianza.min,{m})}</small></span></button>`;
  objMenuEl.innerHTML=h;objMenuEl.classList.add('on');objMenuEl.style.transform='';const W=objMenuEl.offsetWidth||230,H=objMenuEl.offsetHeight||200;let [x,y]=lastPtr;x=Math.max(8,Math.min(innerWidth-W-8,x-W/2));y=y+14+H>innerHeight-130?Math.max(60,y-H-14):y+14;objMenuEl.style.left=x+'px';objMenuEl.style.top=y+'px';
  objMenuEl.querySelectorAll('[data-ka]').forEach(b=>b.onclick=()=>{closeObjMenu();const kk=b.dataset.ka;const m=acts.find(z=>z[0]===kk)[3];S.kidAct={r:r.kid,k:kk,m,t:0};
    const cx=Math.floor(r.x),cy=Math.floor(r.y);const [sx,sy]=simCell();const path=bfs([sx,sy],(x,y)=>Math.abs(x-cx)+Math.abs(y-cy)<=1&&walkable(x,y));if(path&&path.length){S.sim.path=path;S.sim.target=null;S.sim.use=null;S.sim.cmd=true;}});}
{const _up=update;update=function(gm){const r=_up.apply(this,arguments);try{const A=S.kidAct;if(A){const rr=(S.res||[]).find(x=>x.kind==='kid'&&x.kid===A.r);const k=rr&&KD((S.kids||[])[A.r]);if(!rr||!k||rr.away){S.kidAct=null;return r;}const s=S.sim;if(s.path&&s.path.length)return r;
    if(Math.hypot(rr.x-s.x,rr.y-s.y)>2.2){S.kidAct=null;return r;}
    A.t+=gm;S.needs.social=Math.min(100,S.needs.social+.5*gm);S.needs.diversion=Math.min(100,S.needs.diversion+(A.k==='jugar'?.6:A.k==='deberes'?-.1:.25)*gm);S.needs.energia=Math.max(0,S.needs.energia-.08*gm);
    if(typeof anaOn==='function'){}
    if(A.t>=A.m){S.kidAct=null;k.play++;k.hap=Math.min(100,k.hap+(A.k==='jugar'?8:A.k==='cuento'?6:A.k==='deberes'?5:A.k==='banar'?4:3));floatText(TX_crianza.acciones[A.k].e+' '+k.n,s.x,s.y,46,'#7d3aa8');
      if(Math.random()<.25){const jg=pickR(TX_crianza.juegos);const T={jugar:huecos(pickR(TX_crianza.jugar),{k:k.n,juego:jg}),cuento:huecos(TX_crianza.cuento,{k:k.n}),deberes:huecos(TX_crianza.deberes,{k:k.n,tema:pickR(TX_crianza.deberes_temas)}),banar:huecos(TX_crianza.banar,{k:k.n}),hablar:huecos(TX_crianza.hablar,{k:k.n})};tell(T[A.k],'🧒');}}}}catch(e){}return r;};}
{const _lt=liveTap;liveTap=function(x,y){try{if(!viewPlace&&!(S.sim.work>0)){const r=kidAtScreen(lastPtr[0],lastPtr[1]);if(r){openKidMenu(r);sfx('tap');return;}}}catch(e){console.error(e);}return _lt.apply(this,arguments);};}
// Gente: cómo están
{const _gt=genteTab;genteTab=function(...a){let h=_gt.apply(this,a);try{for(const k of kidsAll()){const ag=kidAge(k);const edad=ag<1?TX_crianza.bebe:huecos(TX_crianza.anios,{a:ag});h=h.replace(`<span>${edad}</span>`,`<span>${edad} · ${k.hap>=70?'😊':k.hap>=40?'😐':'😟'} ${Math.round(k.hap)}${k.sick?' · 🤒':''}${ag>=3?TX_crianza.gente_cole+(esCentroDe(k)==='concertado'?TX_crianza.gente_concertado:''):''}</span>`);}}catch(e){}return h;};}
// la IA también juega con los críos (cuando puede)
{const _au=autonomy;autonomy=function(){try{const s=S.sim;const h=S.t/60;if(S.autoHome&&!S.kidAct&&!s.use&&!(s.path&&s.path.length)&&!(s.work>0)&&h>=17&&h<21.5&&Math.random()<.05&&S.needs.energia>25){const r=(S.res||[]).find(x=>x.kind==='kid'&&!x.away);if(r){const k=KD((S.kids||[])[r.kid]);const a=kidAge(k);const kk=k.hap<50?'jugar':pickR(['jugar','cuento',a>=6?'deberes':'banar','hablar']);const m=TX_crianza.acciones[kk].m;S.kidAct={r:r.kid,k:kk,m,t:0};const cx=Math.floor(r.x),cy=Math.floor(r.y);const [sx,sy]=simCell();const path=bfs([sx,sy],(x,y)=>Math.abs(x-cx)+Math.abs(y-cy)<=1&&walkable(x,y));if(path){S.sim.path=path;S.sim.target=null;S.sim.cmd=true;return;}S.kidAct=null;}}}catch(e){}return _au.apply(this,arguments);};}
