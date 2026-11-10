// =================== EN EL CURRO SE ES PERSONA: baño, café, agua. Nadie aguanta ocho horas sin mear ===================
{const _up=update;update=function(gm){const r=_up.apply(this,arguments);try{const s=S.sim,nd=S.needs;if(!(s.work>0)||s.outingActive||S.lastWorkDay!==S.day)return r;const n=CH().name;const h=S.t/60;const W=S.curro=S.curro||{};if(W.day!==S.day){W.day=S.day;W.cafes=0;W.banos=0;W.lastCafe=-9;}
  const tox=typeof TOX==='function'?TOX():0;
  // baño: va cuando le aprieta, no cuando se le escapa
  if(nd.vejiga<28){nd.vejiga=100;nd.higiene=Math.min(100,nd.higiene+4);W.banos++;
    if(W.banos>=3&&tox>.6&&Math.random()<.5){tell(pickR([`Tercera vez al baño. El encargado ha mirado el reloj. ${n} ha mirado al encargado.`,`En esta empresa cuentan las veces que vas al baño. ${n} lo sabe y va igual.`]),'🚻');S.rep=Math.max(0,(S.rep??70)-1);}
    else if(Math.random()<.08)tell(pickR([`Baño del curro. Dos minutos de silencio y el móvil. Lo más parecido a un descanso.`,`${n} ha ido al baño más por salir de la sala que por otra cosa.`,`En el baño hay un cartel: «Lávate las manos». Debajo alguien ha escrito «y la conciencia, jefe».`]),'🚻');}
  // café: cuando cae la energía, si no se ha pasado ya
  if(nd.energia<38&&h-W.lastCafe>2.2&&W.cafes<3){W.lastCafe=h;W.cafes++;const maq=['obra','hosteleria','cuidados'].includes(S.track)?0:hrs(.12);
    if(maq&&S.money>=maq)bkAdd('Café',-maq);
    const achi=typeof govLack==='function'&&govLack('café');nd.energia=Math.min(100,nd.energia+(W.cafes===1?16:10)*(achi?.6:1));if(achi&&W.cafes===1&&Math.random()<.3)tell(`No hay café: llevan semanas con achicoria. ${n} dice que sabe a tierra. Lo dice cada día.`,'☕');nd.social=Math.min(100,nd.social+3);
    if(Math.random()<.12)tell(pickR([maq?`Café de máquina, ${fmt(maq)}. Sabe a plástico y a las 11:40.`:`Café en el termo, de pie. El ${W.cafes===1?'primero':'de después'} del día.`,`Café con ${P_('compi')?P_('compi').n:'alguien del turno'}. Cinco minutos de hablar mal del jefe: cunden más que el café.`,`${n} va por el ${['primer','segundo','tercer'][W.cafes-1]} café. El cuerpo pide cama; el contrato, aguantar.`]),'☕');}
  // agua y un respiro cuando la cosa aprieta
  if(nd.energia<12&&W.cafes>=3&&!W.aviso){W.aviso=1;tell(`${n} ya no puede más y aún quedan horas. Mañana, dormir. Hoy, aguantar.`,'😮‍💨');}
  if(nd.higiene<15&&!W.lavado){W.lavado=1;nd.higiene=Math.min(100,nd.higiene+12);if(Math.random()<.3)tell(`Un lavado de gato en el baño del curro, con jabón de dispensador. Algo es algo.`,'🚿');}
}catch(e){}return r;};}
