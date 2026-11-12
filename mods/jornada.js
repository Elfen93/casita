// =================== LA JORNADA: el trabajo como sitio donde pasan cosas, no como 8 horas en negro ===================
const JN=()=>{if(!S.jn)S.jn={extra:0,cov:0,abuse:0,said:0,shift:0,log:[]};return S.jn;};
const jnBoss=()=>{if(!S.office)return undefined;const b=S.office.boss;if(b)return typeof b==='string'?b:b.n;return S.office.boss=pickR(TXHZ.jornada.montse_lista);};
Object.assign(DLG,{
  j_hora:{t:()=>DT.j_hora.t,x:()=>huecos(DT.j_hora.x,{jefe:jnBoss()}),
    o:()=>{const O=DT.j_hora.o;return [{t:O[0].t,s:O[0].s,f:()=>{JN().extra++;S.needs.energia=Math.max(0,S.needs.energia-12);S.rep=Math.min(100,(S.rep??70)+2);if(JN().extra%5===0)tell(huecos(O[0].tell,{h:JN().extra,hora:fmt(Math.round(salary()/8)),total:fmt(Math.round(JN().extra*salary()/8))}),'⏰');}},
      {t:O[1].t,s:O[1].s,f:()=>{S.rep=Math.max(0,(S.rep??70)-3);JN().said++;if(Math.random()<.3)tell(huecos(O[1].tell,{jefe:jnBoss()}),'📋');}},
      {t:O[2].t,s:O[2].s,ok:()=>true,f:()=>{if(Math.random()<.25+(office().org||0)/200){S.money+=Math.round(salary()/8*1.5);tell(huecos(O[2].tell_ok,{jefe:jnBoss()}),'💶');office().org=Math.min(100,(office().org||0)+4);ex().exp.solid++;}else{S.rep=Math.max(0,(S.rep??70)-4);tell(huecos(O[2].tell_ko,{}),'📋');JN().said++;}}}];},
    auto:()=>comp()>=2?2:T('trabajadora')?0:1},
  j_cliente:{t:()=>DT.j_cliente.t,x:()=>huecos(DT.j_cliente.x,{caso:huecos(pickR(DT.j_cliente.casos),{ella:DT.j_cliente.ella[oa()==='a'?'a':'o']}),jefe:jnBoss()}),
    o:()=>{const O=DT.j_cliente.o;return [{t:O[0].t,s:O[0].s,f:()=>{JN().abuse++;try{MT().an-=2;}catch(e){}S.needs.social=Math.max(0,S.needs.social-6);}},
      {t:O[1].t,s:O[1].s,f:()=>{S.rep=Math.max(0,(S.rep??70)-6);try{MT().an+=1;}catch(e){}S.needs.diversion=Math.min(100,S.needs.diversion+5);if(Math.random()<.35)tell(huecos(O[1].tell,{jefe:jnBoss()}),'📋');}},
      {t:O[2].t,s:O[2].s,f:()=>{S.rep=Math.max(0,(S.rep??70)-1);if(Math.random()<.5)tell(huecos(O[2].tell,{jefe:jnBoss()}),'📋');}}];},
    auto:()=>T('impulsiva')?1:comp()>=2?2:0},
  j_cubrir:{t:()=>DT.j_cubrir.t,x:()=>{const cp=P_('compi');return huecos(DT.j_cubrir.x,{quien:cp?cp.n:DT.j_cubrir.alguien,dia:pickR(DT.j_cubrir.dias),motivo:pickR(DT.j_cubrir.motivos)});},
    o:()=>{const O=DT.j_cubrir.o;return [{t:O[0].t,s:O[0].s,f:()=>{JN().cov++;const cp=P_('compi');if(cp)cp.rel=Math.min(100,cp.rel+10);ex().exp.solid++;S.needs.energia=Math.max(0,S.needs.energia-10);S.money+=Math.round(salary()*.9);office().org=Math.min(100,(office().org||0)+2);}},
      {t:O[1].t,s:O[1].s,f:()=>{const cp=P_('compi');if(cp)cp.rel=Math.max(0,cp.rel-4);}}];},
    auto:()=>T('solidaria')||comp()>=2?0:S.needs.energia<35?1:0},
  j_turno:{t:()=>DT.j_turno.t,x:()=>huecos(DT.j_turno.x,{jefe:jnBoss(),cuando:pickR(DT.j_turno.cuando)}),
    o:()=>{const O=DT.j_turno.o;return [{t:O[0].t,s:O[0].s,f:()=>{JN().shift++;S.turnoCambio=S.day+1;try{MT().an-=1;}catch(e){}if(partner()&&Math.random()<.4){const p=partner();p.wear=Math.min(100,(p.wear||0)+4);p.wearWhy=DT.j_turno.why;}}},
      {t:O[1].t,s:O[1].s,f:()=>{S.rep=Math.max(0,(S.rep??70)-3);if(Math.random()<.3+(office().org||0)/200){tell(huecos(O[1].tell_ok,{jefe:jnBoss()}),'📅');office().org=Math.min(100,(office().org||0)+5);ex().exp.solid++;}else{S.turnoCambio=S.day+1;tell(huecos(O[1].tell_ko,{jefe:jnBoss()}),'📅');}}}];},
    auto:()=>comp()>=2?1:0},
  j_riesgo:{t:()=>DT.j_riesgo.t,x:()=>huecos(DT.j_riesgo.x,{tarea:pickR(DT.j_riesgo.tareas),jefe:jnBoss()}),
    o:()=>{const O=DT.j_riesgo.o;return [{t:O[0].t,s:O[0].s,f:()=>{if(Math.random()<.12){S.sick=3+(Math.random()*5|0);const H=typeof HP==='function'?HP():null;if(H&&!H.list.some(x=>x.k==='lumbar')&&Math.random()<.5)H.list.push({k:'lumbar',sev:1,since:S.day,dx:false});tell(huecos(O[0].tell,{dias:S.sick}),'🚑');S.rep=Math.max(0,(S.rep??70)-2);}else S.rep=Math.min(100,(S.rep??70)+1);}},
      {t:O[1].t,s:O[1].s,f:()=>{S.rep=Math.max(0,(S.rep??70)-5);if(S.union&&S.union.member||comp()>=2){office().org=Math.min(100,(office().org||0)+4);tell(huecos(O[1].tell_ok,{}),'✊');ex().exp.solid++;}else tell(huecos(O[1].tell_ko,{}),'⚠️');}}];},
    auto:()=>comp()>=2||S.union&&S.union.member?1:0},
  j_chivato:{t:()=>DT.j_chivato.t,x:()=>huecos(DT.j_chivato.x,{jefe:jnBoss()}),
    o:()=>{const O=DT.j_chivato.o;return [{t:O[0].t,s:O[0].s,f:()=>{office().org=Math.min(100,(office().org||0)+2);ex().exp.solid++;if(Math.random()<.3){S.rep=Math.max(0,(S.rep??70)-3);}}},
      {t:O[1].t,s:O[1].s,f:()=>{S.rep=Math.min(100,(S.rep??70)+8);const cp=P_('compi');if(cp){cp.rel=Math.max(0,cp.rel-35);}office().org=Math.max(0,(office().org||0)-10);ex().contra+=isLeft()?20:4;try{MT().an-=3;}catch(e){}tell(huecos(O[1].tell,{}),'📄');}},
      {t:O[2].t,s:O[2].s,f:()=>{S.rep=Math.max(0,(S.rep??70)-8);office().org=Math.min(100,(office().org||0)+8);S.pol.inf+=2;ex().exp.solid+=2;tell(huecos(O[2].tell,{}),'✊');}}];},
    auto:()=>comp()>=3?2:isLeft()?0:T('ambiciosa')?1:0},
});
Object.assign(DLG_CD,{j_hora:4,j_cliente:5,j_cubrir:9,j_turno:8,j_riesgo:10,j_chivato:30});
// a mitad de turno, algo pasa (una o dos cosas por semana, más donde más tóxico)
{const _up=update;update=function(gm){const r=_up.apply(this,arguments);try{const s=S.sim;if(s.work>0&&!s.outingActive&&!S.jobless&&S.lastWorkDay===S.day&&JN().lastDay!==S.day){const h=S.t/60;if(h>=SHIFT.start+1.5&&h<=SHIFT.end-1&&Math.random()<(.0012+TOX()*.002)*gm){JN().lastDay=S.day;const T0=TR();const cli=['super','hosteleria','reparto','cuidados'].includes(S.track);const phys=['obra','super','hosteleria','reparto'].includes(S.track);
      const pool=[['j_hora',T0.gig?0:1],['j_cliente',cli?1.2:.2],['j_cubrir',T0.gig||T0.self?0:.8],['j_turno',T0.gig||T0.self?0:.9],['j_riesgo',phys?.9:.1],['j_chivato',(office().org||0)>25&&!T0.self?.5:0]].filter(x=>x[1]>0);
      let tot=pool.reduce((a,b)=>a+b[1],0),x=Math.random()*tot;for(const [k,w] of pool){x-=w;if(x<=0){askDilemma(k);break;}}}}}catch(e){}return r;};}
// el cambio de turno de mañana: entra cuando diga el jefe
{const _lt=leaveTime;leaveTime=function(){const v=_lt.apply(this,arguments);try{if(S.turnoCambio===S.day)return v-2;}catch(e){}return v;};}
// perfil de trabajo: lo que la empresa se queda
{const _om=openMenu;openMenu=function(...a){const r=_om.apply(this,a);try{if(menuTab==='trabajo'){const J=JN();if((J.extra||J.cov||J.abuse||J.shift)&&!card.querySelector('#jnbox')){const d=document.createElement('div');d.id='jnbox';d.className='sub';d.style.cssText='font-size:12px;margin:4px 0 10px';d.innerHTML=huecos(TXHZ.jornada.resumen,{extra:J.extra,c:fmt(Math.round(J.extra*salary()/8)),cov:J.cov,abuse:J.abuse,shift:J.shift,said:J.said?huecos(TXHZ.jornada.dijo_no,{k:J.said}):''});const h3=card.querySelector('h3');if(h3)h3.after(d);else card.prepend(d);}}}catch(e){}return r;};}
