// =================== CUERPO Y SALUD: peso, gimnasio, lo que el trabajo rompe, el médico (público con cola, privado con tarifa) ===================
const HP=()=>{if(!S.hp){const ch=S.char||{};const f=ch.g==='f';let base={delgada:f?54:63,media:f?64:76,ancha:f?80:92}[ch.build]||(f?64:76);let peso=base;if(ch.alt){const m=ch.alt/100;base=Math.round(22.5*m*m);peso=ch.peso0||ch.peso||base;}S.hp={base,peso,in:0,burn:0,gym:0,gymMonth:0,list:[],cita:0,mutua:false,hist:[],diet:false};}S.hp.list=S.hp.list||[];return S.hp;};
const ovw=()=>HP().peso-HP().base;
const gymFee=()=>hrs(HP().gymGood?9:3);
const hpHas=k=>HP().list.some(x=>x.k===k);
const HP_DEF={
  hiper:{n:'Hipertensión',e:'🩺',d:'Pastilla diaria de por vida. La tensión no avisa.',med:8,chronic:true},
  diab:{n:'Diabetes tipo 2',e:'💉',d:'Controles, dieta, medicación. Reversible si cambia la vida; la vida no siempre deja.',med:14,chronic:true},
  lumbar:{n:'Lumbalgia crónica',e:'🦴',d:'La espalda de quien carga, friega o está de pie ocho horas. Baja, rehabilitación, vuelta a lo mismo.',med:4,chronic:false},
  carpo:{n:'Túnel carpiano',e:'🖐️',d:'Ocho horas de ratón. Hormigueo de noche. Muñequera y, si no, cirugía.',med:3,chronic:false},
  vista:{n:'Vista cansada',e:'👓',d:'Pantallas. Gafas nuevas: eso no lo cubre la pública.',med:0,chronic:true},
  anemia:{n:'Anemia',e:'🩸',d:'Comer poco y mal durante meses. Mareos, frío, cansancio que no se va durmiendo.',med:3,chronic:false},
  ansiedad:{n:'Ansiedad',e:'🫀',d:'El corazón a mil sin motivo. Lo diagnostican en cinco minutos y recetan lo mismo a todo el barrio.',med:5,chronic:false},
};
// ---- ingesta: todo lo que sube el hambre cuenta; de dónde viene, también ----
{const _up=update;update=function(gm){const h0=S.needs.hambre;const r=_up.apply(this,arguments);try{const H=HP();const d=S.needs.hambre-h0;if(d>1){const u=S.sim.use;const src=S.sim.outingActive?(S.sim.outingActive==='comedor'?.9:1.3):u&&(u.type==='fogon'||u.type==='encimera')?(u.act==='sano'?.7:.9):u&&u.type==='nevera'?1.15:u&&u.type==='micro'?1.2:S.sim.work>0?(S.tapers!=null&&S.lastTaper===S.day?.9:1.25):1.1;H.in+=d*src*(H.diet?.85:1);}}catch(e){}return r;};}
// ---- gimnasio y calistenia ----
Object.assign(OUT,{
  gimnasio:{n:'Ir al gimnasio',e:'🏋️',dur:90,h:[6.5,22],why:'pesas, cinta, espejo',req:()=>!!HP().gymMember},
  calistenia:{n:'Barras del parque',e:'🤸',dur:60,h:[7,21],why:'dominadas con los del barrio, gratis'},
});
{const _oc=outCost;outCost=function(k){if(k==='gimnasio'||k==='calistenia')return 0;return _oc.apply(this,arguments);};}
{const _ob=outBack;outBack=function(k){const H=HP();const nd=S.needs;const add=(n,v)=>nd[n]=Math.max(0,Math.min(100,nd[n]+v));const n=CH().name;
  if(k==='gimnasio'){H.gym++;H.gymMonth++;H.burn+=H.gymGood?26:22;S.fit=Math.min(100,(S.fit||0)+(H.gymGood?7:6));if(H.gymGood)add('higiene',40);add('diversion',10);add('energia',-15);add('higiene',-30);add('social',6);if(hpHas('lumbar')&&Math.random()<.3){const x=H.list.find(q=>q.k==='lumbar');x.sev=Math.max(0,x.sev-1);}
    if(H.gym===1)tell(`Primer día de gimnasio. ${n} no sabe para qué sirve la mitad de las máquinas y le da vergüenza preguntar. Un chaval le ha enseñado la sentadilla sin que se lo pidiera.`,'🏋️');else if(Math.random()<.15)tell(pickR([`Gimnasio a las siete de la mañana: los que entran a las ocho. A las once: los que no trabajan o trabajan de noche.`,`${n} ha subido peso en press de banca. Nadie lo ha visto. Lo sabe ${oa()==='a'?'ella':'él'}.`,`El del gimnasio vende batidos. ${n} ha dicho que no. Tres veces.`,`Hoy ${n} ha ido al gimnasio solo para no estar en casa.`]),'🏋️');return;}
  if(k==='calistenia'){H.burn+=16;S.fit=Math.min(100,(S.fit||0)+4);add('diversion',12);add('energia',-12);add('higiene',-25);add('social',10);if(Math.random()<.2)tell(pickR([`Barras del parque. Hay un señor de sesenta que hace más dominadas que nadie y un chaval que graba vídeos.`,`${n} ha hecho tres dominadas. El mes pasado, una.`,`En las barras no hay cuota ni espejo. Hay gente.`]),'🤸');return;}
  const r=_ob.apply(this,arguments);if(k==='deporte')H.burn+=14;if(k==='beber')H.in+=18;if(k==='amigos'||k==='networking')H.in+=10;return r;};}
