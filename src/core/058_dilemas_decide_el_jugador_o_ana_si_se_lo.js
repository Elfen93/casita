// ---------- dilemas: decide el jugador (o Ana, si se lo deja) ----------
const DLG={
  ideo:{t:d=>`${IDEOS[d.to].e} Ana duda`,x:d=>`Ha sido ${topWhy(d.to)}. Cada vez se reconoce menos en lo que ${S.ideo==='apolitica'?'pensaba (o no pensaba)':'defendía como '+IDEOS[S.ideo].n.toLowerCase()}, y se siente más cerca de lo ${IDEOS[d.to].n.toLowerCase()}.`,
    o:d=>[{t:`Dejarse llevar: ahora es ${IDEOS[d.to].n.toLowerCase()}`,f:()=>changeIdeo(d.to)},{t:'Mantenerse firme',s:'La duda seguirá ahí, y volverá.',f:()=>{const c=ex();c.drift[d.to]*=.55;c.drift[S.ideo]=(c.drift[S.ideo]||0)+30;tell('Ana ha decidido no cambiar de ideas. Le ha costado; nadie dijo que fuera fácil.','🪨');}}],
    auto:d=>Math.random()<.6?0:1},
  crisis:{t:d=>'💔 Crisis de pareja',x:d=>{const p=P_(d.p);return p?`Ana y ${p.n} están en su peor momento. ${p.wearWhy?'Sobre todo por '+p.wearWhy+'.':''} Cada conversación acaba en reproche.`:'';},
    o:d=>{const p=P_(d.p);if(!p)return [{t:'Seguir',f:()=>{}}];const cost=Math.round(60*PM());return [
      {t:'Sentarse a hablarlo de verdad',s:'Depende del carisma… y de que el problema tenga arreglo.',f:()=>{const ok=Math.random()<.35+lvl('carisma')*.06-(p.hid.includes('mentirosa')?.2:0);if(ok){p.wear=Math.max(0,p.wear-35);p.love=Math.min(100,p.love+8);tell(`Ana y ${p.n} hablaron hasta las tres de la mañana. Lloraron, se rieron y se prometieron cosas concretas.`,'🕯️');}else{p.wear=Math.min(100,p.wear+8);tell(`Intentaron hablarlo. Acabó peor que empezó.`,'🥀');}}},
      {t:`Ir a terapia de pareja (${fmt(cost)}/semana, 4 semanas)`,ok:()=>S.money>=cost,f:()=>{for(let i=1;i<=4;i++)schedule(i*7,'terapia',{p:p.k,cost});tell(`Ana y ${p.n} han pedido cita con una terapeuta. Primera sesión el martes.`,'🛋️');}},
      {t:'Dejarlo',f:()=>{breakUp(p,p.wearWhy||'el desgaste');ex().exp.loss++;}},
      {t:'Aguantar y no tocar el tema',s:'El silencio también desgasta.',f:()=>{schedule(14,'silencio',{p:p.k});}}];},
    auto:d=>{const p=P_(d.p);return !p?0:T('genio')?2:lvl('carisma')>=4?0:S.money>500?1:3;}},
  contra:{t:d=>'⚖️ Contradicción',x:d=>({mando:`Ana es ${CLASSN.mando}. Ahora le toca repartir los turnos malos y transmitir los recortes. Con sus ideas, se le hace bola: por las noches no duerme.`,
      patrona:`Ana tiene gente a su cargo en su negocio. Les paga lo que el negocio aguanta, que no es lo que ella cree justo. Se ha convertido en lo que antes criticaba.`,
      rentista:'Ana cobra un alquiler a otra trabajadora. Lo mismo que antes le parecía un robo, ahora le cuadra las cuentas.',
      parada:'Ana vive de la prestación por desempleo, esa que siempre dijo que no debería existir.'}[d.cl]||'Lo que vive y lo que piensa ya no encajan.'),
    o:d=>{const c=ex();if(d.cl==='mando')return [
      {t:'Renunciar al cargo y volver a la base',s:'Menos sueldo; sus compañeras no lo olvidarán.',f:()=>{S.career=Math.max(0,S.career-1);c.contra=0;S.pol.inf+=5;const cp=P_('compi');if(cp)cp.rel=Math.min(100,cp.rel+20);chapter('renuncia','La renuncia',`Ana ha devuelto el cargo. «No estoy para apretar a mis compañeras». Gana menos y duerme mejor.`);c.exp.solid++;}},
      {t:'Usar el cargo para proteger a la plantilla',s:'Ayuda a organizar desde dentro. Si la pillan, la despiden.',f:()=>{S.ally=true;c.contra=25;office().org=Math.min(100,office().org+15);schedule(18+Math.random()*25,'topo',{});tell('Ana avisa de los despidos antes de que lleguen y reparte los turnos con justicia. La dirección todavía no sospecha.','🕵️');}},
      {t:'Aceptar que las cosas han cambiado',s:'Se acomoda. Sus ideas, también.',f:()=>{c.contra=0;pushI('liberal',60,'ascenso');pushI('socialdemocrata',30,'ascenso');remember('Se acomodó en su puesto de mando.');}}];
      if(d.cl==='patrona')return [
      {t:'Subir los sueldos aunque gane menos',f:()=>{S.payMul=(S.payMul||1)*.85;c.contra=10;c.exp.solid++;tell('Ana ha subido el sueldo a su gente. Este mes ella cobra menos que ellos.','🤝');}},
      {t:'Convertir el negocio en cooperativa',ok:()=>isLeft(),f:()=>{startTrack('coop',true);c.contra=0;chapter('coopconv','De patrona a socia',`Ana ha convertido su negocio en una cooperativa: ahora es una socia más, con un voto como todas.`);}},
      {t:'El mercado es el mercado',f:()=>{c.contra=0;pushI('liberal',70,'dinero');pushI('libertaria',30,'dinero');schedule(30+Math.random()*30,'sindican',{});}}];
      if(d.cl==='rentista')return [{t:'Bajar el alquiler a precio social',f:()=>{S.rentInc=(S.rentInc||0)*.6;c.contra=0;tell('Ana ha bajado el alquiler a su inquilina. Ganará menos, pero no pensará en ello cada día.','🏘️');}},{t:'Precio de mercado',f:()=>{c.contra=0;pushI('liberal',60,'vivienda');}}];
      return [{t:'Necesita ese dinero y punto',f:()=>{c.contra=0;pushI('socialdemocrata',40,'pobreza');}},{t:'Avergonzarse en silencio',f:()=>{c.contra=20;S.needs.diversion=Math.max(0,S.needs.diversion-20);}}];},
    auto:d=>{if(d.cl==='mando')return comp()>=3?0:isI('socialdemocrata')||comp()===1?2:1;if(d.cl==='patrona')return comp()>=3&&isLeft()?1:isLeft()?0:2;return 0;}},
  ascenso:{t:()=>'📈 Te ofrecen mandar',x:()=>`Le ofrecen ser ${(CAREER[S.career]||{}).t}. Más sueldo, más responsabilidad… y ahora será quien aplique las órdenes de arriba a sus compañeras.`,
    o:()=>[{t:'Aceptar el puesto',f:()=>{remember('Aceptó un puesto de mando.');}},{t:'Rechazarlo y seguir con los suyos',s:'Menos dinero; más confianza en la plantilla.',f:()=>{S.career=Math.max(0,S.career-1);S.pol.inf+=4;office().org=Math.min(100,office().org+8);const cp=P_('compi');if(cp)cp.rel=Math.min(100,cp.rel+12);tell('Ana ha rechazado el ascenso. En el descanso, alguien le ha dejado un café pagado.','☕');ex().exp.solid++;}}],
    auto:()=>isLeft()&&comp()>=2?1:0},
  despedir:{t:()=>'✂️ Señala a dos',x:()=>`La dirección quiere «ajustar la plantilla» y le pide a Ana, como ${L((CAREER[S.career]||{}).t).toLowerCase()}, que señale a dos personas para despedir antes del viernes.`,
    o:()=>[{t:'Cumplir la orden',s:'La empresa lo valorará.',f:()=>{S.rep=Math.min(100,(S.rep??70)+10);const cp=P_('compi');if(cp)cp.rel=Math.max(0,cp.rel-30);ex().contra+=isLeft()?25:5;pushI('liberal',25,'ascenso');schedule(12+Math.random()*10,'vacio',{});tell('Ana entregó dos nombres. Esa noche no cenó.','📄');}},
      {t:'Negarse',s:'Puede haber represalias.',f:()=>{S.rep=Math.max(0,(S.rep??70)-15);schedule(8+Math.random()*12,'represalia',{});tell('Ana se ha negado: «eso hacedlo vosotros». La directora ha apuntado algo en su libreta.','🙅');}},
      {t:'Avisar en secreto al sindicato',s:'Organiza la respuesta. Si se descubre, despido.',f:()=>{const o=office();o.org=Math.min(100,o.org+20);o.griev=Math.min(100,(o.griev||0)+25);S.pol.inf+=4;schedule(15+Math.random()*20,'filtracion',{});ex().exp.solid++;tell('Ana ha pasado la lista al sindicato. Al día siguiente había un cartel en el comedor: «Si tocan a una, nos tocan a todas».','📣');}}],
    auto:()=>isLeft()&&comp()>=2?2:isLeft()?1:0},
  piquete:{t:()=>'🪧 Huelga en el trabajo',x:()=>`La plantilla ha convocado huelga. Hacerla significa perder ${fmt(salary())} cada día${S.money<salary()*3?' y Ana ya va justa':''}. No hacerla significa cruzar el piquete delante de sus compañeras.`,
    o:()=>[{t:'Secundar la huelga',f:()=>{if(S.strike)S.strike.join=true;ex().exp.solid++;remember('Hizo la huelga.');}},{t:'Ir a trabajar',s:'Las compañeras se acordarán.',f:()=>{if(S.strike)S.strike.join=false;S.scab=S.day;schedule(10+Math.random()*10,'esquirol',{});pushI(isLeft()?'apolitica':'liberal',10,'huelga');}}],
    auto:()=>Math.random()<ID().strike?0:1},
  prestamo:{t:()=>'💸 No llega',x:d=>{const p=P_(d.p);return `La cuenta está en números rojos. ${p?p.n+' se ofrece a prestarle '+fmt(d.m)+'.':''} También hay una financiera que da microcréditos en el acto.`;},
    o:d=>{const p=P_(d.p);return [{t:`Aceptar el préstamo de ${p?p.n:'su amistad'}`,ok:()=>!!p,f:()=>{S.money+=d.m;bumpMoney&&bumpMoney();schedule(30,'devolver',{p:d.p,m:d.m});tell(`${p.n} le ha prestado ${fmt(d.m)}. «Cuando puedas». Ana ha apuntado la fecha en el calendario.`,'🤝');}},
      {t:`Microcrédito al 30 % (${fmt(d.m)})`,s:'Rápido y caro.',f:()=>{S.money+=d.m;bumpMoney&&bumpMoney();for(let i=1;i<=6;i++)schedule(i*7,'cuota',{m:Math.round(d.m*1.3/6)});tell('Microcrédito concedido en dos minutos. Las condiciones estaban en letra de seis puntos.','📲');}},
      {t:'Apretarse el cinturón',s:'Comer peor, no salir, aguantar.',f:()=>{S.needs.diversion=Math.max(0,S.needs.diversion-25);ex().exp.stress++;S.cutBelt=S.day+14;}}];},
    auto:d=>P_(d.p)&&!T('desconfiada')&&!ex().cq.some(q=>q.k==='devolver')?0:S.money<-WP()*.5?1:2},
  militancia:{t:d=>{const p=P_(d.p);return `💬 ${p?p.n:''} quiere que lo dejes`;},x:d=>{const p=P_(d.p);return p?`${p.n} le ha dicho a Ana que no aguanta más: reuniones, asambleas, piquetes. «O la militancia o yo». Lo dice en serio.`:'';},
    o:d=>{const p=P_(d.p);if(!p)return [{t:'Vale',f:()=>{}}];return [{t:'Dejar la militancia',s:'Gana tiempo en casa. Pierde algo de sí misma.',f:()=>{S.pol.comp=1;p.wear=Math.max(0,p.wear-30);p.love=Math.min(100,p.love+8);schedule(40,'arrepentimiento',{});tell(`Ana ha dejado la militancia por ${p.n}. Ha borrado el grupo de la asamblea del móvil. Le temblaba el dedo.`,'📵');}},
      {t:'Seguir militando',s:'La relación sufrirá.',f:()=>{p.wear=Math.min(100,(p.wear||0)+20);tell(`Ana ha dicho que no. «No me pidas que deje de ser yo». ${p.n} se ha ido a dormir sin decir nada.`,'✊');}},
      {t:`Proponerle que venga a una asamblea`,s:'Puede que cambie de idea… o que se ría de ella.',f:()=>{const ch=p.ideo==='apolitica'||LEFT.includes(p.ideo)||(p.hid||[]).includes('conciencia')?.55:.12;if(Math.random()<ch){p.ideo=S.ideo;p.wear=Math.max(0,p.wear-35);chapter('convence_'+p.k,'Juntas',`${p.n} fue a la asamblea «solo para ver». Ahora tiene su propio carné.`.replace('Juntas',p.g==='m'?'Juntos':'Juntas'));}else{p.wear=Math.min(100,p.wear+8);tell(`${p.n} aguantó media asamblea y se fue. «Esto es una secta».`,'🙄');}}}];},
    auto:d=>comp()>=3?1:2}};
