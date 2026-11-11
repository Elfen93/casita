// =================== LA APP DEL BANCO, REHECHA: lo que hace falta en el juego, y distinta según el sistema ===================
// Pestañas: Inicio · Movimientos · Ahorro · Deudas. Banco Atlántico (privado), Banca Pública (consejos/comunas), Banco Estatal (socialismo de mercado).
{const _lr=loanRate;loanRate=function(){return (typeof bkMode==='function'&&bkMode()==='est')?.04:_lr();};}
const BKM={priv:{dep:'Depósito a plazo',depSub:'interés fijo · si lo rompes antes, 2 % de penalización',loan:'Préstamo personal',loanSub:'para lo que quieras… a su precio',brk:.02,tax:true},
  pub:{dep:'Depósito público',depSub:'interés fijo · se puede sacar antes sin penalización',loan:'Préstamo público',loanSub:'para vivienda, estudios o herramientas · sin letra pequeña',brk:0,tax:false},
  est:{dep:'Bonos del Estado',depSub:'financian trenes y fábricas · sacar antes cuesta un 1 %',loan:'Crédito del Estado',loanSub:'para quien produce: estudios, taller, vivienda',brk:.01,tax:true}};
const TERM={3:.8,6:1,12:1.25};
function bkDep(v,m){const b=BP();if(b.dep)return toast('Ya hay uno abierto');v=Math.round(v);if(v<20)return toast('Mínimo 20 €');if(S.money<v)return toast('No hay tanto en la cuenta');bpDeposit(v,m);if(b.dep)b.dep.rate=+(depRate()*TERM[m]).toFixed(4);phRender();}
function bkBreak(){const b=BP();if(!b.dep)return;const M=BKM[bkMode()];const v=Math.round(b.dep.v*(1-M.brk));bkAdd('Ingreso',v);if(M.brk)tell(`${CH().name} ha sacado el dinero antes de tiempo: ${fmt(b.dep.v-v)} de penalización.`,'🏦');else toast('Sacado del depósito, sin penalización');b.dep=null;phRender();}
function bkAvail(){return Math.max(0,Math.round(S.money-hrs(10)));}
function bkRender(){const ph=document.getElementById('phone');if(!ph)return;const md=bkMode(),M=BKM[md],B=BKS(),b=BP(),n=CH().name;if(bkTab==='prod')bkTab='ahorro';
  const row=(a,v,cls)=>`<div class="bk3r"><span>${a}</span><b${cls?` class="${cls}"`:''}>${v}</b></div>`;
  const chips=(L)=>`<div class="bk3c">${L.map(([t,a,d])=>`<button data-bka="${a}"${d?' disabled':''}>${t}</button>`).join('')}</div>`;
  let h='';
  if(bkTab==='resumen'){const m=bkMonth();const wkIn=S.jobless?0:Math.round(salary()*payFactor()*TR().days.length);const wkOut=Math.round(weeklyRent()+(typeof utilEstimate==='function'?utilEstimate()/4.3:0));
    h+=`<div class="bk3bal ${S.money<0?'neg':''}"><small>${md==='priv'?'Cuenta Online':md==='pub'?'Cuenta pública':'Cuenta del Estado'}</small><b>${fmt(S.money)}</b><small>${S.money<0?(md==='priv'?'⚠️ En descubierto: comisión el lunes':'En negativo · sin comisión'):'Disponible'}</small></div>`;
    const tot=Math.round(B.hucha+(b.ahorro.v||0)+(b.dep?b.dep.v:0)+(b.fondos.v||0)+(b.cripto.v||0));const deb=bkDebts().reduce((a,d)=>a+(d[1]||0),0);
    h+=`<div class="bk3g"><div data-bkt="ahorro"><small>Ahorrado</small><b>${fmt(tot)}</b></div><div data-bkt="deudas"><small>Debes</small><b class="${deb>0?'neg':''}">${fmt(Math.round(deb))}</b></div></div>`;
    h+=`<div class="bk3s">Esta semana</div>${row('💼 Entra (nómina)',fmt(wkIn))}${row('🏠 Vivienda y facturas','−'+fmt(wkOut))}${row('Queda para vivir',fmt(wkIn-wkOut),wkIn-wkOut<0?'neg':'pos')}`;
    h+=`<div class="bk3s">Este mes</div>${row('Ingresos','+'+fmt(m.in||0),'pos')}${row('Gastos','−'+fmt(Math.abs(m.out||0)))}`;
    const cats=Object.entries(m.cat||{}).filter(([k,v])=>v<0).sort((a,b)=>a[1]-b[1]).slice(0,5);for(const [k,v] of cats)h+=row(BK_CATN[k]||k,'−'+fmt(Math.abs(v)));
    if(md==='priv')h+=`<div class="bk3ad">💳 <b>Préstamo preconcedido: ${fmt(bpLoanMax())}</b><small>«Sin papeleo». TAE ${(loanRate()*100).toFixed(0)} %. El banco gana cuando tú pagas.</small></div><div class="bk3foot">Atención al cliente: espera estimada ${20+(S.day*7%40)} min · Oficina más cercana: cerrada</div>`;
    else if(md==='pub')h+=`<div class="bk3foot">Oficina del barrio: de 9 a 19, sin cita. Las cuentas del banco son públicas y se votan.</div>`;else h+=`<div class="bk3foot">Banco Estatal de Desarrollo · el crédito va a fábricas y vivienda.</div>`;}
  else if(bkTab==='mov'){const L=B.log.slice(-100).reverse();let lastD=null;if(!L.length)h+=`<div class="bk3s">Sin movimientos</div>`;for(const [d,t,v,c] of L){if(d!==lastD){lastD=d;const dt=dateOf(d);h+=`<div class="bk3s">${d===S.day?'Hoy':d===S.day-1?'Ayer':dt.dm+' de '+MONTHS[dt.m]}</div>`;}h+=row(`${c||'Otros'}<small> ${phHM(t)}</small>`,(v>0?'+':'−')+fmt(Math.abs(v)),v>0?'pos':'');}}
  else if(bkTab==='ahorro'){const av=bkAvail();
    h+=`<div class="bk3card"><div class="bk3t">🐷 Hucha <small>apartado que no se gasta sin querer · 0 %</small></div><b class="bk3v">${fmt(B.hucha)}</b>${chips([['+'+fmt(hrs(5)),'hu+5'],['+'+fmt(hrs(20)),'hu+20'],['−'+fmt(hrs(5)),'hu-5',B.hucha<=0],['Sacar todo','hu-all',B.hucha<=0]])}</div>`;
    h+=`<div class="bk3card"><div class="bk3t">🏦 ${md==='priv'?'Cuenta de ahorro «remunerada»':'Cuenta de ahorro'} <small>${(ahorroRate()*100).toFixed(2)} % anual · se saca cuando quieras${md==='priv'?' · pierde contra la inflación':''}</small></div><b class="bk3v">${fmt(Math.round(b.ahorro.v))}</b>${chips([['+'+fmt(hrs(10)),'ah+10'],['+'+fmt(hrs(40)),'ah+40'],['−'+fmt(hrs(10)),'ah-10',b.ahorro.v<=0],['Sacar todo','ah-all',b.ahorro.v<=0]])}
      <div class="bk3r"><span>🔁 Cada lunes, automático</span><span class="bk3auto"><button data-bka="au-">−</button><b>${fmt(b.auto||0)}</b><button data-bka="au+">+</button></span></div><small class="bk3n">${b.auto?`Llevas ${fmt(Math.round(b.autoTot||0))} apartados así. Solo si quedan ${fmt(hrs(15))} en la cuenta.`:'Elige cuánto apartar cada semana sin pensarlo.'}</small></div>`;
    h+=`<div class="bk3card"><div class="bk3t">🔒 ${M.dep} <small>${M.depSub}${M.tax?' · 19 % a Hacienda de lo ganado':''}</small></div>`;
    if(b.dep){const left=Math.max(0,b.dep.until-S.day);const gan=Math.round(b.dep.v*b.dep.rate*b.dep.months/12);h+=`<b class="bk3v">${fmt(b.dep.v)}</b>${row('Interés',(b.dep.rate*100).toFixed(2)+' % · '+b.dep.months+' meses')}${row('Vence en',left+' días')}${row('Ganará',fmt(gan)+(M.tax?' brutos':''))}${chips([[M.brk?`Sacar ya (−${Math.round(M.brk*100)} %)`:'Sacar ya','dep-brk']])}`;}
    else{const r=depRate();h+=`<div class="bk3n">Disponible para meter: ${fmt(av)} (se deja un colchón de ${fmt(hrs(10))}).</div>`;for(const m of [3,6,12])h+=`<div class="bk3r"><span>${m} meses · <b>${(r*TERM[m]*100).toFixed(2)} %</b></span><span class="bk3c">${[[.25,'¼'],[.5,'½'],[1,'Todo']].map(([f,t])=>`<button data-bka="dep-${m}-${f}"${av*f<20?' disabled':''}>${t}</button>`).join('')}</span></div>`;}
    h+=`</div>`;
    if(md==='priv'){h+=`<div class="bk3card"><div class="bk3t">📈 Fondo indexado <small>sube a largo plazo, cae en las crisis · 0,5 % de comisión</small></div><b class="bk3v">${fmt(Math.round(b.fondos.v))}</b><small class="bk3n">Aportado ${fmt(Math.round(b.fondos.in))}</small>${chips([['+'+fmt(hrs(10)),'fo+10'],['+'+fmt(hrs(40)),'fo+40'],['Vender todo','fo-all',b.fondos.v<=0]])}</div>
      <div class="bk3card"><div class="bk3t">🪙 Cripto <small>un casino con gráfico · 1,5 % por entrar y por salir</small></div><b class="bk3v">${fmt(Math.round(b.cripto.v))}</b>${chips([['+'+fmt(hrs(10)),'cr+10'],['Vender todo','cr-all',b.cripto.v<=0]])}</div>`;}
    else if(md==='pub')h+=`<div class="bk3n" style="padding:4px 14px 10px">Sin fondos ni cripto: lo que se ahorra aquí financia vivienda, transporte y comedores.</div>`;}
  else{const L=payList();h+=`<div class="bk3s">Lo que debes</div>`;if(!L.length&&!S.mort)h+=`<div class="bk3r"><span>Sin deudas</span><b>✅</b></div>`;
    L.forEach((d,i)=>{h+=`<div class="bk3card"><div class="bk3t">${d.e} ${d.n} <small>${d.id==='dv'||d.id==='sol'?'sin intereses':d.id==='loan'?'cuota '+fmt(d.b.loan.pay)+'/sem':d.id==='rent'?'si se acumula: burofax y demanda':'no manda recordatorios'}</small></div><b class="bk3v neg">${fmt(Math.round(d.v))}</b><div class="bk3c">${[['Todo','all'],['Mitad','half'],['50 €','50']].map(([t,a])=>`<button data-pay="${i}" data-amt="${a}">${t}</button>`).join('')}</div></div>`;});
    if(S.mort)h+=`<div class="bk3card"><div class="bk3t">🏠 Hipoteca <small>${fmt(S.mort.pay)}/sem · ${(S.mort.rate*100).toFixed(1)} %</small></div><b class="bk3v">${fmt(Math.round(S.mort.left))}</b></div>`;
    if(!b.loan){const mx=bpLoanMax();h+=`<div class="bk3card"><div class="bk3t">💳 ${M.loan} <small>${M.loanSub} · ${(loanRate()*100).toFixed(1).replace('.0','')} % · hasta ${fmt(mx)}</small></div>${mx?`<div class="bk3c">${[[.25,12],[.5,12],[1,24]].map(([f,mo])=>`<button data-bka="ln-${f}-${mo}">${fmt(Math.round(mx*f))} · ${mo} m</button>`).join('')}</div>`:'<small class="bk3n">Sin nómina no hay préstamo.</small>'}</div>`;}}
  // pintar y conectar
  const html=bkShell(h);const T=document.createElement('div');T.innerHTML=html;const nb=T.firstElementChild;ph.querySelector('.phf')?ph.querySelector('.phf').replaceWith(nb):(ph.innerHTML=html);
  ph.querySelectorAll('[data-bkt]').forEach(x=>x.onclick=()=>{bkTab=x.dataset.bkt;if(bkTab==='prod')bkTab='ahorro';bkRender();});
  ph.querySelectorAll('[data-ph]').forEach(x=>x.onclick=()=>{phApp=x.dataset.ph==='home'?null:x.dataset.ph;phRender();});
  ph.querySelectorAll('[data-pay]').forEach(x=>x.onclick=()=>{const d=payList()[+x.dataset.pay];if(!d)return;const a=x.dataset.amt;payDebt(d,a==='all'?d.v:a==='half'?Math.ceil(d.v/2):50);bkRender();});
  ph.querySelectorAll('[data-bka]').forEach(x=>x.onclick=()=>{const a=x.dataset.bka;const P=a.split(/(?<=[a-z])(?=[+-])|-/);
    if(a.startsWith('hu')){const k=a.slice(2);bkHucha(k==='-all'?-B.hucha:k==='+5'?hrs(5):k==='+20'?hrs(20):-hrs(5));}
    else if(a.startsWith('ah')){const k=a.slice(2);bpMove('ahorro',k==='-all'?-b.ahorro.v:k==='+10'?hrs(10):k==='+40'?hrs(40):-hrs(10));}
    else if(a==='au-'||a==='au+'){b.auto=Math.max(0,(b.auto||0)+(a==='au+'?10:-10));}
    else if(a.startsWith('dep-')){if(a==='dep-brk')bkBreak();else{const [,m,f]=a.split('-');bkDep(bkAvail()*(+f),+m);}}
    else if(a.startsWith('fo')){const k=a.slice(2);bpMove('fondos',k==='-all'?-b.fondos.v:k==='+10'?hrs(10):hrs(40));}
    else if(a.startsWith('cr')){const k=a.slice(2);bpMove('cripto',k==='-all'?-b.cripto.v:hrs(10));}
    else if(a.startsWith('ln-')){const [,f,mo]=a.split('-');bpLoan(Math.round(bpLoanMax()*(+f)),+mo);}
    bkRender();});}
{const _pr=phRender;phRender=function(){if(phApp==='bank'&&S){try{return bkRender();}catch(e){console.error(e);}}return _pr.apply(this,arguments);};}
