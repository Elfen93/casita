// =================== TEMPORADAS: la espina de la historia (60 días ≈ una hora de juego) ===================
// los avisos importantes también quedan escritos en la historia
{const _t=toast;toast=function(msg,gold){if(gold&&S&&S.story&&typeof msg==='string'&&!/^(📕|📅|💭|🎂|⭐|✅|🏡|🍻|🧭|📌|🏠 El casero cobró)/.test(msg)){const m=msg.match(/^(\p{Extended_Pictographic}️?)\s*(.*)$/su);const ic=m?m[1]:'📌',tx=(m?m[2]:msg).replace(/\s*·?\s*Míralo en 📋\.?$/,'');const st=storyState();const lt=L(tx);if(!st.log.some(e=>e.d===S.day&&e.txt===lt))tell(tx,ic);}return _t.apply(this,arguments);};}
// quién manda
const BOSSN={f:['Marisa','Begoña','Yolanda','Montse','Puri'],m:['Jesús','Ramón','Alberto','Fran','Ginés']};
const BOSST={oficina:['la directora','el director'],super:['la encargada','el encargado'],hosteleria:['la dueña','el dueño'],obra:['la capataz','el capataz'],cuidados:['la supervisora','el supervisor'],tech:['la CTO','el CTO'],funcion:['la jefa de servicio','el jefe de servicio'],reparto:['la app','la app'],arte:['la dueña de la sala','el dueño de la sala']};
function boss(){const o=office();if(!o.boss){const g=Math.random()<.5?'f':'m';o.boss={n:pickR(BOSSN[g]),g};}return o.boss;}
const bossT=()=>{const b=boss();const t=(BOSST[S.track]||['la jefa','el jefe'])[b.g==='f'?0:1];return S.track==='reparto'?'la app':`${t}, ${b.n},`;};
const bossS=()=>S.track==='reparto'?'la app':boss().n;
const compiN=()=>{const c=P_('compi');return c?c.n:'una compañera';};
const weekPay=()=>Math.round(salary()*TR().days.length);
const WP=()=>Math.max(150,weekPay());
const cap=t=>t.charAt(0).toUpperCase()+t.slice(1);
// ---------- estado de la temporada ----------
function TM(){if(!S.tmp){S.tmp=newSeason(1,S.day||1);if((S.day||1)>5){S.tmp.done.primer=S.day;S.tmp.done.semana=S.day;}}return S.tmp;}
function newSeason(n,start){const j=(a,b)=>a+Math.floor(Math.random()*(b-a+1));return {n,start,beats:{primer:2,semana:8,incidente:j(11,14),golpe:j(19,24),encrucijada:j(30,35),personal:j(41,46),eco:j(50,54),epilogo:60},done:{},choices:[],used:S.tmp?S.tmp.used:{},money0:Math.round(S.money),career0:S.career,track0:S.track,ideo0:S.ideo,jobless0:!!S.jobless};}
function useVar(key,list){const u=TM().used;u[key]=u[key]||[];let c=list.filter(v=>!u[key].includes(v.id));if(!c.length){u[key]=[];c=list;}const v=pickR(c);u[key].push(v.id);return v;}
function chose(txt){TM().choices.push(txt);}
function seasonDaily(){const t=TM();const d=S.day-t.start+1;
  for(const [k,at] of Object.entries(t.beats)){if(t.done[k]||d<at)continue;t.done[k]=S.day;try{BEATS[k]();}catch(e){console.error('beat',k,e);}break;}}
