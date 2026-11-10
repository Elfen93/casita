// ---------- historia: diario, capítulos, personas y pensamientos ----------
let storyUnseen=0;
const capF=s=>s.charAt(0).toUpperCase()+s.slice(1);
function storyState(){if(!S.story)S.story={log:[],chap:{},n:0};return S.story;}
function tell(txt,ic='📖',kind='n'){
  const st=storyState();const t=L(txt);st.log.push({d:S.day,t:Math.round(S.t),ic,txt:t,k:kind});
  if(st.log.length>500)st.log.splice(0,st.log.length-500);
  S.lastLine={ic,txt:t.replace(/<[^>]+>/g,'')};storyUnseen++;
}
function chapter(id,title,txt){const st=storyState();if(st.chap[id])return;st.n++;st.chap[id]={n:st.n,d:S.day,title};
  tell(`<b>Capítulo ${st.n} · ${title}.</b> ${txt}`,'📕','c');setTimeout(()=>toast(`📕 Capítulo ${st.n}: ${title}`,true),400);}
function newToday(){S.today={d:S.day,work:null,used:{},built:[],skills:[],ev:[],moodS:0,moodN:0,calls:[],harvest:0,weeds:0,out:null};}
function tally(k,v){const td=S.today;if(!td)return;if(k==='used')td.used[v]=(td.used[v]||0)+1;else if(Array.isArray(td[k])){if(!td[k].includes(v))td[k].push(v);}else td[k]=v;}
// personas de su vida
const FRIENDS=[['Lucía','a'],['Sergio','o'],['Nuria','a'],['Iván','o'],['Marta','a'],['Álex','e'],['Bea','a'],['Rubén','o']];
function initPeople(){const f=pickR(FRIENDS),c=pickR([['Raúl','o'],['Elena','a'],['Toni','o'],['Sofía','a']]);
  S.people=[{k:'madre',n:pickR(['Rosa','Pilar','Maite','Concha','Lola','Isabel']),r:'su madre',mi:'mamá',e:'👩‍🦳',rel:72},
    {k:'amiga',n:f[0],r:`su mejor amig${f[1]}`,mi:f[0],e:'🫶',rel:66,g:f[1]},
    {k:'vecina',n:pickR(['Carmen','Paco','Manoli','Antonio']),r:'del piso de al lado',mi:null,e:'🏘️',rel:35},
    {k:'compi',n:c[0],r:`su compañer${c[1]} de trabajo`,mi:c[0],e:'💼',rel:40,g:c[1]}];}