const DLG_CD={ascenso:40,prestamo:28,crisis:21,militancia:30,despedir:30,contra:20,ideo:14};
function askDilemma(id,data){const c=ex();if(c.dq.length>=3||c.dq.some(x=>x.id===id)||(c.dlg&&c.dlg.id===id))return;const cd=DLG_CD[id];if(cd&&c.cool&&c.cool[id]!=null&&S.day-c.cool[id]<cd)return;c.dq.push({id,data:data||{},d:S.day});}
function resolveDlg(i){const c=ex(),d=c.dlg;if(!d)return;c.cool=c.cool||{};c.cool[d.id]=S.day;const D=DLG[d.id];const opts=D.o(d.data);const o=opts[i];c.dlg=null;hideDlg();if(o&&(!o.ok||o.ok())){try{o.f();}catch(e){console.error(e);}remember(`Decidió: ${o.t}.`);}
  try{save();}catch(e){}}
function dlgTick(){const c=ex();if(c.dlg||!c.dq.length)return;const d=c.dq.shift();const D=DLG[d.id];if(!D)return;
  if(c.dmode==='ana'){const opts=D.o(d.data);let i=D.auto(d.data);if(opts[i]&&opts[i].ok&&!opts[i].ok())i=opts.findIndex(o=>!o.ok||o.ok());const o=opts[i];if(o){try{o.f();}catch(e){console.error(e);}tell(`${D.t(d.data)} — Ana ha decidido: ${o.t.charAt(0).toLowerCase()+o.t.slice(1)}.`,'🧭');c.cool=c.cool||{};c.cool[d.id]=S.day;}return;}
  c.dlg=d;showDlg();}