// ---- cada día: balance, peso, cuerpo que se rompe ----
{const _dl=dailyEvents;dailyEvents=function(){const r=_dl.apply(this,arguments);try{const H=HP();const n=CH().name;const tr=S.track;const phys=['obra','super','hosteleria','cuidados','reparto'].includes(tr)&&!S.jobless;const desk=['oficina','tech','funcion'].includes(tr)&&!S.jobless;
  const burn=82*(phys&&S.lastWorkDay===S.day?1.18:desk?.92:1)*(1+(S.fit||0)/500)+H.burn;const delta=(H.in-burn)*.0025;H.peso=Math.max(H.base-16,Math.min(H.base+45,H.peso+delta));H.hist.push(+H.peso.toFixed(1));if(H.hist.length>90)H.hist.shift();H.in=0;H.burn=0;
  // la forma se pierde sola
  if(typeof homeless==='function'&&homeless())H.peso-=.06;
  // apariencia: el cuerpo cambia de talla
  const ch=S.char;const o_=ovw();let want=ch?ch.build:'media';if(o_<=-7)want='delgada';else if(o_>=9)want='ancha';else if(ch&&ch.build==='delgada'&&o_>=4)want='media';else if(ch&&ch.build==='ancha'&&o_<=-4)want='media';if(ch&&ch.build!==want){ch.build=want;try{dirty();}catch(e){}tell(want==='ancha'?`${n} ha tenido que comprar pantalones de una talla más. ${phys?'Comer a deshoras en el curro y cenar lo que sea a las once.':'Ocho horas sentad'+oa()+' y la cena delante de la tele.'} No es falta de voluntad; es el horario.`:want==='delgada'?`A ${n} le baila la ropa. ${S.money<0||homeless&&homeless()?'Comer poco no es una dieta cuando no es una elección.':'Ha perdido peso. Le dicen que qué bien, sin preguntar por qué.'}`:`${n} ha vuelto a su talla de siempre.`,'🪞');}
  // avisos de ánimo por el cuerpo
  if(ovw()>=12&&Math.random()<.04){try{MT().an-=1.5;}catch(e){}tell(pickR([`En el trabajo alguien ha hecho un comentario sobre el peso de ${n}. En broma. Siempre es en broma.`,`${n} se ha mirado en el espejo del ascensor y ha apartado la vista.`,`Su madre, por teléfono: «¿te estás cuidando?».`]),'🪞');}
  // problemas de salud: riesgo diario según cuerpo y curro
  const add=(k,sev=1)=>{if(hpHas(k))return;H.list.push({k,sev,since:S.day,dx:false});};
  if(ovw()>=10&&Math.random()<.003+(ovw()-10)*.0004)add('hiper');
  if(ovw()>=18&&Math.random()<.002+(ovw()-18)*.0003)add('diab');
  if(ovw()<=-9&&Math.random()<.008)add('anemia');
  if(phys&&S.shifts>20&&Math.random()<.0025*(1-(S.fit||0)/160)*(ovw()>8?1.4:1))add('lumbar');
  if(desk&&S.shifts>30&&Math.random()<.002)add(Math.random()<.5?'carpo':'vista');
  try{if(MT().an<35&&Math.random()<.006)add('ansiedad');}catch(e){}
  // síntomas sin diagnóstico
  for(const x of H.list){if(x.dx)continue;const d=S.day-x.since;if(d===3||(d>3&&d%20===0)){const D=HP_DEF[x.k];tell({hiper:`${n} lleva días con dolor de cabeza por las mañanas. Lo achaca al curro.`,diab:`${n} tiene una sed rara, se levanta tres veces por la noche y está cansad${oa()} siempre. «Será la edad».`,lumbar:`A ${n} se le ha quedado la espalda al agacharse. Ha seguido trabajando, porque qué va a hacer.`,carpo:`${n} se despierta con la mano dormida. Se la sacude y sigue.`,vista:`${n} entrecierra los ojos para leer el móvil. Lo aleja. Lo acerca.`,anemia:`${n} se ha mareado al levantarse. Tiene frío a todas horas.`,ansiedad:`A ${n} se le acelera el corazón en el metro sin motivo. Se baja dos paradas antes.`}[x.k],'🤒');if(d>=20&&!H.cita&&Math.random()<.5)tell(`${n} debería ir al médico. Lleva semanas diciéndolo.`,'🩺');}
    // efectos
    if(x.k==='lumbar'||x.k==='anemia'||x.k==='diab')S.needs.energia=Math.max(0,S.needs.energia-(x.dx?2:4)*x.sev);
    if(x.k==='ansiedad'){try{MT().an-=x.dx?.3:.8;}catch(e){}}
    if(!x.dx&&(x.k==='lumbar'||x.k==='hiper'||x.k==='diab')&&Math.random()<.02*x.sev&&!S.sick){S.sick=2+(Math.random()*4|0);tell({lumbar:`${n} no se puede levantar de la cama. La espalda. Baja de ${S.sick} días; el médico de urgencias le ha dicho que «evite cargar peso». Trabaja cargando peso.`,hiper:`${n} se ha mareado en el trabajo. Le han tomado la tensión en la farmacia: alta. Dos días en casa.`,diab:`${n} se ha desmayado. En urgencias le han pedido una analítica. ${S.sick} días de baja.`}[x.k],'🚑');}
    if(x.dx&&HP_DEF[x.k].med&&dateOf(S.day).wd===0){const c=Math.round(HP_DEF[x.k].med/8*HW()*(H.mutua?.6:1));bkAdd('Farmacia',-c);}
    // mejora o empeora
    if(x.dx){if(x.k==='lumbar'&&(S.fit||0)>50&&Math.random()<.02){H.list.splice(H.list.indexOf(x),1);tell(`La espalda de ${n} ha dejado de doler. Rehabilitación, ejercicio y suerte. Hasta la próxima.`,'🦴');}
      if(x.k==='anemia'&&ovw()>-5&&Math.random()<.04){H.list.splice(H.list.indexOf(x),1);tell(`Analítica: la anemia de ${n} ha remitido. Comer. Era eso.`,'🩸');}
      if(x.k==='diab'&&ovw()<6&&Math.random()<.01){H.list.splice(H.list.indexOf(x),1);chapter('diabrev','Dar la vuelta',`La diabetes de ${n} ha remitido. Dos años de cambiar lo que come, de caminar, de decir que no. La endocrina lo llama «remisión», no cura. ${n} lo llama tiempo.`);}
      if(x.k==='carpo'&&Math.random()<.015){H.list.splice(H.list.indexOf(x),1);tell(`Operación del túnel carpiano. Tres semanas con la mano vendada; la empresa ha preguntado cuándo vuelve el primer día.`,'🖐️');S.sick=Math.max(S.sick||0,5);}
      if(x.k==='ansiedad'&&(MT().an>60)&&Math.random()<.03){H.list.splice(H.list.indexOf(x),1);tell(`${n} lleva semanas sin ataques de ansiedad. Ha dejado la pastilla poco a poco. ${MT().ther&&MT().ther.on?'La terapia ha hecho su parte.':''}`,'🫀');}}
    else{if(x.k==='anemia'&&ovw()>-4&&Math.random()<.04){H.list.splice(H.list.indexOf(x),1);tell(`${n} lleva días sin marearse. Comer como es debido; era eso.`,'🩸');}else if(Math.random()<.01)x.sev=Math.min(3,x.sev+1);}}
  // cita médica
  if(H.cita&&S.day>=H.cita){H.cita=0;hpVisit();}
  // cuotas
  if(dateOf(S.day).dm===1){if(H.gymMember){const c=gymFee();bkAdd('Gimnasio',-c);toast(`🏋️ Cuota del gimnasio: ${fmt(c)}`);if(H.gymMonth===0&&Math.random()<.5)tell(`Cuota del gimnasio: ${fmt(c)}. ${n} no ha ido ni un día este mes. El negocio del gimnasio es exactamente ese.`,'🏋️');H.gymMonth=0;}
    if(H.mutua){const c=hrs(6);bkAdd('Médico',-c);toast(`🏥 Seguro privado: ${fmt(c)}`);}}
  }catch(e){console.error(e);}return r;};}
