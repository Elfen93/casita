// ---------- diario: un resumen de cada día contado como una historia ----------
const ACTIVITY={_out_sindicato:['fue a la asamblea del sindicato'],_out_militancia:['fue a una reunión política'],_out_manifestacion:['salió a la manifestación'],_out_voluntariado:['echó una mano como voluntaria'],_out_deporte:['salió a correr'],_out_networking:['fue a un afterwork de networking'],_out_misa:['fue a misa y luego al vermú'],_out_biblioteca:['estudió en la biblioteca'],_out_piquete:['estuvo en el piquete'],tele:['vio la tele','se enganchó a una serie'],libros:['leyó un buen rato','se perdió en un libro'],guitarra:['tocó la guitarra','ensayó unos acordes'],fogon:['cocinó algo casero','se metió en la cocina'],compu:['estuvo con el ordenador','se pasó horas delante del ordenador'],telefono:['habló por teléfono'],sofa:['se tiró en el sofá'],banco:['cacharreó en el banco de trabajo'],planta:['cuidó las plantas'],flores:['regó las flores'],huerto:['trabajó en el huerto','se manchó las manos de tierra en el huerto'],espejo:['ensayó frente al espejo'],bancoj:['tomó el aire en el jardín'],barbacoa:['hizo una barbacoa'],_weed:['quitó malas hierbas']};
const OPEN={sol:['Hizo sol.','Lució el sol todo el día.','Día de cielo limpio.'],nubes:['Día gris.','El cielo se quedó nublado todo el día.'],lluvia:['Llovió sin parar.','Amaneció lloviendo.','La lluvia golpeó los cristales todo el día.'],tormenta:['Hubo tormenta: truenos y apagones.','Cayó una buena tormenta.'],nieve:['¡Nevó!','La nieve lo cubrió todo.'],calor:['Hizo un calor pegajoso.','El calor no dio tregua.']};
function writeDiary(){
  const td=S.today;if(!td){newToday();return;}
  const d=dateOf(S.day),c=CH(),n=c.name,W=S.weather||{k:'sol'},o=oa();const parts=[];
  parts.push(pickR(OPEN[W.k]||OPEN.sol));
  const dt=dayType(S.day);if(festivo(S.day))parts.push(`Era ${festivo(S.day)}.`);else if(dt==='vac')parts.push('Día de vacaciones.');else if(dt==='weekend'&&Math.random()<.5)parts.push(pickR(['Sin trabajo, por fin.','Día libre.']));
  if(td.work){const w=td.work;const wp=TR().self?'en su tienda':S.track==='reparto'?'repartiendo en bici':S.track==='obra'?'en la obra':S.track==='hosteleria'?'en el bar':S.track==='arte'?'tocando en '+(S.office?S.office.n:'un bar'):S.track==='oficina'?'en la oficina':'en '+(S.office?S.office.n:'el trabajo');let t=pickR([`${n} fue a trabajar`,`${n} pasó el día ${wp}`,`Jornada de trabajo para ${n}`]);
    if(w.late>15)t+=`, llegó ${w.late} minutos tarde`;if(w.extra)t+=' y le tocó quedarse más de la cuenta';t+=` y volvió con ${fmt(w.pay)}.`;
    if(Dm().soul&&TOX()>0.65)t+=pickR([' El ambiente en la oficina sigue siendo irrespirable.',' Otro día aguantando a su jefe.',' Volvió con dolor de cabeza.']);
    else if(w.perf>=1.1)t+=pickR([' Le salió todo redondo.',' Se sintió útil.',' Su jefe la felicitó.'.replace('la ',ga('la ','lo ','le '))]);
    else if(w.perf<0.9)t+=pickR([' No estaba de humor y se notó.',' Fue un día torcido.']);
    parts.push(t);}
  else if(S.jobless&&dt==='work')parts.push(pickR(['Otro día enviando currículums.','Sigue buscando trabajo; el silencio de las empresas pesa.','Revisó ofertas de empleo toda la mañana.']));
  if(td.out)parts.push(td.out);
  const used=Object.entries(td.used).filter(([t])=>ACTIVITY[t]).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([t])=>pickR(ACTIVITY[t]));
  if(used.length)parts.push(capF(`${pickR(['en casa','por la tarde','luego'])}, ${used.join(' y ')}.`));
  if(td.calls.length)parts.push(`Habló con ${td.calls.join(' y ')}.`);
  if(td.built.length)parts.push(`${pickR(['Por fin quedó terminado','Terminó'])}: ${td.built.join(', ').toLowerCase()}.`);
  if(td.skills.length)parts.push(`Nota que cada vez se le da mejor ${td.skills.map(x=>x.toLowerCase()).join(' y ')}.`);
  if(td.harvest)parts.push(`Recogió ${td.harvest} raciones del huerto.`);
  if(td.weeds>=3)parts.push('Dejó el jardín sin malas hierbas.');
  for(const e of td.ev.slice(0,3))parts.push(e.replace(/^\S+\s/,'').replace(/([^.!?»])$/,'$1.'));
  const m=td.moodN?td.moodS/td.moodN:mood();
  parts.push(m>70?pickR(['Se fue a la cama con una sonrisa.','Fue un buen día.','De esos días que dan ganas de repetir.']):m>50?pickR(['Un día normal, de los que también hacen falta.','Nada especial, pero tranquilo.']):m>32?pickR([`Acabó el día cansad${o}.`,'Ha sido un día largo.','Se acostó con la cabeza llena de cosas.']):pickR(['Se acostó pensando que así no se puede seguir.','Uno de esos días que mejor olvidar.',`Se fue a dormir agotad${o} y de mal humor.`]));
  if(S.money<reserveMoney())parts.push(pickR(['Le preocupa llegar a fin de mes.','Las cuentas no salen y lo sabe.']));
  else if(S.want&&Math.random()<.5)parts.push(`Sueña con ${S.want.name.toLowerCase()}.`);
  const me=m>70?'😊':m>50?'🙂':m>32?'😐':'😞';
  tell(`<i>${WDL[d.wd]} ${d.dm} de ${MONTHS[d.m].toLowerCase()}.</i> ${parts.join(' ')}`,me,'d');
}
// llamadas y relaciones
function phoneCall(){const ps=(S.people||[]).filter(p=>p.k!=='vecina');if(!ps.length)return;
  const p=ps.sort((a,b)=>a.rel-b.rel+Math.random()*30-15)[0];p.rel=Math.min(100,p.rel+14);p.last=S.day;
  const topics=['se rieron un buen rato','hablaron de todo y de nada','le contó cómo le va en el trabajo','le habló de la casa'];
  if(S.money<reserveMoney())topics.push('le confesó que va justa de dinero');if(S.want&&S.want.kind==='buy')topics.push(`le contó que quiere comprarse ${S.want.name.toLowerCase()}`);else if(S.want&&S.want.kind==='build')topics.push(`le habló de la obra que tiene en mente: ${S.want.name.toLowerCase()}`);
  if(S.jobless)topics.push('le dio ánimos con la búsqueda de trabajo');
  const t=pickR(topics);tally('calls',`${p.n}`);
  if(Math.random()<0.15&&!(S.lastCallTell>S.day-4)){S.lastCallTell=S.day;tell(`${CH().name} llamó a ${p.n}, ${p.r}: ${t}.`,'☎️');}
  if(p.k==='madre'&&S.money<reserveMoney()*0.6&&Math.random()<0.35*(isI('conservadora')?1.7:1)&&!(S.momHelp>S.day-30)){const g=Math.round((40+Math.random()*80)*(Dm().soul?0.6:1));S.money+=g;S.momHelp=S.day;bumpMoney();tell(`${p.n} no pudo evitarlo y le hizo una transferencia de ${fmt(g)}. «Para lo que necesites».`,'💌');toast(`💌 ${p.n} le manda ${fmt(g)}`,true);}
}
function peopleDaily(){
  for(const p of S.people||[]){p.rel=Math.max(5,p.rel-(p.k==='vecina'?0.3:p.k==='madre'&&isI('conservadora')?0.35:0.8));}
  const m=P_('madre');if(m&&m.rel<35&&Math.random()<0.2&&!(S.momMsg>S.day-12)&&(S.momMsg=S.day))tell(`${m.n} le ha dejado un mensaje: «¿Estás bien? Hace mucho que no sé de ti».`,'📱');
  const f=P_('amiga');if(f&&f.rel<30&&Math.random()<0.15&&!(S.friMsg>S.day-15)&&(S.friMsg=S.day))tell(`Hace semanas que no ve a ${f.n}. Se están distanciando.`,'💭');
  const cp=P_('compi');if(cp&&S.today&&S.today.work)cp.rel=Math.min(100,cp.rel+1.5);
}
// salir con amigos los días libres
function maybeFriendOuting(){
  const h=S.t/60,dt=dayType(S.day),nd=S.needs;if(dt==='work'||h<17||h>20||S.sim.work>0||S.outDay===S.day)return false;
  if(nd.social>65||nd.energia<35||nd.hambre<25||spare()<mealOutCost()*1.6)return false;
  if((S.weather||{}).k==='tormenta'||Math.random()>0.35){S.outDay=S.day;return false;}
  S.outDay=S.day;goOut('amigos');return true;
}
function outFriend(){return (S.outWith&&(S.people||[]).find(q=>q.k===S.outWith))||P_('amiga');}
function friendBack(){const f=(S.outWith&&(S.people||[]).find(q=>q.k===S.outWith))||P_('amiga')||{n:'unos amigos'};const date=S.dateOut;S.outWith=null;S.dateOut=false;f.last=S.day;
  if(date&&f.love!=null){f.love=Math.min(100,f.love+8+compatOf(f)/10);f.rel=Math.min(100,f.rel+8);}else if(Math.random()<.5)setTimeout(()=>maybeMeet('amigos'),5);const c=Math.round(mealOutCost()*1.6);S.money-=c;S.needs.social=100;S.needs.diversion=Math.min(100,S.needs.diversion+40);S.needs.hambre=Math.max(S.needs.hambre,85);if(f.rel!=null)f.rel=Math.min(100,f.rel+18);
  const plan=date?pickR(['a cenar a un italiano pequeñito','al cine y luego a pasear','a un concierto','a ver el atardecer en el parque','a una terraza que no conocían']):pickR(['a tomar algo','a una terraza','al cine','a cenar a un sitio nuevo','a dar un paseo por el parque','a un concierto pequeñito']);
  const txt=date?`Cita con ${f.n}: se fueron ${plan}. ${pickR(['Hubo beso de despedida.','Volvió flotando.','No paraban de hablar.','La noche se les hizo corta.'])}`:`Quedó con ${f.n} y se fueron ${plan}. ${pickR(['Volvió con las pilas cargadas.','Hacía falta.','Se rieron como antes.','Hablaron hasta tarde.'])}`;
  if(S.today)S.today.out=txt;tell(`${CH().name} ${txt.charAt(0).toLowerCase()+txt.slice(1)}`,'🍻');toast(`🍻 ${CH().name} ha salido con ${f.n} · ${fmt(c)}`);}
