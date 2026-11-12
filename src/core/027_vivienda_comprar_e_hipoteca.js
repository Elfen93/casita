// ---------- vivienda: comprar e hipoteca ----------
function housePrice(){let imp=0;for(let i=0;i<N*N;i++){const o=S.obj[i];if(o)imp+=OBJ[o.t].p*0.3;imp+=FLOORS[S.floor[i]].p;const w=S.wall[i];imp+=w===1?20:w===2?60:w===3?80:w===4?12:0;}return Math.round((12000+imp*0.6)*Hm().house*(Dm().soul?MK().price:1)/10)*10;}
const curRate=()=>Dm().soul?(S.market?S.market.euribor:0.035)+0.015:Hm().rate;
function mortgageOffer(){
  const H=Hm(),price=housePrice(),down=Math.round(price*H.down),closing=Math.round(price*H.closing),P=price-down,n=H.years*52,rr=curRate()/52;
  const pay=Math.round(P*rr/(1-Math.pow(1+rr,-n)));const inc=salary()*5;
  const why=[];if(S.jobless)why.push(TXN.vivienda.no_trabajo);if((S.rep??70)<40)why.push(TXN.vivienda.rep_baja);if(pay>inc*0.4)why.push(TXN.vivienda.cuota_alta);if(S.money<down+closing)why.push(huecos(TXN.vivienda.falta_entrada,{falta:fmt(down+closing-S.money)}));
  return {price,down,closing,P,n,pay,rate:curRate(),ok:!why.length,why};
}
function buyHouse(mode){
  const o=mortgageOffer();
  if(mode==='cash'){if(S.money<o.price+o.closing){toast(huecos(TXN.vivienda.falta_contado,{precio:fmt(o.price+o.closing)}));sfx('bad');return false;}S.money-=o.price+o.closing;S.owned=true;S.mort=null;}
  else{if(!o.ok){toast(TXN.vivienda.banco_no+o.why.join(', '));sfx('bad');return false;}S.money-=o.down+o.closing;S.owned=true;S.mort={left:o.P,pay:o.pay,rate:o.rate,weeks:o.n};}
  S.housePaid=o.price;bumpMoney();sfx('level');setTimeout(()=>chapter('casa','Las llaves',huecos(TXN.vivienda.firma,{como:mode==='cash'?TXN.vivienda.firma_contado:TXN.vivienda.firma_hipoteca,resto:mode==='cash'?'':TXN.vivienda.firma_banco})),1200);confetti(S.sim.x,S.sim.y,60);toast(huecos(TXN.vivienda.propietaria,{hip:S.mort?huecos(TXN.vivienda.propietaria_hip,{pendiente:fmt(S.mort.left),interes:(S.mort.rate*100).toFixed(1),cuota:fmt(S.mort.pay)}):''}),true);return true;
}
function payMortgage(){
  const m=S.mort;if(!m)return;const rr=m.rate/52;const int=m.left*rr;const pay=Math.min(m.pay,Math.round(m.left+int));
  m.left=Math.max(0,m.left+int-pay);m.weeks--;S.money-=pay;bumpMoney();
  if(m.left<1){S.mort=null;toast(TXN.vivienda.hipoteca_pagada,true);confetti(S.sim.x,S.sim.y,60);}
  else toast(huecos(TXN.vivienda.cuota_hipoteca,{cuota:fmt(pay),resta:fmt(m.left)}),true);
}
function amortize(amount){const m=S.mort;if(!m)return;const a=Math.min(amount,m.left,S.money);if(a<=0)return;S.money-=a;m.left-=a;if(m.left<1){S.mort=null;toast(TXN.vivienda.hipoteca_liquidada,true);}else{const rr=m.rate/52;m.pay=Math.round(m.left*rr/(1-Math.pow(1+rr,-Math.max(1,m.weeks))));toast(huecos(TXN.vivienda.amortizado,{importe:fmt(a),cuota:fmt(m.pay)}));}bumpMoney();}