// ---- el médico ----
function hpAsk(priv){const H=HP();const n=CH().name;if(H.cita){toast('Ya tiene cita');return;}const wait=priv||H.mutua?1+(Math.random()*2|0):5+(Math.random()*12|0);H.cita=S.day+wait;H.citaPriv=!!(priv||H.mutua);
  tell(priv||H.mutua?`Cita en la privada para ${wait===1?'mañana':'dentro de '+wait+' días'}. ${H.mutua?'La mutua lo cubre.':'Consulta: '+fmt(hrs(8))+'.'}`:`Cita en el centro de salud dentro de ${wait} días. «Si empeora, urgencias». ${n} ha mirado el calendario: le toca turno.`,'🩺');}
function hpVisit(){const H=HP();const n=CH().name;const priv=H.citaPriv;if(priv&&!H.mutua){S.money-=hrs(8);}
  const found=H.list.filter(x=>!x.dx);S.needs.energia-=5;
  if(!found.length){tell(priv?`La doctora privada ha pedido analítica completa, ecografía y «revisión en tres meses». ${fmt(hrs(8))} para decir que está bien.`:`Siete minutos de consulta. «Está bien. Duerma más». ${n} ha tardado ${H.citaWait||9} días para esto.`,'🩺');return;}
  for(const x of found){x.dx=true;const D=HP_DEF[x.k];
    if(x.k==='lumbar'||x.k==='hiper'||x.k==='diab'){S.sick=Math.max(S.sick||0,x.k==='lumbar'?5:2);}
    tell(`Diagnóstico: ${D.n}. ${D.d}${D.med?' Medicación: '+fmt(Math.round(D.med/8*HW()))+' a la semana'+(H.mutua?' (la mutua cubre parte)':' con receta de la pública')+'.':''}`,D.e);
    if(x.k==='diab'||x.k==='hiper')chapter('dx_'+x.k,D.n,`${n} tiene ${D.n.toLowerCase()}. ${x.k==='diab'?'Le han dado una hoja con lo que no puede comer y una pastilla que tomará siempre. La endocrina ha preguntado si cocina en casa. '+n+' ha pensado en el horario y no ha contestado.':'A los '+(S.char.age||30)+'. El médico ha hablado de estrés, de sal, de dormir. No ha hablado de turnos, ni de alquiler, ni de jefes.'} Las enfermedades crónicas tienen clase: las de arriba las revisan cada tres meses; las de abajo, cuando hay cita.`);
    if(x.k==='lumbar'&&!S.jobless&&['obra','super','hosteleria','cuidados'].includes(S.track))tell(`El médico ha escrito «evitar esfuerzos». ${n} le ha preguntado si eso lo firma para la empresa. Se ha reído. No ha dicho que no.`,'🦴');}
  if(priv&&found.length)tell(`En la privada la cita ha sido larga y han pedido pruebas. Lo que en la pública tarda meses, aquí se paga.`,'🏥');}
