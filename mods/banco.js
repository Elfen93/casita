// =================== EL BANCO: movimientos de verdad, categorías, deudas, hucha y comisiones ===================
const {banco:TX_banco}=DATA.textos_mods_ag;
const BKS=()=>{if(!S.bk)S.bk={log:[],hucha:0,auto:0,fees:0,ctx:null};S.bk.log=S.bk.log||[];return S.bk;};
let bkCtx=null;function bkAdd(label,v){const p=bkCtx;bkCtx=label;S.money+=v;bkCtx=p;}const withCtx=(fn,label)=>function(){const prev=bkCtx;bkCtx=typeof label==='function'?label.apply(this,arguments):label;try{return fn.apply(this,arguments);}finally{bkCtx=prev;}};
const BK_CAT={'Nómina':'ingresos','Ingreso':'ingresos','Premio':'ingresos','Ventas':'ingresos','Préstamo':'ingresos','Ayuda':'ingresos','Alquiler':'casa','Hipoteca':'casa','Luz, agua y gas':'casa','Arreglos':'casa','Muebles y obras':'casa','Compra':'comida','Comida':'comida','Menú':'comida','Salida':'ocio','Libros':'ocio','Gimnasio':'cuerpo','Farmacia':'cuerpo','Médico':'cuerpo','Terapia':'cuerpo','Críos':'familia','Cuota':'deudas','Comisión':'deudas','Multa':'deudas','Hacienda':'deudas','Hucha':'ahorro','Otros':'otros'};
let BANK_N=TX_banco.bancos.priv;const BANK_IBAN=()=>{const h=Math.floor(Math.abs(hash((CH().name||'x').length*7+13))*9000)%9000+1000;return 'ES21 0182 4411 '+String(h).padStart(4,'0')+' **** 2714';};
const BK_CATN=TX_banco.categorias;
// el saldo como propiedad con memoria: cada cambio queda apuntado
function bkInstall(){if(!S||typeof S!=='object')return;const d=Object.getOwnPropertyDescriptor(S,'money');if(d&&d.get)return;let m=S.money||0;
  Object.defineProperty(S,'money',{enumerable:true,configurable:true,get(){return m;},set(v){if(typeof v!=='number'||!isFinite(v))v=0;const dlt=v-m;m=v;try{if(Math.abs(dlt)>=1){const B=BKS();const c=bkCtx||(dlt>0?'Ingreso':'Otros');const L=B.log;const last=L[L.length-1];if(last&&last[0]===S.day&&Math.abs(S.t-last[1])<3&&last[2]===-Math.round(dlt)){L.pop();}else if(last&&last[0]===S.day&&last[3]===c&&Math.abs(S.t-last[1])<30&&!bkCtx){last[2]+=Math.round(dlt);}else{L.push([S.day,Math.round(S.t),Math.round(dlt),c]);if(L.length>400)L.splice(0,L.length-400);}}}catch(e){}}});}
{const _up=update;update=function(gm){try{bkInstall();}catch(e){}return _up.apply(this,arguments);};}
// contextos conocidos
try{payRent=withCtx(payRent,()=>S.owned?'Hipoteca':'Alquiler');}catch(e){}
try{payMortgage=withCtx(payMortgage,'Hipoteca');}catch(e){}
try{payUtilities=withCtx(payUtilities,'Luz, agua y gas');}catch(e){}
try{finishWork=withCtx(finishWork,()=>S.sim.outingActive?('Salida'):'Nómina');}catch(e){}
try{outBack=withCtx(outBack,k=>k==='compra'?'Compra':k==='libreria'||k==='mercadillo'?'Libros':k==='terapia'?'Terapia':k==='gimnasio'?'Gimnasio':k==='pillar'||k==='beber'?'Salida':'Salida');}catch(e){}
try{hacerCompra=withCtx(hacerCompra,'Compra');}catch(e){}
try{startUse=withCtx(startUse,'Comida');}catch(e){}
try{execStep=withCtx(execStep,(job,j)=>{const st=job&&job.steps[j];return st&&(st.k==='fix'||st.k==='replace')?'Arreglos':'Muebles y obras';});}catch(e){}
try{hireFor=withCtx(hireFor,'Arreglos');}catch(e){}
try{hpVisit=withCtx(hpVisit,'Médico');}catch(e){}
try{hpAsk=withCtx(hpAsk,'Médico');}catch(e){}
try{buyHouse=withCtx(buyHouse,'Hipoteca');}catch(e){}
try{amortize=withCtx(amortize,'Hipoteca');}catch(e){}
try{arrestAna=withCtx(arrestAna,'Multa');}catch(e){}
try{wrSubmit=withCtx(wrSubmit,'Libros');}catch(e){}
try{artSell=withCtx(artSell,'Ventas');}catch(e){}
try{eduStart=withCtx(eduStart,'Otros');}catch(e){}
// contextos en los tramos diarios: lo que pasa en dailyEvents ya tiene nombre en el diario, aquí va por tipo
{const _dl=dailyEvents;dailyEvents=function(){const B=BKS();const prev=bkCtx;bkCtx='Otros';try{return _dl.apply(this,arguments);}finally{bkCtx=prev;}};}
// comisiones por descubierto, cada lunes
{const _pr=payRent;payRent=function(){const r=_pr.apply(this,arguments);try{if(S.money<0&&dateOf(S.day).wd===0&&!(typeof govBank==='function'&&govBank())){const f=Math.round(Math.min(hrs(4),hrs(1)+(-S.money)*.02)*(S.cy&&S.cy.feeMul!=null?S.cy.feeMul:1));const prev=bkCtx;bkCtx='Comisión';S.money-=f;bkCtx=prev;BKS().fees+=f;if(throttled('fee',6e5))toast(huecos(TX_banco.comision_toast,{v:fmt(f)}));if(BKS().fees>hrs(20)&&!S.story.chap.comis)chapter('comis',TX_banco.comis_titulo,huecos(TX_banco.comis_texto,{v:fmt(BKS().fees)}));}}catch(e){}return r;};}
// hucha: dinero que la IA no toca
{const _rm=reserveMoney;reserveMoney=function(){return _rm.apply(this,arguments);};}
function bkHucha(v){const B=BKS();v=Math.round(v);if(v>0){if(S.money<v){toast(TX_banco.no_hay_tanto);return;}const p=bkCtx;bkCtx='Hucha';S.money-=v;bkCtx=p;B.hucha+=v;toast(huecos(TX_banco.hucha_mete,{v:fmt(v)}));}else if(v<0){v=Math.min(-v,B.hucha);const p=bkCtx;bkCtx='Hucha';S.money+=v;bkCtx=p;B.hucha-=v;toast(huecos(TX_banco.hucha_saca,{v:fmt(v)}));}}
{const _pr2=payRent;payRent=function(){const r=_pr2.apply(this,arguments);try{const B=BKS();if(B.auto>0&&S.money>B.auto+reserveMoney()*.5){bkHucha(B.auto);}}catch(e){}return r;};}
const BK_LABEL=(c,v)=>{const emp=S.office?S.office.n.toUpperCase():TX_banco.mov_empresa;const k=c==='Hucha'&&!(v>0)?'Hucha_sale':c==='Otros'&&!(v>0)?'Otros_sale':c;const e=Object.prototype.hasOwnProperty.call(TX_banco.mov,k)?TX_banco.mov[k]:null;
  return e?[e[0],huecos(e[1],{emp,arr:S.home&&S.home.type==='padres'?TX_banco.mov_aportacion:TX_banco.mov_arrendador,banco:BANK_N.toUpperCase()})]:['💳',c.toUpperCase()];};
