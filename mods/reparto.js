// =================== QUIÉN PAGA LO QUE SE ROMPE: en casa de tu madre, ella; en piso compartido, a partes; con pareja, a medias ===================
function shareOf(i){const T=S.home&&S.home.type;const o=i!=null?S.obj[i]:null;const mine=i!=null&&typeof inArea==='function'&&inArea(i%N,i/N|0)&&!(o&&o.priv&&o.priv!=='ana');
  if(T==='padres')return mine?.5:0;            // su cuarto: a medias si se lo pide; el resto, su madre
  if(T==='habitacion')return mine?1:1/((HOMES.habitacion.mates||2)+1); // lo común, entre los tres
  if(T==='calle')return 0;
  if(liveIn())return .5;
  return 1;}
function splitTell(i,paid,share){const T=S.home&&S.home.type;const back=Math.round(paid*(1-share));if(back<=0)return;S.money+=back;const o=i!=null&&S.obj[i];const nm=o&&OBJ[o.t]?OBJ[o.t].n.toLowerCase():'eso';
  if(T==='padres')tell(share===0?`${nm[0].toUpperCase()+nm.slice(1)}: lo ha pagado su madre. «Es mi casa», ha dicho, y ha sacado la cartera de la pensión.`:`Su madre ha puesto la mitad de ${nm}: ${fmt(back)}. «Para lo tuyo, a medias».`,'👩‍🦳');
  else if(T==='habitacion')tell(`${nm[0].toUpperCase()+nm.slice(1)}: ${fmt(back)} los han puesto los compañeros de piso${Math.random()<.3?', uno de ellos a regañadientes y «a final de mes»':''}.`,'🚪');
  else{const p=liveIn();if(p)tell(`${p.n} ha pagado la mitad de ${nm}: ${fmt(back)}.`,'💞');}}
{const _es=execStep;execStep=function(job,j,byNpc){const st=job&&job.steps[j];const m0=S.money;const r=_es.apply(this,arguments);try{if(st&&(st.k==='fix'||st.k==='replace')&&S.money<m0){const paid=m0-S.money;const sh=shareOf(st.i);if(sh<1)splitTell(st.i,paid,sh);}}catch(e){}return r;};}
// mano de obra de la cooperativa para arreglos: mismo reparto
{const _hire=hireFor;hireFor=function(i,kind){const m0=S.money;const r=_hire.apply(this,arguments);try{if(S.money<m0){const sh=shareOf(i);if(sh<1)splitTell(i,m0-S.money,sh);}}catch(e){}return r;};}
// averías de la casa (calentador, nevera, lavadora) si las paga Ana: mismo reparto
{const _dl=dailyEvents;dailyEvents=function(){const g=typeof HG==='function'?HG():null;const b0=g?[g.boiler,g.fridge,g.wash]:null;const m0=S.money;const r=_dl.apply(this,arguments);try{if(g&&b0){const fixed=(b0[0]&&!g.boiler)||(b0[1]&&!g.fridge)||(b0[2]&&!g.wash);if(fixed&&S.money<m0-hrs(5)){const sh=shareOf(null);if(sh<1){const T=S.home&&S.home.type;const paid=m0-S.money;const back=Math.round(paid*(1-sh));S.money+=back;tell(T==='padres'?`La avería la ha pagado su madre. ${CH().name} ha intentado poner algo; no le ha dejado.`:T==='habitacion'?`La avería, entre los tres: ${fmt(back)} de vuelta.`:`${liveIn().n} ha puesto la mitad: ${fmt(back)}.`,'🔧');}}}}catch(e){}return r;};}