// ---- UI ----
function hpBlock(){const H=HP();const o=ovw();const st=o<=-9?'bajo peso':o<=-4?'delgad'+oa():o<8?'en su peso':o<16?'sobrepeso':'obesidad';
  let h=`<h3>🫀 Cuerpo</h3><div class="sub" style="font-size:12px">⚖️ ${H.peso.toFixed(1)} kg · ${st} · 🏃 forma ${Math.round(S.fit||0)}/100${H.gymMember?' · 🏋️ socio del gimnasio ('+H.gymMonth+' días este mes)':''}${H.mutua?' · 🏥 seguro privado':''}${H.diet?' · 🥗 cuidando lo que come':''}</div>`;
  if(H.list.length)h+=`<div class="sub" style="font-size:12px;color:#a04a3a">${H.list.map(x=>HP_DEF[x.k].e+' '+(x.dx?HP_DEF[x.k].n:'algo que no está bien ('+(S.day-x.since)+' días)')).join(' · ')}</div>`;
  h+=`<div style="display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 10px">`;
  if(!H.cita)h+=`<button class="btn grey" id="hpcita">🩺 Cita en la pública</button><button class="btn grey" id="hppriv">🏥 Privada (${fmt(hrs(8))})</button>`;else h+=`<span class="sub" style="font-size:12px">🩺 cita dentro de ${H.cita-S.day} días</span>`;
  h+=`<button class="btn grey" id="hpgym">${H.gymMember?'🏋️ Darse de baja del gym':'🏋️ Apuntarse al gimnasio ('+fmt(gymFee())+'/mes)'}</button>`;
  h+=`<button class="btn grey" id="hpmutua">${H.mutua?'🏥 Quitar el seguro privado':'🏥 Seguro privado ('+fmt(hrs(6))+'/mes)'}</button>`;
  h+=`<button class="btn grey" id="hpdiet">${H.diet?'🥗 Dejar de contar lo que come':'🥗 Cuidar lo que come'}</button></div>`;return h;}
{const _vt=vidaTab;vidaTab=function(){const h=_vt.apply(this,arguments);try{return hpBlock()+h;}catch(e){return h;}};}
{const _bs=bindSociety;bindSociety=function(){_bs.apply(this,arguments);const H=HP();const q=s=>card.querySelector(s);const re=()=>openMenu('vida');
  const a=q('#hpcita');if(a)a.onclick=()=>{hpAsk(false);re();};const b=q('#hppriv');if(b)b.onclick=()=>{if(S.money<hrs(8)){toast('No llega');return;}hpAsk(true);re();};
  const join=good=>{H.gymGood=good;if(S.money<gymFee()){toast('No llega');return;}H.gymMember=true;S.money-=gymFee();H.gymMonth=0;tell(good?`${CH().name} se ha apuntado a un gimnasio bueno: piscina, clases, toallas. ${fmt(gymFee())} al mes, que es lo que separa a quien se cuida de quien no puede.`:`${CH().name} se ha apuntado al gimnasio low cost. ${fmt(gymFee())} al mes, máquinas sin monitor, matrícula «gratis» y permanencia de un año en letra pequeña.`,'🏋️');re();};
  const g=q('#hpgym');if(g)g.onclick=()=>{if(H.gymMember){H.gymMember=false;tell(`${CH().name} se ha dado de baja del gimnasio. Han tardado tres llamadas y un burofax.`,'🏋️');re();}else join(false);};const g2=q('#hpgym2');if(g2)g2.onclick=()=>join(true);
  const m=q('#hpmutua');if(m)m.onclick=()=>{H.mutua=!H.mutua;if(H.mutua){S.money-=hrs(6);tell(`Seguro privado contratado. Citas en dos días, pruebas sin cola. ${fmt(hrs(6))} al mes que no todo el mundo tiene; por eso la pública tiene la cola que tiene.`,'🏥');}re();};
  const d=q('#hpdiet');if(d)d.onclick=()=>{H.diet=!H.diet;if(H.diet)tell(`${CH().name} va a intentar comer mejor. Más verdura, menos a deshoras. Cuesta más dinero y más tiempo, que es justo lo que no tiene.`,'🥗');re();};};}