// ---------- hitos ----------
const BEATS={
  primer(){if(TM().n>1||S.jobless)return;const tx=TOX(),b=bossT(),c=compiN();let x;
    if(TR().self)x=`Primera venta en ${office().n}. ${fmt(Math.round(WP()*.03))}. Ana se ha quedado mirando el ticket como si fuera un diploma. Luego ha hecho cuentas: hacen falta cuarenta como ese cada día.`;
    else if(TR().coop)x=`Asamblea de bienvenida en ${office().n}. Nadie le ha dicho qué hacer: le han preguntado qué sabe hacer. Ha tardado en contestar; no estaba acostumbrada.`;
    else if(S.track==='reparto')x=`Primer día con la mochila. La app le ha dado nueve pedidos, una tormenta y una valoración de tres estrellas por «tardar». Ha ganado ${fmt(Math.round(salary()*.8))} y se ha pagado la gasolina.`;
    else if(tx>.6)x=`Primer día de verdad en ${office().n}. Nadie le ha explicado nada. A las ${SHIFT.end}:00 ha recogido y ${b} le ha dicho sin mirarla: «aquí se sale cuando se acaba». ${c} le ha hecho un gesto: ya te acostumbras.`;
    else if(tx>.35)x=`Primer día de verdad en ${office().n}. ${c} le ha enseñado dónde está todo y a quién no conviene llevar la contraria. ${cap(b)} parece normal. «Parece», ha dicho ${c}.`;
    else x=`Primer día de verdad en ${office().n}. ${cap(b)} se ha presentado y le ha preguntado si necesitaba algo. ${c} le ha dicho que aquí se está bien, «dentro de lo que cabe».`;
    chapter('primer_dia','El primer día de verdad',x.replace('mirarla',ga('mirarla','mirarlo','mirarle')));},
  semana(){const r=weeklyRent(),p=S.jobless?0:weekPay();const left=Math.round(S.money);
    let x=`Primera semana. ${S.jobless?'Sin trabajo todavía':'Ha cobrado '+fmt(p)}; el alquiler se lleva ${fmt(r)}. Quedan ${fmt(left)} para comer, la luz y lo que surja.`;
    x+=left<r*1.5?' Si pasa cualquier cosa, no hay colchón.':left<r*4?' Llega, pero sin alegrías.':' Por ahora, respira.';
    if(!S.jobless&&r>p*.45)x+=` Casi la mitad de lo que gana se va a la casa. Alguien cobra ese alquiler sin trabajar una hora.`;
    tell(x,'🧾');},
  incidente(){if(S.jobless){tell('Semana de currículos. Tres respuestas automáticas y un «ya te llamaremos».','📭');return;}
    const V=INCID[TR().self?'negocio':TR().coop?'coop':S.track]||INCID.oficina;const v=useVar('inc',V);askDilemma('incidente',{v:v.id});},
  golpe(){const V=GOLPES.filter(g=>!g.c||g.c());const v=useVar('golpe',V);const m=Math.round(v.m()*PM());askDilemma('golpe',{v:v.id,m});},
  encrucijada(){let id;const o=S.jobless?null:office();
    if(S.jobless)id='entrevista';else if(TR().self||TR().coop)id='cliente';else if((o.org>=25||(S.union&&S.union.member)||(isLeft()&&comp()>=2))&&!(S.strike&&S.strike.on))id='asamblea';else if((S.rep??70)>=62&&S.career+1<CAREER.length&&!TR().gig)id='envenenado';else id='oferta';
    askDilemma(id,{});},
  personal(){const V=PERSONAL.filter(p=>!p.c||p.c());const v=useVar('pers',V);askDilemma('personal',{v:v.id});},
  eco(){const t=TM();const c=t.choices;if(!c.length)return;tell(`Ana repasa estos dos meses: ${c.slice(-3).map(x=>x.toLowerCase()).join('; ')}. ${pickR(['No sabe si volvería a hacer lo mismo.','Lo volvería a hacer.','Cada cosa le ha costado algo.'])}`,'🪞');},
  epilogo(){const t=TM();const dm=Math.round(S.money)-t.money0;const same=S.track===t.track0&&S.career===t.career0&&!S.jobless&&!t.jobless0;
    const near=[...(S.people||[])].filter(p=>p.stage!=='ex').sort((a,b)=>closeTo(b)-closeTo(a)).slice(0,2).map(p=>p.n);
    let x=`Han pasado dos meses. ${dm>=0?'Tiene '+fmt(dm)+' más que al empezar':'Tiene '+fmt(-dm)+' menos que al empezar'}. `;
    x+=S.jobless?'Está sin trabajo. ':same?`Sigue de ${L(CAREER[S.career].t).toLowerCase()} en ${office().n}. `:`Ahora es ${L(CAREER[S.career].t).toLowerCase()}${S.office?' en '+office().n:''}. `;
    if(S.ideo!==t.ideo0)x+=`Ya no piensa como antes: se siente ${IDEOS[S.ideo].n.toLowerCase()}. `;
    if(near.length)x+=`Si algo se tuerce, llamará a ${near.join(' o a ')}. `;
    if(t.choices.length)x+=`Decidió: ${t.choices.slice(-4).map(c=>c.toLowerCase()).join('; ')}. `;
    x+=same&&dm<=0?'Sesenta días de trabajo para estar donde estaba. La diferencia se la ha quedado alguien.':ex().exp.win>0?'Ha ganado alguna. Sabe que se puede.':dm>weeklyRent()*3?'Ha ahorrado. Ya veremos cuánto dura.':'Sigue en pie. Que no es poco.';
    chapter('temporada_'+t.n,`Temporada ${t.n}: dos meses`,x);
    const w=W_();w.crisis=Math.min(100,w.crisis+(Dm().soul?8:4));S.tmp=newSeason(t.n+1,S.day+1);toast(`📖 Empieza la temporada ${t.n+1}`,true);}};
