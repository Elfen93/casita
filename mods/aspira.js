// =================== ASPIRACIONES: objetivos que salen del personaje ===================
const ASP_N=5;
const aspS=()=>{if(!S.asp)S.asp={active:[],done:{},base:{},next:0};return S.asp;};
const stat=k=>(S.stats&&S.stats[k])||0;
const chapDone=pre=>Object.keys(storyState().chap).some(k=>k===pre||k.startsWith(pre));
const relCount=n=>(S.people||[]).filter(p=>p.stage!=='ex'&&/^p/.test(p.k)&&p.rel>=n).length;
const ASP=[
  // ---- trabajo ----
  {id:'ascenso',c:'trabajo',e:'📈',t:()=>`Conseguir un ascenso en ${S.office?office().n:'el trabajo'}`,w:()=>S.career+1<CAREER.length&&!S.jobless&&!TR().gig?(T('trabajadora')?3:isLeft()&&comp()>=3?.3:1):0,start:()=>S.career,ok:b=>S.career>b,r:1.2},
  {id:'cima',c:'trabajo',e:'🏔️',t:()=>`Llegar a ${L(CAREER[CAREER.length-1].t).toLowerCase()}`,w:()=>T('trabajadora')||isI('liberal','libertaria')?1.5:.2,ok:()=>S.career>=CAREER.length-1,r:4},
  {id:'huir',c:'trabajo',e:'🚪',t:()=>`Salir de ${S.office?office().n:'este trabajo'}: aquí no se puede seguir`,w:()=>!S.jobless&&!TR().self&&TOX()>.6?3:0,start:()=>S.office?office().n:'',ok:b=>S.office&&office().n!==b&&!S.jobless,r:1.5},
  {id:'aumento',c:'trabajo',e:'💶',t:()=>'Arrancar una subida de sueldo',w:()=>!S.jobless&&!TR().self?(T('dondegentes')||T('impulsiva')?2:1):0,start:()=>S.payMul||1,ok:b=>(S.payMul||1)>b*1.02,r:1},
  {id:'trabajo',c:'trabajo',e:'📝',t:()=>'Encontrar trabajo',w:()=>S.jobless?6:0,ok:()=>!S.jobless,r:1},
  {id:'opos',c:'trabajo',e:'📚',t:()=>'Aprobar unas oposiciones',w:()=>S.opos&&S.opos.on?4:isI('conservadora','socialdemocrata')&&T('constante')?.8:0,ok:()=>!!S.oposPassed,r:3},
  {id:'negocio',c:'trabajo',e:'🏪',t:()=>'Montar su propio negocio',w:()=>S.track!=='negocio'&&(isI('libertaria','liberal')||T('milideas')||T('impulsiva'))?1.4:0,ok:()=>S.track==='negocio',r:2},
  {id:'coop',c:'trabajo',e:'🤝',t:()=>'Trabajar sin jefes, en una cooperativa',w:()=>S.track!=='coop'&&isI('anarquista','ecologista')?1.6:0,ok:()=>S.track==='coop',r:2},
  {id:'puntual',c:'trabajo',e:'⏰',t:()=>'Un mes sin llegar tarde ni faltar',w:()=>!S.jobless&&(T('despistada')||T('nocturna'))?1.5:0,start:()=>[S.absences||0,S.day],ok:b=>(S.absences||0)===b[0]&&S.day-b[1]>=30,r:1},
  // ---- dinero ----
  {id:'colchon',c:'dinero',e:'🐷',t:()=>`Tener un colchón de ${fmt(weeklyRent()*8)}`,w:()=>S.money<weeklyRent()*8?(T('ahorradora')||T('pesimista')?3:1):0,ok:()=>S.money>=weeklyRent()*8,r:1.5},
  {id:'rojos',c:'dinero',e:'🆘',t:()=>'Salir de los números rojos',w:()=>S.money<0?6:0,ok:()=>S.money>=weeklyRent(),r:1},
  {id:'casa',c:'dinero',e:'🔑',t:()=>'Comprar la casa',w:()=>!S.owned?(isI('conservadora','liberal')||T('ahorradora')?2:.4):0,ok:()=>!!S.owned,r:5},
  {id:'capricho',c:'dinero',e:'🛍️',t:()=>'Darse un capricho Premium',w:()=>T('derrochadora')||T('impulsiva')?2:.3,start:()=>count(i=>S.obj[i]&&S.obj[i].q===4),ok:b=>count(i=>S.obj[i]&&S.obj[i].q===4)>b,r:.8},
  // ---- gente ----
  {id:'amigos3',c:'gente',e:'🫂',t:()=>'Hacer tres amistades de verdad en el barrio',w:()=>relCount(60)<3?(T('sociable')||T('fiestera')?3:T('solitaria')?.4:1):0,ok:()=>relCount(60)>=3,r:1.2},
  {id:'unaamiga',c:'gente',e:'☕',t:()=>'Encontrar una persona con la que hablar de todo',w:()=>T('solitaria')&&relCount(70)<1?2:0,ok:()=>relCount(70)>=1,r:1},
  {id:'pareja',c:'gente',e:'❤️',t:()=>'Encontrar pareja',w:()=>{const L_=LIFE();return !partner()&&L_.orient!=='nadie'&&L_.rel==='estable'?(T('romantica')?3:1.5):0;},ok:()=>!!partner(),r:1.5},
  {id:'juntos',c:'gente',e:'🏠',t:()=>{const p=partner();return `Irse a vivir con ${p?p.n:'su pareja'}`;},w:()=>{const p=partner();return p&&p.stage==='pareja'&&LIFE().rel==='estable'?2:0;},ok:()=>!!liveIn(),r:1.5},
  {id:'boda',c:'gente',e:'💍',t:()=>{const p=partner();return `Casarse con ${p?p.n:'su pareja'}`;},w:()=>{const p=partner();return p&&p.stage==='convive'&&LIFE().boda==='si'?2:0;},ok:()=>{const p=partner();return p&&p.stage==='casada';},r:2},
  {id:'hijo',c:'gente',e:'👶',t:()=>'Tener un hijo o una hija',w:()=>LIFE().kids==='si'&&!(S.kids||[]).length?((CH().age||27)>=30?2.5:1):0,ok:()=>(S.kids||[]).length>0||!!S.baby,r:2},
  {id:'madre',c:'gente',e:'👩‍🦳',t:()=>{const m=P_('madre');return `Arreglar las cosas con ${m?m.n:'su madre'}`;},w:()=>{const m=P_('madre');return m&&m.rel<50?2.5:0;},ok:()=>{const m=P_('madre');return m&&m.rel>=70;},r:1},
  {id:'vecina',c:'gente',e:'🏘️',t:()=>{const v=P_('vecina');return `Ganarse a ${v?v.n:'la vecina'}`;},w:()=>{const v=P_('vecina');return v&&v.rel<60?.8:0;},ok:()=>{const v=P_('vecina');return v&&v.rel>=70;},r:.7},
  {id:'soltera',c:'gente',e:'🧭',t:()=>'Dos meses de soltería feliz',w:()=>!partner()&&(T('independiente')||LIFE().rel==='soltera')?2:0,start:()=>S.day,ok:b=>!partner()&&S.day-b>=60&&mood()>55,r:1},
  {id:'fiestas',c:'gente',e:'🎉',t:()=>'Salir diez veces con amigos',w:()=>T('fiestera')||T('sociable')?2:.3,start:()=>stat('outAmigos'),ok:b=>stat('outAmigos')-b>=10,r:1},
  // ---- política ----
  {id:'afiliarse',c:'politica',e:'🪪',t:()=>'Afiliarse al sindicato',w:()=>!(S.union&&S.union.member)&&!TR().self&&(isLeft()||isI('socialdemocrata'))?2.5:0,ok:()=>!!(S.union&&S.union.member),r:.8},
  {id:'huelgaW',c:'politica',e:'✊',t:()=>'Ganar una huelga',w:()=>isLeft()&&comp()>=2&&!TR().self?2.5:0,ok:()=>chapDone('huelgaW'),r:3},
  {id:'organizar',c:'politica',e:'🗣️',t:()=>`Organizar a media plantilla de ${S.office?office().n:'su trabajo'}`,w:()=>isLeft()&&!S.jobless&&!TR().self&&office().org<50?2:0,ok:()=>!S.jobless&&office().org>=50,r:2},
  {id:'influencia',c:'politica',e:'📣',t:()=>'Que su nombre suene en el barrio (influencia 30)',w:()=>S.ideo!=='apolitica'&&(S.pol.inf||0)<30&&comp()>=2?(T('lider')?2.5:1):0,ok:()=>(S.pol.inf||0)>=30,r:2},
  {id:'concejala',c:'politica',e:'🏛️',t:()=>'Ir en las listas municipales',w:()=>isI('socialdemocrata','conservadora','liberal','ecologista')&&!S.pol.cand?1.2:0,ok:()=>!!S.pol.cand,r:3},
  {id:'desahucio',c:'politica',e:'🚪',t:()=>'Parar un desahucio',w:()=>isI('anarquista','marxista')?1.2:0,ok:()=>chapDone('desahucio'),r:2.5},
  {id:'convencer',c:'politica',e:'💬',t:()=>{const p=partner();return `Que ${p?p.n:'su pareja'} se implique también`;},w:()=>{const p=partner();return p&&S.ideo!=='apolitica'&&p.ideo!==S.ideo&&comp()>=2?1.5:0;},ok:()=>{const p=partner();return p&&p.ideo===S.ideo;},r:1.5},
  {id:'despolitizar',c:'politica',e:'🫥',t:()=>'Desconectar: un mes sin asambleas ni telediario',w:()=>T('cinica')&&S.ideo!=='apolitica'?1.5:0,start:()=>S.day,ok:b=>S.day-b>=30,r:.7},
  // ---- cabeza y aficiones ----
  {id:'musica',c:'aficion',e:'🎸',t:()=>'Tocar la guitarra de verdad (música 5)',w:()=>lvl('musica')<5?(T('artista')?3:T('milideas')?1:.2):0,ok:()=>lvl('musica')>=5,r:1.5},
  {id:'cocina',c:'aficion',e:'🍳',t:()=>'Cocinar como su abuela (cocina 5)',w:()=>lvl('cocina')<5?(T('cocinillas')?3:T('casera')?1.2:.3):0,ok:()=>lvl('cocina')>=5,r:1.2},
  {id:'logica',c:'aficion',e:'🧠',t:()=>'Estudiar algo a fondo (lógica 6)',w:()=>lvl('logica')<6?(T('curiosa')?3:T('milideas')?1.2:.3):0,ok:()=>lvl('logica')>=6,r:1.5},
  {id:'carisma',c:'aficion',e:'🗣️',t:()=>'Saber hablar en público (carisma 6)',w:()=>lvl('carisma')<6?(T('dondegentes')||T('lider')?2:.5):0,ok:()=>lvl('carisma')>=6,r:1.5},
  {id:'forma',c:'aficion',e:'🏃',t:()=>'Ponerse en forma',w:()=>(S.fit||0)<60?(T('deportista')?3:.4):0,ok:()=>(S.fit||0)>=60,r:1},
  {id:'huerto',c:'aficion',e:'🥕',t:()=>'Comer de su propio huerto',w:()=>T('naturaleza')||isI('ecologista')?2:.3,start:()=>stat('harvest'),ok:b=>stat('harvest')-b>=10,r:1.2},
  {id:'manitas',c:'aficion',e:'🔨',t:()=>'Dominar un oficio (nivel 5)',w:()=>T('manitas')?2.5:T('multitarea')?1:.3,ok:()=>['carp','elec','font','alba','jard'].some(k=>lvl(k)>=5),r:1.5},
  {id:'todoterreno',c:'aficion',e:'🔀',t:()=>'Saber un poco de todo (nivel 3 en cinco habilidades)',w:()=>T('multitarea')?3:0,ok:()=>SKILLS.filter(([k])=>lvl(k)>=3).length>=5,r:2},
  {id:'acabar',c:'aficion',e:'🏁',t:()=>'Acabar un proyecto sin cambiar de idea',w:()=>T('milideas')?3:0,start:()=>stat('built'),ok:b=>stat('built')>b,r:2},
  {id:'obra',c:'aficion',e:'🏗️',t:()=>S.want?`Hacer realidad: ${S.want.name.toLowerCase()}`:'Terminar una obra en casa',w:()=>T('constante')||T('casera')?2:.6,start:()=>stat('built'),ok:b=>stat('built')>b,r:1},
  // ---- ánimo ----
  {id:'semana',c:'animo',e:'😄',t:()=>'Una semana entera de buen humor',w:()=>T('pesimista')||T('ansiosa')||T('cinica')?2:.6,start:()=>S.day,ok:b=>(S.asp.streak||0)>=7&&S.day-b>=7,r:1.2},
  {id:'descanso',c:'animo',e:'🏖️',t:()=>'Coger unas vacaciones',w:()=>!S.jobless&&(S.vac||0)>=3?1:0,start:()=>(S.vacDays||[]).length,ok:b=>(S.vacDays||[]).length>b,r:.8}];