// cumpleaños y aniversarios
function birthdayCheck(){const c=S.char;if(!c||!c.bday)return;const d=dateOf(S.day);if(d.m!==c.bday[0]||d.dm!==c.bday[1])return;
  c.age=(c.age||27)+1;S.needs.social=100;S.needs.diversion=Math.min(100,S.needs.diversion+30);
  const m=P_('madre'),f=P_('amiga');for(const p of S.people||[])p.rel=Math.min(100,p.rel+8);
  const gift=Math.round((Dm().soul?30:80)*(1+Math.random()));S.money+=gift;bumpMoney();
  tell(`🎂 ${c.name} cumple ${c.age} años. ${m?m.n+' la llamó a primera hora para cantarle'.replace('la llamó',ga('la llamó','lo llamó','le llamó'))+'; ':''}${f?f.n+' se presentó con una tarta. ':''}Le regalaron ${fmt(gift)}.`,'🎂','c');
  toast(`🎂 ¡Hoy ${c.name} cumple ${c.age} años!`,true);popBubble('🎂');}
function milestones(){
  if(S.day===31)chapter('mes','Un mes aquí',`Ya ha pasado un mes desde la mudanza. ${rooms.length>1?'La casa empieza a parecer un hogar.':'La casa sigue medio vacía, pero ya huele a ella.'.replace('a ella',ga('a ella','a él','a elle'))}`);
  if(S.day===366)chapter('ano','Un año',`Un año entero en esta casa. Ha cambiado más de lo que creía.`);
  if(S.money<0&&!S.story.chap.rojo)chapter('rojo','Números rojos','La cuenta ha bajado de cero. El banco cobra comisiones y cada compra duele.');
}

