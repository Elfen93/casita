// ---------- dilemas: decide el jugador (o Ana, si se lo deja) ----------
const DT=DATA.sucesos.dilemas;
const DLG={
  ideo:{t:d=>`${IDEOS[d.to].e} ${DT.ideo.t}`,x:d=>huecos(DT.ideo.x,{why:topWhy(d.to),antes:S.ideo==='apolitica'?DT.ideo.antes_apolitica:huecos(DT.ideo.antes,{i:IDEOS[S.ideo].n.toLowerCase()}),ideo:IDEOS[d.to].n.toLowerCase()}),
    o:d=>{const O=DT.ideo.o;return [{t:huecos(O[0].t,{i:IDEOS[d.to].n.toLowerCase()}),f:()=>changeIdeo(d.to)},{t:O[1].t,s:O[1].s,f:()=>{const c=ex();c.drift[d.to]*=.55;c.drift[S.ideo]=(c.drift[S.ideo]||0)+30;tell(O[1].tell,'🪨');}}];},
    auto:d=>Math.random()<.6?0:1},
  crisis:{t:d=>DT.crisis.t,x:d=>{const p=P_(d.p);return p?huecos(DT.crisis.x,{p:p.n,por:p.wearWhy?huecos(DT.crisis.por,{w:p.wearWhy}):''}):'';},
    o:d=>{const p=P_(d.p);const O=DT.crisis.o;if(!p)return [{t:DT.crisis.o_sin[0].t,f:()=>{}}];const cost=Math.round(60*PM());return [
      {t:O[0].t,s:O[0].s,f:()=>{const ok=Math.random()<.35+lvl('carisma')*.06-(p.hid.includes('mentirosa')?.2:0);if(ok){p.wear=Math.max(0,p.wear-35);p.love=Math.min(100,p.love+8);tell(huecos(O[0].tell_ok,{p:p.n}),'🕯️');}else{p.wear=Math.min(100,p.wear+8);tell(O[0].tell_ko,'🥀');}}},
      {t:huecos(O[1].t,{c:fmt(cost)}),ok:()=>S.money>=cost,f:()=>{for(let i=1;i<=4;i++)schedule(i*7,'terapia',{p:p.k,cost});tell(huecos(O[1].tell,{p:p.n}),'🛋️');}},
      {t:O[2].t,f:()=>{breakUp(p,p.wearWhy||DT.crisis.desgaste);ex().exp.loss++;}},
      {t:O[3].t,s:O[3].s,f:()=>{schedule(14,'silencio',{p:p.k});}}];},
    auto:d=>{const p=P_(d.p);return !p?0:T('genio')?2:lvl('carisma')>=4?0:S.money>500?1:3;}},
  contra:{t:d=>DT.contra.t,x:d=>huecos(DT.contra.x[d.cl]||DT.contra.x.otra,{clase:CLASSN.mando}),
    o:d=>{const c=ex();const O=DT.contra.o;if(d.cl==='mando')return [
      {t:O.mando[0].t,s:O.mando[0].s,f:()=>{S.career=Math.max(0,S.career-1);c.contra=0;S.pol.inf+=5;const cp=P_('compi');if(cp)cp.rel=Math.min(100,cp.rel+20);chapter('renuncia',O.mando[0].cap,O.mando[0].capx);c.exp.solid++;}},
      {t:O.mando[1].t,s:O.mando[1].s,f:()=>{S.ally=true;c.contra=25;office().org=Math.min(100,office().org+15);schedule(18+Math.random()*25,'topo',{});tell(O.mando[1].tell,'🕵️');}},
      {t:O.mando[2].t,s:O.mando[2].s,f:()=>{c.contra=0;pushI('liberal',60,'ascenso');pushI('socialdemocrata',30,'ascenso');remember(O.mando[2].rem);}}];
      if(d.cl==='patrona')return [
      {t:O.patrona[0].t,f:()=>{S.payMul=(S.payMul||1)*.85;c.contra=10;c.exp.solid++;tell(O.patrona[0].tell,'🤝');}},
      {t:O.patrona[1].t,ok:()=>isLeft(),f:()=>{startTrack('coop',true);c.contra=0;chapter('coopconv',O.patrona[1].cap,O.patrona[1].capx);}},
      {t:O.patrona[2].t,f:()=>{c.contra=0;pushI('liberal',70,'dinero');pushI('libertaria',30,'dinero');schedule(30+Math.random()*30,'sindican',{});}}];
      if(d.cl==='rentista')return [{t:O.rentista[0].t,f:()=>{S.rentInc=(S.rentInc||0)*.6;c.contra=0;tell(O.rentista[0].tell,'🏘️');}},{t:O.rentista[1].t,f:()=>{c.contra=0;pushI('liberal',60,'vivienda');}}];
      return [{t:O.otra[0].t,f:()=>{c.contra=0;pushI('socialdemocrata',40,'pobreza');}},{t:O.otra[1].t,f:()=>{c.contra=20;S.needs.diversion=Math.max(0,S.needs.diversion-20);}}];},
    auto:d=>{if(d.cl==='mando')return comp()>=3?0:isI('socialdemocrata')||comp()===1?2:1;if(d.cl==='patrona')return comp()>=3&&isLeft()?1:isLeft()?0:2;return 0;}},
  ascenso:{t:()=>DT.ascenso.t,x:()=>huecos(DT.ascenso.x,{puesto:(CAREER[S.career]||{}).t}),
    o:()=>{const O=DT.ascenso.o;return [{t:O[0].t,f:()=>{remember(O[0].rem);}},{t:O[1].t,s:O[1].s,f:()=>{S.career=Math.max(0,S.career-1);S.pol.inf+=4;office().org=Math.min(100,office().org+8);const cp=P_('compi');if(cp)cp.rel=Math.min(100,cp.rel+12);tell(O[1].tell,'☕');ex().exp.solid++;}}];},
    auto:()=>isLeft()&&comp()>=2?1:0},
  despedir:{t:()=>DT.despedir.t,x:()=>huecos(DT.despedir.x,{puesto:L((CAREER[S.career]||{}).t).toLowerCase()}),
    o:()=>{const O=DT.despedir.o;return [{t:O[0].t,s:O[0].s,f:()=>{S.rep=Math.min(100,(S.rep??70)+10);const cp=P_('compi');if(cp)cp.rel=Math.max(0,cp.rel-30);ex().contra+=isLeft()?25:5;pushI('liberal',25,'ascenso');schedule(12+Math.random()*10,'vacio',{});tell(O[0].tell,'📄');}},
      {t:O[1].t,s:O[1].s,f:()=>{S.rep=Math.max(0,(S.rep??70)-15);schedule(8+Math.random()*12,'represalia',{});tell(O[1].tell,'🙅');}},
      {t:O[2].t,s:O[2].s,f:()=>{const o=office();o.org=Math.min(100,o.org+20);o.griev=Math.min(100,(o.griev||0)+25);S.pol.inf+=4;schedule(15+Math.random()*20,'filtracion',{});ex().exp.solid++;tell(O[2].tell,'📣');}}];},
    auto:()=>isLeft()&&comp()>=2?2:isLeft()?1:0},
  piquete:{t:()=>DT.piquete.t,x:()=>huecos(DT.piquete.x,{sal:fmt(salary()),justa:S.money<salary()*3?DT.piquete.justa:''}),
    o:()=>{const O=DT.piquete.o;return [{t:O[0].t,f:()=>{if(S.strike)S.strike.join=true;ex().exp.solid++;remember(O[0].rem);}},{t:O[1].t,s:O[1].s,f:()=>{if(S.strike)S.strike.join=false;S.scab=S.day;schedule(10+Math.random()*10,'esquirol',{});pushI(isLeft()?'apolitica':'liberal',10,'huelga');}}];},
    auto:()=>Math.random()<ID().strike?0:1},
  prestamo:{t:()=>DT.prestamo.t,x:d=>{const p=P_(d.p);return huecos(DT.prestamo.x,{oferta:p?huecos(DT.prestamo.oferta,{p:p.n,m:fmt(d.m)}):''});},
    o:d=>{const p=P_(d.p);const O=DT.prestamo.o;return [{t:huecos(O[0].t,{p:p?p.n:DT.prestamo.amistad}),ok:()=>!!p,f:()=>{S.money+=d.m;bumpMoney&&bumpMoney();schedule(30,'devolver',{p:d.p,m:d.m});tell(huecos(O[0].tell,{p:p.n,m:fmt(d.m)}),'🤝');}},
      {t:huecos(O[1].t,{m:fmt(d.m)}),s:O[1].s,f:()=>{S.money+=d.m;bumpMoney&&bumpMoney();for(let i=1;i<=6;i++)schedule(i*7,'cuota',{m:Math.round(d.m*1.3/6)});tell(O[1].tell,'📲');}},
      {t:O[2].t,s:O[2].s,f:()=>{S.needs.diversion=Math.max(0,S.needs.diversion-25);ex().exp.stress++;S.cutBelt=S.day+14;}}];},
    auto:d=>P_(d.p)&&!T('desconfiada')&&!ex().cq.some(q=>q.k==='devolver')?0:S.money<-WP()*.5?1:2},
  militancia:{t:d=>{const p=P_(d.p);return huecos(DT.militancia.t,{p:p?p.n:''});},x:d=>{const p=P_(d.p);return p?huecos(DT.militancia.x,{p:p.n}):'';},
    o:d=>{const p=P_(d.p);const O=DT.militancia.o;if(!p)return [{t:DT.militancia.o_sin[0].t,f:()=>{}}];return [{t:O[0].t,s:O[0].s,f:()=>{S.pol.comp=1;p.wear=Math.max(0,p.wear-30);p.love=Math.min(100,p.love+8);schedule(40,'arrepentimiento',{});tell(huecos(O[0].tell,{p:p.n}),'📵');}},
      {t:O[1].t,s:O[1].s,f:()=>{p.wear=Math.min(100,(p.wear||0)+20);tell(huecos(O[1].tell,{p:p.n}),'✊');}},
      {t:O[2].t,s:O[2].s,f:()=>{const ch=p.ideo==='apolitica'||LEFT.includes(p.ideo)||(p.hid||[]).includes('conciencia')?.55:.12;if(Math.random()<ch){p.ideo=S.ideo;p.wear=Math.max(0,p.wear-35);chapter('convence_'+p.k,O[2].cap,huecos(O[2].capx,{p:p.n}));}else{p.wear=Math.min(100,p.wear+8);tell(huecos(O[2].tell_ko,{p:p.n}),'🙄');}}}];},
    auto:d=>comp()>=3?1:2}};