const ASP_CAT={trabajo:'💼',dinero:'💰',gente:'🫂',politica:'✊',aficion:'🎨',animo:'🌤️'};
function aspFill(){const A=aspS();A.active=A.active.filter(id=>ASP.some(a=>a.id===id));
  while(A.active.length<ASP_N){const used=new Set(A.active),cats=new Set(A.active.map(id=>ASP.find(a=>a.id===id).c));
    const cand=ASP.filter(a=>!used.has(a.id)&&!(A.done[a.id]&&S.day-A.done[a.id]<60)).map(a=>{let w=0;try{w=a.w();}catch(e){}if(w>0&&cats.has(a.c))w*=.45;if(w>0){try{if(!a.start&&a.ok())w=0;}catch(e){w=0;}}return [a,w];}).filter(x=>x[1]>0);
    if(!cand.length)break;let tot=cand.reduce((s,x)=>s+x[1],0),r=Math.random()*tot,pick=cand[0][0];for(const [a,w] of cand){r-=w;if(r<=0){pick=a;break;}}
    A.active.push(pick.id);A.base[pick.id]=pick.start?pick.start():null;}}
function aspCheck(){const A=aspS();if(!A.active.length)aspFill();
  for(const id of [...A.active]){const a=ASP.find(x=>x.id===id);if(!a)continue;let ok=false;try{ok=a.ok(A.base[id]);}catch(e){}
    if(ok){A.active=A.active.filter(x=>x!==id);A.done[id]=S.day;A.count=(A.count||0)+1;S.needs.diversion=Math.min(100,S.needs.diversion+25);if(typeof MT==='function')MT().an=Math.min(100,MT().an+8);unseen++;if(!S.sim.work)confetti(S.sim.x,S.sim.y,50);
      tell(`${a.t()}. Lo ha conseguido.`,a.e,'big');toast(`🎯 ${a.t()}`,true);sfx('level');aspFill();}}
  // abandonar los que ya no tienen sentido
  for(const id of [...A.active]){const a=ASP.find(x=>x.id===id);let w=1;try{w=a.w();}catch(e){}if(w===0&&!a.start){A.active=A.active.filter(x=>x!==id);aspFill();}}}
