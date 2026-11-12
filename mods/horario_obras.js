// =================== LAS OBRAS EN HORARIO DE OBRA: de lunes a viernes de 8 a 18, sábados de 9 a 14 ===================
function obraHora(){const wd=dateOf(S.day).wd,h=S.t/60;if(festivo&&festivo(S.day))return false;return (wd<=4&&h>=8&&h<18)||(wd===5&&h>=9&&h<14);}
function obraVuelve(){const wd=dateOf(S.day).wd,h=S.t/60;if(wd<=4&&h<8)return TXHZ.horario_obras.hoy_8;if(wd===4&&h>=18)return TXHZ.horario_obras.sabado_9;if(wd<=3)return TXHZ.horario_obras.manana_8;if(wd===5&&h<9)return TXHZ.horario_obras.hoy_9;return TXHZ.horario_obras.lunes_8;}
{const _sb=spawnBuilder;spawnBuilder=function(){const r=_sb.apply(this,arguments);if(r&&!obraHora()){if(S.job)S.job.waitBuilder=true;toast(huecos(TXHZ.horario_obras.ha_venido_ver_trabajo_empieza,{obraVuelve:obraVuelve()}));npcLeave();}return r;};}
{const _un=updateNPC;updateNPC=function(gm){const n=S.npc;const job=S.job;
  if(n&&n.state!=='leaving'&&job&&job.who==='builder'&&n.work&&!obraHora()&&S.t/60>=18.5&&S.t/60<23.9){const st=job.steps[n.work.j];if(st)st.prog=n.work.t;n.work=null;}
  if(n&&n.state!=='leaving'&&job&&job.who==='builder'&&!n.work&&!obraHora()){job.waitBuilder=true;tell(huecos(TXHZ.horario_obras.recoge_herramientas_hasta,{n_name:n.name,obraVuelve:obraVuelve()}),'👷');npcLeave();return _un.apply(this,arguments);}
  if(!S.npc&&job&&job.who==='builder'&&job.waitBuilder&&obraHora()){job.waitBuilder=false;_sb0();}
  const r=_un.apply(this,arguments);try{const m=S.npc;if(m&&m.work&&m.work.t===0&&S.job){const st=S.job.steps[m.work.j];if(st&&st.prog){m.work.t=st.prog;st.prog=0;}}}catch(e){}return r;};}
const _sb0=()=>{try{const f=spawnBuilder;f();}catch(e){}};
