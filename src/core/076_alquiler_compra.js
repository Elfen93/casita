// ---------- alquiler, compra ----------
{const _wr=weeklyRent;weeklyRent=function(){const t=(S.home&&S.home.type)||'casita';if(t==='casita')return _wr();return Math.round(HOMES[t].rent*Dm().rent*(S.rentMul||1)*(Dm().soul?MK().price:1));};}
{const _hp=housePrice;housePrice=function(){const t=(S.home&&S.home.type)||'casita';if(t==='casita')return _hp();const H=HOMES[t];if(!H.buy)return 1e9;let imp=0;for(let i=0;i<N*N;i++){const o=S.obj[i];if(o&&!o.priv)imp+=OBJ[o.t].p*0.15;}return Math.round((H.price+imp)*Hm().house*(Dm().soul?MK().price:1)/10)*10;};}
{const _mo=mortgageOffer;mortgageOffer=function(){const o=_mo();if(!HT().buy){o.ok=false;o.why=['esta vivienda no está en venta'];}return o;};}