const DLG_CD={ascenso:40,prestamo:28,crisis:21,militancia:30,despedir:30,contra:20,ideo:14};
function askDilemma(id,data){const c=ex();if(c.dq.length>=3||c.dq.some(x=>x.id===id)||(c.dlg&&c.dlg.id===id))return;const cd=DLG_CD[id];if(cd&&c.cool&&c.cool[id]!=null&&S.day-c.cool[id]<cd)return;c.dq.push({id,data:data||{},d:S.day});}
function resolveDlg(i){const c=ex(),d=c.dlg;if(!d)return;c.cool=c.cool||{};c.cool[d.id]=S.day;const D=DLG[d.id];const opts=D.o(d.data);const o=opts[i];c.dlg=null;hideDlg();if(o&&(!o.ok||o.ok())){try{o.f();}catch(e){console.error(e);}remember(huecos(TXN.dilemas_motor.decidio,{t:o.t}));}
  try{save();}catch(e){}}
function dlgTick(){const c=ex();if(c.dlg||!c.dq.length)return;const d=c.dq.shift();const D=DLG[d.id];if(!D)return;
  if(c.dmode==='ana'){const opts=D.o(d.data);let i=D.auto(d.data);if(opts[i]&&opts[i].ok&&!opts[i].ok())i=opts.findIndex(o=>!o.ok||o.ok());const o=opts[i];if(o){try{o.f();}catch(e){console.error(e);}tell(huecos(TXN.dilemas_motor.ana_decide,{d:D.t(d.data),t:o.t.charAt(0).toLowerCase()+o.t.slice(1)}),'🧭');c.cool=c.cool||{};c.cool[d.id]=S.day;}return;}
  c.dlg=d;showDlg();}
