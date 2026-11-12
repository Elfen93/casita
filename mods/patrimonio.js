// =================== LO QUE SE TIENE NO ES SOLO LO DE LA CUENTA: ahorro, casa y muebles cuentan ===================
function ahorros(){try{const b=BP(),B=BKS();return Math.round((B.hucha||0)+(b.ahorro.v||0)+(b.dep?b.dep.v:0)+(b.fondos.v||0)+(b.cripto.v||0));}catch(e){return 0;}}
function deudasTot(){try{return Math.round(bkDebts().reduce((a,d)=>a+(d[1]||0),0));}catch(e){return 0;}}
function casaVal(){try{return Math.round(houseValue()*.6);}catch(e){return 0;}} // lo que vale lo hecho y comprado (usado, no nuevo)
function patriSnap(t){t.sav0=ahorros();t.hv0=casaVal();t.deb0=deudasTot();t.own0=!!S.owned;}
{const _ns=newSeason;newSeason=function(){const t=_ns.apply(this,arguments);try{patriSnap(t);}catch(e){}return t;};}
{const _dl=dailyEvents;dailyEvents=function(){const r=_dl.apply(this,arguments);try{const t=TM();if(t&&t.hv0==null)patriSnap(t);}catch(e){}return r;};}
function patrimonioTxt(t,dm){const ds=ahorros()-(t.sav0||0),dh=casaVal()-(t.hv0??casaVal()),dd=deudasTot()-(t.deb0||0);const tot=dm+ds+dh-dd;
  const parts=[];parts.push(huecos(TXHZ.patrimonio.cuenta,{x:dm>=0?'+':TXHZ.patrimonio.txt,c:fmt(Math.abs(dm))}));if(ds)parts.push(huecos(TXHZ.patrimonio.ahorrado,{x:ds>0?'+':TXHZ.patrimonio.txt,c:fmt(Math.abs(ds))}));if(dh)parts.push(huecos(TXHZ.patrimonio.txt2,{x:dh>0?TXHZ.patrimonio.invertido_casa:TXHZ.patrimonio.casa,x2:dh>0?'+':TXHZ.patrimonio.txt,c:fmt(Math.abs(dh))}));if(dd)parts.push(huecos(TXHZ.patrimonio.deudas,{x:dd>0?'+':TXHZ.patrimonio.txt,c:fmt(Math.abs(dd))}));
  return `${tot>=0?'Es '+fmt(tot)+' más rico que hace dos meses':'Es '+fmt(-tot)+' más pobre que hace dos meses'} (${parts.join(', ')})`.replace('rico',ga('rica','rico','rique')).replace('pobre','pobre');}
// en Vida: una línea de patrimonio
{const _vt=vidaTab;vidaTab=function(){let h=_vt.apply(this,arguments);try{const tot=Math.round(S.money)+ahorros()+casaVal()-deudasTot();h=h.replace('<h3>🤝 Red</h3>',`<div class="sub" style="font-size:12px;margin:-6px 0 10px">🧱 <b>${huecos(TXHZ.patrimonio.patrimonio,{c:fmt(tot)})}</b> · cuenta ${fmt(Math.round(S.money))} + ahorro ${fmt(ahorros())} + lo hecho en casa ${fmt(casaVal())}${deudasTot()?' − deudas '+fmt(deudasTot()):''}</div><h3>${TXHZ.patrimonio.red}</h3>`);}catch(e){}return h;};}
