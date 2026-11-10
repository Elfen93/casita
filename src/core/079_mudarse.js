// ---------- mudarse ----------
function moveCost(k){const H=HOMES[k],r=Math.round(H.rent*Dm().rent*(Dm().soul?MK().price:1));return k==='padres'?0:k==='infra'?r*2:k==='habitacion'?r*3:r*(H.cls>=3?6:5);}
function canMove(k){const H=HOMES[k],r=H.rent*Dm().rent,inc=S.jobless?0:salary()*TR().days.length,why=[];if(k===((S.home&&S.home.type)||'casita'))return {ok:false,why:['ya vive aquí']};
  if(k==='padres'){const m=P_('madre');if(!m)why.push('no tiene a dónde volver');else if(m.rel<35)why.push('su madre y ella no se hablan');return {ok:!why.length,why};}
  if(S.money<moveCost(k))why.push(`hacen falta ${fmt(moveCost(k))} de fianza${H.cls>=2?' y agencia':''}`);
  let aval=false;if(H.need&&inc<r*H.need){const m=P_('madre');if(S.jobless)why.push('sin nómina no le alquilan');else if(m&&m.rel>=60&&H.cls<=2)aval=true;else why.push(`el casero pide ganar ${fmt(Math.round(r*H.need))} a la semana`);}
  return {ok:!why.length,why,aval};}
function moveHome(k,auto){const cm=canMove(k);if(!cm.ok){toast('No puede mudarse: '+cm.why.join(', '));return false;}
  const from=(S.home&&S.home.type)||'casita';let extra='';
  if(S.owned){const v=housePrice(),left=S.mort?Math.round(S.mort.left):0;const net=Math.round(v*.95)-left;S.money+=net;S.owned=false;S.mort=null;extra+=` Ha vendido la casa: ${net>=0?'le quedan '+fmt(net):'aún debe '+fmt(-net)} después de pagar al banco.`;}
  let sold=0;for(let i=0;i<N*N;i++){const o=S.obj[i];if(o&&!o.priv&&!OBJ[o.t].big&&OBJ[o.t].cat!=='garden')sold+=Math.round(OBJ[o.t].p*(o.q===4?1.5:1)*.25*((o.c??100)/100));}
  S.money+=sold-moveCost(k);bumpMoney();if(sold>0)extra+=` Ha vendido por ${fmt(sold)} los muebles que no caben.`;
  applyHome(k);computeRooms();if(typeof centerOnWorld==='function')centerOnWorld(S.sim.x,S.sim.y);
  const up=HOMES[k].cls>HOMES[from].cls;
  const txt={padres:`${CH().name} ha vuelto a casa de su madre. A su edad. El cuarto sigue igual que lo dejó: los pósters, la colcha, el olor.`,
    infra:`${CH().name} se ha mudado a un bajo interior. Sin contrato, sin ventana a la calle y con una mancha de humedad que parece un mapa. Es lo que hay.`,
    habitacion:`${CH().name} ahora alquila una habitación en un piso compartido. ${S.home.mates.map(q=>{const p=(S.people||[]).find(x=>x.k===q);return p?p.n+' ('+p.mjob+')':'';}).filter(Boolean).join(' y ')} son sus nuevos compañeros de piso.`,
    viejo:`${CH().name} se ha mudado a un piso viejo de alquiler. Las ventanas no cierran del todo, pero la puerta es suya.`,
    casita:`${CH().name} se ha mudado a una casita con terreno. Hay espacio de sobra para ir haciéndola suya.`,
    bueno:`${CH().name} se ha mudado a un piso cómodo en el centro. Calefacción, ascensor y un portero que saluda. ${up?'Nunca había vivido así.':''}`,
    chalet:`${CH().name} vive ahora en un chalet con piscina. ${up?'Desde la terraza no se ve el barrio de antes.':''}`}[k];
  chapter('casa_'+k+'_'+S.day,`${HOMES[k].e} ${HOMES[k].n}`,txt+(cm.aval?' Su madre ha tenido que avalarla.'.replace('avalarla',ga('avalarla','avalarlo','avalarle')):'')+extra);
  if(!up&&HOMES[k].cls<HOMES[from].cls){ex().exp.stress++;pushI(isRight()?'socialdemocrata':LEANL(),15,'vivienda');}
  if(up&&HOMES[k].cls>=3)pushI(isI('conservadora')?'conservadora':'liberal',12,'dinero');
  const pt=liveIn();if(pt&&['habitacion','padres','infra'].includes(k)){pt.wear=Math.min(100,(pt.wear||0)+30);tell(`${pt.n} no se ha mudado con ${CH().name}: «Ahí no cabemos los dos». Se ve los fines de semana.`,'💔');pt.stage='pareja';}
  save();return true;}
// la pareja no se muda a un cuarto compartido
{const _mi=moveIn;moveIn=function(p){const t=(S.home&&S.home.type)||'casita';if(['habitacion','padres','infra'].includes(t)){toast(`En ${HOMES[t].n.toLowerCase()} no hay sitio para vivir con ${p.n}`);return;}return _mi.apply(this,arguments);};}
// el ambiente de la casa
{const _eb=envBonus;envBonus=function(){let v=_eb();const t=(S.home&&S.home.type)||'casita';if(t==='infra')v-=10;if(t==='habitacion')v-=3;if(t==='bueno')v+=4;if(t==='chalet')v+=6;return v;};}
{const _cw=conexWeekly;conexWeekly=function(){_cw.apply(this,arguments);try{homeWeekly();}catch(e){console.error('home',e);}};}
