// =================== LA APP DEL BANCO, REHECHA: lo que hace falta en el juego, y distinta según el sistema ===================
const {banco3:TX_banco3}=DATA.textos_mods_ag;
// Pestañas: Inicio · Movimientos · Ahorro · Deudas. Banco Atlántico (privado), Banca Pública (consejos/comunas), Banco Estatal (socialismo de mercado).
{const _lr=loanRate;loanRate=function(){return (typeof bkMode==='function'&&bkMode()==='est')?.04:_lr();};}
const BKM=DATA.gobiernos.banco;
const TERM={3:.8,6:1,12:1.25};
function bkDep(v,m){const b=BP();if(b.dep)return toast(TX_banco3.dep_ya);v=Math.round(v);if(v<20)return toast(TX_banco3.dep_min);if(S.money<v)return toast(TX_banco.no_hay_tanto);bpDeposit(v,m);if(b.dep)b.dep.rate=+(depRate()*TERM[m]).toFixed(4);phRender();}
function bkBreak(){const b=BP();if(!b.dep)return;const M=BKM[bkMode()];const v=Math.round(b.dep.v*(1-M.brk));bkAdd('Ingreso',v);if(M.brk)tell(huecos(TX_banco3.dep_penaliza,{v:fmt(b.dep.v-v)}),'🏦');else toast(TX_banco3.dep_sacado);b.dep=null;phRender();}
function bkAvail(){return Math.max(0,Math.round(S.money-hrs(10)));}
function bkRender(){const U=TX_banco3.ui;const ph=document.getElementById('phone');if(!ph)return;const md=bkMode(),M=BKM[md],B=BKS(),b=BP(),n=CH().name;if(bkTab==='prod')bkTab='ahorro';
  const row=(a,v,cls)=>`<div class="bk3r"><span>${a}</span><b${cls?` class="${cls}"`:''}>${v}</b></div>`;
  const chips=(L)=>`<div class="bk3c">${L.map(([t,a,d])=>`<button data-bka="${a}"${d?' disabled':''}>${t}</button>`).join('')}</div>`;
  let h='';
  if(bkTab==='resumen'){const m=bkMonth();const wkIn=S.jobless?0:Math.round(salary()*payFactor()*TR().days.length);const wkOut=Math.round(weeklyRent()+(typeof utilEstimate==='function'?utilEstimate()/4.3:0));
    h+=`<div class="bk3bal ${S.money<0?'neg':''}"><small>${U.cuenta[md]}</small><b>${fmt(S.money)}</b><small>${S.money<0?(md==='priv'?U.rojo:U.negativo):U.disponible}</small></div>`;
    const tot=Math.round(B.hucha+(b.ahorro.v||0)+(b.dep?b.dep.v:0)+(b.fondos.v||0)+(b.cripto.v||0));const deb=bkDebts().reduce((a,d)=>a+(d[1]||0),0);
    h+=`<div class="bk3g"><div data-bkt="ahorro"><small>${U.ahorrado}</small><b>${fmt(tot)}</b></div><div data-bkt="deudas"><small>${U.debes}</small><b class="${deb>0?'neg':''}">${fmt(Math.round(deb))}</b></div></div>`;
    h+=`<div class="bk3s">${U.semana}</div>${row(U.entra,fmt(wkIn))}${row(U.vivienda,'−'+fmt(wkOut))}${row(U.queda,fmt(wkIn-wkOut),wkIn-wkOut<0?'neg':'pos')}`;
    h+=`<div class="bk3s">${U.mes}</div>${row(U.ingresos,'+'+fmt(m.in||0),'pos')}${row(U.gastos,'−'+fmt(Math.abs(m.out||0)))}`;
    const cats=Object.entries(m.cat||{}).filter(([k,v])=>v<0).sort((a,b)=>a[1]-b[1]).slice(0,5);for(const [k,v] of cats)h+=row(BK_CATN[k]||k,'−'+fmt(Math.abs(v)));
    if(md==='priv')h+=`<div class="bk3ad">${huecos(U.promo,{v:fmt(bpLoanMax()),t:(loanRate()*100).toFixed(0)})}</div><div class="bk3foot">${huecos(U.foot_priv,{m:20+(S.day*7%40)})}</div>`;
    else if(md==='pub')h+=`<div class="bk3foot">${U.foot_pub}</div>`;else h+=`<div class="bk3foot">${U.foot_est}</div>`;}
  else if(bkTab==='mov'){const L=B.log.slice(-100).reverse();let lastD=null;if(!L.length)h+=`<div class="bk3s">${U.sin_mov}</div>`;for(const [d,t,v,c] of L){if(d!==lastD){lastD=d;const dt=dateOf(d);h+=`<div class="bk3s">${d===S.day?U.hoy:d===S.day-1?U.ayer:huecos(U.fecha,{dm:dt.dm,mes:MONTHS[dt.m]})}</div>`;}h+=row(`${c||'Otros'}<small> ${phHM(t)}</small>`,(v>0?'+':'−')+fmt(Math.abs(v)),v>0?'pos':'');}}
  else if(bkTab==='ahorro'){const av=bkAvail();
    h+=`<div class="bk3card"><div class="bk3t">${U.hucha} <small>${U.hucha_sub}</small></div><b class="bk3v">${fmt(B.hucha)}</b>${chips([['+'+fmt(hrs(5)),'hu+5'],['+'+fmt(hrs(20)),'hu+20'],['−'+fmt(hrs(5)),'hu-5',B.hucha<=0],[U.sacar_todo,'hu-all',B.hucha<=0]])}</div>`;
    h+=`<div class="bk3card"><div class="bk3t">🏦 ${md==='priv'?U.ahorro_priv:U.ahorro} <small>${huecos(U.ahorro_sub,{r:(ahorroRate()*100).toFixed(2)})}${md==='priv'?U.ahorro_inflacion:''}</small></div><b class="bk3v">${fmt(Math.round(b.ahorro.v))}</b>${chips([['+'+fmt(hrs(10)),'ah+10'],['+'+fmt(hrs(40)),'ah+40'],['−'+fmt(hrs(10)),'ah-10',b.ahorro.v<=0],[U.sacar_todo,'ah-all',b.ahorro.v<=0]])}
      <div class="bk3r"><span>${U.auto_lunes}</span><span class="bk3auto"><button data-bka="au-">−</button><b>${fmt(b.auto||0)}</b><button data-bka="au+">+</button></span></div><small class="bk3n">${b.auto?huecos(U.auto_lleva,{v:fmt(Math.round(b.autoTot||0)),c:fmt(hrs(15))}):U.auto_elige}</small></div>`;
    h+=`<div class="bk3card"><div class="bk3t">🔒 ${M.dep} <small>${M.depSub}${M.tax?U.tax:''}</small></div>`;
    if(b.dep){const left=Math.max(0,b.dep.until-S.day);const gan=Math.round(b.dep.v*b.dep.rate*b.dep.months/12);h+=`<b class="bk3v">${fmt(b.dep.v)}</b>${row(U.interes,huecos(U.interes_dato,{r:(b.dep.rate*100).toFixed(2),m:b.dep.months}))}${row(U.vence,huecos(U.vence_dato,{d:left}))}${row(U.ganara,fmt(gan)+(M.tax?U.brutos:''))}${chips([[M.brk?huecos(U.sacar_ya_pen,{p:Math.round(M.brk*100)}):U.sacar_ya,'dep-brk']])}`;}
    else{const r=depRate();h+=`<div class="bk3n">${huecos(U.disponible_meter,{v:fmt(av),c:fmt(hrs(10))})}</div>`;for(const m of [3,6,12])h+=`<div class="bk3r"><span>${huecos(U.meses,{m,r:(r*TERM[m]*100).toFixed(2)})}</span><span class="bk3c">${[[.25,'¼'],[.5,'½'],[1,U.todo_chip]].map(([f,t])=>`<button data-bka="dep-${m}-${f}"${av*f<20?' disabled':''}>${t}</button>`).join('')}</span></div>`;}
    h+=`</div>`;
    if(md==='priv'){h+=`<div class="bk3card"><div class="bk3t">${U.fondo} <small>${U.fondo_sub}</small></div><b class="bk3v">${fmt(Math.round(b.fondos.v))}</b><small class="bk3n">${huecos(U.aportado,{v:fmt(Math.round(b.fondos.in))})}</small>${chips([['+'+fmt(hrs(10)),'fo+10'],['+'+fmt(hrs(40)),'fo+40'],[U.vender_todo,'fo-all',b.fondos.v<=0]])}</div>
      <div class="bk3card"><div class="bk3t">${U.cripto} <small>${U.cripto_sub}</small></div><b class="bk3v">${fmt(Math.round(b.cripto.v))}</b>${chips([['+'+fmt(hrs(10)),'cr+10'],[U.vender_todo,'cr-all',b.cripto.v<=0]])}</div>`;}
    else if(md==='pub')h+=`<div class="bk3n" style="padding:4px 14px 10px">${U.pub_nota}</div>`;}
  else{const L=payList();h+=`<div class="bk3s">${U.debes_tit}</div>`;if(!L.length&&!S.mort)h+=`<div class="bk3r"><span>${U.sin_deudas}</span><b>✅</b></div>`;
    L.forEach((d,i)=>{h+=`<div class="bk3card"><div class="bk3t">${d.e} ${d.n} <small>${d.id==='dv'||d.id==='sol'?U.sin_int:d.id==='loan'?huecos(U.cuota,{v:fmt(d.b.loan.pay)}):d.id==='rent'?U.rent_aviso:U.camello}</small></div><b class="bk3v neg">${fmt(Math.round(d.v))}</b><div class="bk3c">${[[U.todo_chip,'all'],[U.mitad,'half'],[U.cincuenta,'50']].map(([t,a])=>`<button data-pay="${i}" data-amt="${a}">${t}</button>`).join('')}</div></div>`;});
    if(S.mort)h+=`<div class="bk3card"><div class="bk3t">${U.hipoteca} <small>${huecos(U.hipoteca_dato,{pay:fmt(S.mort.pay),rate:(S.mort.rate*100).toFixed(1)})}</small></div><b class="bk3v">${fmt(Math.round(S.mort.left))}</b></div>`;
    if(!b.loan){const mx=bpLoanMax();h+=`<div class="bk3card"><div class="bk3t">💳 ${M.loan} <small>${huecos(U.prestamo_sub,{sub:M.loanSub,t:(loanRate()*100).toFixed(1).replace('.0',''),v:fmt(mx)})}</small></div>${mx?`<div class="bk3c">${[[.25,12],[.5,12],[1,24]].map(([f,mo])=>`<button data-bka="ln-${f}-${mo}">${huecos(U.prestamo_chip,{v:fmt(Math.round(mx*f)),m:mo})}</button>`).join('')}</div>`:`<small class="bk3n">${U.sin_nomina}</small>`}</div>`;}}
  // pintar y conectar
  const html=bkShell(h);const T=document.createElement('div');T.innerHTML=html;const nb=T.firstElementChild;ph.querySelector('.phf')?ph.querySelector('.phf').replaceWith(nb):(ph.innerHTML=html);
  ph.querySelectorAll('[data-bkt]').forEach(x=>x.onclick=()=>{bkTab=x.dataset.bkt;if(bkTab==='prod')bkTab='ahorro';bkForce=true;phRender();const nb=ph.querySelector('.bkbody');if(nb)nb.scrollTop=0;});
  ph.querySelectorAll('[data-ph]').forEach(x=>x.onclick=()=>{phApp=x.dataset.ph==='home'?null:x.dataset.ph;phRender();});
  ph.querySelectorAll('[data-pay]').forEach(x=>x.onclick=()=>{const d=payList()[+x.dataset.pay];if(!d)return;const a=x.dataset.amt;payDebt(d,a==='all'?d.v:a==='half'?Math.ceil(d.v/2):50);bkForce=true;phRender();});
  ph.querySelectorAll('[data-bka]').forEach(x=>x.onclick=()=>{const a=x.dataset.bka;const P=a.split(/(?<=[a-z])(?=[+-])|-/);
    if(a.startsWith('hu')){const k=a.slice(2);bkHucha(k==='-all'?-B.hucha:k==='+5'?hrs(5):k==='+20'?hrs(20):-hrs(5));}
    else if(a.startsWith('ah')){const k=a.slice(2);bpMove('ahorro',k==='-all'?-b.ahorro.v:k==='+10'?hrs(10):k==='+40'?hrs(40):-hrs(10));}
    else if(a==='au-'||a==='au+'){b.auto=Math.max(0,(b.auto||0)+(a==='au+'?10:-10));}
    else if(a.startsWith('dep-')){if(a==='dep-brk')bkBreak();else{const [,m,f]=a.split('-');bkDep(bkAvail()*(+f),+m);}}
    else if(a.startsWith('fo')){const k=a.slice(2);bpMove('fondos',k==='-all'?-b.fondos.v:k==='+10'?hrs(10):hrs(40));}
    else if(a.startsWith('cr')){const k=a.slice(2);bpMove('cripto',k==='-all'?-b.cripto.v:hrs(10));}
    else if(a.startsWith('ln-')){const [,f,mo]=a.split('-');bpLoan(Math.round(bpLoanMax()*(+f)),+mo);}
    bkForce=true;phRender();});}
let bkSig='',bkForce=false;
function bkSigNow(){const b=BP(),B=BKS();return [bkTab,bkMode(),Math.round(S.money),B.hucha,Math.round(b.ahorro.v),b.auto||0,b.dep?b.dep.v+'/'+b.dep.until:'',Math.round(b.fondos.v),Math.round(b.cripto.v),b.loan?b.loan.left:'',payList().map(d=>Math.round(d.v)).join(','),B.log.length,S.day].join('|');}
{const _pr=phRender;phRender=function(){if(phApp==='bank'&&S){try{const ph=document.getElementById('phone');const sg=bkSigNow();if(!bkForce&&sg===bkSig&&ph&&ph.querySelector('.bk3card,.bk3bal,.bk3r'))return;bkSig=sg;bkForce=false;
  const old=ph&&ph.querySelector('.bkbody');const st=old?old.scrollTop:0;bkRender();const nb=ph&&ph.querySelector('.bkbody');if(nb&&st)nb.scrollTop=st;return;}catch(e){console.error(e);}}bkSig='';return _pr.apply(this,arguments);};}