// ---- resumen ----
function bkMonth(){const B=BKS();const from=S.day-30;const cat={};let inc=0,out=0;for(const [d,t,v,c] of B.log){if(d<from)continue;const k=BK_CAT[c]||'otros';cat[k]=(cat[k]||0)+v;if(v>0)inc+=v;else out-=v;}return {cat,inc,out};}
function bkDebts(){const L=[];if(S.mort)L.push([TX_banco.deu_hipoteca,S.mort.left,huecos(TX_banco.deu_hipoteca_dato,{pay:fmt(S.mort.pay),rate:(S.mort.rate*100).toFixed(1)})]);const cq=(ex().cq||[]).filter(q=>q.k==='cuota');if(cq.length)L.push([TX_banco.deu_micro,cq.reduce((a,q)=>a+(q.data.m||0),0),huecos(TX_banco.deu_micro_dato,{n:cq.length})]);const dv=(ex().cq||[]).filter(q=>q.k==='devolver');for(const q of dv){const p=P_(q.data.p);L.push([huecos(TX_banco.deu_amigo,{quien:p?p.n:TX_banco.deu_amigo_fallback}),q.data.m,huecos(TX_banco.deu_sin_int_dia,{d:q.d})]);}
  if(S.sol&&S.sol.owed)L.push([huecos(TX_banco.deu_alguien,{quien:S.sol.loanWho||TX_banco.deu_alguien_fallback}),S.sol.owed,TX_banco.deu_sin_int]);if(S.mt&&S.mt.debt)L.push([huecos(TX_banco.deu_camello,{quien:S.mt.deal?S.mt.deal.n:TX_banco.deu_camello_fallback}),S.mt.debt,TX_banco.deu_camello_dato]);if(S.mg&&S.mg.debt)L.push([TX_banco.deu_alquiler,S.mg.debt,huecos(TX_banco.deu_alquiler_dato,{w:Math.round(S.mg.wk)})]);if(S.mg&&S.mg.bankDebt)L.push([TX_banco.deu_casa,S.mg.bankDebt,TX_banco.deu_casa_dato]);if(S.money<0)L.push([TX_banco.deu_desc,-S.money,TX_banco.deu_desc_dato]);return L;}