const dlgBlocking=()=>!!(S&&S.cx&&S.cx.dlg&&S.cx.dmode!=='ana');
function showDlg(){const c=ex(),d=c.dlg;if(!d)return;const D=DLG[d.id];let el=document.getElementById('dlg');if(!el){el=document.createElement('div');el.id='dlg';document.body.appendChild(el);locEl(el);}
  const opts=D.o(d.data);
  el.innerHTML=`<div class="dlgc"><div class="dlgt">${D.t(d.data)}</div><div class="dlgx">${D.x(d.data)}</div>${opts.map((o,i)=>{const dis=o.ok&&!o.ok();return `<button class="dlgb"${dis?' disabled':''} data-i="${i}"><b>${o.t}</b>${o.s?`<small>${o.s}</small>`:''}</button>`;}).join('')}
  <div class="dlgf"><button class="mini" data-auto="1">${TXN.dilemas_motor.ui_que_decida_ana}</button><label><input type="checkbox" id="dlgalways"> ${TXN.dilemas_motor.ui_siempre}</label></div></div>`;
  el.style.display='flex';
  el.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>resolveDlg(+b.dataset.i));
  el.querySelector('[data-auto]').onclick=()=>{if(el.querySelector('#dlgalways').checked)c.dmode='ana';let i=D.auto(d.data);if(opts[i]&&opts[i].ok&&!opts[i].ok())i=opts.findIndex(o=>!o.ok||o.ok());toast(`🧭 ${opts[i].t}`);resolveDlg(i);};
  sfx&&sfx('level');}
function hideDlg(){const el=document.getElementById('dlg');if(el)el.style.display='none';}