const dlgBlocking=()=>!!(S&&S.cx&&S.cx.dlg&&S.cx.dmode!=='ana');
function showDlg(){const c=ex(),d=c.dlg;if(!d)return;const D=DLG[d.id];let el=document.getElementById('dlg');if(!el){el=document.createElement('div');el.id='dlg';document.body.appendChild(el);locEl(el);}
  const opts=D.o(d.data);
  el.innerHTML=`<div class="dlgc"><div class="dlgt">${D.t(d.data)}</div><div class="dlgx">${D.x(d.data)}</div>${opts.map((o,i)=>{const dis=o.ok&&!o.ok();return `<button class="dlgb"${dis?' disabled':''} data-i="${i}"><b>${o.t}</b>${o.s?`<small>${o.s}</small>`:''}</button>`;}).join('')}
  <div class="dlgf"><button class="mini" data-auto="1">🧭 Que decida Ana</button><label><input type="checkbox" id="dlgalways"> Que decida siempre</label></div></div>`;
  el.style.display='flex';
  el.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>resolveDlg(+b.dataset.i));
  el.querySelector('[data-auto]').onclick=()=>{if(el.querySelector('#dlgalways').checked)c.dmode='ana';let i=D.auto(d.data);if(opts[i]&&opts[i].ok&&!opts[i].ok())i=opts.findIndex(o=>!o.ok||o.ok());toast(`🧭 ${opts[i].t}`);resolveDlg(i);};
  sfx&&sfx('level');}
function hideDlg(){const el=document.getElementById('dlg');if(el)el.style.display='none';}