// ---------- el incidente: variantes por oficio ----------
const INCID={
  super:[{id:'horas',x:()=>`A las ${SHIFT.end}:00, ${bossT()} le dice que se quede dos horas más: falta gente. Sin cobrarlas, claro: «hoy por ti».`},{id:'caja',x:()=>`Falta dinero en la caja de Ana: ${fmt(Math.round(WP()*.06))}. ${cap(bossT())} se lo descuenta del sueldo sin preguntar si la caja la tocó alguien más.`},{id:'turnos',x:()=>`Han cambiado los turnos otra vez: Ana cierra el sábado y abre el domingo. Siete horas entre uno y otro.`}],
  oficina:[{id:'viernes',x:()=>`Viernes, 19:40. ${cap(bossT())} le manda un informe «para el lunes a primera hora». Son ocho horas de trabajo.`},{id:'merito',x:()=>`Ana ha hecho el informe entero. En la reunión, ${cap(bossT())} lo ha presentado como suyo. ${compiN()} ha mirado a Ana y ha negado con la cabeza.`},{id:'conexion',x:()=>`Un mensaje a las once de la noche: «¿Puedes mirar esto?». Y otro a las siete. ${cap(bossT())} cree que el sueldo incluye el móvil.`}],
  hosteleria:[{id:'propinas',x:()=>`El bote de las propinas ha desaparecido: ${bossT()} dice que «va para la caja». Eran ${fmt(Math.round(WP()*.1))} de Ana y de ${compiN()}.`},{id:'doble',x:()=>`${cap(bossT())} le pide que doble turno: comida y cena. Catorce horas. «Mañana libras», pero mañana ya estaba libre.`},{id:'cliente',x:()=>`Un cliente le ha gritado y le ha tirado la bandeja. ${cap(bossT())} ha pedido perdón… al cliente.`}],
  obra:[{id:'arnes',x:()=>`No hay arneses para todos. ${cap(bossT())} dice que se suba igual, «que son diez minutos».`},{id:'lluvia',x:()=>`Llueve a mares y el andamio resbala. ${cap(bossT())} no para la obra: «el plazo es el plazo».`},{id:'horas',x:()=>`Han hecho diez horas cuatro días seguidos. En la nómina siguen saliendo ocho.`}],
  cuidados:[{id:'doble',x:()=>`${compiN()} está de baja y no la sustituyen. Ana lleva su planta y la de ${compiN()}: veinte personas que asear, dar de comer y acostar.`},{id:'ratio',x:()=>`Esta noche hay una auxiliar para treinta residentes. Una señora se ha caído mientras Ana atendía a otra. El parte lo firmará Ana.`},{id:'guantes',x:()=>`Se han acabado los guantes. ${cap(bossT())} dice que «se estiren». Ana lleva los suyos de casa.`}],
  tech:[{id:'sprint',x:()=>`«Somos una familia»: ${cap(bossT())} anuncia un sprint de fin de semana para llegar al lanzamiento. Sin pagar, «con pizza».`},{id:'guardia',x:()=>`Guardia de madrugada sin cobrar. El servidor se ha caído a las tres y Ana ha estado hasta las seis. A las diez tenía reunión.`}],
  funcion:[{id:'plazas',x:()=>`Dos plazas sin cubrir desde hace un año. ${cap(bossT())} reparte su trabajo entre los que quedan. Ana lleva tres puestos y cobra uno.`},{id:'ventanilla',x:()=>`Una cola de cuarenta personas, un ordenador que no arranca y un señor que la llama inútil. El sistema lo arreglarán «cuando haya presupuesto».`}],
  reparto:[{id:'lluvia',x:()=>`Diluvia. Ana rechaza un pedido a cuarenta minutos y la app baja su puntuación. Ahora le llegan los peores pedidos.`},{id:'accidente',x:()=>`Un coche le ha dado un golpe en el semáforo. Nada grave: la rueda doblada. La app pregunta si «completará la entrega».`}],
  arte:[{id:'consumo',x:()=>`${cap(bossT())} le paga el concierto en consumiciones. «Es visibilidad». La sala estaba llena.`},{id:'bolo',x:()=>`Le cancelan el bolo del sábado el viernes por la noche. Ya había rechazado otro.`}],
  negocio:[{id:'proveedor',x:()=>`El proveedor principal sube los precios un 20 % de golpe. Si Ana lo repercute, pierde clientes; si no, pierde margen.`},{id:'alquiler',x:()=>`El casero del local quiere subir el alquiler. «Hay una franquicia interesada».`}],
  coop:[{id:'asamblea',x:()=>`Asamblea de tres horas para decidir los turnos de verano. ${compiN()} propone que decida una comisión; otros dicen que eso es volver a tener jefes.`}]};
