// =================== SOCIALISMO UTÓPICO: fundar una comunidad desde abajo, con cualquier gobierno. Lo mejor, lo peor, y semilla de las comunas ===================
const UT_K={
  vivienda:{e:'🏘️',n:'Comunidad de vivienda',d:'Cocina, lavadora y crianza compartidas con otras familias del bloque. Las facturas bajan; la intimidad también.',cuota:3},
  integral:{e:'🔄',n:'Cooperativa integral',d:'Caja común, economato propio y caja de resistencia. Lo que compráis juntas sale más barato; lo que falta se cubre entre todas.',cuota:5},
  rural:{e:'🌾',n:'Comuna rural',d:'Un huerto grande a las afueras, trabajo rotativo y comidas en común. Comida de sobra; queda lejos de todo.',cuota:2}};
const UT_NAMES=['La Colmena','El Brote','Nueva Armonía','La Esperanza','El Falansterio','Tierra y Libertad','La Comuna del Barrio','El Común'];
const UT=()=>S.ut||null;
function utFriends(){return (S.people||[]).filter(p=>p.k!=='madre'&&(p.rel||0)>=50).length;}
function utCanFound(){const why=[];if(utFriends()<2&&!(S.union&&S.union.member))why.push('hacen falta al menos dos personas de confianza (o estar en el sindicato)');if(S.money<hrs(20))why.push(`la aportación inicial: ${fmt(hrs(20))}`);return why;}
function utFound(k){const why=utCanFound();if(why.length){toast('Aún no: '+why.join(' · '));return;}const K=UT_K[k];bkAdd('Comunidad',-hrs(20));
  S.ut={k,name:pickR(UT_NAMES),members:3+(Math.random()*3|0),caja:hrs(20)*3,coh:65,since:S.day,weeks:0,tejido:0,free:0,last:null};const u=S.ut;const n=CH().name;
  chapter('ut'+S.day,u.name,`${n} y ${u.members-1} personas más han fundado «${u.name}», una ${K.n.toLowerCase()}. ${K.d} Nadie sabe si durará. Owen, Fourier y los kibutz tampoco lo sabían.`);if(typeof openMenu==='function')openMenu();}
function utLeave(){const u=UT();if(!u)return;const back=Math.round(Math.max(0,u.caja)/Math.max(1,u.members));bkAdd('Comunidad',back);tell(`${CH().name} ha dejado «${u.name}». Le devuelven ${fmt(back)} de la caja. Se lleva también lo aprendido.`,'🌱');S.ut=null;if(typeof openMenu==='function')openMenu();}
function utDissolve(why){const u=UT();if(!u)return;const back=Math.round(Math.max(0,u.caja)/Math.max(1,u.members));if(back)bkAdd('Comunidad',back);chapter('utfin'+S.day,'Se acabó «'+u.name+'»',`${why} Duró ${Math.max(1,u.weeks)} semanas. Lo que queda: ${fmt(back)} de la caja, algunas amistades y ganas de hacerlo mejor. New Harmony duró dos años.`);S.ut=null;}
// cada lunes: la cuota, lo que da, lo que cuesta
{const _ww=worldWeekly;worldWeekly=function(){const r=_ww.apply(this,arguments);try{utWeek();}catch(e){console.error(e);}return r;};}
function utWeek(){const u=UT();if(!u)return;const K=UT_K[u.k];const w=W_();const n=CH().name;u.weeks++;
  // la cuota
  const q=hrs(K.cuota);if(S.money>=q){bkAdd('Comunidad',-q);u.caja+=q;}else{u.coh-=3;tell(`${n} no ha podido poner la cuota esta semana. Nadie le dice nada, pero lo nota.`,'🌱');}
  u.caja+=Math.round(q*(u.members-1)*(w.crisis>60?.6:.9));
  // lo que da
  if(u.k==='rural'){S.pantry=(S.pantry||0)+4;if(typeof CM==='function')CM().desp=Math.min(30,CM().desp+3);}
  if(u.k==='vivienda'){S.needs.social=Math.min(100,S.needs.social+15);if((S.kids||[]).length)S.needs.energia=Math.min(100,S.needs.energia+10);}
  if(u.k==='integral'&&typeof CM==='function')CM().desp=Math.min(30,CM().desp+2);
  S.needs.social=Math.min(100,S.needs.social+6);if(typeof MT==='function')MT().an=Math.min(100,MT().an+2);
  // caja de resistencia
  if((S.jobless||S.money<0)&&u.caja>hrs(8)){const g=Math.min(u.caja*.25,hrs(u.k==='integral'?12:6));u.caja-=g;bkAdd('Comunidad',Math.round(g));u.coh+=2;if(Math.random()<.5)tell(`La caja de «${u.name}» le pasa ${fmt(Math.round(g))} esta semana. Nadie lleva la cuenta de quién debe a quién.`,'🫶');}
  // la cohesión: sube con la participación, baja con quien no aporta, la presión de fuera y si la fundadora se apaga
  let d=1.5;
  if(S.needs.energia<25||(typeof MT==='function'&&MT().dep)||S.jail>0){d-=4;if(Math.random()<.3)tell(`«${u.name}» depende demasiado de ${n}. Cuando ${n} no puede, las asambleas se cancelan y las tareas se quedan sin hacer.`,'🌱');}
  u.free=Math.min(10,u.free+(u.members>6?.4:.15));d-=u.free*.35;
  if(w.crisis>60)d-=1.5;if(w.era==='comunas'||w.era==='consejos')d+=2;if(w.gov==='conservador'&&w.mov<30)d-=.5;
  u.coh=Math.max(0,Math.min(100,u.coh+d));
  // crece si va bien
  if(u.coh>=70&&Math.random()<.25){u.members++;if(Math.random()<.4)tell(`Se une gente nueva a «${u.name}»: ya sois ${u.members}.`,'🌱');}
  if(u.coh<35&&u.members>3&&Math.random()<.3){u.members--;tell(`Alguien se va de «${u.name}»: «esto no es para mí». Sois ${u.members}.`,'🚪');}
  // tejido: semilla de las comunas
  if(u.coh>=60&&u.members>=8){u.tejido=Math.min(100,u.tejido+3);w.mov=Math.min(100,w.mov+.4);}
  if(u.tejido>=40&&!u.tj){u.tj=1;chapter('uttej'+S.day,'Tejido',`«${u.name}» ya no está sola: hay redes parecidas en otros barrios, se prestan herramientas y se cubren las cajas. Si un día todo se para, esto ya sabe funcionar.`);}
  // dilemas
  if(Math.random()<.35)utDilema();
  if(u.coh<=0)utDissolve('Las asambleas dejaron de convocarse. Las tareas se quedaron sin hacer. Un día alguien se llevó la lavadora común.');}
