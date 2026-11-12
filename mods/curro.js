// =================== EN EL CURRO SE ES PERSONA: baño, café, agua. Nadie aguanta ocho horas sin mear ===================
const {curro:TX_curro}=DATA.textos_mods_ag;
{const _up=update;update=function(gm){const r=_up.apply(this,arguments);try{const s=S.sim,nd=S.needs;if(!(s.work>0)||s.outingActive||S.lastWorkDay!==S.day)return r;const n=CH().name;const h=S.t/60;const W=S.curro=S.curro||{};if(W.day!==S.day){W.day=S.day;W.cafes=0;W.banos=0;W.lastCafe=-9;}
  const tox=typeof TOX==='function'?TOX():0;
  // baño: va cuando le aprieta, no cuando se le escapa
  if(nd.vejiga<28){nd.vejiga=100;nd.higiene=Math.min(100,nd.higiene+4);W.banos++;
    if(W.banos>=3&&tox>.6&&Math.random()<.5){tell(huecos(pickR(TX_curro.bano_tercera),{}),'🚻');S.rep=Math.max(0,(S.rep??70)-1);}
    else if(Math.random()<.08)tell(huecos(pickR(TX_curro.bano),{}),'🚻');}
  // café: cuando cae la energía, si no se ha pasado ya
  if(nd.energia<38&&h-W.lastCafe>2.2&&W.cafes<3){W.lastCafe=h;W.cafes++;const maq=['obra','hosteleria','cuidados'].includes(S.track)?0:hrs(.12);
    if(maq&&S.money>=maq)bkAdd('Café',-maq);
    const achi=typeof govLack==='function'&&govLack('café');nd.energia=Math.min(100,nd.energia+(W.cafes===1?16:10)*(achi?.6:1));if(achi&&W.cafes===1&&Math.random()<.3)tell(huecos(TX_curro.sin_cafe,{}),'☕');nd.social=Math.min(100,nd.social+3);
    if(Math.random()<.12)tell(huecos(pickR([maq?huecos(TX_curro.cafe_maquina,{v:fmt(maq)}):huecos(TX_curro.cafe_termo,{cual:W.cafes===1?TX_curro.cafe_primero:TX_curro.cafe_despues}),huecos(TX_curro.cafe_compi,{quien:P_('compi')?P_('compi').n:TX_curro.cafe_compi_alguien}),huecos(TX_curro.cafe_va,{ord:TX_curro.cafe_ordinales[W.cafes-1]})]),{}),'☕');}
  // agua y un respiro cuando la cosa aprieta
  if(nd.energia<12&&W.cafes>=3&&!W.aviso){W.aviso=1;tell(huecos(TX_curro.no_puede,{}),'😮‍💨');}
  if(nd.higiene<15&&!W.lavado){W.lavado=1;nd.higiene=Math.min(100,nd.higiene+12);if(Math.random()<.3)tell(TX_curro.lavado,'🚿');}
}catch(e){}return r;};}