// ---- la app ----
let bkTab='resumen';
function bkMode(){const w=W_();if(typeof govBank==='function'&&govBank())return 'pub';if(w.gov==='mercado'&&!w.era)return 'est';return 'priv';}
function bkShell(inner){BANK_N=TX_banco.bancos[bkMode()];if(bkMode()==='pub'){for(const [x,y] of TX_banco.pub_cambios)inner=inner.split(x).join(y);inner=inner.replace(/Atención al cliente: espera estimada [^·<]*· Oficina más cercana: [^<]*/,TX_banco.pub_oficina);inner=inner.replace(/EURÍBOR [\d.,]+ %/,TX_banco.pub_tipo);}
  else if(bkMode()==='est'){for(const [x,y] of TX_banco.est_cambios)inner=inner.split(x).join(y);}
const back=`<button class="phback" data-ph="home">‹</button>`;const n=CH().name;const tabs=TX_banco.tabs;
  const bat=Math.max(5,100-((S.t/1440)*60|0));return `<div class="phf"><div class="phs"><span>${phHM(S.t)}</span><span class="phcam"></span><span>📶 ${bat}%</span></div><div class="phb"><div class="phscreen bk bk-${bkMode()}"><div class="bkhead">${back}<div class="bklogo"><span>${TX_banco.logo[bkMode()]}</span></div><div class="bkname"><b>${BANK_N}</b><small>${huecos(TX_banco.hola,{nombre:n.split(' ')[0]})}</small></div><button class="bkbell">🔔</button></div><div class="phlist bkbody">${bkMode()!=="priv"?`<div class="bkpubnote">${bkMode()==="pub"?TX_banco.nota_pub:TX_banco.nota_est}</div>`:""}${inner}</div><div class="bknav">${tabs.map(([k,e,t])=>`<button class="${bkTab===k?'on':''}" data-bkt="${k}"><span>${e}</span>${t}</button>`).join('')}</div><div class="phhome" data-ph="home"></div></div></div></div>`;}
{const _ren=phRender;phRender=function(){if(phApp!=='bank'||bkTab==='prod')return _ren.apply(this,arguments);try{const ph=document.getElementById('phone');if(!ph)return _ren.apply(this,arguments);const B=BKS();const M=bkMonth();const n=CH().name;
    const sal=S.jobless?0:salary()*TR().days.length;const week=sal-housingWeekly()-(typeof utilEstimate==='function'?utilEstimate():0);const days=S.money>0&&M.out>0?Math.round(S.money/(M.out/30)):null;
    const U=TX_banco.ui;let h='';
    if(bkTab==='resumen'){const bp=typeof BP==='function'?BP():null;const inv=bp?Math.round(bp.ahorro.v+(bp.dep?bp.dep.v:0)+bp.fondos.v+bp.cripto.v):0;
      h+=`<div class="bkcard"><small>${huecos(U.cuenta,{iban:BANK_IBAN()})}</small><b class="${S.money<0?'neg':''}">${fmt(Math.round(S.money))}</b><div class="bkrow"><span>${S.money<0?U.desc:U.saldo}</span>${inv?`<span>${huecos(U.ahorro_inv,{v:fmt(inv)})}</span>`:''}</div></div>`;
      h+=`<div class="bkacts"><button data-bkt="prod"><span>📈</span>${U.invertir}</button><button data-bkt="deudas"><span>🐷</span>${U.hucha}</button><button data-bkt="mov"><span>📄</span>${U.extracto}</button><button data-bkhelp="1"><span>💬</span>${U.ayuda}</button></div>`;
      if(!S.jobless&&!(bp&&bp.loan))h+=`<div class="bkpromo"><b>${huecos(U.promo,{v:fmt(typeof bpLoanMax==='function'?bpLoanMax():0)})}</b><small>${huecos(U.promo_txt,{t:(typeof loanRate==='function'?loanRate()*100:8).toFixed(0)})}</small><button data-bkt="prod">${U.ver}</button></div>`;
      else if(S.money<0)h+=`<div class="bkpromo warn"><b>${U.warn}</b><small>${huecos(U.warn_txt,{v:fmt(-Math.round(S.money))})}</small></div>`;
      h+=`<div class="bksec">${U.mes}</div><div class="bkkv"><span>${U.ingresos}</span><b class="pos">+${fmt(M.inc)}</b></div><div class="bkkv"><span>${U.gastos}</span><b>−${fmt(M.out)}</b></div><div class="bkkv"><span>${U.balance}</span><b class="${M.inc-M.out>=0?'pos':'neg'}">${M.inc-M.out>=0?'+':''}${fmt(M.inc-M.out)}</b></div>${days!=null?`<div class="bkkv"><span>${U.aguantarias}</span><b>${days>90?U.mas_3m:huecos(U.dias,{d:days})}</b></div>`:''}`;
      h+=`<div class="bksec">${U.gastos_cat}</div>`;const cats=Object.entries(M.cat).filter(([k,v])=>v<0).sort((a,b)=>a[1]-b[1]);const tot=cats.reduce((a,[,v])=>a-v,0)||1;const colr={casa:'#1f5fa8',comida:'#2e8b57',ocio:'#e9a23b',cuerpo:'#c0392b',familia:'#9b5de5',deudas:'#6b6f78',ahorro:'#f15bb5',otros:'#b0a8bb'};
      h+=`<div class="bkbar">${cats.map(([k,v])=>`<i style="width:${Math.max(2,Math.round(-v/tot*100))}%;background:${colr[k]||'#888'}"></i>`).join('')}</div><div class="bklegend">${cats.map(([k,v])=>`<span><i style="background:${colr[k]||'#888'}"></i>${BK_CATN[k]||k} ${Math.round(-v/tot*100)} %</span>`).join('')}</div>`;
      h+=`<div class="bksec">${U.prevision}</div><div class="bkkv"><span>${U.nomina}</span><b>${sal?fmt(sal):'—'}</b></div><div class="bkkv"><span>${U.vivienda}</span><b>−${fmt(housingWeekly()+(typeof utilEstimate==='function'?Math.round(utilEstimate()):0))}</b></div><div class="bkkv"><span>${U.queda}</span><b class="${week>=0?'pos':'neg'}">${fmt(week)}</b></div>`;
      h+=`<div class="bkfoot">${U.foot}</div>`;}
    else if(bkTab==='mov'){const L=B.log.slice(-80).reverse();let lastD=null;if(!L.length)h+=`<div class="bksec">${U.sin_mov}</div>`;
      for(const [d,t,v,c] of L){if(d!==lastD){const D=dateOf(d);h+=`<div class="bksec">${d===S.day?U.hoy:d===S.day-1?U.ayer:huecos(U.fecha,{wd:WDL[D.wd],dm:D.dm,mes:MONTHS[D.m].toLowerCase()})}</div>`;lastD=d;}const [ic,lab]=BK_LABEL(c,v);h+=`<div class="bkmov"><span class="bkic">${ic}</span><span class="bkl"><b>${lab}</b><small>${c} · ${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}</small></span><b class="${v<0?'':'pos'}">${v>=0?'+':'−'}${fmt(Math.abs(v))}</b></div>`;}}
    else{const D=bkDebts();h+=`<div class="bksec">${U.deudas_tit}</div>`;if(!D.length)h+=`<div class="bkkv"><span>${U.sin_deudas}</span><b>✅</b></div>`;for(const [nm,v,sb] of D)h+=`<div class="bkmov"><span class="bkic">${nm.slice(0,2)}</span><span class="bkl"><b>${nm.slice(3)}</b><small>${sb}</small></span><b>${fmt(Math.round(v))}</b></div>`;
      if(B.fees)h+=`<div class="bkkv"><span>${U.comisiones}</span><b>${fmt(B.fees)}</b></div>`;
      h+=`<div class="bksec">${U.hucha_tit}</div><div class="bkcard small"><small>${U.apartado}</small><b>${fmt(B.hucha)}</b></div><div class="bkacts2"><button class="mini" data-hu="50">+${fmt(hrs(5))}</button><button class="mini" data-hu="200">+${fmt(hrs(20))}</button><button class="mini" data-hu="-50">−${fmt(hrs(5))}</button><button class="mini" data-hu="all">${U.sacar_todo}</button></div><div class="bkkv"><span>${U.apartar}</span><b><select data-huauto>${[0,2,5,10,20].map(v=>`<option value="${v}" ${B.auto===hrs(v)?'selected':''}>${v?fmt(hrs(v)):U.nada}</option>`).join('')}</select></b></div><div class="bkfoot">${U.remun}</div>`;}
    ph.innerHTML=bkShell(h);
    ph.querySelectorAll('[data-ph]').forEach(b=>b.onclick=()=>{phApp=null;phThread=null;_ren();});
    ph.querySelectorAll('[data-bkt]').forEach(b=>b.onclick=()=>{bkTab=b.dataset.bkt;phRender();});
    ph.querySelectorAll('[data-hu]').forEach(b=>b.onclick=()=>{const k=b.dataset.hu;if(k==='all')bkHucha(-BKS().hucha);else bkHucha(k==='50'?hrs(5):k==='200'?hrs(20):-hrs(5));phRender();});
    const sa=ph.querySelector('[data-huauto]');if(sa)sa.onchange=()=>{BKS().auto=hrs(+sa.value);};
    const hb=ph.querySelector('[data-bkhelp]');if(hb)hb.onclick=()=>{toast(TX_banco.ui.ayuda_toast);};
  }catch(e){console.error(e);return _ren.apply(this,arguments);}};}