// la IA: va al médico si lleva semanas mal; al gimnasio si es socia; a las barras si es deportista
{const _au=autonomy;autonomy=function(){try{const H=HP();const s=S.sim;const h=S.t/60;if(S.autoHome&&!(s.work>0)&&!s.leaving){
    if(!H.cita&&H.list.some(x=>!x.dx&&S.day-x.since>14)&&Math.random()<.02)hpAsk(S.money>1500&&!isLeft());
    if(S.outDay!==S.day&&Math.random()<.03){if(H.gymMember&&!outAvail('gimnasio')&&S.needs.energia>40){doOut('gimnasio');return;}if((T('deportista')||(S.fit||0)<30&&ovw()>8)&&!outAvail('calistenia')&&S.needs.energia>40&&Math.random()<.5){doOut('calistenia');return;}}
    if(!H.gymMember&&S.autoHome&&(T('deportista')||ovw()>10)&&S.money>hrs(60)&&Math.random()<.002){H.gymMember=true;S.money-=gymFee();tell(`${CH().name} se ha apuntado al gimnasio. Enero, como todo el mundo.`,'🏋️');}}}catch(e){}return _au.apply(this,arguments);};}
// perfil: peso en la ficha
{const _om=openMenu;openMenu=function(...a){const r=_om.apply(this,a);try{if(menuTab==='perfil'){const H=HP();const box=card.querySelector('#colbox');if(box&&!card.querySelector('#hpmini')){const d=document.createElement('div');d.id='hpmini';d.className='sub';d.style.cssText='font-size:12px;margin:-4px 0 10px';d.innerHTML=`⚖️ ${H.peso.toFixed(1)} kg · 🏃 forma ${Math.round(S.fit||0)}${H.list.filter(x=>x.dx).length?' · '+H.list.filter(x=>x.dx).map(x=>HP_DEF[x.k].e+' '+HP_DEF[x.k].n).join(', '):''}`;box.before(d);}}}catch(e){}return r;};}