const INC_TXT=k=>{for(const V of Object.values(INCID)){const v=V.find(x=>x.id===k);if(v)return v.x();}return '';};
// ---------- el golpe: dinero ----------
const GOLPES=[
  {id:'alquiler',m:()=>weeklyRent()*.12/PM(),c:()=>!S.owned,x:m=>`Carta del casero: el alquiler sube ${fmt(m)} a la semana «por actualización del mercado». Nadie ha arreglado la persiana.`,fx:m=>{S.rentMul=(S.rentMul||1)*(1+m/Math.max(1,weeklyRent()));}},
  {id:'caldera',m:()=>WP()*(.45+Math.random()*.3)/PM(),x:m=>`La caldera ha muerto. El casero dice que «el mantenimiento es cosa del inquilino». Arreglarla: ${fmt(m)}.`,fx:m=>{S.money-=m;}},
  {id:'muela',m:()=>WP()*(.35+Math.random()*.45)/PM(),x:m=>`Dolor de muelas desde el martes. El dentista: ${fmt(m)}. La sanidad pública no cubre la boca; por lo visto no es parte del cuerpo.`,fx:m=>{S.money-=m;}},
  {id:'luz',m:()=>WP()*(.22+Math.random()*.2)/PM(),x:m=>`Factura de la luz: ${fmt(m)}, el doble que el mes pasado. La compañía ha ganado mil millones este trimestre.`,fx:m=>{S.money-=m;}},
  {id:'multa',m:()=>WP()*(.22+Math.random()*.25)/PM(),x:m=>`Multa de ${fmt(m)} por aparcar donde aparca todo el barrio. A la furgoneta de la obra de al lado no se la ponen nunca.`,fx:m=>{S.money-=m;}}];
// ---------- el golpe personal ----------
const PERSONAL=[
  {id:'madre',c:()=>!!P_('madre'),t:()=>'🤒 Su madre',x:()=>`${P_('madre').n} se ha caído en casa: cadera. Dos semanas sin poder valerse. Ana es quien vive más cerca.`,
    o:()=>{const m=P_('madre');const cost=Math.round(WP()*.55);return [
      {t:'Faltar al trabajo y cuidarla',s:'Reputación y sueldo abajo; su madre, arriba.',f:()=>{S.rep=Math.max(0,(S.rep??70)-12);S.money-=Math.round(salary()*4);S.absences=(S.absences||0)+4;m.rel=Math.min(100,m.rel+18);ex().exp.solid++;tell(`Ana ha faltado cuatro días. ${bossS()} lo ha apuntado. Su madre no ha dejado de darle las gracias.`,'🫶');}},
      {t:`Pagar a una cuidadora (${fmt(cost)})`,ok:()=>S.money>=cost,f:()=>{S.money-=cost;m.rel=Math.min(100,m.rel+5);tell(`Ha contratado a Dolores, que cobra ${fmt(cost)} por dos semanas y tiene otras tres casas. Cuidar también es un trabajo mal pagado.`,'🧺');pushI('socialdemocrata',6,'cuidados');}},
      {t:'Pedir permiso en el trabajo',s:'Depende de quién mande.',f:()=>{if(TOX()<.45||TR().coop||S.track==='funcion'){m.rel=Math.min(100,m.rel+12);tell(`Le han dado cinco días por cuidado de familiar. Ni una pega.`,'📄');}else{S.rep=Math.max(0,(S.rep??70)-6);tell(`${bossS()}: «¿Y quién te cubre? Aquí todos tenemos madre». Al final ha ido por las tardes, después del turno. Dos semanas sin dormir.`,'😮‍💨');ex().exp.stress++;grieve(10);}}},
      {t:'Que se encargue su hermano',s:'Tiene coche y tiempo. Nunca se ha encargado de nada.',f:()=>{m.rel=Math.max(0,m.rel-14);tell(`Su hermano ha ido dos veces y ha dicho que «ya estaba mejor». Ana ha acabado yendo igual, pero más tarde y con más culpa.`,'😤');ex().exp.stress++;}}];},
    auto:()=>S.money>WP()*.9?1:T('trabajadora')?2:0},
  {id:'vecina',c:()=>!!P_('vecina'),t:()=>'🏘️ Desahucio',x:()=>`A ${P_('vecina').n}, del piso de al lado, la desahucian el jueves a las nueve. Debe tres meses. En el portal hay un cartel: «Este desahucio lo paramos».`,
    o:()=>{const v=P_('vecina');return [
      {t:'Ir a las nueve a la puerta',s:'Puede acabar en comisaría.',f:()=>{v.rel=Math.min(100,v.rel+30);ex().exp.solid++;pushI('anarquista',14,'vivienda');pushI('marxista',8,'vivienda');const ok=Math.random()<.45+W_().mov/200;if(ok){chapter('desahucio','El jueves a las nueve',`Había sesenta personas en el portal. La comitiva judicial se dio la vuelta. ${v.n} lloraba y Ana también. Por ahora.`);ex().exp.win++;W_().mov=Math.min(100,W_().mov+6);}else{if(Math.random()<.25)arrestAna(1,'en el desahucio');else tell(`Eran veinte. La policía los apartó uno a uno. ${v.n} salió con dos bolsas y el gato. Ana no durmió.`,'🥀');ex().exp.loss++;}}},
      {t:`Darle ${fmt(Math.round(WP()*.35))} para el hostal`,ok:()=>S.money>=WP()*.35,f:()=>{S.money-=Math.round(WP()*.35);v.rel=Math.min(100,v.rel+12);tell(`${v.n} ha aceptado el dinero sin mirarla. Esa noche el piso de al lado estaba vacío y muy silencioso.`,'🏚️');}},
      {t:'No meterse',s:'No es asunto suyo. ¿O sí?',f:()=>{v.rel=Math.max(0,v.rel-25);pushI('apolitica',8,'vivienda');tell(`Ana se fue a trabajar a las ocho y media para no cruzarse con nadie. Al volver, la puerta de al lado tenía la cerradura cambiada.`,'🚪');ex().exp.stress++;}}];},
    auto:()=>isLeft()&&comp()>=2?0:S.money>WP()*1.2?1:2},
  {id:'amiga',c:()=>!!P_('amiga'),t:()=>`🫶 Su mejor amig${P_('amiga').g==='a'?'a':'o'}`,x:()=>{const f=P_('amiga');return `${f.n} ha aparecido con una maleta. ${f.g==='a'?'La':'Lo'} han echado del piso: no podía pagar. Pregunta si puede quedarse «unos días».`;},
    o:()=>{const f=P_('amiga');return [
      {t:'Que se quede lo que haga falta',f:()=>{f.rel=Math.min(100,f.rel+20);ex().exp.solid++;S.res=S.res||[];inviteHome(f,true);S.lodger=f.k;schedule(21,'lodger',{p:f.k});tell(`${f.n} duerme en el sofá. Paga la mitad de la compra y hace las mejores lentejas del barrio.`,'🛋️');}},
      {t:'Una semana, y que busque algo',f:()=>{f.rel=Math.max(0,f.rel-5);inviteHome(f,true);tell(`${f.n} ha entendido el mensaje. A los seis días ya tenía una habitación de ${fmt(Math.round(weeklyRent()*.7))} a la semana, compartiendo con cuatro desconocidos.`,'🧳');}},
      {t:`Prestarle ${fmt(Math.round(WP()*.5))} para una fianza`,ok:()=>S.money>=WP()*.5,f:()=>{S.money-=Math.round(WP()*.5);f.rel=Math.min(100,f.rel+10);schedule(35,'devolver',{p:f.k,m:Math.round(WP()*.5)});tell(`${f.n} ha encontrado una habitación. Devolverá el dinero «en cuanto pueda».`,'🤝');}}];},
    auto:()=>T('solidaria')||T('sociable')?0:1}];
