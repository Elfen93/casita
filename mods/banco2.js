// =================== BANCO: pagar deudas desde la app y ahorro automático cada semana ===================
const {banco2:TX_banco2}=DATA.textos_mods_ag;
const dName=p=>p?(p.k==='madre'?TX_banco2.mama:p.n):TX_banco2.amigo;
{const _bd=bkDebts;bkDebts=function(){const L=_bd.apply(this,arguments);try{for(const d of L){const m=d[0].match(/^🤝 (.+)$/);if(m){const p=(S.people||[]).find(q=>q.n===m[1]&&q.k==='madre');if(p)d[0]=huecos(TX_banco.deu_amigo,{quien:TX_banco2.mama});}}
}catch(e){}return L;};}
function payList(){const L=[];for(const q of (ex().cq||[]).filter(q=>q.k==='devolver')){const p=P_(q.data.p);L.push({id:'dv',q,n:dName(p),e:'🤝',v:q.data.m,p});}
  if(S.sol&&S.sol.owed>0)L.push({id:'sol',n:S.sol.loanWho||TX_banco2.alguien,e:'🤝',v:S.sol.owed});
  const M=typeof MG==='function'?MG():null;if(M&&M.debt>0)L.push({id:'rent',n:TX_banco2.l_alquiler,e:'🏠',v:M.debt});const mt=typeof MT==='function'?MT():null;if(mt&&mt.debt>0)L.push({id:'dealer',n:TX_banco2.l_camello,e:'💊',v:mt.debt});
  const b=typeof BP==='function'?BP():null;if(b&&b.loan&&b.loan.left>0)L.push({id:'loan',n:TX_banco2.l_prestamo,e:'💳',v:b.loan.left,b});return L;}
function payDebt(d,amt){amt=Math.round(Math.min(amt,d.v));if(amt<=0)return;if(S.money<amt){toast(TX_banco.no_hay_tanto);return;}const n=CH().name;
  if(d.id==='dv'){bkAdd('Devolución',-amt);d.q.data.m-=amt;if(d.p){d.p.rel=Math.min(100,(d.p.rel||0)+(d.q.data.m<=0?6:2));}if(d.q.data.m<=0){ex().cq=ex().cq.filter(x=>x!==d.q);tell(huecos(TX_banco2.dv_fin,{a:d.n===TX_banco2.mama?TX_banco2.su_madre:d.n,fin:d.n===TX_banco2.mama?huecos(TX_banco2.dv_mama,{hijo:ga(...TX_banco2.dv_hijo)}):TX_banco2.cuentas_claras}),'🤝');}else tell(huecos(TX_banco2.dv_parte,{v:fmt(amt),a:d.n===TX_banco2.mama?TX_banco2.su_madre:d.n,q:fmt(d.q.data.m)}),'🤝');}
  else if(d.id==='sol'){bkAdd('Devolución',-amt);S.sol.owed-=amt;const p=(S.people||[]).find(q=>q.n===d.n);if(S.sol.owed<=0){S.sol.owed=0;if(p)p.rel=Math.min(100,(p.rel||0)+6);tell(huecos(TX_banco2.sol_fin,{a:d.n}),'🤝');S.sol.loanWho=null;}else tell(huecos(TX_banco2.dv_parte,{v:fmt(amt),a:d.n,q:fmt(S.sol.owed)}),'🤝');}
  else if(d.id==='rent'){bkAdd('Alquiler',-amt);const M=MG();M.debt-=amt;if(M.debt<=0){M.debt=0;M.wk=0;tell(huecos(TX_banco2.rent_fin,{}),'🏠');}}
  else if(d.id==='dealer'){bkAdd('Otros',-amt);const m=MT();m.debt-=amt;if(m.debt<=0){m.debt=0;tell(huecos(TX_banco2.dealer_fin,{}),'💊');}}
  else if(d.id==='loan'){bkAdd('Préstamo',-amt);d.b.loan.left-=amt;if(d.b.loan.left<=0){d.b.loan=null;tell(huecos(TX_banco2.loan_fin,{}),'💳');}}
  sfx('tap');phRender();}
// ahorro automático: cada lunes, una cantidad fija a la cuenta de ahorro (si hay colchón)
{const _ww=worldWeekly;worldWeekly=function(){const r=_ww.apply(this,arguments);try{const b=BP();const a=b.auto||0;if(a>0){const v=Math.min(a,Math.max(0,S.money-hrs(15)));if(v>=1){bpMove('ahorro',v);b.autoTot=(b.autoTot||0)+v;}else if(throttled('autoah',6e5))tell(TX_banco2.auto_no,'🐷');}}catch(e){}return r;};}
// dibujar
{const _pr=phRender;phRender=function(){const r=_pr.apply(this,arguments);try{if(phApp!=='bank')return r;const ph=document.getElementById('phone');const body=ph&&ph.querySelector('.bkbody');if(!body)return r;
  if(bkTab==='deudas'){const L=payList();if(L.length){let h=`<div class="bksec">${TX_banco2.pagar_ahora}</div>`;L.forEach((d,i)=>{h+=`<div class="bkpay"><span>${d.e} <b>${d.n}</b><small>${fmt(Math.round(d.v))}</small></span><span><button data-pay="${i}" data-amt="all">${TX_banco2.todo}</button><button data-pay="${i}" data-amt="half">${TX_banco2.mitad}</button><button data-pay="${i}" data-amt="50">${TX_banco2.cincuenta}</button></span></div>`;});const note=body.querySelector('.bkpubnote');if(note)note.insertAdjacentHTML('afterend',h);else body.insertAdjacentHTML('afterbegin',h);
      body.querySelectorAll('[data-pay]').forEach(b=>b.onclick=()=>{const d=payList()[+b.dataset.pay];if(!d)return;const a=b.dataset.amt;payDebt(d,a==='all'?d.v:a==='half'?Math.ceil(d.v/2):50);});}}
  if(bkTab==='prod'){const b=BP();const cards=[...body.querySelectorAll('.bpcard')];const c=cards.find(x=>/Cuenta de ahorro/.test(x.textContent));if(c&&!c.querySelector('.bkauto')){c.insertAdjacentHTML('beforeend',`<div class="bkauto"><span>${TX_banco2.auto_lunes}</span><span><button data-au="-10">−</button><b>${huecos(TX_banco2.auto_sem,{v:fmt(b.auto||0)})}</b><button data-au="10">+</button></span></div><small class="bkautos">${b.auto?huecos(TX_banco2.auto_lleva,{v:fmt(Math.round(b.autoTot||0)),c:fmt(hrs(15))}):TX_banco2.auto_elige}</small>`);
      c.querySelectorAll('[data-au]').forEach(x=>x.onclick=()=>{b.auto=Math.max(0,(b.auto||0)+(+x.dataset.au));phRender();});}}}catch(e){console.error(e);}return r;};}