function aspDaily(){const A=aspS();A.streak=mood()>62?(A.streak||0)+1:0;if(T('milideas')&&A.active.length&&Math.random()<.05){const id=A.active[Math.random()*A.active.length|0];A.active=A.active.filter(x=>x!==id);aspFill();}}
// contadores que usan las aspiraciones
{const _go=goOut;goOut=function(k){if(k==='amigos'){S.stats=S.stats||{};S.stats.outAmigos=(S.stats.outAmigos||0)+1;}return _go.apply(this,arguments);};}
function aspBlock(){const A=aspS();aspFill();let h=`<h3>🎯 Lo que ${CH().name} quiere ahora</h3><div class="sub" style="font-size:11.5px;margin-bottom:4px">Salen de su carácter, sus ideas y su vida. Cuando cumple una, aparece otra.</div>`;
  for(const id of A.active){const a=ASP.find(x=>x.id===id);if(!a)continue;h+=`<div class="goal"><span>${a.e}</span><span>${a.t()}</span><span class="r">😊 ánimo</span></div>`;}
  const n=A.count||0;if(n)h+=`<div class="sub" style="font-size:11.5px">✅ ${n} cumplida${n>1?'s':''} hasta ahora.</div>`;
  const house=GOALS.filter(g=>!S.goals[g.id]).slice(0,3);
  if(house.length)h+=`<h3>🏠 Ideas para la casa</h3>`+house.map(g=>`<div class="goal"><span>⬜</span><span>${g.t}</span><span class="r">😊</span></div>`).join('')+`<div class="sub" style="font-size:11.5px">${GOALS.filter(g=>S.goals[g.id]).length} de ${GOALS.length} hechas.</div>`;
  return h;}