// ---------- dilemas de la temporada ----------
Object.assign(DLG,{
  incidente:{t:d=>'⚠️ En el trabajo',x:d=>INC_TXT(d.v),
    o:d=>{const c=ex();if(TR().self)return [{t:'Pagar y apretar el margen',f:()=>{S.payMul=(S.payMul||1)*.9;chose('Tragó la subida del proveedor');}},{t:'Subir los precios',f:()=>{if(Math.random()<.5){tell('Ha subido los precios. Dos clientas de toda la vida ya no vienen.','🏪');S.payMul=(S.payMul||1)*.95;}else tell('Ha subido los precios y nadie ha protestado. Debería haberlo hecho antes.','🏪');chose('Subió los precios');}},{t:'Buscar otro proveedor',f:()=>{schedule(10,'proveedor',{});chose('Buscó otro proveedor');}}];
      if(TR().coop)return [{t:'Aguantar la asamblea hasta el final',f:()=>{S.needs.energia=Math.max(0,S.needs.energia-15);chose('Se quedó en la asamblea hasta el final');tell('A las once de la noche había turnos para todos. Nadie manda; todo cuesta más.','🤝');}},{t:'Proponer una comisión',f:()=>{office().org=Math.max(0,office().org-5);chose('Propuso una comisión');tell('Se ha creado una comisión de turnos. Funciona. Y ya hay quien dice que es un jefe con otro nombre.','🤝');}}];
      return [
      {t:'Tragar',s:'Hoy no es el día. Tiene facturas.',f:()=>{c.exp.stress++;grieve(10);S.rep=Math.min(100,(S.rep??70)+3);pushI('apolitica',5,'cansancio');chose('Tragó');tell(pickR(['Ana no dijo nada. Esa noche cenó de pie.','Ana asintió. En el baño, se miró al espejo un rato largo.']),'😶');}},
      {t:'Plantarse',s:'Depende del carisma. Y de quién mande.',f:()=>{const ok=Math.random()<.25+lvl('carisma')*.09-TOX()*.25+(T('genio')?.1:0);chose('Se plantó');
        if(ok){c.exp.win++;S.pol.inf+=2;office().griev=Math.max(0,(office().griev||0)-5);tell(`Ana dijo que no. Hubo un silencio largo y ${bossS()} cambió de tema. ${compiN()} la miró como si hubiera visto un unicornio.`.replace('la miró',ga('la miró','lo miró','le miró')),'💪');}
        else{S.rep=Math.max(0,(S.rep??70)-10);grieve(15);schedule(7,'marcada',{});tell(`Ana dijo que no. ${bossS()} sonrió: «Vale». Desde entonces le tocan los peores turnos y ni un buenos días.`,'👁️');}}},
      {t:`Hablarlo con ${compiN()} y el resto`,s:'Más lento. Más seguro. Más gente.',f:()=>{const o=office();o.org=Math.min(100,o.org+12);o.griev=Math.min(100,(o.griev||0)+8);const cp=P_('compi');if(cp)cp.rel=Math.min(100,cp.rel+12);c.exp.solid++;pushI(LEANL(),8,'explotacion');chose('Lo habló con las compañeras');schedule(9,'respuesta',{});tell(`En el descanso, Ana lo contó. ${compiN()} dijo «a mí también». Luego otra. Luego otra.`,'🗣️');}}];},
    auto:()=>isLeft()&&comp()>=2?2:T('genio')||T('combativa')||(lvl('carisma')>=3&&Math.random()<.5)?1:isLeft()||Math.random()<.3?2:0},
  golpe:{t:d=>'💸 El golpe',x:d=>{const g=GOLPES.find(x=>x.id===d.v);return g?g.x(d.m):'';},
    o:d=>{const g=GOLPES.find(x=>x.id===d.v);if(g)g.fx(d.m);const m=d.m;const mo=P_('madre');return [
      {t:'Pedir un adelanto en el trabajo',ok:()=>!S.jobless&&!TR().self,s:'Se lo descontarán. Y le deberá un favor a quien manda.',f:()=>{S.money+=m;bumpMoney&&bumpMoney();S.owe=S.day+40;schedule(14,'adelanto',{m:Math.round(m/2)});schedule(28,'adelanto',{m:Math.round(m/2)});chose('Pidió un adelanto');tell(`${bossS()} le ha adelantado ${fmt(m)}. «Ya sabes que aquí cuidamos a la gente». Ana sabe lo que eso significa: ahora no puede decir que no.`,'🪝');}},
      {t:`Pedírselo a ${mo?mo.n:'su madre'}`,ok:()=>!!mo,s:'Su madre tiene menos que ella.',f:()=>{S.money+=m;bumpMoney&&bumpMoney();mo.rel=Math.min(100,mo.rel+4);pushI('conservadora',5,'familia');chose('Pidió dinero a su madre');tell(`${mo.n} le ha dado ${fmt(m)} de la pensión. «No me lo devuelvas». Ana sabe que ese mes su madre no pondrá la calefacción.`,'👩‍🦳');}},
      {t:'Trabajar el fin de semana por fuera',s:'Dinero rápido, cuerpo roto.',f:()=>{S.money+=Math.round(m*.8);bumpMoney&&bumpMoney();S.needs.energia=Math.max(0,S.needs.energia-40);ex().exp.stress++;chose('Trabajó el fin de semana por fuera');tell(`Dos días de mudanzas en negro: ${fmt(Math.round(m*.8))}. El lunes no podía con la espalda.`,'📦');}},
      {t:'Apretarse el cinturón',s:'Comer peor, no salir, aguantar.',f:()=>{S.needs.diversion=Math.max(0,S.needs.diversion-25);S.cutBelt=S.day+14;ex().exp.stress++;chose('Se apretó el cinturón');tell('Arroz, lentejas y la tele. Dos semanas sin pisar un bar.','🍚');}}];},
    auto:()=>S.money<0?(P_('madre')&&Math.random()<.6?1:S.jobless||TR().self?2:0):T('trabajadora')&&Math.random()<.5?2:Math.random()<.5?3:2},
  asamblea:{t:()=>'✊ En el descanso',x:()=>`${compiN()} lo dice en voz baja, pero lo dice: «¿Y si paramos?». ${office().org>=50?'Media plantilla está harta.':'Hay gente harta, pero también mucho miedo.'} Todos miran a Ana.`,
    o:()=>[{t:'Convocar la huelga',s:office().org<50?'Con poca gente. Arriesgado.':'Están preparadas.',f:()=>{if(!S.union||!S.union.member)joinUnion();const o=office();o.org=Math.max(o.org,35);o.griev=Math.max(o.griev||0,35);callStrike(false);if(S.strike)S.strike.join=true;chose('Convocó la huelga');}},
      {t:'Esperar a ser más',s:'Organizar primero. Parar después.',f:()=>{const o=office();o.org=Math.min(100,o.org+18);if(!S.union||!S.union.member)joinUnion();S.pol.inf+=3;chose('Organizó antes de parar');schedule(18,'masgente',{});tell('Ana propuso ir una a una. Un mes de cafés, de hablar en el aparcamiento, de callar delante del jefe.','🗣️');}},
      {t:'No meterse',s:'Hoy no. Quizá nunca.',f:()=>{const cp=P_('compi');if(cp)cp.rel=Math.max(0,cp.rel-12);pushI('apolitica',10,'cansancio');chose('No se metió');tell(`Ana dijo que tenía que pensarlo. ${compiN()} no volvió a sacar el tema.`,'😶');}}],
    auto:()=>isLeft()&&comp()>=2?(office().org>=45?0:1):2},
  envenenado:{t:()=>'🍬 El ascenso envenenado',x:()=>`${cap(bossT())} la llama al despacho: le ofrece ser ${L(CAREER[S.career+1].t).toLowerCase()}. Más sueldo. «Y necesito que me cuentes cómo está el ambiente. Quién protesta, quién no». Lo dice sonriendo.`.replace('la llama',ga('la llama','lo llama','le llama')),
    o:()=>[{t:'Aceptar',f:()=>{S.career++;S.rep=Math.min(100,(S.rep??70)+5);ex().contra+=isLeft()?30:5;pushI('liberal',15,'ascenso');chose('Aceptó el ascenso');tell(`Ana aceptó. El primer día de ${L(CAREER[S.career].t).toLowerCase()}, ${compiN()} le dio la enhorabuena sin mirarla a los ojos.`.replace('mirarla',ga('mirarla','mirarlo','mirarle')),'📈');storyPromo();}},
      {t:'Aceptar… y no contar nada',s:'Cobra el ascenso y protege a la gente. Si lo descubren, a la calle.',f:()=>{S.career++;S.ally=true;chose('Aceptó el ascenso para proteger a la plantilla');schedule(20+Math.random()*20,'topo',{});tell('Ana aceptó. En el despacho, cuando le preguntan por el ambiente, dice: «bien, todo bien». Mientras, avisa a quien haga falta.','🕵️');storyPromo();}},
      {t:'Rechazar',s:'Se queda donde está. Con los suyos.',f:()=>{S.rep=Math.max(0,(S.rep??70)-5);office().org=Math.min(100,office().org+10);const cp=P_('compi');if(cp)cp.rel=Math.min(100,cp.rel+15);S.pol.inf+=4;ex().exp.solid++;chose('Rechazó el ascenso');tell(`«Gracias, pero no». ${bossS()} no entendía nada. ${compiN()} sí.`,'☕');}}],
    auto:()=>isLeft()&&comp()>=2?2:isLeft()?1:0},
  oferta:{t:()=>'📩 Una oferta',x:()=>{if(!S.offer)makeOffer();const o=S.offer;return `${o.n} le ofrece un puesto de ${L(CAREER[o.career].t).toLowerCase()} por ${fmt(offerPay(o))} el turno (ahora cobra ${fmt(salary())}). ${o.seen>.6?'Dicen que allí el ambiente es malo.':o.seen<.3?'Dicen que allí se está bien.':'Del ambiente no se sabe nada.'}`;},
    o:()=>[{t:'Aceptar',f:()=>{chose('Cambió de empresa');acceptOffer();}},{t:'Enseñársela a su jefe para negociar',s:'Puede salir bien… o marcarla.',f:()=>{chose('Negoció con la oferta');counterOffer();if(S.offer)rejectOffer(true);}},{t:'Quedarse',f:()=>{chose('Rechazó la oferta');rejectOffer(true);tell('Ana dijo que no. Por la gente, por la rutina, por no empezar otra vez de cero.','🏢');}}],
    auto:()=>S.offer&&offerPay(S.offer)>salary()*1.15?0:1},
  entrevista:{t:()=>'🪑 La entrevista',x:()=>`Por fin una entrevista. Ofrecen ${L(CAREER[0].t).toLowerCase()} con contrato de tres meses, sueldo «según convenio» y «muchas ganas». Le preguntan si tiene hijos y si está sindicada.`,
    o:()=>[{t:'Decir que sí a todo',f:()=>{S.jobless=false;S.paroWeeks=0;S.career=0;S.rep=55;S.office=null;office();chose('Aceptó lo que había');tell(`Ha dicho que no tiene hijos ni planes de tenerlos y que la política «no va con ella». Empieza el lunes.`,'📝');pushI('apolitica',8,'despido');}},
      {t:'Decir la verdad',s:'Esas preguntas son ilegales. Lo saben.',f:()=>{if(Math.random()<.35){S.jobless=false;S.paroWeeks=0;S.career=0;S.rep=55;S.office=null;office();tell('Ha contestado que esas preguntas no se pueden hacer. La entrevistadora ha sonreído: «Por fin alguien con criterio». Empieza el lunes.','📝');ex().exp.win++;}else{tell('Ha contestado que esas preguntas no se pueden hacer. «Ya te llamaremos». No han llamado.','📭');ex().exp.stress++;}chose('Dijo la verdad en la entrevista');}},
      {t:'Levantarse e irse',f:()=>{pushI(LEANL(),10,'despido');chose('Se fue de la entrevista');tell('Se ha levantado a mitad de entrevista. En el ascensor temblaba, pero bajaba con la espalda recta.','🚪');ex().exp.stress++;}}],
    auto:()=>S.money<0?0:1},
  cliente:{t:()=>'🏪 El cliente grande',x:()=>`Una cadena quiere ${TR().coop?'contratar a la cooperativa':'comprar el negocio de Ana'}: ${TR().coop?'un pedido enorme, a la mitad de precio y con plazos imposibles':'buen dinero y un puesto de encargada en la franquicia'}.`,
    o:()=>[{t:'Aceptar',f:()=>{S.money+=Math.round(WP()*1.5);bumpMoney&&bumpMoney();S.payMul=(S.payMul||1)*.85;chose('Aceptó el trato con la cadena');tell('Han aceptado. Hay más trabajo que nunca y menos margen que nunca.','📦');}},{t:'Rechazar',f:()=>{chose('Rechazó a la cadena');tell('Han dicho que no. Seguirán pequeños. Seguirán suyos.','🏪');}}],
    auto:()=>S.money<200?0:1},
  personal:{t:d=>{const v=PERSONAL.find(x=>x.id===d.v);return v?v.t():'';},x:d=>{const v=PERSONAL.find(x=>x.id===d.v);return v?v.x():'';},o:d=>{const v=PERSONAL.find(x=>x.id===d.v);return v?v.o():[{t:'Seguir',f:()=>{}}];},auto:d=>{const v=PERSONAL.find(x=>x.id===d.v);return v?v.auto():0;}}});