// la revolución, con tejido comunitario, tira hacia las comunas
{const _rd=revolutionDaily;revolutionDaily=function(){const before=W_().era;const r=_rd.apply(this,arguments);try{const u=UT();const w=W_();if(!before&&w.era==='consejos'&&u&&u.tejido>=40){w.era='comunas';w.gov='comunas';tell(`Donde ya había comunidades funcionando, nadie esperó órdenes: se federaron. «${u.name}» es una de ellas. Comunas, no consejos.`,'🏴');}}catch(e){}return r;};}
// los dilemas de verdad
const UT_DIL=[
  {t:u=>`Una socia de «${u.name}» no aporta desde hace un mes. Dice que no puede; otros dicen que no quiere.`,o:[['Hablarlo en asamblea',u=>{u.coh+=3;u.free=Math.max(0,u.free-2);return 'Se habló. Dolió. Ahora aporta lo que puede y se le cree.';}],['Expulsarla',u=>{u.members=Math.max(2,u.members-1);u.coh-=6;u.free=Math.max(0,u.free-3);return 'Se fue. Las cuentas cuadran; el ambiente, no.';}],['Dejarlo estar',u=>{u.free+=1.5;u.coh-=2;return 'Nadie dijo nada. Ahora son dos los que no aportan.';}]]},
  {t:u=>`Un supermercado del barrio ofrece a «${u.name}» vender sus productos en su cadena. Dinero de verdad, pero con sus precios y sus plazos.`,o:[['Aceptar',u=>{u.caja+=hrs(30);u.coh-=5;return 'Entra dinero. Las tareas ahora las marca el supermercado, no la asamblea.';}],['Rechazar',u=>{u.coh+=3;return 'Seguís pequeñas y vuestras. La caja, justa.';}]]},
  {t:u=>`Las tareas pesadas siempre las hacen los mismos. Fourier proponía rotarlo todo, incluso lo que nadie quiere.`,o:[['Turnos rotativos para todo',u=>{u.coh+=5;S.needs.energia=Math.max(0,S.needs.energia-15);return `Esta semana a ${CH().name} le ha tocado la fosa séptica. Mañana, la contabilidad.`;}],['Pagar más a quien hace lo duro',u=>{u.caja-=hrs(6);u.coh+=1;return 'Funciona, pero alguien pregunta en qué se diferencia esto de una empresa.';}]]},
  {t:u=>`La gente quiere que ${CH().name} coordine «${u.name}». Es más fácil… y más peligroso.`,o:[['Aceptar',u=>{u.coh+=4;u.lead=1;return 'Todo va más rápido. Y todo pasa por su móvil.';}],['Rotar la coordinación',u=>{u.coh+=1;u.lead=0;return 'Más lento. Pero si un día falta, esto sigue.';}]]},
  {t:u=>`Llega una inspección: «${u.name}» no encaja en ninguna figura legal. Multa o papeles.`,o:[['Constituirse como cooperativa',u=>{u.caja-=hrs(10);return 'Gestoría, estatutos, libro de actas. Ya existe para el Estado.';}],['Seguir informal',u=>{if(Math.random()<.5){u.caja-=hrs(20);return 'Multa. La caja lo cubre; el miedo se queda.';}return 'Esta vez no vuelven. Esta vez.';}]]}];
