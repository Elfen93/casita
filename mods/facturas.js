// facturas según con quién vive: en casa de la madre no paga (pone para la compra); piso compartido, a partes iguales
const {facturas:TX_facturas}=DATA.textos_mods_ag;
{const _ps=partnerShare;partnerShare=function(amount){const t=(S.home&&S.home.type)||'casita';if(t==='padres'&&!S.owned)return amount;// paga la madre
  if(t==='habitacion'&&!S.owned){const n=1+((S.home.mates||[]).length||2)+(liveIn()?1:0);return Math.round(amount*(1-1/n));}
  return _ps.apply(this,arguments);};}
{const _pu=payUtilities;payUtilities=function(){const t=(S.home&&S.home.type)||'casita';const before=S.money;const r=_pu.apply(this,arguments);try{const b=S.lastBill;if(!b)return r;
  if(t==='padres'&&!S.owned){const sind=b.sindicato||0;S.money=before-sind;b.total=sind;toast(sind?huecos(TX_facturas.madre_sindicato,{v:fmt(sind)}):TX_facturas.madre,true);}
  else if(t==='habitacion'&&!S.owned){toast(huecos(TX_facturas.piso,{v:fmt(b.total)}),true);}}catch(e){}return r;};}