function storyPromo(){const c=CH(),t=CAREER[S.career].t;
  if(S.career===1)chapter('promo1','Un paso adelante',`Ya no es ${CAREER[0].t.toLowerCase()}: ahora es ${t.toLowerCase()}. ${pickR(['Se compró un pastel para celebrarlo.','Llamó a su madre nada más salir.','No se lo terminaba de creer.'])}`);
  else if(S.career===CAREER.length-1)chapter('top','Lo más alto',`${c.name} es ${t.toLowerCase()}: lo más alto de la empresa. Y aun así, la empresa no es suya.`);
  else tell(`Ascenso: ${c.name} ahora es ${t.toLowerCase()}. ${pickR(['Se lo ha ganado.','Más sueldo, más responsabilidad.','Lo celebró con una cena.'])}`,'🎉');}
function jobStory(){
  const now=S.jobless?'paro':(S.office?S.office.n:'job'),was=S.prevJob;
  if(was!=null&&was!==now){
    if(S.jobless){if(S.story.chap.paro)tell(`${CH().name} se ha vuelto a quedar sin trabajo.`,'📦');else chapter('paro','Sin red','Se ha quedado sin trabajo. De un día para otro, la rutina se viene abajo y las facturas siguen llegando.');}
    else if(was==='paro'){if(S.story.chap.nuevo)tell(`Vuelve a tener trabajo, en ${S.office?S.office.n:'una empresa nueva'}.`,'📝');else chapter('nuevo','Empezar de nuevo',`Ha encontrado trabajo en ${S.office?S.office.n:'una empresa nueva'}. Primer día con nervios, como en el colegio.`);}
    else tell(`Primer día en ${now}. Nuevas caras, nuevo jefe, nuevas reglas.`,'🏢');}
  S.prevJob=now;}