const P_=k=>(S.people||[]).find(p=>p.k===k);
function relLabel(r){return r>=80?'muy unidos':r>=60?'buena relación':r>=40?'se llevan bien':r>=22?'algo distantes':'apenas se hablan';}
function storyStart(){
  if(!S.people)initPeople();newToday();const c=CH(),D=Dm(),m=P_('madre');
  const money=D.money>=1000?'unos ahorros y muchas ganas':D.money>=400?'algo ahorrado y bastante incertidumbre':'lo que cabe en una maleta y una cuenta casi vacía';
  chapter('start','Una casa con eco',`${c.name} tiene ${c.age} años y acaba de mudarse a una casita de alquiler con lo justo: una cama, una nevera, una ducha y un váter. Llega con ${money}. Mañana empieza de ${CAREER[0].t.toLowerCase()} en una empresa del centro. ${m?`${m.n}, su madre, le ha dicho por teléfono que se cuide.`:''}`);
}
// ---------- diario: un resumen de cada día contado como una historia ----------
const ACTIVITY={tele:['vio la tele','se enganchó a una serie'],libros:['leyó un buen rato','se perdió en un libro'],guitarra:['tocó la guitarra','ensayó unos acordes'],fogon:['cocinó algo casero','se metió en la cocina'],compu:['estuvo con el ordenador','se pasó horas delante del ordenador'],telefono:['habló por teléfono'],sofa:['se tiró en el sofá'],banco:['cacharreó en el banco de trabajo'],planta:['cuidó las plantas'],flores:['regó las flores'],huerto:['trabajó en el huerto','se manchó las manos de tierra en el huerto'],espejo:['ensayó frente al espejo'],bancoj:['tomó el aire en el jardín'],barbacoa:['hizo una barbacoa'],_weed:['quitó malas hierbas']};
const OPEN={sol:['Hizo sol.','Lució el sol todo el día.','Día de cielo limpio.'],nubes:['Día gris.','El cielo se quedó nublado todo el día.'],lluvia:['Llovió sin parar.','Amaneció lloviendo.','La lluvia golpeó los cristales todo el día.'],tormenta:['Hubo tormenta: truenos y apagones.','Cayó una buena tormenta.'],nieve:['¡Nevó!','La nieve lo cubrió todo.'],calor:['Hizo un calor pegajoso.','El calor no dio tregua.']};
function writeDiary(){
  const td=S.today;if(!td){newToday();return;}
  const d=dateOf(S.day),c=CH(),n=c.name,W=S.weather||{k:'sol'},o=oa();const parts=[];
  parts.push(pickR(OPEN[W.k]||OPEN.sol));
  const dt=dayType(S.day);if(festivo(S.day))parts.push(`Era ${festivo(S.day)}.`);else if(dt==='vac')parts.push('Día de vacaciones.');else if(dt==='weekend'&&Math.random()<.5)parts.push(pickR(['Sin trabajo, por fin.','Día libre.']));
  if(td.work){const w=td.work;let t=pickR([`${n} fue a trabajar`,`${n} pasó el día en la oficina`,`Jornada de trabajo para ${n}`]);
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
  if(S.money<reserveMoney())topics.push('le confesó que va justa de dinero');if(S.want)topics.push(`le contó que quiere ${S.want.name.toLowerCase()}`);
  if(S.jobless)topics.push('le dio ánimos con la búsqueda de trabajo');
  const t=pickR(topics);tally('calls',`${p.n}`);
  if(Math.random()<0.5)tell(`${CH().name} llamó a ${p.n}, ${p.r}: ${t}.`,'☎️');
  if(p.k==='madre'&&S.money<reserveMoney()*0.6&&Math.random()<0.35&&!(S.momHelp>S.day-30)){const g=Math.round((40+Math.random()*80)*(Dm().soul?0.6:1));S.money+=g;S.momHelp=S.day;bumpMoney();tell(`${p.n} no pudo evitarlo y le hizo una transferencia de ${fmt(g)}. «Para lo que necesites».`,'💌');toast(`💌 ${p.n} le manda ${fmt(g)}`,true);}
}
function peopleDaily(){
  for(const p of S.people||[]){p.rel=Math.max(5,p.rel-(p.k==='vecina'?0.3:0.8));}
  const m=P_('madre');if(m&&m.rel<35&&Math.random()<0.2)tell(`${m.n} le ha dejado un mensaje: «¿Estás bien? Hace mucho que no sé de ti».`,'📱');
  const f=P_('amiga');if(f&&f.rel<30&&Math.random()<0.15)tell(`Hace semanas que no ve a ${f.n}. Se están distanciando.`,'💭');
  const cp=P_('compi');if(cp&&S.today&&S.today.work)cp.rel=Math.min(100,cp.rel+1.5);
}
// salir con amigos los días libres
function maybeFriendOuting(){
  const h=S.t/60,dt=dayType(S.day),nd=S.needs;if(dt==='work'||h<17||h>20||S.sim.work>0||S.outDay===S.day)return false;
  if(nd.social>65||nd.energia<35||nd.hambre<25||spare()<mealOutCost()*1.6)return false;
  if((S.weather||{}).k==='tormenta'||Math.random()>0.35){S.outDay=S.day;return false;}
  S.outDay=S.day;goOut('amigos');return true;
}
function friendBack(){const f=P_('amiga')||{n:'unos amigos'};const c=Math.round(mealOutCost()*1.6);S.money-=c;S.needs.social=100;S.needs.diversion=Math.min(100,S.needs.diversion+40);S.needs.hambre=Math.max(S.needs.hambre,85);if(f.rel!=null)f.rel=Math.min(100,f.rel+18);
  const plan=pickR(['a tomar algo','a una terraza','al cine','a cenar a un sitio nuevo','a dar un paseo por el parque','a un concierto pequeñito']);
  const txt=`Quedó con ${f.n} y se fueron ${plan}. ${pickR(['Volvió con las pilas cargadas.','Hacía falta.','Se rieron como antes.','Hablaron hasta tarde.'])}`;
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
// ---------- pensamientos en voz alta ----------
const thought={txt:null,until:0,next:performance.now()+9000};
function thoughtCandidates(){
  const nd=S.needs,c=[],o=oa(),h=S.t/60,W=(S.weather||{}).k;
  const add=(t,w=1)=>c.push([t,w]);
  if(nd.hambre<30)add(pickR(['Me comería un caballo…','Tengo un hambre…']),4);
  if(nd.energia<25)add(`Estoy muert${o} de sueño…`,4);
  if(nd.higiene<30)add('Necesito una ducha ya.',3);
  if(nd.social<30)add(pickR(['Me siento un poco sol'+o+'…','¿Y si llamo a alguien?']),3);
  if(nd.diversion<30)add('Qué aburrimiento…',3);
  if(S.want)add(pickR([`Ojalá tuviera ${S.want.name.toLowerCase()}…`,`${capF(S.want.name.toLowerCase())}… algún día.`]),1.5);
  if(S.job&&S.job.who==='ana')add('Esto va a quedar genial.',1);
  if(S.money<reserveMoney())add(pickR(['¿Llegaré a fin de mes?','No me salen las cuentas…']),2.5);
  else if(spare()>1500)add('Por fin respiro un poco.',0.8);
  if(dayType(S.day+1)==='work'&&h>=20&&!S.jobless)add('Mañana toca madrugar…',1.2);
  if(dayType(S.day)==='weekend'&&h<14)add('¡Por fin fin de semana!',1.2);
  if(Dm().soul&&!S.jobless&&TOX()>0.65)add(pickR(['No soporto más a mi jefe.','Tengo que salir de esa oficina.']),1.5);
  if(S.jobless)add(pickR(['Seguro que mañana me llaman.','¿Y si no encuentro nada?']),2);
  if(W==='lluvia')add(T('naturaleza')||T('artista')?'Me encanta oír la lluvia.':'Vaya día de perros.',1);
  if(W==='calor')add('Qué calor hace…',1.5);if(W==='nieve')add('¡Está nevando!',2);if(W==='tormenta')add('Espero que no se vaya la luz…',1);
  const hs=findObjs((d,t)=>t==='huerto').map(i=>S.obj[i].crop).filter(Boolean);
  if(hs.some(cr=>cr.g>=1&&!cr.dead))add(`¡${capF(CROPS[hs.find(cr=>cr.g>=1).k].n.toLowerCase())} a punto de recoger!`,2);
  if(hs.some(cr=>cr.w<25&&!cr.dead))add('Tengo que regar el huerto.',1.5);
  if((S.weeds||[]).length>=6)add('Cuántas malas hierbas…',1);
  const m=P_('madre');if(m&&m.rel<45)add('Debería llamar a mamá.',1.5);
  const f=P_('amiga');if(f&&f.rel<45)add(`Echo de menos a ${f.n}.`,1.2);
  if(T('artista'))add('Tengo una melodía en la cabeza.',.6);if(T('naturaleza'))add('Necesito más verde por aquí.',.6);
  if(T('ahorradora'))add('Cada moneda cuenta.',.5);if(T('derrochadora'))add('Me merezco un capricho.',.6);
  if(T('perezosa'))add('Cinco minutitos más…',.6);if(T('trabajadora'))add('Quiero ese ascenso.',.6);
  const md=mood();if(md>72)add(pickR(['Qué a gusto se está en casa.','Hoy todo me sale bien.']),1);if(md<32)add(pickR(['Necesito un cambio…','Qué semana…']),1.5);
  if(S.owned)add('Mi casa. Mía.',.3);
  return c;
}
function thinkTick(){
  const now=performance.now(),s=S.sim;if(now<thought.next||s.work>0||menu.classList.contains('open'))return;
  thought.next=now+16000+Math.random()*20000;if(s.use&&s.use.type==='cama'&&!s.use.nap)return;
  const c=thoughtCandidates();if(!c.length)return;let tot=c.reduce((a,b)=>a+b[1],0),r=Math.random()*tot,t=c[0][0];for(const [x,w] of c){r-=w;if(r<=0){t=x;break;}}
  thought.txt=L(t);thought.until=now+4800;S.lastLine={ic:'💭',txt:thought.txt};
}
function drawThought(bx,by){
  const k=Math.min(1,(thought.until-performance.now())/400,(performance.now()-(thought.until-4800))/250);if(k<=0)return;
  ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,k));ctx.font='800 10.5px Nunito, sans-serif';
  const words=thought.txt.split(' '),lines=[];let cur='';for(const w of words){const t=cur?cur+' '+w:w;if(ctx.measureText(t).width>120&&cur){lines.push(cur);cur=w;}else cur=t;}lines.push(cur);
  const wd=Math.max(...lines.map(l=>ctx.measureText(l).width))+16,ht=lines.length*13+10,x0=bx-wd/2+18,y0=by-ht-26;
  ctx.fillStyle='rgba(30,20,50,.12)';roundRect(x0+1,y0+2,wd,ht,11);ctx.fill();
  ctx.fillStyle='#fffdf8';roundRect(x0,y0,wd,ht,11);ctx.fill();circ(bx+6,by-20,3.6,'#fffdf8');circ(bx+2,by-13,2.2,'#fffdf8');
  ctx.fillStyle='#3b3247';ctx.textAlign='center';ctx.textBaseline='middle';lines.forEach((l,i)=>ctx.fillText(l,x0+wd/2,y0+11+i*13));
  ctx.restore();
}