// ---------- consecuencias nuevas ----------
Object.assign(CQ,{
  respuesta:()=>{if(S.jobless)return;const o=office();if(o.org>=25){tell(`Han ido juntas al despacho: cinco personas y una lista. ${bossS()} ha cedido en lo principal. No ha sido una huelga: ha sido un aviso.`,'✊');ex().exp.win++;o.griev=Math.max(0,(o.griev||0)-10);S.noOvertime=S.day+45;}else{tell(`Al final solo ${compiN()} y Ana fueron al despacho. ${bossS()} les escuchó «con mucho interés» y no cambió nada.`,'🥀');}},
  marcada:()=>{if(S.jobless)return;S.needs.energia=Math.max(0,S.needs.energia-15);tell(`Semana de turnos partidos y tareas que nadie quiere. ${compiN()} le ha dicho en voz baja: «te la tienen jurada».`,'👁️');},
  adelanto:d=>{S.money-=d.m;bumpMoney&&bumpMoney();if(S.owe>S.day&&Math.random()<.5)tell(`Nómina con ${fmt(d.m)} menos: el adelanto. ${bossS()} le ha pedido «un favor» este fin de semana. No ha podido decir que no.`,'🪝');},
  masgente:()=>{if(S.jobless)return;const o=office();if(o.org>=50){tell(`Ya son más de la mitad. En el vestuario alguien ha escrito en la pizarra: «cuando queráis».`,'✊');if(!S.strike&&Math.random()<.6)askDilemma('asamblea',{});}else tell('La cosa va lenta. Dos se han echado atrás: «yo tengo hipoteca».','🐢');},
  lodger:d=>{const p=P_(d.p);if(!p)return;S.lodger=null;if(Math.random()<.6)tell(`${p.n} ha encontrado habitación. Ha dejado el sofá hecho y una nota: «gracias por no hacerme sentir que molestaba».`,'🫶');else{tell(`${p.n} sigue en el sofá. No encuentra nada por menos de ${fmt(Math.round(weeklyRent()*.8))} a la semana. Nadie lo menciona.`,'🛋️');schedule(21,'lodger',d);}},
  proveedor:()=>{if(Math.random()<.5){tell('Ha encontrado otro proveedor, más barato y más lejos. Dos horas de furgoneta cada martes.','🚚');S.needs.energia=Math.max(0,S.needs.energia-10);}else{tell('No hay otro proveedor: son todos el mismo con distinto nombre. Ha pagado la subida.','🏪');S.payMul=(S.payMul||1)*.92;}}});