// ---- creador: altura y peso ----
const bmiOf=(cm,kg)=>kg/((cm/100)**2);
const bmiTxt=b=>b<18.5?'bajo peso':b<25?'peso normal':b<30?'sobrepeso':'obesidad';
{const _rc=renderCreator;renderCreator=function(diff,edit){_rc(diff,edit);try{let anchor=[...card.querySelectorAll('.clab')].find(e=>/Estudios|Dónde vive/.test(e.textContent));if(!anchor){const ok=card.querySelector('#creok');anchor=ok;if(ok&&ok.parentElement!==card&&ok.parentElement.children.length<=3)anchor=ok.parentElement;}if(!anchor)return;const f=cre.g==='f';cre.alt=cre.alt||(edit&&S.char&&S.char.alt)||(f?165:177);cre.peso=cre.peso||(edit&&S.hp?Math.round(S.hp.peso):Math.round(22.5*(cre.alt/100)**2));const b=bmiOf(cre.alt,cre.peso);
    const box=document.createElement('div');box.innerHTML=`<div class="clab">Cuerpo</div><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:4px 0 2px"><label style="font-size:12.5px;font-weight:800">Altura <input type="number" id="cralt" min="140" max="210" value="${cre.alt}" style="width:58px;padding:5px;border-radius:8px;border:1px solid #e3dce8;font:inherit"> cm</label><label style="font-size:12.5px;font-weight:800">Peso <input type="number" id="crpeso" min="38" max="200" value="${cre.peso}" style="width:58px;padding:5px;border-radius:8px;border:1px solid #e3dce8;font:inherit"> kg</label></div><div class="sub" style="font-size:11.5px" id="crbmi">IMC ${b.toFixed(1)} · ${bmiTxt(b)}</div>`;
    anchor.before(box);const upd=()=>{const a=+box.querySelector('#cralt').value||cre.alt,w=+box.querySelector('#crpeso').value||cre.peso;cre.alt=Math.max(140,Math.min(210,a));cre.peso=Math.max(38,Math.min(200,w));const bb=bmiOf(cre.alt,cre.peso);box.querySelector('#crbmi').textContent=`IMC ${bb.toFixed(1)} · ${bmiTxt(bb)}`;cre.build=bb<19?'delgada':bb>=27?'ancha':'media';};
    box.querySelector('#cralt').oninput=upd;box.querySelector('#crpeso').oninput=upd;
    const ok=card.querySelector('#creok');if(ok&&edit)ok.addEventListener('click',()=>{try{if(S.char){S.char.alt=cre.alt;const H=HP();const m=cre.alt/100;H.base=Math.round(22.5*m*m);H.peso=cre.peso;H.hist=[];if(H.peso-H.base>-6)H.list=H.list.filter(x=>x.k!=='anemia'||x.dx);}}catch(e){}});}catch(e){console.error(e);}};}
{const _om=openMenu;openMenu=function(...a){const r=_om.apply(this,a);try{if(menuTab==='perfil'){const d=card.querySelector('#hpmini');if(d&&S.char&&S.char.alt){const H=HP();const b=bmiOf(S.char.alt,H.peso);d.innerHTML=`📏 ${(S.char.alt/100).toFixed(2)} m · ⚖️ ${H.peso.toFixed(1)} kg · IMC ${b.toFixed(1)} (${bmiTxt(b)}) · 🏃 forma ${Math.round(S.fit||0)}`+(H.list.filter(x=>x.dx).length?' · '+H.list.filter(x=>x.dx).map(x=>HP_DEF[x.k].e+' '+HP_DEF[x.k].n).join(', '):'');}}}catch(e){}return r;};}