let utEl=null;
function utDilema(){const u=UT();if(!u)return;const D=pickR(UT_DIL);if(!utEl){utEl=document.createElement('div');utEl.id='utsheet';document.body.appendChild(utEl);}
  utEl.innerHTML=`<div class="omt">🌱 ${u.name}</div><div class="sub" style="padding:4px 8px 8px;font-size:13px">${D.t(u)}</div><div style="display:flex;flex-direction:column;gap:6px;padding:4px 6px">${D.o.map((o,i)=>`<button class="btn${i?' grey':''}" data-utd="${i}">${o[0]}</button>`).join('')}</div>`;
  utEl.classList.add('on');utEl.querySelectorAll('[data-utd]').forEach(b=>b.onclick=()=>{const t=D.o[+b.dataset.utd][1](u);u.coh=Math.max(0,Math.min(100,u.coh));utEl.classList.remove('on');tell(t,'🌱');});}
// en Vida
{const _vt=vidaTab;vidaTab=function(){let h=_vt.apply(this,arguments);try{const u=UT();let x='<h3>🌱 Comunidad</h3>';
  if(!u){const why=utCanFound();x+=`<div class="sub" style="font-size:12px">Montar algo distinto sin esperar a que cambie el gobierno: compartir casa, caja y trabajo. Lo mejor: seguridad y sentido aunque fuera todo vaya mal. Lo peor: conflictos, gente que no aporta, el mercado de alrededor apretando y depender de quien lo fundó.</div>`;
    for(const k in UT_K){const K=UT_K[k];x+=`<div class="hopt"><div><b>${K.e} ${K.n}</b> <small>cuota ${fmt(hrs(K.cuota))}/semana</small><div class="sub" style="font-size:11px">${K.d}</div></div><button class="mini" data-utf="${k}"${why.length?' style="opacity:.45"':''}>Fundar</button></div>`;}
    if(why.length)x+=`<div class="sub" style="font-size:11px;color:#c0392b">Falta: ${why.join(' · ')}</div>`;}
  else{const K=UT_K[u.k];const bar=(v,col)=>`<div class="bar"><i style="width:${Math.round(v)}%;background:${col}"></i></div>`;
    x+=`<div class="kv"><span>${K.e} «${u.name}»</span><span>${u.members} personas · ${u.weeks} semanas</span></div><div class="skill"><span class="lbl">🤝 Cohesión</span>${bar(u.coh,u.coh<35?'#c0392b':'#2e8b57')}<span class="lv">${Math.round(u.coh)}</span></div><div class="kv"><span>Caja común</span><span>${fmt(Math.round(u.caja))}</span></div>${u.tejido?`<div class="skill"><span class="lbl">🕸️ Tejido</span>${bar(u.tejido,'#7a4fa0')}<span class="lv">${Math.round(u.tejido)}</span></div>`:''}`;
    x+=`<div style="display:flex;gap:6px"><button class="btn" id="utmas">💶 Aportar ${fmt(hrs(5))}</button><button class="btn grey" id="utleave">Dejarla</button></div><div class="sub" style="font-size:11px">${u.coh<35?'Se está deshaciendo. Hace falta gente y asambleas.':u.tejido>=40?'Ya hay red en otros barrios: si llega la ruptura, esto tirará hacia las comunas.':'Con 8 o más personas y buena cohesión, empieza a tejer red con otros barrios.'}</div>`;}
  h=h.replace('<h3>🌍 El mundo</h3>',x+'<h3>🌍 El mundo</h3>');}catch(e){}return h;};}
document.addEventListener('click',ev=>{const t=ev.target.closest&&ev.target.closest('[data-utf],#utmas,#utleave');if(!t)return;ev.stopPropagation();
  if(t.dataset.utf)utFound(t.dataset.utf);else if(t.id==='utleave')utLeave();else{const u=UT();if(u&&S.money>=hrs(5)){bkAdd('Comunidad',-hrs(5));u.caja+=hrs(5);u.coh=Math.min(100,u.coh+2);toast('Aportado a la caja común');if(typeof openMenu==='function')openMenu();}}},true);
// las facturas, compartidas en la comunidad de vivienda; la compra, más barata en la integral
{const _pu=payUtilities;payUtilities=function(){const u=UT();if(!u||u.k!=='vivienda')return _pu.apply(this,arguments);const m0=S.money;const r=_pu.apply(this,arguments);const paid=m0-S.money;if(paid>0)bkAdd('Comunidad',Math.round(paid*.25));return r;};}
{const _gf=govFood;govFood=function(){const u=UT();return _gf()*(u&&u.k==='integral'?.85:1);};}
if(typeof BK_CAT!=='undefined')BK_CAT['Comunidad']='familia';
