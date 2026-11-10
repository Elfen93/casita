// ---------- suministros ----------
const utilMul=()=>(S.pol&&S.pol.coopEnergy?0.65:1)*(isI('ecologista')?0.85:1);
function utilTick(gm){
  const u=S.util=S.util||{luz:0,agua:0,gas:0};const s=S.sim,night=nightFactor()>0.3;
  if(has('nevera'))u.luz+=0.0006*gm;
  if(night&&!s.work){let l=0;for(const o of S.obj)if(o&&OBJ[o.t].light)l++;u.luz+=0.0015*l*gm;}
  if(s.use&&!s.work){const t=s.use.type;
    if(t==='tele'||t==='compu')u.luz+=0.01*gm;if(t==='fogon'){u.gas+=0.04*gm;u.luz+=0.004*gm;}
    if(t==='ducha'){u.agua+=0.035*gm;u.gas+=0.025*gm;}if(t==='vater')u.agua+=0.015*gm;if(t==='banco')u.luz+=0.004*gm;if(t==='planta'||t==='flores')u.agua+=0.002*gm;}
}
function poolDays(){return count(i=>FLOORS[S.floor[i]].water);}
function payUtilities(){
  const u=S.util||{luz:0,agua:0,gas:0};const f=Hm().util*(Dm().soul?MK().util:1)*utilMul();
  const bill={luz:Math.round((u.luz+6)*f),agua:Math.round((u.agua+4+poolDays()*1.5)*f),gas:Math.round(u.gas*f),internet:(has('compu')||has('tele'))?Math.round(35*f):0};
  if(S.owned)bill.ibi=Math.round((S.housePaid||housePrice())*0.006/12);
  bill.total=Object.values(bill).reduce((a,b)=>a+b,0);
  if(S.union&&S.union.member){bill.sindicato=unionFee();bill.total+=bill.sindicato;}{const ps=partnerShare(bill.total);if(ps){bill.total-=ps;}}S.money-=bill.total;bumpMoney();S.util={luz:0,agua:0,gas:0};S.lastBill=bill;
  toast(`💡 Facturas del mes: ${fmt(bill.total)} · luz ${fmt(bill.luz)} · agua ${fmt(bill.agua)} · gas ${fmt(bill.gas)}${bill.internet?' · internet '+fmt(bill.internet):''}${bill.ibi?' · IBI y seguro '+fmt(bill.ibi):''}${bill.sindicato?' · sindicato '+fmt(bill.sindicato):''}`,true);
}
function utilEstimate(){const u=S.util||{luz:0,agua:0,gas:0};const f=Hm().util*(Dm().soul?MK().util:1)*utilMul();return Math.round((u.luz+6+u.agua+4+u.gas)*f+((has('compu')||has('tele'))?35*f:0));}
